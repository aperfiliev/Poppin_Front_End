/*
 * PP_MOBILE_REDIRECT
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
function getCookie(name){
var pattern = "(?:; )?" + name + "=([^;]*);?";
    var regexp  = new RegExp(pattern);
    
    if (regexp.test(document.cookie))
    return decodeURIComponent(RegExp["$1"]);
    
    return false;
}
function deleteCookie(name, path, domain) {
    setCookie(name, null, new Date(0), path, domain);
    return true;
}
function getQuerystring(key, default_)
{
	if (default_==null) default_=""; 
	key = key.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
	var regex = new RegExp("[\\?&]"+key+"=([^&#]*)");
	var qs = regex.exec(window.location.href);
	if(qs == null)
	return default_;
	else
	return qs[1];
}
var isTablet = {
    iPad: function() {
        return navigator.userAgent.match(/iPad/);
    },
    Xoom: function() {
        return navigator.userAgent.match(/Xoom/);
    },
    Playbook: function() {
        return navigator.userAgent.match(/Playbook/);
    },
    Silk: function() {
        return navigator.userAgent.match(/Silk/);
    },
    any: function() {
        return (isTablet.iPad() || isTablet.Xoom() || isTablet.Playbook() || isTablet.Silk());
    }
};
var isMobile = {
    Android: function() {
        return navigator.userAgent.match(/Android/i);
    },
    BlackBerry: function() {
        return navigator.userAgent.match(/BlackBerry/i);
    },
    iOS: function() {
        return navigator.userAgent.match(/iPhone|iPod/i);
    },
    Opera: function() {
        return navigator.userAgent.match(/Opera Mini/i);
    },
    Windows: function() {
        return navigator.userAgent.match(/IEMobile/i);
    },
    GoogleBotMobile: function() {
        return navigator.userAgent.match(/GoogleBotMobile/i);
    },
    OperaMobi: function() {
        return navigator.userAgent.match(/Opera\ Mobi/i);
    },
    any: function() {
        return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows() || isMobile.GoogleBotMobile() || isMobile.OperaMobi());
    }
};
function checkMobileAndTablet(){
var qsMobile = getQuerystring('MobileOptOut');
var coMobile = getCookie('MobileOptOut');
if( qsMobile == '1' ||  coMobile == '1' || isTablet.any() || navigator.userAgent.match(/BrandingBrand/)){
var cookietime= new Date();
cookietime.setMinutes(cookietime.getMinutes() + 30);
setCookie('MobileOptOut',1,cookietime);
return;
}
//on load code
if( qsMobile == '0'){ deleteCookie('MobileOptOut');}
//check if executed on mobile device
if(isMobile.any()){
//check querystring
var mobileurl = window.location.href;
var mobilequerystring='';
if(mobileurl.indexOf(".com")>0){
mobilequerystring= mobileurl.substring((mobileurl.indexOf(".com")+4), mobileurl.length);
}
var paypalurl = '';
if(mobileurl.indexOf('expresscheckoutreturn.nl')>0){
paypalurl = '/app/site/backend/paypal/expresscheckoutreturn.nl';
}
window.location.href = "http://poppin.uat.bbhosted.com" + paypalurl + mobilequerystring;
}
}
checkMobileAndTablet();


/*
 * PP_SOCIAL_MEDIA_UI_ADJUSTMENTS
 */
function validateEmail($email) {
	var emailReg = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
	if (!emailReg.test($email)) {
		return false;
	} else {
		return true;
	}
}


