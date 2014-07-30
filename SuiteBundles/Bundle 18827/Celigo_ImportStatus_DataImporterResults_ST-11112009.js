/*
 * 2005-2008 Celigo, Inc. All Rights Reserved.
 * 
 * Version:    1.0.0
 * Type:       Suitelet
 *
 * Purpose: 
 *    <What the script does>
 *
 * Revisions:
 *    <Date in MM/DD/YYYY format> - Initial version
 *
 */

var DataImporter = {};
DataImporter.ImportStatus = (function(){ //private members
    
	function ImportStatusManager(){
    
        //instance vars
		var that = this;
		
		//methods
		this.displayResults = function(){
			var list = nlapiCreateList('Celigo Data Importer Results--Last 7 Days');
			list.setStyle(request.getParameter('style'));
			var column = list.addColumn('id','text', 'ID', 'LEFT');
			column.setURL(nlapiResolveURL('RECORD','customrecord_celigo_import_status'));
			column.addParamToURL('id','id', true);
			list.addColumn('created','date', 'Date Created', 'LEFT');
			list.addColumn('custrecord_celigo_import_status_job_name','text', 'Job Name', 'LEFT');
			list.addColumn('custrecord_celigo_import_status_rec_type','text', 'Record Type', 'LEFT');
			list.addColumn('custrecord_celigo_import_status_status','text', 'Status', 'LEFT');
			list.addColumn('custrecord_celigo_import_status_message','text', 'Message', 'LEFT');
			list.addColumn('results','url', 'Results', 'LEFT');
			
			var returncols = new Array();
			returncols[0] = new nlobjSearchColumn('created');
			returncols[1] = new nlobjSearchColumn('custrecord_celigo_import_status_job_name');
			returncols[2] = new nlobjSearchColumn('custrecord_celigo_import_status_rec_type');
			returncols[3] = new nlobjSearchColumn('custrecord_celigo_import_status_status');
			returncols[4] = new nlobjSearchColumn('custrecord_celigo_import_status_message');
			returncols[5] = new nlobjSearchColumn('custrecord_celigo_import_status_result');
			
			var searchDate = new Date();
			searchDate.setTime(searchDate.getTime() - new Number(604800000));
			
			var results = nlapiSearchRecord('customrecord_celigo_import_status', null, new nlobjSearchFilter('created',null,'after',searchDate), returncols);
			
			
			list.addRows( this.filterResults(results) );
			return list;
        };
        
        this.filterResults = function(results) {
        	var importStatuses = new Array();
			if(results != null && results.length > 0)
			{
				
				for(var i=0; i < results.length; i++)
				{
					var thisRow = new Array();
					thisRow['id'] = results[i].getId();
					thisRow['created'] = results[i].getValue('created');
					thisRow['custrecord_celigo_import_status_job_name'] = results[i].getValue('custrecord_celigo_import_status_job_name');
					thisRow['custrecord_celigo_import_status_rec_type'] = results[i].getText('custrecord_celigo_import_status_rec_type');
					thisRow['custrecord_celigo_import_status_status'] = results[i].getText('custrecord_celigo_import_status_status');
					thisRow['custrecord_celigo_import_status_message'] = results[i].getValue('custrecord_celigo_import_status_message');
					
					if(results[i].getValue('custrecord_celigo_import_status_result') != null && results[i].getValue('custrecord_celigo_import_status_result') !== '') {
						try {
							var file = nlapiLoadFile(results[i].getValue('custrecord_celigo_import_status_result'));
							if(file != null)
								thisRow['results'] = "<a href=" + file.getURL() + ">" + file.getName() + "</a>";
						} catch (e) {
							nlapiLogExecution('ERROR', e.name || e.getCode(), e.message || e.getDetails());
							nlapiLogExecution('ERROR', 'LOAD FILE check line', Util.getLineNumber(e));
							continue;
						}
					} else {
						thisRow['results'] = '';
					}
					importStatuses.push(thisRow);
				}
			}
			return importStatuses
        };
        
    }
	
    return { //public members
        main: function(request, response){
            try {
            	var importStatusManager = new ImportStatusManager();
            	response.writePage( importStatusManager.displayResults() );
            } 
            catch (e) {
				response.write((e.name || e.getCode())+': '+ (e.message || e.getDetails())+' check line '+Util.getLineNumber(e));
				nlapiLogExecution('ERROR', e.name || e.getCode(), e.message || e.getDetails());
				nlapiLogExecution('ERROR', 'check line', Util.getLineNumber(e));
            }
        }
    }
})();
