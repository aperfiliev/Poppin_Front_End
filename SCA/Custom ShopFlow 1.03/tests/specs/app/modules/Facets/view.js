/*global SC:false, Backbone:false, it:false, describe:false, require:false, define:false, _:false, expect:false, beforeEach:false, jQuery:false, waitsFor:false */
/*jshint evil:true, forin:true, noarg:true, noempty:true, eqeqeq:true, bitwise:false, strict:true, undef:true, unused:true, curly:true, browser:true, quotmark:single, maxerr:50, laxcomma:true, expr:true*/

// FacetsViews.js
// --------------------
// Testing  Facets.Views module.
define(['Facets', 'UrlHelper', 'Application'], function ()
{
	
	'use strict';
	
	var facets
	,	view_rendered
	,	view;
	
	describe('Module: Facets.Views', function () {
		
		var is_started = false
		,	application;

		// initial setup required for this test: we will be working with views.
		// some of these tests require that some macros are loaded, so we load them all:
		jQuery.ajax({url: '../../../../../templates/Templates.php', async: false}).done(function(data){
			eval(data); 
			SC.compileMacros(SC.templates.macros);
		}); 
		
		beforeEach(function ()
		{
			SC.compileMacros(SC.templates.macros);	
			
			if (!is_started)
			{
				// Here is the appliaction we will be using for this tests
				application = SC.Application('Facets.Views');
				// This is the configuration needed by the modules in order to run

				var bike_color_map = {
					'Black': 'black'
				,	'Blue': 'blue'
				,	'Gray': 'gray'
				,	'Green': 'green'
				,	'Red': 'red'
				,	'Silver Black': '#333'
				,	'Violet': 'violet'
				,	'White': 'white'
				,	'Chrome': '#F5F5F5'
				,	'Silver': 'silver'
				,	'Super Black': { type: 'image', src: 'img/ajax-loader.gif', width: 22, height: 22 }
				};


				application.Configuration = {
					modules: [
						'Facets'
					,	'UrlHelper'
					]
					
				,	macros: {
						facet: 'facetList'
					}
				
				,	facets: [
					{
						id: 'custitem_bike_brands'
					,	name: 'Brand'
					,	max: 10
					,	behavior: 'single'
					,	url: 'brand'
					,	priority: 10
					,	uncollapsible: true
					}
				/*
				,	{
						id: 'category'
					,	name: 'Category'
					,	max: 10
					,	behavior: 'single'
					,	url: ''
					,	macro: 'facetCategories'
					,	priority: 11
					,	uncollapsible: true
					}
				*/
				,	{
						id: 'custitem_bike_type'
					,	name: 'Style'
					,	max: 10
					,	behavior: 'multi'
					,	url: 'style'
					,	priority: 9
					,	uncollapsible: true
					}
				,	{
						id: 'custitem_bike_colors'
					,	name: 'Color'
					,	max: 5
					,	behavior: 'multi'
					,	url: 'color'
					,	macro: 'facetColor'
					,	priority: 8
					,	colors: bike_color_map
					}
				,	{
						id: 'custitem_gt_matrix_colors'
					,	name: 'GT Colors'
					,	max: 5
					,	behavior: 'multi'
					,	url: 'gt-colors'
					,	macro: 'facetColor'
					,	priority: 6
					,	colors: bike_color_map
					}
				,	{
						id: 'custitem_matrix_tire_size'
					,	name: 'Matrix Tire Size'
					,	max: 5
					,	behavior: 'multi'
					,	url: 'mtire'
					,	priority: 2
					}
				,	{
						id: 'custitem_tire_size'
					,	name: 'Tire Size'
					,	max: 5
					,	behavior: 'multi'
					,	url: 'tire'
					,	priority: 2
					}
				,	{
						id: 'pricelevel5'
					,	name: 'Price'
					,	url: 'price'
					,	priority: 0
					,	max: 5
					,	behavior: 'range'
					,	macro: 'facetRange'
					,	step: 50
					,	uncollapsible: true
					,	parser: function (value)
						{
							return _.formatCurrency(value);
						}
					}
				]

				,	defaults: {
						macros: {
							facet: 'facetList'
						}
					}
				,	searchApiMasterOptions: {
						Facets: {
							include: 'facets'
						,	fieldset: 'search'
						}
					,	itemDetails: {
							fieldset: 'details'
						}	
					}
				,	facetDelimiters: {
						betweenFacetNameAndValue: '/'
					,	betweenDifferentFacets: '/'
					,	betweenDifferentFacetsValues: ','
					,	betweenRangeFacetsValues: 'to'
					,	betweenFacetsAndOptions: '?'
					,	betweenOptionNameAndValue: '='
					,	betweenDifferentOptions: '&'
					}

				,	resultsPerPage: [
						{ items: 10, name: '10 Items' }
					,	{ items: 25, name: '25 Items', isDefault: true }
					,	{ items: 50, name: '50 Items' }
					]

				,	itemsDisplayOptions: [
						{ id: 'list', name: 'List', macro: 'itemCellList', columns: 1, icon: 'icon-th-list' }
					,	{ id: 'table', name: 'Table', macro: 'itemCellTable', columns: 2, icon: 'icon-th-large' }
					,	{ id: 'grid', name: 'Grid', macro: 'itemCellGrid', columns: 4, icon: 'icon-th', isDefault: true }
					]
					
				,	sortOptions: [
						{ id: 'relevance:asc', name: 'Relevance', isDefault: true }
					,	{ id: 'pricelevel5:asc', name: 'Price, Low to High' }
					,	{ id: 'pricelevel5:desc', name: 'Price, High to Low ' }
					]
				};
				// Starts the application
				jQuery(application.start(function () { is_started = true; }));
				
				// Makes sure the application is started before 
				waitsFor(function() 
				{
					if (is_started)
					{
						facets = require('Facets');
						_.extend(facets.Translator.prototype, {
							defaultShow: 25,
							defaultOrder: 'custitem_bike_colors'
						});
						
						// Configure some facets

						SC.templates.facetsViewsTest_tmpl  = '<div id="test1" data-type="all-facets" data-exclude-facets=""></div>';
						SC.templates.facetsViewsTest_tmpl += '<div id="test2" data-type="all-facets" data-exclude-facets="custitem_tire_size"></div>';
						SC.templates.facetsViewsTest_tmpl += '<div id="test3" data-type="all-facets" data-exclude-facets="custitem_bike_colors"></div>';
						SC.templates.facetsViewsTest_tmpl += '<div id="test4" data-type="all-facets" data-exclude-facets="custitem_bike_brands"></div>';
						SC.templates.facetsViewsTest_tmpl += '<div id="test5" data-type="all-facets" data-exclude-facets="custitem_bike_colors, custitem_bike_brands"></div>';
						SC.templates.facetsViewsTest_tmpl += '<div id="test6" data-type="all-facets" data-exclude-facets="custitem_tire_size, custitem_bike_colors, custitem_bike_brands"></div>';
						SC.templates.facetsViewsTest_tmpl += '<div id="test7" data-type="facet" data-facet-id="custitem_bike_colors"></div>';
						SC.templates.facetsViewsTest_tmpl += '<div id="test8" data-type="facet" data-facet-id="custitem_bike_brands"></div>';
						SC.templates.facetsViewsTest_tmpl += '<div id="test9" data-type="facet" data-facet-id="custitem_tire_size"></div>';
						var translator = new facets.Helper.parseUrl('');

						view = new facets.Views.Browse({
								model: (new facets.Model()).set({'total':23,'items':[{'onlinecustomerprice_detail':{'onlinecustomerprice_formatted':'$490.00','onlinecustomerprice':490.0},'onlinecustomerprice_formatted':'$490.00','itemoptions_detail':{},'onlinematrixpricerange':'','storedescription':'','custitem_bike_type':'Race','stockdescription':'New','quantityavailable':25.0,'itemid':'gt0001-Silver-Black','onlinecustomerprice':490.0,'storedisplaythumbnail':'gt0001-Silver-Black.jpeg','storedisplayname2':'SPEEDSERIESPROFRAMESILVERBLACK','internalid':476,'displayname':'gt0001-Silver-Black'},{'onlinecustomerprice_detail':{'onlinecustomerprice_formatted':'$490.00','onlinecustomerprice':490.0},'onlinecustomerprice_formatted':'$490.00','itemoptions_detail':{},'onlinematrixpricerange':'','storedescription':'','custitem_bike_type':'Race','stockdescription':'Shipps3-5days','quantityavailable':15.0,'itemid':'gt0001-Blue','onlinecustomerprice':490.0,'storedisplaythumbnail':'gt0001-Blue.jpeg','storedisplayname2':'SPEEDSERIESPROFRAMEBLUE','internalid':475,'displayname':'gt0001-Blue'},{'onlinecustomerprice_detail':{'onlinecustomerprice_formatted':'$330.00','onlinecustomerprice':330.0},'onlinecustomerprice_formatted':'$330.00','itemoptions_detail':{},'onlinematrixpricerange':'','storedescription':'','custitem_bike_type':'Street','stockdescription':'Refurbished','quantityavailable':0.0,'itemid':'gt0020','onlinecustomerprice':330.0,'storedisplaythumbnail':'gt0020.jpeg','storedisplayname2':'ZONE','internalid':494,'displayname':'gt0020'},{'onlinecustomerprice_detail':{'onlinecustomerprice_formatted':'$380.00','onlinecustomerprice':380.0},'onlinecustomerprice_formatted':'$380.00','itemoptions_detail':{},'onlinematrixpricerange':'','storedescription':'','custitem_bike_type':'Dirt','stockdescription':'Refurbished','quantityavailable':10.0,'itemid':'gt0013','onlinecustomerprice':380.0,'storedisplaythumbnail':'gt0013.jpeg','storedisplayname2':'FLY','internalid':487,'displayname':'gt0013'},{'onlinecustomerprice_detail':{'onlinecustomerprice_formatted':'$610.00','onlinecustomerprice':610.0},'onlinecustomerprice_formatted':'$610.00','itemoptions_detail':{},'onlinematrixpricerange':'','storedescription':'','custitem_bike_type':'Dirt','stockdescription':'','quantityavailable':'','itemid':'gt0011','onlinecustomerprice':610.0,'storedisplaythumbnail':'gt0011.jpeg','storedisplayname2':'FUELER','internalid':485,'displayname':'gt0011'},{'onlinecustomerprice_detail':{'onlinecustomerprice_formatted':'$270.00','onlinecustomerprice':270.0},'onlinecustomerprice_formatted':'$270.00','itemoptions_detail':{},'onlinematrixpricerange':'','storedescription':'','custitem_bike_type':'Dirt','stockdescription':'','quantityavailable':'','itemid':'gt0010','onlinecustomerprice':270.0,'storedisplaythumbnail':'gt0010.jpeg','storedisplayname2':'CAGEFRAME','internalid':484,'displayname':'gt0010'},{'onlinecustomerprice_detail':{'onlinecustomerprice_formatted':'$725.00','onlinecustomerprice':725.0},'onlinecustomerprice_formatted':'$725.00','itemoptions_detail':{},'onlinematrixpricerange':'','storedescription':'','custitem_bike_type':'Race','stockdescription':'','quantityavailable':'','itemid':'gt0007','onlinecustomerprice':725.0,'storedisplaythumbnail':'gt0007.jpeg','storedisplayname2':'PROSERIESPRO24','internalid':481,'displayname':'gt0007'},{'onlinecustomerprice_detail':{'onlinecustomerprice_formatted':'$330.00','onlinecustomerprice':330.0},'onlinecustomerprice_formatted':'$330.00','itemoptions_detail':{},'onlinematrixpricerange':'','storedescription':'','custitem_bike_type':'Race','stockdescription':'','quantityavailable':'','itemid':'gt0009','onlinecustomerprice':330.0,'storedisplaythumbnail':'gt0009.jpeg','storedisplayname2':'INTERCEPTORPROFRAME','internalid':483,'displayname':'gt0009'},{'onlinecustomerprice_detail':{'onlinecustomerprice_formatted':'$650.00','onlinecustomerprice':650.0},'onlinecustomerprice_formatted':'$650.00','itemoptions_detail':{},'onlinematrixpricerange':'','storedescription':'','custitem_bike_type':'Race','stockdescription':'','quantityavailable':'','itemid':'gt0008','onlinecustomerprice':650.0,'storedisplaythumbnail':'gt0008.jpeg','storedisplayname2':'PROSERIESMINI','internalid':482,'displayname':'gt0008'},{'onlinecustomerprice_detail':{'onlinecustomerprice_formatted':'$1,150.00','onlinecustomerprice':1150.0},'onlinecustomerprice_formatted':'$1,150.00','itemoptions_detail':{},'onlinematrixpricerange':'','storedescription':'','custitem_bike_type':'Race','stockdescription':'','quantityavailable':'','itemid':'gt0004','onlinecustomerprice':1150.0,'storedisplaythumbnail':'gt0004.jpeg','storedisplayname2':'SPEEDSERIESPROXL','internalid':478,'displayname':'gt0004'},{'onlinecustomerprice_detail':{'onlinecustomerprice_formatted':'$650.00','onlinecustomerprice':650.0},'onlinecustomerprice_formatted':'$650.00','itemoptions_detail':{},'onlinematrixpricerange':'','storedescription':'','custitem_bike_type':'Race','stockdescription':'','quantityavailable':'','itemid':'gt0005','onlinecustomerprice':650.0,'storedisplaythumbnail':'gt0005.jpeg','storedisplayname2':'PROSERIESEXPERT','internalid':479,'displayname':'gt0005'},{'onlinecustomerprice_detail':{'onlinecustomerprice_formatted':'$1,150.00','onlinecustomerprice':1150.0},'onlinecustomerprice_formatted':'$1,150.00','itemoptions_detail':{},'onlinematrixpricerange':'','storedescription':'','custitem_bike_type':'Race','stockdescription':'','quantityavailable':'','itemid':'gt0003','onlinecustomerprice':1150.0,'storedisplaythumbnail':'gt0003.jpeg','storedisplayname2':'SPEEDSERIESPRO','internalid':477,'displayname':'gt0003'},{'onlinecustomerprice_detail':{'onlinecustomerprice_formatted':'$1,220.00','onlinecustomerprice':1220.0},'onlinecustomerprice_formatted':'$1,220.00','itemoptions_detail':{},'onlinematrixpricerange':'','storedescription':'','custitem_bike_type':'Race','stockdescription':'','quantityavailable':'','itemid':'gt0002','onlinecustomerprice':1220.0,'storedisplaythumbnail':'gt0002.jpeg','storedisplayname2':'SPEEDSERIESPRO26','internalid':474,'displayname':'gt0002'},{'onlinecustomerprice_detail':{'onlinecustomerprice_formatted':'$650.00','onlinecustomerprice':650.0},'onlinecustomerprice_formatted':'$650.00','itemoptions_detail':{},'onlinematrixpricerange':'','storedescription':'','custitem_bike_type':'Race','stockdescription':'','quantityavailable':'','itemid':'gt0006','onlinecustomerprice':650.0,'storedisplaythumbnail':'gt0006.jpeg','storedisplayname2':'PROSERIESPROXL','internalid':480,'displayname':'gt0006'},{'onlinecustomerprice_detail':{'onlinecustomerprice_formatted':'$350.00','onlinecustomerprice':350.0},'onlinecustomerprice_formatted':'$350.00','itemoptions_detail':{},'onlinematrixpricerange':'','storedescription':'','custitem_bike_type':'Dirt','stockdescription':'','quantityavailable':'','itemid':'gt0015','onlinecustomerprice':350.0,'storedisplaythumbnail':'gt0015.jpeg','storedisplayname2':'FLY16','internalid':489,'displayname':'gt0015'},{'onlinecustomerprice_detail':{'onlinecustomerprice_formatted':'$250.00','onlinecustomerprice':250.0},'onlinecustomerprice_formatted':'$250.00','itemoptions_detail':{},'onlinematrixpricerange':'','storedescription':'','custitem_bike_type':'Dirt','stockdescription':'','quantityavailable':'','itemid':'gt0017','onlinecustomerprice':250.0,'storedisplaythumbnail':'gt0017.jpeg','storedisplayname2':'AIR','internalid':491,'displayname':'gt0017'},{'onlinecustomerprice_detail':{'onlinecustomerprice_formatted':'$330.00','onlinecustomerprice':330.0},'onlinecustomerprice_formatted':'$330.00','itemoptions_detail':{},'onlinematrixpricerange':'','storedescription':'','custitem_bike_type':'Dirt','stockdescription':'','quantityavailable':'','itemid':'gt0016','onlinecustomerprice':330.0,'storedisplaythumbnail':'gt0016.jpeg','storedisplayname2':'RICOCHET','internalid':490,'displayname':'gt0016'},{'onlinecustomerprice_detail':{'onlinecustomerprice_formatted':'$360.00','onlinecustomerprice':360.0},'onlinecustomerprice_formatted':'$360.00','itemoptions_detail':{},'onlinematrixpricerange':'','storedescription':'','custitem_bike_type':'Dirt','stockdescription':'','quantityavailable':'','itemid':'gt0014','onlinecustomerprice':360.0,'storedisplaythumbnail':'gt0014.jpeg','storedisplayname2':'FLY18','internalid':488,'displayname':'gt0014'},{'onlinecustomerprice_detail':{'onlinecustomerprice_formatted':'$440.00','onlinecustomerprice':440.0},'onlinecustomerprice_formatted':'$440.00','itemoptions_detail':{},'onlinematrixpricerange':'','storedescription':'','custitem_bike_type':'Dirt','stockdescription':'','quantityavailable':'','itemid':'gt0012','onlinecustomerprice':440.0,'storedisplaythumbnail':'gt0012.jpeg','storedisplayname2':'BUMP','internalid':486,'displayname':'gt0012'},{'onlinecustomerprice_detail':{'onlinecustomerprice_formatted':'$440.00','onlinecustomerprice':440.0},'onlinecustomerprice_formatted':'$440.00','itemoptions_detail':{},'onlinematrixpricerange':'','storedescription':'','custitem_bike_type':'Street','stockdescription':'','quantityavailable':'','itemid':'gt0018','onlinecustomerprice':440.0,'storedisplaythumbnail':'gt0018.jpeg','storedisplayname2':'PERFORMER20','internalid':492,'displayname':'gt0018'},{'onlinecustomerprice_detail':{'onlinecustomerprice_formatted':'$380.00','onlinecustomerprice':380.0,'priceschedule':[{'minimumquantity':0.0,'price':380.0,'price_formatted':'$380.00','maximumquantity':5.0},{'minimumquantity':5.0,'price':370.5,'price_formatted':'$370.50','maximumquantity':10.0},{'minimumquantity':10.0,'price':361.0,'price_formatted':'$361.00'}]},'onlinecustomerprice_formatted':'$380.00','itemoptions_detail':{'matrixtype':'parent','fields':[{'values':[{'':'-Select-'},{'1':'Blue'},{'2':'Silver'},{'3':'Black'},{'4':'Chrome'}],'ismatrixdimension':true,'ismandatory':true,'label':'GTMatrixColors','internalid':'custcol2','type':'select'},{'values':[{'':'-Select-'},{'3':'20'},{'4':'24'},{'5':'26'}],'ismatrixdimension':true,'ismandatory':true,'label':'MatrixTireSize','internalid':'custcol3','type':'select'}]},'onlinematrixpricerange':'380570','storedescription':'','custitem_bike_type':'Race','stockdescription':'','quantityavailable':'','itemid':'0001','onlinecustomerprice':380.0,'storedisplaythumbnail':'speed-series-pro.png','storedisplayname2':'SPEEDSERIESPRO','internalid':74,'displayname':'SPEEDSERIESPRO'},{'onlinecustomerprice_detail':{'onlinecustomerprice_formatted':'$380.00','onlinecustomerprice':380.0},'onlinecustomerprice_formatted':'$380.00','itemoptions_detail':{},'onlinematrixpricerange':'','storedescription':'','custitem_bike_type':'Street','stockdescription':'New','quantityavailable':0.0,'itemid':'gt0019','onlinecustomerprice':380.0,'storedisplaythumbnail':'gt0019.jpeg','storedisplayname2':'COMPE','internalid':493,'displayname':'gt0019'},{'onlinecustomerprice_detail':{'onlinecustomerprice_formatted':'$285.00','onlinecustomerprice':285.0},'onlinecustomerprice_formatted':'$285.00','itemoptions_detail':{},'onlinematrixpricerange':'','storedescription':'','custitem_bike_type':'Street','stockdescription':'','quantityavailable':0.0,'itemid':'gt0021','onlinecustomerprice':285.0,'storedisplaythumbnail':'gt0021.jpeg','storedisplayname2':'SLAMMER','internalid':495,'displayname':'gt0021'}],'facets':[{'id':'custitem_bike_brands','name':'Brand','values':[{'name':'GT',label:'GT','count':23,'url':'dummy'},{'name':'Trek',label:'Trek','count':26,'url':'dummy'},{'name':'Voodoo',label:'Voodoo','count':5,'url':'dummy'}]},{'id':'custitem_bike_colors','name':'Colors','values':[{'name':'',label:'','count':1,'url':'dummy'},{'name':'Black',label:'Black','count':4,'url':'dummy'},{'name':'Blue',label:'Blue','count':6,'url':'dummy'},{'name':'Chrome',label:'Chrome','count':5,'url':'dummy'},{'name':'Gray',label:'Gray','count':3,'url':'dummy'},{'name':'Red',label:'Red','count':2,'url':'dummy'},{'name':'White',label:'White','count':2,'url':'dummy'}]},{'id':'custitem_bike_type','name':'BikeType','values':[{'name':'Dirt',label:'Dirt','count':8,'url':'dummy'},{'name':'Race',label:'Race','count':11,'url':'dummy'},{'name':'Street',label:'Street','count':4,'url':'dummy'}]},{'id':'custitem_exclude_from_search','name':'kjhgfd','values':[{'name':'false',label:'false','count':23,'url':'dummy'},{'name':'true',label:'true','count':12,'url':'dummy'}]},{'id':'custitem_gt_matrix_colors','name':'GTMatrixColors','values':[{'name':'',label:'','count':22,'url':'dummy'},{'name':'Black',label:'Black','count':1,'url':'dummy'},{'name':'Blue',label:'Blue','count':1,'url':'dummy'},{'name':'Chrome',label:'Chrome','count':1,'url':'dummy'},{'name':'Silver',label:'Silver','count':1,'url':'dummy'}]},{'id':'custitem_matrix_tire_size','name':'MatrixTireSize','values':[{'name':'',label:'','count':22,'url':'dummy'},{'name':'20',label:'20','count':1,'url':'dummy'},{'name':'24',label:'24','count':1,'url':'dummy'},{'name':'26',label:'26','count':1,'url':'dummy'}]},{'id':'custitem_tire_size','name':'Tiresize','values':[{'name':'',label:'','count':1,'url':'dummy'},{'name':'16',label:'16','count':1,'url':'dummy'},{'name':'18',label:'18','count':1,'url':'dummy'},{'name':'20',label:'20','count':18,'url':'dummy'},{'name':'24',label:'24','count':1,'url':'dummy'},{'name':'26',label:'26','count':1,'url':'dummy'}]}],'links':[],'locale':{'country':'US','language':'en','currency':'USD'},'code':200})
							,	translator: translator
							,	translatorConfig: application.translatorConfig
							,	application: application
								
						});

						view.template = 'facetsViewsTest';
						view_rendered = view.render().el;
						view.renderFacets(Backbone.history.fragment);

						return view_rendered && facets;
					}
					else
					{
						return false;
					}
				});
			
			}
		
		});
		
		it('#1 Render all facets without excludes', function() {
			var facets = view.model.get('facets');
			var $test1 =  jQuery('#test1',view_rendered);
			expect(jQuery('*[data-type="rendered-facet"]',$test1).length).toBe(facets.length);
		});

		it('#2 Render facets without custitem_tire_size', function() {
			var $test2 =  jQuery('#test2',view_rendered);
			expect(jQuery('*[data-facet-id="custitem_tire_size"]',$test2).length).toBe(0);
		});

		it('#3 Render facets without custitem_bike_colors', function() {
			var $test3 =  jQuery('#test3',view_rendered);
			expect(jQuery('*[data-facet-id="custitem_bike_colors"]',$test3).length).toBe(0);
		});

		it('#4 Render facets without custitem_bike_brands', function() {
			var $test4 =  jQuery('#test4', view_rendered);
			expect(jQuery('*[data-facet-id="custitem_bike_brands"]',$test4).length).toBe(0);
		});
		it('#5 Render facets without custitem_bike_brands & custitem_bike_colors', function() {
			var $test5 =  jQuery('#test5',view_rendered);
			expect(jQuery('*[data-facet-id="custitem_bike_colors"]',$test5).length + jQuery('*[data-facet-id="custitem_bike_brands"]',$test5).length ).toBe(0);
		});
		it('#6 Render without facets', function() {
			var $test6 =  jQuery('#test6',view_rendered);
			expect(jQuery('*[data-type="rendered-facet"]',$test6).length).toBe(4);
		});

		it('#7 Render facet custitem_bike_colors', function() {
			var $test7 =  jQuery('#test7',view_rendered);
			$test7 = jQuery('*[data-type="rendered-facet"]',$test7);
			expect($test7.data('facet-id')).toBe('custitem_bike_colors');
		});

		it('#8 Render facet custitem_bike_brands', function() {
			var $test8 = jQuery('#test8',view_rendered);
			$test8 = jQuery('*[data-type="rendered-facet"]',$test8);
			expect($test8.data('facet-id')).toBe('custitem_bike_brands');
		});

		it('#9 Render facet custitem_tire_size', function() {
			var $test9 = jQuery('#test9',view_rendered);
			$test9 = jQuery('*[data-type="rendered-facet"]',$test9);
			expect($test9.data('facet-id')).toBe('custitem_tire_size');
		});

		it('#10 showing hidden elements', function() {
			var element = jQuery('*[data-type="rendered-facet"]',view_rendered)[0];
			jQuery('h5',element).trigger('click');
			expect(jQuery('div',element).hasClass('in')).toBe(true);
		});	
	});

});