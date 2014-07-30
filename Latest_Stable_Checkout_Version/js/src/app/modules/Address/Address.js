// Address.js
// -----------------
// Defines the Address  module (Model, Collection, Views, Router)
define('Address', ['Address.Views','Address.Model','Address.Router','Address.Collection'], function (Views, Model, Router, Collection)
{
	'use strict';
	
	return	{
		Views: Views
	,	Model: Model
	,	Router: Router
	,	Collection: Collection
	,	mountToApp: function (application)
		{
			return new Router(application);
		}
	};
});
