/*
 *************************************************************************
 * The following javascript code is created by IT-Ration Consulting Inc.,
 * a NetSuite Partner. It is a SuiteFlex component containing custom code
 * intented for NetSuite (www.netsuite.com) and use the SuiteScript API.
 * The code is provided "as is": IT-Ration Consulting shall not be liable
 * for any damages arising out the intended use or if the code is modified
 * after delivery.
 *
 * Company:  	IT-Ration Consulting inc., www.it-ration.com
 * Author:      pete.vungoc@it-ration.com
 * File:   		ITR_GeneralLibrary.js
 * Date:       	June 1st 2009
 *
 *************************************************************************
 */
var LOGGING_EMAIL = 'logging@erpguru.com';

/**
 * This function verifies if usage metering is getting dangerously low If so, it schedules another
 * execution of the script, then throws an error to kill the current execution
 * 
 * @param {Integer} unitLimit if the remaining units is greater or equal to this unit limit, the
 * script is stopped and rescheduled.
 * @param {Array} params any parameters that need to be passed to the scheduled script execution.
 */
function verifyMetering(unitLimit, params) {
	if(isNaN(parseInt(unitLimit, 10))) {
		unitLimit = 50;
	}
	if(nlapiGetContext().getExecutionContext() == 'scheduled' && nlapiGetContext().getRemainingUsage() <= unitLimit) {
		nlapiLogExecution('audit', 'verifyMetering()', 'Metering low, scheduling another execution');
		nlapiScheduleScript(nlapiGetContext().getScriptId(), nlapiGetContext().getDeploymentId(), params);
		throw nlapiCreateError('METERING_LOW_ERR_CODE', 'Usage metering low, another execution has been scheduled', true);
	}
}

/**
 * This function trims all This set of Javascript functions trim or remove whitespace from the ends
 * of strings. These functions can be stand-alone or attached as methods of the String object. They
 * can left trim, right trim, or trim from both sides of the string. Rather than using a clumsy
 * loop, they use simple, elegant regular expressions.
 */
String.prototype.trim = function() {
	return this.replace(/^\s+|\s+$/g, "");
};
String.prototype.ltrim = function() {
	return this.replace(/^\s+/, "");
};
String.prototype.rtrim = function() {
	return this.replace(/\s+$/, "");
};
/**
 * This function is required when working with possible cases of xedit in beforeSubmit When
 * xediting, nlapiGetFieldValue() and nlapiGetNewRecord().getFieldValue() return null when reading a
 * field that was not changed by the xedit Therefore, if we want to read the value. we have to read
 * it by doing a whole nlapiLoadRecord(). However, a field that WAS submitted by xedit will return
 * its OLD value when read by nlapiLoadRecord(). So this function tries reading with
 * nlapiGetFieldValue() and only if that returns null does it read via nlapiLoadRecord()
 * 
 * @author Olivier Gagnon
 * @param {Object} loadedRecord : a reference to the record previously loaded via nlapiLoadRecord()
 * @param {Object} machineName : If working with line items, provide machine name. Otherwise set to
 * null
 * @param {Object} index : If working with line items, provide line item index number. Otherwise set
 * to null
 * @param {Object} fieldName : name of field to be read
 * 
 * @return the value of the read field
 */
function getXeditFieldValue(loadedRecord, machineName, index, fieldName) {
	var value = null;
	if(machineName != null && machineName != '') {
		value = nlapiGetLineItemValue(machineName, fieldName, index);
		if(value == null && loadedRecord != null) {
			value = loadedRecord.getLineItemValue(machineName, fieldName, index);
		}
	} else {
		nlapiLogExecution('debug', 'getXeditFieldValue', fieldName + ': ' + nlapiGetFieldValue(fieldName) + ' vs ' + loadedRecord.getFieldValue(fieldName));
		value = nlapiGetFieldValue(fieldName);
		if(value == null && loadedRecord != null) {
			value = loadedRecord.getFieldValue(fieldName);
		}
	}
	return value;
}

/**
 * Used to copy an array, rather than create a point to it
 * 
 * @param {Object} array
 * @return the copied array
 */
