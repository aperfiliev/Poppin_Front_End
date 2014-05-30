/*global SC:false, require:false, spyOn:false, it:false, describe:false, expect:false, define:false, beforeEach:false, jQuery:false, waitsFor:false */
/*jshint forin:true, noarg:true, noempty:true, eqeqeq:true, bitwise:false, strict:true, undef:true, unused:true, curly:true, browser:true, quotmark:single, maxerr:50, laxcomma:true, expr:true*/

// PromocodeSupport.js
// --------------------
// Testing PromocodeSupport module.
define(['ApplicationSkeleton', 'Main', 'jasmineTypeCheck'], function ()
{
	
	'use strict';
	
	describe('Module: PromocodeSupport', function () {
		
		var cartModel
		,	is_started = false
		,	url_helper
		,	application;
		
		beforeEach(function ()
		{
			if (!is_started)
			{
				// Here is the appliaction we will be using for this tests
				application = SC.Application('PromocodeSupport');
				// This is the configuration needed by the modules in order to run
				application.Configuration = {
					modules: [ 'PromocodeSupport', 'Cart', 'UrlHelper' ]
				};
				
				// Starts the application
				jQuery(application.start(function () { is_started = true; }));
				
				// Makes sure the application is started before 
				waitsFor(function() 
				{ 
					if (is_started)
					{
						cartModel = application.getCart();
						url_helper = require('UrlHelper');
						spyOn(cartModel, 'save');
						return cartModel && url_helper;
					}
					else
					{
						return false;
					} 
				
				});
			}			
		});
		
		it('#1 must be called save function of model cart when the promocode is in the url', function() {
			url_helper.setUrl('http://www.netsuite.com?promocode=10off');
			expect(cartModel.save).toHaveBeenCalled();
		});	
		
	});

});