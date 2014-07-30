/* 
 * Updates the image gallery fields
 */
function updateItemGalleryImages(type) {
	nlapiLogExecution("DEBUG", "updateItemGalleryImages", "Starting");
	try{
		var item;
		if (type == "edit") {
			item = nlapiLoadRecord(nlapiGetRecordType(), nlapiGetRecordId());
		} else if (type = "create") {
			item = nlapiGetNewRecord();
		} else
			return;
		
		//Thumbnail:
		var fieldValue = item.getFieldValue("storedisplaythumbnail");
		if(fieldValue) {
			var objFile = nlapiLoadFile(fieldValue);
			item.setFieldValue("custitem_display_thumbnail", 'http://cdn-web.poppin.com' + unescape(objFile.getURL()));
		}
		
		//Media image:
		fieldValue = item.getFieldValue("storedisplayimage"); 
		if(fieldValue) {
			var objFile = nlapiLoadFile(fieldValue);
			item.setFieldValue("custitem_display_image", 'http://cdn-web.poppin.com' + unescape(objFile.getURL()));
		}
		
		//Large image:
		fieldValue = item.getFieldValue("custitem_gpr_aae_imb_large_image_deft");
		if(fieldValue) {
			var objFile = nlapiLoadFile(fieldValue);
			item.setFieldValue("custitem_imb_large_image_deft", 'http://cdn-web.poppin.com' + unescape(objFile.getURL()));
		}
		
		//Promo item thumbnail:
		fieldValue = item.getFieldValue("custitem_promoitmthumb");
		if(fieldValue) {
			var objFile = nlapiLoadFile(fieldValue);
			item.setFieldValue("custitem_promo_item_thumbnail", 'http://cdn-web.poppin.com' + unescape(objFile.getURL()));
		}
		
		//As seen in - image 1
		fieldValue = item.getFieldValue("custitem_as_seen_image_1"); 
		if(fieldValue) {
			var objFile = nlapiLoadFile(fieldValue);
			item.setFieldValue("custitem_as_seen_img_1", 'http://cdn-web.poppin.com' + unescape(objFile.getURL()));
		}
		
		//As seen in - image 1
		fieldValue = item.getFieldValue("custitem_as_seen_image_2"); 
		if(fieldValue) {
			var objFile = nlapiLoadFile(fieldValue);
			item.setFieldValue("custitem_as_seen_img_2", 'http://cdn-web.poppin.com' + unescape(objFile.getURL()));
		}
		
		//Extra gallery images:
		for(var i = 1; i <= 19; i++) {
			//Thumbnail
			fieldValue = item.getFieldValue("custitem_gpr_aae_imb_thumb_image_" + i); 
			if(fieldValue) {
				var objFile = nlapiLoadFile(fieldValue);
				item.setFieldValue("custitem_imb_thumb_image_" + i, 'http://cdn-web.poppin.com' + unescape(objFile.getURL()));
			}
			
			//Media:
			fieldValue = item.getFieldValue("custitem_gpr_aae_imb_media_image_" + i); 
			if(fieldValue) {
				var objFile = nlapiLoadFile(fieldValue);
				item.setFieldValue("custitem_imb_media_image_" + i, 'http://cdn-web.poppin.com' + unescape(objFile.getURL()));
			}
			
			//Large:
			fieldValue = item.getFieldValue("custitem_gpr_aae_imb_large_image_" + i); 
			if(fieldValue) {
				var objFile = nlapiLoadFile(fieldValue);
				item.setFieldValue("custitem_imb_large_image_" + i, 'http://cdn-web.poppin.com' + unescape(objFile.getURL()));
			}
		}
		nlapiSubmitRecord(item);
	}catch(e){
		getErrorMessage(e, "itemUpdate");
	}
}

function getErrorMessage(objException, strContext){
	var objErr = {};
	objErr.Error = {};
	if (!!objException.getCode){
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