jQuery(document).ready(function() {
	var offset1 = jQuery('.top-links').offset();
	//check qs for reset password
	if(getQuerystring('e') && getQuerystring('dt') && getQuerystring('cb')){
		resetPasswordOld();
	}
//	jQuery('#loginpositionhelper').offset({
//		top : offset1.top + 26,
//		left : offset1.left + jQuery('.top-links').width() - jQuery('#loginpositionhelper').width()
//	});
//	jQuery('.loginli').mouseenter(function() {
//		if (jQuery(".login.hidden").length == 1 || window.location.href.indexOf(poppinres.url.poppincheckout) != -1) {
//			jQuery('#loginpositionhelper').css('display', 'none');
//		} else {
//			jQuery('#loginpositionhelper').css('display', 'block');
//		}
//	});
//	jQuery('#loginpositionhelper').mouseenter(function() {
//		if (jQuery(".login.hidden").length == 1 || window.location.href.indexOf(poppinres.url.poppincheckout) != -1) {
//			jQuery('#loginpositionhelper').css('display', 'none');
//		} else {
//			jQuery('#loginpositionhelper').css('display', 'block');
//		}
//	});
//	jQuery('#miniemail, #minipassword').on('focusin', function() {
//		jQuery('#loginpositionhelper').addClass("noblur");
//	});
//	jQuery('#miniemail, #minipassword').on('focusout', function() {
//		jQuery('#loginpositionhelper').removeClass("noblur");
//	});
//	jQuery('.loginli').mouseleave(function() {
//		if(!jQuery('#loginpositionhelper').hasClass("noblur")) {
//			jQuery('#loginpositionhelper').css('display', 'none');
//		}
//	});
//	jQuery('#loginpositionhelper').mouseleave(function() {
//		if(!jQuery('#loginpositionhelper').hasClass("noblur")) {
//			jQuery('#loginpositionhelper').css('display', 'none');
//		}
//	});
	
	$j('#coverdiv').click(function(){
		if($j('#loginpositionhelper').css('display') != 'none') {
			$j('#loginpositionhelper').hide();$j('#coverdiv').hide();
			}
	});
	jQuery('.login a').attr('href', '#');
	jQuery('.login button').click(function(){
		if(window.location.href.indexOf('https') > -1){
			return false;
		}
		if(jQuery('#loginpositionhelper').is(':visible')){
			jQuery('#coverdiv').hide();
			jQuery('#loginpositionhelper').hide();
		}
		else{
			jQuery('#coverdiv').show();
			jQuery('#loginpositionhelper').show();
		}
		});
	
	if (window.location.href.indexOf(poppinres.url.poppincheckout) != -1) {
		jQuery('#loginpositionhelper').attr('style', 'display:none');
	}
	if (window.location.href.indexOf("shopping-cart") != -1 && jQuery(".login.hidden").length == 0) {
		var redirectquerystring = GPR_OPTIONS.options().loginURL + '&checkout=T';
		jQuery("#checkout").removeAttr("onclick");
		document.getElementById("checkout").onclick = function() {
			setGARedirectUrl(redirectquerystring);
		};
	}
});
function miniloginInit() {
}
/*
 * PP_SOCIAL_MEDIA_LOGIN_COOKIES
 */
 function setCookie(name, value, expires, path, domain, secure) {
	if (!name || value === undefined)
		return false;
	var str = name + '=' + encodeURIComponent(value);

	if (expires)
		str += '; expires=' + expires.toGMTString();
	if (path)
		str += '; path=' + path;
	if (domain)
		str += '; domain=' + domain;
	if (secure)
		str += '; secure';

	document.cookie = str;
	return true;
}
function storeLoginCookie(user) {
	var email = user.email;
	var password = user.password;
	// set cookies to expire in 14 days
	var d = new Date();
	d.setDate(d.getDate() + 7);

	setCookie('poppinemail', email, d);
	setCookie('poppinpassword', password, d);
}
function getLoginCookie(name) {
	var pattern = "(?:; )?" + name + "=([^;]*);?";
	var regexp = new RegExp(pattern);
	if (regexp.test(document.cookie))
		return decodeURIComponent(RegExp["$1"]);
	return false;
}
function resetLoginCookie() {
	deleteCookie('poppinemail');
	deleteCookie('poppinpassword');
}
function deleteCookie(name, path, domain) {
	setCookie(name, null, new Date(0), path, domain);
	return true;
}
jQuery(function() {
	if (getLoginCookie('poppinemail') && getLoginCookie('poppinpassword')) {
		document.forms['miniloginform'].elements['email'].value = getLoginCookie('poppinemail');
		document.forms['miniloginform'].elements['password'].value = getLoginCookie('poppinpassword');
		if (window.location.href.indexOf(poppinres.url.poppincheckout) != -1) {
			document.forms['loginform'].elements['emaillog'].value = getLoginCookie('poppinemail');
			document.forms['loginform'].elements['password'].value = getLoginCookie('poppinpassword');
		}
	}
});
/*
 * PP_SOCIAL_MEDIA_LOGIN_HEAD
 */
