/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       14 Aug 2013     ashykalov
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
		var selectedbanner = request.getParameter('selectedbanner');
		if(selectedbanner == null || selectedbanner == undefined){
			selectedbanner = 1;
			}
		var form = nlapiCreateForm('Checkout Banner Settings');
		form.setScript('customscript279');
		var bannerinfoitem = nlapiLoadRecord('customrecord189', selectedbanner);
		var bannerselect = form.addField('bansettings_bannerid', 'select', 'Banner Select');
		bannerselect.addSelectOption(1, 'Login Banner');
		bannerselect.addSelectOption(2, 'Cart Banner');
		bannerselect.addSelectOption(3, 'Upsell Options');
		bannerselect.addSelectOption(4, 'Checkout Banner');
		bannerselect.addSelectOption(5, 'Checkout Upsell Options');
		bannerselect.setDefaultValue(selectedbanner);
		// onclick="addItem(3188)"
		form.addField('bansettings_enabled', 'checkbox','Enabled').setDefaultValue(bannerinfoitem.getFieldValue('custrecord_enabled'));//TODO:load enabled state from record
		form.addField('bansettings_image', 'file','Image File');
		var currentimageurl = form.addField('bansettings_imageurl', 'url','Current Image File Url');
		currentimageurl.setDefaultValue(bannerinfoitem.getFieldValue('custrecord_imageurl'));
		currentimageurl.setDisplayType('inline');
		
		form.addField('bansettings_width', 'integer','Banner Width(px)').setDefaultValue(bannerinfoitem.getFieldValue('custrecord_width'));
		form.addField('bansettings_height', 'integer','Banner Height(px)').setDefaultValue(bannerinfoitem.getFieldValue('custrecord_height'));
		form.addField('bansettings_redirecturl', 'text', 'Redirect URL').setDefaultValue(bannerinfoitem.getFieldValue('custrecord_redirecturl'));
		form.addField('bansettings_redirectitemid', 'text', 'Item Id redirect').setDefaultValue(bannerinfoitem.getFieldValue('custrecord_redirectitemid'));
		form.addField('bansettings_alttext', 'text','Alt Text').setDefaultValue(bannerinfoitem.getFieldValue('custrecord_alttext'));
		
		form.addField('bansettings_previewlabel', 'label','Preview:');
		var bannerhtml = form.addField('bansettings_bannerhtml', 'inlinehtml', 'Banner HTML');
		bannerhtml.setDefaultValue(bannerinfoitem.getFieldValue('custrecord_bannerhtml'));
		form.addSubmitButton('Save');
		form.getField('bansettings_bannerid').setHelpText('Selects banner and loads its current settings');
		form.getField('bansettings_enabled').setHelpText('Enables or disables selected banner. If disabled banner will collapse on target page.');
		form.getField('bansettings_image').setHelpText('Uploads banner image from your hard disk drive');
		form.getField('bansettings_imageurl').setHelpText('Displays absolute path of uploaded banner image');
		form.getField('bansettings_width').setHelpText('Sets banner width, resizes default image dimensions value.');
		form.getField('bansettings_width').setDisplaySize(5);
		form.getField('bansettings_height').setHelpText('Sets banner height, resizes default image dimensions value.');
		form.getField('bansettings_height').setDisplaySize(5);
		form.getField('bansettings_redirecturl').setHelpText('Sets url for banner, use # sign to void link.');
		form.getField('bansettings_redirectitemid').setHelpText('Set add item with specified id action to banner(Important: If specified - redirect URL will be ignored)');
		form.getField('bansettings_redirectitemid').setDisplaySize(5);
		form.getField('bansettings_alttext').setHelpText('Sets alternate text for banner image');
		form.getField('bansettings_bannerhtml').setHelpText('Preview of HTML which will be injected on target page');
		response.writePage(form);
		
	}
