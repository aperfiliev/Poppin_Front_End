// BackToTop.js
// ------------
// Adds a back to top functionality to any element that has data-action="back-to-top"
define('BackToTop', function () 
{
	'use strict';

	return {
		mountToApp: function (Application){
			
			var Layout = Application.getLayout();
			
			// adding BackToTop function in Layout 
			_.extend(Layout, {
				backToTop : function(){
					jQuery('html, body').animate({scrollTop: '0px'}, 300);
				}
			});
			
			// adding events for elements of DOM with data-action="back-to-top" as parameter.
			_.extend(Layout.events, {
				'click [data-action="back-to-top"]': 'backToTop'
			});
		}
	};
});