var MINILOGINSOCKET;
jQuery(document).ready(function() {
	var miniloginqs = GPR_OPTIONS.options().loginURL;
	miniloginqs = miniloginqs.substring(miniloginqs.indexOf('?'), miniloginqs.length);
	if (window.location.href.indexOf('checkout.sandbox.netsuite.com') < 0) {
		MINILOGINSOCKET = new easyXDM.Socket({
			remote : poppinres.url.miniloginpage + miniloginqs,
			onMessage : function(message, origin) {
//				document.body.style.cursor = 'default';
jQuery('div#waitmask').hide();
				if (message == null) {
					jQuery("#dialogresponse").html(poppinres.text.responseobjectnull);
					jQuery("#dialogresponse").dialog({
						title : "Info"
					});
				}
				var responseObject = JSON.parse(message);
				console.log(responseObject);
				if (responseObject.responsetype == null) {
					jQuery("#dialogresponse").html(poppinres.text.responsetypenull);
					jQuery("#dialogresponse").dialog({
						title : "Info"
					});
					return;
				}
				switch (responseObject.responsetype) {
				case 'success':
					jQuery("#dialogresponse").html(responseObject.message);
					jQuery("#dialogresponse").dialog({
						title : "Info"
					});
					break;
				case 'linksocial':
					window.location = poppinres.url.loginpage + "?linksocial=T&" + jQuery.param(responseObject.message);
					break;
				case 'redirect':
					var loginUser = {
						"remember" : document.forms['miniloginform'].elements['remember'].checked,
						"email" : document.forms['miniloginform'].elements['email'].value,
						"password" : document.forms['miniloginform'].elements['password'].value
					};
					if (document.forms['miniloginform'].elements['remember'].checked) {
						storeLoginCookie(loginUser);
					} else {
						resetLoginCookie();
					}
					if (responseObject.socializenotify != undefined) {
						var notifyobject = responseObject.socializenotify;
						if (notifyobject.type == 'login') {
							gigya.socialize.notifyLogin(notifyobject.params);
						} else if (notifyobject.type == 'register') {
							gigya.socialize.notifyRegistration(notifyobject.params);
						}
					}
					window.location = responseObject.message;
					break;
				case 'error':
					var errormessage = responseObject.message;
					errormessage = errormessage.substring(errormessage.lastIndexOf(":") + 1, errormessage.length);
					
					if(errormessage.indexOf('password')!=-1){
						powerTip.create('minipassword', errormessage, 'powerTipminipassword', -52, -40);
						$('#minipassword').on('focusin', function() { powerTip.hide('powerTipminipassword'); });
						$('#minipassword').attr('class', 'input-red');
					} else if(errormessage.indexOf("haven't registered yet")!=-1) {
						powerTip.create('miniemail', errormessage, 'powerTipminiemail', -52, -70);
						$('#miniemail').on('focusin', function() { powerTip.hide('powerTipminiemail'); });
						$('#miniemail').attr('class', 'input-red');
					}else {
						jQuery("#dialogresponse").html(errormessage);
						jQuery("#dialogresponse").dialog({ title : "Info" });
					}
					return false;
					break;
				default:
					jQuery("#dialogresponse").html(poppinres.text.responsetypeunknown);
					jQuery("#dialogresponse").dialog({
						title : "Info"
					});
					return false;
				}
			}
		});
	}
});
function miniForgotPassword() {
	var user = {
		"requesttype" : "forgotpassword",
		"email" : document.forms['miniloginform'].elements['email'].value,
		"password" : document.forms['miniloginform'].elements['password'].value
	};
	$('#miniemail').removeClass('input-red');
	if (user.email === '') {
		powerTip.create('miniemail', poppinres.text.emailempty, 'powerTipminiemail', -69, 20);
		$('#miniemail').on('focusin', function() { powerTip.hide('powerTipminiemail'); });
		$('#miniemail').attr('class', 'input-red');
		return false;
	}
	if (!validateEmail(user.email)) {
		powerTip.create('miniemail', poppinres.text.emailinvalid, 'powerTipminiemail', -69, 20);
		$('#miniemail').on('focusin', function() { powerTip.hide('powerTipminiemail'); });
		$('#miniemail').attr('class', 'input-red');
		return false;
	}
	var userstr = JSON.stringify(user);
	MINILOGINSOCKET.postMessage(userstr);
}
function forgotPasswordOld() {
	var formHtml = '<div class="new-customer"><form id="forgot-pass-form" action="sendForgotPasswordRequest()">'
		+ '<fieldset style="border: 0px none;">' 
		+ '<label for="email">Email Address*</label>' 
			+ '<input id="email" name="email" type="text" style="font-size:16px;font-family:Arial,Helvetica,sans-serif">' 
		+ '</fieldset>' 
		+ '<fieldset style="border: 0px none;">' 
			+ '<input type="submit" value="Continue" class="orangeBtn" name="submit" id="submit" ' 
			+ 'style="margin: 0px;font-size:10pt;font-family:OmnesMediumRegular,sans-serif">' 
		+ '</fieldset>'
		+ '<fieldset style="border: 0px none;"><p class="message"></p></fieldset>'
		+ '</form></div>';

	jQuery("#dialogresponse").html(formHtml);
	jQuery("#dialogresponse").dialog({
		title : poppinres.text.passwordresettitle
	});

	$('#forgot-pass-form').on('submit', function(e) {
		e.preventDefault();
		if ($("form#forgot-pass-form > fieldset > input#submit.orangeBtn").val() == 'Continue') {
			sendForgotPasswordRequestOld();
		} else {
			jQuery("#dialogresponse").dialog('close');
		}
	});
}
function resetPasswordOld(){
	var formHtml = '<div class="new-customer"><form id="reset-pass-form" action="sendResetPasswordRequest()">'
		+ '<fieldset style="border: 0px none;">' 
		+ '<label for="resetpass">New Password*</label>' 
			+ '<input id="resetpass" name="resetpass" type="password" style="font-size:16px;font-family:Arial,Helvetica,sans-serif">' 
		+ '</fieldset>' 
		+ '<fieldset style="border: 0px none;">' 
			+ '<input type="submit" value="Continue" class="orangeBtn" name="submit" id="submit" ' 
			+ 'style="margin: 0px;font-size:10pt;font-family:OmnesMediumRegular,sans-serif">' 
		+ '</fieldset>'
		+ '<fieldset style="border: 0px none;"><p class="message"></p></fieldset>'
		+ '</form></div>';

	jQuery("#dialogresponse").html(formHtml);
	jQuery("#dialogresponse").dialog({
		title : poppinres.text.passwordresettitle
	});

	$('#reset-pass-form').on('submit', function(e) {
		e.preventDefault();
		if ($("form#reset-pass-form > fieldset > input#submit.orangeBtn").val() == 'Continue') {
			sendResetPasswordRequestOld();
		} else {
			jQuery("#dialogresponse").dialog('close');
		}
	});
}
function sendResetPasswordRequestOld() {
	var loginserviceurl = poppinres.url.loginservice;
	if (location.protocol == 'http:') {
		loginserviceurl = poppinres.url.loginservice1;
	}
	var userresetpassword = {
		"requesttype" : "resetpassword",
		"password" : document.forms['reset-pass-form'].elements['resetpass'].value,
		"e":getQuerystring('e'),
		"dt":getQuerystring('dt'),
		"cb":getQuerystring('cb')
	};
	jQuery.ajax({
		url : loginserviceurl,
		data : userresetpassword,
		dataType : 'jsonp',
		jsonp : 'json.wrf',
		success : resetPasswordResponseOld,
		error : resetPasswordResponseOld
	});
//	document.body.style.cursor = 'wait';
jQuery('div#waitmask').show();
}
function resetPasswordResponseOld(data) {
	var message = '';
//	document.body.style.cursor = 'default';
jQuery('div#waitmask').hide();
	if (data.responseText == null) {
		message = poppinres.text.responseobjectnull;
	}
	var responseObject = JSON.parse(data.responseText);
	switch (responseObject.responsetype) {
	case null:
		message = poppinres.text.responsetypenull;
		break;
	case 'success':
		message = poppinres.text.resetpasswordsuccess;
		break;
	case 'error':
		message = data.responseText;
		break;
	default:
		message = poppinres.text.responsetypeunknown;
	}
	$("form#reset-pass-form > fieldset > input#submit.orangeBtn").val("Close");
	$("form#reset-pass-form > fieldset > p.message").html(message);
}
function sendForgotPasswordRequestOld() {
	var loginserviceurl = poppinres.url.loginservice;
	if (location.protocol == 'http:') {
		loginserviceurl = poppinres.url.loginservice1;
	}

	var userforgotpassword = {
		"requesttype" : "forgotpassword",
		"email" : document.forms['forgot-pass-form'].elements['email'].value
	};
	jQuery.ajax({
		url : loginserviceurl,
		data : userforgotpassword,
		dataType : 'jsonp',
		jsonp : 'json.wrf',
		success : forgotPasswordResponseOld,
		error : forgotPasswordResponseOld
	});
//	document.body.style.cursor = 'wait';
jQuery('div#waitmask').show();
}
function forgotPasswordResponseOld(data) {
	var message = '';
//	document.body.style.cursor = 'default';
jQuery('div#waitmask').hide();
	if (data.responseText == null) {
		message = poppinres.text.responseobjectnull;
	}
	var responseObject = JSON.parse(data.responseText);
	switch (responseObject.responsetype) {
	case null:
		message = poppinres.text.responsetypenull;
		break;
	case 'success':
		message = poppinres.text.forgotpasswordsent;
		break;
	case 'error':
		message = poppinres.text.forgotpasswordunrecognized;
		break;
	default:
		message = poppinres.text.responsetypeunknown;
	}
	$("form#forgot-pass-form > fieldset > input#submit.orangeBtn").val("Close");
	$("form#forgot-pass-form > fieldset > p.message").html(message);
}
/*
 * PP_SOCIAL_MEDIA_LOGIN_SUBMIT
 */
