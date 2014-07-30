//customrecord - layout
var layout = nlapiCreateRecord('customrecordtype');
layout.setFieldValue('recordname','Search Pivot Layout');//1 UI
layout.setFieldValue('scriptid','_ns_pivotlayout');//1 UI
layout.setFieldValue('includename','F');//1 UI
var layoutid = nlapiSubmitRecord(layout);

//customfield
var searchRef = nlapiCreateRecord('customrecordcustomfield',{'rectype':layoutid});
//searchRef.setFieldValue('fieldtype','SELECT');//1 UI
searchRef.setFieldValue('fieldtype','INTEGER');//1 UI
searchRef.setFieldValue('label','Saved Search');//1 UI
//searchRef.setFieldValue('selectrecordtype','-119');//1 search record type
searchRef.setFieldValue('internalid','_ns_pivot_layout_search_id');//1 UI
nlapiSubmitRecord(searchRef);

var searchRef2 = nlapiCreateRecord('customrecordcustomfield',{'rectype':layoutid});
searchRef2.setFieldValue('label','Search _Type');//1 UI
searchRef2.setFieldValue('internalid','_ns_pivot_layout_search_type');//1 UI
nlapiSubmitRecord(searchRef2);


//layout title
var searchRef3 = nlapiCreateRecord('customrecordcustomfield',{'rectype':layoutid});
searchRef3.setFieldValue('label','Title');//1 UI
searchRef3.setFieldValue('internalid','_ns_pivot_layout_title');//1 UI
nlapiSubmitRecord(searchRef3);

//custom record - fields
var fields = nlapiCreateRecord('customrecordtype');
fields.setFieldValue('recordname','Search Pivot Field');//1 UI
fields.setFieldValue('scriptid','_ns_pivotfields');//1 UI
fields.setFieldValue('includename','F');//1 UI
var fieldsId = nlapiSubmitRecord(fields);

//customfield - parent reference
var parent = nlapiCreateRecord('customrecordcustomfield',{"rectype":fieldsId});
parent.setFieldValue('label','Layout');//1 UI
parent.setFieldValue('fieldtype','SELECT');//1 UI
parent.setFieldValue('selectrecordtype',layoutid);//1 UI
parent.setFieldValue('isparent','T');//1 UI
parent.setFieldValue('internalid','_ns_pivot_field_layout');//1 UI
nlapiSubmitRecord(parent);

//cf - report field sequence number
var seqnum = nlapiCreateRecord('customrecordcustomfield',{"rectype":fieldsId});
seqnum.setFieldValue('label','Search Field Sequence Number');//1 UI
seqnum.setFieldValue('fieldtype','INTEGER');//1 UI
seqnum.setFieldValue('internalid','_ns_pivot_field_seqnum');//1 UI
nlapiSubmitRecord(seqnum);

//cf - pivot type row/col/fact/measure
var type = nlapiCreateRecord('customrecordcustomfield',{"rectype":fieldsId});
type.setFieldValue('label','Pivot Type');//1 UI
type.setFieldValue('internalid','_ns_pivot_field_type');//1 UI
type.setFieldValue('ismandatory','T');//1 UI 
nlapiSubmitRecord(type);


var type = nlapiCreateRecord('customrecordcustomfield',{"rectype":fieldsId});
type.setFieldValue('label','Search Alias');//1 UI
type.setFieldValue('internalid','_ns_pivot_field_alias');//1 UI
type.setFieldValue('ismandatory','T');//1 UI 
nlapiSubmitRecord(type);

