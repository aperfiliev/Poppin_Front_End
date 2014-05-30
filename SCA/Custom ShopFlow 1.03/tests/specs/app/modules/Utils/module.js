/*global SC:false, it:false,  _: false, describe:false, define:false, expect:false */
/*jshint forin:true, noarg:true, noempty:true, eqeqeq:true, bitwise:false, strict:true, undef:true, unused:true, curly:true, browser:true, quotmark:single, maxerr:50, laxcomma:true, expr:true*/

// Utils.js
// --------------------
// Testing Utils.js and functions of _.
define(['Utils', 'jasmineTypeCheck'], function ()
{
	
	'use strict';
	
	describe('SC.Utils', function () {

		it('#1 it should profivde a translate method', function () 
		{
			expect(_.translate).toBeA(Function);
		});
		
		it('#2 it should profivde a formatPhone method', function () 
		{
			expect(_.formatPhone).toBeA(Function);
		});
		
		it('#3 it should profivde a formatCurrency method', function () 
		{
			expect(_.formatCurrency).toBeA(Function);
		});	
		
		it('#4 it should profivde a validatePhone method', function () 
		{
			expect(_.validatePhone).toBeA(Function);
		});	
		
		it('#5 it should profivde a collectionToString method', function () 
		{
			expect(_.collectionToString).toBeA(Function);
		});	
		
		it('#6 it should profivde a addParamsToUrl method', function () 
		{
			expect(_.addParamsToUrl).toBeA(Function);
		});	
		
	});
	
	describe('SC.Utils.translate', function () {
		
		it('#1 it should echo it\'s input if no translations found', function () 
		{
			expect(_('A text').translate()).toBe('A text');
		});
		
		it('#2 it should return a translated string if a translation map is precent in SC.Translations', function () 
		{
			SC.Translations = {'A text': 'Un Texto'};
			expect(_('A text').translate()).toBe('Un Texto');
		});
		
		it('#3 it should be able to mix in variables if configured to do so', function () 
		{
			expect(_('This is a $(0)').translate('Test')).toBe('This is a Test');
		});
		
		it('#4 it should be able to translate texts with mix in variables if configured to do so', function () 
		{
			SC.Translations = {'This is a $(0)': 'Esto es un $(0)'};
			expect(_('This is a $(0)').translate('Test')).toBe('Esto es un Test');
		});
		
		it('#5 it should let me configure the position of the mixin in the text', function () 
		{
			expect(_('$(1) -> $(0)').translate('Test1', 'Test2')).toBe('Test2 -> Test1');
		});
		
		it('#6 it should let me configure the position of the mixin to be different in a translation than the original', function () 
		{
			SC.Translations = {'$(1) -> $(0)': '$(0) -> $(1)'};
			expect(_('$(1) -> $(0)').translate('Test1', 'Test2')).toBe('Test1 -> Test2');
		});
	});

	describe('SC.Utils.dateToString', function ()
	{
		it ('should return a date in basic string format', function()
		{
			expect(_.dateToString(new Date(2014, 8, 7))).toEqual('2014-09-07');
			expect(_.dateToString(new Date(2000, 10, 7))).toEqual('2000-11-07');
			expect(_.dateToString(new Date(2014, 8, 12))).toEqual('2014-09-12');
			expect(_.dateToString(new Date(2014, 9, 13))).toEqual('2014-10-13');
		});
	});

	describe('SC.Utils.isDateValid', function () 
	{
		it('should return false if pass a number', function()
		{
			expect(_.isDateValid(2014)).toBeFalsy();
		});

		it('should return false if pass a string', function()
		{
			expect(_.isDateValid('2014-12-20')).toBeFalsy();
		});

		it('should return false if pass undefined', function()
		{
			expect(_.isDateValid()).toBeFalsy();
		});

		it('should return false if pass a bool', function()
		{
			expect(_.isDateValid(false)).toBeFalsy();
			expect(_.isDateValid(true)).toBeFalsy();
		});

		it('should return true if pass a date object in valid state', function()
		{
			expect(_.isDateValid(new Date())).toBeTruthy();
		});

		it('should return false if pass a date object in invalid state', function()
		{
			expect(_.isDateValid(new Date('pollitos verdes'))).toBeFalsy();
		});
	});
		
	describe('SC.Utils.formatPhone', function () {
		
		
		it('#1 it should echo the input if no format is defined', function () 
		{
			expect(_.formatPhone('A text')).toBe('A text');
		});
		
		it('#2 it should format a phone number for a given format', function () 
		{
			expect(_.formatPhone('0987654321', '(123) 456-7890')).toBe('(098) 765-4321');
		});
		
		it('#3 it should support different formats', function () 
		{
			expect(_.formatPhone('0987654321', '(123) 456-7890')).toBe('(098) 765-4321');
			expect(_.formatPhone('0987654321', '123 456 7890')).toBe('098 765 4321');
			expect(_.formatPhone('0987654321', '123-456-7890')).toBe('098-765-4321');
			expect(_.formatPhone('0987654321', '123.456.7890')).toBe('098.765.4321');
		});
		
		it('#4 it should support different input lengths for a given format', function () 
		{
			expect(_.formatPhone('110987654321', '(123) 456-7890')).toBe('110987654321');
			expect(_.formatPhone('10987654321', '(123) 456-7890')).toBe('1 (098) 765-4321');
			expect(_.formatPhone('987654321', '(123) 456-7890')).toBe('987654321');
			expect(_.formatPhone('87654321', '(123) 456-7890')).toBe('87654321');
			expect(_.formatPhone('7654321', '(123) 456-7890')).toBe('765-4321');
			expect(_.formatPhone('654321', '(123) 456-7890')).toBe('654321');
		});
		
		it('#5 it should support common extentions number notations', function () 
		{
			expect(_.formatPhone('0987654321 Ext: 100', '(123) 456-7890')).toBe('(098) 765-4321 Ext: 100');
			expect(_.formatPhone('0987654321 Ex: 100', '(123) 456-7890')).toBe('(098) 765-4321 Ex: 100');
			expect(_.formatPhone('0987654321 #100', '(123) 456-7890')).toBe('(098) 765-4321 #100');
		});
		
		/* WILL CHANGE */
		/*
		it('#6 it should use the format in the SiteSettings Model if no format is provided directly', function () 
		{
			_.setDefaultPhoneFormat('(123) 456-7890');
			expect(_.formatPhone('0987654321 Ext: 100')).toBe('(098) 765-4321 Ext: 100');
		});
		
		it('#7 it should ignore the format in the SiteSettings Model if format is provided directly', function () 
		{
			_.setDefaultPhoneFormat('(123) 456-7890');
			expect(_.formatPhone('0987654321 Ext: 100', '123-456-7890')).not.toBe('(098) 765-4321 Ext: 100');
		});
		*/
		/* END WILL CHANGE */
		
	});

	describe('SC.Utils.validatePhone', function () {
		
		it('#1 it should echo Phone Number is invalid if the value is numeric and length < 7', function () 
		{
			expect(_.validatePhone('123456')).toBe('Phone Number is invalid');
		});
		
		it('#2 it should echo Phone Number is invalid if the value is not numeric and length > 7', function () 
		{
			expect(_.validatePhone('1234567abc')).toBe('Phone Number is invalid');
		});

		it('#3 it should echo Phone Number is invalid if the value is numeric and length >= 7, but 6 numbers and one or more spaces', function () 
		{
			expect(_.validatePhone('12345 6')).toBe('Phone Number is invalid');
		});
		
		it('#4 it should no return if the value is numeric and length > 7', function () 
		{
			expect(_.validatePhone('1234567')).not.toBeDefined();
		});
	});

	describe('SC.Utils.formatCurrency', function () {


		
		it('#1 it should return a formated version of number', function () 
		{
			expect(_.formatCurrency(10)).toBe('$10.00');
		});
		
		it('#2 it should round decimal numbers', function () 
		{
			expect(_.formatCurrency(10 / 3)).toBe('$3.33');
		});
		
		it('#3 it should allow me to pass in the Symbol', function () 
		{
			expect(_.formatCurrency(10, '£')).toBe('£10.00');
		});
		/* WILL CHANGE */		
		/*
		it('#4 it should use the Symbol in the SiteSettings Model if present', function () 
		{
			_.setDefaultCurrencySymbol('£');
			expect(_.formatCurrency(10)).toBe('£10.00');
		});
		
		it('#5 it should ignore the Symbol in the SiteSettings Model if passed directly', function () 
		{
			_.setDefaultCurrencySymbol('€');
			expect(_.formatCurrency(10, '¥')).toBe('¥10.00');
		});
		*/
		/* END WILL CHANGE */
	});

	describe('SC.Utils.collectionToString', function () {
		
		var getValue = function (sort)
		{
			return sort.field + ':' + sort.dir;
		};

		it('#1 it should return a string', function () 
		{
			expect(_.collectionToString({collection:[{field: 'price', dir: 'desc'}], getValue: getValue, joinWith: ','})).toBe('price:desc');
		});

		it('#2 it should return a string', function () 
		{
			expect(_.collectionToString({collection:[{field: 'price',dir: 'desc'},{field: 'created',dir: 'asc'}], getValue:getValue, joinWith:','})).toBe('price:desc,created:asc');
		});

		it('#3 it should return an empty string', function () 
		{
			expect(_.collectionToString({collection:[], getValue:getValue, joinWith:','})).toBe('');
		});

		it('#4 it should return an empty string', function () 
		{
			expect(_.collectionToString({collection:null, getValue:getValue, joinWith:','})).toBe('');
		});
	});


	describe('SC.Utils.addParamsToUrl', function ()
	{
		var config = {
			include: 'facets'
		,	fieldset: 'search'
		};
	
		it('#1 adding parameters to url without parameters', function () 
		{
			var baseUrl = '/api/items';
			var baseUrlWithParams = _.addParamsToUrl(baseUrl, config);
			expect(baseUrlWithParams).toBe('/api/items?include=facets&fieldset=search');
		});
		
		it('#2 adding parameters to url with parameters', function () 
		{
			var baseUrl = '/api/items?test=value';
			var baseUrlWithParams = _.addParamsToUrl(baseUrl, config);
			expect(baseUrlWithParams).toBe('/api/items?test=value&include=facets&fieldset=search');
		});
	});
	
});