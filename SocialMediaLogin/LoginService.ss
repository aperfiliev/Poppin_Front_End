/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function service(request, response){
	try
	{
		
	var session = nlapiGetWebContainer().getShoppingSession();
		if(request.getParameter('requesttype')==null)
		{
			throw "Null Request type";
		}
		var result;
		switch(request.getParameter('requesttype'))
		{
			case 'forgotpassword':
				nlapiLogExecution('DEBUG','forgotpassword case',poppinservres.text.forgotpasswordsent);
				result = forgotPassword(request);
				nlapiLogExecution('DEBUG','exit store link request2');
				response.write(buildResponseObjectStringified("success",poppinservres.text.forgotpasswordsent));
				break
			case 'resetpassword':
				nlapiLogExecution('DEBUG','resetpassword case');
				result = forgotPassword(request);
				response.write(buildResponseObjectStringified("resetpasswordsuccess",poppinservres.text.forgotpasswordsent));
				break
			case 'login':
				nlapiLogExecution('DEBUG', 'login start', new Date().toTimeString());
				result = loginUser(request);
				if(typeof result!=="undefined"){writeResponse(result);}
				break
			case 'sociallogin':
				nlapiLogExecution('DEBUG', 'sociallogin start', new Date().toTimeString());
				result = socialMediaLogin(request);
				if(typeof result!=="undefined"){writeResponse(result.result, result.gigyanotifier);}
				break
			case 'sociallink':
				nlapiLogExecution('DEBUG','sociallink start', new Date().toTimeString());
				result = socialMediaLinkAccount(request);
				if(typeof result!=="undefined"){writeResponse(result.result, result.gigyanotifier);}
				break
			case 'manualregister':
				nlapiLogExecution('DEBUG', 'manualregister start');
				registerUser(request);
				result = loginUser(request);
				if(typeof result!=="undefined"){writeResponse(result);}
				break
			default:
				throw "Unknown Request type";
		}
	}
	catch(e)
	{
		var errormessage;
		if(request.getParameter('requesttype') == 'resetpassword')
		{
			code = "resetpassworderror";
			errormessage = e.getDetails();
		}
		else if(e instanceof nlobjError)
		{
			code = "error";
			if(e.getCode() === 'ERR_WS_RECORD_NOT_FOUND' || e.getCode() === 'ERR_WS_INVALID_EMAIL'){
				errormessage = "<p>Looks like you haven't registered yet, </p><p> <a href='<NLLOGINURL>'>create a Poppin account today.</a></p>";
			}
			else if(e.getCode() === 'ERR_WS_CUSTOMER_LOGIN')
			{
				var emailcheck = request.getParameter("email");
				nlapiLogExecution('DEBUG','email value', emailcheck);
				if(checkExistingEmail(emailcheck).length> 0 ){
					errormessage = "<p>Oops. Something's not lining up </p><p>with that password.</p>";
				} else {
					errormessage = "<p>Looks like you haven't registered yet, </p><p> <a href='<NLLOGINURL>'>create a Poppin account today.</a></p>";
				}
			} else {
				errormessage = e.getCode() + e.getDetails();
			}
			nlapiLogExecution('ERROR',e.getCode(),e.getDetails());
		}
		else
		{
			code = "error";
			nlapiLogExecution('ERROR', 'Unexpected error: ', e.toString());
			errormessage = 'Unexpected error: ' + e.toString();
		}
		response.write(buildResponseObjectStringified(code,errormessage));
	}
}
function writeResponse(result, gigyanotifier)
{
	if(typeof gigyanotifier === "undefined"){
		nlapiLogExecution('DEBUG', 'response result', 'Result: ' + result.redirecturl);
		response.write(buildResponseObjectStringified("redirect", result.redirecturl));//default response without notifier
	}
	else{
		nlapiLogExecution('DEBUG', 'response result', 'Result: ' + result.redirecturl+ ' gigyanotifier:' + JSON.stringify(gigyanotifier));
		response.write(buildResponseObjectStringified("redirect", result.redirecturl, gigyanotifier));//notify socialize plugin on register user
	}
}
function loginUser(request, sociallink)
{
	var email = request.getParameter('email');
	var pwd = '';
	var checkout = request.getParameter('checkout');
	
	//check if login performed via social link
	if(typeof sociallink === "undefined"){
		pwd = request.getParameter('password');
	}
	else{
		pwd = sociallink;
	}
	var session = nlapiGetWebContainer().getShoppingSession();
	var params;
	nlapiLogExecution('DEBUG','Checkout param:',checkout);
	var result;
	if(checkout==='true')
	{
		// saving items to variable
		var orderObj = nlapiGetWebContainer().getShoppingSession().getOrder();
		var items = orderObj.getItems(["internalId", "quantity"]);
		var promocodes = orderObj.promocodes;
		
		params = {
				"email":email,
				"password":pwd,
				"origin":'checkout'
				}
		nlapiLogExecution('DEBUG','origin checkout',JSON.stringify(params));
		result = session.login(params);

		// restoring session items
		var orderObjNew = nlapiGetWebContainer().getShoppingSession().getOrder();
		orderObjNew.removeAllItems();
		orderObjNew.addItems(items);
		if(promocodes && promocodes.length > 0)
		{
			orderObj.applyPromotionCode(promocodes[0]);
		}
	}
	else
	{
		// saving items to variable
		var orderObj = nlapiGetWebContainer().getShoppingSession().getOrder();
		var items = orderObj.getItems(["internalId", "quantity"]);
		var promocodes = orderObj.promocodes;
		
		params = {
				"email":email,
				"password":pwd
				}
		nlapiLogExecution('DEBUG','no origin',JSON.stringify(params));
		result = session.login(params);
		if(items !=null){
			// restoring session items
			var orderObjNew = nlapiGetWebContainer().getShoppingSession().getOrder();
			orderObjNew.removeAllItems();
			orderObjNew.addItems(items);
			if(promocodes && promocodes.length > 0)
			{
				orderObj.applyPromotionCode(promocodes[0]);
			}
		}
		result.redirecturl = nlapiGetWebContainer().getStandardTagLibrary().getCartUrl();
	}
	return result;
}
function registerUser(request)
{
	var emailcheck = request.getParameter("email");
	if(checkExistingEmail(emailcheck).length>0){throw poppinservres.text.useralreadyexist};
	nlapiLogExecution('DEBUG','reg1');
	var session = nlapiGetWebContainer().getShoppingSession();
	//create user
	var FullName = request.getParameter("name");
	var EmailAddr = request.getParameter("email");
	var password = request.getParameter("password");
	var password2 = request.getParameter("password2");
	var emailsubscribe = request.getParameter("emailsubscribe");
	var company = request.getParameter("company");
	if(request.getParameter("requesttype")=="sociallogin"){
		var setRandomPwd = '';
		//setRandomPwd = randomString(8, 'a#');
		//password = password2 = setRandomPwd;
		//password2 = password;
		password = password2 = '7tpI07cw';
	}
	nlapiLogExecution('DEBUG','reg2');
	//create javascript object of values. 
	
	var custObj = {};
	custObj.name = FullName;
	if(company != '' && company != null){custObj.company=company;}
	custObj.email = EmailAddr;
	custObj.password = password;
	custObj.password2 = password2;
	custObj.emailsubscribe = emailsubscribe;
	
	nlapiLogExecution('DEBUG','custObj for reg: ',JSON.stringify(custObj));
	var result = session.registerCustomer(custObj);
	nlapiLogExecution('DEBUG','registered: ', result.customerid);
	return password;
}
function randomString(length, chars) {
    var mask = '';
    if (chars.indexOf('a') > -1) mask += 'abcdefghijklmnopqrstuvwxyz';
    if (chars.indexOf('A') > -1) mask += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (chars.indexOf('#') > -1) mask += '0123456789';
    if (chars.indexOf('!') > -1) mask += '~`!@#$%^&*()_+-={}[]:";\'<>?,./|\\';
    var result = '';
    for (var i = length; i > 0; --i) result += mask[Math.round(Math.random() * (mask.length - 1))];
    return result;
}
function checkExistingEmail(email)
{
	var checkemail = {"email":email};
	nlapiLogExecution('DEBUG','enter request', new Date().toTimeString());
	var checkexistinguserresponse = nlapiRequestURL(poppinservres.url.checkexistinguser ,checkemail);
	nlapiLogExecution('DEBUG','check existing user body:', checkexistinguserresponse.getBody());
	nlapiLogExecution('DEBUG','exit request', new Date().toTimeString());
	var checkexistinguser = JSON.parse(checkexistinguserresponse.getBody());
	nlapiLogExecution('DEBUG','exit request', new Date().toTimeString());
	return checkexistinguser;
}
function socialMediaLogin(request)
{
	if(!validateSignature(request)){
		throw "Invalid signature, please try again";
		};
	var emailcheck = request.getParameter("email");
	var checkexistinguser = checkExistingEmail(emailcheck);
	
	//var checkexistinguser = parseFloat(checkexistinguserresponse.getBody());
	var gigyanotifier;
	var socialloginresult;
	if(checkexistinguser.length==0)
	{
		nlapiLogExecution('DEBUG','social login register, checkexistinguser==0',checkexistinguser.length+new Date().toTimeString());
		var pwd = registerUser(request);
		socialloginresult = socialMediaLinkAccount(request, pwd);//link accounts
	}
	else{
			nlapiLogExecution('DEBUG','social link field',JSON.stringify(checkexistinguser)+new Date().toTimeString());
			if(checkexistinguser.sociallinkpwd==null || checkexistinguser.sociallinkpwd==''){
				response.write(buildResponseObjectStringified("linksocial", 
					{
						"email":request.getParameter("email"),
						"uid":request.getParameter("UID"),
						"timestamp":request.getParameter("timestamp"),
						"signature":request.getParameter("signature")
					}));
			}
			else{
				var result = loginUser(request, checkexistinguser.sociallinkpwd);
				//build login notification for gigya
				gigyanotifier ={
						"type":"login",
						"params": {
							"siteUID":request.getParameter("UID"),
							"timestamp":request.getParameter("timestamp"),
							"signature":request.getParameter("signature")
							}
						}
				socialloginresult ={
						"result":result,
						"gigyanotifier":gigyanotifier
				}
			}
	}
	return socialloginresult;
	
}
function socialMediaLinkAccount(request,sociallink)
{
	var email = request.getParameter('email');
	
	var pwd = '';
	if(sociallink!=null && sociallink!=undefined){
		pwd = sociallink;
	}
	else{
		 pwd = request.getParameter('password');
	}
	nlapiLogExecution('DEBUG','sociallinkaccount1',new Date().toTimeString());
	var session = nlapiGetWebContainer().getShoppingSession();
	var params = {
				"email":email,
				"password":pwd
				};
	
	nlapiLogExecution('DEBUG','params',JSON.stringify(params)+new Date().toTimeString());
	var result = loginUser(request, pwd);
	//store link if login successful
	var storelinkpwd = storeSocialLink(params);
	//nlapiLogExecution('DEBUG','storelinkpwdstring: ', storelinkpwdstring.getBody()+new Date().toTimeString());
	var gigyanotifier;
	if(storelinkpwd.message==="success")
		{
		gigyanotifier ={
				"type":"register",
				"params": {
					"siteUID":request.getParameter("UID"),
					"timestamp":request.getParameter("timestamp"),
					"signature":request.getParameter("signature")
					}
				}
		nlapiLogExecution('DEBUG','sociallinkaccount1newuserredirect',JSON.stringify(gigyanotifier)+new Date().toTimeString());
		}
	else{
		throw poppinservres.text.cantlinkaccount
	}
	sociallinkresult ={
			"result":result,
			"gigyanotifier":gigyanotifier
	}
	return sociallinkresult;
}
function storeSocialLink(params){
	//store result for further redirect
	nlapiLogExecution('DEBUG','enter store link request', new Date().toTimeString());
	var storelinkpwdstring = nlapiRequestURL(poppinservres.url.storelink, params);
	nlapiLogExecution('DEBUG','exit store link request', new Date().toTimeString());
	var storelinkpwd = JSON.parse(storelinkpwdstring.getBody());
	nlapiLogExecution('DEBUG','exit store link request1');
	return storelinkpwd;
}
function forgotPassword(request)
{
	
	var EmailAddr = request.getParameter("email");
	EmailAddr = EmailAddr.toLowerCase();
	nlapiLogExecution('DEBUG','forgotpassword:','email:'+EmailAddr);
	var userexist = checkExistingEmail(EmailAddr);
	
	if(userexist.length>0){
		nlapiLogExecution('DEBUG','user exists:',JSON.stringify(userexist));
		var params = {
				email:EmailAddr,
				pwd:''
		};
		var cleanSocialLink = storeSocialLink(params);
		nlapiLogExecution('DEBUG','cleanSocialLink:','email:'+cleanSocialLink);
	}
	nlapiGetWebContainer().getShoppingSession().sendPasswordRetrievalEmail(EmailAddr);
}
function buildResponseObjectStringified(responsetype,message,newuser)
{
	var responseObject = {
			"responsetype":responsetype,
			"message":message,
			"socializenotify":newuser
			}
	return JSON.stringify(responseObject);
}
function validateSignature(request)
{
	var timestamp = request.getParameter('timestamp');
	var UID = request.getParameter('UID');
	var signature = request.getParameter('signature');
	var secretkey = "Qk35lSDWzhVAcuWrpSTERUoRKqi9gB4qnWIRXBK7fUg=";
	var now = new Date().getTime()/1000;
	if(Math.abs(now-timestamp)>180){
		return false;
		}
	nlapiLogExecution('DEBUG','Math.abs(now-timestamp)'+now+''+timestamp,Math.abs(now-timestamp));
    var mySignature = constructSignature(timestamp, UID, secretkey); 
    nlapiLogExecution('DEBUG','expected:'+signature,'result:'+ mySignature);
    if (mySignature!=signature){ 
    	nlapiLogExecution('DEBUG','Invalid signature');
    	return false;
	    }       
	else{
		nlapiLogExecution('DEBUG','Valid signature');
		return true;
	    }
}
function constructSignature(timestamp, uid, secretkey,UIDsignature)
{
	 var baseString = timestamp + "_" + uid;                                 
	 var binaryKey = CryptoJS.enc.Base64.parse(secretkey);
	 var binarySignature = CryptoJS.HmacSHA1(baseString, binaryKey ); 
	 var signature = CryptoJS.enc.Base64.stringify(binarySignature);
	 return signature;
}

