/*
 * Copyright 1998 - 2012 NetSuite Inc.
 */
function service(request, response)
{
	var jsonEvt = request.getParameter("jsonEvt");	
    var jsonCallback = request.getParameter("jsonCallback");	

	var retObj = {"totalFound":11};

	if(jsonEvt !== null) {
		response.writeLine('BDK.fire("' + jsonEvt + '",' + JSON.stringify(retObj) + ')');
	}
	else if(jsonCallback !== null) {
		response.writeLine(jsonCallback + '(' + JSON.stringify(retObj) + ')');
	}
	else {
		response.writeLine(JSON.stringify(retObj));
	}
}