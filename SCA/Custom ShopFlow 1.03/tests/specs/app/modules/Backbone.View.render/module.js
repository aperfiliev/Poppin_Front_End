/*global SC:false, it:false, Backbone: false, describe:false, expect:false, define: false, beforeEach:false, jQuery:false, waitsFor:false */
/*jshint forin:true, noarg:true, noempty:true, eqeqeq:true, bitwise:false, strict:true, undef:true, unused:true, curly:true, browser:true, quotmark:single, maxerr:50, laxcomma:true, expr:true*/

// Backbone.View.render.js
// --------------------
// Testing the apply permissions for the extended view.
define(['Application'], function ()
{
	'use strict';
	
	describe('Module: Backbone.View.render', function () 
	{
		var is_started = false
		,	application
		,	i=1;

		// initial setup required for this test: we will be working with views.
		SC.templates={'layout_tmpl': '<div id="layout"><div id="content"></div></div>'}; 
		SC.compileMacros(SC.templates.macros);

		
		beforeEach(function ()
		{
			// Here is the appliaction we will be using for this tests
			application = SC.Application('BackboneViewRenderTest');
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

		var createAndShowView = function(tmpl){
			var view = new Backbone.View({
				application: application
			});
			//Templates index needs to be changed so the template is not cached.
			SC.templates[++i+'test_tmpl'] = tmpl;
			view.template = i+'test';
			view.showContent();
			return view;
		};

		it('#'+i+++' Empty data-permissions attribute should take no effect in the template',function(){

			var view = createAndShowView(
				'<div id="testingDiv" data-permissions="">testing div</div>'
			);			
			expect(view.$('#testingDiv').length).toBe(1);
		});

		it('#'+i+++' Nonsense data-permissions attribute should take no effect in the template',function(){

			var view = createAndShowView(
				'<div id="testingDiv" data-permissions="blah."·%"·%... , 2341234,,!$·%!    1245, ">testing div</div>'
			);			
			expect(view.$('#testingDiv').length).toBe(1);
		});

		it('#'+i+++' Application of non existing permissions should not modify the template',function(){

			var view = createAndShowView(
				'<div id="testingDiv" data-permissions="whatever blah    , transactions.nonexisting.1,' +
				'transactions.nonexisting.2">testing div</div>'
			);			
			expect(view.$('#testingDiv').length).toBe(1);
		});

		it('#'+i+++' Removal of root node of the template by having non complying permissions',function(){

			var view = createAndShowView(
				'<div id="testingDiv" data-permissions="transactions.tranFind.1' +
				' transactions.nonexisting.1,transactions.nonexisting.whaaaat">testing div</div>'
			);			
			expect(view.$('#testingDiv').length).toBe(0);
		});
		
		it('#'+i+++' Removal of a variety of elements and permission levels',function(){

			var view = createAndShowView(

				'<div id="topDiv">' +
					'<div id="div1" data-permissions="transactions.tranFind.0">test</div>' +
					'<div id="div2" data-permissions="transactions.tranFind.1">test</div>' +
					'<div id="div3" data-permissions="transactions.tranFind.2">test</div>' +
					'<div id="div4" data-permissions="transactions.tranFind.3">test</div>' +
					'<div id="div5" data-permissions="transactions.tranFind.4">test</div>' +
					'<div id="div6" data-permissions="transactions.tranFind.5">test</div>' +

					'<div id="div7" data-permissions="transactions.tranCashSale.0">test</div>' +
					'<div id="div8" data-permissions="transactions.tranCashSale.1">test</div>' +
					'<div id="div9" data-permissions="transactions.tranCashSale.2">test</div>' +
					'<div id="div10" data-permissions="transactions.tranCashSale.3">test</div>' +
					'<div id="div11" data-permissions="transactions.tranCashSale.4">test</div>' +
					'<div id="div12" data-permissions="transactions.tranCashSale.5">test</div>' +

					'<div id="div13" data-permissions="transactions.tranCustCred.0">test</div>' +
					'<div id="div14" data-permissions="transactions.tranCustCred.1">test</div>' +
					'<div id="div15" data-permissions="transactions.tranCustCred.2">test</div>' +
					'<div id="div16" data-permissions="transactions.tranCustCred.3">test</div>' +
					'<div id="div17" data-permissions="transactions.tranCustCred.4">test</div>' +
					'<div id="div18" data-permissions="transactions.tranCustCred.5">test</div>' +

					'<div id="div19" data-permissions="transactions.tranCustDep.0">test</div>' +
					'<div id="div20" data-permissions="transactions.tranCustDep.1">test</div>' +
					'<div id="div21" data-permissions="transactions.tranCustDep.2">test</div>' +
					'<div id="div22" data-permissions="transactions.tranCustDep.3">test</div>' +
					'<div id="div23" data-permissions="transactions.tranCustDep.4">test</div>' +
					'<div id="div24" data-permissions="transactions.tranCustDep.5">test</div>' +

					'<div id="div25" data-permissions="transactions.tranCustPymt.0">test</div>' +
					'<div id="div26" data-permissions="transactions.tranCustPymt.1">test</div>' +
					'<div id="div27" data-permissions="transactions.tranCustPymt.2">test</div>' +
					'<div id="div28" data-permissions="transactions.tranCustPymt.3">test</div>' +
					'<div id="div29" data-permissions="transactions.tranCustPymt.4">test</div>' +
					'<div id="div30" data-permissions="transactions.tranCustPymt.5">test</div>' +

					'<div id="div31" data-permissions="transactions.tranStatement.0">test</div>' +
					'<div id="div32" data-permissions="transactions.tranStatement.1">test</div>' +
					'<div id="div33" data-permissions="transactions.tranStatement.2">test</div>' +
					'<div id="div34" data-permissions="transactions.tranStatement.3">test</div>' +
					'<div id="div35" data-permissions="transactions.tranStatement.4">test</div>' +
					'<div id="div36" data-permissions="transactions.tranStatement.5">test</div>' +

					'<div id="div37" data-permissions="transactions.tranCashSale.0,transactions.tranCashSale.5">test</div>' +
					'<div id="div38" data-permissions="transactions.tranCashSale.1,transactions.tranCashSale.5">test</div>' +
					'<div id="div39" data-permissions="transactions.tranCashSale.2,transactions.tranCashSale.5">test</div>' +

					'<div id="div40" data-permissions="transactions.tranCashSale.0 transactions.tranCashSale.5">test</div>' +
					'<div id="div41" data-permissions="transactions.tranCashSale.1 transactions.tranCashSale.5">test</div>' +
					'<div id="div42" data-permissions="transactions.tranCashSale.2 transactions.tranCashSale.5">test</div>' +

					'<div id="div43" data-permissions="transactions.tranCashSale.0   ,   transactions.tranCashSale.5">test</div>' +
					'<div id="div44" data-permissions="transactions.tranCashSale.1 , , , transactions.tranCashSale.5">test</div>' +
					'<div id="div45" data-permissions="transactions.tranCashSale.2 -.-.-.-.- transactions.tranCashSale.5">test</div>' +

					'<div id="div46" data-permissions="transactions.tranCashSale.0 , , transactions.nonexisting.0">test</div>' +
					'<div id="div47" data-permissions="transactions.tranCashSale.1 , , transactions.nonexisting.1">test</div>' +
					'<div id="div48" data-permissions="transactions.tranCashSale.2 , , transactions.nonexisting.2">test</div>' +

				'</div>'
			);

			expect(view.$('#topDiv').length).toBe(1);

			expect(view.$('#div1').length).toBe(1);
			expect(view.$('#div2').length).toBe(0);
			expect(view.$('#div3').length).toBe(0);
			expect(view.$('#div4').length).toBe(0);
			expect(view.$('#div5').length).toBe(0);
			expect(view.$('#div6').length).toBe(1);

			expect(view.$('#div7').length).toBe(1);
			expect(view.$('#div8').length).toBe(1);
			expect(view.$('#div9').length).toBe(0);
			expect(view.$('#div10').length).toBe(0);
			expect(view.$('#div11').length).toBe(0);
			expect(view.$('#div12').length).toBe(1);

			expect(view.$('#div13').length).toBe(1);
			expect(view.$('#div14').length).toBe(1);
			expect(view.$('#div15').length).toBe(1);
			expect(view.$('#div16').length).toBe(0);
			expect(view.$('#div17').length).toBe(0);
			expect(view.$('#div18').length).toBe(1);

			expect(view.$('#div19').length).toBe(1);
			expect(view.$('#div20').length).toBe(1);
			expect(view.$('#div21').length).toBe(1);
			expect(view.$('#div22').length).toBe(1);
			expect(view.$('#div23').length).toBe(0);
			expect(view.$('#div24').length).toBe(1);

			expect(view.$('#div25').length).toBe(1);
			expect(view.$('#div26').length).toBe(1);
			expect(view.$('#div27').length).toBe(1);
			expect(view.$('#div28').length).toBe(1);
			expect(view.$('#div29').length).toBe(1);
			expect(view.$('#div30').length).toBe(1);

			expect(view.$('#div31').length).toBe(1);
			expect(view.$('#div32').length).toBe(1);
			expect(view.$('#div33').length).toBe(1);
			expect(view.$('#div34').length).toBe(1);
			expect(view.$('#div35').length).toBe(1);
			expect(view.$('#div36').length).toBe(1);

			expect(view.$('#div37').length).toBe(1);
			expect(view.$('#div38').length).toBe(1);
			expect(view.$('#div39').length).toBe(0);

			expect(view.$('#div40').length).toBe(1);
			expect(view.$('#div41').length).toBe(1);
			expect(view.$('#div42').length).toBe(0);

			expect(view.$('#div43').length).toBe(1);
			expect(view.$('#div44').length).toBe(1);
			expect(view.$('#div45').length).toBe(0);

			expect(view.$('#div46').length).toBe(1);
			expect(view.$('#div47').length).toBe(1);
			expect(view.$('#div48').length).toBe(0);
		});
	});
});