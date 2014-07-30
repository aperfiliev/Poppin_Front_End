
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

MagentoIc.JSON2EXTJS = function(){

    this.getItemArray = function(jsonElems, loadCallback){
    
        if (!jsonElems) {
            return [];
        }
        
        var extJsItemArray = [];
        
        
        
        for (var i = 0; i < jsonElems.length; i++) {
        
            var extJsItem;
            switch (jsonElems[i].elemtype) {
                case "2": // Combo
                    extJsItem = this.getComboItem(jsonElems[i], loadCallback);
                    break;
                case "3": // Date Field
                    extJsItem = this.getDateFieldItem(jsonElems[i]);
                    break;
                default:
                    extJsItem = this.getDisplayItem(jsonElems[i]);
            };
            
            extJsItemArray.push(extJsItem);
        }
        return this.layoutExtJsItems(extJsItemArray);
        
    }
    
    this.layoutExtJsItems = function(curItems){
        var nsLabelStyle = {
            labelStyle: 'color:#666666; font-size:8pt; text-decoration:none; font-family:Tahoma,Geneva,sans-serif;',
            fieldStyle: 'color:#000000; font-size:8pt; text-decoration:none; font-family:Tahoma,Geneva,sans-serif;',
            labelSeparator: '',
            labelAlign: 'right'
        };
        
        if (curItems.length <= 3) {
            curItems = [{
                defaults: nsLabelStyle,
                columnWidth: 0.35,
                items: curItems
            }];
        }
        else 
            if (curItems.length > 3 && curItems.length <= 6) {
                curItems = [{
                    columnWidth: 0.35,
                    defaults: nsLabelStyle,
                    items: curItems.slice(0, 3)
                }, {
                    columnWidth: 0.33,
                    defaults: nsLabelStyle,
                    items: curItems.slice(3)
                }]
            }
            else 
                if (curItems.length > 6 && curItems.length <= 9) {
                    curItems = [{
                        columnWidth: 0.35,
                        defaults: nsLabelStyle,
                        items: curItems.slice(0, 3)
                    }, {
                        columnWidth: 0.35,
                        defaults: nsLabelStyle,
                        items: curItems.slice(3, 6)
                    }, {
                        columnWidth: 0.30,
                        defaults: nsLabelStyle,
                        items: curItems.slice(6)
                    }]
                    
                }
                else {
                
                    var x = Math.floor((curItems.length / 3));
                    var y = ((curItems.length % 3) >= 1) ? 1 : 0;
                    var z = ((curItems.length % 3) == 2) ? 1 : 0;
                    
                    curItems = [{
                        columnWidth: 0.35,
                        defaults: nsLabelStyle,
                        items: curItems.slice(0, x * 1 + y)
                    }, {
                        columnWidth: 0.35,
                        defaults: nsLabelStyle,
                        items: curItems.slice(x * 1 + y, x * 2 + y + z)
                    }, {
                        columnWidth: 0.30,
                        defaults: nsLabelStyle,
                        items: curItems.slice(x * 2 + y + z)
                    }]
                }
        return curItems;
    }
    
    this.getDisplayItem = function(jsonObj){
        return {
            xtype: 'displayfield',
            //  width: 200,
            name: jsonObj.datakey,
            id: jsonObj.datakey,
            fieldLabel: jsonObj.name,
            hiddenName: 'checkboxid_' + jsonObj.name,
            anchor: '75%',
            listeners: null
        };
    };
    
    this.getDateFieldItem = function(jsonObj){
        var strJson = nlapiGetFieldValue('custitem_celigo_mg_backend_attributes');
        var fieldValues = Ext4.JSON.decode(strJson);
        var dateValue = fieldValues[jsonObj.datakey];
		var dateText = '';
        if (dateValue) {
                dateText = nlapiDateToString(new Date(dateValue)); 
        } 
        return {
            xtype: 'displayfield',
            //  width: 200,
            name: jsonObj.datakey,
            id: jsonObj.datakey,
            fieldLabel: jsonObj.name,
            hiddenName: 'checkboxid_' + jsonObj.name,
            anchor: '75%',
            listeners: null,
            value: dateText
        };
    };
    
    this.getCheckBoxItem = function(jsonObj){
        return {
            xtype: 'checkbox',
            // width: 200,
            
            id: jsonObj.datakey,
            fieldLabel: jsonObj.name,
            hiddenName: 'checkboxid_' + jsonObj.name,
            anchor: '75%',
            
            listeners: null
        };
        
        
    }
    
    this.getComboItem = function(jsonObj, loadCallback){
    
        var comboRecordId = jsonObj['comborecordid'];
        var comboRecordFieldId = jsonObj['comborecordfieldid']
        var comboSavedSearch = jsonObj['combosavedsearch'];
        var comboValues = jsonObj['combovalues'];
        
        
        
        if ((!comboValues.length) && (!comboRecordId) && ((!comboSavedSearch) || (comboSavedSearch && !comboRecordFieldId))) 
            return {
                xtype: 'displayfield',
                name: jsonObj.datakey,
                fieldLabel: jsonObj.name,
                width: 200
            };
        
        
        var arrayData = [], arrayStore = [];
        var jsonStore;
        var isArrStore = true, isArrStore2 = false;
        
        if (comboValues.length) {
            for (var i = 0; i < comboValues.length; i++) {
                arrayData.push([comboValues[i].key, comboValues[i].value]);
            }
            
            arrayStore = new Ext4.data.ArrayStore({
            
                fields: [{
                    name: 'internalid'
                }, {
                    name: jsonObj['datakey']
                }],
                data: arrayData
            });
        }
        
        else 
        
            if (comboSavedSearch) {
                jsonStore = Ext4.create('Ext4.data.Store', {
                    autoLoad: true,
                    idProperty: 'internalid',
                    fields: [{
                        name: 'internalid'
                    }, {
                        name: comboRecordFieldId
                    }],
                    proxy: {
                        type: 'rest',
                        url: nlapiResolveURL('SUITELET', 'customscript_celigo_restful_service', 'customdeploy_celigo_restful_service') + '&celigo_search_type=' + comboRecordId + '&celigo_search_id=' + comboSavedSearch,
                        reader: {
                            type: 'json',
                            root: comboRecordId
                        }
                    },
                    //root: comboRecordId,
                    extraParams: {
                        "celigo_search_type": comboRecordId,
                        "celigo_search_id": comboSavedSearch
                    //  "queryParam": ''
                    },
                    storeId: new Date().getTime(),
                    //  restful: true,
                    //  url: nlapiResolveURL('SUITELET', 'customscript_celigo_restful_service', 'customdeploy_celigo_restful_service'),
                    listeners: {
                        'exception': function(store, options){
                            alert('Failed to load the combosavedsearch values');
                        },
                        'load': function(){
                            loadCallback(this, jsonObj);
                        }
                    }
                });
                isArrStore = false;
                
            }
            else {
                fieldid = (!comboRecordFieldId) ? 'name' : comboRecordFieldId;
                
                var columns = [new nlobjSearchColumn('internalid'), new nlobjSearchColumn(fieldid)];
                try {
                    var searchResults = nlapiSearchRecord(comboRecordId, null, null, columns);
                } 
                catch (e) {
                
                }
                for (var i = 0; searchResults && i < searchResults.length; i++) {
                    arrayData.push([searchResults[i].getValue('internalid'), searchResults[i].getValue(fieldid)]);
                }
                
                arrayStore = new Ext4.data.ArrayStore({
                
                    fields: [{
                        name: 'internalid'
                    }, {
                        name: comboRecordFieldId
                    }],
                    data: arrayData
                })
                isArrStore2 = true;
            }
        
        if (isArrStore) {
            var strJson = nlapiGetFieldValue('custitem_celigo_mg_backend_attributes');
            if (!isArrStore2) {
                if (strJson) {
                    var fieldValues = Ext4.JSON.decode(strJson);
                    var comboValue = fieldValues[jsonObj.datakey];
                    if (jsonObj['datakey']) {
                        if (arrayStore.findRecord('internalid', comboValue)) 
                            var comboText = arrayStore.findRecord('internalid', comboValue).data[jsonObj['datakey']];
                    }
                }
                
            }
            else {
                if (strJson) {
                    var fieldValues = Ext4.JSON.decode(strJson);
                    var comboValue = fieldValues[jsonObj.datakey];
                    if (jsonObj['datakey']) {
                        if (arrayStore.findRecord('internalid', comboValue)) 
                            var comboText = arrayStore.findRecord('internalid', comboValue).data[comboRecordFieldId];
                    }
                }
                
            }
        }
        
        return {
            xtype: 'displayfield',
            //     width: 200,
            id: jsonObj.datakey,
            name: jsonObj.datakey,
            fieldLabel: jsonObj.name,
            hiddenName: 'checkboxid_' + jsonObj.name,
            anchor: '75%',
            listeners: null,
            value: (isArrStore) ? comboText : ''
        };
    };
    
}


