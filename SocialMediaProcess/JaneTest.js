function beforeUpdate() {
var taskTitle = "before update";
var record = nlapiCreateRecord( "task");
var id;
record.setFieldValue( "title", taskTitle);
id = nlapiSubmitRecord(record, true);
return true;
}

function afterInstall() {
  nlapiLogExecution('DEBUG', 'after update','yes');

  var deploysearch = nlapiSearchRecord('scriptdeployment', null, 
        new nlobjSearchFilter('scriptid', null, 'is', 'customdeploypoppinjane'),
        null);
  var deployscriptid;
  if(deploysearch!=null){
    
    var recordapp = nlapiCreateRecord("customrecord_pp_ssp_application");
    recordapp.setFieldValue('name', 'Main');
    var idapp= nlapiSubmitRecord(recordapp, true);

    nlapiLogExecution('DEBUG', 'idapp', idapp);

    for (var i=0;i<deploysearch.length;i++){

      deployscriptid  = deploysearch[i].getId();  
      var deployrec = nlapiLoadRecord('scriptdeployment', deployscriptid);
      var url = deployrec.getFieldValue('externalurl');
      nlapiLogExecution('DEBUG', 'title', deployrec.getFieldValue('title'));

      nlapiLogExecution('DEBUG', 'url', url);

      var recordsett= nlapiCreateRecord("customrecord_pp_ssp_setting");
      recordsett.setFieldValue('custrecord_pp_ssp_setting_type', 'deploy_externalurl');
      recordsett.setFieldValue('name', deployrec.getFieldValue('title') );
      recordsett.setFieldValue('custrecord_pp_ssp_setting_value', deployrec.getFieldValue('externalurl') );
      recordsett.setFieldValue('custrecord_pp_ssp_application', idapp);

      var idsett = nlapiSubmitRecord(recordsett, true);

      nlapiLogExecution('DEBUG', 'idsett', idsett);

    }

  }
  return true;
}