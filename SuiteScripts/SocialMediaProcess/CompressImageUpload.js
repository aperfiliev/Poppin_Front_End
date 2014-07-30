/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       16 Jul 2014     ashykalov
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
		
		var form = nlapiCreateForm('Compress Image Upload');
		
		form.addField('bansettings_image', 'file','Image File');
		var currentimageurl = form.addField('bansettings_imageurl', 'url','Current Image File Url');
		//currentimageurl.setDefaultValue(bannerinfoitem.getFieldValue('custrecord_imageurl'));
		currentimageurl.setDisplayType('inline');
		
		
		form.addSubmitButton('Save');
		
		response.writePage(form);
		
	}
else
	{
		//POST data to netsuite
		//save text data
	
		var file = request.getFile('bansettings_image');
		//nlapiLogExecution('DEBUG', 'File url:', file.getURL()+' '+file.getValue());
		//var folderrecord = nlapiLoadRecord('folder', 65283);
		var folderId = '265936';		//precompress folder, preparing image for compressing
		fileResultUrl = '';
		if ((file != null && file != '') && (folderId != null && folderId != ''))
		{
			var fileCreated = nlapiCreateFile(file.getName(), file.getType(), file.getValue());
			fileCreated.setIsOnline(true);
			fileCreated.setFolder(folderId);
			var fileId = nlapiSubmitFile(fileCreated);
			var fileObject = nlapiLoadFile(fileId);
			fileResultUrl = 'http://sandbox.poppin.com'+fileObject.getURL();
			//bannerinfoitem.setFieldValue('custrecord_imageurl', fileResultUrl);
			nlapiLogExecution('DEBUG', 'File url:', fileObject.getURL());
			//send image to smush.it
			var smushitResult = nlapiRequestURL('http://www.smushit.com/ysmush.it/ws.php?img='+encodeURIComponent(fileResultUrl));
			nlapiLogExecution('DEBUG','Smush Result:', smushitResult.getBody());
			var smushitResultObj = JSON.parse(smushitResult.getBody());
			nlapiLogExecution('DEBUG','Smush Result Obj:', JSON.stringify(smushitResultObj));
			//265937
			//retrieving compression result
			var fileCompressDest = decodeURIComponent(smushitResultObj.dest);
			var fileResponse = nlapiRequestURL(fileCompressDest);
			var fileCompressed = nlapiCreateFile(file.getName(), file.getType(), fileResponse.getBody());
			fileCompressed.setIsOnline(true);
			fileCompressed.setFolder('265937');//put in postComress folder
			var compressedFileId = nlapiSubmitFile(fileCompressed);
			//http://www.smushit.com/ysmush.it/ws.php?img=http://sandbox.poppin.com/site/social-login/css/images/staplerslogin.jpg
		}
		else
		{
			//nlapiLogExecution('DEBUG', 'Folder or file not found');
			fileResultUrl = bannerinfoitem.getFieldValue('custrecord_imageurl');
		}
		nlapiSetRedirectURL("SUITELET", "customscript_pop_compress_img_upload", "customdeploy1", null, null);
	}
}