if (document.getElementById('custpage_inlinehtml_val')) {

    Ext4.BLANK_IMAGE_URL = nlapiGetContext().getSetting('SCRIPT', 'custscript_celigo_extjs_url_prefix_cs') + '/resources/images/default/s.gif';
    
    Ext4.onReady(function(){
        Ext4.QuickTips.init();
        Ext4.form.Field.prototype.msgTarget = 'side';
        
        var bd = Ext4.getBody();
        
    });
}

MagentoIc.dynamicForm = null;
MagentoIc.savedSelection = null;



MagentoIc.MAGENTOIC = (function(){//private members

    
	 var getFormConfigurations = function(selectedId, selectedValue, isInit){
        var elems;
        //var suiteletUrl = nlapiGetContext().getSetting('SCRIPT', 'custscript_celigo_magentoic_suitelet_url');
        var suiteletUrl = nlapiResolveURL('SUITELET', 'customscript_celigo_magentoic_formconfig', 'customdeploy_celigo_magentoic_formconfig');
        Ext4.Ajax.request({
            url: suiteletUrl+'&attributesetid='+selectedId,
            scriptTag: true,
            params: {},
            success: function(result, request){
            
                var jsonData = Ext4.JSON.decode(result.responseText);
                
                var jsonToExtJs = new MagentoIc.JSON2EXTJS();
                var found = false;
                
                if (jsonData) {
                 //   for (var i = 0; i < jsonData.length; i++) {
                   //     if (jsonData[i]['id'] === selectedId) {
                        
                            onComboLoad = function(store, jsonObj){
                            
                                var strJson = nlapiGetFieldValue('custitem_celigo_mg_backend_attributes');
                                
                                if (strJson) {
                                    var fieldValues = Ext4.JSON.decode(strJson);
                                    var comboValue = fieldValues[jsonObj.datakey];
                                    var comboText = '';
                                    if (jsonObj['comborecordfieldid']) 
                                        comboText = store.findRecord('internalid', comboValue).data[jsonObj['comborecordfieldid']];
                                    
                                    fieldValues[jsonObj.datakey] = comboText;
                                    MagentoIc.dynamicForm.getForm().setValues(fieldValues);
                                }
                            }
                            
                            this.renderForm(jsonToExtJs.getItemArray(jsonData['elems'], onComboLoad), selectedValue, isInit);
                           
                  //      }
              //      }
                }
             //   if (!found) {
             //       jsonToExtJs.renderForm(null, selectedValue);
             //   }
                
            },
            failure: function(result, request){
                throw ('JSON request Failed');
            }
        });
        
    }
	
	
	
    this.renderForm = function(jsonElems, selectedValue, isInit){
    
        if (MagentoIc.dynamicForm) {
            MagentoIc.dynamicForm.removeAll();
            MagentoIc.dynamicForm.destroy();
        }
        
        
        if (jsonElems) {
        
            var extjsItems = jsonElems;
            
            
            MagentoIc.dynamicForm = Ext4.create('Ext4.form.Panel', {
                id: 'magentoic_form1',
                labelWidth: 78,
                labelAlign: 'right',
                //frame: true,
                title: selectedValue + ' - Attributes',
                bodyStyle: {
                    padding: '10px 10px 0px',
                    background: '#F5F5F5'
                },
                border: false,
                layout: 'column',
                
                defaults: {
                    xtype: 'form',
                    labelSeparator: '',
                    labelAlign: 'right',
                    border: false,
                    layout: 'anchor',
                    bodyStyle: {
                    
                        background: '#F5F5F5'
                    }
                
                },
                defaultType: 'textfield',
                items: extjsItems,
                renderTo: Ext4.Element.get('custommagentodiv'),
				listeners : {
					afterrender : function() {
						Ext4.get('custommagentodiv').repaint();
					},
					show : function() {
						Ext4.get('custommagentodiv').repaint();
					}
				}
            });
            
            
            if (!document.getElementById('custommagentodiv')) {
                var node = document.getElementById('custitem_celigo_mg_exportimages_fs');
                while (node.nodeName != "FORM" && node.parentNode) {
                    node = node.parentNode;
                }
                
                var nsForm = node;
                var magentoDiv = document.createElement('div');
                magentoDiv.id = 'custommagentodiv';
                
                nsForm.parentNode.appendChild(magentoDiv);
                
                var pattern = /[0-9]+/;
                var formid = pattern.exec(nsForm.id);
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
            if (isInit) {
                var strJson = nlapiGetFieldValue('custitem_celigo_mg_backend_attributes');
                if (strJson) {
                    var fieldValues = Ext4.JSON.decode(strJson);
                    for (var i in fieldValues) {
                        var field = Ext4.getCmp(i);
                        if (field && field.getValue()) {
                            fieldValues[i] = field.getValue();
                        }
                    }
                    MagentoIc.dynamicForm.getForm().setValues(fieldValues);
                }
            }
            
        }
        if (MagentoIc.dynamicForm) 
		    // MagentoIc.dynamicForm.doComponentLayout();
            MagentoIc.dynamicForm.render('custommagentodiv');
        
    }
    
    
    return { //public members
        pageInit: function(type){ //void
            /*type is a record mode*/
            try {
            
                if (type.toLowerCase() === 'view') {
                    if (selectedAttributeSetId) {
                        MagentoIc.savedSelection = selectedAttributeSetId;
                        getFormConfigurations(selectedAttributeSetId, selectedAttributeSetValue, true);
                    }
                }
                
            } 
            catch (e) {
              //  Util.handleError(e, 'Celigo_MagentoIC_Form-ViewMode.js', null, -5);
			  throw e;
            }
        }
        
    }
})();

if (document.getElementsByName("custitem_celigo_mg_attributeset_fs_lbl")) 
    MagentoIc.MAGENTOIC.pageInit('view');
