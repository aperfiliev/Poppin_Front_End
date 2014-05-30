/*global nlapiGetUser:false, nlapiGetNewRecord:false, nlapiGetOldRecord:false, nlobjSearchFilter:false, nlobjSearchColumn:false, nlapiSearchRecord:false, nlapiLogExecution:false, nlapiSubmitField:false */
/*jshint forin:true, noarg:true, noempty:true, eqeqeq:true, bitwise:false, strict:true, undef:true, unused:true, curly:true, browser:true, quotmark:single, maxerr:50, laxcomma:true, expr:true*/

var approved_status = 2;
// If the customer has purchased the item
// the review is "verified", this is to show
// a special badge on the review
function verifyItemPurchase (review, user, item_id)
{
	'use strict';
	if (item_id)
	{
		var results = new nlapiSearchRecord('salesorder', null, [
			new nlobjSearchFilter('entity', null, 'is', user)
		,	new nlobjSearchFilter('item', null, 'is', item_id.toString())
		]);

		review.setFieldValue('custrecord_ns_prr_verified', results && results.length ? 'T' : 'F');
	}
}

function setReviewUser (review, user)
{
	'use strict';
	try {
			review.setFieldValue('custrecord_ns_prr_writer', user.toString());	
	}
	catch (e) {
			nlapiLogExecution('DEBUG', 'Error setting user: ', JSON.stringify(e));
	}
	
	
}

function setReviewItem (review, item_id)
{
	'use strict';

	if (item_id)
	{
		try {
			review.setFieldValue('custrecord_ns_prr_item', item_id.toString());	
		}
		catch (e) {
			nlapiLogExecution('DEBUG', 'Error setting item: ', JSON.stringify(e));
		}
	}
}

function beforeSubmit (action)
{
	'use strict';

	var user = nlapiGetUser()
	,	new_review = nlapiGetNewRecord();
	// false when deleting
	if (new_review)
	{
		var item_id = new_review.getFieldValue('custrecord_ns_prr_item_id');
		// if the record is beeing created
		// and the user is logged in
		if (action.toString() === 'create' && user)
		{
			setReviewUser(new_review,user);
			verifyItemPurchase(new_review, user, item_id);

		}

		// if the review is not assigned to
		// the item record
		if (!new_review.getFieldValue('custrecord_ns_prr_item') && item_id)
		{
			setReviewItem(new_review, item_id);
		}
	}
}

function getItem (id)
{
	'use strict';

	var results = nlapiSearchRecord('item', null, new nlobjSearchFilter('internalid', null, 'is', id));
	return results && results.length ? results[0] : null;
}

function getRating (id)
{
	'use strict';

	var results = nlapiSearchRecord(
		'customrecord_ns_pr_review', null
	,	[
			new nlobjSearchFilter('isinactive', null, 'is', 'F')
		,	new nlobjSearchFilter('custrecord_ns_prr_item', null, 'is', id)
		,	new nlobjSearchFilter('custrecord_ns_prr_status', null, 'is', approved_status)
		]
	,	[
			new nlobjSearchColumn('internalid', null, 'count')
		,	new nlobjSearchColumn('custrecord_ns_prr_rating', null, 'avg')
		]
	);

	if (results && results.length)
	{
		return {
			count: results[0].getValue('internalid', null, 'count')
		,	average: parseFloat(results[0].getValue('custrecord_ns_prr_rating', null, 'avg')).toFixed(1)
		};
	}

	return null;
}

function getRatingByRate (id)
{
	'use strict';

	var results = nlapiSearchRecord(
		'customrecord_ns_pr_review', null
	,	[
			new nlobjSearchFilter('isinactive', null, 'is', 'F')
		,	new nlobjSearchFilter('custrecord_ns_prr_item', null, 'is', id)
		,	new nlobjSearchFilter('custrecord_ns_prr_status', null, 'is', approved_status)
		]
	,	[
			new nlobjSearchColumn('custrecord_ns_prr_rating', null, 'group')
		,	new nlobjSearchColumn('internalid', null, 'count')
		]
	);

	if (results && results.length)
	{
		var grouped = {};

		results.forEach(function (item)
		{
			grouped[item.getValue('custrecord_ns_prr_rating', null, 'group')] = item.getValue('internalid', null, 'count');
		});

		return grouped;
	}

	return {};
}

function getAttributesRating (id)
{
	'use strict';

	var results = nlapiSearchRecord(
		'customrecord_ns_pr_attribute_rating', null
	,	[
			new nlobjSearchFilter('isinactive', null, 'is', 'F')
		,	new nlobjSearchFilter('custrecord_ns_prar_item', null, 'is', id)
		,	new nlobjSearchFilter('custrecord_ns_prr_status', 'custrecord_ns_prar_review', 'is', approved_status)
		]
	,	[
			new nlobjSearchColumn('custrecord_ns_prar_rating', null, 'avg')
		,	new nlobjSearchColumn('custrecord_ns_prar_attribute', null, 'group')
		]
	);

	if (results && results.length)
	{
		var grouped = {};

		results.forEach(function (item)
		{
			grouped[item.getValue('custrecord_ns_prar_attribute', null, 'group')] = parseFloat(item.getValue('custrecord_ns_prar_rating', null, 'avg')).toFixed(1);
		});

		return grouped;
	}

	return {};
}

function updateItemRating (id)
{
	'use strict';

	if (id)
	{
		var item = getItem(id)
		,	rating = getRating(id);

		nlapiSubmitField(
			item.getRecordType(), id
		,	['custitem_ns_pr_count', 'custitem_ns_pr_rating', 'custitem_ns_pr_rating_by_rate', 'custitem_ns_pr_attributes_rating']
		,	[rating.count, rating.average, JSON.stringify(getRatingByRate(id)), JSON.stringify(getAttributesRating(id))]);
	}
}

function afterSubmit (action)
{
	'use strict';

	var new_review = nlapiGetNewRecord()
	,	old_review = nlapiGetOldRecord();

	if (action.toString() === 'create')
	{
		updateItemRating(new_review.getFieldValue('custrecord_ns_prr_item'));
	}

	if (action.toString() === 'edit' || action.toString() === 'xedit' || action.toString() === 'delete')
	{
		updateItemRating(old_review.getFieldValue('custrecord_ns_prr_item'));
	}
}