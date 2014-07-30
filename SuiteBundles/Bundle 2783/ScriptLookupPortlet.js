// A portlet script that resolves the URLs of the Camrivox contact search
// and open journal scripts. This should be used by an account administrator
// to get the base URLs which must be distributed to the other account users.
//
// This should be installed into NetSuite as a Portlet with the following
// parameters.
// Script Name: camrivoxScriptLookup
// Script ID: customscript_camrivox_scriptlookup
// Script Function: camrivoxScriptLookupPortlet
// Portlet Type: Inline HTML
// Deployment Title: camrivoxScriptLookup (automatic)
// Deployment ID: customdeploy_camrivox_scriptlookup
// Roles: Administrator
// Groups: All Employees
// Execute as admin: No
// Available without login: No

function camrivoxScriptLookupPortlet(portlet)
{
    portlet.setTitle("Camrivox Script Locator");

    try {
	var contactScriptId = "Not found";
	var contactLookupURL = nlapiResolveURL('SUITELET', 'customscript_camrivox_contactlookup', 'customdeploy_camrivox_contactlookup', false);
	if(contactLookupURL) {
	    contactScriptId = readScriptId(contactLookupURL);
	}

	var createCallRecordId = "Not found";
	var createCallRecordURL = nlapiResolveURL('SUITELET', 'customscript_camrivox_createcallrecord', 'customdeploy_camrivox_createcallrecord', false);
	if(createCallRecordURL) {
	    createCallRecordId = readScriptId(createCallRecordURL);
	}

	var controlContent = "<P class='smalltextb'>Suitelet Internal IDs<center><P class='smalltext'>Contact Search: <input type=text readonly size=16 value='"+contactScriptId+"'><P class='smalltext'>Create Journal Record: <input type=text readonly size=16 value='"+createCallRecordId+"'></center>";
	portlet.setHtml(controlContent);
    } catch(e) {
	portlet.setHtml("<p>Error in script: "+e);
    }
}

function readScriptId(url) {
    var value = "Not found";

    if(url) {
      var scriptEntry = url.match(/script=\d{1,}/);

      if(scriptEntry) {
	  value = scriptEntry[0].substr(7);
      }
    }
    return value;
}

