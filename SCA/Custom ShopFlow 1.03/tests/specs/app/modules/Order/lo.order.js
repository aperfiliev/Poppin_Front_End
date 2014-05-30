/*global SC:false, spyOn: false, _:false, it:false, describe:false, define:false, expect:false, Backbone:false, beforeEach:false, jQuery:false, waitsFor:false */
/*jshint evil:true, forin:true, noarg:true, noempty:true, eqeqeq:true, bitwise:false, strict:true, undef:true, unused:true, curly:true, browser:true, quotmark:single, maxerr:50, laxcomma:true, expr:true*/

// lo.order.js
// --------------------
// Testing LiveOrder.Model module.
define(['LiveOrder.Model', 'ItemDetails.Model', 'ApplicationSkeleton', 'Main', 'jasmineTypeCheck', 
	'underscore', 'jQuery'], function (LiveOrderModel, ItemDetailsModel)
{
	'use strict';

	var MOCK_LINE_GET1 = {'summary':{'total':672,'taxtotal':0,'taxondiscount':0,'discountrate_formatted':'','subtotal_formatted':'$672.00','discounttotal':0,'tax2total_formatted':'$0.00','discountrate':'','shippingcost_formatted':'$0.00','taxonshipping':0,'discountedsubtotal_formatted':'$672.00','handlingcost':0,'tax2total':0,'giftcertapplied_formatted':'($0.00)','taxonshipping_formatted':'$0.00','shippingcost':0,'taxtotal_formatted':'$0.00','giftcertapplied':0,'discountedsubtotal':672,'taxonhandling':0,'discounttotal_formatted':'($0.00)','handlingcost_formatted':'$0.00','subtotal':672,'taxondiscount_formatted':'$0.00','estimatedshipping_formatted':'$0.00','total_formatted':'$672.00','taxonhandling_formatted':'$0.00','estimatedshipping':0},'lines':[{'internalid':'item27set609','quantity':2,'rate':336,'amount':672,'tax_amount':0,'tax_rate':null,'tax_code':null,'discount':0,'total':672,'item':{'ispurchasable':true,'custitem_ns_pr_attributes_rating':'','featureddescription':'','correlateditems_detail':[],'location':null,'metataghtml':'','stockdescription':'','itemid':'Robot juntapuchos','onlinecustomerprice':336,'relateditemdescription2':null,'storedisplayimage':'','outofstockbehavior':'Allow back orders but display out-of-stock message','storedisplayname2':'Robot juntapuchos','internalid':27,'itemimages_detail':{},'isdonationitem':false,'pricelevel_formatted':null,'pagetitle':'','onlinecustomerprice_detail':{'onlinecustomerprice_formatted':'$336.00','onlinecustomerprice':336},'itemtype':'InvtPart','custitem_ns_pr_count':null,'storedetaileddescription':'','outofstockmessage':'','storeitemtemplate':null,'searchkeywords':'','isonline':true,'pricelevel':null,'itemoptions_detail':{},'storedescription':'','isinactive':false,'quantityavailable':0,'relateditems_detail':[],'matrixchilditems_detail':null,'pagetitle2':'Robot juntapuchos','custitem_ns_pr_rating':null,'urlcomponent':'robotjuntapuchos1','custitem_ns_pr_rating_by_rate':'','custitem_ns_pr_item_attributes':'&nbsp;','displayname':'Robot juntapuchos'},'options':null,'shipaddress':null,'rate_formatted':'$336.00','amount_formatted':'$672.00','tax_amount_formatted':'$0.00','discount_formatted':'$0.00','total_formatted':'$672.00'}],'lines_sort':['item27set609','item27set609'],'latest_addition':'item27set609','promocode':null,'shipmethods':[{'internalid':'4','name':'Barco1','shipcarrier':'nonups','rate':4,'rate_formatted':'$4.00'}],'shipmethod':null,'paymentmethods':[],'isPaypalComplete':false,'agreetermcondition':false,'shipaddress':null,'billaddress':null,'addresses':[],'touchpoints':{'register':'https://checkout.netsuite.com/c.3690872/checkout/login.ssp?n=3&sc=1&login=T&reset=T&newcust=T&ck=rBQ6lS2-AZT7c0w6&vid=rBQ6lZG-ASGMg1WM&cktime=114223&cart=1398&addrcountry=US&gc=clear&_od=ZGV2MTAuYmVjY28udXk*','home':'http://dev10.becco.uy','logout':'https://checkout.netsuite.com/c.3690872/ShopFlow/logOut.ssp?n=3&sc=17&logoff=T&ckabandon=rBQ6lS2-AZT7c0w6&ck=rBQ6lS2-AZT7c0w6&vid=rBQ6lZG-ASGMg1WM&cktime=114223&cart=1398&addrcountry=US&gc=clear&_od=ZGV2MTAuYmVjY28udXk*','viewcart':'/ShopFlow/goToCart.ssp','continueshopping':'/','serversync':'https://checkout.netsuite.com/app/site/backend/syncidentity.nl?c=3690872&n=3&ck=rBQ6lS2-AZT7c0w6&vid=rBQ6lZG-ASGMg1WM&cktime=114223&chrole=17','login':'https://checkout.netsuite.com/c.3690872/checkout/login.ssp?n=3&sc=1&login=T&ck=rBQ6lS2-AZT7c0w6&vid=rBQ6lZG-ASGMg1WM&cktime=114223&cart=1398&addrcountry=US&gc=clear&_od=ZGV2MTAuYmVjY28udXk*','welcome':'/s.nl?sc=15','checkout':'https://checkout.netsuite.com/c.3690872/checkout/index.ssp?n=3&sc=17&ck=rBQ6lS2-AZT7c0w6&vid=rBQ6lZG-ASGMg1WM&cktime=114223&cart=1398&addrcountry=US&gc=clear&_od=ZGV2MTAuYmVjY28udXk*','customercenter':'https://checkout.netsuite.com/c.3690872/MyAccount/index.ssp?n=3&sc=6&ck=rBQ6lS2-AZT7c0w6&vid=rBQ6lZG-ASGMg1WM&cktime=114223&cart=1398&addrcountry=US&gc=clear&_od=ZGV2MTAuYmVjY28udXk*'}}; 
	
	var MOCK_ITEM_GET1 = {'ispurchasable':true,'custitem_ns_pr_attributes_rating':'','featureddescription':'','correlateditems_detail':[],'metataghtml':'','stockdescription':'','itemid':'Calefón Rojo','onlinecustomerprice':34.0,'storedisplayimage':'http://dev10.becco.uy/Capture.png','outofstockbehavior':'Allow back orders but display out-of-stock message','storedisplayname2':'Calefón Rojo','internalid':26,'itemimages_detail':{},'isdonationitem':true,'pagetitle':'calefón','onlinecustomerprice_detail':{'onlinecustomerprice_formatted':'$34.00','showdefaultvariableprice':true,'onlinecustomerprice':34.0},'itemtype':'InvtPart','storedetaileddescription':'','searchkeywords':'','storeitemtemplate':'Basic : Clean Lines PRODUCTS (item list)','outofstockmessage':'no hay massss','isonline':true,'itemoptions_detail':{},'storedescription':'','isinactive':false,'quantityavailable':0.0,'relateditems_detail':[],'pagetitle2':'calefón','urlcomponent':'','custitem_ns_pr_rating_by_rate':'','displayname':'Calefón Rojo','custitem_ns_pr_item_attributes':'&nbsp;'}; 

	String.prototype.endsWith = function(suffix) {
		return this.indexOf(suffix, this.length - suffix.length) !== -1;
	};

	describe('Live Order Model', function () {
		
		var is_started = false
		,	application
		,	model;

		// AjaxSpyManager: helper class for doing multiple spying on jQuery.ajax. Using this we can install several jquery.ajax mock listeners in the same it()
		// TODO: put this abstract class in separated file
		var AjaxSpyManager = function(){
			this.listeners = [];
			this.requestHistory = [];
		}; 
		_.extend(AjaxSpyManager.prototype, {
			_handler: function(){
				var self = this, args = arguments;
				this.requestHistory.push(arguments[0]); 
				_(this.listeners).each(function(l){
					l.apply(self, args); 
				}); 
			}
		,	getLastRequest: function(){
				return this.requestHistory.length > 0 ? this.requestHistory[this.requestHistory.length-1] : null; 
			}
		,	add: function(listener) {				
				if(!this.spy) { // we install the jQuery.ajax() spy here because spyOn only can be called form inside an it()
					this.spy = spyOn(jQuery, 'ajax').andCallFake( _(this._handler).bind(this) ); 
				}
				this.listeners.push(listener); 
			}
		,	set: function(listener) {
				this.listeners = []; 
				this.add(listener); 
			}
		,	remove: function(listener) {
				this.listeners = _.filter(this.listeners, function(l){return l !== listener; }); 
			}
		,	reset: function(){
				this.requestHistory=[];
				this.spy=null;
			}
		}); 

		var ajaxSpyManager = new AjaxSpyManager();

		var ajaxMockResponses = {
			get1: function(options) {
				options.success(MOCK_LINE_GET1);
			}
		,	post1: function(options) {
				options.success(options.data);
			}
		,	delete1: function(options) {
				options.success(MOCK_LINE_GET1);
			}			
		,	put1: function(options) {
				options.success(options.data);
			}
		};

		beforeEach(function ()
		{			
			ajaxSpyManager.reset(); 
			model = new LiveOrderModel(MOCK_LINE_GET1);

			if (!is_started)
			{
				// Here is the appliaction we will be using for this tests
				application = SC.Application('LiveOrderModelTest1');
				// This is the configuration needed by the modules in order to run
				application.Configuration =  {
					siteSettings: {touchpoints: {}}
				,	modules: [ 
						'ItemsKeyMapping' //needed for poblating the keyMapping property on mountToApp()
					,	'ItemDetails' 
					]	
				};				
				// Starts the application and wait until is ready
				jQuery(application.start(function () {	is_started = true; }));
				waitsFor(function() { return is_started; });
			}
		});
		
		it('#backbone - is a basic Backbone Model', function() {
			
			spyOn(ajaxMockResponses, 'get1').andCallThrough(); 
			spyOn(ajaxMockResponses, 'post1').andCallThrough(); 
			spyOn(ajaxMockResponses, 'delete1').andCallThrough(); 

			expect(model).toBeA(Backbone.Model);
			expect(model.isValid()).toBe(true); 
			expect(model.get('summary').discountedsubtotal).toBe(672);
			expect(model.get('lines').length).toBe(1);
			expect(model.get('lines').at(0).get('item').get('displayname')).toBe('Robot juntapuchos'); 

			ajaxSpyManager.set(ajaxMockResponses.get1);	// will trigger spyOn(jQuery, 'ajax').andCallFake(...);
			
			model = new LiveOrderModel();
			expect(model.isNew()).toBe(true); 

			//fetch
			expect(model.get('lines').length).toBe(0); 
			model.fetch();
			expect(ajaxSpyManager.getLastRequest().type).toBe('GET');
			expect(ajaxMockResponses.get1).toHaveBeenCalled();
			expect(model.get('lines').length).toBe(1);

			//save
			model.set('isPaypalComplete', true); //change a property
			ajaxSpyManager.set(ajaxMockResponses.post1);//now we will save() our model, so we change the mock response
			model.save();
			expect(ajaxSpyManager.getLastRequest().type).toBe('POST'); 
			expect(eval('('+ajaxSpyManager.getLastRequest().data+')').isPaypalComplete).toBe(true);

			//save again should trigger PUT and for this we need !isNew()
			model.set('isPaypalComplete', false);
			model.id=1;
			expect(model.isNew()).toBe(false); 
			ajaxSpyManager.set(ajaxMockResponses.put1);
			model.save();
			expect(ajaxSpyManager.getLastRequest().type).toBe('PUT'); 
			expect(eval('('+ajaxSpyManager.getLastRequest().data+')').isPaypalComplete).toBe(false);

			//destroy			
			ajaxSpyManager.set(ajaxMockResponses.delete1);
			model.destroy();
			expect(ajaxSpyManager.getLastRequest().type).toBe('DELETE');
		});

		it('#methods1 - Should know how to respond to messages getTotalItemCount, toJSON(), getLatestAddition()', function() {
			expect(model.getLatestAddition().get('internalid')).toBe('item27set609'); 
			expect(model.toJSON()).toBeA(Object); 
			expect(model.toJSON().summary).toBeA(Object); 
			expect(model.toJSON().summary.discountedsubtotal_formatted).toBe('$672.00'); 
			expect(model.toJSON().lines.length).toBe(1); 
			expect(model.getTotalItemCount()).toBe(2); 
		});		

		it('#touchpoints- Should update global touchpoints when changed', function() {
			expect(model).toBeA(Backbone.Model); 
			var newTouchpoints = {'t1': 'foo'}; 
			model.set('touchpoints', newTouchpoints); 
			if (SC.ENVIRONMENT && SC.ENVIRONMENT.siteSettings && SC.ENVIRONMENT.siteSettings.touchpoints) 
			{
				expect(SC.ENVIRONMENT.siteSettings.touchpoints).toBe(newTouchpoints); 
			}
			expect(application.getConfig('siteSettings').touchpoints).toBe(newTouchpoints); 
		});

		it('#addItems - should let the user to add items', function() {
			
			spyOn(ajaxMockResponses, 'post1').andCallThrough(); 
			ajaxSpyManager.set(ajaxMockResponses.post1);

			var item1 = new ItemDetailsModel(MOCK_ITEM_GET1);
			
			model.addItem(item1);
			expect(ajaxSpyManager.getLastRequest().type).toBe('POST'); 
			expect(ajaxSpyManager.getLastRequest().url.endsWith('services/live-order-line.ss')).toBe(true); 
			var sendedData = eval('('+ajaxSpyManager.getLastRequest().data+')');
			expect(sendedData).toBeA(Array); 
			expect(sendedData[0].item.internalid).toBe(26); 

		});

		it('#updateItem - support updating an item in a line', function() {
			
			spyOn(ajaxMockResponses, 'put1').andCallThrough(); 
			ajaxSpyManager.set(ajaxMockResponses.put1);	

			var item1 = new ItemDetailsModel(MOCK_ITEM_GET1);
			model.get('lines').at(0).set('id', 'item27set609'); //we need to mark the line as not new so it can be found by id.
			item1.set('quantity', 5); 

			model.updateItem('item27set609', item1); 

			expect(ajaxSpyManager.getLastRequest().type).toBe('PUT'); 
			expect(ajaxSpyManager.getLastRequest().url.endsWith('services/live-order-line.ss/item27set609')).toBe(true); 
			var sendedData = eval('('+ajaxSpyManager.getLastRequest().data+')');
			expect(sendedData).toBeA(Object); 
			expect(sendedData.item.internalid).toBe(27); 
			expect(sendedData.quantity).toBe(5); 

		});

		it('#removeLine - support removing lines', function() {
			spyOn(ajaxMockResponses, 'get1').andCallThrough(); 
			ajaxSpyManager.set(ajaxMockResponses.get1);	

			model.get('lines').at(0).set('id', 'item27set609'); //we need to mark the line as not new so it can be found by id.
		
			model.removeLine(model.get('lines').get('item27set609')); 
			expect(ajaxSpyManager.getLastRequest().type).toBe('DELETE'); 
			expect(ajaxSpyManager.getLastRequest().url.endsWith('services/live-order-line.ss/item27set609')).toBe(true); 
		
		});

	});

});
