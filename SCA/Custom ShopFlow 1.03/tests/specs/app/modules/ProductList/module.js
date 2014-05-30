/*jshint  laxcomma:true*/

// Testing ProductList models
define(['ProductListDetails.View', 'ProductList', 'ProductList.Collection', 'ItemDetails.Model', 'Application',  'jasmineTypeCheck'], 
	function (ProductListDetailsView, ProductList, ProductListCollection, ItemDetailsModel)
{
	'use strict';

	describe('ProductList module', function ()
	{
		var application
		,	PRODUCT_LISTS_MOCK = [{"internalid":"131","name":"Empty List","description":"","owner":{"id":"13","name":"6 Sebastián Demetrio Gurin"},"scope":{"id":"2","name":"private"},"type":{"id":"1","name":"default"},"created":"2/10/2014 9:50 am","lastmodified":"2/10/2014 9:50 am","items":[]},{"internalid":"155","name":"Two Items List","description":"","owner":{"id":"13","name":"6 Sebastián Demetrio Gurin"},"scope":{"id":"2","name":"private"},"type":{"id":"1","name":"default"},"created":"2/11/2014 12:20 pm","lastmodified":"2/11/2014 12:20 pm","items":[{"internalid":"228","description":"","options":{},"quantity":1,"created":"2/12/2014 12:02 pm","lastmodified":"2/12/2014 12:02 pm","item":{"ispurchasable":true,"featureddescription":"","showoutofstockmessage":false,"correlateditems_detail":null,"location":null,"metataghtml":"","stockdescription":"","itemid":"Bici-R","onlinecustomerprice":null,"relateditemdescription2":null,"outofstockbehavior":null,"storedisplayname2":"","internalid":46,"itemimages_detail":{},"isdonationitem":false,"pricelevel_formatted":null,"pagetitle":"","onlinecustomerprice_detail":{"onlinecustomerprice_formatted":"","onlinecustomerprice":""},"itemtype":"InvtPart","storedetaileddescription":"","outofstockmessage":"","searchkeywords":"","storeitemtemplate":null,"pricelevel":null,"isonline":true,"itemoptions_detail":{"parentid":44,"matrixtype":"child"},"storedescription":"","isinactive":false,"quantityavailable":0,"relateditems_detail":null,"matrixchilditems_detail":null,"pagetitle2":"","urlcomponent":"","displayname":"Bici","matrix_parent":{"ispurchasable":true,"featureddescription":"","showoutofstockmessage":false,"correlateditems_detail":[{"internalid":26}],"location":null,"metataghtml":"","stockdescription":"","itemid":"Bici","onlinecustomerprice":null,"relateditemdescription2":null,"outofstockbehavior":"- Default -","storedisplayname2":"Bici","internalid":44,"itemimages_detail":{},"isdonationitem":false,"pricelevel_formatted":null,"pagetitle":"","onlinecustomerprice_detail":{"onlinecustomerprice_formatted":"","onlinecustomerprice":""},"itemtype":"InvtPart","storedetaileddescription":"","outofstockmessage":"","searchkeywords":"","storeitemtemplate":null,"pricelevel":null,"isonline":true,"itemoptions_detail":{"matrixtype":"parent","fields":[{"values":[{"label":"- Select -"},{"label":"Azul","internalid":"1"},{"label":"Rojo","internalid":"2"},{"label":"Verde","internalid":"3"}],"ismatrixdimension":true,"ismandatory":true,"label":"Color","internalid":"custcol3","type":"select","sourcefrom":"custitem3"}]},"storedescription":"","isinactive":false,"quantityavailable":0,"relateditems_detail":[],"matrixchilditems_detail":[{"ispurchasable":true,"onlinecustomerprice_detail":{"onlinecustomerprice_formatted":"","onlinecustomerprice":""},"isbackorderable":true,"outofstockmessage":"","showoutofstockmessage":false,"custitem3":"Rojo","stockdescription":"","internalid":46,"quantityavailable":0,"isinstock":false},{"ispurchasable":true,"onlinecustomerprice_detail":{"onlinecustomerprice_formatted":"","onlinecustomerprice":""},"isbackorderable":true,"outofstockmessage":"","showoutofstockmessage":false,"custitem3":"Verde","stockdescription":"","internalid":47,"quantityavailable":0,"isinstock":false},{"ispurchasable":true,"onlinecustomerprice_detail":{"onlinecustomerprice_formatted":"","onlinecustomerprice":""},"isbackorderable":true,"outofstockmessage":"","showoutofstockmessage":false,"custitem3":"Azul","stockdescription":"","internalid":45,"quantityavailable":0,"isinstock":false}],"pagetitle2":"Bici","urlcomponent":"Bici","displayname":"Bici"}},"priority":{"id":"2","name":"medium"}},{"internalid":"235","description":"","options":{"custcol4":"teste","custcol5":"testgw"},"quantity":1,"created":"2/13/2014 4:11 am","lastmodified":"2/13/2014 4:11 am","item":{"ispurchasable":true,"featureddescription":"<font face=\"Tahoma, Geneva, sans-serif\"><span style=\"font-size: 11px;\">Stuhrling Original Men's 564.02</span></font><div style=\"font-family: Tahoma, Geneva, sans-serif; font-size: 8pt;\"></div>","showoutofstockmessage":false,"correlateditems_detail":[],"location":null,"metataghtml":"","stockdescription":"","itemid":"Stuhrling Original Men's 564.02","onlinecustomerprice":222,"relateditemdescription2":null,"outofstockbehavior":"- Default -","storedisplayname2":"Stuhrling Original Men's 564.02","internalid":49,"itemimages_detail":{"media_1":{"url":"https://checkout.netsuite.com/c.3690872/site/imgs/Stuhrling123_media_1.jpg","altimagetext":""},"media_2":{"url":"https://checkout.netsuite.com/c.3690872/site/imgs/Stuhrling123_media_2.jpg","altimagetext":""}},"isdonationitem":false,"pricelevel_formatted":null,"pagetitle":"Stuhrling Original Men's 564.02","onlinecustomerprice_detail":{"onlinecustomerprice_formatted":"$222.00","onlinecustomerprice":222},"itemtype":"InvtPart","storedetaileddescription":"<font face=\"Tahoma, Geneva, sans-serif\"><span style=\"font-size: 11px;\">Stuhrling Original Men's 564.02</span></font><div style=\"font-family: Tahoma, Geneva, sans-serif; font-size: 8pt;\"></div>","storeitemtemplate":"Basic : Clean Lines PRODUCTS (item list)","outofstockmessage":"","searchkeywords":"","isonline":true,"pricelevel":null,"itemoptions_detail":{"fields":[{"label":"Engraved Name","internalid":"custcol4","type":"text"},{"label":"Gift Wrapped","internalid":"custcol5","type":"text"}]},"storedescription":"<font face=\"Tahoma, Geneva, sans-serif\"><span style=\"font-size: 11px;\">Stuhrling Original Men's 564.02</span></font><div style=\"font-family: Tahoma, Geneva, sans-serif; font-size: 8pt;\"></div>","isinactive":false,"quantityavailable":0,"relateditems_detail":[],"matrixchilditems_detail":null,"pagetitle2":"Stuhrling Original Men's 564.02","urlcomponent":"","displayname":"Stuhrling Original Men's 564.02"},"priority":{"id":"2","name":"medium"}}]}]
		,	EMPTY_LIST_INTERNALID = '131'
		,	FILLED_LIST_INTERNALID = '155'
		,	is_started = false
		,	spy1 = null
		,	collection = new ProductListCollection(PRODUCT_LISTS_MOCK);

		beforeEach(function ()
		{
			is_started = false;
			SC.templates.layout_tmpl = '<div id="content"></div></div>';
			jQuery('body').append('<div id="main"></div>'); 

			// Here is the appliaction we will be using for this tests			
			application = SC.Application('ProductListDetailsView');
			// This is the configuration needed by the modules in order to run
			application.Configuration = {
				modules: ['ProductList']
			,	product_lists: {
					itemsDisplayOptions: []
				}
			};
			// Starts the application and wait until it is started
			jQuery(application.start(function () 
			{ 
				//now that the app started, configure a custom control placeholder. 
				application.ProductListModule.placeholder.control = "#mycontrol1"; 
				application.ProductListModule.renderControl = spyOn(application.ProductListModule, 'renderControl').andCallThrough();
				application.getLayout().appendToDom();
				is_started = true; 
			}));

			waitsFor(function() 
			{
				return is_started; 
			});

		});

		it('should install accessible API', function()
		{
			expect(application.getProductLists).toBeA(Function);
		});

		it('control should attach to an existing placeholder on afterAppendView', function ()
		{
			//append a view with the custom placeholder placeholder
			var view = new Backbone.View({
				application: application
			});
			SC.templates.view1_tmpl = '<div id="mycontrol1"></div>';
			view.template = 'view1';
			view.showContent();
			// jQuery('body').append(view.$el); 
			expect(jQuery(application.ProductListModule.placeholder.control).size() > 0).toBe(true);
			expect(application.ProductListModule.renderControl).toHaveBeenCalled(); 
		});

	});
});