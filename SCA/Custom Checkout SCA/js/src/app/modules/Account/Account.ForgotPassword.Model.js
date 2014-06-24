// Account.ForgotPassword.Model.js
// -------------------------------
// Sends user input data to the forgot password service
// validating email before is sent
// [Backbone.validation](https://github.com/thedersen/backbone.validation)
define('Account.ForgotPassword.Model', function ()
{
	'use strict';

	return Backbone.Model.extend({

		urlRoot: _.getAbsoluteUrl('services/account-forgot-password.ss')

	,	validation: {
			email: { required: true, pattern: 'email', msg: _('Valid Email is required').translate() }
		}
	});
});