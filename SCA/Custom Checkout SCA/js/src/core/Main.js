
// Main.js
// -------
// Defines
//  Namespace
//  a model for SiteSettings (used on the Applications)
//  methods to:
//   create and get applications
//   create singletons
//   get the SiteSettings
// Relinquish jQuery's control of the $ variable.
(function ()
{
	'use strict';
	
	// Global Name Space SC, stands for SuiteCommerce.
	var SC = window.SC = _.extend(window.SC || {}, Backbone.Events);
	
	// Make jQuery not use the $ alias
	jQuery.noConflict();
	
	// Application Creation:
	// Applications will provide by default: Layout (So your views can talk to)
	// and a Router (so you can extend them with some nice defaults)
	// If you like to create extensions to the Skeleton you should extend SC.ApplicationSkeleton
	SC._applications = {};
	SC.Application = function (application_name)
	{
		SC._applications[application_name] = SC._applications[application_name] || new SC.ApplicationSkeleton(application_name);
		return SC._applications[application_name];
	};
	
	// SC.Singleton:
	// Defines a simple getInstance method for:
	// models, collections, views or any other object to use to be used as singletons
	// How to use:
	// Backbone.[Collection, Model, View].extend({Your code}, SC.Singleton);
	// or _.extend({Object literal}, SC.Singleton);
	SC.Singleton = {
		getInstance: function ()
		{
			var This = this;
			this.instance = this.instance || new This();
			return this.instance;
		}
	};

	// Defines the template function as a noop, so it needs to be implemented by an extension
	SC.template = jQuery.noop;
	
})();
