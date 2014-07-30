function control(request, response) {
	
    if (request.getMethod() == 'GET') {
       
    } else {
    	var tabId = nlapiGetContext().getSetting('SCRIPT', 'custscript_celigo_integration_tab_id');
   		nlapiSetRedirectURL('TASKLINK', 'card_' + tabId);
   		
    	var id = nlapiGetContext().getSetting('SCRIPT', 'custscript_celigo_integration_id');
    	if (id != null && id != '') {
    		if (nlapiGetContext().getEnvironment().toLowerCase() == 'sandbox' || nlapiGetContext().getEnvironment().toLowerCase() == 'beta')
    			id = id + nlapiGetContext().getEnvironment().toLowerCase();
    		else;
    	} else;
    	var host = nlapiGetContext().getSetting('SCRIPT', 'custscript_celigo_integration_host');
		if (id == null || host == null)
			return;
    	
    	var credentialArray = new Array();
    	if (request.getParameter('updateuser') != null && request.getParameter('updateuser') != '')
    		credentialArray['username'] = request.getParameter('updateuser');
		if (request.getParameter('updatepassword') != null && request.getParameter('updatepassword') != '')
			credentialArray['password'] = request.getParameter('updatepassword');
		if (request.getParameter('updateurl') != null && request.getParameter('updateurl') != '')
			credentialArray['soap_client_url'] = request.getParameter('updateurl');
		
    	if (credentialArray['password'] != null || credentialArray['username'] != null || credentialArray['soap_client_url'] != null) {
			var url = host + '/axon/' + nlapiGetContext().getCompany() + '/' + id + '/magento/updateCredential';
			nlapiLogExecution('DEBUG', 'Requesting', url);	
			var response = nlapiRequestURL(url, credentialArray);
			if (response.getCode() != '200')
				throw "Request failed.  Please try again.";
    	}
    	
    	if (request.getParameter('orderimport') == 'T' || request.getParameter('customersync') == 'T' || request.getParameter('inventorysync') == 'T') {
			var url = host + '/axon/' + nlapiGetContext().getCompany() + '/' + id + '/magento/orderImport';
			nlapiLogExecution('DEBUG', 'Requesting', url);	
			var response = nlapiRequestURL(url);
			if (response.getCode() != '200')
				throw "Request failed.  Please try again.";
    	}
    	
    	if (request.getParameter('itemexport') == 'T') {
			var url = host + '/axon/' + nlapiGetContext().getCompany() + '/' + id + '/magento/itemExport';
			nlapiLogExecution('DEBUG', 'Requesting', url);	
			var response = nlapiRequestURL(url);
			if (response.getCode() != '200')
				throw "Request failed.  Please try again.";
    	}
    	
    	if (request.getParameter('shippingsync') == 'T') {
			var url = host + '/axon/' + nlapiGetContext().getCompany() + '/' + id + '/magento/shippingSync';
			nlapiLogExecution('DEBUG', 'Requesting', url);	
			var response = nlapiRequestURL(url);
			if (response.getCode() != '200')
				throw "Request failed.  Please try again.";
    	}
    	
    	if (request.getParameter('billingsync') == 'T') {
			var url = host + '/axon/' + nlapiGetContext().getCompany() + '/' + id + '/magento/billingSync';
			nlapiLogExecution('DEBUG', 'Requesting', url);	
			var response = nlapiRequestURL(url);
			if (response.getCode() != '200')
				throw "Request failed.  Please try again.";
    	}
    	
    	var controlPanelArray = new Array();
    	var invokeControlPanel = false;
    	if (request.getParameter('updatecategories') == 'T') {
    		controlPanelArray['updatecategories'] = 'T';
    		invokeControlPanel = true;
    	}
    		
    	if (request.getParameter('updateattributes') == 'T') {
    		controlPanelArray['updateattributes'] = 'T';
    		invokeControlPanel = true;
    	}
    	
    	if (request.getParameter('updatecustomergroups') == 'T') {
	    		controlPanelArray['updatecustomergroups'] = 'T';
	    		invokeControlPanel = true;
    	}
    	
    	if (invokeControlPanel == true){
			var url = host + '/axon/' + nlapiGetContext().getCompany() + '/' + id + '/magento/controlPanel';
			nlapiLogExecution('DEBUG', 'Requesting', url);	
			var response = nlapiRequestURL(url,controlPanelArray);
			if (response.getCode() != '200')
				throw "Request failed.  Please try again.";
    	}
    }
   
}