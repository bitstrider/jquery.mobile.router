##	JQM Router ##

> compatible with **JQM-1.4.4**

a simple hash router extension for JQM, for handling url hash paths requests like '#user?id=1234'

### Install ###

	<script src="jquery.mobile-1.4.4.js" type="text/javascript"></script>
	<script src="jquery.mobile.router.js" type="text/javascript"></script>


### Usage ###
	
		$(document).on('mobileinit', function(event){	
			//define some routes and callback handlers
			$.mobile.router.get('user', function(params) {
				alert('user id is'+params.id);
			})
			
			//have alot of routes?  consider chaining!
			$.mobile.router
			.get('warm:water', function() { alert('is a terrible drink to order.') })
			.get('hot:chocolate', function() { alert('is the best.') })

			//The router also accepts a object hash of callback handlers
			var mapping = {
				cali : function() { alert('sunny') },
				philly : function() { alert('always sunny') }
			}
			$.mobile.router.get(mapping)


			//JQM Event data
			$.mobile.router.get('eventData', function(params,event,data) {
				
				alert('params: %s, data: %s', params, data)
				event.preventDefault()
		 		window.history.back()
			})
			

		})
