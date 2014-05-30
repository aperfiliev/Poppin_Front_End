/*jshint laxcomma:true*/
define(['GoogleUniversalAnalytics'], function (GoogleUniversalAnalytics)
{
	'use strict';

	return describe('GoogleUniversalAnalytics Module', function ()
	{
		it('defines the global variable `ga`', function ()
		{
			expect(ga).toBeDefined();
		});

		describe('setAccount', function ()
		{
			var valid_settings = {
					propertyID: 'UA-34213649-2'
				,	domainName: 'demo.uylabs.com'
				};

			beforeEach(function ()
			{
				spyOn(window, 'ga');
			});

			it('sets the analytics account', function ()
			{
				GoogleUniversalAnalytics.setAccount(valid_settings);

				expect(ga).toHaveBeenCalledWith('create', 'UA-34213649-2', {
					'cookieDomain': 'demo.uylabs.com'
				,	'allowLinker': true
				});
			});

			it('and returns the GoogleUniversalAnalytics module', function ()
			{
				expect(GoogleUniversalAnalytics.setAccount(valid_settings)).toEqual(GoogleUniversalAnalytics);
				expect(ga).toHaveBeenCalled();
			});

			it('even if the account is not set', function ()
			{
				expect(GoogleUniversalAnalytics.setAccount()).toEqual(GoogleUniversalAnalytics);
				expect(ga).not.toHaveBeenCalled();
			});

			describe('the account is not set if:', function ()
			{
				it('there\'s no configuration', function ()
				{
					GoogleUniversalAnalytics.setAccount();
					expect(ga).not.toHaveBeenCalled();
				});

				it('either propertyID or domainName are not set', function ()
				{
					GoogleUniversalAnalytics.setAccount({
						propertyID: valid_settings.propertyID
					});

					expect(ga).not.toHaveBeenCalled();

					GoogleUniversalAnalytics.setAccount({
						domainName: valid_settings.domainName
					});
					
					expect(ga).not.toHaveBeenCalled();

					GoogleUniversalAnalytics.setAccount({
						something: valid_settings.propertyID
					,	somethingElse: valid_settings.domainName
					});
					
					expect(ga).not.toHaveBeenCalled();
				});

				it('or they are not strings', function ()
				{
					GoogleUniversalAnalytics.setAccount({
						propertyID: function ()
						{
							return 'what?';
						}
					,	domainName: ['o', 'p', 'a']
					});
					
					expect(ga).not.toHaveBeenCalled();

					GoogleUniversalAnalytics.setAccount({
						propertyID: {}
					,	domainName: undefined
					});
					
					expect(ga).not.toHaveBeenCalled();
				});
			});
		});

		describe('loadScript', function ()
		{
			beforeEach(function ()
			{
				SC.ENVIRONMENT = {
					jsEnvironment: 'browser'
				};

				spyOn(jQuery, 'getScript');
			});

			it('loads the library', function ()
			{
				GoogleUniversalAnalytics.loadScript();
				expect(jQuery.getScript).toHaveBeenCalledWith('//www.google-analytics.com/analytics.js');
			});

			it('including ecommerce plugin', function ()
			{
				spyOn(window, 'ga');

				GoogleUniversalAnalytics.loadScript();
				expect(ga).toHaveBeenCalledWith('require', 'ecommerce', 'ecommerce.js');
			});

			it('unless the environment is not `browser`', function ()
			{
				SC.ENVIRONMENT.jsEnvironment = 'server';
				expect(GoogleUniversalAnalytics.loadScript()).toBe(false);
				expect(jQuery.getScript).not.toHaveBeenCalled();

				SC.ENVIRONMENT.jsEnvironment = 'bowser';
				expect(GoogleUniversalAnalytics.loadScript()).toBe(false);
				expect(jQuery.getScript).not.toHaveBeenCalled();
			});
		});

		describe('mountToApp', function ()
		{
			var application = null;

			beforeEach(function ()
			{
				application = SC.Application('Test');

				_.extend(application,
				{
					Configuration: {
						tracking: {
							googleUniversalAnalytics: {
								propertyID: 'UA-34213649-2'
							,	domainName: 'demo.uylabs.com'
							}
						}
					}
				,	trackers: []
				});
			});

			it('sets the account', function ()
			{
				spyOn(GoogleUniversalAnalytics, 'setAccount').andCallThrough();

				GoogleUniversalAnalytics.mountToApp(application);

				expect(GoogleUniversalAnalytics.setAccount).toHaveBeenCalledWith({
					propertyID: 'UA-34213649-2'
				,	domainName: 'demo.uylabs.com'
				});
			});

			it('loads the scripts', function ()
			{
				spyOn(GoogleUniversalAnalytics, 'loadScript');

				GoogleUniversalAnalytics.mountToApp(application);

				expect(GoogleUniversalAnalytics.loadScript).toHaveBeenCalled();
			});

			it('and pushes itself to the list of trackers', function ()
			{
				expect(application.trackers).not.toContain(GoogleUniversalAnalytics);

				GoogleUniversalAnalytics.mountToApp(application);

				expect(application.trackers).toContain(GoogleUniversalAnalytics);
			});

			it('if its configured in the application', function ()
			{
				spyOn(GoogleUniversalAnalytics, 'setAccount');
				spyOn(GoogleUniversalAnalytics, 'loadScript');

				delete application.Configuration.tracking.googleUniversalAnalytics;

				GoogleUniversalAnalytics.mountToApp(application);

				expect(GoogleUniversalAnalytics.setAccount).not.toHaveBeenCalled();
				expect(GoogleUniversalAnalytics.loadScript).not.toHaveBeenCalled();
				expect(application.trackers).not.toContain(GoogleUniversalAnalytics);
			});
		});

		describe('tracking methods', function ()
		{
			beforeEach(function ()
			{
				spyOn(window, 'ga');
			});

			it('trackPageview', function ()
			{
				expect(GoogleUniversalAnalytics.trackPageview('/')).toEqual(GoogleUniversalAnalytics);
				expect(ga).toHaveBeenCalledWith('send', 'pageview', '/');

				GoogleUniversalAnalytics.trackPageview();
				GoogleUniversalAnalytics.trackPageview([]);

				expect(ga.calls.length).toEqual(1);
			});

			it('trackEvent', function ()
			{
				var valid_event = {
						category: 'button'
					,	action: 'click'
					,	label: 'nav buttons'
					,	value: 1
					};

				expect(GoogleUniversalAnalytics.trackEvent(valid_event)).toEqual(GoogleUniversalAnalytics);

				expect(ga).toHaveBeenCalledWith('send', 'event', 'button', 'click', 'nav buttons', 1, {
					'hitCallback': undefined
				});

				GoogleUniversalAnalytics.trackEvent();
				GoogleUniversalAnalytics.trackEvent({});

				expect(ga.calls.length).toEqual(1);
			});

			it('addItem', function ()
			{
				var item = {
						id: '1234'
					,	name: 'Fluffy Pink Bunnies'
					,	sku: 'DD23444'
					,	category: 'Party Toys'
					,	price: '11.99'
					,	quantity: '1'
					};

				expect(GoogleUniversalAnalytics.addItem(item)).toBe(GoogleUniversalAnalytics);
				expect(ga).toHaveBeenCalledWith('ecommerce:addItem', item);

				GoogleUniversalAnalytics
					.addItem()
					.addItem({
						id: '1234'
					})
					.addItem({
						name: 'Fluffy Pink Bunnies'
					})
					.addItem({
						id: undefined
					,	name: ''
					});

				expect(ga.calls.length).toEqual(1);
			});

			it('addTrans', function ()
			{
				var valid_transaction = {
						id: '1234'
					,	revenue: '11.99'
					,	shipping: '5'
					,	tax: '1.29'
					,	currency: 'USD'
					};

				expect(GoogleUniversalAnalytics.addTrans(valid_transaction)).toEqual(GoogleUniversalAnalytics);
				expect(ga).toHaveBeenCalledWith('ecommerce:addTransaction', valid_transaction);

				GoogleUniversalAnalytics
					.addTrans()
					.addTrans({});

				expect(ga.calls.length).toEqual(1);
			});

			it('trackTrans', function ()
			{
				expect(GoogleUniversalAnalytics.trackTrans()).toEqual(GoogleUniversalAnalytics);
				expect(ga).toHaveBeenCalledWith('ecommerce:send');
			});

			describe('trackTransaction', function ()
			{
				var order = null;

				beforeEach(function ()
				{
					SC.ENVIRONMENT = {
						currentCurrency: {
							code: 'USD'	
						}
					,	siteSettings: {}
					};

					order = new Backbone.Model({
						confirmation: {
							confirmationnumber: '5554-2243'
						}
					,	lines: new Backbone.Collection([
							{
								item: new Backbone.Model({
									_name: 'AIR'
								,	_sku: 'gt0017'
								,	_category: 'Men'
								})
							,	quantity: 1
							,	rate: 250
							}
						,	{
								item: new Backbone.Model({
									_name: 'Trail Palomar'
								,	_sku: 'Trail-Palomar-Sil-24'
								,	_category: 'Bike'
								})
							,	quantity: 1
							,	rate: 500.99
							}
						])
					,	summary: {
							subtotal: 750.99
						,	shippingcost: 60
						,	handlingcost: 0
						,	taxtotal: 21.5
						}
					});
				});

				it('adds the transaction', function ()
				{
					spyOn(GoogleUniversalAnalytics, 'addTrans');

					GoogleUniversalAnalytics.trackTransaction(order);

					expect(GoogleUniversalAnalytics.addTrans).toHaveBeenCalledWith({
						id: '5554-2243'
					,	revenue: 750.99
					,	shipping: 60
					,	tax: 21.5
					,	currency: 'USD'
					});
				});

				it('with each of its items', function ()
				{
					spyOn(GoogleUniversalAnalytics, 'addItem');

					GoogleUniversalAnalytics.trackTransaction(order);

					expect(GoogleUniversalAnalytics.addItem).toHaveBeenCalledWith({
						id: '5554-2243'
					,	sku: 'gt0017'
					,	name: 'AIR'
					,	category: 'Men'
					,	price: 250
					,	quantity: 1
					});

					expect(GoogleUniversalAnalytics.addItem).toHaveBeenCalledWith({
						id: '5554-2243'
					,	sku: 'Trail-Palomar-Sil-24'
					,	name: 'Trail Palomar'
					,	category: 'Bike'
					,	price: 500.99
					,	quantity: 1
					});

					expect(GoogleUniversalAnalytics.addItem.calls.length).toEqual(2);
				});

				it('and tracks it', function ()
				{
					spyOn(GoogleUniversalAnalytics, 'trackTrans');

					GoogleUniversalAnalytics.trackTransaction(order);

					expect(GoogleUniversalAnalytics.trackTrans).toHaveBeenCalled();
				});
			});
		});

		describe('addCrossDomainParameters', function ()
		{
			var loaded = false;

			SC.ENVIRONMENT = {
				jsEnvironment: 'browser'
			};

			GoogleUniversalAnalytics
				.setAccount({
					propertyID: 'UA-34213649-2'
				,	domainName: 'demo.uylabs.com'
				})
				.loadScript().then(function ()
				{
					setTimeout(function ()
					{
						loaded = true;
					}, 600);
				});

			beforeEach(function ()
			{
				waitsFor(function ()
				{
					return loaded;
				}, 'Analytics library should be loaded', 6000);
			});

			it('adds analytics parameters to an url', function ()
			{
				expect(GoogleUniversalAnalytics.addCrossDomainParameters('checkout.netsuite.com')).not.toEqual('checkout.netsuite.com');
			});

			it('unless the url is a subdomain of the current domain', function ()
			{
				expect(GoogleUniversalAnalytics.addCrossDomainParameters('checkout.demo.uylabs.com')).toEqual('checkout.demo.uylabs.com');
			});

			it('or you pass something that is not a string', function ()
			{
				var crap = [null, undefined, {what: 'sup'}, ['some array']];

				expect(GoogleUniversalAnalytics.addCrossDomainParameters(crap)).toBe(crap);

				_.each(crap, function (turd)
				{
					expect(GoogleUniversalAnalytics.addCrossDomainParameters(turd)).toBe(turd);
				});
			});
		});
	});
});