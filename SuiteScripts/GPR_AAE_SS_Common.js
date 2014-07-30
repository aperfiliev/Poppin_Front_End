/**
 * @author Gproxy Design Inc.
 * @copyright (c) 2010, Gproxy Design Inc. All rights reserved.
 * @version 2.0
 *
 * Gproxy doesn't allow to copy or change this code without Gproxy authorization. 
 * See http://www.gproxy.com/licenses/license01.pdf for the full license governing this code. 
 */

function getColumnsValues(nlapiSearchObjResult, arrColumns){
   var resultObj = {};
   for(var i=0; i < arrColumns.length; i++){
      var text = nlapiSearchObjResult.getText(arrColumns[i]);
      var value = nlapiSearchObjResult.getValue(arrColumns[i]);
      var objValue;
      //nlapiLogExecution("DEBUG", "Get Columns Values", "Column: " + arrColumns[i].getName() + ", Value " + value + ", Text " + text);
      if(text != null){
         objValue = {
            "internalid" : value,
            "name" : escape(text)
         };
      }else{
         objValue = escape(value);
      }
      resultObj[arrColumns[i].getName()] = objValue;
   }
   return resultObj;
}

function createSubList(objRecord,arrSubList,strSubListName,strContext){
	nlapiLogExecution("DEBUG", strContext, "Sublist " + strSubListName);
	for(var i = 0; i < arrSubList.length; i++) {		
		var objData = arrSubList[i];
		objRecord.selectNewLineItem(strSubListName);
		for(var strFieldName in objData) {
			if(objData.hasOwnProperty(strFieldName)) {
				nlapiLogExecution("DEBUG", strContext, "Field: " + strFieldName + ", Value :" + objData[strFieldName]);				
				objRecord.setCurrentLineItemValue(strSubListName, strFieldName, objData[strFieldName]);
			}
		}
		objRecord.commitLineItem(strSubListName);
	}
}

function getSearchFilters(arrInFilters,arrFilters){	
	for (var i=0; i < arrInFilters.length; i++) {
		//nlapiLogExecution("DEBUG", "Get Search Filters", "Filter: " + arrInFilters[i].name);
		arrFilters.push(new nlobjSearchFilter(arrInFilters[i].name, arrInFilters[i].join || null, arrInFilters[i].operator, arrInFilters[i].value1 , arrInFilters[i].value2));			  
	}
} 

function getSearchColumns(arrInColumns,arrColumns){
	for (var i=0; i < arrInColumns.length; i++) {
		//nlapiLogExecution("DEBUG", "Get Search Columns", "Column: " + arrInColumns[i].name);
		var objColumn = new nlobjSearchColumn(arrInColumns[i].name, arrInColumns[i].join || null, arrInColumns[i].summary);
		if (arrInColumns[i].hasOwnProperty('order')){
			nlapiLogExecution("DEBUG", "Get Search Columns", "Column Sort: " + arrInColumns[i].order);
			objColumn.setSort(arrInColumns[i].order);
		}
		arrColumns.push(objColumn);			  
	}
}

function getErrorMessage(objException, strContext){
	var objErr = {};
	objErr.Error = {};
	if (!isNullOrUndefined(objException.getCode)){
		objErr.Error.status = objException.getCode();
    	objErr.Error.message= objException.getDetails();
    	nlapiLogExecution("ERROR", strContext, "Unexpected error, code: " + objErr.Error.status + ", message: " + objErr.Error.message + ', stack: ' + objException.getStackTrace());
    }else {
    	objErr.Error.status = 'JavaScript Error';
    	objErr.Error.message= objException.message;
    	nlapiLogExecution("ERROR", strContext, "Unexpected error, code: " + objErr.Error.status + ", message: " + objErr.Error.message + ', name: ' + objException.name + ', stack: ' + objException.stack);
    }
    return objErr;
}

/**
 * Returns the record being handled by a user event script.
 */
function getUserEventRecord(strEventType, strRecordType, strRecordId){
	if(strEventType == "edit" || strEventType == "xedit"){
		nlapiLogExecution('DEBUG', 'getUserEventRecord', 'Editing: ' + strRecordType + ', Id: ' + strRecordId);
		return nlapiLoadRecord(strRecordType, strRecordId);
	}else if(strEventType == "delete"){
		nlapiLogExecution('DEBUG', 'getUserEventRecord', 'Deleting: ' + strRecordType + ', Id: ' + strRecordId);
		return nlapiGetOldRecord();
	}else if(strEventType == "create"){
		nlapiLogExecution('DEBUG', 'getUserEventRecord', 'Creating: ' + strRecordType + ', Id: ' + strRecordId);
		return nlapiGetNewRecord();
	}
	return null;
}

