var AdvPromo;
if (!AdvPromo) { AdvPromo = {}; }

AdvPromo.SublistManager = new function SublistManager() {
	
	this.translationObj = {};
	
	// copy of old implementation
	this.isHTMLElement = function(theElement) {
		var HTMLElement;
		if (!theElement) return false;
		if (HTMLElement) { 
			return (theElement instanceof HTMLElement);
		} else {
			// For IE < 8 or IE 9 in QuirksMode
			return ((theElement.nodeType == 1) || (theElement.nodeType == 3));
		}
	};
	
	// adds a row in the sublist via jQuery. copy of old implementation
	this.addSublistRow = function(tableId, theValues) {
		var className;
		var i;
		var newCol;
		var values;

		// Table Name is sublist name with suffix "_splits"
		// var theTable = document.getElementById(tableId + "_splits");
		var theTable = $('#' + tableId + '_splits');

		var row = theTable[0].rows.length - 1; // decrement by 1 to not include the header

		// Initial content of first non-header row if no content is "No records to show".
		// Delete this row
		var firstRow = theTable.children().children(':nth-child(2)');
		if ((row == 1) && (!(firstRow.attr('id')))) {
			firstRow.remove();
			row = 0;
		}

		var newRow = $('<tr>');

		// Row ID is sublistName + "row" + rownumber
		// rownumber is zero (1st row) to n..
		newRow.attr('id', (tableId + 'row' + (row)));

		// CSS cladd ID for line. Alternating styles/color for each row.
		if (row % 2)
			className = 'listtext';
		else
			className = 'listtexthl';

		// Do not call directly from popup window! Passed array will not be
		// detected as intance of Array, but an instanceof Object.
		if (theValues instanceof Array) {
			values = theValues;
		} else {
			values = [ theValues ];
		}

		for (i = 0; i < values.length; i++) {
			newCol = $('<td>');
			newCol.attr('id', (tableId + 'col' + (row) + (i)));
			if (this.isHTMLElement(values[i]))
				newCol.append(values[i]);
			else
				newCol.text(values[i]);
			newCol.attr('class', className);
			newRow.append(newCol);
		}
		theTable.children().append(newRow);
	};
	
	// creates the link in sublist row. a refactored version of old implementation
	this.makeSublistLink = function(linkText, funcHandler, funcParams) {

		var LinkHandler = function(onClickFunc, funcParams) {

			var funcName = onClickFunc;
			
			this.action = function() {
				if (funcName) funcName(funcParams);
			};
		};

		var anch = $('<a>');
		var linkHandler = new LinkHandler(funcHandler, funcParams);
		anch.click(linkHandler.action);
		anch.text(linkText);
		anch.css('cursor', 'pointer');
		anch.css('text-decoration', 'underline');
		return anch[0];
	};
	
	this.findIndexOfMatchingEligibleCustomerModel = function(modelParam, modelList){
		var ret = null;
		
		if(modelList && modelParam){
			for(var i = 0; i < modelList.length; i++){
				// if recId is same, a match is found
				if(modelParam.recId == modelList[i].recId){
					return i;
				}
			}
		}
		
		return ret;
	};
	
	this.addEligibleCustomerRow = function(obj, modelIndex) {
		var theType = 'custpage_advpromo_eligible_customer_list';
		var theTable = $('#' + theType + '_splits'); // jQuery syntax

		// remove first row that contains 'No records to show'?
		var rows = theTable[0].rows.length - 1;
		var firstRow = theTable.children().children(':nth-child(2)');
		if ((rows == 1) && (!(firstRow.attr('id')))) {
			firstRow.remove();
			rows = 0;
		}
		
		var linkParams = {};
		linkParams.modelIndex = modelIndex;
				
		var deleteAnch = this.makeSublistLink(AdvPromo.PromotionCs.sublistMgr.translationObj.REMOVE, this.removeEligibleCustomerRow, linkParams);
		var editAnch = this.makeSublistLink(AdvPromo.PromotionCs.sublistMgr.translationObj.EDIT, this.editEligibleCustomerRow, linkParams);

		switch (parseInt(obj.type)) {
			case AdvPromo.GlobalConstants.CONST_ELIGIBILITY_CUSTOMER_TYPE_CUSTOMER:
				var names = obj.name.join(' ' + AdvPromo.PromotionCs.sublistMgr.translationObj.TEXT_OR + ' '); 
				this.addSublistRow(theType, [ names, names, "", editAnch, deleteAnch ]);
				
				break;
			case AdvPromo.GlobalConstants.CONST_ELIGIBILITY_CUSTOMER_TYPE_SAVED_SEARCH:
				linkParams.searchId = obj.id;
				var previewAnch = this.makeSublistLink(AdvPromo.PromotionCs.sublistMgr.translationObj.PREVIEW, this.previewEligibleCustomerSublistRow, linkParams);
				this.addSublistRow(theType, [ obj.name, obj.desc, previewAnch, editAnch, deleteAnch ]);
				
				break;
		}
	};
	
	this.editEligibleCustomerRow = function (params) {
		
		var modelIndex = params.modelIndex;
		var type = AdvPromo.PromotionCs.eligibleCustomersObj[modelIndex].type;
		
		var url = '', width = '', height = '', title = '';
		switch(parseInt(type)){
			case AdvPromo.GlobalConstants.CONST_ELIGIBILITY_CUSTOMER_TYPE_CUSTOMER:
				url = nlapiResolveURL('SUITELET', 'customscript_ap_select_customers_sl', 'customdeploy_ap_select_customers_sl');
				url += '&cid=' + encodeURIComponent(AdvPromo.PromotionCs.eligibleCustomersObj[modelIndex].id) + '&idx=' + modelIndex;
				
				title = AdvPromo.PromotionCs.sublistMgr.translationObj.POPUP_TITLE_EDIT_SELECT_CUSTOMERS; 
				height = 200;
				width = 400;
				
				break;
			case AdvPromo.GlobalConstants.CONST_ELIGIBILITY_CUSTOMER_TYPE_SAVED_SEARCH:
				url = nlapiResolveURL('SUITELET', 'customscript_ap_select_custsrch_sl', 'customdeploy_ap_select_custsrch_sl');
				url += '&sid=' + encodeURIComponent(AdvPromo.PromotionCs.eligibleCustomersObj[modelIndex].id) + '&idx=' + modelIndex 
					+ '&desc=' + encodeURIComponent(AdvPromo.PromotionCs.eligibleCustomersObj[modelIndex].desc);
				
				title = AdvPromo.PromotionCs.sublistMgr.translationObj.POPUP_TITLE_EDIT_SELECT_CUSTOMER_SAVED_SEARCH;
				height = 200;
				width = 650;
				
				break;
		}

		nlExtOpenWindow(url, AdvPromo.GlobalConstants.CONST_POPUP_WINNAME, width, height, 0, 0, title);
	};
	
	this.removeEligibleCustomerRow = function(params) {
		
		// update the main model directly
		var modelIndex = params.modelIndex;
		window.parent.AdvPromo.PromotionCs.eligibleCustomersObj[modelIndex].op = 'D';
		window.parent.AdvPromo.PromotionCs.sublistMgr.renderEligibilityCustomerSublistEditMode(true); 
		
	};
	
	this.previewEligibleCustomerSublistRow = function(params) {
		var mainUrl = window.location.href;
		var index = mainUrl.indexOf('/app');
		var baseUrl = mainUrl.substring(0, index);
		
		var url = baseUrl + "/app/common/search/searchresults.nl?searchid=" + params.searchId;
		var title = AdvPromo.PromotionCs.sublistMgr.translationObj.TEXT_SEARCH_RESULTS;
		var height = 550;
		var width = 700;
				
		nlExtOpenWindow(url, AdvPromo.GlobalConstants.CONST_POPUP_WINNAME, width, height, 0, 0, title);
	};
	
	this.renderEligibilityCustomerSublistEditMode = function(windowChanged){
		
		var tableId = 'custpage_advpromo_eligible_customer_list';
		
		try{
			var parentSublistModel = AdvPromo.PromotionCs.eligibleCustomersObj;
//			alert(JSON.stringify(parentSublistModel));
			
			// clear the sublist 
			var theTable = $('#' + tableId + "_splits");
			var rows = theTable[0].rows.length - 1;
			for(var i = 0; i < rows; i++){
				theTable.children().children(':nth-child(2)').remove(); // +2 since nth-child starts at 1, then add 1 more to skip table header 
			}
						
			if(parentSublistModel) {
				// add all the rows in the sublist
				for(var i = 0; i < parentSublistModel.length; i++){
					var rowModel = parentSublistModel[i];
					if(rowModel.op != 'D'){
						this.addEligibleCustomerRow(rowModel, i);	
					}
				}
			}
			
			// to hide the 'Record is not modified' message
			if(windowChanged){
				setWindowChanged(window, true);	
			}
						
			// TODO: show 'No records to show' if sublist is empty. needs translation
		}
		catch(e){
			alert('Error in renderEligibilityCustomerSublistEditMode(). ' + e);
		}
	};
	
	this.initializeEligibilityCustomerSublistModel = function(transObj){
		
		try{
			// parse the JSON from the hidden field
			var jsonStr = nlapiGetFieldValue('custpage_advpromo_elig_json_customer');
			if(jsonStr){
				// set the old and new model
				AdvPromo.PromotionCs.eligibleCustomersObj = JSON.parse(jsonStr);
				AdvPromo.PromotionCs.origEligibleCustomersObj = JSON.parse(jsonStr);
			}
			
			// set the obj that contains all translated strings
			this.translationObj = transObj;
		}
		catch(e){
			alert('Error in initializeEligibilityCustomerSublistModel(). ' + e);
		}
	};
	
	this.constructEligibleCustomerDbOperation = function(oldModel, newModel) {
		var ret = [];
		
		try{
			oldModel = oldModel || [];
			newModel = newModel || [];
			
			for(var i = 0; i < newModel.length; i++){
				var finalModel = {};
				
				var currRowModel = newModel[i];
				var matchIndex = this.findIndexOfMatchingEligibleCustomerModel(currRowModel, oldModel);
				var matchingOldModel = {op: ''};
				if(matchIndex != null){
					matchingOldModel = oldModel[matchIndex];
				}
				
				switch(currRowModel.op){
					case '':
						// do nothing. go to next row
						
						break;
					case 'A':
						finalModel.op = 'A';
						finalModel.id = currRowModel.id;
						finalModel.type = currRowModel.type;
						finalModel.desc = currRowModel.desc;
						
						ret.push(finalModel);
						
						break;
					case 'E':
						if(matchingOldModel.recId){
							// if record is already in DB
							finalModel.op = 'E';
							finalModel.recId = matchingOldModel.recId; 
							finalModel.id = currRowModel.id;
							finalModel.type = currRowModel.type;
							finalModel.desc = currRowModel.desc;
						}
						else{
							// if new record
							finalModel.op = 'A';
							finalModel.id = currRowModel.id;
							finalModel.type = currRowModel.type;
							finalModel.desc = currRowModel.desc;
						}
						
						ret.push(finalModel);
						
						break;
					case 'D':
						if(matchingOldModel.recId){
							// if record is already in DB
							finalModel.op = 'D';
							finalModel.recId = matchingOldModel.recId;
							
							ret.push(finalModel);
						}

						break;
				}
			}	
		}
		catch(e){
			alert('Error in constructEligibleCustomerDbOperation(). ' + e);
		}
		
		return ret;
	};
};