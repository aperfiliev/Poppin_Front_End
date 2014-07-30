// OrderWizzard.js
// ---------------
// 
define('OrderWizard', ['OrderWizard.Router', 'OrderWizard.View', 'LiveOrder.Model'], function (Router, View, Model)
{
	'use strict';

	return {
		Router: Router
	,	View: View
	,	Model: Model
	,	mountToApp: function(application)
		{
			var router = new Router(application, {
				model: application.getCart()
			,	profile: application.getUser()
			,	steps: application.getConfig('checkoutSteps')
			});

			return router;
		}
	};
});
