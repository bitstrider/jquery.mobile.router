/*
	@author: Jason Yung
	@license: MIT
*/

$(document).on('mobileinit', function(event) {
	function Router() {
		this.prefix = 'router'
		this.map = {}
		$(window).on( "navigate", this.preempter() );
		$(window).on( "pagecontainerchange", this.handler() );
	}
	Router.prototype.get = function(path, callback) {
		if(typeof path === 'string')
			this.map[path] = callback
		else if(typeof path === 'object')
			$.extend( this.map, path )
		return this
	}
	Router.prototype.preempter = function() {
		return (function(router) {
			return function(event, data) {
				router.preempt(event,data)
			}
		})(this)
	}
	Router.prototype.parseRoute = function(hash,cb) {
		var arr = hash.split('?') //jqm behave as if it expects a '?' in the hash, taking the content before the '?' as the page id, and everything after it as some sorta params!
		
		var path = arr[0] ? arr[0].substring(1) : undefined,
		var params = arr[1]

		cb(path,params)
	}
	Router.prototype.preempt = function(event, data) {
		var hash = data && data.state && data.state.hash? data.state.hash : location.hash
		var arr = hash.split('?') //jqm behave as if it expects a '?' in the hash, taking the content before the '?' as the page id, and everything after it as some sorta params!
		
		parseRoute(hash, function(path,params){
			var haspage = $('#'+ path + '[data-role="page"]').length != 0 //might be better going through jqm internals
			
			if (!haspage && typeof this.map[path] === 'function') {
				console.log('[%s] %s matching route found, applying callback', this.prefix, data.state.url)
				this.map[path](params, event, data)
			}

		})
	}

	Router.prototype.handler = function() {
		return (function(router) {
			return function(event, data) {
				router.handle(event,data)
			}
		})(this)
	}
	Router.prototype.handle = function(event, data) {

		console.log('[%s] %s jqm event "pagecontainerchanged" triggered for hash request, parsing...',this.prefix, data.absUrl)

		// WARNING: the rest of this function depends on JQM 1.4.3 internal namespacing, and may not play well with other versions
		// >> data.absUrl	//apparently this is the only internal property that is accurate and consistant throughout the navigation handling process
							//*may be undefined for non-hashed requests! 		
		
		// Other candidates that were considered for differentiating the source of the state request
		// >> data.state.hash	//the source of this request is from a 'navigate' event, either triggered the browser address or from a call to $.mobile.navigate('#foo')
		// >> data.options.link //this source of this request is from a JQM link widget, which does not trigger a 'navigate' event (if the attributes data-rel and/or data-transition are defined?)
		var url = data.absUrl;

		if(typeof url !== 'undefined') {	//might be undefined if initial page request
			var crunchIndex = url.indexOf('#')
			if(crunchIndex == -1) {
				console.log('[%s] %s unexpected handling of unhashed request',this.prefix, url)
			}if(crunchIndex == url.length-1 ){ 
				//because we wont want (hash == "") say if the url was 'http://warlords.com/app#'
				console.log('[%s] %s unexpected handling of an empty hashed request',this.prefix, url)
			}else{
				var hash = url.slice(crunchIndex)

				parseRoute(hash, function(path,params){
					console.log('[%s] %s paresed results=> req: %s', this.prefix, url, JSON.stringify(req) )
					
					if (typeof this.map[path] === 'function')  {

						console.log('[%s] %s matching route found, applying callback', this.prefix, url )
						this.map[path](params, event, data)

						//ISSUE: when navigating from a widget, JQM will remove the query after the main hash (ex: #play?123 becomes #play).  Ultimately the process ends up bypassing the 'navigate' event, and eventually triggers the 'pagecontainerchange' event.  Therefore, it must be handled manually.
						//dirty and greedy repair on current pushState so that it has the complete hash (with the query etc)
						//window.history.replaceState({}, null, hash)
						
						//the non-greedy way, with a simple detection of this discrepancy, and preservation of existing properties on the current state
						var currentState = window.history.state
						if (currentState.hash != hash) { //the hash has been messed with by JQM!
							console.log('[%s] %s state inconsistancy detected, maybe from clicking a jqm link widget, repairing current history state to %s', this.prefix, url, hash )

							//GOTCHA: the last two args, does automatically get set on the stateObj!  Those args are actually used to change the title and hash on the browser
							//Almost very confusing, since JQM will stores the title and hash on the stateObj.  
							//A dev who was unfamiliar with the native JS dom history state manipulation might think it was these functions that store the title and hash args automatically, when the real culprit was JQM

							//So..we want to reuse current stateObj, but repair the value of the hash property so that its accurate despite JQM's jenkification
							currentState.hash = hash
							window.history.replaceState(currentState, currentState.title, hash) //this will update the browser address and dom state history, but i will not trigger a new jqm 'navigate' event
						}
					}
				})
			}
		}
	}

	//exposes an intialized router obj on JQM's '$.mobile' obj, allowing route configuration through '$.mobile.router.get' on some external js file.
	$.extend($.mobile, {
		router: new Router()
	})

})