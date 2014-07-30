function uploadImage(request, response) {
	try {
		nlapiLogExecution("DEBUG", "Upload", "starting");
		var strSnapshot = request.getParameter("file");
		var strName = (new Date()).getTime().toString();
		strName = strName.slice(-15, strName.length);
		var fleSnapshot = nlapiCreateFile(strName + ".jpg", "JPGIMAGE",
				strSnapshot);
		fleSnapshot.setFolder(6655);
		fleSnapshot.setIsOnline(true);
		var intFileSize = fleSnapshot.getSize();
		if (intFileSize < 5242880) {
			var intFileId = nlapiSubmitFile(fleSnapshot);
			fleNewFile = nlapiLoadFile(intFileId);
			response.write('({"url" : "http://www.poppin.com/site/pp-dd-images/' + strName + '.jpg"})');
		} else {
			nlapiLogExecution("DEBUG", "Upload error", "File size exceeded");
			response.write("({'error':1, msg:'File size limit exceeded'})");
		}
	} catch (ex) {
		if (ex.getCode)
			nlapiLogExecution('ERROR', 'NetSuite Error details', ex.getCode()
					+ ': ' + ex.getDetails());
		else
			nlapiLogExecution('ERROR', 'JavaScript Error details', ex.message);
		response.write("({'error':1, msg:'Unexpected error'})");
	}
}