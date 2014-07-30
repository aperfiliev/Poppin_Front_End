// Account.Register.Model.js
// -------------------------
// Sends user input data to the register service
// validating fields before they are sent
// [Backbone.validation](https://github.com/thedersen/backbone.validation)
define('Account.Register.Model', function ()
{
	'use strict';

	return Backbone.Model.extend({

		urlRoot: _.getAbsoluteUrl('services/account-register.ss')

	,	validation: {
			firstname: { required: true, msg: _('First Name is required').translate() }
		,	lastname: { required: true, msg: _('Last Name is required').translate() }
		,	email: { required: true, pattern: 'email', msg: _('Valid Email is required').translate() }
		,	company:  { required: SC.ENVIRONMENT.siteSettings.registration.companyfieldmandatory === 'T', msg: _('Company Name is required').translate() }
		,	password:  { required: true, msg: _('Please enter a valid password').translate() }
		,	password2: [ 
				{ required: true, msg: _('Confirm password is required').translate() }
			,	{ equalTo: 'password', msg: _('New Password and Confirm Password do not match').translate() }
			]
		}
	});
});