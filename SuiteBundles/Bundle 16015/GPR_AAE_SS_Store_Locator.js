/**
 * Description: SuiteCommerce Advanced Features (Store Locator)
 *
 * @copyright (c) 2000-2012, NetSuite Inc.
 * @author pbecco
*  @version 1.0
*/
 


function getStores(request,response){
    var fltLat = unescape(request.getParameter("dlat"));
    var fltLng = unescape(request.getParameter("dlng"));  
	var strSiteNumber = unescape(request.getParameter("siteNumber"));
    var intDistance = unescape(request.getParameter("ddistance"));
    var arrFilters = [], arrColumns = [], strStores = "", arrResult = [];
    nlapiLogExecution("DEBUG", "Get Stores", "----START----");   	
    try {
		if(checkLicense(strSiteNumber, 'stl')) {
			if (!isEmpty(fltLat) &&  !isEmpty(fltLng)  &&  !isEmpty(intDistance)){
				nlapiLogExecution("DEBUG", "Get Stores",  "Parameters OK - Latitude: " + fltLat + ", Longitude: " + fltLng + ", Distance: " + intDistance);                
				arrFilters.push(new nlobjSearchFilter("isinactive", null, "is", "F"));
				arrFilters.push(new nlobjSearchFilter("formulanumeric", null, "lessthan", intDistance));
				arrFilters[1].setFormula("(3959*ACOS(COS(" + radians(fltLat) + ")*COS(({custrecord_gpr_aae_stl_latitude}*3.1415926)/180)*COS((({custrecord_gpr_aae_stl_longitude}*3.1415926)/180)-(" + radians(fltLng) + "))+SIN(" + radians(fltLat) +")*SIN(({custrecord_gpr_aae_stl_latitude}*3.1415926)/180)))");
				arrColumns.push(new nlobjSearchColumn("name"));
				arrColumns.push(new nlobjSearchColumn("custrecord_gpr_aae_stl_latitude"));
				arrColumns.push(new nlobjSearchColumn("custrecord_gpr_aae_stl_longitude"));
				arrColumns.push(new nlobjSearchColumn("custrecord_gpr_aae_stl_address1"));                                
				arrColumns.push(new nlobjSearchColumn("custrecord_gpr_aae_stl_address2"));
				arrColumns.push(new nlobjSearchColumn("custrecord_gpr_aae_stl_city"));    
				arrColumns.push(new nlobjSearchColumn("custrecord_gpr_aae_stl_country"));
				arrColumns.push(new nlobjSearchColumn("custrecord_gpr_aae_stl_zipcode"));
				arrColumns.push(new nlobjSearchColumn("custrecord_gpr_aae_stl_state"));            
				arrColumns.push(new nlobjSearchColumn("custrecord_gpr_aae_stl_website"));
				arrColumns.push(new nlobjSearchColumn("custrecord_gpr_aae_stl_relatedentity"));
				arrColumns.push(new nlobjSearchColumn("formulanumeric"));
				arrColumns.push(new nlobjSearchColumn("custrecord_gpr_aae_stl_storephone"));
				
				arrColumns[11].setFormula("(3959*ACOS(COS(" + radians(fltLat) + ")*COS(({custrecord_gpr_aae_stl_latitude}*3.1415926)/180)*COS((({custrecord_gpr_aae_stl_longitude}*3.1415926)/180)-(" + radians(fltLng) + "))+SIN(" + radians(fltLat) +")*SIN(({custrecord_gpr_aae_stl_latitude}*3.1415926)/180)))").setFunction("roundToTenths");
				arrColumns[11].setSort();
				var arrSearchResults = nlapiSearchRecord("customrecord_gpr_aae_stl", null, arrFilters, arrColumns);
				if (!isEmptyArray(arrSearchResults)) {
					nlapiLogExecution("DEBUG", "Get Stores", "Stores Found: " + arrSearchResults.length);
					for (var i = 0; i < Math.min(100, arrSearchResults.length); i++) {                    
						var objItem = getColumnsValues(arrSearchResults[i], arrColumns);
						arrResult.push(objItem);
					}
				}else{
					nlapiLogExecution("DEBUG", "Get Stores", "Stores Found: ZERO STORES");    
				}
			}else{            
				nlapiLogExecution("ERROR", "Get Stores", "Invalid parameters");
				code = "-1";
				message = "Invalid parameters";
				response.setContentType("JSON");
				response.setHeader("Custom-Header-Status", "500");
				response.write( JSON.stringify( { "errorStatusCode": "500", "errorCode": code, "errorMessage": message, } ) );
        	}
			response.write(JSON.stringify(arrResult));
		}else {
			nlapiLogExecution('ERROR', 'Get Stores', 'Store Locator functionality is disabled for the site number: ' + strSiteNumber);
			response.setContentType("JSON");
			response.setHeader("Custom-Header-Status","403");
			response.write( JSON.stringify( { "errorStatusCode": parseInt(403).toString(), "errorCode": "-1", "errorMessage": 'Store Locator functionality is disabled for this site.', } ) );
		}
		
	}
    catch (ex) {
        if (!isNullOrUndefined(ex.getCode)) // instanceof does not work on the server
        {
            nlapiLogExecution("ERROR", "NetSuite Error details", ex.getCode() + ": " + ex.getDetails());
            var error = nlapiCreateError(e);
            code = error.getCode();
            message = error.getDetails();
			response.setContentType("JSON");
			response.setHeader("Custom-Header-Status", "500");
			response.write( JSON.stringify( { "errorStatusCode": parseInt(status).toString(), "errorCode": code, "errorMessage": message, } ) );
		}
        else {
            nlapiLogExecution("ERROR", "JavaScript Error details", ex.message);
            code = "-1";
            message = ex.message;
			response.setContentType("JSON");
			response.setHeader("Custom-Header-Status", "500");
			response.write( JSON.stringify( { "errorStatusCode": "500", "errorCode": code, "errorMessage": message, } ) );
        }
    }
    nlapiLogExecution('DEBUG', 'Get Stores', 'Usage: ' + nlapiGetContext().getRemainingUsage());
    nlapiLogExecution("DEBUG", "Get Stores", "-----END-----");    
}