/*
CryptoJS v3.1.2
code.google.com/p/crypto-js
(c) 2009-2013 by Jeff Mott. All rights reserved.
code.google.com/p/crypto-js/wiki/License
*/
var CryptoJS=CryptoJS||function(g,l){var e={},d=e.lib={},m=function(){},k=d.Base={extend:function(a){m.prototype=this;var c=new m;a&&c.mixIn(a);c.hasOwnProperty("init")||(c.init=function(){c.$super.init.apply(this,arguments)});c.init.prototype=c;c.$super=this;return c},create:function(){var a=this.extend();a.init.apply(a,arguments);return a},init:function(){},mixIn:function(a){for(var c in a)a.hasOwnProperty(c)&&(this[c]=a[c]);a.hasOwnProperty("toString")&&(this.toString=a.toString)},clone:function(){return this.init.prototype.extend(this)}},
p=d.WordArray=k.extend({init:function(a,c){a=this.words=a||[];this.sigBytes=c!=l?c:4*a.length},toString:function(a){return(a||n).stringify(this)},concat:function(a){var c=this.words,q=a.words,f=this.sigBytes;a=a.sigBytes;this.clamp();if(f%4)for(var b=0;b<a;b++)c[f+b>>>2]|=(q[b>>>2]>>>24-8*(b%4)&255)<<24-8*((f+b)%4);else if(65535<q.length)for(b=0;b<a;b+=4)c[f+b>>>2]=q[b>>>2];else c.push.apply(c,q);this.sigBytes+=a;return this},clamp:function(){var a=this.words,c=this.sigBytes;a[c>>>2]&=4294967295<<
32-8*(c%4);a.length=g.ceil(c/4)},clone:function(){var a=k.clone.call(this);a.words=this.words.slice(0);return a},random:function(a){for(var c=[],b=0;b<a;b+=4)c.push(4294967296*g.random()|0);return new p.init(c,a)}}),b=e.enc={},n=b.Hex={stringify:function(a){var c=a.words;a=a.sigBytes;for(var b=[],f=0;f<a;f++){var d=c[f>>>2]>>>24-8*(f%4)&255;b.push((d>>>4).toString(16));b.push((d&15).toString(16))}return b.join("")},parse:function(a){for(var c=a.length,b=[],f=0;f<c;f+=2)b[f>>>3]|=parseInt(a.substr(f,
2),16)<<24-4*(f%8);return new p.init(b,c/2)}},j=b.Latin1={stringify:function(a){var c=a.words;a=a.sigBytes;for(var b=[],f=0;f<a;f++)b.push(String.fromCharCode(c[f>>>2]>>>24-8*(f%4)&255));return b.join("")},parse:function(a){for(var c=a.length,b=[],f=0;f<c;f++)b[f>>>2]|=(a.charCodeAt(f)&255)<<24-8*(f%4);return new p.init(b,c)}},h=b.Utf8={stringify:function(a){try{return decodeURIComponent(escape(j.stringify(a)))}catch(c){throw Error("Malformed UTF-8 data");}},parse:function(a){return j.parse(unescape(encodeURIComponent(a)))}},
r=d.BufferedBlockAlgorithm=k.extend({reset:function(){this._data=new p.init;this._nDataBytes=0},_append:function(a){"string"==typeof a&&(a=h.parse(a));this._data.concat(a);this._nDataBytes+=a.sigBytes},_process:function(a){var c=this._data,b=c.words,f=c.sigBytes,d=this.blockSize,e=f/(4*d),e=a?g.ceil(e):g.max((e|0)-this._minBufferSize,0);a=e*d;f=g.min(4*a,f);if(a){for(var k=0;k<a;k+=d)this._doProcessBlock(b,k);k=b.splice(0,a);c.sigBytes-=f}return new p.init(k,f)},clone:function(){var a=k.clone.call(this);
a._data=this._data.clone();return a},_minBufferSize:0});d.Hasher=r.extend({cfg:k.extend(),init:function(a){this.cfg=this.cfg.extend(a);this.reset()},reset:function(){r.reset.call(this);this._doReset()},update:function(a){this._append(a);this._process();return this},finalize:function(a){a&&this._append(a);return this._doFinalize()},blockSize:16,_createHelper:function(a){return function(b,d){return(new a.init(d)).finalize(b)}},_createHmacHelper:function(a){return function(b,d){return(new s.HMAC.init(a,
d)).finalize(b)}}});var s=e.algo={};return e}(Math);
(function(){var g=CryptoJS,l=g.lib,e=l.WordArray,d=l.Hasher,m=[],l=g.algo.SHA1=d.extend({_doReset:function(){this._hash=new e.init([1732584193,4023233417,2562383102,271733878,3285377520])},_doProcessBlock:function(d,e){for(var b=this._hash.words,n=b[0],j=b[1],h=b[2],g=b[3],l=b[4],a=0;80>a;a++){if(16>a)m[a]=d[e+a]|0;else{var c=m[a-3]^m[a-8]^m[a-14]^m[a-16];m[a]=c<<1|c>>>31}c=(n<<5|n>>>27)+l+m[a];c=20>a?c+((j&h|~j&g)+1518500249):40>a?c+((j^h^g)+1859775393):60>a?c+((j&h|j&g|h&g)-1894007588):c+((j^h^
g)-899497514);l=g;g=h;h=j<<30|j>>>2;j=n;n=c}b[0]=b[0]+n|0;b[1]=b[1]+j|0;b[2]=b[2]+h|0;b[3]=b[3]+g|0;b[4]=b[4]+l|0},_doFinalize:function(){var d=this._data,e=d.words,b=8*this._nDataBytes,g=8*d.sigBytes;e[g>>>5]|=128<<24-g%32;e[(g+64>>>9<<4)+14]=Math.floor(b/4294967296);e[(g+64>>>9<<4)+15]=b;d.sigBytes=4*e.length;this._process();return this._hash},clone:function(){var e=d.clone.call(this);e._hash=this._hash.clone();return e}});g.SHA1=d._createHelper(l);g.HmacSHA1=d._createHmacHelper(l)})();
(function(){var g=CryptoJS,l=g.enc.Utf8;g.algo.HMAC=g.lib.Base.extend({init:function(e,d){e=this._hasher=new e.init;"string"==typeof d&&(d=l.parse(d));var g=e.blockSize,k=4*g;d.sigBytes>k&&(d=e.finalize(d));d.clamp();for(var p=this._oKey=d.clone(),b=this._iKey=d.clone(),n=p.words,j=b.words,h=0;h<g;h++)n[h]^=1549556828,j[h]^=909522486;p.sigBytes=b.sigBytes=k;this.reset()},reset:function(){var e=this._hasher;e.reset();e.update(this._iKey)},update:function(e){this._hasher.update(e);return this},finalize:function(e){var d=
this._hasher;e=d.finalize(e);d.reset();return d.finalize(this._oKey.clone().concat(e))}})})();

(function(){var h=CryptoJS,j=h.lib.WordArray;h.enc.Base64={stringify:function(b){var e=b.words,f=b.sigBytes,c=this._map;b.clamp();b=[];for(var a=0;a<f;a+=3)for(var d=(e[a>>>2]>>>24-8*(a%4)&255)<<16|(e[a+1>>>2]>>>24-8*((a+1)%4)&255)<<8|e[a+2>>>2]>>>24-8*((a+2)%4)&255,g=0;4>g&&a+0.75*g<f;g++)b.push(c.charAt(d>>>6*(3-g)&63));if(e=c.charAt(64))for(;b.length%4;)b.push(e);return b.join("")},parse:function(b){var e=b.length,f=this._map,c=f.charAt(64);c&&(c=b.indexOf(c),-1!=c&&(e=c));for(var c=[],a=0,d=0;d<
e;d++)if(d%4){var g=f.indexOf(b.charAt(d-1))<<2*(d%4),h=f.indexOf(b.charAt(d))>>>6-2*(d%4);c[a>>>2]|=(g|h)<<24-8*(a%4);a++}return j.create(c,a)},_map:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="}})();
