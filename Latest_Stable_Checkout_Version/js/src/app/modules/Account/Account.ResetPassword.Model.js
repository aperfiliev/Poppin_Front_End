// Account.ResetPassword.Model.js
// ------------------------------
// Sends user input data to the reset password service
// validating passwords before they are sent
// [Backbone.validation](https://github.com/thedersen/backbone.validation)
define('Account.ResetPassword.Model', function ()
{
	'use strict';

	return Backbone.Model.extend({

		urlRoot: _.getAbsoluteUrl('services/account-reset-password.ss')
	,	validation: {
			confirm_password: [ 
				{ required: true, msg: _('Confirm password is required').translate() }
			,	{ equalTo: 'password', msg: _('New Password and Confirm Password do not match').translate() }]
		
		,	password: { required: true, msg: _('New  password is required').translate() }
		}
	});
});