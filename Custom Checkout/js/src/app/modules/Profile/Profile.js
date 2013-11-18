// Profile.js
// -----------------
// Defines the Profile module (Collection, Views, Router)
// As the profile is instanciated in the application (without definining a model) 
// the validation is configured here in the mountToApp
define('Profile', ['User.Model'], function (UserModel) {
	
	'use strict';
	
	return	{
		mountToApp: function (application)
		{
			application.UserModel = UserModel.extend({
				urlRoot: 'services/profile.ss'
			});
			
			if (application.getConfig('siteSettings.registration.companyfieldmandatory') !== 'T')
			{
				delete application.UserModel.prototype.validation.companyname;
			}
		}
	};
});
