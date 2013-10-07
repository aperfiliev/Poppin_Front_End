/*
 * PP_SOCIAL_MEDIA_UI_ADJUSTMENTS
 */
function validateEmail($email) {
  var emailReg = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
  //var emailReg = /^[\w-\._\+%]+@(?:[\w-]+\.)+[\w]{2,6}$/;
  if( !emailReg.test( $email ) ) {
    return false;
  } else {
    return true;
  }
}
jQuery(document).ready(function(){
//position popup
	var offset1 = jQuery('.top-links').offset();
	jQuery('#loginpositionhelper').offset({top:offset1.top+26,left:offset1.left+jQuery('.top-links').width()-jQuery('#loginpositionhelper').width()});
	jQuery('.loginli').mouseenter(function(){
	if(jQuery(".login.hidden").length==1 || window.location.href.indexOf(poppinres.url.poppincheckout)!=-1){
		jQuery('#loginpositionhelper').css('display','none');
		//jQuery("#exitsurveyplaceholder").html('<iframe src="https://checkout.sandbox.netsuite.com/c.3363929/Poppin/SocialMediaLogin2/ExitSurvey.ssp"/>');
	}
	else
	{
		jQuery('#loginpositionhelper').css('display','block');
	}
});
jQuery('#loginpositionhelper').mouseenter(function(){
	if(jQuery(".login.hidden").length==1 || window.location.href.indexOf(poppinres.url.poppincheckout)!=-1){
		jQuery('#loginpositionhelper').css('display','none');
	}
	else
	{
		jQuery('#loginpositionhelper').css('display','block');
	}
});
jQuery('.loginli').mouseleave(function(){jQuery('#loginpositionhelper').css('display','none')});
jQuery('#loginpositionhelper').mouseleave(function(){jQuery('#loginpositionhelper').css('display','none')});
//void sign in link
jQuery('.login a').attr('href','#');
//remove mini login when on login page or checkout or if user is signed in
if(window.location.href.indexOf(poppinres.url.poppincheckout)!=-1 )
{
	jQuery('#loginpositionhelper').attr('style','display:none');
}
//if(window.location.href.indexOf("checkout.netsuite.com/s.nl?c=3363929&sc=4")!=-1 &&  jQuery("submitter").length!=-1){
//	document.getElementById("submitter").onclick = function (){alert('dsds');};
//}
//add link to sociallogin checkout
if(window.location.href.indexOf("shopping-cart")!=-1 && jQuery(".login.hidden").length==0){
	var redirectquerystring = GPR_OPTIONS.options().loginURL + '&checkout=T';
	jQuery("#checkout").removeAttr("onclick");
	document.getElementById("checkout").onclick = function (){
	setGARedirectUrl( redirectquerystring  );};
}
});
/*
 * PP_SOCIAL_MEDIA_LOGIN_COOKIES
 */
function setCookie(name, value, expires, path, domain, secure) {
   if (!name || value===undefined) return false;
    var str = name + '=' + encodeURIComponent(value);
    
    if (expires) str += '; expires=' + expires.toGMTString();
    if (path)    str += '; path=' + path;
    if (domain)  str += '; domain=' + domain;
    if (secure)  str += '; secure';
    
    document.cookie = str;
    return true;
}
function storeLoginCookie(user)
{
		var email = user.email;
		var password = user.password;
		// set cookies to expire in 14 days
		var d = new Date();  d.setDate(d.getDate() + 7); 
		setCookie('poppinemail', email, d);
		setCookie('poppinpassword', password, d);
}
function getLoginCookie(name) {
    var pattern = "(?:; )?" + name + "=([^;]*);?";
    var regexp  = new RegExp(pattern);
    
    if (regexp.test(document.cookie))
    return decodeURIComponent(RegExp["$1"]);
    
    return false;
}
function resetLoginCookie()
{
	deleteCookie('poppinemail');
	deleteCookie('poppinpassword');
}
function deleteCookie(name, path, domain) {
    setCookie(name, null, new Date(0), path, domain);
    return true;
}
jQuery(function(){
	if(getLoginCookie('poppinemail')&&getLoginCookie('poppinpassword'))
	{
		document.forms['miniloginform'].elements['email'].value = getLoginCookie('poppinemail');
		document.forms['miniloginform'].elements['password'].value = getLoginCookie('poppinpassword');
	if(window.location.href.indexOf(poppinres.url.poppincheckout)!=-1)
	{
		document.forms['loginform'].elements['emaillog'].value = getLoginCookie('poppinemail');
		document.forms['loginform'].elements['password'].value = getLoginCookie('poppinpassword');
	}
}
});
/*
 * PP_SOCIAL_MEDIA_LOGIN_HEAD
 */
