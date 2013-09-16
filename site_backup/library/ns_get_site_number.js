// JavaScript Document



/**
 *	GENERIC: check functions
 * 	exists - returns boolean true if function or variable exists . Uses isDef()
 * 
 */
function isBool(x)	{ return (typeof x == 'boolean'); }
function isDef(x)	{ return (typeof x!== 'undefined'); }
function isNull(x)	{ return (isDef(x) && x===null); }

/**
 *	return NetSuite site number
 *
 *	if unable return NULL, let outside logic decide what to do.
 */
function get_site_number(secureUrl){
	var n = null, input, meta, actionAttr, submitAttr;
	
	try{		
		if(isDef(secureUrl))												/* try with a secure URL */
			n = (secureUrl.indexOf('/n.') < 0)? get_url_params(secureUrl, 'n') : secureUrl.split('/n.')[1].split('/')[0];
			
		if(n == null){					
			if ((input = $j('input[name="n"]')).length) {
			    n = input.attr('value');									/*	try with input n */ 
			}
			else if((meta = $j('head meta[name="site-number"]')).length){
				n = meta.attr('content'); 									/*  try with meta site-number */	
			}
			else{															
				$j('form').each(function(){									/*  getting deseperate here! try with forms */
					var action = $j(this).attr('action');
					var submitF = $j(this).attr('submit');
					
					var valA = null, valS = null;
					if(isDef(action)) 	valA = get_url_params(action,'n');
					if(isDef(submitF))	valS = get_url_params(submitF,'n');

					n = !isNaN(valA)? valA : valS;

					if(!isNaN(parseInt(n))) return false;					/* found n ? BREAK LOOP */
				});
			}
		}
		return n;
	}
	catch(e){
		console.log("getsiteNumumber error: " +  e.message);		
		return null;														/* always null if unable to find */	
	}	
}

/**
 *	get parameter from URL
 *	- url format: url.xx?param1=value1&param2=value2
 *	- no_question, forces ignoring "?" sign
 *
 *	if unable return NULL.
 */
function get_url_params(url, param, no_question){
	no_question = isBool(no_question)? no_question : false;
	param = param+'=';
	var value = null;
	try{
		if (no_question || url.indexOf('?') > -1){					
			parameters = no_question ? url : url.split('?')[1];
			var sep = parameters.indexOf('&\amp;') > -1?'&\amp;':'&';
			if (parameters.indexOf(param) > -1){
				$j.each(url.split(sep), function(index,val){ 
					value = val.indexOf(param) == 0? val.split(param)[1] : value; 
				}); 
			}
		}
	}
	catch(e){
		console.log("get_url_params error: " +  e.message);
		return null;
	}
	return value;
}
