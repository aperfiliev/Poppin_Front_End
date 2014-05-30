// ApplicationSkeleton.Tracking.js
// -----------------------------------------
(function ()
{
	'use strict';

	var application_prototype = SC.ApplicationSkeleton.prototype
	,	layout_prototype = application_prototype.Layout.prototype;

	_.extend(application_prototype, {

		trackers: []

		// Tracking
	,	track: function (method)
		{
			var self = this
			,	parameters = Array.prototype.slice.call(arguments, 1);

			_.each(this.trackers, function (tracker)
			{
				tracker[method] && tracker[method].apply(self, parameters);
			});

			return this;
		}

	,	trackPageview: function (url)
		{
			return this.track('trackPageview', url);
		}

	,	trackEvent: function (event)
		{
			var GoogleUniversalAnalytics = null
			,	has_universal_analytics = false;

			this.track('trackEvent', event);

			if (event.callback)
			{
				GoogleUniversalAnalytics = require('GoogleUniversalAnalytics');
				
				has_universal_analytics = _.find(this.trackers, function (tracker)
				{
					return tracker === GoogleUniversalAnalytics;
				});
				
				!has_universal_analytics && event.callback();
			}

			return this;
		}

	,	trackTransaction: function (transaction)
		{
			return this.track('trackTransaction', transaction);
		}

	,	addCrossDomainParameters: function (url)
		{
			_.each(this.trackers, function (tracker)
			{
				if (tracker.addCrossDomainParameters)
				{
					url = tracker.addCrossDomainParameters(url);
				}
			});

			return url;
		}
	});

	_.extend(layout_prototype, {

		showContent: _.wrap(layout_prototype.showContent, function (fn, view)
		{
			var application = view.application || view.options.application
				// Prefix is added so the only application that tracks the root ('/') is Shopping
				// any other application that has '/' as the home, like MyAccount
				// will track '/APPLICATION-NAME'
			,	prefix = application.name !== 'Shopping' ? '/' + application.name.toLowerCase() : '';

			application.trackPageview(prefix + '/' + Backbone.history.fragment);

			return fn.apply(this, _.toArray(arguments).slice(1));
		})
	/*
	,	showInModal: _.wrap(layout_prototype.showInModal, function (fn, view)
		{
			view.options.application.trackEvent({
				category: view.analyticsCategory || 'Modal'
			,	action: view.analyticsAction || view.title || 'Open'
			,	label: view.analyticsLabel || '/' + Backbone.history.fragment
			,	value: view.analyticsValue
			});

			return fn.apply(this, _.toArray(arguments).slice(1));
		})
	*/
	});
})();