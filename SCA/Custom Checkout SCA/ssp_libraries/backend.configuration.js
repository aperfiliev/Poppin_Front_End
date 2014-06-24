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

	,	items_fields_advanced_name: 'details'

	,	items_fields_standard_keys: [
			'canonicalurl'
		,	'correlateditems_detail'
		,	'description'
		,	'displayname'
		,	'featureddescription'
		,	'internalid'
		,	'isbackorderable'
		,	'isinactive'
		,	'isinstock'
		,	'isonline'
		,	'ispurchasable'
		,	'itemid'
		,	'itemimages_detail'
		,	'itemoptions_detail'
		,	'itemtype'
		,	'matrixchilditems_detail'
		,	'minimumquantity'
		,	'onlinecustomerprice_detail'
		,	'defaultcategory_detail'
		,	'outofstockbehavior'
		,	'outofstockmessage'
		,	'pricelevel1'
		,	'pricelevel1_formatted'
		,	'quantityavailable'
		,	'relateditems_detail'
		,	'stockdescription'
		,	'storedescription2'
		,	'storedetaileddescription'
		,	'storedisplayimage'
		,	'storedisplayname2'
		,	'storedisplaythumbnail'
		,	'showoutofstockmessage'
		]
		
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
};
