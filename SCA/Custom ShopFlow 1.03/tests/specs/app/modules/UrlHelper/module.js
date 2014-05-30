/*global SC:false, spyOn:false, require:false, _:false, it:false, describe:false, define:false, expect:false, beforeEach:false, jQuery:false, waitsFor:false */
/*jshint forin:true, noarg:true, noempty:true, eqeqeq:true, bitwise:false, strict:true, undef:true, unused:true, curly:true, browser:true, quotmark:single, maxerr:50, laxcomma:true, expr:true*/

// UrlHelper.js
// --------------------
// Testing UrlHelper

define(['UrlHelper', 'ApplicationSkeleton', 'Main'], function ()
{
	'use strict';
	
	describe('Function: _.fixUrl - Listening only one token', function ()
	{
	
		var is_started = false
		,	application
		,	url_helper
		,	fix_url;
		
		beforeEach(function ()
		{
			// Here is the appliaction we will be using for this tests
			application = SC.Application('UrlHelper');
			// This is the configuration needed by the modules in order to run
			application.Configuration =  {
				modules: ['UrlHelper']
			};				
			// Starts the application
			jQuery(application.start(function () { is_started = true; }));
			// Makes sure the application is started before 
			waitsFor(function ()
			{
				if (is_started)
				{
					url_helper = require('UrlHelper');
					url_helper.clearValues();
					fix_url = _.fixUrl;
					url_helper.addTokenListener('locale', true);
					url_helper.setUrl('http://www.netsuite.com?test=1&url=392&promocode=39293&locale=es');		
				}
				return fix_url && is_started && url_helper; 
			});
		});
		
		it('#1 external url', function ()
		{
			var url = 'http://www.netsuite.com?test=1&url=392&promocode=39293';
			var result = fix_url(url);
			expect(url).toBe(result);
		});
		
		it('#2 internal url with parameters', function ()
		{
			var result = fix_url('#search?test=1&url=392&promocode=39293');
			expect(result).toBe('#search?test=1&url=392&promocode=39293&locale=es');
		});

		it('#3 internal url without parameters', function ()
		{
			var result = fix_url('#search');
			expect(result).toBe('#search?locale=es');
		});

		it('#4 internal url with parameters and locale parameter is set', function ()
		{
			var result = fix_url('#search?test=1&url=392&promocode=39293&locale=pt');
			expect(result).toBe('#search?test=1&url=392&promocode=39293&locale=pt');
		});

	
	});


	describe('Function: _.fixUrl - Listening two token', function ()
	{
		
		var url_helper, fix_url; 
		
		beforeEach(function ()
		{
			url_helper = require('UrlHelper');
			url_helper.clearValues();
			fix_url = _.fixUrl;
			url_helper.addTokenListener('promocode', true);
			url_helper.addTokenListener('locale', true);
			url_helper.setUrl('http://www.netsuite.com?test=1&url=392&promocode=39293&locale=es');
		});
		
		it('#1 external url', function ()
		{
			var url = 'http://www.netsuite.com?test=1&url=392&promocode=39293';
			var result = fix_url(url);
			expect(url).toBe(result);
		});
		
		it('#2 internal url with parameters', function ()
		{
			var result = fix_url('#search?test=1&url=392');
			expect(result).toBe('#search?test=1&url=392&promocode=39293&locale=es');
		});

		it('#3 internal url without parameters', function ()
		{
			var result = fix_url('#search');
			expect(result).toBe('#search?promocode=39293&locale=es');
		});

		it('#4 internal url with parameters and locale parameter is set', function ()
		{
			var result = fix_url('#search?test=1&url=392&locale=pt');
			expect(result).toBe('#search?test=1&url=392&locale=pt&promocode=39293');
		});

		it('#5 internal url with parameters and promocode parameter is set', function ()
		{
			var result = fix_url('#search?test=1&url=392&promocode=different');
			expect(result).toBe('#search?test=1&url=392&promocode=different&locale=es');
		});

	
	});
	
	describe('Module: UrlHelper - Listening one token, set url without value for the token', function ()
	{
		
		var url_helper, test;
		beforeEach(function ()
		{
			url_helper = require('UrlHelper');
			url_helper.clearValues();
			test = {
				fn : function ()
				{ 
					return true;
				}
			};
			spyOn(test, 'fn');
			url_helper.addTokenListener('locale', true);
			url_helper.setUrl('http://www.netsuite.com?test=1&url=392&locale=es');
		});
		
		it('#1 function in Listener should not have been called', function ()
		{
			expect(test.fn).not.toHaveBeenCalled();
		});
		
	
	});

	describe('Function: _.setUrlParameter', function ()
	{
		
		it('#1 url with parameters, add new value.', function ()
		{
			var url = 'http://www.netsuite.com?test=1&url=392&promocode=39293';
			var result = _.setUrlParameter(url, 'locale', 'es');
			expect(result).toBe('http://www.netsuite.com?test=1&url=392&promocode=39293&locale=es');
		});

		it('#2 url with parameters, edit value.', function ()
		{
			var url = 'http://www.netsuite.com?test=1&url=392&promocode=39293&locale=pt';
			var result = _.setUrlParameter(url, 'locale', 'es');
			expect(result).toBe('http://www.netsuite.com?test=1&url=392&promocode=39293&locale=es');
		});
		
		
		it('#3 url without parameters, add new parameter', function ()
		{
			var url = 'http://www.netsuite.com';
			var result = _.setUrlParameter(url, 'locale', 'es');
			expect(result).toBe('http://www.netsuite.com?locale=es');
		});
		
		it('#4 url with only one parameter, edit this parameter', function ()
		{
			var url = 'http://www.netsuite.com?locale=pt';
			var result = _.setUrlParameter(url, 'locale', 'es');
			expect(result).toBe('http://www.netsuite.com?locale=es');
		});

	});


	describe('Function: _.removeUrlParameter', function () 
	{
		
		it('#1 url without parameters', function ()
		{
			var url = 'http://www.netsuite.com';
			var result = _.removeUrlParameter(url, 'locale');
			expect(result).toBe('http://www.netsuite.com');
		});

		it('#2 url with parameters and the parameter to remove is the last', function ()
		{
			var url = 'http://www.netsuite.com?test=1&url=392&promocode=39293&locale=es';
			var result = _.removeUrlParameter(url, 'locale');
			expect(result).toBe('http://www.netsuite.com?test=1&url=392&promocode=39293');
		});

		it('#3 url with parameters and the parameter to remove is the first', function ()
		{
			var url = 'http://www.netsuite.com?test=1&url=392&promocode=39293&locale=es';
			var result = _.removeUrlParameter(url, 'test');
			expect(result).toBe('http://www.netsuite.com?url=392&promocode=39293&locale=es');
		});
		
		it('#4 url with parameters and the parameter to remove is in the middle', function ()
		{
			var url = 'http://www.netsuite.com?test=1&url=392&promocode=39293&locale=es';
			var result = _.removeUrlParameter(url, 'promocode');
			expect(result).toBe('http://www.netsuite.com?test=1&url=392&locale=es');
		});
		
		it('#5 url with only one parameter ', function ()
		{
			var url = 'http://www.netsuite.com?test=1';
			var result = _.removeUrlParameter(url, 'test');
			expect(result).toBe('http://www.netsuite.com');
		});
		
		it('#6 url with only two parameters ', function ()
		{
			var url = 'http://www.netsuite.com?test=1&locale=es';
			var result = _.removeUrlParameter(url, 'test');
			expect(result).toBe('http://www.netsuite.com?locale=es');
		});
		
	});

	describe('Module: UrlHelper', function ()
	{
		
		var url_helper, fix_url; 
		
		beforeEach(function ()
		{
			url_helper = require('UrlHelper');
			fix_url = _.fixUrl;
			url_helper.clearValues();
		});
		
		it('#1 getParameters: with only one Listener return obj with token and value', function ()
		{
			url_helper.addTokenListener('locale', true);
			url_helper.setUrl('http://www.netsuite.com?test=1&url=392&promocode=39293&locale=es');
			var result = url_helper.getParameters();
			expect(result.locale).toBe('es');
		});

		it('#2 getParameters: with two Listener, return obj with both values', function ()
		{
			url_helper.addTokenListener('locale', true);
			url_helper.addTokenListener('promocode', true);
			url_helper.setUrl('http://www.netsuite.com?test=1&url=392&promocode=39293&locale=es');
			var result = url_helper.getParameters();
			expect(result.locale).toBe('es');
			expect(result.promocode).toBe('39293');
		});

		it('#3 getParameters: with two Listener but one without persistence, return obj with only one value', function ()
		{
			url_helper.addTokenListener('locale', true);
			url_helper.addTokenListener('promocode', false);
			url_helper.setUrl('http://www.netsuite.com?test=1&url=392&promocode=39293&locale=es');
			var result = url_helper.getParameters();
			expect(result.locale).toBe('es');
			expect(result.promocode).toBe(undefined);
		});	

		it('#4 getParameters: with only one Listener and set a function to change the value', function ()
		{
			url_helper.addTokenListener('locale', function (value) { return value + '-test'; });
			url_helper.setUrl('http://www.netsuite.com?test=1&url=392&promocode=39293&locale=es');
			var result = url_helper.getParameters();
			expect(result.locale).toBe('es-test');
		});	

		it('#5 getParameters: with only one Listener and set a function to add persistence', function ()
		{
			url_helper.addTokenListener('promocode', function () { return true; });
			url_helper.setUrl('http://www.netsuite.com?test=1&url=392&promocode=39293&locale=es');
			var result = url_helper.getParameters();
			expect(result.promocode).toBe('39293');
		});	

		it('#6 getParameters: with only one Listener and set a function to remove persistence', function ()
		{
			url_helper.addTokenListener('locale', function () { return false; });
			url_helper.setUrl('http://www.netsuite.com?test=1&url=392&promocode=39293&locale=es');
			var result = url_helper.getParameters();
			expect(result.locale).toBe(undefined);
		});	

		it('#7 getParameterValue: get value that existing in the url', function ()
		{
			url_helper.setUrl('http://www.netsuite.com?test=1&url=392&promocode=39293&locale=es');
			var result = url_helper.getParameterValue('promocode');
			expect(result).toBe('39293');
		});	


		it('#8 getParameterValue: get value that not existing in the url', function ()
		{
			url_helper.setUrl('http://www.netsuite.com?url=392&promocode=39293&locale=es');
			var result = url_helper.getParameterValue('test');
			expect(result).toBe('');
		});

		it('#9 getParameters: promocode with a hash tag following internal', function ()
		{
			url_helper.addTokenListener('promocode', function () { return true; });
			url_helper.setUrl('http://www.netsuite.com?promocode=SALE20#color=red');
			var result = url_helper.getParameters();
			expect(result.promocode).toBe('SALE20');
		});		

		it('#10 getParameters: promocode and another parameter with a hash tag following internal', function ()
		{
			url_helper.addTokenListener('promocode', function () { return true; });
			url_helper.setUrl('http://www.netsuite.com?affliate=sportsstore.com&promocode=SALE20#color=red');
			var result = url_helper.getParameters();
			expect(result.promocode).toBe('SALE20');
		});		

		it('#11 getParameters: promocode and affliate with a hash tag following internal', function ()
		{
			url_helper.addTokenListener('promocode', function () { return true; });
			url_helper.addTokenListener('affliate', function () { return true; });
			url_helper.setUrl('http://www.netsuite.com?affliate=sportsstore.com&promocode=SALE20#color=red');
			var result = url_helper.getParameters();
			expect(result.promocode).toBe('SALE20');
			expect(result.affliate).toBe('sportsstore.com');
		});		

	});
});