function copyArray(array) {
	var newArray = [];
	for( var i = 0; i < array.length; i++) {
		newArray[i] = array[i];
	}
	return newArray;
}

/**
 * Logs an error in NetSuite, whether it's and nlobjError object or a plain Javascript error.
 * 
 * @param {Object} err The nlobjError object or the plain Javascript error.
 * @param {Object} title The title that will be given to the error log.
 * @param {Object} emailAuthorID The internal ID of the active employee record which will be used as
 * the author of the emailed error log.
 */
function logError(err, title, emailAuthorID) {
	var msg = [];
	
	if(err.getCode != null) {
		msg.push('[SuiteScript exception]');
		msg.push('Error Code: {0}' + err.getCode());
		msg.push('Error Data: {0}' + err.getDetails());
		msg.push('Error Ticket: {0}' + err.getId());
		if(err.getInternalId) {
			msg.push('Record ID: {0}' + err.getInternalId());
		}
		if(err.getUserEvent) {
			msg.push('Script: {0}' + err.getUserEvent());
		}
		msg.push('User: {0}' + nlapiGetUser());
		msg.push('Role: {0}\n' + nlapiGetRole());
		
		var stacktrace = err.getStackTrace();
		if(stacktrace) {
			msg.push('Stack Trace');
			msg.push('\n---------------------------------------------');
			
			if(stacktrace.length > 20) {
				msg.push('**stacktrace length > 20**');
				msg.push(stacktrace);
			} else {
				msg.push('**stacktrace length < 20**');
				for( var i = 0; stacktrace != null && i < stacktrace.length; i++) {
					msg.push(stacktrace[i]);
				}
			}
		}
	} else {
		msg.push('[javascript exception]');
		msg.push('User: {0}' + nlapiGetUser());
		msg.push(err.toString());
	}
	
	nlapiLogExecution('error', title, msg);
	
	//MG Add to title the company ID and environment type, and email the error to our logging email.
	if(emailAuthorID != null && emailAuthorID != '' && !isNaN(emailAuthorID)) {
		var context = nlapiGetContext();
		var companyId = context.getCompany();
		var environment = context.getEnvironment();
		title = "An Error Has Occurred - " + title + '(NS Acct #' + companyId + ' ' + environment + ')';
		nlapiSendEmail(emailAuthorID, LOGGING_EMAIL, title, msg);
	}
}

/**
 * Create timer object to ensure execution time does not last more than 1 hour. USAGE: Initialize
 * your times in the first lines of code like this: var timer = createTimer(); timer.setStartTime();
 * Then, in the same way you'd use verifyMetering, call the time verifyer like this
 * timer.verifyTimeExec(requiredTime, params); requiredTime is the approximate amount of time you
 * need to complete the logic until the next time you verifyTimeExec
 */
function createTimer() {
	//Global time object used to easily track time
	var TIMER = {
		//Initialize the timer start time
		setStartTime : function() {
			d = new Date();
			time = d.getTime();
		},
		//Get the time that has gone by when the timer was started
		getDiff : function() {
			d = new Date();
			return(d.getTime() - time);
		},
		//function that reschedule the script if maximum time is exceeded
		verifyTimeExec : function(timeRequired, params) {
			if(timeRequired == null) {
				timeRequired = this.MIN_EXEC_TIME;
			}
			var leftTime = this.MAXIMUM_EXEC_TIME - this.getDiff();
			if(nlapiGetContext().getExecutionContext() == 'scheduled' && leftTime < timeRequired) {
				nlapiLogExecution('audit', 'verifyTimeExec()', 'Time left of scheduled script is low, scheduling another execution');
				nlapiScheduleScript(nlapiGetContext().getScriptId(), nlapiGetContext().getDeploymentId(), params);
				throw nlapiCreateError('TIME_LOW_ERR_CODE', 'Time left for scheduled script is low, another execution has been scheduled', true);
			}
		},
		MAXIMUM_EXEC_TIME : 3600000,
		MIN_EXEC_TIME : 900000
	
	};
	
	return TIMER;
}

