// Configuration.js
// ----------------
// All of the applications configurable defaults
(function (application)
{
	'use strict';
	
	application.Configuration = {};

	_.extend(application.Configuration, {

		// header_macro will show an image with the url you set here
		logoUrl: ''

		// depending on the application we are configuring, used by the NavigationHelper.js
	,	currentTouchpoint: 'home'
		// list of the applications required modules to be loaded
		// de dependencies to be loaded for each module are handled by
		// [require.js](http://requirejs.org/)
	,	modules: [
			// ItemDetails should always be the 1st to be added
			// there will be routing problmes if you change it
			['ItemDetails',  {startRouter: true}]
		,	'Profile'
		,	'NavigationHelper'
		,	'BackToTop'
		,	['Cart',  {startRouter: true}]
		,	'Content'
		,	'Facets'
		,	'GoogleAnalytics'
		,	'GoogleUniversalAnalytics'
		,	'Home'
		,	'LanguageSupport'
		,	'MultiCurrencySupport'
		,	'MultiHostSupport'
		,	'PromocodeSupport'
		,	'SiteSearch'
		,	'SocialSharing'
		,	'ProductReviews'
		,	'AjaxRequestsKiller'
		,	'CookieWarningBanner'
		,	'ImageNotAvailable'
		,	'ItemImageGallery'
		,	'ErrorManagement'
		,	'Merchandising'
		,	'Merchandising.Context.DefaultHandlers'
		,	'Categories'
		]

		// Default url for the item list
	,	defaultSearchUrl: 'search'

		// Search preferences
	,	searchPrefs: 
		{
			// keyword maximum string length - user won't be able to write more than 'maxLength' chars in the search box
			maxLength: 40

			// keyword formatter function will format the text entered by the user in the search box. This default implementation will remove invalid keyword characters like *()+-="
		,	keywordsFormatter: function (keywords)
			{
				if (keywords === '||')
				{
					return '';
				}

				var anyLocationRegex = /[\(\)\[\]\{\~\}\!\"\:\/]{1}/g // characters that cannot appear at any location
				,	beginingRegex = /^[\*\-\+]{1}/g // characters that cannot appear at the begining
				,	replaceWith = ''; // replacement for invalid chars

				return keywords.replace(anyLocationRegex, replaceWith).replace(beginingRegex, replaceWith); 
			}
		}

		// flag for showing or not, "add to cart" button in facet views
	,	addToCartFromFacetsView: false
		// url for the not available image
	,	imageNotAvailable: _.getAbsoluteUrl('img/no_image_available.jpeg')
		// default macros
	,	macros: {
			facet: 'facetList'

		,	itemOptions: {
				// each apply to specific item option types
				selectorByType: 
				{
					select: 'itemDetailsOptionTile'
				,	'default': 'itemDetailsOptionText'
				}
				// for rendering selected options in the shopping cart
			,	selectedByType: {
					'default': 'shoppingCartOptionDefault'
				}
			}

		,	itemDetailsImage: 'itemImageGallery'

			// default merchandising zone template
		,	merchandisingZone: 'merchandisingZone'
		}
		// array of links to be added to the header
		// this can also contain subcategories
	,	navigationTabs: [
/*			{
				text: _('Home').translate()
			,	href: '/'
			,	data: {
					touchpoint: 'home'
				,	hashtag: ''
				}
			}
		,	*/{
				text: _('Shop').translate()
			,	href: '/search'
			,	data: {
					touchpoint: 'home'
				,	hashtag: '#search'
				}
			}
		,	{
			text: _('Writing').translate()
		,	href: '/Writing_3'
		,	data: {
				touchpoint: 'home'
			,	hashtag: '#Writing_3'
			}
		}
		,	{
			text: _('Notebooks+').translate()
		,	href: '/Notebooks-_3'
		,	data: {
				touchpoint: 'home'
			,	hashtag: '#Notebooks-_3'
			}
		}
		,	{
			text: _('Desktop').translate()
		,	href: '/Desktop_3'
		,	data: {
				touchpoint: 'home'
			,	hashtag: '#Desktop_3'
			}
		}
		,	{
			text: _('Organization').translate()
		,	href: '/Organization_3'
		,	data: {
				touchpoint: 'home'
			,	hashtag: '#Organization_3'
			}
		}
		,	{
			text: _('Furniture').translate()
		,	href: '/Furniture_5'
		,	data: {
				touchpoint: 'home'
			,	hashtag: '#Furniture_5'
			}
		}
		,	{
			text: _('Tech').translate()
		,	href: '/Tech_3'
		,	data: {
				touchpoint: 'home'
			,	hashtag: '#Tech_3'
			}
		}
		,	{
			text: _('Decor').translate()
		,	href: '/Decor_3'
		,	data: {
				touchpoint: 'home'
			,	hashtag: '#Decor_3'
			,	'keep-options': 'display'
			}
//		, categories: [
//						{
//								text: _('Decor Sub-menu 1').translate()
//							, 	href: '/Decor_2/Wall-Art'
//							, 	data: {
//										touchpoint: 'home'
//									, 	hashtag: '#Decor_2/Wall-Art'
//								}
//						}
//						]
		}
		,	{
			text: _('For Business').translate()
		,	href: '/business'
		,	data: {
				touchpoint: 'home'
			,	hashtag: '#business'
			}
		}
		,	{
			text: _('Gifts+More').translate()
		,	href: '/Gifts-More_3'
		,	data: {
				touchpoint: 'home'
			,	hashtag: '#Gifts-More_3'
			}
		}
		]

	,	footerNavigation: []

		// Macro to be rendered in the header showing your name and nav links
		// we provide be 'headerProfile' or 'headerSimpleProfile'
	,	profileMacro: 'headerProfile'

		// settings for the cookie warning message (mandatory for UK stores)
	,	cookieWarningBanner: {
			closable: true
		,	saveInCookie: true
		,	anchorText: _('Learn More').translate()
		,	message: _('To provide a better shopping experience, our website uses cookies. Continuing use of the site implies consent.').translate()
		}

		// options to be passed when querying the Search API
	,	searchApiMasterOptions: {

			Facets: {
				include: 'facets'
			,	fieldset: 'search'
			}

		,	itemDetails: {
				include: 'facets'
			,	fieldset: 'details'
			}

			// don't remove, get extended
		,	merchandisingZone: {}
		}

		// Analytics Settings
		// You need to set up both popertyID and domainName to make the default trackers work
	,	tracking: {
			// [Google Universal Analytics](https://developers.google.com/analytics/devguides/collection/analyticsjs/)
			googleUniversalAnalytics: {
				propertyID: ''
			,	domainName: ''
			}
			// [Google Analytics](https://developers.google.com/analytics/devguides/collection/gajs/)
		,	google: {
				propertyID: ''
			,	domainName: ''
			}
		}

		// Typeahead Settings
	,	typeahead: {
			minLength: 3
		,	maxResults: 8
		,	macro: 'typeahead'
		}

		// setting it to false will search in the current results
		// if on facet list page
	,	isSearchGlobal: true

		// available values are: goToCart, showMiniCart or showCartConfirmationModal
	,	addToCartBehavior: 'showCartConfirmationModal'

	,	homeTemplate: 'home'

		// settings on how each facet should display in the "narrow your results" section. Properties: 
		// * name: internationalized facet name, 
		// * url: hash fragment that identified the facet in the url
		// * priority: an integer grater than zero indicating for ordering facets editors. Facets with greater priority numbers will appear above others. 
		// * macro: name of installed macro that renders the facet editor. Some available macros are facetRange, facetColor
		// * uncollapsible: if true the user won't be able to collapse the facet editor
		// * behavior: can be one of "range", "multi". If "range", a double slider will be showed as the editor. If "multi", multiple facet value selection will be available
		// * titleToken: format for the facet on the document title's when it is selected. Can be a string like "from $(0) to $(1)" for range behaviour or "foo $(0) bar" for others. Also it can be a function that accept the facet object as the one parameter.  
		// * titleSeparator: a string separator between facets in the document's title. 
	,	facets: [
			{
				id: 'onlinecustomerprice'
			,	name: _('Price').translate()
			,	url: 'price'
			,	priority: 0
			,	behavior: 'range'
			,	macro: 'facetRange'
			,	uncollapsible: true
			,	titleToken: 'Price $(0) - $(1)'
			,	titleSeparator: ', '
			,	parser: function (value)
				{
					return _.formatCurrency(value);
				}
			}
			, {
				id: 'custitem29'
			,	name: _('Brand').translate()
			,	url: 'brand'
			,	behavior: 'multi'
			,	uncollapsible: false
			}
			, {
				id: 'class'
			,	name: _('Class').translate()
			,	url: 'class'
			,	behavior: 'multi'
			,	uncollapsible: false
			}
			, {
				id: 'category'
			,	name: _('Category').translate()
			,	url: 'category'
			,	behavior: 'single'
			,	uncollapsible: false
			,	macro: 'facetCategories'
			}
		]
		// This options set the title for the facet browse view.
	,	defaultSearchTitle: _('Products').translate()
	,	searchTitlePrefix: _('').translate()
	,	searchTitleSufix: _('').translate()

		// Limits for the SEO generated links in the facets browser
		// Once the limits are hitted the url is replaced with # in the links
	,	facetsSeoLimits: {
			// how many facets groups will be indexed 
			numberOfFacetsGroups: 2
			// for multi value facet groups how many facets values together
		,	numberOfFacetsValues: 2
			// Which options will be indexed, 
			// if you omit one here, and it's present in the url it will not be indexed
		,	options: ['page', 'keywords'] // order, page, show, display, keywords
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
		// Output example: /brand/GT/style/Race,Street?display=table

		// eg: a different set of delimiters
		/*
		,	facetDelimiters: {
			,	betweenFacetNameAndValue: '-'
			,	betweenDifferentFacets: '/'
			,	betweenDifferentFacetsValues: '|'
			,	betweenRangeFacetsValues: '>'
			,	betweenFacetsAndOptions: '~'
			,	betweenOptionNameAndValue: '/'
			,	betweenDifferentOptions: '/'
		}
		*/
		// Output example: brand-GT/style-Race|Street~display/table

		// map of image custom image sizes
		// usefull to be customized for smaller screens
	,	imageSizeMapping: {
			thumbnail: 'thumbnail' // 175 * 175
		,	main: 'main' // 600 * 600
		,	tinythumb: 'tinythumb' // 50 * 50
		,	zoom: 'zoom' // 1200 * 1200
		,	fullscreen: 'fullscreen' // 1600 * 1600
		}
		// available options for the Results per Page dropdown
	,	resultsPerPage: [
			{items: 12, name: _('$(0) Items').translate('12')}
		,	{items: 24, name: _('$(0) Items').translate('24'), isDefault: true}
		,	{items: 48, name: _('$(0) Items').translate('48')}
		]
		// available views for the item list by selecting the macros
	,	itemsDisplayOptions: [
			{id: 'list', name: _('List').translate(), macro: 'itemCellList', columns: 1, icon: 'icon-th-list'}
		,	{id: 'table', name: _('Table').translate(), macro: 'itemCellTable', columns: 2, icon: 'icon-th-large'}
		,	{id: 'grid', name: _('Grid').translate(), macro: 'itemCellGrid', columns: 4, icon: 'icon-th', isDefault: true}
		]
		// available sorting options for the Sort By dropdown
	,	sortOptions: [
			{id: 'relevance:asc', name: _('Relevance').translate(), isDefault: true}
		,	{id: 'pricelevel5:asc', name: _('Price, Low to High').translate()}
		,	{id: 'pricelevel5:desc', name: _('Price, High to Low ').translate()}
		]

	,	recentlyViewedItems: {
			useCookie: true
		,	numberOfItemsDisplayed: 6
		}

		// Settings for displaying each of the item options in the Detailed Page
		// Each of the item options are objects that extend whats comming of the api
		// This options should have (but not limited to) this keys
		// * itemOptionId: The id of an option in the item
		// * cartOptionId: The id of an option in the cart (!required, is the primary key for the mapping)
		// * label: The label that the option will be shown
		// * url: the key of the option when its stored in the url
		// * macros: An object that contains
		//    * selector: Macro that will be rendered for selecting the options (Item list and PDP)
		//    * selected: Macro that will be rendered for the item in the cart (Cart and Cart confirmation)
		// * showSelectorInList: if true the selector will be rendered in the item list
		// Be aware that some marcos may require you to configure some exrta options in order to work properly:
		// * colors: an map of the label of the color as they key and hexa or an object as the value is required by the itemDetailsOptionColor
		// We have provided some macros for you to use but you are encouraged to create your own:
		// For the selector we have created: 
		// * itemDetailsOptionColor
		// * itemDetailsOptionDropdown
		// * itemDetailsOptionRadio
		// * itemDetailsOptionText
		// * itemDetailsOptionTile
		// and for the selected we have created: 
		// * shoppingCartOptionDefault
		// * shoppingCartOptionColor
	,	itemOptions: [
		// Here are some examples:
		// configure a color option to use color macro
		//	{
		//	,	cartOptionId: 'custcol_color_option'
		//	,	label: 'Color'
		//	,	url: 'color'
		//	,	colors: {
		//			'Red': 'red'
		//		,	'Black': { type: 'image', src: 'img/black.gif', width: 22, height: 22 }
		//		}
		//	,	macros: {
		//			selector: 'itemDetailsOptionColor'
		//		,	selected: 'shoppingCartOptionColor'
		//		}
		//	}
		//
		// configure Gift Certificates options to change the value on the url
		// when the user is filling the values
		//	{
		//		cartOptionId: 'GIFTCERTFROM'
		//	,	url: 'from'
		//	}
		// ,	{
		//		cartOptionId: 'GIFTCERTRECIPIENTNAME'
		//	,	url: 'to'
		//	}
		// ,	{
		//		cartOptionId: 'GIFTCERTRECIPIENTEMAIL'
		//	,	url: 'to-email'
		//	}
		// ,	{
		//		cartOptionId: 'GIFTCERTMESSAGE'
		//	,	url: 'message'
		//	}
		]

		// for multi images, option that determines the id of the option
		// that handles the image change. eg: custcol_color
	,	multiImageOption: ''
		// details fields to be displayed on a stacked list on the PDP
	,	itemDetails: [
			{
				name: _('Details').translate()
			,	contentFromKey: 'storedetaileddescription'
			,	opened: true
			,	itemprop: 'description'
			}
		]

		// This object will be merged with specific pagination settings for each of the pagination calls
		// You can use it here to toggle settings for all pagination components
		// For information on the valid options check the pagination_macro.txt
	,	defaultPaginationSettings: {
			showPageList: true
		,	pagesToShow: 9
		,	showPageIndicator: false
		}

		// Product Reviews Configuration
		// -----------------------------
	,	productReviews: {
			maxRate: 5
		,	computeOverall: true
		,	reviewMacro: 'showReview'
		,	loginRequired: false
		,	filterOptions: [
				{id: 'all', name: _('All Reviews').translate(), params: {}, isDefault: true}
			,	{id: '5star', name: _('$(0) Star Reviews').translate('5'), params: {rating: 5}}
			,	{id: '4star', name: _('$(0) Star Reviews').translate('4'), params: {rating: 4}}
			,	{id: '3star', name: _('$(0) Star Reviews').translate('3'), params: {rating: 3}}
			,	{id: '2star', name: _('$(0) Star Reviews').translate('2'), params: {rating: 2}}
			,	{id: '1star', name: _('$(0) Star Reviews').translate('1'), params: {rating: 1}}
			]
		,	sortOptions: [
				{id: 'recent', name: _('Most Recent').translate(), params: {order: 'created_on:DESC'}, isDefault: true}
			,	{id: 'oldest', name: _('Oldest').translate(), params: {order: 'created_on:ASC'}}
			,	{id: 'best', name: _('Better Rated').translate(), params: {order: 'rating:DESC'}}
			,	{id: 'worst', name: _('Worst Rated').translate(), params: {order: 'rating:ASC'}}
			]
		}

		// Social Sharing Services
		// -----------------------
		// Setup for Social Sharing
	,	socialSharingIconsMacro: 'socialSharingIcons'

		// Pinterest
	,	pinterest: {
			enable: true
		,	popupOptions: {
				status: 'no'
			,	resizable: 'yes'
			,	scrollbars: 'yes'
			,	personalbar: 'no'
			,	directories: 'no'
			,	location: 'no'
			,	toolbar: 'no'
			,	menubar: 'no'
			,	width: '632'
			,	height: '270'
			,	left: '0'
			,	top: '0'
			}
		}

	,	facebook: {
			enable: true
		,	appId: '237518639652564'
		,	pluginOptions: {
				'send': 'false'
			,	'layout': 'button_count'
			,	'width': '450'
			,	'show-faces': 'false'
			}
		}

		// Twitter
	,	twitter: {
			enable: true
		,	popupOptions: {
				status: 'no'
			,	resizable: 'yes'
			,	scrollbars: 'yes'
			,	personalbar: 'no'
			,	directories: 'no'
			,	location: 'no'
			,	toolbar: 'no'
			,	menubar: 'no'
			,	width: '632'
			,	height: '250'
			,	left: '0'
			,	top: '0'
			}
		,	via: ''
		}

	,	googlePlus: {
			enable: true
		,	popupOptions: {
				menubar: 'no'
			,	toolbar: 'no'
			,	resizable: 'yes'
			,	scrollbars: 'yes'
			,	height: '600'
			,	width: '600'
			}
		}

	,	addThis: {
			enable: true
		,	pubId: 'ra-50abc2544eed5fa5'
		,	toolboxClass: 'addthis_default_style addthis_toolbox addthis_button_compact'
		,	servicesToShow: {
				pinterest: 'Pinterest'
			,	facebook: 'Facebook'
			,	google_plusone: ''
			// ,	print: _('Print').translate()
			,	email: _('Email').translate()
			,	expanded: _('More').translate()
			}

			// http://support.addthis.com/customer/portal/articles/381263-addthis-client-api#configuration-ui
		,	options: {
				username: ''
			,	data_track_addressbar: true
			// ,	services_exclude: '',
			// ,	services_compact: '',
			// ,	services_expanded: '',
			// ,	services_custom: '',
			// ,	ui_click: '',
			// ,	ui_delay: '',
			// ,	ui_hover_direction: '',
			// ,	ui_language: '',
			// ,	ui_offset_top: '',
			// ,	ui_offset_left: '',
			// ,	ui_header_color: '',
			// ,	ui_header_background: '',
			// ,	ui_cobrand: '',
			// ,	ui_use_css: '',
			// ,	ui_use_addressbook: '',
			// ,	ui_508_compliant: '',
			// ,	data_track_clickback: '',
			// ,	data_ga_tracker: '',
			}
		}

		// [Open Graph](http://ogp.me/)
	,	openGraphMapping: {

			title: function (layout)
			{
				return layout.currentView && layout.currentView.title ? layout.currentView.title : '';
			}

		,	type: function (layout)
			{
				var $social_type = layout.$('[data-type="social-type"]');

				return $social_type.length ? $social_type.text() : undefined;
			}

		,	url: function ()
			{
				return window.location.protocol + '//' + window.location.hostname + '/' + Backbone.history.fragment;
			}

		,	image: function (layout)
			{
				var $social_image = layout.$('[data-type="social-image"], [itemprop="image"]');

				return $social_image.length ? $social_image.get(0).src : application.Configuration.imageNotAvailable;
			}

		,	site_name: function ()
			{
				return application.Configuration.siteName;
			}

		,	description: function (layout)
			{
				var $social_description = layout.$('[data-type="social-description"], [itemprop="description"]');

				return $social_description.length ? $social_description.first().text() : undefined;
			}
		}
	});

	// Search API Environment variables
	// -------------------------------
	var search_api_environment = {};

	// Locale
	if (SC.ENVIRONMENT.currentLanguage)
	{
		var locale = SC.ENVIRONMENT.currentLanguage.locale;
		
		if (~locale.indexOf('_'))
		{
			var locale_tokens = locale.split('_');
			search_api_environment.language = locale_tokens[0];
			search_api_environment.country = locale_tokens[1];
		}
		else
		{
			search_api_environment.language = locale;
		}
	}

	// Currency
	if (SC.ENVIRONMENT.currentCurrency)
	{
		search_api_environment.currency = SC.ENVIRONMENT.currentCurrency.code;
	}
	// no cache
	if (_.parseUrlOptions(location.search).nocache && _.parseUrlOptions(location.search).nocache === 'T')
	{
		search_api_environment.nocache = 'T';
	}

	// Price Level
	search_api_environment.pricelevel = SC.ENVIRONMENT.currentPriceLevel;

	// Mixes the environment in the configuration of the search api 
	_.extend(application.Configuration.searchApiMasterOptions.Facets, search_api_environment);
	_.extend(application.Configuration.searchApiMasterOptions.itemDetails, search_api_environment);
	_.extend(application.Configuration.searchApiMasterOptions.merchandisingZone, search_api_environment);

	// Device Specific Settings
	// ------------------------
	// Calculates the width of the device, it will try to use the real screen size.
	var screen_width = window.screen ? window.screen.availWidth : window.outerWidth || window.innerWidth;

	// Phone Specific
	if (screen_width < 768)
	{
		_.extend(application.Configuration, {
			
			itemsDisplayOptions: [{
				id: 'table'
			,	name: _('Table').translate()
			,	macro: 'itemCellTable'
			,	columns: 2
			,	icon: 'icon-th-large'
			,	isDefault: true
			}]
			
		,	sortOptions: [{
				id: 'relevance:asc'
			,	name: _('Relevance').translate()
			,	isDefault: true
			}]

		,	defaultPaginationSettings: {
				showPageList: false
			,	showPageIndicator: true
			}
		});
	}
	// Tablet Specific
	else if (screen_width >= 768 && screen_width < 980)
	{
		_.extend(application.Configuration, {
			
			itemsDisplayOptions: [
				{id: 'list', name: _('List').translate(), macro: 'itemCellList', columns: 1, icon: 'icon-th-list' , isDefault: true}
			,	{id: 'table', name: _('Table').translate(), macro: 'itemCellTable', columns: 2, icon: 'icon-th-large'}
			]
			
		,	sortOptions: [
				{id: 'relevance:asc', name: _('Relevance').translate(), isDefault: true}
			,	{id: 'onlinecustomerprice:asc', name: _('Price, Low to High').translate()}
			,	{id: 'onlinecustomerprice:desc', name: _('Price, High to Low ').translate()}
			]

		,	defaultPaginationSettings: {
				showPageList: true
			,	pagesToShow: 4
			,	showPageIndicator: false
			}
		});
	}

})(SC.Application('Shopping'));
