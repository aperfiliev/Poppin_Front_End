/**
 * Description: SuiteCommerce Advanced Features (Customer Reviews)
 *
 * @copyright (c) 2000-2012, NetSuite Inc.
 * @author rtucat
*  @version 2.5
*/

function updateItemRatingAndReviews(objReviewData) {
	var arrLytFilters = [], arrLytColumns = [];	
	nlapiLogExecution('DEBUG', 'Update Item Rating and Reviews', '----START----');	
	try {		
		var strLayoutId = objReviewData.layoutId;
		var strApprovedReviewsValue = objReviewData.approvedReviewsValue;
		var intMaxReviews = objReviewData.maxReviews;
		var recItem = objReviewData.targetItem;
		var strSiteNumber = objReviewData.siteNumber;
		var strItemId = recItem.getFieldValue('internalid');		
		if(!isEmpty(intMaxReviews) && !isEmpty(strApprovedReviewsValue)) {
			intMaxReviews = intMaxReviews.forceParseInt();

			//Search the reviews list layout
			arrLytFilters.push(new nlobjSearchFilter("custrecord_gpr_addonslts_option", null, "is", strLayoutId));
			arrLytFilters.push(new nlobjSearchFilter("custrecord_gpr_addonslts_sitenumber", null, "equalto", strSiteNumber));
			arrLytColumns.push(new nlobjSearchColumn("custrecord_gpr_addonstpls_code", "custrecord_gpr_addonslts_listtpl"));
			arrLytColumns.push(new nlobjSearchColumn("custrecord_gpr_addonstpls_code", "custrecord_gpr_addonslts_listcelltpl"));
			arrLytColumns.push(new nlobjSearchColumn("custrecord_gpr_addonslts_maxitems"));
			arrLytColumns.push(new nlobjSearchColumn("custrecord_gpr_addonslts_bundlename"));
			var arrSearchResultsLyt = nlapiSearchRecord("customrecord_gpr_addonslyts", null, arrLytFilters, arrLytColumns);

			if(!isEmptyArray(arrSearchResultsLyt)) {
				nlapiLogExecution('DEBUG', 'Update Item Rating and Reviews', 'Layout Found');
				var intMaxReviewsCount = arrSearchResultsLyt[0].getValue(arrLytColumns[2]);
				var strHtmlListTpl = arrSearchResultsLyt[0].getValue(arrLytColumns[0]);
				var strHtmlListCellTpl = arrSearchResultsLyt[0].getValue(arrLytColumns[1]);
				var strBundleName = arrSearchResultsLyt[0].getValue(arrLytColumns[3]);
				if(!isEmpty(strHtmlListCellTpl) && !isEmpty(strHtmlListTpl)) {
					nlapiLogExecution('DEBUG', 'Update Item Rating and Reviews', 'Templates Set Correctly');
					var strHtmlListResult = '', arrFilters = [], arrColumns = [], ratingAvg = 0;
					arrFilters.push(new nlobjSearchFilter("custrecord_gpr_aae_crv_itemid", null, "is", strItemId));
					arrFilters.push(new nlobjSearchFilter("custrecord_gpr_aae_crv_sitenumber", null, "equalto", strSiteNumber));
					arrFilters.push(new nlobjSearchFilter("custrecord_gpr_aae_crv_state", null, "is", strApprovedReviewsValue));
					arrColumns.push(new nlobjSearchColumn("custrecord_gpr_aae_crv_itemid"));
					arrColumns.push(new nlobjSearchColumn("custrecord_gpr_aae_crv_rating"));
					arrColumns.push(new nlobjSearchColumn("custrecord_gpr_aae_crv_comments"));
					arrColumns.push(new nlobjSearchColumn("custrecord_gpr_aae_crv_reviewer"));
					arrColumns.push(new nlobjSearchColumn("custrecord_gpr_aae_crv_title"));
					arrColumns.push(new nlobjSearchColumn("custrecord_gpr_aae_crv_recommend"));
					arrColumns.push(new nlobjSearchColumn("created"));
					arrColumns[6].setSort(true);
					var arrSearchResults = nlapiSearchRecord("customrecord_gpr_aae_crv", null, arrFilters, arrColumns);
					if(!isEmptyArray(arrSearchResults)) {
						nlapiLogExecution('DEBUG', 'Update Item Rating and Reviews', 'Reviews Found');
						var strHtmlListCell = '';
						if(arrSearchResults.length < intMaxReviewsCount) {
							intMaxReviewsCount = arrSearchResults.length;
						}
						for(var i = 0; i < intMaxReviewsCount; i++) {
							strHtmlListCell = strHtmlListCellTpl;
							var objSearchResult = arrSearchResults[i];
							strHtmlListCell = strHtmlListCell.replace(/<NLREVIEWID>/g, objSearchResult.getId());

							var strDate = objSearchResult.getValue(arrColumns[6]);
							if(strDate == null || strDate == '') {
								strDate = '&nbsp;';
							}
							strHtmlListCell = strHtmlListCell.replace(/<NLREVIEWDATE>/g, strDate);

							var strReviewer = objSearchResult.getValue(arrColumns[3]);
							if(strReviewer == null || strReviewer == '') {
								strReviewer = '&nbsp;';
							}
							strHtmlListCell = strHtmlListCell.replace(/<NLREVIEWER>/g, strReviewer);

							var strComments = objSearchResult.getValue(arrColumns[2]);
							if(strComments == null || strComments == '') {
								strComments = '&nbsp;';
							}
							strHtmlListCell = strHtmlListCell.replace(/<NLCOMMENTS>/g, strComments);

							var strTitle = objSearchResult.getValue(arrColumns[4]);
							if(strTitle == null || strTitle == '') {
								strTitle = '&nbsp;';
							}
							strHtmlListCell = strHtmlListCell.replace(/<NLTITLE>/g, strTitle);

							var strRecommend = objSearchResult.getText(arrColumns[5]);
							if(strRecommend == null || strRecommend == '') {
								strRecommend = '&nbsp;';
							}
							strHtmlListCell = strHtmlListCell.replace(/<NLRECOMMEND>/g, strRecommend);

							var intRating = objSearchResult.getValue(arrColumns[1]);
							if(intRating == null || intRating == '') {
								intRating = '&nbsp;';
							} else {
								intRating = Math.round((intRating * 100) / intMaxReviews);
								ratingAvg += intRating;
							}
							strHtmlListCell = strHtmlListCell.replace(/<NLRATING>/g, intRating);
							strHtmlListCell = strHtmlListCell.replace(/<GPR_AAE_BUNDLENAME>/g, strBundleName);
							strHtmlListCell = strHtmlListCell.replace(/<NLCOMPANYID>/g, nlapiGetContext().getCompany());
							strHtmlListResult += strHtmlListCell;
						}
						ratingAvg = Math.round(ratingAvg / intMaxReviewsCount);
						var strHtmlList = strHtmlListTpl;
						strHtmlList = strHtmlList.replace(/<GPR_AAE_BUNDLENAME>/g, strBundleName);
						strHtmlList = strHtmlList.replace(/<NLCOMPANYID>/g, nlapiGetContext().getCompany());
						var strCommentsRegExp = '<!--([^<]*)';
						var regExpComments = new RegExp(strCommentsRegExp, 'g');
						strHtmlList = strHtmlList.replace('<NLLISTRESULT>', strHtmlListResult).replace(regExpComments, '');

						recItem.setFieldValue('custitem_gpr_aae_crv_rating_n' + strSiteNumber, ratingAvg);
						recItem.setFieldValue('custitem_gpr_aae_crv_rating_count_n' + strSiteNumber, intMaxReviewsCount);
						recItem.setFieldValue('custitem_gpr_aae_crv_reviews_n' + strSiteNumber, strHtmlList);
						nlapiLogExecution('DEBUG', 'Update Item Rating and Reviews', "Review data - Average: "+ ratingAvg+ " Count: "+intMaxReviewsCount);
						nlapiSubmitRecord(recItem);
						nlapiLogExecution('DEBUG', 'Update Item Rating and Reviews', "Item Reviews Updated");
					}else{
						nlapiLogExecution('DEBUG', 'Update Item Rating and Reviews', "No reviews found");
						recItem.setFieldValue('custitem_gpr_aae_crv_rating_n' + strSiteNumber, 0);
						recItem.setFieldValue('custitem_gpr_aae_crv_rating_count_n' + strSiteNumber, 0);
						recItem.setFieldValue('custitem_gpr_aae_crv_reviews_n' + strSiteNumber, "");
						nlapiSubmitRecord(recItem);
						nlapiLogExecution('DEBUG', 'Update Item Rating and Reviews', "Item Reviews Updated");
					}
				} else {
					nlapiLogExecution('DEBUG', 'Update Item Rating and Reviews', 'Templates not set properly.');
				}
			} else {
				nlapiLogExecution('DEBUG', 'Update Item Rating and Reviews', 'Layout not Found.');
			}
		}
	} catch (ex) {
		if(!isNullOrUndefined(ex.getCode)) {// instanceof does not work on the server
			nlapiLogExecution('DEBUG', 'Update Item Rating and Reviews', 'NetSuite Error Code: ' + ex.getCode() + '. Details: ' + ex.getDetails());
		} else {
			nlapiLogExecution('DEBUG', 'Update Item Rating and Reviews', 'Javascript Error Code: 0. Details: ' + ex.message);
		}
	}	
	nlapiLogExecution('DEBUG', 'Update Item Rating and Reviews', '-----END-----');
}

