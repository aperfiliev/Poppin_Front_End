/*jshint laxcomma:true*/
define(['GoogleAnalytics'], function (GoogleAnalytics)
{
	'use strict';

	return describe('GoogleAnalytics Module', function ()
	{
		it('defines the global variable `_gaq`', function ()
		{
			expect(_gaq).toBeDefined();
		});

		describe('setAccount', function ()
		{
			var valid_settings = {
					propertyID: 'UA-34213649-2'
				,	domainName: 'demo.uylabs.com'
				};

			beforeEach(function ()
			{
				spyOn(_gaq, 'push');
			});

			it('sets the analytics account', function ()
			{
				GoogleAnalytics.setAccount(valid_settings);

				expect(_gaq.push).toHaveBeenCalledWith(
					['_setAccount', 'UA-34213649-2']
				,	['_setDomainName', 'demo.uylabs.com']
				,	['_setAllowLinker', true]
				);

				expect(GoogleAnalytics.propertyID).toBe('UA-34213649-2');
				expect(GoogleAnalytics.domainName).toBe('demo.uylabs.com');
			});

			it('and returns the GoogleAnalytics module', function ()
			{
				expect(GoogleAnalytics.setAccount(valid_settings)).toEqual(GoogleAnalytics);
				expect(_gaq.push).toHaveBeenCalled();
			});

			it('even if the account is not set', function ()
			{
				expect(GoogleAnalytics.setAccount()).toEqual(GoogleAnalytics);
				expect(_gaq.push).not.toHaveBeenCalled();
			});

			describe('the account is not set if:', function ()
			{
				it('there\'s no configuration', function ()
				{
					GoogleAnalytics.setAccount();
					expect(_gaq.push).not.toHaveBeenCalled();
				});

				it('either propertyID or domainName are not set', function ()
				{
					GoogleAnalytics.setAccount({
						propertyID: valid_settings.propertyID
					});

					expect(_gaq.push).not.toHaveBeenCalled();

					GoogleAnalytics.setAccount({
						domainName: valid_settings.domainName
					});
					
					expect(_gaq.push).not.toHaveBeenCalled();

					GoogleAnalytics.setAccount({
						something: valid_settings.propertyID
					,	somethingElse: valid_settings.domainName
					});
					
					expect(_gaq.push).not.toHaveBeenCalled();
				});

				it('or they are not strings', function ()
				{
					GoogleAnalytics.setAccount({
						propertyID: function ()
						{
							return 'what?';
						}
					,	domainName: ['o', 'p', 'a']
					});
					
					expect(_gaq.push).not.toHaveBeenCalled();

					GoogleAnalytics.setAccount({
						propertyID: {}
					,	domainName: undefined
					});
					
					expect(_gaq.push).not.toHaveBeenCalled();
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
				GoogleAnalytics.loadScript();
				expect(jQuery.getScript).toHaveBeenCalledWith('http://www.google-analytics.com/ga.js');
			});

			it('unless the environment is not `browser`', function ()
			{
				SC.ENVIRONMENT.jsEnvironment = 'server';
				expect(GoogleAnalytics.loadScript()).toBe(false);
				expect(jQuery.getScript).not.toHaveBeenCalled();

				SC.ENVIRONMENT.jsEnvironment = 'bowser';
				expect(GoogleAnalytics.loadScript()).toBe(false);
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
							google: {
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
				spyOn(GoogleAnalytics, 'setAccount').andCallThrough();

				GoogleAnalytics.mountToApp(application);

				expect(GoogleAnalytics.setAccount).toHaveBeenCalledWith({
					propertyID: 'UA-34213649-2'
				,	domainName: 'demo.uylabs.com'
				});
			});

			it('loads the scripts', function ()
			{
				spyOn(GoogleAnalytics, 'loadScript');

				GoogleAnalytics.mountToApp(application);

				expect(GoogleAnalytics.loadScript).toHaveBeenCalled();
			});

			it('and pushes itself to the list of trackers', function ()
			{
				expect(application.trackers).not.toContain(GoogleAnalytics);

				GoogleAnalytics.mountToApp(application);

				expect(application.trackers).toContain(GoogleAnalytics);
			});

			it('if its configured in the application', function ()
			{
				spyOn(GoogleAnalytics, 'setAccount');
				spyOn(GoogleAnalytics, 'loadScript');

				delete application.Configuration.tracking.google;

				GoogleAnalytics.mountToApp(application);

				expect(GoogleAnalytics.setAccount).not.toHaveBeenCalled();
				expect(GoogleAnalytics.loadScript).not.toHaveBeenCalled();
				expect(application.trackers).not.toContain(GoogleAnalytics);
			});
		});

		describe('tracking methods', function ()
		{
			beforeEach(function ()
			{
				spyOn(_gaq, 'push');
			});

			it('trackPageview', function ()
			{
				expect(GoogleAnalytics.trackPageview('/')).toEqual(GoogleAnalytics);
				expect(_gaq.push).toHaveBeenCalledWith(['_trackPageview', '/']);

				GoogleAnalytics.trackPageview();
				GoogleAnalytics.trackPageview([]);

				expect(_gaq.push.calls.length).toEqual(1);
			});

			it('trackEvent', function ()
			{
				var valid_event = {
						category: 'button'
					,	action: 'click'
					,	label: 'nav buttons'
					,	value: 1
					};

				expect(GoogleAnalytics.trackEvent(valid_event)).toEqual(GoogleAnalytics);

				expect(_gaq.push).toHaveBeenCalledWith(['_trackEvent', 'button', 'click', 'nav buttons', 1]);

				GoogleAnalytics.trackEvent();
				GoogleAnalytics.trackEvent({});

				expect(_gaq.push.calls.length).toEqual(1);
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

				expect(GoogleAnalytics.addItem(item)).toBe(GoogleAnalytics);

				expect(_gaq.push).toHaveBeenCalledWith(['_addItem'
				,	'1234'
				,	'DD23444'
				,	'Fluffy Pink Bunnies'
				,	'Party Toys'
				,	'11.99'
				,	'1'
				]);

				GoogleAnalytics
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

				expect(_gaq.push.calls.length).toEqual(1);
			});

			it('addTrans', function ()
			{
				var valid_transaction = {
						id: '1234'
					,	revenue: '11.99'
					,	shipping: '5'
					,	tax: '1.29'
					,	currency: 'USD'
					,	city: 'L.A.'
					,	state: 'CA'
					,	country: 'US'
					};

				expect(GoogleAnalytics.addTrans(valid_transaction)).toEqual(GoogleAnalytics);

				expect(_gaq.push).toHaveBeenCalledWith(['_addTrans'
				,	'1234', undefined
				,	'11.99', '1.29'
				,	'5', 'L.A.'
				,	'CA', 'US'
				]);

				GoogleAnalytics
					.addTrans()
					.addTrans({});

				expect(_gaq.push.calls.length).toEqual(1);
			});

			it('trackTrans', function ()
			{
				expect(GoogleAnalytics.trackTrans()).toEqual(GoogleAnalytics);
				expect(_gaq.push).toHaveBeenCalledWith(['_trackTrans']);
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
						addresses: new Backbone.Collection([{
							id: '123'
						,	city: 'L.A.'
						,	state: 'CA'
						,	country: 'US'
						}])
					,	confirmation: {
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
					,	shipaddress: '123'
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
					spyOn(GoogleAnalytics, 'addTrans');

					GoogleAnalytics.trackTransaction(order);

					expect(GoogleAnalytics.addTrans).toHaveBeenCalledWith({
						id: '5554-2243'
					,	affiliation: undefined
					,	revenue: 750.99
					,	tax: 21.5
					,	shipping: 60
					,	city: 'L.A.'
					,	state: 'CA'
					,	country: 'US'
					});
				});

				it('with each of its items', function ()
				{
					spyOn(GoogleAnalytics, 'addItem');

					GoogleAnalytics.trackTransaction(order);

					expect(GoogleAnalytics.addItem).toHaveBeenCalledWith({
						id: '5554-2243'
					,	sku: 'gt0017'
					,	name: 'AIR'
					,	category: 'Men'
					,	price: 250
					,	quantity: 1
					});

					expect(GoogleAnalytics.addItem).toHaveBeenCalledWith({
						id: '5554-2243'
					,	sku: 'Trail-Palomar-Sil-24'
					,	name: 'Trail Palomar'
					,	category: 'Bike'
					,	price: 500.99
					,	quantity: 1
					});

					expect(GoogleAnalytics.addItem.calls.length).toEqual(2);
				});

				it('and tracks it', function ()
				{
					spyOn(GoogleAnalytics, 'trackTrans');

					GoogleAnalytics.trackTransaction(order);

					expect(GoogleAnalytics.trackTrans).toHaveBeenCalled();
				});
			});
		});

		describe('addCrossDomainParameters', function ()
		{
			var loaded = false;

			SC.ENVIRONMENT = {
				jsEnvironment: 'browser'
			};

			GoogleAnalytics
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
				expect(GoogleAnalytics.addCrossDomainParameters('checkout.netsuite.com')).not.toEqual('checkout.netsuite.com');
			});

			it('unless the url is a subdomain', function ()
			{
				expect(GoogleAnalytics.addCrossDomainParameters('checkout.demo.uylabs.com')).toEqual('checkout.demo.uylabs.com');
			});

			it('or you pass something that is not a string', function ()
			{
				var crap = [null, undefined, {what: 'sup'}, ['some array']];

				expect(GoogleAnalytics.addCrossDomainParameters(crap)).toBe(crap);

				_.each(crap, function (turd)
				{
					expect(GoogleAnalytics.addCrossDomainParameters(turd)).toBe(turd);
				});
			});
		});
	});
});