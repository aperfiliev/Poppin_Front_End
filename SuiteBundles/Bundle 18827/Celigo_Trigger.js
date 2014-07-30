function trigger(type) {
	
	var id = nlapiGetContext().getSetting('SCRIPT', 'custscript_celigo_integration_id');
	if (id != null && id != '') {
		if (nlapiGetContext().getEnvironment().toLowerCase() == 'sandbox' || nlapiGetContext().getEnvironment().toLowerCase() == 'beta')
			id = id + nlapiGetContext().getEnvironment().toLowerCase();
		else;
	} else;
	var host = nlapiGetContext().getSetting('SCRIPT', 'custscript_celigo_integration_host');
	if (id == null || host == null)
		return;
		
	var qualifier = nlapiGetContext().getSetting('SCRIPT', 'custscript_celigo_location_qualifier');
	var url = host + '/axon/' + nlapiGetContext().getCompany() + '/' + id + '/' + qualifier;
	
	nlapiLogExecution('DEBUG', 'Requesting', url);
	var response = null;
	try {
		response = sendToIntegrator(url);
	} catch (e) {
		try {
			response = sendToIntegrator(url);
		} catch (e2) {
			response = sendToIntegrator(url);
		}
	}
	if (response.getCode() != '200')
		throw "Request failed.  Please try again.";
	
}

function sendToIntegrator(url) {
	try {
			var t1 = new Date();
			var response = nlapiRequestURL(url);
			var t2 = new Date().getTime();
			nlapiLogExecution('DEBUG', 'nlapiRequestURL (GET) perf audit', ((1*t2) - (1*t1)));
			return response;
			
	} catch (e) {
		nlapiLogExecution('DEBUG', e.name || e.getCode(), e.message || e.getDetails());
		throw e;
	}
}