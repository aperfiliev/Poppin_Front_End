/**
 * Module Description Here
 * You are using the default templates which should be customized to your needs.
 * You can change your user name under Preferences->NetSuite Plugin->Code Templates.
 * 
 * Version    Date            Author           Remarks
 * 1.00       18 Jan 2012     dembuscado
 *
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @return {void} Any output is written via response object
 */



var REC_AUTOPOST = 'customrecord_advpromo_ssearch_select';
var FLD_AUTOPOST_RECORDTYPE = 'custrecord_advpromo_sssetup_rec_type';
var FLD_AUTOPOST_SEARCH = 'custrecord_advpromo_sssetup_saved_search';
var FLD_AUTOPOST_SEARCHTYPE = 'custrecord_advpromo_sssetup_search_type';


function retrieveSavedSearchesOfScriptedRecord(scriptedRecordId){
	// simulate creating a new record in the client. To do so, recordmode needs to be set to dynamic
	var record = nlapiCreateRecord(REC_AUTOPOST, {
		recordmode: 'dynamic'
	});
	record.setFieldText(FLD_AUTOPOST_RECORDTYPE, scriptedRecordId);	//record type

	var st = record.getFieldValue(FLD_AUTOPOST_SEARCHTYPE);	//search type

	record.setFieldValue(FLD_AUTOPOST_SEARCHTYPE, st);	//search type

	var fld = record.getField(FLD_AUTOPOST_SEARCH);	//saved search
	var selectOptions = fld.getSelectOptions();

	return selectOptions;
}


function retrieveSelectedValuesAddAnother(tableId, selectionId, textId){
	var  selOptions = [];
	var textVal;

	$.tableSize = $('#' + tableId + ' tr').length;

	for (var i = 0 ; i < $.tableSize; i++){
		var id = $('#' + selectionId + i + ' option:selected').val();
		var name = $('#' + selectionId + i + ' option:selected').text();

		if(textId != null){
			textVal = $('#' + textId + i).val();  
		}else{
			textVal = null;
		}

		selOptions.push({"sval":id, "sname":name, "text":textVal});
	}

	return selOptions;
}

function isFeatureEnabled(featureId){
	var ret = false;

	if(featureId != null){
		var objContext = nlapiGetContext();
		if(objContext.getSetting("FEATURE", featureId) == 'T'){
			ret = true;
		}	
	}

	return ret;
}

function convertValueOfMultiselect(arrayValue){
	var ret = new Array(); // an array of key, value map
	
	if(arrayValue != null){
		for(var i = 0; i < arrayValue.length; i++){
			var obj = {};
			obj.key = arrayValue[i];
			obj.value = null;
			
			ret.push(obj);
		}
	}
	
	return ret;
}

function isValidItemTypes(arrayItemIds){
	var ret = true;
	var sid = 'customsearch_advpromo_item_types';
	
	// check if ALL items passed the valid types
	filters = new Array();
	filters[0] = new nlobjSearchFilter('internalid', null, 'anyof', arrayItemIds);
	columns = new Array();
	columns[0] = new nlobjSearchColumn('itemid');

	var searchObj = nlapiLoadSearch('item', sid);
	searchObj.addFilters(filters);
	searchObj.addColumns(columns);
	var searchResult = searchObj.runSearch();
	var searchResultArr = searchResult.getResults(0, arrayItemIds.length);
	
	if(searchResultArr != null){
		if(searchResultArr.length != arrayItemIds.length){
			ret = false; // this means that at least one of the arrayItemIds is not returned by saved search result, thus invalid
		}
	}
	else{
		ret = false;
	}
	
	return ret;
}