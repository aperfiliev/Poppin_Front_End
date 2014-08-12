/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       02 Jul 2014     ashykalov
 *
 */
(function ($, window) {
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

/* get Lead Source functions */
function getCommentsFromEl(el, asArray) {
	var result,
	$el = $(el).contents();
	result = $el.filter(function () {
			return this.nodeType == 8;
		});
	if (asArray) {
		result = $.makeArray(result.map(function () {
			return this.nodeValue;
		}));
	}
	return result;
};
$.fn.getComments = function (asArray) {
	return getCommentsFromEl(this, asArray);
};
function getLeadSource() {
	
	var comments = $("head").getComments(),
		i = comments.length,
		g = '', comment, ls = {};
	
	while(i !== 0) {
		i--;
		comment = comments[i].data;
		if(comment.search("leadsource") !== -1) {
			g = comment;
			break;
		}
	}
	
	var f = g.indexOf("leadsource=")+11;
	var s = g.substring(f, g.indexOf("=", f)).lastIndexOf(" ");
	var result = g.substring(f, f+s).trim();
	
	if(g != '') {
		return result;
	} else {
		return '';
	}
};

/* end of get Lead Source functions */

jQuery(document).ready(function(){
	jQuery('#companyhelp').on('mouseenter', function(){
		powerTip.create('company', jQuery('#whatthisfortext').html(), 'powerTipCompany', -15, 176);
	});
	jQuery('#companyhelp').on('mouseleave',function(){powerTip.hide('powerTipCompany');});
	jQuery('#leadsource').val(getLeadSource());
});

var checkout = false;
if(window.location.href.indexOf('checkout=T')>-1)
	{
		checkout = true;
	}
$(function(){
	if(getQuerystring('linksocial')=='T'){
		//store link social data in form
		document.forms['link-social'].elements['emaillink'].value = decodeURIComponent(getQuerystring('email'));
		document.forms['link-social'].elements['timestamp'].value = decodeURIComponent(getQuerystring('timestamp'));
		document.forms['link-social'].elements['signature'].value = decodeURIComponent(getQuerystring('signature'));
		switchview('linksocial');
	}
})

$(function() { 
	$('#loginform').on('submit', function(e) { 
		e.preventDefault();  
		loginformSubmitUser();
	});
	$('#twitter-email').on('submit', function(e) { 
		e.preventDefault();  
		loginTwitter();
	});  
	$('#link-social').on('submit', function(e) { 
		e.preventDefault();  
		linkSocialAccount();
	});
	$('#new-customer-register').on('submit', function(e) { 
		e.preventDefault();  
		registerPageFormSubmitUser();
	});
	
	$('form#new-customer-register > fieldset > input#business').on('click', function(e) {
		var display = $(this).is(':checked') ? 'block' : 'none';
		$('form#new-customer-register > fieldset#fs_company').css('display', display);
	});
});
function switchview(viewtype)
{
	switch(viewtype){
	case 'login':
		$('.login-case-block').css('display', 'block');
		$('#twitter-email').css('display', 'none');
		$('#link-social').css('display', 'none');
		break
	case 'register':
		$('.login-case-block').css('display', 'none');
		$('#twitter-email').css('display', 'none');
		$('#link-social').css('display', 'none');
		break
	case 'twitteremail':
		$('.login-case-block').css('display', 'none');
		$('#twitter-email').css('display', 'block');
		$('#link-social').css('display', 'none');
		break
	case 'linksocial':
		$('.login-case-block').css('display', 'none');
		$('#twitter-email').css('display', 'none');
		$('#link-social').css('display', 'block');
		break
		
	default:
		jQuery("#dialogresponse").html('Unknown view type');
		jQuery("#dialogresponse").dialog({ title: "Info" });
	}
}

//var socket = new easyXDM.Socket({
//	remote: poppinres.url.gigyacontrol,
//	container: "iframecontainer",
//	onMessage:function(message, origin) {
//		var deserialized = JSON.parse(message);
//		if(deserialized.provider==='twitter') {
//				document.forms['twitter-email'].elements['customername'].value = deserialized['user'].firstName +' ' +deserialized['user'].lastName;
//				document.forms['twitter-email'].elements['timestamp'].value = deserialized.signatureTimestamp;
//				document.forms['twitter-email'].elements['UID'].value = deserialized.UID;
//				document.forms['twitter-email'].elements['signature'].value = deserialized.UIDSignature;
//				switchview('twitteremail');
//			}
//		else {
//				socialLogin(deserialized);
//			}
//	}
//});
function socialLogin(deserialized)
{
	var newUser = {
			"requesttype":"sociallogin",
			"remember":true,
			"email":deserialized['user'].email,
			"name":deserialized['user'].firstName +' ' +deserialized['user'].lastName,
			"password":'',
			"password2":'',
			"checkout":checkout,
			"timestamp":deserialized.signatureTimestamp,
			"UID":deserialized.UID,
			"signature":deserialized.UIDSignature
			};
	sendLoginRequest(newUser);
}
function loginformSubmitUser()
{
	var loginUser = {
			"requesttype":"login",
			"remember":document.forms['loginform'].elements['remember'].checked,
			"email":document.forms['loginform'].elements['emaillog'].value,
			"password":document.forms['loginform'].elements['password'].value,
			"checkout":checkout
			};
	sendLoginRequest(loginUser);
}
function registerPageFormSubmitUser()
{
	if(!validatePageRegisterForm()){return false;};
	
	var company = '';
	//if($('form#new-customer-register > fieldset > input#business').is(':checked')) {
		company = document.forms['new-customer-register'].elements['company'].value;
	//}
	var emailsubscribe = 'F';
	if($('form#new-customer-register > fieldset > input#subscribe').is(':checked')) {
		emailsubscribe = 'T';
	}
	
	var newUser = {
			"requesttype":"manualregister",
			"lead":document.forms['new-customer-register'].elements['leadsource'].value,
			"remember":true,
			"email":document.forms['new-customer-register'].elements['emailregnew'].value,
			"name":document.forms['new-customer-register'].elements['fname'].value + " " +document.forms['new-customer-register'].elements['lname'].value,
			"password":document.forms['new-customer-register'].elements['passwordnew'].value,
			"password2":document.forms['new-customer-register'].elements['passwordnew'].value,
			"company":company,
			"emailsubscribe":emailsubscribe,
			"checkout":checkout
			};
	sendLoginRequest(newUser);
}
function validatePageRegisterForm()
{
	var regEmail	=  /^([0-9a-zA-Z_\.-]+)@([\da-zA-Z\.-]+)\.([a-zA-Z\.]{2,6})$/;
	var regText		= /^[0-9a-zA-Z- ]{2,}$/;
	var regPass		= /^[0-9a-zA-Z]{6,}$/;
	
	var email		= $('form#new-customer-register > fieldset > div > input#emailregnew').first();
	var fname		= $('form#new-customer-register > fieldset > div > input#fname').first();
	var lname		= $('form#new-customer-register > fieldset > div > input#lname').first();
	var pass		= $('form#new-customer-register > fieldset > div > input#passwordnew').first();

	//remove unnecessary spaces before and after name values 
	$('form#new-customer-register > fieldset > div > input#fname').val($('form#new-customer-register > fieldset > div > input#fname').val().trim());
	$('form#new-customer-register > fieldset > div > input#lname').val($('form#new-customer-register > fieldset > div > input#lname').val().trim());

	$("#new-customer-register .input-red").removeClass("input-red");
	
	if(!regEmail.test(email.val()))
	{
		powerTip.create('emailregnew', poppinres.text.emailvalidation, 'powerTipEmail', -52, 123);
		$('#emailregnew').on('focusin', function() { powerTip.hide('powerTipEmail'); }) ;
		email.attr( "class", "input-red");
	}
	if(!regText.test(fname.val()))
	{
		powerTip.create('fname', poppinres.text.firstnamevalidation, 'powerTipFName', -52, 123);
		$('#fname').on('focusin', function() { powerTip.hide('powerTipFName'); }) ;
		fname.attr( "class", "input-red");
	}
	if(!regText.test(lname.val()))
	{
		powerTip.create('lname', poppinres.text.lastnamevalidation, 'powerTipLName', -52, 123);
		$('#lname').on('focusin', function() { powerTip.hide('powerTipLName'); }) ;
		lname.attr( "class", "input-red");
	}
	if(!regPass.test(pass.val()))
	{
		powerTip.create('passwordnew', poppinres.text.passwordvalidation, 'powerTipPass', -65, 123);
		$('#passwordnew').on('focusin', function() { powerTip.hide('powerTipPass'); }) ;
		pass.attr( "class", "input-red");
	}
	
	if($("form#new-customer-register input.input-red").size() > 0) {
		return false;
	} else {
		return true;
	}
}
function loginTwitter()
{
	if(!checkemailvalue(document.forms['twitter-email'].elements['emailtwitter'].value)){return false;};
	var newUser = {
			"requesttype":"sociallogin",
			"remember":true,
			"email":document.forms['twitter-email'].elements['emailtwitter'].value,
			"name":document.forms['twitter-email'].elements['customername'].value,
			"password":'',
			"password2":'',
			"checkout":checkout,
			"timestamp":document.forms['twitter-email'].elements['timestamp'].value,
			"UID":document.forms['twitter-email'].elements['UID'].value,
			"signature":document.forms['twitter-email'].elements['signature'].value
	}
	sendLoginRequest(newUser);
}
function linkSocialAccount()
{
	var newUser = {
			"requesttype":"sociallink",
			"remember":true,
			"email":document.forms['link-social'].elements['emaillink'].value,
			"password":document.forms['link-social'].elements['pwdlink'].value,
			"checkout":checkout,
			"timestamp":document.forms['link-social'].elements['timestamp'].value,
			"UID":document.forms['link-social'].elements['UID'].value,
			"signature":document.forms['link-social'].elements['signature'].value
	}
	sendLoginRequest(newUser);
}
function sendLoginRequest(user)
{
	$("#loginform .input-red").removeClass("input-red");
	powerTip.hide('powerTipEmaillog');
	powerTip.hide('powerTipPassword');
	
	if(typeof user.email ==='undefined' || user.email === '') {
		powerTip.create('emaillog', poppinres.text.emailempty, 'powerTipEmaillog', -37, 123);
		$('#emaillog').on('focusin', function() { powerTip.hide('powerTipEmaillog'); }) ;
		$('#emaillog').attr( "class", "input-red");
	}
	if( !validateEmail(user.email)) {
		powerTip.create('emaillog', poppinres.text.emailinvalid, 'powerTipEmaillog', -37, 123);
		$('#emaillog').on('focusin', function() { powerTip.hide('powerTipEmaillog'); }) ;
		$('#emaillog').attr( "class", "input-red");
	}
	if(user.requesttype ==='login' && user.password === '') {
		powerTip.create('password', poppinres.text.passwordempty, 'powerTipPassword', -37, 123);
		$('#password').on('focusin', function() { powerTip.hide('powerTipPassword'); }) ;
		$('#password').attr( "class", "input-red");
	}
	if($("#loginform .input-red").size() > 0) {
	return false;
	}
	if(user.remember){storeLoginCookie(user);}
	jQuery.ajax({
			url: poppinres.url.loginservice,
			data: user,
			dataType: 'jsonp',
			jsonp: 'json.wrf',
			success: response,
			error: response
		});
	
		//document.body.style.cursor = 'wait';
	jQuery('div#waitmask').show();
}

function response(data)
{
	//document.body.style.cursor = 'default';
	jQuery('div#waitmask').hide();
	var responseObject = JSON.parse(data.responseText);

	if(responseObject.responsetype==null){
		jQuery("#dialogresponse").html(poppinres.text.responsetypenull);
		jQuery("#dialogresponse").dialog({ title: "Info" });
		return;
	};
	switch(responseObject.responsetype)
	{
		case 'success':
			jQuery("#dialogresponse").html(responseObject.message);
			jQuery("#dialogresponse").dialog({ title: "Info" });
		break
		case 'linksocial':
			document.forms['link-social'].elements['emaillink'].value = responseObject.message.email;
			document.forms['link-social'].elements['timestamp'].value = responseObject.message.timestamp;
			document.forms['link-social'].elements['signature'].value = responseObject.message.signature;
			switchview('linksocial');
		break
		case 'redirect':
			if(responseObject.socializenotify!=undefined){
				var notifyString = JSON.stringify(responseObject.socializenotify);
				socket.postMessage(notifyString);
				}
			if(responseObject.message == 'redirect'){
			var tracker = _gaq._getAsyncTracker();
			var redir_elem = tracker._getLinkerUrl( poppinres.url.checkoutbase );
			console.log(redir_elem);
			window.location = redir_elem;	
			}	
			else{
			window.location = responseObject.message;
			}
			break
		case 'error':
			var errormessage = responseObject.message;
			errormessage = errormessage.substring(errormessage.lastIndexOf(":")+1,errormessage.length);

			if(errormessage.indexOf('password')!=-1){
				powerTip.create('password', errormessage, 'powerTipPassword', -51, 123);
				$('#password').on('focusin', function() { powerTip.hide('powerTipPassword'); }) ;
				$('#password').attr( "class", "input-red");
			} else if (errormessage.indexOf("haven't registered yet")!=-1) {
				powerTip.create('emaillog', errormessage, 'powerTipEmaillog', -51, 123);
				$('#emaillog').on('focusin', function() { powerTip.hide('powerTipEmaillog'); }) ;
				$('#emaillog').attr( "class", "input-red");
			} else if (errormessage.indexOf('user already exists')!=-1) {
				// registration form 
				powerTip.create('emailregnew', errormessage, 'powerTipEmail', -52, 123);
				$('#emailregnew').on('focusin', function() { powerTip.hide('powerTipEmail'); }) ;
				$('#emailregnew').attr( "class", "input-red");
			} else {
				// default errors message
				jQuery("#dialogresponse").html(errormessage);
				jQuery("#dialogresponse").dialog({ title: "Info" });
			}
			return false;
			break
		default:
			jQuery("#dialogresponse").html(poppinres.text.responsetypeunknown);
			jQuery("#dialogresponse").dialog({ title: "Info" });
			return false;	
		}
}
function forgotPasswordSocialLink()
{
	 var userforgotpassword = {
			 "requesttype":"forgotpassword",
			 "email":document.forms['link-social'].elements['emaillink'].value
			 }
	 sendLoginRequest(userforgotpassword);
}
})(jQuery, this);

// ERP Guru NetSuite Display Override. It was moved from Login.ssp
function egHtmlDecode(input){
	var e = document.createElement('div');
	e.innerHTML = input;
	return e.childNodes.length === 0 ? "" : e.childNodes[0].nodeValue;
}
$j(document).ready(function(){
//remove quick view
	//many
	$j("#handle_portlet_-521").closest("td").remove();

	//modify url of see return requests
	$j('a[href*="/app/accounting/transactions/rtnauth.nl?ck="]').attr("href","");

	//replace link string in saved search by actual link
	$j('td.listtexthl:contains("<a href=")').each(function(index,element){
		var linkObject = $j(this).html().replace(/&lt;/gi,"<").replace(/&gt;/gi,">");

		$j(this).html(egHtmlDecode(linkObject));
	});
});
// END ERP Guru NetSuite Display Override