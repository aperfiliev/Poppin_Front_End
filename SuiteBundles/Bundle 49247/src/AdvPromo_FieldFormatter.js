var AdvPromo;
if (!AdvPromo) { AdvPromo = {}; }

AdvPromo.FieldFormatter = new function FieldFormatter() {
	
	var REC_AUTOPOST = 'customrecord_advpromo_ssearch_select';
	var FLD_AUTOPOST_RECORDTYPE = 'custrecord_advpromo_sssetup_rec_type';
	var FLD_AUTOPOST_SEARCH = 'custrecord_advpromo_sssetup_saved_search';
	var FLD_AUTOPOST_SEARCHTYPE = 'custrecord_advpromo_sssetup_search_type';
	
	this.truncateText = function(inputText, maxLength) {
		if (!inputText) return null;
		
		var length = (isNaN(maxLength)) ? 300 : maxLength;
		if (inputText.length <= length) return inputText;
		
		return (inputText.substring(0, (length > 3) ? (length - 3) : length) + '...');
	};
	
	this.retrieveSavedSearchesOfScriptedRecord = function(scriptedRecordId){
	    
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
	};
};