// Account.Login.Model.js
// ----------------------
// Sends user input data to the login service
// validating email and password before they are sent
// [Backbone.validation](https://github.com/thedersen/backbone.validation)
define('Account.Login.Model', function ()
{
	'use strict';

	return Backbone.Model.extend({

		urlRoot: function ()
		{
			return _.getAbsoluteUrl('services/account-login.ss') + '?n=' + SC.ENVIRONMENT.siteSettings.siteid;
		}

	,	validation: {
			email: { required: true, pattern: 'email', msg: _('Valid Email is required').translate() }
		,	password:  { required: true, msg: _('Please enter a valid password').translate() }
		}
	});
});