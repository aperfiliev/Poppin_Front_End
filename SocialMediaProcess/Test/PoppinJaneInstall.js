function beforeUpdate() {

//var str = nlapiResolveURL('SUITELET', 'customscript285','customdeploy1', true);
/*var str = nlapiResolveURL('SUITELET', 'customscript285','customdeploycustom_deploy_jane', true);
var params = new Array();
params['externalurl'] = str+"&jane";
nlapiSetRedirectURL('SUITELET', 'customscript285','customdeploy1', true, params);

var taskTitle = "before update" + str;
var record = nlapiCreateRecord( "task");
var id;
record.setFieldValue( "title", taskTitle);
id = nlapiSubmitRecord(record, true);
*/
var str = nlapiResolveURL('SUITELET', 'customscript285','customdeploycustom_deploy_jane', true);
var taskTitle = "before update" + str;
var record = nlapiCreateRecord( "task");
var id;
record.setFieldValue( "title", taskTitle);
id = nlapiSubmitRecord(record, true);
/*

var params = new Array();
        params["custpage_customerid"] = 12345;
        nlapiSetRedirectURL("SUITELET", , 'customscript285','customdeploycustom_deploy_jane', null, params);

//var suitelet = nlapiLoadRecord('SUITELET', '285');
//var deploy2 = suitelet.nlapiEditSubrecord('customdeploycustom_deploy_jane');
//deploy2.setFieldValue(‘externalurl’, str + "&jane");
//var id = nlapiSubmitRecord();
/*
var record1 = nlapiCreateRecord( "task");
record1.setFieldValue( "title", 'test');
id = nlapiSubmitRecord(record1, true);*/
return true;
}

function afterUpdate() {

var taskTitle = "after update";
var record = nlapiCreateRecord( "task");
var id;
record.setFieldValue( "title", taskTitle);
id = nlapiSubmitRecord(record, true);

return true;
}
