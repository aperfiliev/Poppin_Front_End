
if (!MagentoIc) {
    var MagentoIc = {};
}

MagentoIc.JSON2EXTJS = function(){

    this.getItemArray = function(jsonElems, loadCallback){
    
        if (!jsonElems) {
            return [];
        }
        
        var extJsItemArray = new Array();
        
        for (var i = 0; i < jsonElems.length; i++) {
            var extJsItem;
            
            switch (jsonElems[i].elemtype) {
                case "1": // Check Box
                    extJsItem = this.getCheckBoxItem(jsonElems[i]);
                    break;
                case "2": // Combo
                    extJsItem = this.getComboItem(jsonElems[i], loadCallback);
                    break;
                case "3": // Date Field
                    extJsItem = this.getDateFieldItem(jsonElems[i]);
                    break;
                case "4": // Html Editor
                    extJsItem = this.getHtmlEditorItem(jsonElems[i]);
                    break;
                case "5": // Number Field
                    extJsItem = this.getNumberFieldItem(jsonElems[i]);
                    break;
                case "6": // Text Area
                    extJsItem = this.getTextAreaItem(jsonElems[i]);
                    break;
                case "7": // Text Field
                    extJsItem = this.getTextFieldItem(jsonElems[i]);
                    break;
                case "8": // Time Field
                    extJsItem = this.getTimeFieldItem(jsonElems[i]);
                    break;
                default:
                    throw ("UI Element Type Not supported");
            }
            extJsItemArray.push(extJsItem);
        }
        return this.layoutExtJsItems(extJsItemArray);
        
    }
    
    this.layoutExtJsItems = function(curItems){
        var nsLabelStyle = {
            labelStyle: 'color:#666666; font-size:8pt; text-decoration:none; font-family:Tahoma,Geneva,sans-serif;',
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
    
    this.getCheckBoxItem = function(jsonObj){
        return {
            xtype: 'checkbox',
            name: 'celigo_' + jsonObj.datakey,
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
                xtype: 'combo',
                name: 'celigo_' + jsonObj.datakey,
                fieldLabel: jsonObj.name,
                anchor: '75%',
				value : '',
				store : []
            };
        
        
        var arrayStore = new Array();
        var jsonStore;
        var isArrStore = true;
        
        if (comboValues.length) {
            for (var i = 0; i < comboValues.length; i++) {
                arrayStore.push([comboValues[i].key, comboValues[i].value]);
            }
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
                        url: nlapiResolveURL('SUITELET', 'customscript_celigo_restful_service', 'customdeploy_celigo_restful_service')+'&celigo_search_type='+comboRecordId+'&celigo_search_id='+comboSavedSearch,
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
                            loadCallback();
                        }
                    }
                });
                isArrStore = false;
                
            }
            else {
                var fieldid;
                
                fieldid = (!comboRecordFieldId) ? 'name' : comboRecordFieldId;
                
                var columns = [new nlobjSearchColumn('internalid'), new nlobjSearchColumn(fieldid)];
				
				try {
					var searchResults = Util.search(comboRecordId, null, null, columns);
				} catch (e) {
				}
				
                for (var i = 0; searchResults && i < searchResults.length; i++) {
                    arrayStore.push([searchResults[i].getValue('internalid'), searchResults[i].getValue(fieldid)]);
                }
            }
        
        var comboBoxItem = {
            xtype: 'combo',
            name: 'celigo_' + jsonObj.datakey,
            fieldLabel: jsonObj.name,
            anchor: '75%',
            hiddenName: 'celigo_' + jsonObj.datakey,
            emptyText: '',
            queryMode: 'local',
            queryParam: 'queryParam',
            forceSelection: true,
            loadingText: 'Loading...',
         //   triggerAction: 'all',
            selectOnFocus: true,
            allowBlank: true,
            listeners: {},
            displayField: jsonObj['comborecordfieldid'],
            valueField: "internalid",
            store: ((!isArrStore) ? jsonStore : arrayStore)
        };
        
        return comboBoxItem;
    }
    
    this.getDateFieldItem = function(jsonObj){
        return {
            xtype: 'datefield',
            name: 'celigo_' + jsonObj.datakey,
            anchor: '75%',
            
            fieldLabel: jsonObj.name,
            hiddenName: 'datefield_' + jsonObj.name
            
        };
    }
    
    this.getHtmlEditorItem = function(jsonObj){
        return {
            xtype: 'textfield',
            name: 'celigo_' + jsonObj.datakey,
            anchor: '75%',
            
            
            fieldLabel: jsonObj.name,
            hiddenName: 'textfieldid_' + jsonObj.name,
            listeners: null
        }
    }
    
    this.getNumberFieldItem = function(jsonObj){
        return {
            xtype: 'textfield',
            name: 'celigo_' + jsonObj.datakey,
            anchor: '75%',
            
            
            fieldLabel: jsonObj.name,
            hiddenName: 'textfieldid_' + jsonObj.name,
            listeners: null
        }
    }
    
    this.getTextAreaItem = function(jsonObj){
        return {
            xtype: 'textfield',
            name: 'celigo_' + jsonObj.datakey,
            anchor: '75%',
            fieldLabel: jsonObj.name,
            hiddenName: 'textfieldid_' + jsonObj.name,
            listeners: null
        }
    }
    
    this.getTextFieldItem = function(jsonObj){
        return {
            xtype: 'textfield',
            name: 'celigo_' + jsonObj.datakey,
            anchor: '75%',
            
            fieldLabel: jsonObj.name,
            hiddenName: 'textfieldid_' + jsonObj.name,
            listeners: null
        }
    }
    
    this.getTimeFieldItem = function(jsonObj){
        return {
            xtype: 'textfield',
            name: 'celigo_' + jsonObj.datakey,
            anchor: '75%',
            fieldLabel: jsonObj.name,
            hiddenName: 'textfieldid_' + jsonObj.name,
            listeners: null
        }
    }
    
}