function updateCustomerReviews(strType) {
	nlapiLogExecution('DEBUG', 'Update Customer Reviews', '----START----');
	var bolIsMultiSite = nlapiGetContext().getFeature('MULTISITE');
	var strLayoutId = nlapiGetContext().getSetting('SCRIPT', 'custscript_gpr_aae_crv_lyt_upd');
	var strApprovedReviewsValue = nlapiGetContext().getSetting('SCRIPT', 'custscript_gpr_aae_crv_apvedrvws_upd');
	var intMaxReviews = nlapiGetContext().getSetting('SCRIPT', 'custscript_gpr_aae_crv_maxrvws_udp');
	try {
		var recCustomerReview = null, strRecordId = nlapiGetRecordId(), strRecordType = nlapiGetRecordType();
		nlapiLogExecution('DEBUG', 'Update Customer Reviews', 'Type: ' + strType);
		var recCustomerReview = getUserEventRecord(strType, strRecordType, strRecordId);
		nlapiLogExecution('DEBUG', 'Update Customer Reviews', 'Type: ' + strType);
		if(!isNullOrUndefined(recCustomerReview)) {
			nlapiLogExecution('DEBUG', 'Update Customer Reviews', 'Customer Review Obj: ' + recCustomerReview.getId());
			var strItemId = recCustomerReview.getFieldValue('custrecord_gpr_aae_crv_itemid');
			var strSiteNumber = recCustomerReview.getFieldValue('custrecord_gpr_aae_crv_sitenumber');
			if(checkLicense(strSiteNumber, 'crv')) {
				nlapiLogExecution('DEBUG', 'Update Item Rating and Reviews', 'License Correct');
				var arrFiltersItem = [], arrColumnsItem = [];
				arrFiltersItem.push(new nlobjSearchFilter("internalid", null, "is", strItemId));
				if(bolIsMultiSite) {
					arrFiltersItem.push(new nlobjSearchFilter("website", null, "is", strSiteNumber));
				}
				arrColumnsItem.push(new nlobjSearchColumn('custitem_gpr_aae_crv_reviews_n' + strSiteNumber));
				var arrSearchResultsItems = nlapiSearchRecord('item', null, arrFiltersItem, arrColumnsItem);
				if(!isEmptyArray(arrSearchResultsItems)) {					
					var strId = arrSearchResultsItems[0].getId();
					var strItemType = arrSearchResultsItems[0].getRecordType();
					nlapiLogExecution('DEBUG', 'Update Customer Reviews', 'Item Found - id:' + strId +", type: " + strItemType);
					var recTargetItem = nlapiLoadRecord(strItemType, strId);
					var objReviewData = {						
						"layoutId" : strLayoutId,
						"approvedReviewsValue" : strApprovedReviewsValue,
						"maxReviews" : intMaxReviews,
						"targetItem" : recTargetItem,
						"siteNumber" : strSiteNumber
					};				
					updateItemRatingAndReviews(objReviewData);
					nlapiLogExecution('DEBUG', 'Update Customer Reviews', 'Item Review up to date');
				}
			} else {
				nlapiLogExecution('ERROR', 'Update Customer Reviews', 'Customer Reviews functionality is disabled for the site number: ' + strSiteNumber);
			}
		}
	} catch (ex) {
		if(!isNullOrUndefined(ex.getDetails)) {
			nlapiLogExecution('ERROR', 'Process Error', ex.getCode() + ': ' + ex.getDetails());
		} else {
			nlapiLogExecution('ERROR', 'Unexpected Error', ex.toString());
		}
	}
	nlapiLogExecution('DEBUG', 'Update Customer Reviews', 'Remaining usage: ' + nlapiGetContext().getRemainingUsage());
	nlapiLogExecution('DEBUG', 'Update Customer Reviews', '-----END-----');
}

function deleteAllReviews() {
	var arrSearchResults = nlapiSearchRecord('customrecord_gpr_aae_crv', null, null, null);
	if(arrSearchResults != null && arrSearchResults.length > 0) {
		for(var i = 0; i < arrSearchResults.length; i++) {
			nlapiDeleteRecord(arrSearchResults[i].getRecordType(), arrSearchResults[i].getId());
		}
	}
}