jQuery(document).ready(function(){
	jQuery('#minicompanyhelp').on('mouseenter', function(){
		powerTip.create('minicompany', jQuery('#miniwhatthisfortext').html(), 'powerTipCompany', 286, 481);
	});
	jQuery('#minicompanyhelp').on('mouseleave',function(){powerTip.hide('powerTipCompany');});
	//jQuery('input[name="leadsource"]').val(getLeadSource());
});
jQuery(function() {
	jQuery('#miniloginform').on('submit', function(e) {
		e.preventDefault();
		miniloginSubmit();
	});
	jQuery('#mini-new-customer-register').on('submit', function(e) {
		e.preventDefault();
		registerformSubmitUser();
	});
	jQuery('#minitwitter-email').on('submit', function(e) {
		e.preventDefault();
		minitwitterSubmit();
	});
});
function miniloginSubmit(loginUser)
{
	var loginUser = {
			"requesttype" : "login",
			"remember" : document.forms['miniloginform'].elements['remember'].checked,
			"email" : document.forms['miniloginform'].elements['email'].value,
			"password" : document.forms['miniloginform'].elements['password'].value,
			"checkout" : false
		};
	$('#minipassword, #miniemail').removeClass('input-red');
	powerTip.hide('powerTipminiemail');
	powerTip.hide('powerTipminipassword');
	
	if (loginUser.email === '') {
		powerTip.create('miniemail', poppinres.text.emailempty, 'powerTipminiemail', -37, 121);
		$('#miniemail').on('focusin', function() { powerTip.hide('powerTipminiemail'); });
		$('#miniemail').attr('class', 'input-red');
	}
	if (!validateEmail(loginUser.email)) {
		powerTip.create('miniemail', poppinres.text.emailinvalid, 'powerTipminiemail', -37, 121);
		$('#miniemail').on('focusin', function() { powerTip.hide('powerTipminiemail'); });
		$('#miniemail').attr('class', 'input-red');
	}
	if (loginUser.password === '') {
		powerTip.create('minipassword', poppinres.text.passwordempty, 'powerTipminipassword', -37, 100);
		$('#minipassword').on('focusin', function() { powerTip.hide('powerTipminipassword'); });
		$('#minipassword').attr('class', 'input-red');
	}
	if($("#miniloginform .input-red").size() > 0) {
		return false;
	}
	var userstr = JSON.stringify(loginUser);
	MINILOGINSOCKET.postMessage(userstr);
//	document.body.style.cursor = 'wait';
jQuery('div#waitmask').show();
}
//Register functionality
function registerformSubmitUser()
{
	if(!validateRegisterForm()){return false;};
	
	var company = '';
	//if($('form#new-customer-register > fieldset > input#business').is(':checked')) {
		company = document.forms['mini-new-customer-register'].elements['minicompany'].value;
	//}
	var emailsubscribe = 'F';
	if($('form#mini-new-customer-register > fieldset > input#minisubscribe').is(':checked')) {
		emailsubscribe = 'T';
	}
	
	var newUser = {
			"requesttype":"manualregister",
			"lead":document.forms['mini-new-customer-register'].elements['minileadsource'].value,
			"remember":true,
			"email":document.forms['mini-new-customer-register'].elements['miniemailregnew'].value,
			"name":document.forms['mini-new-customer-register'].elements['minifname'].value + " " +document.forms['mini-new-customer-register'].elements['minilname'].value,
			"password":document.forms['mini-new-customer-register'].elements['minipasswordnew'].value,
			"password2":document.forms['mini-new-customer-register'].elements['minipasswordnew'].value,
			"company":company,
			"emailsubscribe":emailsubscribe,
			"checkout":false
			};
	var userstr = JSON.stringify(newUser);
	MINILOGINSOCKET.postMessage(userstr);
//	document.body.style.cursor = 'wait';
jQuery('div#waitmask').show();
}
function validateRegisterForm()
{
	var regEmail	= /^([0-9a-zA-Z_\.-]+)@([\da-zA-Z\.-]+)\.([a-zA-Z\.]{2,6})$/;
	var regText		= /^[0-9a-zA-Z- ]{2,}$/;
	var regPass		= /^[0-9a-zA-Z]{6,}$/;
	
	var email		= $('form#mini-new-customer-register > fieldset > div > input#miniemailregnew').first();
	var fname		= $('form#mini-new-customer-register > fieldset > div > input#minifname').first();
	var lname		= $('form#mini-new-customer-register > fieldset > div > input#minilname').first();
	var pass		= $('form#mini-new-customer-register > fieldset > div > input#minipasswordnew').first();
	
	//remove unnecessary spaces before and after name values 
	$('form#mini-new-customer-register > fieldset > div > input#minifname').val($('form#mini-new-customer-register > fieldset > div > input#minifname').val().trim());
	$('form#mini-new-customer-register > fieldset > div > input#minilname').val($('form#mini-new-customer-register > fieldset > div > input#minilname').val().trim());
	
	$("#mini-new-customer-register .input-red").removeClass("input-red");
	
	if(!regEmail.test(email.val()))
	{
		powerTip.create('miniemailregnew', poppinres.text.emailvalidation, 'powerTipEmail', -52, 124);
		$('#miniemailregnew').on('focusin', function() { powerTip.hide('powerTipEmail'); }) ;
		email.attr( "class", "input-red");
	}
	if(!regText.test(fname.val()))
	{
		powerTip.create('minifname', poppinres.text.firstnamevalidation, 'powerTipFName', -52, 128);
		$('#minifname').on('focusin', function() { powerTip.hide('powerTipFName'); }) ;
		fname.attr( "class", "input-red");
	}
	if(!regText.test(lname.val()))
	{
		powerTip.create('minilname', poppinres.text.lastnamevalidation, 'powerTipLName', -52, 97);
		$('#minilname').on('focusin', function() { powerTip.hide('powerTipLName'); }) ;
		lname.attr( "class", "input-red");
	}
	if(!regPass.test(pass.val()))
	{
		powerTip.create('minipasswordnew', poppinres.text.passwordvalidation, 'powerTipPass', -65, 75);
		$('#minipasswordnew').on('focusin', function() { powerTip.hide('powerTipPass'); }) ;
		pass.attr( "class", "input-red");
	}
	
	if($("form#mini-new-customer-register input.input-red").size() > 0) {
		return false;
	} else {
		return true;
	}
	
}
//----------------------
//function miniregisterSubmit(loginUser)
//{
//	var regEmail	= /^([0-9a-zA-Z_\\.-]+)@([\\da-zA-Z\\.-]+)\\.([a-zA-Z\\.]{2,6})$/;
//	var regText		= /^[0-9a-zA-Z- ]{2,}$/;
//	var regPass		= /^[0-9a-zA-Z]{6,}$/;
//	
//	var email		= $('form#mini-new-customer-register > fieldset > div > input#emailregnew').first();
//	var fname		= $('form#mini-new-customer-register > fieldset > div > input#fname').first();
//	var lname		= $('form#mini-new-customer-register > fieldset > div > input#lname').first();
//	var pass		= $('form#mini-new-customer-register > fieldset > div > input#passwordnew').first();
//	
//	//remove unnecessary spaces before and after name values 
//	$('form#mini-new-customer-register > fieldset > div > input#fname').val($('form#mini-new-customer-register > fieldset > div > input#fname').val().trim());
//	$('form#mini-new-customer-register > fieldset > div > input#lname').val($('form#mini-new-customer-register > fieldset > div > input#lname').val().trim());
//	
//	$("#mini-new-customer-register .input-red").removeClass("input-red");
//	
//	if(!regEmail.test(email.val()))
//	{
//		powerTip.create('emailregnew', poppinres.text.emailvalidation, 'powerTipEmail', -52, 123);
//		$('#emailregnew').on('focusin', function() { powerTip.hide('powerTipEmail'); }) ;
//		email.attr( "class", "input-red");
//	}
//	if(!regText.test(fname.val()))
//	{
//		powerTip.create('fname', poppinres.text.firstnamevalidation, 'powerTipFName', -52, 123);
//		$('#fname').on('focusin', function() { powerTip.hide('powerTipFName'); }) ;
//		fname.attr( "class", "input-red");
//	}
//	if(!regText.test(lname.val()))
//	{
//		powerTip.create('lname', poppinres.text.lastnamevalidation, 'powerTipLName', -52, 123);
//		$('#lname').on('focusin', function() { powerTip.hide('powerTipLName'); }) ;
//		lname.attr( "class", "input-red");
//	}
//	if(!regPass.test(pass.val()))
//	{
//		powerTip.create('passwordnew', poppinres.text.passwordvalidation, 'powerTipPass', -65, 123);
//		$('#passwordnew').on('focusin', function() { powerTip.hide('powerTipPass'); }) ;
//		pass.attr( "class", "input-red");
//	}
//	
//	if($("form#mini-new-customer-register input.input-red").size() > 0) {
//		return false;
//	} else {
//		return true;
//	}
//	var userstr = JSON.stringify(loginUser);
//	MINILOGINSOCKET.postMessage(userstr);
////	document.body.style.cursor = 'wait';
//jQuery('div#waitmask').show();
//}