/** 
 * Converts a string to float.  If the string is not a number then it returns 0.00.
 *
 * @deprecated Use the forceParseFloat function of the string method instead
 * @param (string) strValue The string value to be converted to float.
 * @return float equivalent of the string value
 * @type float
 */
function forceParseFloat(strValue){
    var fltValue = parseFloat(strValue);
    
    if (isNaN(fltValue)) {
        return 0.00;
    }
    
    return fltValue;
}

/** 
 * Converts a string to an int.  If the string is not a number then it returns 0.
 *
 * @deprecated Use the forceParseInt function of the string method instead
 * @param (string) strValue The string value to be converted to int.
 * @return int equivalent of the string value
 * @type int
 */
function forceParseInt(strValue){
    if (isEmpty(strValue)) {
        return 0;
    }
    
    var intValue = parseInt(strValue.removeLeadingZeroes());    
    if (isNaN(intValue)) {
        return 0;
    }
    
    return intValue;
}

/** 
 * Determines if a string variable is empty or not.  An empty string variable
 * is one which is null or undefined or has a length of zero.
 *
 * @param (string) strValue The string value to test for emptiness.
 * @return true if the variable is empty, false if otherwise.
 * @type boolean
 * @throws nlobjError isEmpty should be passed a string value.  The data type passed is {x} whose class name is {y}
 * @see isNullOrUndefined
 */
function isEmpty(strValue){
    if (isNullOrUndefined(strValue)) {
		nlapiLogExecution("DEBUG", "Is Empty", "Is Null");
        return true;
    }    
    if (typeof strValue != 'string' && getObjectName(strValue) != 'String') {
		nlapiLogExecution("DEBUG", "Is Empty", "Is No String");
        return true; 
    }    
    if (strValue.length == 0) {
		nlapiLogExecution("DEBUG", "Is Empty", "Length = 0");
        return true;
    }
	if (strValue == "null") {
		nlapiLogExecution("DEBUG", "Is Empty", "Is Null String");
        return true;
    }    
	nlapiLogExecution("DEBUG", "Is Empty", "Is No Empty");
    return false;
}

function isEmptyArray(arrValue){
    if (isNullOrUndefined(arrValue)) {
        return true;
    }    
    if (getObjectName(arrValue) != 'Array') {
        return true; 
    }    
    if (arrValue.length == 0) {
        return true;
    }
	if (arrValue == "null") {
        return true;
    }    
    return false;
}

/** 
 * Determines if a variable is either set to null or is undefined.
 *
 * @param (object) value The object value to test
 * @return true if the variable is null or undefined, false if otherwise.
 * @type boolean
 */
function isNullOrUndefined(value){
    if (value == null) {
        return true;
    }	     
    if (value == undefined) {
        return true;
    }    
    return false;
}

/** 
 * Returns the object / class name of a given instance
 *
 * @param (obj) a variable representing an instance of an object
 * @return the class name of the object
 * @type string
 */
