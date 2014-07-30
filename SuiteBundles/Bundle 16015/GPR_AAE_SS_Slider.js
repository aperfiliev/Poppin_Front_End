/**
 * Description: SuiteCommerce Advanced Features (Slider)
 *
 * @copyright (c) 2000-2012, NetSuite Inc.
 * @author fbuschiazzo 
*  @version 1.0
*/
/**
 * SLIDER IMAGES
 * objDataIn parameter contain the site number and the type of slide
 * 
 * The script return a JSON object, in the first returns the number of items found, 
 * at the following locations returns the elements which have a link and an image.  
 */

function sliderImages(objDataIn) {
	nlapiLogExecution("DEBUG", "Slider Images", "----START----");
	var arrFilters = [], arrSlider = [], arrColumns = [];
	try {		
		if(objDataIn.hasOwnProperty('request')) {
			nlapiLogExecution("DEBUG", "Slider Images", "Request value: " + objDataIn.request);
			var objRequest = JSON.parse(objDataIn.request);			

			arrFilters.push(new nlobjSearchFilter("isinactive", null, "is", "F"));

			if(objRequest.hasOwnProperty("Filters")) {
				getSearchFilters(objRequest.Filters, arrFilters);
			}
			
			if(objRequest.hasOwnProperty("Columns")) {
				getSearchColumns(objRequest.Columns, arrColumns);
			}
			
			var arrSearchResults = nlapiSearchRecord("customrecord_gpr_aae_sld", null, arrFilters, arrColumns);
			if(!isEmptyArray(arrSearchResults)) {
				nlapiLogExecution("DEBUG", "Slider Images", "Sliders Found: " + arrSearchResults.length);					
				for(var i = 0, len = arrSearchResults.length; i < len; i++) {
					var objSlider = getColumnsValues(arrSearchResults[i], arrColumns);
					arrSlider.push(objSlider);
				}
			}			
		}
	} catch(ex) {
		if(!isNullOrUndefined(ex.getDetails)) {
			nlapiLogExecution('ERROR', 'Process Error', ex.getCode() + ': ' + ex.getDetails());
		} else {
			nlapiLogExecution('ERROR', 'Unexpected Error', ex.toString());
		}
	}	
	nlapiLogExecution("DEBUG", "Slider Images", "Usage: " + nlapiGetContext().getRemainingUsage());
    nlapiLogExecution("DEBUG", "Slider Images", "-----END-----");
    return arrSlider;
}