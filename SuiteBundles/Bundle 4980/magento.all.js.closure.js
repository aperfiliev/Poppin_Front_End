if(!Celigo)var Celigo={};Celigo.MagentoItemFieldAction=function(c){Celigo.MagentoItemFieldAction.extend(Celigo.Runnable);Celigo.MagentoItemFieldAction.superclass.constructor.call(this,c);this.getPoints=function(){return 5};this.getSeconds=function(){return 0};this.run=function(a){nlapiLogExecution("debug","processing item "+a.id);nlapiSubmitField(a.type,a.id,"custitem_celigo_magento_item","F",true)}};Celigo||(Celigo={});
Celigo.MagentoItemFieldBatchProcess=function(c){Celigo.MagentoItemFieldBatchProcess.extend(Celigo.BatchProcess);Celigo.MagentoItemFieldBatchProcess.superclass.constructor.call(this,c);this.getListOfRunnableClassnames=function(){return["Celigo.MagentoItemFieldAction"]};this.getAllObjects=function(){var a=[];a=[];var b=[];a.push(new nlobjSearchFilter("custitem_celigo_magento_item",null,"is","T"));b.push(new nlobjSearchColumn("internalid"));b[0].setSort();b=Celigo.util.search("item",null,a,b,9E5);a=
[];for(var d=0;b&&d<b.length;d++){var e=[];e.id=b[d].getId();e.type=b[d].getRecordType();a.push(e)}return a};this.getScriptParameterId=function(){return"custscript_celigo_mg_clearitemfield"}};function main(c){(new Celigo.MagentoItemFieldBatchProcess).start()};