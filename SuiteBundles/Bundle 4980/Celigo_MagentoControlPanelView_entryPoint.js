
/*
 * 2005-2008 Celigo, Inc. All Rights Reserved.
 *
 * Version:    1.0.0
 * Type:       Portlet
 *
 * Purpose:
 *    <What the script does>
 *
 * Revisions:
 *    <Date in MM/DD/YYYY format> - Initial version
 *
 */
if (!Celigo) 
    var Celigo = {};

Celigo.Integrator = (function(){//private members
    return {//public members
        main: function(portlet){
            try {
            
                portlet.setTitle('Magento Ctrl Panel');
                portlet.setScript('customscript_celigo_intgrtr_ctrl_pnl_cli');
                
                var help = portlet.addField('custpage_help', 'inlinehtml', null);
                help.setDefaultValue('<a href="http://www.celigo.com/products/help/magento/" target="_blank">Help</a>');
                portlet.addField('custpage_spacer1', 'inlinehtml', null).setDefaultValue('<br />');
              
                portlet.addField('updatepassword', 'password', 'Update Password');
				portlet.addField('updateuser', 'text', 'Update Username');
                //portlet.addField('custpage_spacer2', 'inlinehtml', null).setDefaultValue('<br />');
				portlet.addField('updateurl', 'text', 'Update SOAP URL');
                portlet.addField('custpage_spacer4', 'inlinehtml', null).setDefaultValue('<br />');

                portlet.addField('orderimport', 'checkbox', 'Run Order Import').setLayoutType('normal', 'startcol');
                portlet.addField('shippingsync', 'checkbox', 'Run Shipping Sync');
                portlet.addField('billingsync', 'checkbox', 'Run Billing Sync');
                portlet.addField('customersync', 'checkbox', 'Run Customer Sync');
                portlet.addField('inventorysync', 'checkbox', 'Run Inventory Sync');
                portlet.addField('itemexport', 'checkbox', 'Run Item Export');
                portlet.addField('updatecategories', 'checkbox', 'Update Categories');
                portlet.addField('updateattributes', 'checkbox', 'Update Attributes');
                portlet.addField('updatecustomergroups', 'checkbox', 'Update Customer Groups');
                portlet.addField('custpage_spacer3', 'inlinehtml', null).setDefaultValue('<br />');
                
                
                portlet.setSubmitButton(nlapiResolveURL('SUITELET', 'customscript_st_celigo_mag_control_pnl', 'customdeploy_st_celigo_mag_control_pnl'), 'Submit');
            } 
            catch (e) {
                $.handleError(e, 'Celigo_MagentoControlPanelView_entryPoint.js');
                throw e;
            }
        }
    }
})();
