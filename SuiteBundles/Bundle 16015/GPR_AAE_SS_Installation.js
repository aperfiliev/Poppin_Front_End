/**
 * Description: SuiteCommerce Advanced Features (Installation)
 *
 * @copyright (c) 2000-2012, NetSuite Inc.
 * @author rtucat
*  @version 2.0
*/

function beforeInstall(strToVersion) {
	// Always check that Workorders is enabled
	checkFeatureEnabled('CUSTOMRECORDS');
	// Always check that Custom Records is enabled
	checkFeatureEnabled('CUSTOMRECORDS');
	// Always check that Client SuiteScript is enabled
	checkFeatureEnabled('CUSTOMCODE');	
	// Always check that Client SuiteScript is enabled
	checkFeatureEnabled('DOCUMENTS');
	// Always check that Online Forms is enabled
	checkFeatureEnabled('EXTCRM');
	// Always check that Marketing Automation is enabled
	checkFeatureEnabled('MARKETING');	
	// Always check that Server Scripting is enabled
	checkFeatureEnabled('SERVERSIDESCRIPTING');
	// Always check that Web Site is enabled
	checkFeatureEnabled('WEBSITE');
	// Always check that Web Store is enabled
	checkFeatureEnabled('WEBSTORE');
	/*
	// Check that Multi Currency is enabled if version 2.0 is being installed
	if ( toversion.toString() == "2.0" )
		checkFeatureEnabled('MULTICURRENCY');
	*/
}

function afterInstall (strToVersion) {
	
}