function createStore(strType){
    nlapiLogExecution("DEBUG", "After Submit", "----START----");
    try {
        if (strType == 'delete') {
			nlapiLogExecution("DEBUG", "After Submit", "Delete Type");
            return;
        }
        else {
            if (strType == 'create' || strType == 'edit' || strType == 'xedit') {
                nlapiLogExecution("DEBUG", "After Submit", "Type: " + strType);
				var strStoreId = nlapiGetRecordId();
				var strRecordType = nlapiGetRecordType();
				var objStore = nlapiLoadRecord(strRecordType, strStoreId);
				var autocomplete = objStore.getFieldValue("custrecord_gpr_aae_stl_autocomplete");
				if(autocomplete == "T"){
					var strAddress = objStore.getFieldValue("custrecord_gpr_aae_stl_address1");
					var strCity = objStore.getFieldValue("custrecord_gpr_aae_stl_city");
					var strState = objStore.getFieldValue("custrecord_gpr_aae_stl_state");
					var strCountry = objStore.getFieldText("custrecord_gpr_aae_stl_country");
					var strZipcode = objStore.getFieldValue("custrecord_gpr_aae_stl_zipcode");
					var data = strAddress + ", " + strZipcode + ", " + strCity + ", " + strState + ", " + strCountry   
					data = data.replace(/\s/gi, "+");
					data = data.replace("#", "");
					data = data.replace("&", "");
					var url = "http://maps.googleapis.com/maps/api/geocode/json?address=" + data + "&sensor=true";
					var response = nlapiRequestURL(url,null);
					var body = response.getBody();
					var storeLocation = JSON.parse(body);
					if (storeLocation.status == "OK"){
						var lat = storeLocation.results[0].geometry.location.lat;
						var lng = storeLocation.results[0].geometry.location.lng;
						nlapiLogExecution("DEBUG", "Google Maps", "Address: " + data);
						nlapiLogExecution("DEBUG", "Google Maps", "Lat: " + lat);
						nlapiLogExecution("DEBUG", "Google Maps", "Lng: " + lng);
						var arrFields = ['custrecord_gpr_aae_stl_latitude','custrecord_gpr_aae_stl_longitude'];
						var arrValues = [lat,lng];
						nlapiSubmitField(strRecordType, strStoreId, arrFields, arrValues);
					}else{
						nlapiLogExecution("DEBUG", "After Submit", "Status: " + storeLocation.status);	
					}
				}else{
					nlapiLogExecution("DEBUG", "After Submit", "Autocomplete: FALSE");
				}
				nlapiLogExecution("DEBUG", "After Submit", "-----END-----");			
	 		}
        }
    }
    catch (ex) {
        if (!isEmpty(ex.getCode)) {
            nlapiLogExecution("DEBUG", "After Submit ", "Process Error", ex.getCode() + ": " + ex.getDetails());
        }
        else {
            nlapiLogExecution("DEBUG", "After Submit", "Unexpected Error", ex.toString());
        }
    }
	nlapiLogExecution("DEBUG", "After Submit", "Usage: " + nlapiGetContext().getRemainingUsage());
    nlapiLogExecution("DEBUG", "After Submit", "-----END-----");
}


function radians(fltValue){
	return ((fltValue*Math.PI)/180);
}