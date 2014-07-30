
/*
 * 2005-2008 Celigo, Inc. All Rights Reserved.
 *
 * Version:    1.0.0
 * Type:       Client
 *
 * Purpose:
 *    <What the script does>
 *
 * Revisions:
 *    <Date in MM/DD/YYYY format> - Initial version
 *
 */
if (!MagentoIc) {
    var MagentoIc = {};
}

if (document.getElementById('custpage_inlinehtml_val')) {

    Ext4.BLANK_IMAGE_URL = nlapiGetContext().getSetting('SCRIPT', 'custscript_celigo_extjs_url_prefix_cs') + '/resources/images/default/s.gif';
    
    Ext4.onReady(function(){
        //    Ext4.QuickTips.init();
        
        var bd = Ext4.getBody();
        
    });
    
    
    MagentoIc.dynamicForm = null;
    MagentoIc.savedSelection = null;
    
    
    
    MagentoIc.MAGENTOIC = (function(){//private members
     	
		var getFormConfigurations = function(selectedId, selectedValue, isInit){
			var elems;
			
			var suiteletUrl = nlapiResolveURL('SUITELET', 'customscript_celigo_magentoic_formconfig', 'customdeploy_celigo_magentoic_formconfig');
			Ext4.Ajax.request({
				 url: suiteletUrl+'&attributesetid='+selectedId,
				scriptTag: true,
				params: {},
				success: function(result, request){
				
					var jsonData = Ext4.JSON.decode(result.responseText);
					
					var jsonToExtJs = new MagentoIc.JSON2EXTJS();
					
					if (jsonData) {
					
						onComboLoad = function(){
							var mgComp = Ext4.getCmp('magentoic_form');
							var values = mgComp.getForm().getFieldValues();
							mgComp.getForm().setValues(values);
						}
						
						this.renderForm(jsonToExtJs.getItemArray(jsonData['elems'], onComboLoad), selectedValue, isInit);
						
					}
					
				},
				failure: function(result, request){
					throw ('JSON request Failed');
				}
			});
		}
			
        
        this.renderForm = function(jsonElems, selectedValue, isInit){
        
            if (MagentoIc.dynamicForm) {
                MagentoIc.dynamicForm.removeAll(true);
                MagentoIc.dynamicForm.destroy();
                
                
            }
            
            
            if (jsonElems) {
            
                if (!document.getElementById('custommagentodiv')) {
                    var attributeSetField;
                    if (document.getElementsByName('inpt_custitem_celigo_mg_attributeset')[0]) {
                        attributeSetField = document.getElementsByName('inpt_custitem_celigo_mg_attributeset')[0];
                    }
                    else 
                        if (document.getElementsByName('custitem_celigo_mg_attributeset_display')[0]) {
                            attributeSetField = document.getElementsByName('custitem_celigo_mg_attributeset_display')[0];
                        }
                        else {
                            alert('Attribute Set field is not of the expected type');
                        }
                    /*		
                     
                     var magentoTab = attributeSetField.form.id;
                     var nsForm = document.getElementById(magentoTab);
                     var magentoDiv = document.createElement('div');
                     magentoDiv.id = 'custommagentodiv';
                     nsForm.parentNode.parentNode.appendChild(magentoDiv);
                     
                     */
                    /*		
                     var nsForm = Ext4.get(attributeSetField.form.id);
                     var magentoDiv = new Ext4.Element(document.createElement('div'));
                     magentoDiv.set({id:'custommagentodiv'});
                     nsForm.findParent('div', 15, true).appendChild(magentoDiv);
                     
                     */
                    var dh = Ext4.DomHelper;
                    var spec = {
                        id: 'custommagentodiv',
                        tag: 'div'
                    };
					var nsForm = Ext4.get(attributeSetField.form.id);
					var parent = nsForm.findParent('div', 15, true)
					dh.append(parent, spec);
                    
                    var pattern = /[0-9]+/;
                    var formid = pattern.exec(attributeSetField.form.id);
                    var aelem = Ext4.Element.get('custom' + formid + 'txt');
                    if (!aelem) {
                        aelem = Ext4.Element.get('custom' + formid + '_txt');
                    }
                    
                    if (aelem) {
                        aelem.on('click', function(){
                            MagentoIc.dynamicForm.doComponentLayout();
							Ext4.get('custommagentodiv').repaint();
                            
                        });
                    }
                }
                
                
                var extjsItems = jsonElems;
                MagentoIc.dynamicForm = Ext4.create('Ext4.form.Panel', {
                    id: 'magentoic_form',
                    labelWidth: 78,
                    labelAlign: 'right',
                    title: selectedValue + ' - Attributes',
                    bodyStyle: {
                        padding: '10px 10px 0',
                        background: '#F5F5F5'
                    },
                    border: false,
                    layout: 'column',
                    defaults: {
                        xtype: 'form',
                        labelSeparator: '',
                        labelAlign: 'right',
                        border: false,
                        bodyStyle: {
                        
                            background: '#F5F5F5'
                        }
                    
                    },
                    defaultType: 'textfield',
                    items: extjsItems,
                    renderTo: Ext4.get('custommagentodiv'),
                    //renderTo: Ext4.getBody(),
                    listeners: {
                        afterrender: function(){
                            this.doComponentLayout();
							Ext4.get('custommagentodiv').repaint();
                        },
						show : function() {
							Ext4.get('custommagentodiv').repaint();
						}
                    }
                });
                
                
                
                
                if (isInit) {
                    var strJson = nlapiGetFieldValue('custitem_celigo_mg_backend_attributes');
                    if (strJson) {
                        var fieldValues = Ext4.JSON.decode(strJson);
                        var finalValues = {};
                        for (var i in fieldValues) {
                            var newName = 'celigo_' + i;
                            finalValues[newName] = fieldValues[i];
                        }
                        MagentoIc.dynamicForm.getForm().setValues(finalValues);
                    }
                }
                
                if (MagentoIc.dynamicForm) 
                    MagentoIc.dynamicForm.render(Ext4.get('custommagentodiv'));
                
            }
            
            
            
        }
        
        
        return { //public members
            pageInit: function(type){ //void
                /*type is a record mode*/
                try {
                
                    if (type.toLowerCase() === 'edit' || type.toLowerCase() === 'copy') {
                    
                        if (!document.getElementsByName("inpt_custitem_celigo_mg_attributeset")[0] && !document.getElementsByName("custitem_celigo_mg_attributeset_display")[0]) 
                            return;
                        
                        var attribSet = nlapiGetFieldValue('custitem_celigo_mg_attributeset')
                        if (attribSet) {
                            var attributeSetRecord = nlapiLoadRecord('customrecord_celigo_mg_attributeset', attribSet);
                            if (attributeSetRecord) {
                                var selectedId = attributeSetRecord.getFieldValue('custrecord_form_configuration');
                                if (selectedId) {
                                    var selectedValue = nlapiGetFieldText('custitem_celigo_mg_attributeset');
                                    MagentoIc.savedSelection = selectedId;
                                    getFormConfigurations(selectedId, selectedValue, true);
                                }
                            }
                        }
                    }
                    
                } 
                catch (e) {
                    //args(Error object, script name, recipients, author Employee Id)
                    Util.handleError(e, 'Celigo_MagentoIC_FormManager_CS.js', null, -5);
                }
            },
            
            saveRecord: function(){ //boolean
                try {
                
                    if (!document.getElementsByName("inpt_custitem_celigo_mg_attributeset")[0] && !document.getElementsByName("custitem_celigo_mg_attributeset_display")[0]) 
                        return;
                    var mgComp = Ext4.getCmp('magentoic_form');
                    var strJson = "";
                    
                    if (mgComp) {
                    
                        var values = mgComp.getForm().getFieldValues();
                        var finalValues = {};
                        for (var i in values) {
                            var newName = i.substring(7);
                            finalValues[newName] = values[i];
                        }
                        strJson = Ext4.JSON.encode(finalValues);
                    }
                    
                    nlapiSetFieldValue('custitem_celigo_mg_backend_attributes', strJson, false);
                    return true;
                    
                } 
                catch (e) {
                    Util.handleError(e, 'Celigo_MagentoIC_FormManager_CS.js', null, -5);
                }
            },
            
            
            
            fieldChanged: function(type, name, linenum){ //void
                /*type is a sublist id*/
                /*has listener for SS before Load nlapiSetFieldValue (third arg)*/
                try {
                
                    if (!document.getElementsByName("inpt_custitem_celigo_mg_attributeset")[0] && !document.getElementsByName("custitem_celigo_mg_attributeset_display")[0]) 
                        return;
                    
                    if (name === 'custitem_celigo_mg_attributeset') {
                    
                        var selectedValue = nlapiGetFieldText(name).trim();
                        if (selectedValue === '-New-') 
                            return;
                        
                        var attributeSetRecord = nlapiLoadRecord('customrecord_celigo_mg_attributeset', nlapiGetFieldValue(name));
                        var selectedId = attributeSetRecord.getFieldValue('custrecord_form_configuration');
                        
                        if (MagentoIc.savedSelection && selectedId === MagentoIc.savedSelection) 
                            getFormConfigurations(selectedId, selectedValue, true);
                        else 
                            getFormConfigurations(selectedId, selectedValue);
                    }
                } 
                catch (e) {
                    //args(Error object, script name, recipients, author Employee Id)
                    Util.handleError(e, 'Celigo_MagentoIC_FormManager_CS.js', null, -5);
                }
            }
            
        }
    })();
    
}