var MINILOGINSOCKET;
jQuery(document).ready(function(){
	var miniloginqs = GPR_OPTIONS.options().checkoutURL;
	miniloginqs = miniloginqs.substring(miniloginqs.indexOf('?'), miniloginqs.length);
if(window.location.href.indexOf('checkout.sandbox.netsuite.com')<0){
	MINILOGINSOCKET = new easyXDM.Socket({
		remote:poppinres.url.miniloginpage + miniloginqs,
		onMessage:function(message,origin)
		{
			document.body.style.cursor = 'default';
			if(message==null){
				jQuery("#dialogresponse").html(poppinres.text.responseobjectnull);
				jQuery("#dialogresponse").dialog({title:"Info"});
			};
			var responseObject = JSON.parse(message);
			console.log(responseObject);
			if(responseObject.responsetype==null){
				jQuery("#dialogresponse").html(poppinres.text.responsetypenull);
				jQuery("#dialogresponse").dialog({title:"Info"});
				return;
			};
			switch(responseObject.responsetype){
				case 'success':
					jQuery("#dialogresponse").html(responseObject.message);
					jQuery("#dialogresponse").dialog({title:"Info"});
					break
				case 'linksocial':
					window.location=poppinres.url.loginpage+ "?linksocial=T&"+jQuery.param(responseObject.message);
					break
				case 'redirect':
					var loginUser = {"remember":document.forms['miniloginform'].elements['remember'].checked,
						"email":document.forms['miniloginform'].elements['email'].value,
						"password":document.forms['miniloginform'].elements['password'].value
					};
					if(document.forms['miniloginform'].elements['remember'].checked){
						storeLoginCookie(loginUser);
					}else{
						resetLoginCookie();
					}
					if(responseObject.socializenotify!=undefined){
						var notifyobject = responseObject.socializenotify;
						if(notifyobject.type=='login'){
							gigya.socialize.notifyLogin(notifyobject.params);
						} else if (notifyobject.type=='register'){
							gigya.socialize.notifyRegistration(notifyobject.params);
						};
					};
					window.location = responseObject.message;
					break
				case 'error':
					var errormessage = responseObject.message;
					errormessage = errormessage.substring(errormessage.lastIndexOf(":")+1,errormessage.length);
					jQuery("#dialogresponse").html(errormessage);
					jQuery("#dialogresponse").dialog({title:"Info"});
					return false;
					break
				default:
					jQuery("#dialogresponse").html(poppinres.text.responsetypeunknown);
					jQuery("#dialogresponse").dialog({title:"Info"});
					return false;
			};
		}
	  });
	}
});
	function miniForgotPassword(){
		var user = {
			"requesttype" : "forgotpassword",
			"email" : document.forms['miniloginform'].elements['email'].value,
			"password" : document.forms['miniloginform'].elements['password'].value
		};
		$('#miniemail').removeClass('input-red');
		if (user.email === ''){
			showTipEmail('<p>'+poppinres.text.emailempty+'</p>');
			return false;
		}
		if (!validateEmail(user.email)){
			showTipEmail('<p>'+poppinres.text.emailinvalid+'</p>');
			return false;
		}
		var userstr = JSON.stringify(user);
		MINILOGINSOCKET.postMessage(userstr);
	}
	function showTipEmail(error_msg){
		powerTip.create('miniemail', '<p>'+error_msg+'</p>', 'powerTipminiemail', -69, 20);
		$('#miniemail').on('focusin', function() { powerTip.hide('powerTipminiemail'); });
		$('#miniemail').attr('class','input-red');
	}
	function showTipPwd(error_msg){
		powerTip.create('minipassword', '<p>'+error_msg+'</p>', 'powerTipminipassword', -69, 20);
		$('#minipassword').on('focusin', function() { powerTip.hide('powerTipminipassword'); });
		$('#minipassword').attr('class','input-red');
	}
