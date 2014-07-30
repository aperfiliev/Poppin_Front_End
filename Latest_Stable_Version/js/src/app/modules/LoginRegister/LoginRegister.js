// LoginRegister.js
// ----------------
// Handles views and routers of Login/Register Page
// Includes Register Guest, Forgot Passowrd and Reset password
define('LoginRegister'
,	['LoginRegister.Router', 'LoginRegister.Views']
,	function (Router, Views)
{
	'use strict';

	return {
		Router: Router
	,	Views: Views
	,	mountToApp: function (application, options)
		{
			if (options && options.startRouter)
			{
				return new Router(application);
			}
		}
	};
});