function getObjectName(obj){
    if (isNullOrUndefined(obj)) {
        return obj;
    }
    
    return /(\w+)\(/.exec(obj.constructor.toString())[1];
}

/** 
 * If the value of the first parameter is null or undefined then the second parameter
 * is returned.  Otherwise, the first parameter is returned.
 *
 * @param (object) source the parameter being tested
 * @param (object) destination the parameter returned if the first is null or undefined
 * @return the source, but if null, the destination
 * @type object
 * @throws nlobjError The parameters of this function must be of the same data type.
 */
function ifNull(source, destination){
    if (isNullOrUndefined(source)) {
        return destination;
    }
    
    if (typeof source != typeof destination) {
        throw nlapiCreateError('10004', 'The parameters of this function must be of the same data type.');
    }
    
    if (getObjectName(source) != getObjectName(destination)) {
        throw nlapiCreateError('10005', 'The parameters of this function must be of the same data type.');
    }
    
    
    return source;
}

/** 
 * If the value of the first parameter is an empty string, null or undefined then the second parameter
 * is returned.  Otherwise, the first parameter is returned.
 *
 * @param (string) stSource the parameter being tested
 * @param (string) stDestination the parameter returned if the first is null or undefined
 * @return the source, but if null, the destination
 * @type string
 * @throws nlobjError The parameters of this function must both be strings.
 */
function ifStringEmpty(stSource, stDestination){
    if (isEmpty(stSource)) {
        if (typeof stDestination != 'string' && getObjectName(stDestination) != 'String') {
            throw nlapiCreateError('10006', 'The parameters of this function must both be strings.');
        }
        
        return stDestination;
    }
    
    return stSource;
}

/** 
 * Returns the number of time units between two dates.  Valid time units are: milliseconds,
 * seconds, minutes, hour, day.  Time units are in absolute value.
 *
 * @param (Date) date1 first date
 * @param (Date) date2 second date
 * @param (Date) stTime represents what time unit to use as basis in computing the time difference
 *               between two dates.  Valid values: MS, SS, MI, HR, D
 *
 * @return number of time units between the two dates.
 * @type int
 * @throws nlobjError Both parameters should be of type Date
 * @throws nlobjError Only the following target time units are valid:  MS, SS, MI, HR, D
 *
 */
function timeBetween(date1, date2, stTime){
    if (getObjectName(date1) != 'Date' || getObjectName(date2) != 'Date') {
        throw nlapiCreateError('10008', 'Both parameters should be of type Date');
    }
    
    if (stTime != 'MS' && stTime != 'SS' && stTime != 'MI' && stTime != 'HR' &&
    stTime != 'D') {
        throw nlapiCreateError('10009', 'Only the following target time units are valid:  MS, SS, MI, HR, D');
    }
    
    // The number of milliseconds in one time unit
    var intOneTimeUnit = 1;
    
    switch (stTime) {
        case 'D':
            intOneTimeUnit *= 24;
        case 'HR':
            intOneTimeUnit *= 24 * 60;
        case 'MI':
            intOneTimeUnit *= 24 * 60 * 60;
        case 'SS':
            intOneTimeUnit *= 24 * 60 * 60 * 1000;
    }
    
    // Convert both dates to milliseconds
    var intDate1 = date1.getTime();
    var intDate2 = date2.getTime();
    
    // Calculate the difference in milliseconds
    var intDifference = Math.abs(intDate1 - intDate2);
    
    // Convert back to time units and return
    return Math.round(intDifference / intOneTimeUnit);
}

/** 
 * Returns the last day/number of days for a given month and year.
 *
 * @param (int) intMonth the month whose number of days/last day is being determined.
 * @param (int) intYear the year whose number of days/last day is being determined.
 *
 * @return last day/number of days of the month and year.
 * @type int
 * @throws nlobjError Valid months are from 0 (January) to 11 (December).
 *
 */
function daysInMonth(intMonth, intYear){
    if (intMonth < 0 || intMonth > 11) {
        throw nlapiCreateError('10010', 'Valid months are from 0 (January) to 11 (December).');
    }
    
    var lastDayArray = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    
    if (intMonth != 1) {
        return lastDayArray[intMonth];
    }
    
    if (intYear % 4 != 0) {
        return lastDayArray[1];
    }
    
    if (intYear % 100 == 0 && intYear % 400 != 0) {
        return lastDayArray[1];
    }
    
    return lastDayArray[1] + 1;
}


/** 
 * The purpose of this script is to check if the value passed to
 * it is empty or zero.
 *
 * @param (string) stValue the value being tested
 * @return true if the value is empty or zero, false if otherwise
 * @type boolean
 */
function isEmptyOrZero(stValue){
    if (isEmpty(stValue) || stValue == 0) {
        return true;
    }
    else {
        return false;
    }
}

/** 
 * Removing duplicate entries or values from a Javascript array.
 *
 * @param (Array) array the array being tested for duplicates
 * @return New array with no duplicate elements
 * @type Array
 */
function removeDuplicates(array){
    if (isNullOrUndefined(array)) {
        return array;
    }
    
    var arrNew = new Array();
    
    o: for (var i = 0, n = array.length; i < n; i++) {
        for (var x = 0, y = arrNew.length; x < y; x++) {
            if (arrNew[x] == array[i]) {
                continue o;
            }
        }
        
        arrNew[arrNew.length] = array[i];
    }
    
    return arrNew;
}

/** 
 * The purpose of this script is search value from the array
 *
 * @param (string) val the value being searched
 * @param (array) arr the array where the value is being searched
 * @return true if the value is found, false if otherwise.
 * @type boolean
 */
function inArray(val, arr){
    var bIsValueFound = false;
    
    for (var i = 0; i < arr.length; i++) {
        if (val == arr[i]) {
            bIsValueFound = true;
            break;
        }
    }
    
    return bIsValueFound;
}

// New methods under the String object

/** 
 * Converts a percent field returned in string format to its equivalent float value.
 * For example, if the nlapiGetCurrentLineItemValue is used to get the value of a percent
 * field, it returns a string like '25.0%'.  This function converts the string '25.0%'
 * to 0.25.
 *
 * @return the float value represented by the percentage, null if the value is in
 *          an invalid percentage format.
 * @type float
 */
String.prototype.toFloatPercent = function String_toFloatPercent(){
    if (this.trim().length < 2) {
        return null;
    }
    
    var flFloat = parseFloat(this.trim().substring(0, this.length - 1)) / 100;
    
    if (isNaN(flFloat)) {
        return null;
    }
    
    return flFloat;
};

/** 
 * Removes all leading and trailing spaces on the string object.
 *
 * @return the trimmed String object
 * @type String
 */
String.prototype.trim = function String_trim(){
    if (this === null) {
        return null;
    }
    
    return this.replace(/^\s*/, '').replace(/\s+$/, '');
};

/** 
 * Returns the left zero-padded number based on the number of digits
 *
 * @param (int) intTotalDigits Number of Digits
 * @return the zero-padded number based on the number of digits
 * @type String
 */
String.prototype.leftPadWithZeroes = function String_leftPadWithZeroes(intTotalDigits){
    var stPaddedString = '';
    
    if (intTotalDigits > this.length) {
        for (var i = 0; i < (intTotalDigits - this.length); i++) {
            stPaddedString += '0';
        }
    }
    
    return stPaddedString + this;
};

/** 
 * Removes leading zeroes from a string with a number value.  Useful in
 * calling parseInt.
 *
 * @return the string with leading zeroes already trimmed
 * @type String
 */
String.prototype.removeLeadingZeroes = function String_removeLeadingZeroes(){
    if (isEmpty(this)) {
        return this;
    }
    
    var stTrimmedString = this;
    
    for (var i = 0; i < stTrimmedString.length; i++) {
        if (stTrimmedString[i] === '0') {
            stTrimmedString = stTrimmedString.substring(1, stTrimmedString.length);
        }
        else {
            break;
        }
    }
    
    return stTrimmedString;
};

/** 
 * Convenience method under the String prototype calling
 * the forceParseInt function
 *
 * @return the value returned by the forceParseInt function giving
 * this string as its parameter
 * @type int
 */
String.prototype.forceParseInt = function String_forceParseInt(){
    return forceParseInt(this);
};

/** 
 * Convenience method under the String prototype calling
 * the forceParseFloat function
 *
 * @return the value returned by the forceParseFloat function giving
 * this string as its parameter
 * @type float
 */
String.prototype.forceParseFloat = function String_forceParseFloat(){
    return forceParseFloat(this);
};

/** 
 * Cleans a date string in MM/DD/YYYY format so that the nlapiStringToDate function
 * can work properly
 *
 * @return the cleaned date in string format for feed to nlapiStringToDate
 * @type string
 * @throws nlobjError Clean up for date cannot act on an empty string.
 */
String.prototype.cleanUpForDate = function String_cleanUpForDate(){
    if (isEmpty(this)) {
        throw nlapiCreateError('10002', 'Clean up for date cannot act on an empty string.');
    }
    
    return this.replace(/\/(\d+)\//g, cleanUpDay);
};

/** 
 * Convenience method to converts a string to date
 *
 * @return date equivalent of the string
 * @type Date
 */
String.prototype.toDate = function String_toDate(){
    if (isEmpty(this)) {
        return null;
    }
    
    return nlapiStringToDate(this.cleanUpForDate());
};

/**
 * COMMON CHECK ADDONS LICENSE
 * @param {Object} strSiteNumber
 */
function checkLicense(strSiteNumber,strAddon) {		
	return true;
	/**
	var nlobjResponse = nlapiRequestURL('http://www.gproxy.com/license/license.xml');	
	if (nlobjResponse.getCode() != 200){
		nlapiLogExecution("DEBUG", "Addons License", "Response Code: " + nlobjResponse.getCode());				            
        return false;
    }else{	
		var objLicenseXml = nlapiStringToXML(nlobjResponse.getBody());	
		if (!isNullOrUndefined(objLicenseXml)) {
			var strXPath = "//license[@account='" + nlapiGetContext().getCompany() + "']/site[@number='" + strSiteNumber + "']/addon[@name='" + strAddon + "']";
			var objSiteNode = nlapiSelectNode(objLicenseXml, strXPath);
			if (!isNullOrUndefined(objSiteNode)) {
				var strActive = nlapiSelectValue(objSiteNode, 'active');
				if (strActive.trim() == 'true') {
					return true;
				}				
			}		
		}	
		return false;					
	}	*/
}