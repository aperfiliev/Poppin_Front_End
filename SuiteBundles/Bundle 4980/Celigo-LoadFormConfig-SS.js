 
if (!Celigo) {
    var Celigo = {};
}


Celigo.LoadFormConfig = function(){
	
	//var formConfigElemMap = {};
	
	this.read = function(uiCompId){
		
		
		
		if (!uiCompId) {
			nlapiLogExecution('ERROR', 'Error', 'Form Configuration is not set for this Attribute Set');
			return [];
		}
    
        var uiElems = $.search('customrecord_celigo_paas_ui_element', null, new nlobjSearchFilter('custrecord_celigo_paas_ui_el_parent', null, 'anyof', uiCompId), ['custrecord_celigo_paas_ui_el_type', 'custrecord_celigo_paas_ui_el_valid_exp', 'custrecord_celigo_paas_ui_el_is_mandator', 'custrecord_celigo_paas_ui_el_is_readonly', 'custrecord_celigo_paas_ui_el_show_trigge', 'custrecord_celigo_paas_ui_el_combo_recor', 'custrecord_celigo_paas_ui_el_combo_field', 'custrecord_celigo_paas_ui_el_combo_ss', 'internalid', 'name', 'custrecord_celigo_paas_ui_el_position', 'custrecord_celigo_paas_ui_el_ns_field_id']);
        
        if (uiElems && uiElems.length > 0) {
            var formConfig = [];
            for (var j = 0; j < uiElems.length; j++) {
			
	           var comboValues = [];
                if (uiElems[j].getValue('custrecord_celigo_paas_ui_el_type') === '2') /*Combo Box*/ {
                
                    var resvalues = $.search('customrecordceligo_paas_ui_element_value', null, new nlobjSearchFilter('custrecord_celigo_paas_ui_element', null, 'is', uiElems[j].getId()), ['custrecord_celigo_paas_ui_elem_val_key', 'custrecord_celigo_paas_ui_elem_val_value', 'custrecord_celigo_paas_ui_el_vl_position']);
                    
                    for (var k = 0; resvalues && k < resvalues.length; k++) {
                    
                        comboValues.push({
                            position: resvalues[k].getValue('custrecord_celigo_paas_ui_el_vl_position'),
                            key: resvalues[k].getValue('custrecord_celigo_paas_ui_elem_val_key'),
                            value: resvalues[k].getValue('custrecord_celigo_paas_ui_elem_val_value')
                        });
                        
                        //   nlapiLogExecution('DEBUG', 'combovalue', comboValues[(resvalues[k].getValue('custrecord_celigo_paas_ui_elem_val_key'))]);
                    }
                    
                    comboValues.sort(function(x, y){
                        if ((x.position && y.position) && (parseInt(x.position, 10) - parseInt(y.position, 10)) !== 0) 
                            return (parseInt(x.position) - parseInt(y.position));
                        return ((x.value === y.value) ? 0 : ((x.value > y.value) ? 1 : -1));
                        
                    });
                    
                }
                
				var curFormConfig = 			
				 {
                    elemtype: uiElems[j].getValue('custrecord_celigo_paas_ui_el_type'),
                    validexp: uiElems[j].getValue('custrecord_celigo_paas_ui_el_valid_exp'),
                    mandatory: uiElems[j].getValue('custrecord_celigo_paas_ui_el_is_mandator'),
                    readonly: uiElems[j].getValue('custrecord_celigo_paas_ui_el_is_readonly'),
                    trigger: uiElems[j].getValue('custrecord_celigo_paas_ui_el_show_trigge'),
                    comborecordid: uiElems[j].getValue('custrecord_celigo_paas_ui_el_combo_recor'),
                    comborecordfieldid: uiElems[j].getValue('custrecord_celigo_paas_ui_el_combo_field'),
                    combosavedsearch: uiElems[j].getValue('custrecord_celigo_paas_ui_el_combo_ss'),
                    combovalues: comboValues,
                    internalid: uiElems[j].getValue('internalid'),
                    name: uiElems[j].getValue('name'),
                    position: uiElems[j].getValue('custrecord_celigo_paas_ui_el_position'),
                    datakey: uiElems[j].getValue('custrecord_celigo_paas_ui_el_ns_field_id'),
                    id: uiElems[j].getId()
                };
				
				
                formConfig.push(curFormConfig);
               
            }

		        formConfig.sort(function(x, y){
                if (x.position && y.position && (parseInt(x.position) - parseInt(y.position)) !== 0) 
                    return (parseInt(x.position) - parseInt(y.position));
                return (parseInt(x.id) - parseInt(y.id));
                
            });
			
        }
        return formConfig;
    }
}
