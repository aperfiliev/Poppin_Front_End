
if (!Celigo) {
    var Celigo = {};
}

Celigo.IncludeExtJS = (function(){
    return {
    
        beforeLoad: function(type, form, response){
        
            try {
				var nlobjContext = nlapiGetContext();
            
                if (nlobjContext.getExecutionContext() !== 'userinterface') 
                    return;
                
                if (type.toLowerCase() === "edit" || type.toLowerCase() === "view" || type.toLowerCase() === "create" || type.toLowerCase() === "copy") {
                
                    if (!form.getField('custitem_celigo_mg_exportimages')) 
                        return;
                    
                    var recid = nlapiGetRecordId();
                    
                    var htmlContent = form.addField('custpage_inlinehtml', 'inlinehtml', null, null);
                    if (type.toLowerCase() === 'view') {
                        form.setScript('customscriptceligo_magento_ic_view_mode');
                    }
                    
                    var extjsUrlPrefix = nlobjContext.getSetting('SCRIPT', 'custscript_celigo_extjs_url_prefix');
                    
                    
                    //htmlStr = '<script type="text/javascript" src="' + extjsUrlPrefix + 'adapter/ext/ext-base.js"></script>';
                    //	var htmlStr = '<script  type="text/javascript" src="' + extjsUrlPrefix + 'ext-all-debug.js"></script>';
                    var htmlStr = '<link rel="stylesheet" type="text/css" href="' + extjsUrlPrefix + 'resources/css/ext-all-gray-sandbox.css"/>';
                    htmlStr += '<script type="text/javascript" src="' + extjsUrlPrefix + 'builds/ext-all-sandbox-debug.js"></script>';
                    
                    
                    if (type.toLowerCase() === 'view') {
                        var record = nlapiLoadRecord('inventoryitem', nlapiGetRecordId());
                        var attribset = record.getFieldValue('custitem_celigo_mg_attributeset');
                        if (attribset) 
                            htmlStr += '<script  type="text/javascript"> var selectedAttributeSetId = "' + nlapiLookupField('customrecord_celigo_mg_attributeset', attribset, 'custrecord_form_configuration') + '"; var selectedAttributeSetValue = "' + record.getFieldText('custitem_celigo_mg_attributeset') + '";</script>';
                        htmlStr += '<style type="text/css"> .form-disabled { opacity : 1.0; } </style>';
                    }
                    
                    htmlContent.setDefaultValue(htmlStr);
                    
                }
                
            } 
            catch (e) {
                $.handleError(e, 'Celigo_MagentoIC_ItemUE.js');
            }
        } // before Load
    } // return
})();