/*
//customrecord - cache
var cache = nlapiCreateRecord('customrecordtype');
cache.setFieldValue('recordname','Pivot Search Cache');//1 UI
cache.setFieldValue('showowner','T');//1 UI
cache.setFieldValue('scriptid','_ns_pivotcache');//1 UI
cache.setFieldValue('includename','F');//1 UI
var cacheid = nlapiSubmitRecord(cache);

//cache metadata
var metadata = nlapiCreateRecord('customrecordcustomfield',{"rectype":cacheid});
metadata.setFieldValue('label','MetaData');//1 UI
metadata.setFieldValue('internalid','_ns_pivotcache_metadata');//1 UI
metadata.setFieldValue('fieldtype','TEXTAREA');//1 UI
nlapiSubmitRecord(metadata);

//cache jsondatasource
var ds = nlapiCreateRecord('customrecordcustomfield',{"rectype":cacheid});
ds.setFieldValue('label','Cached DataSource');//1 UI
ds.setFieldValue('internalid','_ns_pivotcache_datasource');//1 UI
ds.setFieldValue('fieldtype','DOCUMENT');//1 UI
nlapiSubmitRecord(ds);

//cache searchid reference
var csearch = nlapiCreateRecord('customrecordcustomfield',{"rectype":cacheid});
csearch.setFieldValue('label','Cached Search Id');//1 UI
csearch.setFieldValue('internalid','_ns_pivotcache_searchid');//1 UI
csearch.setFieldValue('fieldtype','INTEGER');//1 UI
nlapiSubmitRecord(csearch);


//cache searchid reference
var csearchid = nlapiCreateRecord('customrecordcustomfield',{"rectype":cacheid});
csearchid.setFieldValue('label','Cached Search Type');//1 UI
csearchid.setFieldValue('internalid','_ns_pivotcache_searchtype');//1 UI
csearchid.setFieldValue('fieldtype','TEXT');//1 UI
nlapiSubmitRecord(csearchid);

var ds_tz = nlapiCreateRecord('customrecordcustomfield',{"rectype":cacheid});
ds_tz.setFieldValue('internalid','_ns_pivotcache_ds_timestamp');//1 UI
ds_tz.setFieldValue('label','DataSource Load TimeStamp');//1 UI
ds_tz.setFieldValue('fieldtype','DATETIMETZ');//1 UI
nlapiSubmitRecord(ds_tz);

var cache_lmt = nlapiCreateRecord('customrecordcustomfield',{"rectype":cacheid});
cache_lmt.setFieldValue('label','Last Modified TimeStamp');//1 UI
cache_lmt.setFieldValue('internalid','_ns_pivotcache_lmt');//1 UI
cache_lmt.setFieldValue('fieldtype','DATETIMETZ');//1 UI
nlapiSubmitRecord(cache_lmt);
*/

var script = nlapiCreateRecord('script', {'scripttype':'SCRIPTLET'});
//set body fields
script.setFieldValue('name','PivotSearch Installation');
script.setFieldValue('scriptid','_ns_pivotsearch_installation');
script.setFieldValue('scriptfile',nlapiSearchGlobal('pivotsearch.js')[0].getId());
script.setFieldValue('defaultfunction','service');

//add the libraries
script.setLineItemValue('libraries','scriptfile',1, nlapiSearchGlobal('date2.js')[0].getId());
script.setLineItemValue('libraries','scriptfile',2, nlapiSearchGlobal('ext-util.js')[0].getId());
script.setLineItemValue('libraries','scriptfile',3, nlapiSearchGlobal('trimpath-template-1.0.38.js')[0].getId());
script.setLineItemValue('libraries','scriptfile',4, nlapiSearchGlobal('PG-LayoutComposer')[0].getId());

var scriptid = nlapiSubmitRecord(script);

var deployment = nlapiCreateRecord('scriptdeployment', {'scripttype':scriptid});
nlapiSubmitRecord(deployment);

/*
javascript:{
nlapiSetFieldValue('name','PivotSearch Installation');
nlapiSetFieldValue('scriptid','_ns_pivotsearch_installation');
nlapiSetFieldValue('scriptfile',nlapiSearchGlobal('pivotsearch.js')[0].getId());
nlapiSetFieldValue('defaultfunction','service');

nlapiSetCurrentLineItemValue('libraries','scriptfile',nlapiSearchGlobal('date2.js')[0].getId());
nlapiCommitLineItem('libraries');
nlapiSetCurrentLineItemValue('libraries','scriptfile',nlapiSearchGlobal('ext-util.js')[0].getId());
nlapiCommitLineItem('libraries');
nlapiSetCurrentLineItemValue('libraries','scriptfile',nlapiSearchGlobal('trimpath-template-1.0.38.js')[0].getId());
nlapiCommitLineItem('libraries');
nlapiSetCurrentLineItemValue('libraries','scriptfile',nlapiSearchGlobal('PG-LayoutComposer')[0].getId());
nlapiCommitLineItem('libraries');

nlapiSetCurrentLineItemValue('deployments','title','PivotSearch Deployment');
nlapiCommitLineItem('deployments');
}
*/