else
	{
		//POST data to netsuite
		//save text data
		
		var selectedbanner = request.getParameter('bansettings_bannerid');
		
		nlapiLogExecution('DEBUG', 'selectedbanner:', selectedbanner);
		
		if(selectedbanner == null || selectedbanner == undefined){
			selectedbanner = 1;
		}
	
		var bannerinfoitem = nlapiLoadRecord('customrecord189', selectedbanner);
		bannerinfoitem.setFieldValue('custrecord_width', request.getParameter('bansettings_width'));
		bannerinfoitem.setFieldValue('custrecord_enabled', request.getParameter('bansettings_enabled'));
		bannerinfoitem.setFieldValue('custrecord_height', request.getParameter('bansettings_height'));
		bannerinfoitem.setFieldValue('custrecord_redirecturl', request.getParameter('bansettings_redirecturl'));
		bannerinfoitem.setFieldValue('custrecord_redirectitemid', request.getParameter('bansettings_redirectitemid'));
		bannerinfoitem.setFieldValue('custrecord_alttext', request.getParameter('bansettings_alttext'));
		
		var file = request.getFile('bansettings_image');
		//nlapiLogExecution('DEBUG', 'File url:', file.getURL()+' '+file.getValue());
		//var folderrecord = nlapiLoadRecord('folder', 65283);
		var folderId = '135899';		//hardcoded later should be loaded from file cabinet
		fileResultUrl = '';
		if ((file != null && file != '') && (folderId != null && folderId != ''))
		{
			var fileCreated = nlapiCreateFile(file.getName(), file.getType(), file.getValue());
			fileCreated.setIsOnline(true);
			fileCreated.setFolder(folderId);
			var fileId = nlapiSubmitFile(fileCreated);
			var fileObject = nlapiLoadFile(fileId);
			fileResultUrl = fileObject.getURL();
			bannerinfoitem.setFieldValue('custrecord_imageurl', fileResultUrl);
			nlapiLogExecution('DEBUG', 'File url:', fileObject.getURL());
		}
		else
		{
			//nlapiLogExecution('DEBUG', 'Folder or file not found');
			fileResultUrl = bannerinfoitem.getFieldValue('custrecord_imageurl');
		}
		
		//build html string
		var htmloutput = '';
		if(bannerinfoitem.getFieldValue('custrecord_enabled')=='T')
		{
			//img params
			var paramshtml ='';
			var width = bannerinfoitem.getFieldValue('custrecord_width');
			if(width != 0 && width != '0' && width != ''){
				paramshtml = paramshtml + ' width="' + width + '"';
			}
			var height = bannerinfoitem.getFieldValue('custrecord_height');
			if(height != 0 && height != '0' && height != ''){
				paramshtml = paramshtml + ' height="' + height + '"';
			}
			var src = bannerinfoitem.getFieldValue('custrecord_imageurl');
			if(src != ''){
				paramshtml = paramshtml + ' src="' + src + '"';
			}
			var alt = bannerinfoitem.getFieldValue('custrecord_alttext');
			if(alt != ''){
				paramshtml = paramshtml + ' alt="' + alt + '"';
			}
			htmloutput = '<img '+ paramshtml +'></img>';
			var redirecturl = bannerinfoitem.getFieldValue('custrecord_redirecturl');
			var redirectitemid = bannerinfoitem.getFieldValue('custrecord_redirectitemid');
			if(typeof redirecturl !== 'undefined' && redirecturl !== '#' && redirecturl !== ''){//make banner clickable if redirect url provided
				htmloutput =  '<a href="' + redirecturl + '">' + htmloutput + '</a>';
			}
			if(typeof redirecturl !== 'undefined' && redirectitemid != ''){
				htmloutput =  '<a href="#" onclick="addItem(' + redirectitemid + ');return false">' + htmloutput + '</a>';
			}
			
			//htmloutput = '<a href="'+bannerinfoitem.getFieldValue('custrecord_redirecturl')+'"><img '+ paramshtml +'></img></a>';
		}
		nlapiLogExecution('DEBUG','Html output', htmloutput);
		bannerinfoitem.setFieldValue('custrecord_bannerhtml', htmloutput);
		nlapiSubmitRecord(bannerinfoitem);
		var params = new Array();
		params['selectedbanner'] = selectedbanner;
		nlapiSetRedirectURL("SUITELET", "customscript278", "customdeploy1", null, params);
	}
}
function refreshSuitelet()
{
	nlapiLogExecution('DEBUG', 'refresh');
}