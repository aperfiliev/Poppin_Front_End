(function(e,g){function p(r,t){if(t==null){t="";}r=r.replace(/[\[]/,"\\[").replace(/[\]]/,"\\]");var s=new RegExp("[\\?&]"+r+"=([^&#]*)");var q=s.exec(g.location.href);if(q==null){return t;}else{return q[1];}}function d(t,r){var q,s=e(t).contents();q=s.filter(function(){return this.nodeType==8;});if(r){q=e.makeArray(q.map(function(){return this.nodeValue;}));}return q;}e.fn.getComments=function(q){return d(this,q);};function i(){var x=e("head").getComments(),t=x.length,v="",y,r={};while(t!==0){t--;y=x[t].data;if(y.search("leadsource")!==-1){v=y;break;}}var w=v.indexOf("leadsource=")+11;var u=v.substring(w,v.indexOf("=",w)).lastIndexOf(" ");var q=v.substring(w,w+u).trim();if(v!=""){return q;}else{return"";}}jQuery(document).ready(function(){jQuery("#companyhelp").on("mouseenter",function(){powerTip.create("company",jQuery("#whatthisfortext").html(),"powerTipCompany",-15,176);});jQuery("#companyhelp").on("mouseleave",function(){powerTip.hide("powerTipCompany");});jQuery("#leadsource").val(i());});var f=false;if(g.location.href.indexOf("checkout=T")>-1){f=true;}e(function(){if(p("linksocial")=="T"){document.forms["link-social"].elements.emaillink.value=decodeURIComponent(p("email"));document.forms["link-social"].elements.timestamp.value=decodeURIComponent(p("timestamp"));document.forms["link-social"].elements.signature.value=decodeURIComponent(p("signature"));m("linksocial");}});e(function(){e("#loginform").on("submit",function(q){q.preventDefault();o();});e("#twitter-email").on("submit",function(q){q.preventDefault();c();});e("#link-social").on("submit",function(q){q.preventDefault();j();});e("#new-customer-register").on("submit",function(q){q.preventDefault();k();});e("form#new-customer-register > fieldset > input#business").on("click",function(r){var q=e(this).is(":checked")?"block":"none";e("form#new-customer-register > fieldset#fs_company").css("display",q);});});function m(q){switch(q){case"login":e(".login-case-block").css("display","block");e("#twitter-email").css("display","none");e("#link-social").css("display","none");break;case"register":e(".login-case-block").css("display","none");e("#twitter-email").css("display","none");e("#link-social").css("display","none");break;case"twitteremail":e(".login-case-block").css("display","none");e("#twitter-email").css("display","block");e("#link-social").css("display","none");break;case"linksocial":e(".login-case-block").css("display","none");e("#twitter-email").css("display","none");e("#link-social").css("display","block");break;default:jQuery("#dialogresponse").html("Unknown view type");jQuery("#dialogresponse").dialog({title:"Info"});}}function n(r){var q={requesttype:"sociallogin",remember:true,email:r.user.email,name:r.user.firstName+" "+r.user.lastName,password:"",password2:"",checkout:f,timestamp:r.signatureTimestamp,UID:r.UID,signature:r.UIDSignature};l(q);}function o(){var q={requesttype:"login",remember:document.forms.loginform.elements.remember.checked,email:document.forms.loginform.elements.emaillog.value,password:document.forms.loginform.elements.password.value,checkout:f};l(q);}function k(){if(!a()){return false;}var r="";r=document.forms["new-customer-register"].elements.company.value;var s="F";if(e("form#new-customer-register > fieldset > input#subscribe").is(":checked")){s="T";}var q={requesttype:"manualregister",lead:document.forms["new-customer-register"].elements.leadsource.value,remember:true,email:document.forms["new-customer-register"].elements.emailregnew.value,name:document.forms["new-customer-register"].elements.fname.value+" "+document.forms["new-customer-register"].elements.lname.value,password:document.forms["new-customer-register"].elements.passwordnew.value,password2:document.forms["new-customer-register"].elements.passwordnew.value,company:r,emailsubscribe:s,checkout:f};l(q);}function a(){var u=/^([0-9a-zA-Z_\.-]+)@([\da-zA-Z\.-]+)\.([a-zA-Z\.]{2,6})$/;var q=/^[0-9a-zA-Z- ]{2,}$/;var v=/^[0-9a-zA-Z]{6,}$/;var s=e("form#new-customer-register > fieldset > div > input#emailregnew").first();var w=e("form#new-customer-register > fieldset > div > input#fname").first();var r=e("form#new-customer-register > fieldset > div > input#lname").first();var t=e("form#new-customer-register > fieldset > div > input#passwordnew").first();e("form#new-customer-register > fieldset > div > input#fname").val(e("form#new-customer-register > fieldset > div > input#fname").val().trim());e("form#new-customer-register > fieldset > div > input#lname").val(e("form#new-customer-register > fieldset > div > input#lname").val().trim());e("#new-customer-register .input-red").removeClass("input-red");if(!u.test(s.val())){powerTip.create("emailregnew",poppinres.text.emailvalidation,"powerTipEmail",-52,123);e("#emailregnew").on("focusin",function(){powerTip.hide("powerTipEmail");});s.attr("class","input-red");}if(!q.test(w.val())){powerTip.create("fname",poppinres.text.firstnamevalidation,"powerTipFName",-52,123);e("#fname").on("focusin",function(){powerTip.hide("powerTipFName");});w.attr("class","input-red");}if(!q.test(r.val())){powerTip.create("lname",poppinres.text.lastnamevalidation,"powerTipLName",-52,123);e("#lname").on("focusin",function(){powerTip.hide("powerTipLName");});r.attr("class","input-red");}if(!v.test(t.val())){powerTip.create("passwordnew",poppinres.text.passwordvalidation,"powerTipPass",-65,123);e("#passwordnew").on("focusin",function(){powerTip.hide("powerTipPass");});t.attr("class","input-red");}if(e("form#new-customer-register input.input-red").size()>0){return false;}else{return true;}}function c(){if(!checkemailvalue(document.forms["twitter-email"].elements.emailtwitter.value)){return false;}var q={requesttype:"sociallogin",remember:true,email:document.forms["twitter-email"].elements.emailtwitter.value,name:document.forms["twitter-email"].elements.customername.value,password:"",password2:"",checkout:f,timestamp:document.forms["twitter-email"].elements.timestamp.value,UID:document.forms["twitter-email"].elements.UID.value,signature:document.forms["twitter-email"].elements.signature.value};l(q);}function j(){var q={requesttype:"sociallink",remember:true,email:document.forms["link-social"].elements.emaillink.value,password:document.forms["link-social"].elements.pwdlink.value,checkout:f,timestamp:document.forms["link-social"].elements.timestamp.value,UID:document.forms["link-social"].elements.UID.value,signature:document.forms["link-social"].elements.signature.value};l(q);}function l(q){e("#loginform .input-red").removeClass("input-red");powerTip.hide("powerTipEmaillog");powerTip.hide("powerTipPassword");if(typeof q.email==="undefined"||q.email===""){powerTip.create("emaillog",poppinres.text.emailempty,"powerTipEmaillog",-37,123);e("#emaillog").on("focusin",function(){powerTip.hide("powerTipEmaillog");});e("#emaillog").attr("class","input-red");}if(!validateEmail(q.email)){powerTip.create("emaillog",poppinres.text.emailinvalid,"powerTipEmaillog",-37,123);e("#emaillog").on("focusin",function(){powerTip.hide("powerTipEmaillog");});e("#emaillog").attr("class","input-red");}if(q.requesttype==="login"&&q.password===""){powerTip.create("password",poppinres.text.passwordempty,"powerTipPassword",-37,123);e("#password").on("focusin",function(){powerTip.hide("powerTipPassword");});e("#password").attr("class","input-red");}if(e("#loginform .input-red").size()>0){return false;}if(q.remember){storeLoginCookie(q);}jQuery.ajax({url:poppinres.url.loginservice,data:q,dataType:"jsonp",jsonp:"json.wrf",success:b,error:b});jQuery("div#waitmask").show();}function b(t){jQuery("div#waitmask").hide();var q=JSON.parse(t.responseText);if(q.responsetype==null){jQuery("#dialogresponse").html(poppinres.text.responsetypenull);jQuery("#dialogresponse").dialog({title:"Info"});return;}switch(q.responsetype){case"success":jQuery("#dialogresponse").html(q.message);jQuery("#dialogresponse").dialog({title:"Info"});break;case"linksocial":document.forms["link-social"].elements.emaillink.value=q.message.email;document.forms["link-social"].elements.timestamp.value=q.message.timestamp;document.forms["link-social"].elements.signature.value=q.message.signature;m("linksocial");break;case"redirect":if(q.socializenotify!=undefined){var s=JSON.stringify(q.socializenotify);socket.postMessage(s);}g.location=q.message;break;case"error":var r=q.message;r=r.substring(r.lastIndexOf(":")+1,r.length);if(r.indexOf("password")!=-1){powerTip.create("password",r,"powerTipPassword",-51,123);e("#password").on("focusin",function(){powerTip.hide("powerTipPassword");});e("#password").attr("class","input-red");}else{if(r.indexOf("haven't registered yet")!=-1){powerTip.create("emaillog",r,"powerTipEmaillog",-51,123);e("#emaillog").on("focusin",function(){powerTip.hide("powerTipEmaillog");});e("#emaillog").attr("class","input-red");}else{if(r.indexOf("user already exists")!=-1){powerTip.create("emailregnew",r,"powerTipEmail",-52,123);e("#emailregnew").on("focusin",function(){powerTip.hide("powerTipEmail");});e("#emailregnew").attr("class","input-red");}else{jQuery("#dialogresponse").html(r);jQuery("#dialogresponse").dialog({title:"Info"});}}}return false;break;default:jQuery("#dialogresponse").html(poppinres.text.responsetypeunknown);jQuery("#dialogresponse").dialog({title:"Info"});return false;}}function h(){var q={requesttype:"forgotpassword",email:document.forms["link-social"].elements.emaillink.value};l(q);}})(jQuery,this);function egHtmlDecode(a){var b=document.createElement("div");b.innerHTML=a;return b.childNodes.length===0?"":b.childNodes[0].nodeValue;}$j(document).ready(function(){$j("#handle_portlet_-521").closest("td").remove();$j('a[href*="/app/accounting/transactions/rtnauth.nl?ck="]').attr("href","");$j('td.listtexthl:contains("<a href=")').each(function(a,c){var b=$j(this).html().replace(/&lt;/gi,"<").replace(/&gt;/gi,">");$j(this).html(egHtmlDecode(b));});});