/*
 * PP_SOCIAL_MEDIA_LOGIN_GIGYA
 */
jQuery(function() {

	var login_params = {
		showTermsLink : 'false',
		height : 100,
		width : 170,
		containerID : 'componentDiv',
		buttonsStyle : 'standard',
		autoDetectUserProviders : '',
		facepilePosition : 'none',
		callback : 'onLogin(response)',
		hideGigyaLink : true
	};
	gigya.socialize.addEventHandlers({
		onLogin : onLoginHandler
	});
	function onLoginHandler(eventObj) {
		var deserialized = eventObj;
		if (deserialized.provider === 'twitter') {
			document.forms['minitwitter-email'].elements['customername'].value = deserialized['user'].firstName + ' ' + deserialized['user'].lastName;
			document.forms['minitwitter-email'].elements['timestamp'].value = deserialized.signatureTimestamp;
			document.forms['minitwitter-email'].elements['UID'].value = deserialized.UID;
			document.forms['minitwitter-email'].elements['signature'].value = deserialized.UIDSignature;
			jQuery("#minitwitter-email").dialog({
				title : "Twitter email",
				minWidth : 530
			});
		} else {
			var socialloginobject = {
				"requesttype" : "sociallogin",
				"user" : eventObj
			};
			var userstr = JSON.stringify(socialloginobject);
			MINILOGINSOCKET.postMessage(userstr);
			//document.body.style.cursor = 'wait';
jQuery('div#waitmask').show();
		}
	}
	gigya.socialize.showLoginUI(login_params);
	if (jQuery('.logout').length > -1) {
		jQuery('.logout').click(function() {
			gigya.socialize.logout();
			return true;
		});
	}
});
