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

if(!Celigo)
	var Celigo = {};

Celigo.Integrator = (function() {//private members

	return {//public members
		main: function(portlet) {
			try {
					
				portlet.setTitle('Celigo Control Panel');
				portlet.setScript('customscript_celigo_intgrtr_ctrl_pnl_cli');
				
				var help = portlet.addField('custpage_help','inlinehtml',null);
				help.setDefaultValue('<a href="http://www.celigo.com/products/help/integrator/" target="_blank">Help</a>');
				portlet.addField('custpage_spacer1','inlinehtml',null).setDefaultValue('<br/>');

				//help.setLayoutType('outsideabove', 'none');
				
				portlet.addField('custpage_clearcache','checkbox','Refresh Integration Caches').setLayoutType('normal', 'startcol');
				portlet.addField('custpage_refreshmappings','checkbox','Refresh Integration Mappings');
				portlet.addField('custpage_object','select','Refresh Object', 'customrecord_celigo_supported_object');
				
				portlet.addField('custpage_spacer2','inlinehtml',null).setDefaultValue('<br/>');
				portlet.addField('custpage_password','password','Update Password');
				portlet.addField('custpage_email','email','Update Email');
				portlet.addField('custpage_spacer3','inlinehtml',null).setDefaultValue('<br/>');

								
				portlet.setSubmitButton(nlapiResolveURL('SUITELET', 'customscript_st_celigo_control_panel', 'customdeploy_st_celigo_control_panel'), 'Submit', '_hidden');

			} catch (e) {
				$.handleError(e, 'Celigo_IntegratorControlPanelView_entryPoint.js');
				throw e;
			}
		}
	}
})();
