/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       15 Oct 2013     ashykalov
 *
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function suitelet(request, response){
	if(request.getMethod()=='GET')
	{
		var selectedtimefrom = request.getParameter('selectedtimefrom');
		var selectedtimeto = request.getParameter('selectedtimeto');
//		if(selectedbanner == null || selectedbanner == undefined){
//			selectedbanner = 1;
//			}
		var form = nlapiCreateForm('Poppin Analytics');
		//form.setScript('customscript279');
		form.addField('popanalytics_page', 'text', 'Selected Page');
		form.addField('popanalytics_date', 'date', 'Selected Date');
		form.addField('popanalytics_timefrom', 'timeofday', 'Time from');
		form.addField('popanalytics_timeto', 'timeofday', 'Time to');
		//form.addField('popanalytics_dateto', 'date', 'Selected Date To');
		var analyticsdatasublist = form.addSubList('popanalytics_datasublist','staticlist','Analytics Data');
	    
	    analyticsdatasublist.addField('popanalytics_sublistdatefield','text', 'Date');
	    analyticsdatasublist.addField('popanalytics_sublistpagefield','text', 'Page');
	    analyticsdatasublist.addField('popanalytics_sublistdirectvisitorsfield','text', 'Direct Visitors');
	    analyticsdatasublist.addField('popanalytics_sublistuniquevisitorsfield','text', 'Unique Visitors');
	    //analyticsdatasublist.addField('popanalytics_sublistsourcefield','text', 'analyticssource');
	    analyticsdatasublist.addField('popanalytics_sublistvisitorsfield','text', 'Total Visitors');
	    //get data from service
	    var a = new Array();
	    a['User-Agent-x'] = 'SuiteScript-Call';
	    a["Content-Type"] = "application/json";
	    a["Accept"]= "application/javascript, application/json";
	    var requeststring = 'http://ec2-54-245-28-174.us-west-2.compute.amazonaws.com:8006/poppin-webanalytics/analytics-out/getallpagesvisits?timeStampFrom=1&timeStampTo=2381861180';
	    var result = nlapiRequestURL(requeststring, null, a, "GET");
	    nlapiLogExecution('DEBUG', 'Response', result.getBody().toString());
	    var analyticsdata = JSON.parse(result.getBody());
//	    var analyticsdata = [{
//	    						"visitorsCount":3,"directVisitorsCount":0,"pageName":"home.html","uniqueVisitorCounts":1},
//	    						{"visitorsCount":3047,"directVisitorsCount":0,"pageName":"fiddler.html","uniqueVisitorCounts":1}];

	    for(var i=0;i<analyticsdata.length;i++){
	    	//analyticsdatasublist.setLineItemValue('popanalytics_sublistdatefield', i+1, analyticsdata[i].date);
	    	analyticsdatasublist.setLineItemValue('popanalytics_sublistdirectvisitorsfield', i+1, analyticsdata[i].directVisitorsCount);
	    	analyticsdatasublist.setLineItemValue('popanalytics_sublistpagefield', i+1, analyticsdata[i].pageName);
	 	    analyticsdatasublist.setLineItemValue('popanalytics_sublistuniquevisitorsfield', i+1, analyticsdata[i].uniqueVisitorCounts);
	 	    //analyticsdatasublist.setLineItemValue('popanalytics_sublistsourcefield', i+1, analyticsdata[i].source);
	 	    analyticsdatasublist.setLineItemValue('popanalytics_sublistvisitorsfield', i+1, analyticsdata[i].visitorsCount);
	    }
	   
	    
	   
		form.addSubmitButton('Refresh');
		response.writePage(form);
		
	}
else
	{
		//refresh
		var params = {selectedtimefrom : nlapiGetFieldValue('popanalytics_timefrom'), selectedtimeto: nlapiGetFieldValue('popanalytics_timeto')};
		nlapiSetRedirectURL("SUITELET", "customscript291", "customdeploy1", null, params);
	}
}
function serviceResponse(response){
	    	var headers = response.getAllHeaders();
	    	var output = 'Code: '+response.getCode()+'\n';
	    	output += 'Headers:\n';
	    	for ( var i in headers )
	    		output += i + ': '+headers[i]+'\n';
	    		output += '\n\nBody:\n\n';
	    		output += response.getBody();
	nlapiLogExecution('DEBUG', 'response from service', output);
}
