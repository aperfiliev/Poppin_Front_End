// [Google Analytics](https://developers.google.com/analytics/devguides/collection/gajs/)
// This variable has to be already defined when our module loads
var _gaq = _gaq || [];

// GoogleAnalytics.js
// ------------------
// Loads google analytics script and extends application with methods:
// * trackPageview
// * trackEvent
// * trackTransaction
// Also wraps layout's showInModal
define('GoogleAnalytics', function ()
{
	'use strict';
	
	var GoogleAnalytics = {

		trackPageview: function (url)
		{
			// [_trackPageview()](https://developers.google.com/analytics/devguides/collection/gajs/methods/gaJSApiBasicConfiguration#_gat.GA_Tracker_._trackPageview)
			_gaq.push(['_trackPageview', '/' + url]);
			return this;
		}

	,	trackEvent: function (event)
		{
			// [_trackEvent()](https://developers.google.com/analytics/devguides/collection/gajs/eventTrackerGuide)
			_gaq.push(['_trackEvent'
			,	event.category
			,	event.action
			,	event.label
			,	event.value
			,	event.noninteraction
			]);

			return this;
		}

	,	addItem: function (item)
		{
			// [_addItem()](https://developers.google.com/analytics/devguides/collection/gajs/methods/gaJSApiEcommerce#_gat.GA_Tracker_._addItem)
			_gaq.push(['_addItem'
			,	item.transaction
			,	item.sku
			,	item.name
			,	item.category
			,	item.price
			,	item.quantity
			]);

			return this;
		}

	,	addTrans: function (transaction)
		{
			// [_addTrans()](https://developers.google.com/analytics/devguides/collection/gajs/methods/gaJSApiEcommerce#_gat.GA_Tracker_._addTrans)
			_gaq.push(['_addTrans'
			,	transaction.id
			,	transaction.storeName || SC.ENVIRONMENT.siteSettings.displayname
			,	transaction.subtotal
			,	transaction.tax
			,	transaction.shipping
			,	transaction.city
			,	transaction.state
			,	transaction.country
			]);

			return this;
		}

	,	trackTrans: function ()
		{
			// [_trackTrans()](https://developers.google.com/analytics/devguides/collection/gajs/methods/gaJSApiEcommerce#_gat.GA_Tracker_._trackTrans)
			_gaq.push(['_trackTrans']);
			return this;
		}

		// Based on the created SalesOrder we trigger each of the analytics
		// ecommerce methods passing the required information
		// [Ecommerce Tracking](https://developers.google.com/analytics/devguides/collection/gajs/gaTrackingEcommerce?hl=en)
	,	trackTransaction: function (Order)
		{
			if (Order && Order.get('confirmation'))
			{
					var shipping_address = Order.get('addresses').get(Order.get('shipaddress'))
				,	transaction_id = Order.get('confirmation').internalid
				,	order_summary = Order.get('summary')
				,	item = null;

				GoogleAnalytics.addTrans({
					id: transaction_id
				,	subtotal: order_summary.subtotal
				,	tax: order_summary.taxtotal
				,	shipping: order_summary.shippingcost + order_summary.handlingcost
				,	city: shipping_address.get('city')
				,	state: shipping_address.get('state')
				,	country: shipping_address.get('country')
				});

				Order.get('lines').each(function (line)
				{
					item = line.get('item');

					GoogleAnalytics.addItem({
						transaction: transaction_id
					,	sku: item.get('_sku')
					,	name: item.get('_name')
					,	category: item.get('_category')
					,	price: line.get('rate')
					,	quantity: line.get('quantity')
					});
				});

				return GoogleAnalytics.trackTrans();
			}
			
		}

	,	extendShowInModal: function (application)
		{
			var Layout = application.getLayout();

			// we extend showInModal to track the event every time a modal is opened
			Layout.showInModal = _.wrap(Layout.showInModal, function (fn, view)
			{
				application.trackEvent({
					category: view.analyticsCategory || 'Modal'
				,	action: view.analyticsAction || view.title || 'Open'
				,	label: view.analyticsLabel || '/' + Backbone.history.fragment
				,	value: view.analyticsValue
				,	noninteraction: view.noninteraction
				});
				
				return fn.apply(this, _.toArray(arguments).slice(1));
			});

			return this;
		}

	,	setAccount: function (config)
		{
			_gaq.push(
				['_setAccount', config.propertyID]
			,	['_setDomainName', config.domainName]
			,	['_setAllowLinker', true]
			);

			return this;
		}

	,	loadScript: function ()
		{
			return (SC.ENVIRONMENT.jsEnvironment === 'browser') && jQuery.getScript(('https:' === document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js');
		}

	,	mountToApp: function (application)
		{
			var tracking = application.getConfig('tracking');

			// if track page view needs to be tracked
			if (tracking.trackPageview)
			{
				GoogleAnalytics
					// we get the account and domain name from the configuration file
					.setAccount(tracking.google)
					// Wraps layout's showInModal to track the modal event before showing it
					.extendShowInModal(application)
					// the analytics script is only loaded if we are on a browser
					.loadScript();

				_.extend(application, {
					trackPageview: GoogleAnalytics.trackPageview
				,	trackEvent: GoogleAnalytics.trackEvent
				,	trackTransaction: GoogleAnalytics.trackTransaction
				});

				// each time a page is rendered, we track its fragment
				application.getLayout().on('afterAppendView', function ()
				{
					application.trackPageview(Backbone.history.fragment);
				});
			}	
		}
	};
	
	return GoogleAnalytics;
});