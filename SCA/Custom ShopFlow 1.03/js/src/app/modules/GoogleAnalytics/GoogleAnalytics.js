(function (win, name)
{
	'use strict';
	// [Google Analytics](https://developers.google.com/analytics/devguides/collection/gajs/)
	// This variable has to be already defined when our module loads
	win[name] = win[name] || [];

	// GoogleAnalytics.js
	// ------------------
	// Loads google analytics script and extends application with methods:
	// * trackPageview
	// * trackEvent
	// * trackTransaction
	// Also wraps layout's showInModal
	define('GoogleAnalytics', function ()
	{
		var GoogleAnalytics = {

			trackPageview: function (url)
			{
				if (_.isString(url))
				{
					// [_trackPageview()](https://developers.google.com/analytics/devguides/collection/gajs/methods/gaJSApiBasicConfiguration#_gat.GA_Tracker_._trackPageview)
					win[name].push(['_trackPageview', url]);
				}

				return this;
			}

		,	trackEvent: function (event)
			{
				if (event && event.category && event.action)
				{
					// [_trackEvent()](https://developers.google.com/analytics/devguides/collection/gajs/eventTrackerGuide)
					win[name].push(['_trackEvent'
					,	event.category
					,	event.action
					,	event.label
					,	event.value
					]);
				}

				return this;
			}

		,	addItem: function (item)
			{
				if (item && item.id && item.name)
				{
					// [_addItem()](https://developers.google.com/analytics/devguides/collection/gajs/methods/gaJSApiEcommerce#_gat.GA_Tracker_._addItem)
					win[name].push(['_addItem'
					,	item.id
					,	item.sku
					,	item.name
					,	item.category
					,	item.price
					,	item.quantity
					]);
				}

				return this;
			}

		,	addTrans: function (transaction)
			{
				if (transaction && transaction.id)
				{
					// [_addTrans()](https://developers.google.com/analytics/devguides/collection/gajs/methods/gaJSApiEcommerce#_gat.GA_Tracker_._addTrans)
					win[name].push(['_addTrans'
					,	transaction.id
					,	transaction.affiliation
					,	transaction.revenue
					,	transaction.tax
					,	transaction.shipping
					,	transaction.city
					,	transaction.state
					,	transaction.country
					]);
				}

				return this;
			}

		,	trackTrans: function ()
			{
				// [_trackTrans()](https://developers.google.com/analytics/devguides/collection/gajs/methods/gaJSApiEcommerce#_gat.GA_Tracker_._trackTrans)
				win[name].push(['_trackTrans']);
				return this;
			}

			// Based on the created SalesOrder we trigger each of the analytics
			// ecommerce methods passing the required information
			// [Ecommerce Tracking](https://developers.google.com/analytics/devguides/collection/gajs/gaTrackingEcommerce?hl=en)
		,	trackTransaction: function (order)
			{
				if (order && order.get('confirmation'))
				{
					var shipping_address = order.get('addresses').get(order.get('shipaddress'))
					,	transaction_id = order.get('confirmation').confirmationnumber
					,	order_summary = order.get('summary')
					,	item = null;

					GoogleAnalytics.addTrans({
						id: transaction_id
					,	affiliation: SC.ENVIRONMENT.siteSettings.displayname
					,	revenue: order_summary.subtotal
					,	tax: order_summary.taxtotal
					,	shipping: order_summary.shippingcost + order_summary.handlingcost
					,	city: shipping_address.get('city')
					,	state: shipping_address.get('state')
					,	country: shipping_address.get('country')
					});

					order.get('lines').each(function (line)
					{
						item = line.get('item');

						GoogleAnalytics.addItem({
							id: transaction_id
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

		,	setAccount: function (config)
			{
				if (config && _.isString(config.propertyID) && _.isString(config.domainName))
				{
					// [Tracking Across a Domain and Its Subdomains](https://developers.google.com/analytics/devguides/collection/gajs/gaTrackingSite#domainSubDomains)
					win[name].push(
						['_setAccount', config.propertyID]
					,	['_setDomainName', config.domainName]
					,	['_setAllowLinker', true]
					);

					this.propertyID = config.propertyID;
					this.domainName = config.domainName;
				}

				return this;
			}

			// [Tracking Between a Domain and a Sub-Directory on Another Domain](https://developers.google.com/analytics/devguides/collection/gajs/gaTrackingSite#domainAndSubDirectory)
		,	addCrossDomainParameters: function (url)
			{
				// We only need to add the parameters if the url we are trying to go
				// is not a sub domain of the tracking domain
				if (_.isString(url) && !~url.indexOf(this.domainName))
				{
					win[name].push(function ()
					{
						var track_url = _gat._getTrackerByName()._getLinkerUrl(url);
						// This validation is due to Tracking Blockers overriding the default anlaytics methods
						if (typeof track_url === 'string')
						{
							url = track_url;
						}
					});
				}

				return url;
			}

		,	loadScript: function ()
			{
				return SC.ENVIRONMENT.jsEnvironment === 'browser' && jQuery.getScript(('https:' === document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js');
			}

		,	mountToApp: function (application)
			{
				var tracking = application.getConfig('tracking.google');

				// if track page view needs to be tracked
				if (tracking && tracking.propertyID)
				{
					GoogleAnalytics
						// we get the account and domain name from the configuration file
						.setAccount(tracking)
						// the analytics script is only loaded if we are on a browser
						.loadScript();

					application.trackers.push(GoogleAnalytics);
				}	
			}
		};
		
		return GoogleAnalytics;
	});
})(window, '_gaq');