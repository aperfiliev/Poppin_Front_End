//Backend Configuration file
SC.Configuration = {

	order_checkout_field_keys: {
		'items': [
				'amount'
			,	'promotionamount'
			,	'promotiondiscount'
			,	'orderitemid'
			,	'quantity'
			,	'onlinecustomerprice_detail'
			,	'internalid'
			,	'options'
				,	'itemtype'
				,	'itemid'
		]
		,	'giftcertificates': null
		,	'shipaddress': null
		,	'billaddress': null
		,	'payment': null
		,	'summary': null
		,	'promocodes': null
		,	'shipmethod': null
		,	'shipmethods': null
		,	'agreetermcondition': null
		,	'purchasenumber': null
	}

,	order_shopping_field_keys: {
		'items': [
				'amount'
			,	'promotionamount'
			,	'promotiondiscount'
			,	'orderitemid'
			,	'quantity'
			,	'onlinecustomerprice_detail'
			,	'internalid'
			,	'options'
			,	'itemtype'
		]
		,	'shipaddress': null
		,	'summary': null
		,	'promocodes': null
	}

,	items_fields_advanced_name: 'order'

,	items_fields_standard_keys: [
			'canonicalurl'
		,	'displayname'
		,	'internalid'
		,	'itemid'
		,	'itemoptions_detail'
		,	'itemtype'
		,	'minimumquantity'
		,	'onlinecustomerprice_detail'
		,	'pricelevel1'
		,	'pricelevel1_formatted'
		,	'isinstock'
		,	'ispurchasable'
		,	'isbackorderable'
		,	'outofstockmessage'
		,	'stockdescription'
		,	'showoutofstockmessage'
		,	'storedisplayimage'
		,	'storedisplayname2'
		,	'storedisplaythumbnail'
	]
	
	// product reviews configuration
,	product_reviews: {
		// maxFlagsCount is the number at which a review is marked as flagged by users
		maxFlagsCount: 2
	,	loginRequired: false
		// the id of the flaggedStatus. If maxFlagsCount is reached, this will be its new status.
	,	flaggedStatus: 4
		// id of the approvedStatus
	,	approvedStatus: '2'
		// id of pendingApprovalStatus
	,	pendingApprovalStatus:	1
	,	resultsPerPage: 25
	}

	// Product lists configuration. 
	// Note: for activating the "single list" user experience use additionEnabled==false && list_templates.length === 1
,	product_lists: {

		// can the user modify product lists ?  This is add new ones, edit and delete them.
		additionEnabled: true

		// must the user be logged in for the product list experience to be enabled ? 
	,	loginRequired: true
		
		// Predefined lists, a.k.a templates:
		// Administrators can define predefined list of templates. New customers will have these template lists 
		// by default. This lists will be of type=predefined and they cannot be modified/deleted. 
		// Note: Associated record will be created only when the customer add some product to the list.
	,	list_templates: [
			{
				templateid: '1'
			,	name: 'My list'
			,	description: 'An example predefined list'
			,	scope: {
					id: '2'
				,	name: 'private'
				}
			}
		]

		// display modalities for product list items. 
	,	itemsDisplayOptions: [
			{id: 'list', name: 'List', macro: 'productListDisplayFull', columns: 1, icon: 'icon-th-list', isDefault: true}
		// ,	{id: 'table', name: 'Table', macro: 'itemCellTable', columns: 2, icon: 'icon-th-large'}
		// ,	{id: 'grid', name: 'Grid', macro: 'itemCellGrid', columns: 4, icon: 'icon-th'}
		,	{id: 'condensed', name: 'Condensed', macro: 'productListDisplayCondensed', columns: 1, icon: 'icon-th-condensed'}
		]	
	}
};
