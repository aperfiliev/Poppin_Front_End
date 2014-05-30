/*global SC:false, _:false, require:false, it:false, describe:false, expect:false, define:false, beforeEach:false, jQuery:false, waitsFor:false */
/*jshint forin:true, noarg:true, noempty:true, eqeqeq:true, bitwise:false, strict:true, undef:true, unused:true, curly:true, browser:true, quotmark:single, maxerr:50, laxcomma:true, expr:true*/

// Facets.Translator.js
// --------------------
// Testing Facets Translator.
define(['ApplicationSkeleton', 'Main', 'jasmineTypeCheck'], function ()
{
	'use strict';
	
	describe('Module: Facets.Translator', function () {
		
		var is_started = false
		,	application
		,	facets_helper
		,	facets
		,	default_translator
		,	bike_color_map = {
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
			};
		beforeEach(function ()
		{
			// Here is the appliaction we will be using for this tests
			application = SC.Application('Facets.Translator');
			// This is the configuration needed by the modules in order to run
			application.Configuration =  {
					modules: [ 'Facets', 'UrlHelper' ]
				,	searchApiMasterOptions: {
						Facets: {
							include: 'facets'
						,	fieldset: 'search'
						//,	custitem_exclude_from_search: 'false'
						}
					,	itemDetails: {
							fieldset: 'details'
						}	
					}

					// Facet View

				,	facets: [
						{
							id: 'category'
						,	name: 'Category'
						,	max: 10
						,	behavior: 'single'
						,	url: ''
						,	macro: 'facetCategories'
						,	priority: 11
						,	uncollapsible: true
						}
					,	{
							id: 'custitem_bike_brands'
						,	name: 'Brand'
						,	max: 10
						,	behavior: 'single'
						,	url: 'brand'
						,	priority: 10
						,	uncollapsible: true
						}
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
						,	parser: function (value) 
							{
								return _.formatCurrency(value);
							} 
						}
					]
					
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
						{ id: 'list', name: 'List', macro: 'itemListingDisplayList', columns: 1, icon: 'icon-th-list' }
					,	{ id: 'table', name: 'Table', macro: 'itemListingDisplayTable', columns: 2, icon: 'icon-th-large' }
					,	{ id: 'grid', name: 'Grid', macro: 'itemListingDisplayGrid', columns: 4, icon: 'icon-th', isDefault: true }
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
			waitsFor(function() {
				if (is_started)
				{
					facets = require('Facets');
					facets_helper = require('Facets.Translator');
					default_translator = new facets.Translator('/color/blue,red/gender/male/price/10to100?page=3&order=price', null ,application.translatorConfig);	
					return default_translator && is_started && facets; 
				}
				else
				{
					return false; 
				}
				
			});
		});
		
		it('#1 should be able to parse a url into facets and options', function ()
		{
			expect(default_translator.facets.length).toBe(3);
			expect(default_translator.options.order).toBe('price');
			expect(default_translator.options.page).toBe(3);
			expect(default_translator.options.keywords).toBe(undefined);
		});
		
		it('#2 should be able to parse a facets with multiple select values', function ()
		{
			expect(default_translator.getUrlFacetValue('color')).toBeAnArray();
			expect(default_translator.getUrlFacetValue('color')).toContain('red');
			expect(default_translator.getUrlFacetValue('color')).toContain('blue');
		});
		
		it('#3 should be able to parse a facets with range values', function ()
		{
			expect(default_translator.getUrlFacetValue('price')).toBeAnObject();
			expect(default_translator.getUrlFacetValue('price').from).toBe('10');
			expect(default_translator.getUrlFacetValue('price').to).toBe('100');
		});
		
		it('#4 should be able to parse a facets with single select values', function ()
		{
			expect(default_translator.getUrlFacetValue('gender')).toBe('male');
		});
		
		it('#5 should be able to parse a facets with single select values', function ()
		{
			expect(default_translator.getUrlFacetValue('gender')).toBe('male');
		});
		
		it('#6 should remove options from the url when value is default value', function ()
		{
			var translator = new facets.Translator('/color/blue,red/gender/male/price/10to100?page=1&show=25', null , application.translatorConfig);
			expect(translator.getUrl()).toBe('/color/blue,red/gender/male/price/10to100');
		});

		it('#7 should allow me to clone it for diferent configurations of url facets and values', function ()
		{
			expect(default_translator.cloneForFacetUrl('gender', 'female').getUrl()).toBe('/color/blue,red/gender/female/price/10to100?order=price');
			expect(default_translator.cloneForFacetUrl('price', '100').getUrl()).toBe('/color/blue,red/gender/male/price/0to100?order=price');
			expect(default_translator.cloneForFacetUrl('color', 'blue').getUrl()).toBe('/color/red/gender/male/price/10to100?order=price');
			expect(default_translator.cloneForFacetUrl('color', 'green').getUrl()).toBe('/color/blue,green,red/gender/male/price/10to100?order=price');
			expect(default_translator.cloneForFacetUrl('size', 'large').getUrl()).toBe('/color/blue,red/gender/male/price/10to100/size/large?order=price');
		});
		
		it('#8 should allow me to clone without url facets', function ()
		{
			expect(default_translator.cloneWithoutFacetUrl('gender').getUrl()).toBe('/color/blue,red/price/10to100?order=price&page=3');
			expect(default_translator.cloneWithoutFacetUrl('price').getUrl()).toBe('/color/blue,red/gender/male?order=price&page=3');
			expect(default_translator.cloneWithoutFacetUrl('color').getUrl()).toBe('/gender/male/price/10to100?order=price&page=3');
			expect(default_translator.cloneWithoutFacetUrl('size').getUrl()).toBe('/color/blue,red/gender/male/price/10to100?order=price&page=3');
		});
		
		it('#9 should allow me to clone it for diferent configurations of facets ids and values', function ()
		{	
			expect(default_translator.cloneForFacetId('custitem_bike_brands', 'GT').getUrl()).toBe('/brand/GT/color/blue,red/gender/male/price/10to100?order=price');
			expect(default_translator.cloneForFacetId('custitem_bike_type', 'Race').getUrl()).toBe('/color/blue,red/gender/male/price/10to100/style/Race?order=price');
			expect(default_translator.cloneForFacetId('pricelevel5', '100').getUrl()).toBe('/color/blue,red/gender/male/price/0to100?order=price');
			expect(default_translator.cloneForFacetId('custitem_tire_size', '16').getUrl()).toBe('/color/blue,red/gender/male/price/10to100/tire/16?order=price');
		});
		
		
		it('#10 should allow me to clone without facets ids', function ()
		{
			expect(default_translator.cloneWithoutFacetId('custitem_bike_type').getUrl()).toBe('/color/blue,red/gender/male/price/10to100?order=price&page=3');
			expect(default_translator.cloneWithoutFacetId('custitem_bike_brands').getUrl()).toBe('/color/blue,red/gender/male/price/10to100?order=price&page=3');
			expect(default_translator.cloneWithoutFacetId('pricelevel5').getUrl()).toBe('/color/blue,red/gender/male?order=price&page=3');
			expect(default_translator.cloneWithoutFacetId('custitem_tire_size').getUrl()).toBe('/color/blue,red/gender/male/price/10to100?order=price&page=3');
		});
		
		it('#11 should allow me to clone it for diferent configurations of options', function ()
		{
			expect(default_translator.cloneForOption('order', 'color').getUrl()).toBe('/color/blue,red/gender/male/price/10to100?order=color&page=3');
			expect(default_translator.cloneForOption('page', '100').getUrl()).toBe('/color/blue,red/gender/male/price/10to100?order=price&page=100');
			expect(default_translator.cloneForOption('page', '1').getUrl()).toBe('/color/blue,red/gender/male/price/10to100?order=price');
			expect(default_translator.cloneForOption('show', '10').getUrl()).toBe('/color/blue,red/gender/male/price/10to100?order=price&page=3&show=10');
			expect(default_translator.cloneForOption('keywords', 'sofa test').getUrl()).toBe('/color/blue,red/gender/male/price/10to100?order=price&page=3&keywords=sofa test');
		});
		
		it('#12 should allow me to clone without an options by setting it to false', function ()
		{
			expect(default_translator.cloneForOption('order', false).getUrl()).toBe('/color/blue,red/gender/male/price/10to100?page=3');
			expect(default_translator.cloneForOption('page', false).getUrl()).toBe('/color/blue,red/gender/male/price/10to100?order=price');
			expect(default_translator.cloneForOption('show', '20').cloneForOption('show', false).getUrl()).toBe('/color/blue,red/gender/male/price/10to100?order=price&page=3');
			expect(default_translator.cloneForOption('keywords', 'sofa').cloneForOption('keywords', false).getUrl()).toBe('/color/blue,red/gender/male/price/10to100?order=price&page=3');
		});
		
		it('#13 should allow me to clone without an options', function ()
		{
			expect(default_translator.cloneWithoutOption('order').getUrl()).toBe('/color/blue,red/gender/male/price/10to100?page=3');
			expect(default_translator.cloneWithoutOption('page').getUrl()).toBe('/color/blue,red/gender/male/price/10to100?order=price');
			expect(default_translator.cloneForOption('show', '20').cloneWithoutOption('show').getUrl()).toBe('/color/blue,red/gender/male/price/10to100?order=price&page=3');
			expect(default_translator.cloneForOption('keywords', 'sofa').cloneWithoutOption('keywords').getUrl()).toBe('/color/blue,red/gender/male/price/10to100?order=price&page=3');
		});
	});
	
});