/*
 * PP_SOCIAL_MEDIA_LOGIN_SUBMIT
 */
	jQuery(function(){
		 jQuery('#miniloginform').on('submit', function(e) {
			e.preventDefault();
			var loginUser = {
				"requesttype":"login",
				"remember":document.forms['miniloginform'].elements['remember'].checked,
				"email":document.forms['miniloginform'].elements['email'].value,
				"password":document.forms['miniloginform'].elements['password'].value,
				"checkout":false
			};
			$('#miniemail').removeClass('input-red');
			if(loginUser.email === ''){
				showTipEmail('<p>'+poppinres.text.emailempty+'</p>');
				return false;
			}
			if(!validateEmail(loginUser.email)){
				showTipEmail('<p>'+poppinres.text.emailinvalid+'</p>');
		                return false;
			}
			var userstr = JSON.stringify(loginUser);
			MINILOGINSOCKET.postMessage(userstr);
			document.body.style.cursor = 'wait';
		 });

		 jQuery('#minitwitter-email').on('submit', function(e){ 
			e.preventDefault();
			var loginUser = {
				"requesttype":"twitterlogin",
				"remember":true,
				"email":document.forms['minitwitter-email'].elements['emailtwitter'].value,
				"name":document.forms['minitwitter-email'].elements['customername'].value,
				"password":'',
				"password2":'',
				"checkout":false,
				"signatureTimestamp":document.forms['minitwitter-email'].elements['timestamp'].value,
				"UID":document.forms['minitwitter-email'].elements['UID'].value,
				"UIDSignature":document.forms['minitwitter-email'].elements['signature'].value
			};
			if(loginUser.email === ''){
				jQuery("#dialogresponse").html(loginUser.email + ' Please input email address.');
				jQuery("#dialogresponse").dialog({title:"Info"});
				return false;
			}
			if(!validateEmail(loginUser.email)){
				jQuery("#dialogresponse").html(loginUser.email + ' Please enter a valid email address.');
				jQuery("#dialogresponse").dialog({title:"Info"});
				return false;
			}
			var userstr = JSON.stringify(loginUser);
			MINILOGINSOCKET.postMessage(userstr);
			document.body.style.cursor = 'wait';
		 });
		});
/* 
 * PP_SOCIAL_MEDIA_LOGIN_GIGYA
 */
	jQuery(function(){

		var login_params=
		{
			showTermsLink: 'false'
			,height: 100
			,width: 170
			,containerID: 'componentDiv'
			,buttonsStyle: 'standard'
			,autoDetectUserProviders: ''
			,facepilePosition: 'none'
			,callback:'onLogin(response)'
	                ,hideGigyaLink:true
		};
		gigya.socialize.addEventHandlers({
		    onLogin: onLoginHandler
		});
		function onLoginHandler(eventObj) {
	var deserialized = eventObj;
	if(deserialized.provider==='twitter') {
	    			document.forms['minitwitter-email'].elements['customername'].value = deserialized['user'].firstName +' ' +deserialized['user'].lastName;
	    			document.forms['minitwitter-email'].elements['timestamp'].value = deserialized.signatureTimestamp;
	    			document.forms['minitwitter-email'].elements['UID'].value = deserialized.UID;
	    			document.forms['minitwitter-email'].elements['signature'].value = deserialized.UIDSignature;
	jQuery("#minitwitter-email").dialog({ title: "Twitter email" , minWidth:530});
	    		}
	    	else {
	var socialloginobject = {"requesttype":"sociallogin","user":eventObj};
	var userstr = JSON.stringify(socialloginobject );
		MINILOGINSOCKET.postMessage(userstr);
			   document.body.style.cursor = 'wait';
		}
	}
	 	gigya.socialize.showLoginUI(login_params);
	if(jQuery('.logout').length>-1){jQuery('.logout').click(function(){gigya.socialize.logout();return true;});}
	});
