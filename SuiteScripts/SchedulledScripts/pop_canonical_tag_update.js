var FILE_PATH = 'CanonicalUrlUpdate/CanonicalURL.csv';
var SAVED_SEARCH_ID = 'customsearch1139';
var GOVERNANCE_TRESHOLD = 20;

function updateItems()
{
	var file;
	try{	    
		file = nlapiLoadFile(FILE_PATH);
	}
	catch (e){
		nlapiLogExecution('ERROR','Error message:',e);
	}
	if (file){	
		var succeedCounter = 0;	
		var value = file.getValue();
		var valueDecoded = decodeBase64(value);	
/**/	nlapiLogExecution('DEBUG','FILE',valueDecoded);
		var map = parseFile(valueDecoded);
/**/	nlapiLogExecution('DEBUG','PARSE',JSON.stringify(map));
		var internalIdToTypeMap = new Object();
		var internalIdCriteria = [];
		var counter = 0;
		for (var property in map){	
			internalIdCriteria[counter] = property;	
			counter++;			
		}
		var res; 
		var rows = new Array();	
		if (internalIdCriteria &&internalIdCriteria.length>0){
			res = nlapiSearchRecord('item', SAVED_SEARCH_ID, [new nlobjSearchFilter("internalid", null, "anyof", internalIdCriteria)], null);
		}			 
		if(res) {
			rows = rows.concat(res);
			while(res.length == 1000) {
				var lastId=res[999].getId();
				res = nlapiSearchRecord(
					'item', 
					SAVED_SEARCH_ID, 
					[
						new nlobjSearchFilter("internalIdNumber", null, "greaterThan", lastId),
						new nlobjSearchFilter("internalid", null, "anyof", internalIdCriteria)
					], 
					null
				);
				if(res) {
					rows = rows.concat(res);
				}
			}
		}
		if 	(rows){							
			for ( var i = 0; i < rows.length; i++ ){ 				
				var searchresult = rows[ i ];					
				var internalId = searchresult.getId();
				var type = searchresult.getRecordType();
				internalIdToTypeMap[internalId] = type;				
			}					
		}
		for (var property in internalIdToTypeMap){	
			try{	
				checkGovernance();	
				var item  = nlapiLoadRecord(internalIdToTypeMap[property],property);
				if (item){
					item.setFieldValue('custitem40',map[property]);
					nlapiSubmitRecord(item, false, true);
					succeedCounter++;
				}
			}
			catch (e){
				nlapiLogExecution('ERROR','Can\'t update Canonical URL for item = ' + property + ' Reason',e);
			}
		}
		nlapiLogExecution('DEBUG','Canonical URL update counter',succeedCounter);
	}	else {
		nlapiLogExecution('ERROR','Can\'t load file from File Cabinet',FILE_PATH);
	}	
}

function decodeBase64 (s) {
    var e={},i,b=0,c,x,l=0,a,r='',w=String.fromCharCode,L=s.length;
    var A="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    for(i=0;i<64;i++){e[A.charAt(i)]=i;}
    for(x=0;x<L;x++){
        c=e[s.charAt(x)];b=(b<<6)+c;l+=6;
        while(l>=8){((a=(b>>>(l-=8))&0xff)||(x<(L-2)))&&(r+=w(a));}
    }
    return r;
}

function parseFile(decoded){
	var o = new Object();
	if (decoded){
		var rows = decoded.match(/[^\r\n]+/g);
		if (rows && rows.length>0){
			for (i=0;i<rows.length;i++){		
				var rowSplited = rows[i].split(",");
				if ((rowSplited) && (rowSplited.length ==2)){
					if (!isNaN(rowSplited[0])){
						o[rowSplited[0]] = rowSplited[1];
					}					
				}					
			} 
		} 
	}
	return o;
}

function checkGovernance(){
	 var context = nlapiGetContext();
	 if( context.getRemainingUsage() < GOVERNANCE_TRESHOLD )
	 {
	  var state = nlapiYieldScript();
	  if( state.status == 'FAILURE'){
		nlapiLogExecution("ERROR","Failed to yield script, exiting: Reason = "+state.reason + " / Size = "+ state.size);
		throw "Failed to yield script";
	  } 
	  else if ( state.status == 'RESUME' ){
		nlapiLogExecution("AUDIT", "Resuming script because of " + state.reason+".  Size = "+ state.size);
	  } 
	}
}