/**
 * This function returns the appropriate base Netsuite URL based on the environent (Prod, Beta,
 * Sandbox) example: 'https://system.netsuite.com/' or 'https://system.sandbox.netsuite.com'
 */
function getBaseNetsuiteURL() {
	var baseUrl = 'https://system.netsuite.com/';
	
	var environment = nlapiGetContext().getEnvironment();
	switch(environment) {
		case 'SANDBOX' :
			baseUrl = 'https://system.sandbox.netsuite.com/';
			break;
		case 'PRODUCTION' :
			baseUrl = 'https://system.netsuite.com/';
			break;
		case 'BETA' :
			baseUrl = 'https://system.beta.netsuite.com/';
			break;
	}
	//nlapiLogExecution('audit','base NS URL is',baseUrl);
	return baseUrl;
}


/**
 * Will delete the provided recordType and recordId while also attempting to log the deletion by sending an email with the 
 * stringified record details. Email will be sent from logEmailAuthor to logEmailRecipient
 * NOTE: In order to stringify the record, this function must use nlapiLoadRecord().
 * @param {Object} recordType : Netsuite record type
 * @param {Object} recordId : Record Internal ID
 * @param {Object} logEmailAuthor : The Internal ID of an active Employee. If left empty, the function will attempt to use the currently logged in user. 
 * 									If that is no possible, will try to default to -5, which is the original provionned user.
 * @param {Object} logEmailRecipient: An email address to send the log too. If not provided, will default to logging@erpguru.com
 */
function deleteAndLog(recordType, recordId, logEmailAuthor, logEmailRecipient){
		var stringObject = null;
		try {
			stringObject = JSON.stringify(nlapiLoadRecord(recordType, recordId));
		}catch(stringifyFail){
			//do nothing
		}
		
		nlapiDeleteRecord(recordType, recordId);	//if the delete fails, the error will stop the rest of the code from happening
		
		if (stringObject != null) {
			nlapiLogExecution('audit','DELETION',stringObject);
		
			if (logEmailRecipient == '' || logEmailRecipient == null) {
				logEmailRecipient = 'logging@erpguru.com';
			}
			
			if (isNaN(logEmailAuthor)) {
				logEmailAuthor = nlapiGetUser();
				if (logEmailAuthor == -4) { //-4 is the unidentified -System- user
					logEmailAuthor = -5; //-5 is the default admin... not always a valid choice, but it's worth a shot
				}
			}
			
			var subject = 'Acct ' + nlapiGetContext().getCompany() + ' Record Deletion: ' + recordType + ' ' + recordId;
			
			try {
				nlapiSendEmail(logEmailAuthor, logEmailRecipient, subject, stringObject);
			} catch (errEmail) {
				nlapiLogExecution('error', 'Could not send deletion email', errEmail.message);
			}
		}
}

/**
 * Converts a textual item type into a ID-style item type and returns it.
 * This is mainly used to convert the the value of nlapiGetCurrentLineItemValue('item','itemtype') into a useable system value
 * @param {Object} textName the textual item type
 */
function convertItemType(textName){
    var internalid = textName;
    switch (textName) {
        case 'Assembly':
            internalid = 'assemblyitem';
            break;
        case 'Description':
            internalid = 'descriptionitem';
            break;
        case 'Discount':
            internalid = 'discountitem';
            break;
        case 'InvtPart':
            internalid = 'inventoryitem';
            break;
        case 'Group':
            internalid = 'itemgroup';
            break;
        case 'Kit':
            internalid = 'kititem';
            break;
        case 'Markup':
            internalid = 'markupitem';
            break;
        case 'NonInvtPart':
            internalid = 'noninventoryitem';
            break;
        case 'OthCharge':
            internalid = 'otherchargeitem';
            break;
        case 'Payment':
            internalid = 'paymentitem';
            break;
        case 'Service':
            internalid = 'serviceitem';
            break;
        case 'Subtotal':
            internalid = 'subtotalitem';
            break;
		case 'GiftCert':
			internalid = 'giftcertificate';
    }
    return internalid;
}