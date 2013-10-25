function beforeUpdate() {
var taskTitle = "before update";
var record = nlapiCreateRecord( "task");
var id;
record.setFieldValue( "title", taskTitle);
id = nlapiSubmitRecord(record, true);
return true;
}

function afterUpdate() {
  nlapiLogExecution('DEBUG', 'after update','yes');

  var deploysearch = nlapiSearchRecord('scriptdeployment', null, 
        new nlobjSearchFilter('scriptid', null, 'is', 'customdeploypoppinjane'),
        null);
  var deployscriptid;
  if(deploysearch!=null){

    for (var i=0;i<deploysearch.length;i++){

      deployscriptid  = deploysearch[i].getId();  
      var deployrec = nlapiLoadRecord('scriptdeployment', deployscriptid);
      var url = deployrec.getFieldValue('externalurl');
      nlapiLogExecution('DEBUG', 'title', deployrec.getFieldValue('title'));

      nlapiLogExecution('DEBUG', 'url', url);
      deployrec.setFieldValue('externalurl', url + '&jane');
      deployrec.setFieldValue('title', deployrec.getFieldValue('title') + 'tut');
      var idrec = nlapiSubmitRecord( deployrec, true );

    }


  }
  return true;
}
