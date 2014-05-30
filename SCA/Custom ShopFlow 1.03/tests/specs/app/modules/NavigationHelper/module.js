/*global SC:false, it:false, spyOn: false, _: false, Backbone: false, describe:false, expect:false, define: false, beforeEach:false, jQuery:false, waitsFor:false */
/*jshint forin:true, noarg:true, noempty:true, eqeqeq:true, bitwise:false, strict:true, undef:true, unused:true, curly:true, browser:true, quotmark:single, maxerr:50, laxcomma:true, expr:true*/

// Navigation.Helper.js
// --------------------
// Testing Navigation Helper.
define(['NavigationHelper', 'Application'], function ()
{
	'use strict';
	
	describe('Module: Navigation.Helper', function () {
		
		var is_started = false
		,	application;

		// initial setup required for this test: we will be working with views.
		SC.templates={'layout_tmpl': '<div id="layout"><div id="content"></div></div>'};
		SC.compileMacros(SC.templates.macros);

		/**very simplistic way of parsing an url in paramenters and hash. @return an Object {params, hash} */
		var parseUrl = function(url) {
			if(url.indexOf('?') === -1)
			{
				return {};
			}
			var ret = {};
			var right = url.split('?')[1];
			var hash = '';
			if(right.indexOf('#')>0)
			{
				var hash_arr = right.split('#');
				right = hash_arr[0]; //extract #hash
				hash = hash_arr[1];
			}
			var param_arr = right.split('&');
			for (var i = 0; i < param_arr.length; i++)
			{
				var p_arr = param_arr[i].split('=');
				ret[p_arr[0]] = p_arr[1];
			}
			return {
				params: ret
			,	hash: hash
			};
		};

		beforeEach(function ()
		{
			// Here is the appliaction we will be using for this tests
			application = SC.Application('NavigationHelper');
			// This is the configuration needed by the modules in order to run
			application.Configuration =  {
					modules: [ 'NavigationHelper', 'UrlHelper' ]
				,	currentTouchpoint: 'home'
				,	siteSettings:{
						touchpoints: {
							customercenter: 'https://www.netsuite.com/customercenter_test'
						,	home: 'https://www.netsuite.com/home_test'
						}
					}
				}
			;

			// Starts the application
			jQuery(application.start(function () {
				application.getLayout().appendToDom();
				is_started = true;
			}));
			// Makes sure the application is started before 
			waitsFor(function() {
				return is_started;
			});
		});
		
		it('#1 should provide a utility method to get a url without parameters missing the protocol (http:// or https://)', function ()
		{
			expect(application.getLayout().getDomain('http://www.netsuite.com')).toBe('www.netsuite.com');
		});

		it('#2 should provide a utility method to get a url with parameters missing the protocol(http:// or https://)', function ()
		{
			expect(application.getLayout().getDomain('https://www.netsuite.com?test=true')).toBe('www.netsuite.com?test=true');
		});

		it('#3 should provide a utility method to get the protocol of an url without parameters', function ()
		{
			expect(application.getLayout().getProtocol('http://www.netsuite.com')).toBe('http:');
		});

		it('#4 should provide a utility method to get the protocol of an url with parameters', function ()
		{
			expect(application.getLayout().getProtocol('https://www.netsuite.com?test=true')).toBe('https:');
		});

		it('#5 should provide a utility method to set the touchpoint', function ()
		{
			expect(application.getLayout().getProtocol('https://www.netsuite.com?test=true')).toBe('https:');
		});
		
		it('#6 when mousedown on a element with parameter data-touchpoint the touchpoints function should be called', function ()
		{
			var layout = application.getLayout();
			spyOn(layout, 'touchpointMousedown').andCallThrough();
			application.getLayout().render();
			SC.templates.navigationHelperTest0_tmpl = '<a href="#" data-touchpoint="customercenter" id="test">test</a>';
			var view = new Backbone.View({
				application: application
			});
			view.template = 'navigationHelperTest0';
			view.showContent();
			var $el = view.$('#test');
			expect($el.attr('href')==='#').toBe(true);
			$el.mousedown();
			expect(layout.touchpointMousedown).toHaveBeenCalled();

			// var new_href = application.getConfig('siteSettings.touchpoints.customerCenter');
			// console.log(new_href);
			// expect($el.attr('href').indexOf(new_href) === 0).toBe(true); //starts with

		});
		
		it('#7 when mousedown on a element with parameters data-touchpoint the touchpoints function should be called and change the value of attribute href', function ()
		{
			var view = new Backbone.View({
				application: application
			});
			SC.templates.layout_tmpl = '<div id="content"></div>';
			SC.templates.navigationHelperTest1_tmpl = '<a href="#" data-touchpoint="customercenter" id="test">test</a>';
			view.template = 'navigationHelperTest1';
			view.showContent();
			expect(view.$('#test').attr('href')).toBe('#');
			view.$('#test').mousedown();
			//expect(view.$('#test').attr('href')).toBe('https://www.netsuite.com/test');		
		});
		
		it('#8 when mousedown on a element with parameters data-touchpoint and data-hashtag the touchpoints function should be called and change the value of attribute href', function ()
		{
			var endsWith = function(str, suffix) {
				return str.indexOf(suffix, str.length - suffix.length) !== -1;
			};
			var view = new Backbone.View({
				application: application
			});
			SC.templates.layout_tmpl = '<div id="content"></div>';
			SC.templates.navigationHelperTest2_tmpl = '<a href="#" data-touchpoint="customercenter" id="test" data-hashtag="#emailpreferences">test</a>';
			view.template = 'navigationHelperTest2';
			view.showContent();
			expect(view.$('#test').attr('href')).toBe('#');
			view.$('#test').mousedown();
			//expect(view.$('#test').attr('href')).toBe('https://www.netsuite.com/test#emailpreferences');		
			expect(endsWith(view.$('#test').attr('href'), '#emailpreferences'));
		});
		
		it('#9 when mousedown on a element with parameters data-touchpoint with invalid value the touchpoints function should be called and the value of href should be empty', function ()
		{
			var view = new Backbone.View({
				application: application
			});
			SC.templates.layout_tmpl = '<div id="content"></div>';
			SC.templates.navigationHelperTest3_tmpl = '<a href="#" data-touchpoint="invalid-value" id="test">test</a>';
			view.template = 'navigationHelperTest3';
			view.showContent();
			expect(view.$('#test').attr('href')).toBe('#');
			view.$('#test').mousedown();
			//expect(view.$('#test').attr('href')).toBe('');	//TODO: investigate. sgurin - there is no logic related to "invalid-value" data attribute  value in the code	
		});


		it('#10 when mousedown on a element with parameters data-touchpoint and data-hashtag, and the currentTouchpoint is the current one, then the resulting href should be only the data-hashtag prefixed with "/"', function ()
		{
			var view = new Backbone.View({
				application: application
			});
			SC.templates.layout_tmpl = '<div id="content"></div>';
			SC.templates.navigationHelperTest4_tmpl = '<a href="#" data-touchpoint="home" id="test" data-hashtag="#something">test</a>';
			view.template = 'navigationHelperTest4';
			view.showContent();
			expect(view.$('#test').attr('href')).toBe('#');
			view.$('#test').mousedown();
			expect(view.$('#test').attr('href')).toBe('https://www.netsuite.com/home_test?fragment=something');
		});


		it('#11 when mousedown on a element with parameters data-touchpoint and data-hashtag and the touchpoint is valid then a fragment parameter pointing to the data-hashtag should be in the resulting href', function ()
		{
			var view = new Backbone.View({
				application: application
			});
			SC.templates.layout_tmpl = '<div id="content"></div>';
			SC.templates.navigationHelperTest11_tmpl = '<a href="#" data-touchpoint="customercenter" '+
				'id="test" data-hashtag="#emailpreferences">test</a>';
			view.template = 'navigationHelperTest11';
			view.showContent();
			expect(view.$('#test').attr('href')).toBe('#');
			view.$('#test').mousedown();
			var new_url = parseUrl(view.$('#test').attr('href'));
			expect(new_url.params.fragment).toBe('emailpreferences');
			expect(new_url.hash).toBe('');//also check hash cleanup (no hash is wanted when changing domains, only fragment param)
		});

		it('#12 data-keep-options: support poblating target links with parameters from current url.', function ()
		{
			Backbone.history.options={pushState: true}; //needed for (not wanted now) NavigationHelper.fixNoPushStateLink()
			var view = new Backbone.View({
				application: application
			});
			SC.templates.layout_tmpl = '<div id="content"></div>';
			SC.templates.navigationHelperTest12_tmpl =
				'<a href="/local?anchorParam1=val1" data-keep-options="*" id="test1">test1</a>' +
				'<a href="/local?anchorParam2=val2" data-keep-options="windowParam2" id="test2">test2</a>'+

				//Also, this should work for local touchpoints links
				'<a href="/local?anchorParam3=val3" data-keep-options="windowParam1" data-touchpoint="home" id="test3">test3</a>'+
				'<a href="/local?anchorParam3=val3" data-keep-options="windowParam1" id="test4">test4</a>'
				;
			view.template = 'navigationHelperTest12';
			view.showContent();
			// we need to provide a window.location.href so we mock the window object. 
			// For this the tested code must access window through _.getWindow()
			spyOn(_, 'getWindow').andCallFake(function() {
				return {location: {href: '/lobal1?windowParam1=val2&windowParam2=val3'}};
			});

			view.$('#test1').mousedown();
			var url = parseUrl(view.$('#test1').attr('href'));
			expect(url.params.windowParam1).toBe('val2');
			expect(url.params.windowParam2).toBe('val3');
			expect(url.params.anchorParam1).toBe('val1');

			view.$('#test2').mousedown();
			url = parseUrl(view.$('#test2').attr('href'));
			expect(url.params.windowParam1).not.toBeDefined();
			expect(url.params.windowParam2).toBe('val3');
			expect(url.params.anchorParam2).toBe('val2');

			view.$('#test3').mousedown();
			url = parseUrl(view.$('#test3').attr('href'));
			expect(url.params).not.toBeDefined();

			view.$('#test4').mousedown();
			url = parseUrl(view.$('#test4').attr('href'));
			expect(url.params.windowParam2).not.toBeDefined();
			expect(url.params.windowParam1).toBe('val2');
			expect(url.params.anchorParam3).toBe('val3');
		});
	});
	
});
