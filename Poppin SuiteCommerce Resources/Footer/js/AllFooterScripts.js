var GPR_PUP=function(b){var a={fade:500,winTimeOut:7000};return{init:function(c){if(c!==null&&c!==undefined){b.extend(a,c);}},show:function(c){b(".gpr-pup-win").remove();b("body").append('<div class="gpr-pup-win">'+c+"</div>");b(".gpr-pup-win").fadeTo(0,0);b(".gpr-pup-win").append('<div class="gpr-pup-close">X Close</div>');b(".gpr-pup-win").fadeTo(a.fade,1);b(".gpr-pup-close").click(function(){b(".gpr-pup-win").fadeTo(a.fade,0,function(){b(".gpr-pup-win").remove();});});setTimeout(function(){b(".gpr-pup-win").fadeTo(a.fade,0,function(){b(".gpr-pup-win").remove();});},a.winTimeOut);}};}(jQuery);var GPR_AAE_QIO=function($){var objOptions={searchInputId:"qio_search",itemInputId:"qio_item",qioRowListId:"qio_list",maxRows:10};var reEscape=new RegExp("(\\"+["/",".","*","+","?","|","(",")","[","]","{","}","\\"].join("|\\")+")","g");var intRows=1;var objAutOptions;return{init:function(obj){if(obj!==null&&obj!==undefined){$.extend(objOptions,obj);}$("#form_qio #n").val(GPR_OPTIONS.options().siteNumber);},onSelect:function(value,data,el){$(el).parent().find(".item").val(data.itemid);},initRows:function(obj){objAutOptions=obj;$("#"+objOptions.searchInputId+"_0").autocomplete(obj);var objRemoveRow=$("<a>").attr({href:"javascript:void(0);"}).click(function(){GPR_AAE_QIO.delRow($(this).parent().attr("id"));});objRemoveRow.html("-");$("#qvi_row_0").append(objRemoveRow);},addRow:function(){intRows=$(".qio .list li").length;if(intRows<objOptions.maxRows){var li=$("<li>").attr("id","qvi_row_"+intRows);li.append($("<input>").attr({"class":"search",id:objOptions.searchInputId+"_"+intRows,name:objOptions.searchInputId+"_"+intRows,type:"input"}));li.append($("<input>").attr({"class":"item",type:"hidden",id:objOptions.itemInputId+"_"+intRows}));li.append($('<input class="qty" type="input" value="1">'));var objRemoveRow=$("<a>").attr({href:"javascript:void(0);"}).click(function(){GPR_AAE_QIO.delRow($(this).parent().attr("id"));});objRemoveRow.html("-");li.append(objRemoveRow);li.appendTo("#"+objOptions.qioRowListId);$("#"+objOptions.searchInputId+"_"+intRows).autocomplete(objAutOptions);}else{GPR_PUP.show("You reach the max rows limit");}},delRow:function(strId){intRows=$(".qio .list li").length;if(intRows>1){if(strId==null||strId==undefined){intRows--;$(".qio .list li").last().remove();}else{intRows--;$("#"+strId).remove();}}else{GPR_PUP.show("Must have at least one row");}},addToCart:function(){var arrItems=[];var bolOk=true;$(".qio li .qty").each(function(){var arrItem=[];var intQty=parseInt($(this).val());if(intQty=="NaN"||intQty==0){bolOk=false;$(this).focus();GPR_PUP.show("The Quantity must be greater than 0.");return false;}else{var strItemId=$(this).parent().find("input.item").val();if(strItemId==""||strItemId==null||strItemId==undefined){bolOk=false;$(this).parent().find("input.item").focus();GPR_PUP.show("Please select an Item.");return false;}else{arrItem.push(strItemId);arrItem.push($(this).val());arrItems.push(arrItem);}}});intCntItems=arrItems.length;if(bolOk&&intCntItems>0){if(intCntItems>1){for(var i=arrItems.length-2;i>=0;i--){$.post("/app/site/backend/additemtocart.nl",{c:GPR_OPTIONS.options().companyId,n:GPR_OPTIONS.options().siteNumber,buyid:arrItems[i][0],itemid:arrItems[i][0],qty:arrItems[i][1]});}}setTimeout(function(){$("#form_qio #itemid").val(arrItems[intCntItems-1][0]);$("#form_qio #buyid").val(arrItems[intCntItems-1][0]);$("#form_qio #qty").val(arrItems[intCntItems-1][1]);$("#form_qio").submit();},(500*intCntItems));}},formatResult:function(value,data,currentValue){var pattern="("+currentValue.replace(reEscape,"\\$1")+")";var strDisplayValue=value+((data.name==""||data.name==undefined)?"":" - "+data.name);return('<span class="value">'+strDisplayValue.replace(new RegExp(pattern,"gi"),"<strong>$1</strong>")+'</span><a class="link" href="'+data.url+'">View</a>');},formatResultSearch:function(value,data,currentValue){var pattern="("+currentValue.replace(reEscape,"\\$1")+")";var strTitle="";var strDesc="";switch(data.type){case"first-cat":strTitle='<div class="search-title">Categories</div>';break;case"first-itm":strTitle='<div class="search-title">Products</div>';break;default:strTitle="";break;}strDesc=unescape(data.desc);if(strDesc.length>80){strDesc=strDesc.substr(0,80)+"...";}else{strDesc=unescape(data.desc);}return(strTitle+((data.img!=null&&data.img!=""&&data.img!="undefined")?'<img src="'+data.img+'" title="">':"")+'<span class="search-text"><h5><a href="'+data.url+'" title="">'+value.replace(new RegExp(pattern,"gi"),"<strong>$1</strong>")+"</a></h5><p>"+strDesc+"</p></span>");},parseResponseSearch:function parseResponse(text,query){var auxResponseCategories=$(text).find("div#cat-list-cell");var auxResponseItems=$(text).find("div .item-list-cell");var bolItems=true;var bolCategories=true;if(auxResponseCategories.length===0){bolCategories=false;}if(auxResponseItems.length===0){bolItems=false;}if(!bolItems&&!bolCategories){response=eval("({query: '"+query+"',suggestions: [],data: []})");return response;}else{var strSuggestions="";var strData="";$(auxResponseCategories).each(function(i){var strCategoryName=$(this).find(".cat-desc-cell a").text();var strCategoryUrl=$(this).find(".cat-desc-cell a").attr("href");var strCategoryImg=$(this).find(".cat-thumbnail-cell img").attr("src");strCategoryImg=((strCategoryImg!=""&&strCategoryImg!=null&&strCategoryImg!="undefined")?strCategoryImg.split(";"):"");var strCategoryDesc=$(this).find(".cat-detail-desc-cell").html();strCategoryDesc=escape(strCategoryDesc.replace(/'/gi,"-"));strSuggestions+="'"+strCategoryName.replace(/'/gi,"-")+"',";if(i==0){strData+="{url: '"+strCategoryUrl+"',img: '"+strCategoryImg[0]+"', desc:'"+strCategoryDesc+"', type: 'first-cat'},";}else{strData+="{url: '"+strCategoryUrl+"',img: '"+strCategoryImg[0]+"', desc:'"+strCategoryDesc+"', type: 'cat'},";}});$(auxResponseItems).each(function(i){var strName=$(this).find(".desc-cell a").text();var strItemUrl=$(this).find(".desc-cell a").attr("href");var strItemImg=$(this).find(".thumbnail-cell img").attr("src");strItemImg=((strItemImg!=""&&strItemImg!=null&&strItemImg!="undefined")?strItemImg.split(";"):"");var strItemDesc=$(this).find(".detail-desc-cell").html();strItemDesc=escape(strItemDesc.replace(/'/gi,"-"));strSuggestions+="'"+strName.replace(/'/gi,"-")+"',";if(i==0){strData+="{url: '"+strItemUrl+"',img: '"+strItemImg[0]+"', desc:'"+strItemDesc+"', type: 'first-itm'},";}else{strData+="{url: '"+strItemUrl+"',img: '"+strItemImg[0]+"', desc:'"+strItemDesc+"', type: 'itm'},";}});strSuggestions=strSuggestions.substring(0,(strSuggestions.length-1));strData=strData.substring(0,(strData.length-1));response=eval("({query: '"+query+"',suggestions: ["+strSuggestions+"],data: ["+strData+"]})");return response;}},viewMoreSearch:function(query){return('<div class="view-more"><a href="/s.nl?search='+query+'" title="">View all search results</a></div>');},onSelectSearch:function(value,data,obj){window.location=data.url;}};}(jQuery);(function($){function Autocomplete(el,options){this.el=$(el);this.el.attr("autocomplete","off");this.suggestions=[];this.data=[];this.badQueries=[];this.selectedIndex=-1;this.currentValue=this.el.val();this.intervalId=0;this.cachedResponse=[];this.onChangeInterval=null;this.ignoreValueChange=false;this.serviceUrl=options.serviceUrl;this.isLocal=false;this.options={autoSubmit:false,minChars:1,maxHeight:300,deferRequestBy:0,width:0,highlight:true,params:{},delimiter:null,searchBkgStyle:"none",searchCSSClass:"autocomplete",maxResults:0,zIndex:9999};this.initialize();this.setOptions(options);}$.fn.autocomplete=function(options){return new Autocomplete(this.get(0)||$("<input />"),options);};Autocomplete.prototype={killerFn:null,initialize:function(){var me,uid,autocompleteElId;me=this;uid=Math.floor(Math.random()*1048576).toString(16);autocompleteElId="Autocomplete_"+uid;this.killerFn=function(e){if($(e.target).parents(".autocomplete").size()===0){me.killSuggestions();me.disableKillerFn();}};if(!this.options.width){this.options.width=this.el.width();}this.mainContainerId="AutocompleteContainter_"+uid;$('<div id="'+this.mainContainerId+'" style="position:absolute;z-index:9999;"><div class="'+this.options.searchCSSClass+'-w1"><div class="'+this.options.searchCSSClass+'" id="'+autocompleteElId+'" style="display:none; width:300px;"></div></div></div>').appendTo(".qio .results");this.container=$("#"+autocompleteElId);this.fixPosition();if(window.opera){this.el.keypress(function(e){me.onKeyPress(e);});}else{this.el.keydown(function(e){me.onKeyPress(e);});}this.el.keyup(function(e){me.onKeyUp(e);});this.el.blur(function(){me.enableKillerFn();});this.el.focus(function(){me.fixPosition();});},setOptions:function(options){var o=this.options;$.extend(o,options);if(o.lookup){this.isLocal=true;if($.isArray(o.lookup)){o.lookup={suggestions:o.lookup,data:[]};}}$("#"+this.mainContainerId).css({zIndex:o.zIndex});this.container.css({maxHeight:o.maxHeight+"px",width:o.width});},clearCache:function(){this.cachedResponse=[];this.badQueries=[];},disable:function(){this.disabled=true;},enable:function(){this.disabled=false;},fixPosition:function(){var offset=this.el.offset();$("#"+this.mainContainerId).css({top:(offset.top+this.el.innerHeight())+"px",left:offset.left+"px"});},enableKillerFn:function(){var me=this;$(document).bind("click",me.killerFn);},disableKillerFn:function(){var me=this;$(document).unbind("click",me.killerFn);},killSuggestions:function(){var me=this;this.stopKillSuggestions();this.intervalId=window.setInterval(function(){me.hide();me.stopKillSuggestions();},300);},stopKillSuggestions:function(){window.clearInterval(this.intervalId);},onKeyPress:function(e){if(this.disabled||!this.enabled){return;}switch(e.keyCode){case 27:this.el.val(this.currentValue);this.hide();break;case 9:case 13:if(this.selectedIndex===-1){this.hide();return;}this.select(this.selectedIndex);if(e.keyCode===9){return;}break;case 38:this.moveUp();break;case 40:this.moveDown();break;default:return;}e.stopImmediatePropagation();e.preventDefault();},onKeyUp:function(e){if(this.disabled){return;}switch(e.keyCode){case 38:case 40:return;}clearInterval(this.onChangeInterval);if(this.currentValue!==this.el.val()){if(this.options.deferRequestBy>0){var me=this;this.onChangeInterval=setInterval(function(){me.onValueChange();},this.options.deferRequestBy);}else{this.onValueChange();}}},onValueChange:function(){clearInterval(this.onChangeInterval);this.currentValue=this.el.val();var q=this.getQuery(this.currentValue);this.selectedIndex=-1;if(this.ignoreValueChange){this.ignoreValueChange=false;return;}if(q===""||q.length<this.options.minChars){this.hide();}else{this.getSuggestions(q);}},getQuery:function(val){var d,arr;d=this.options.delimiter;if(!d){return $.trim(val);}arr=val.split(d);return $.trim(arr[arr.length-1]);},getSuggestionsLocal:function(q){var ret,arr,len,val,i;arr=this.options.lookup;len=arr.suggestions.length;ret={suggestions:[],data:[]};q=q.toLowerCase();for(i=0;i<len;i++){val=arr.suggestions[i];if(val.toLowerCase().indexOf(q)===0){ret.suggestions.push(val);ret.data.push(arr.data[i]);}}return ret;},getSuggestions:function(q){var cr,me;cr=this.isLocal?this.getSuggestionsLocal(q):this.cachedResponse[q];if(cr&&$.isArray(cr.suggestions)){this.suggestions=cr.suggestions;this.data=cr.data;this.suggest();}else{if(!this.isBadQuery(q)){me=this;me.options.params.search=q;me.options.params.query=q;this.el.css("background",me.options.searchBkgStyle);$.get(this.serviceUrl,me.options.params,function(txt){me.processResponse(txt);},"text");}}},isBadQuery:function(q){var i=this.badQueries.length;while(i--){if(q.indexOf(this.badQueries[i])===0){return true;}}return false;},hide:function(){this.enabled=false;this.selectedIndex=-1;this.container.hide();},suggest:function(){var me,len,maxResults,viewMore,div,f,v,i,s,mOver,mClick;if(this.suggestions.length===0){this.hide();this.container.hide().empty();div=$('<div class="selected" title="No Results Found">No Results Found</div>');this.container.append(div);this.enabled=true;this.container.show();return;}me=this;len=this.suggestions.length;f=this.options.fnFormatResult;v=this.getQuery(this.currentValue);more=this.options.fnViewMore;maxResults=this.options.maxResults;viewMore=false;mOver=function(xi){return function(){me.activate(xi);};};mClick=function(xi){return function(){me.select(xi);};};this.container.hide().empty();if(!maxResults){maxResults=len;}else{if(len>maxResults){viewMore=true;}}for(i=0;i<len&&i<maxResults;i++){s=this.suggestions[i];div=$((me.selectedIndex===i?'<div class="selected"':"<div")+' title="'+s+'">'+($.isFunction(f)?f(s,this.data[i],v):s)+"</div>");div.mouseover(mOver(i));div.click(mClick(i));this.container.append(div);}if($.isFunction(more)&&viewMore){this.container.append(more(this.options.params.query));}this.enabled=true;this.container.show();},processResponse:function(text){var response,f;try{f=this.options.fnParseResponse;if($.isFunction(f)){response=f(text,this.options.params.query);}else{response=eval("("+text+")");}}catch(err){return;}if(!$.isArray(response.data)){response.data=[];}if(!this.options.noCache){this.cachedResponse[response.query]=response;if(response.suggestions.length===0){this.badQueries.push(response.query);}}if(response.query===this.getQuery(this.currentValue)){this.suggestions=response.suggestions;this.data=response.data;this.suggest();}this.el.css("background","none");},activate:function(index){var divs,activeItem;divs=this.container.children();if(this.selectedIndex!==-1&&divs.length>this.selectedIndex){$(divs.get(this.selectedIndex)).removeClass();}this.selectedIndex=index;if(this.selectedIndex!==-1&&divs.length>this.selectedIndex){activeItem=divs.get(this.selectedIndex);$(activeItem).addClass("selected");}return activeItem;},deactivate:function(div,index){div.className="";if(this.selectedIndex===index){this.selectedIndex=-1;}},select:function(i){var selectedValue,f;selectedValue=this.suggestions[i];if(selectedValue){this.el.val(selectedValue);if(this.options.autoSubmit){f=this.el.parents("form");if(f.length>0){f.get(0).submit();}}this.ignoreValueChange=true;this.hide();this.onSelect(i);}},moveUp:function(){if(this.selectedIndex===-1){return;}if(this.selectedIndex===0){this.container.children().get(0).className="";this.selectedIndex=-1;this.el.val(this.currentValue);return;}this.adjustScroll(this.selectedIndex-1);},moveDown:function(){if(this.selectedIndex===(this.suggestions.length-1)){return;}this.adjustScroll(this.selectedIndex+1);},adjustScroll:function(i){var activeItem,offsetTop,upperBound,lowerBound;activeItem=this.activate(i);offsetTop=activeItem.offsetTop;upperBound=this.container.scrollTop();lowerBound=upperBound+this.options.maxHeight-25;if(offsetTop<upperBound){this.container.scrollTop(offsetTop);}else{if(offsetTop>lowerBound){this.container.scrollTop(offsetTop-this.options.maxHeight+25);}}this.el.val(this.getValue(this.suggestions[i]));},onSelect:function(i){var me,fn,s,d;me=this;fn=me.options.fnOnSelect;s=me.suggestions[i];d=me.data[i];me.el.val(me.getValue(s));if($.isFunction(fn)){fn(s,d,me.el);}},getValue:function(value){var del,currVal,arr,me;me=this;del=me.options.delimiter;if(!del){return value;}currVal=me.currentValue;arr=currVal.split(del);if(arr.length===1){return value;}return currVal.substr(0,currVal.length-arr[arr.length-1].length)+value;}};}(jQuery));var poppinres={url:{gigyacontrol:"https://checkout.sandbox.netsuite.com/c.3363929/Poppin/PoppinCustomApplications/gigya.html",loginservice:"https://checkout.sandbox.netsuite.com/c.3363929/Poppin/PoppinCustomApplications/LoginService.ss",loginservice1:"http://sandbox.poppin.com/Poppin/PoppinCustomApplications/LoginService.ss",storeexitsurveyservice:"https://checkout.sandbox.netsuite.com/c.3363929/Poppin/PoppinCustomApplications/StoreExitSurveyResult.ss",loginpage:"https://checkout.sandbox.netsuite.com/c.3363929/Poppin/PoppinCustomApplications/Login.ssp",miniloginpage:"https://checkout.sandbox.netsuite.com/c.3363929/Poppin/PoppinCustomApplications/MiniLogin.ssp",poppinglobal:"http://sandbox.poppin.com",selectbackgroundimg:"/site/social-login/images/bg_select.png",cardmessageservice:"https://checkout.sandbox.netsuite.com/c.3363929/CardMessage/cardmessage.ss",poppincheckout:"secure.poppin.com",checkoutbase:"https://checkout.sandbox.netsuite.com/c.3363929/checkout/index.ssp?n=1&sc=4"},text:{forgotpassword:"",emailvalidation:"<p>Don't use your thumbs</p><p>and try again.</p>",firstnamevalidation:"<p>Is that really your first</p><p>name? Try again.</p>",lastnamevalidation:"<p>Hey, Professor Imistypedmyname,</p><p>want to try again?</p>",passwordvalidation:"<p>Oops. We want to keep your info safe and</p><p>require your password to be a minimum of</p><p>6 letters or numbers (no special characters).</p>",howdyouhearvalidation:"<p>Let us know how you heard about </p><p>Poppin, select a value from the </p><p>drop down</p>",industryvalidation:"<p>Let us know what industry you are </p><p>working in, select a value from the </p><p>drop down</p>",emailempty:"<p>Please input email address.</p>",emailinvalid:" <p>Please enter a valid email address.</p>",passwordempty:"<p>You must provide a login password.</p>",responsetypenull:"Response type is null",responsetypeunknown:"Unknown Response type",passwordresettitle:"Password Reset",responseobjectnull:"null response object",forgotpasswordsent:"Ok. We've sent you instructions on how to update your password, aka Your Personal Key to Work Happiness. Please check your email.",forgotpasswordunrecognized:'The email that you entered is not recognized, please try again or <a href="https://checkout.sandbox.netsuite.com/c.3363929/Poppin/PoppinCustomApplications/Login.ssp" style="text-decoration: underline;">create a new account</a>',exitsurveyempty:"Please fill out the survey",resetpasswordsuccess:"Password changed successfully"},id:{banner:"199"}};var powerTip={create:function(a,c,b,e,d){jQuery("#"+b).remove();tipElement=jQuery("<div/>",{id:b,html:c}).attr("class","n").css("top",e).css("left",d).css("display","block");if(a=="company"||a=="minicompany"){tipElement.css("border-color","rgb(151, 151, 151)");tipElement.attr("class","n_company");}jQuery("#"+a).parent().append(tipElement);},hide:function(a){jQuery("#"+a).remove();}};function setCookie(b,d,a,f,c,e){if(!b||d===undefined){return false;}var g=b+"="+encodeURIComponent(d);if(a){g+="; expires="+a.toGMTString();}if(f){g+="; path="+f;}if(c){g+="; domain="+c;}if(e){g+="; secure";}document.cookie=g;return true;}function getCookie(a){var c="(?:; )?"+a+"=([^;]*);?";var b=new RegExp(c);if(b.test(document.cookie)){return decodeURIComponent(RegExp["$1"]);}return false;}function deleteCookie(a,c,b){setCookie(a,null,new Date(0),c,b);return true;}function getQuerystring(b,d){if(d==null){d="";}b=b.replace(/[\[]/,"\\[").replace(/[\]]/,"\\]");var c=new RegExp("[\\?&]"+b+"=([^&#]*)");var a=c.exec(window.location.href);if(a==null){return d;}else{return a[1];}}var isTablet={iPad:function(){return navigator.userAgent.match(/iPad/);},Xoom:function(){return navigator.userAgent.match(/Xoom/);},Playbook:function(){return navigator.userAgent.match(/Playbook/);},Silk:function(){return navigator.userAgent.match(/Silk/);},any:function(){return(isTablet.iPad()||isTablet.Xoom()||isTablet.Playbook()||isTablet.Silk());}};var isMobile={Android:function(){return navigator.userAgent.match(/Android/i);},BlackBerry:function(){return navigator.userAgent.match(/BlackBerry/i);},iOS:function(){return navigator.userAgent.match(/iPhone|iPod/i);},Opera:function(){return navigator.userAgent.match(/Opera Mini/i);},Windows:function(){return navigator.userAgent.match(/IEMobile/i);},GoogleBotMobile:function(){return navigator.userAgent.match(/GoogleBotMobile/i);},OperaMobi:function(){return navigator.userAgent.match(/Opera\ Mobi/i);},any:function(){return(isMobile.Android()||isMobile.BlackBerry()||isMobile.iOS()||isMobile.Opera()||isMobile.Windows()||isMobile.GoogleBotMobile()||isMobile.OperaMobi());}};function checkMobileAndTablet(){var e=getQuerystring("MobileOptOut");var b=getCookie("MobileOptOut");if(e=="1"||b=="1"||isTablet.any()||navigator.userAgent.match(/BrandingBrand/)){var d=new Date();d.setMinutes(d.getMinutes()+30);setCookie("MobileOptOut",1,d);return;}if(e=="0"){deleteCookie("MobileOptOut");}if(isMobile.any()){var f=window.location.href;var a="";if(f.indexOf(".com")>0){a=f.substring((f.indexOf(".com")+4),f.length);}var c="";if(f.indexOf("expresscheckoutreturn.nl")>0){c="/app/site/backend/paypal/expresscheckoutreturn.nl";}window.location.href="http://poppin.uat.bbhosted.com"+c+a;}}checkMobileAndTablet();function validateEmail(a){var b=/^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;if(!b.test(a)){return false;}else{return true;}}jQuery(document).ready(function(){var b=jQuery(".top-links").offset();if(getQuerystring("e")&&getQuerystring("dt")&&getQuerystring("cb")){resetPasswordOld();}$j("#coverdiv").click(function(){if($j("#loginpositionhelper").css("display")!="none"){$j("#loginpositionhelper").hide();$j("#coverdiv").hide();}});jQuery(".login a").attr("href","#");jQuery(".login button").click(function(){if(window.location.href.indexOf("https")>-1){return false;}if(jQuery("#loginpositionhelper").is(":visible")){jQuery("#coverdiv").hide();jQuery("#loginpositionhelper").hide();}else{jQuery("#coverdiv").show();jQuery("#loginpositionhelper").show();}});if(window.location.href.indexOf(poppinres.url.poppincheckout)!=-1){jQuery("#loginpositionhelper").attr("style","display:none");}if(window.location.href.indexOf("shopping-cart")!=-1&&jQuery(".login.hidden").length==0){var a=GPR_OPTIONS.options().loginURL+"&checkout=T";jQuery("#checkout").removeAttr("onclick");document.getElementById("checkout").onclick=function(){setGARedirectUrl(a);};}});function miniloginInit(){}function setCookie(b,d,a,f,c,e){if(!b||d===undefined){return false;}var g=b+"="+encodeURIComponent(d);if(a){g+="; expires="+a.toGMTString();}if(f){g+="; path="+f;}if(c){g+="; domain="+c;}if(e){g+="; secure";}document.cookie=g;return true;}function storeLoginCookie(a){var c=a.email;var b=a.password;var e=new Date();e.setDate(e.getDate()+7);setCookie("poppinemail",c,e);setCookie("poppinpassword",b,e);}function getLoginCookie(a){var c="(?:; )?"+a+"=([^;]*);?";var b=new RegExp(c);if(b.test(document.cookie)){return decodeURIComponent(RegExp["$1"]);}return false;}function resetLoginCookie(){deleteCookie("poppinemail");deleteCookie("poppinpassword");}function deleteCookie(a,c,b){setCookie(a,null,new Date(0),c,b);return true;}jQuery(function(){if(getLoginCookie("poppinemail")&&getLoginCookie("poppinpassword")){document.forms.miniloginform.elements.email.value=getLoginCookie("poppinemail");document.forms.miniloginform.elements.password.value=getLoginCookie("poppinpassword");if(window.location.href.indexOf(poppinres.url.poppincheckout)!=-1){document.forms.loginform.elements.emaillog.value=getLoginCookie("poppinemail");document.forms.loginform.elements.password.value=getLoginCookie("poppinpassword");}}});var MINILOGINSOCKET;jQuery(document).ready(function(){var a=GPR_OPTIONS.options().loginURL;a=a.substring(a.indexOf("?"),a.length);if(window.location.href.indexOf(poppinres.url.poppincheckout)<0){MINILOGINSOCKET=new easyXDM.Socket({remote:poppinres.url.miniloginpage+a,onMessage:function(f,b){jQuery("div#waitmask").hide();if(f==null){jQuery("#dialogresponse").html(poppinres.text.responseobjectnull);jQuery("#dialogresponse").dialog({title:"Info"});}var c=JSON.parse(f);console.log(c);if(c.responsetype==null){jQuery("#dialogresponse").html(poppinres.text.responsetypenull);jQuery("#dialogresponse").dialog({title:"Info"});return;}switch(c.responsetype){case"success":jQuery("#dialogresponse").html(c.message);jQuery("#dialogresponse").dialog({title:"Info"});break;case"linksocial":window.location=poppinres.url.loginpage+"?linksocial=T&"+jQuery.param(c.message);break;case"redirect":var e={remember:document.forms.miniloginform.elements.remember.checked,email:document.forms.miniloginform.elements.email.value,password:document.forms.miniloginform.elements.password.value};if(document.forms.miniloginform.elements.remember.checked){storeLoginCookie(e);}else{resetLoginCookie();}if(c.socializenotify!=undefined){var g=c.socializenotify;if(g.type=="login"){gigya.socialize.notifyLogin(g.params);}else{if(g.type=="register"){gigya.socialize.notifyRegistration(g.params);}}}window.location=c.message;break;case"error":var d=c.message;d=d.substring(d.lastIndexOf(":")+1,d.length);if(d.indexOf("password")!=-1){powerTip.create("minipassword",d,"powerTipminipassword",-52,100);jQuery("#minipassword").on("focusin",function(){powerTip.hide("powerTipminipassword");});jQuery("#minipassword").attr("class","input-red");}else{if(d.indexOf("haven't registered yet")!=-1){powerTip.create("miniemail",d,"powerTipminiemail",-52,100);jQuery("#miniemail").on("focusin",function(){powerTip.hide("powerTipminiemail");});jQuery("#miniemail").attr("class","input-red");}else{if(d.indexOf("already exists")!=-1){powerTip.create("miniemailregnew",d,"powerTipminiemailreg",-52,100);jQuery("#miniemailregnew").on("focusin",function(){powerTip.hide("powerTipminiemailreg");});jQuery("#miniemailregnew").attr("class","input-red");}else{jQuery("#dialogresponse").html(d);jQuery("#dialogresponse").dialog({title:"Info"});}}}return false;break;default:jQuery("#dialogresponse").html(poppinres.text.responsetypeunknown);jQuery("#dialogresponse").dialog({title:"Info"});return false;}}});}});function miniForgotPassword(){var a={requesttype:"forgotpassword",email:document.forms.miniloginform.elements.email.value,password:document.forms.miniloginform.elements.password.value};jQuery("#miniemail").removeClass("input-red");if(a.email===""){powerTip.create("miniemail",poppinres.text.emailempty,"powerTipminiemail",-69,20);jQuery("#miniemail").on("focusin",function(){powerTip.hide("powerTipminiemail");});jQuery("#miniemail").attr("class","input-red");return false;}if(!validateEmail(a.email)){powerTip.create("miniemail",poppinres.text.emailinvalid,"powerTipminiemail",-69,20);jQuery("#miniemail").on("focusin",function(){powerTip.hide("powerTipminiemail");});jQuery("#miniemail").attr("class","input-red");return false;}var b=JSON.stringify(a);MINILOGINSOCKET.postMessage(b);}function forgotPasswordOld(){var a='<div class="new-customer"><form id="forgot-pass-form" action="sendForgotPasswordRequest()"><fieldset style="border: 0px none;"><label for="email">Email Address*</label><input id="email" name="email" type="text" style="font-size:16px;font-family:Arial,Helvetica,sans-serif"></fieldset><fieldset style="border: 0px none;"><input type="submit" value="Continue" class="orangeBtn" name="submit" id="submit" style="margin: 0px;font-size:10pt;font-family:OmnesMediumRegular,sans-serif"></fieldset><fieldset style="border: 0px none;"><p class="message"></p></fieldset></form></div>';jQuery("#dialogresponse").html(a);jQuery("#dialogresponse").dialog({title:poppinres.text.passwordresettitle});jQuery("#forgot-pass-form").on("submit",function(b){b.preventDefault();if(jQuery("form#forgot-pass-form > fieldset > input#submit.orangeBtn").val()=="Continue"){sendForgotPasswordRequestOld();}else{jQuery("#dialogresponse").dialog("close");}});}function resetPasswordOld(){var a='<div class="new-customer" style="position:relative;"><form id="reset-pass-form" action="sendResetPasswordRequest()"><fieldset style="border: 0px none;"><label for="resetpass">New Password*</label><input id="resetpass" name="resetpass" type="password" style="font-size:16px;font-family:Arial,Helvetica,sans-serif"></fieldset><fieldset style="border: 0px none;"><input type="submit" value="Continue" class="orangeBtn" name="submit" id="submit" style="margin: 0px;font-size:10pt;font-family:OmnesMediumRegular,sans-serif"></fieldset><fieldset style="border: 0px none;"><p class="message"></p></fieldset></form></div>';jQuery("#dialogresponse").html(a);jQuery("#dialogresponse").dialog({title:poppinres.text.passwordresettitle});jQuery("#reset-pass-form").on("submit",function(b){b.preventDefault();if(jQuery("form#reset-pass-form > fieldset > input#submit.orangeBtn").val()=="Continue"){sendResetPasswordRequestOld();}else{jQuery("#dialogresponse").dialog("close");}});}function sendResetPasswordRequestOld(){var c=poppinres.url.loginservice;if(location.protocol=="http:"){c=poppinres.url.loginservice1;}var b=document.forms["reset-pass-form"].elements.resetpass.value;var d=/^[0-9a-zA-Z]{6,}$/;if(!d.test(b)){powerTip.create("resetpass",poppinres.text.passwordvalidation,"powerTipResetPass",-44,0);jQuery("#resetpass").on("focusin",function(){powerTip.hide("powerTipResetPass");});jQuery("#resetpass").attr("class","input-red");return false;}var a={requesttype:"resetpassword",password:b,e:getQuerystring("e"),dt:getQuerystring("dt"),cb:getQuerystring("cb")};jQuery.ajax({url:c,data:a,dataType:"jsonp",jsonp:"json.wrf",success:resetPasswordResponseOld,error:resetPasswordResponseOld});jQuery("div#waitmask").show();}function resetPasswordResponseOld(c){var b="";jQuery("div#waitmask").hide();if(c.responseText==null){b=poppinres.text.responseobjectnull;}var a=JSON.parse(c.responseText);switch(a.responsetype){case null:b=poppinres.text.responsetypenull;break;case"success":b=poppinres.text.resetpasswordsuccess;break;case"error":b=c.responseText;break;default:b=poppinres.text.responsetypeunknown;}jQuery("form#reset-pass-form > fieldset > input#submit.orangeBtn").val("Close");jQuery("form#reset-pass-form > fieldset > p.message").html(b);}function sendForgotPasswordRequestOld(){var b=poppinres.url.loginservice;if(location.protocol=="http:"){b=poppinres.url.loginservice1;}var a={requesttype:"forgotpassword",email:document.forms["forgot-pass-form"].elements.email.value};jQuery.ajax({url:b,data:a,dataType:"jsonp",jsonp:"json.wrf",success:forgotPasswordResponseOld,error:forgotPasswordResponseOld});jQuery("div#waitmask").show();}function forgotPasswordResponseOld(c){var b="";jQuery("div#waitmask").hide();if(c.responseText==null){b=poppinres.text.responseobjectnull;}var a=JSON.parse(c.responseText);switch(a.responsetype){case null:b=poppinres.text.responsetypenull;break;case"success":b=poppinres.text.forgotpasswordsent;break;case"error":b=poppinres.text.forgotpasswordunrecognized;break;default:b=poppinres.text.responsetypeunknown;}jQuery("form#forgot-pass-form > fieldset > input#submit.orangeBtn").val("Close");jQuery("form#forgot-pass-form > fieldset > p.message").html(b);}jQuery(document).ready(function(){jQuery("#minicompanyhelp").on("mouseenter",function(){powerTip.create("minicompany",jQuery("#miniwhatthisfortext").html(),"powerTipCompany",-17,176);});jQuery("#minicompanyhelp").on("mouseleave",function(){powerTip.hide("powerTipCompany");});});jQuery(function(){jQuery("#miniloginform").on("submit",function(a){a.preventDefault();miniloginSubmit();});jQuery("#mini-new-customer-register").on("submit",function(a){a.preventDefault();registerformSubmitUser();});jQuery("#minitwitter-email").on("submit",function(a){a.preventDefault();minitwitterSubmit();});});function miniloginSubmit(b){var b={requesttype:"login",remember:document.forms.miniloginform.elements.remember.checked,email:document.forms.miniloginform.elements.email.value,password:document.forms.miniloginform.elements.password.value,checkout:false,targetUrl:window.location.href};jQuery("#minipassword, #miniemail").removeClass("input-red");powerTip.hide("powerTipminiemail");powerTip.hide("powerTipminipassword");if(b.email===""){powerTip.create("miniemail",poppinres.text.emailempty,"powerTipminiemail",-37,100);jQuery("#miniemail").on("focusin",function(){powerTip.hide("powerTipminiemail");});jQuery("#miniemail").attr("class","input-red");}if(!validateEmail(b.email)){powerTip.create("miniemail",poppinres.text.emailinvalid,"powerTipminiemail",-37,100);jQuery("#miniemail").on("focusin",function(){powerTip.hide("powerTipminiemail");});jQuery("#miniemail").attr("class","input-red");}if(b.password===""){powerTip.create("minipassword",poppinres.text.passwordempty,"powerTipminipassword",-37,100);jQuery("#minipassword").on("focusin",function(){powerTip.hide("powerTipminipassword");});jQuery("#minipassword").attr("class","input-red");}if(jQuery("#miniloginform .input-red").size()>0){return false;}var a=JSON.stringify(b);MINILOGINSOCKET.postMessage(a);jQuery("div#waitmask").show();}function registerformSubmitUser(){if(!validateRegisterForm()){return false;}var b="";b=document.forms["mini-new-customer-register"].elements.minicompany.value;var c="F";if(jQuery("form#mini-new-customer-register > fieldset > input#minisubscribe").is(":checked")){c="T";}var a={requesttype:"manualregister",lead:document.forms["mini-new-customer-register"].elements.minileadsource.value,remember:true,email:document.forms["mini-new-customer-register"].elements.miniemailregnew.value,name:document.forms["mini-new-customer-register"].elements.minifname.value+" "+document.forms["mini-new-customer-register"].elements.minilname.value,password:document.forms["mini-new-customer-register"].elements.minipasswordnew.value,password2:document.forms["mini-new-customer-register"].elements.minipasswordnew.value,company:b,emailsubscribe:c,checkout:false};var d=JSON.stringify(a);MINILOGINSOCKET.postMessage(d);jQuery("div#waitmask").show();}function validateRegisterForm(){var e=/^([0-9a-zA-Z_\.-]+)@([\da-zA-Z\.-]+)\.([a-zA-Z\.]{2,6})$/;var a=/^[0-9a-zA-Z- ]{2,}$/;var f=/^[0-9a-zA-Z]{6,}$/;var c=jQuery("form#mini-new-customer-register > fieldset > div > input#miniemailregnew").first();var g=jQuery("form#mini-new-customer-register > fieldset > div > input#minifname").first();var b=jQuery("form#mini-new-customer-register > fieldset > div > input#minilname").first();var d=jQuery("form#mini-new-customer-register > fieldset > div > input#minipasswordnew").first();jQuery("form#mini-new-customer-register > fieldset > div > input#minifname").val(jQuery("form#mini-new-customer-register > fieldset > div > input#minifname").val().trim());jQuery("form#mini-new-customer-register > fieldset > div > input#minilname").val(jQuery("form#mini-new-customer-register > fieldset > div > input#minilname").val().trim());jQuery("#mini-new-customer-register .input-red").removeClass("input-red");if(!e.test(c.val())){powerTip.create("miniemailregnew",poppinres.text.emailvalidation,"powerTipEmail",-52,97);jQuery("#miniemailregnew").on("focusin",function(){powerTip.hide("powerTipEmail");});c.attr("class","input-red");}if(!a.test(g.val())){powerTip.create("minifname",poppinres.text.firstnamevalidation,"powerTipFName",-52,97);jQuery("#minifname").on("focusin",function(){powerTip.hide("powerTipFName");});g.attr("class","input-red");}if(!a.test(b.val())){powerTip.create("minilname",poppinres.text.lastnamevalidation,"powerTipLName",-52,97);jQuery("#minilname").on("focusin",function(){powerTip.hide("powerTipLName");});b.attr("class","input-red");}if(!f.test(d.val())){powerTip.create("minipasswordnew",poppinres.text.passwordvalidation,"powerTipPass",-65,97);jQuery("#minipasswordnew").on("focusin",function(){powerTip.hide("powerTipPass");});d.attr("class","input-red");}if(jQuery("form#mini-new-customer-register input.input-red").size()>0){return false;}else{return true;}}function readCookie(b){var e=b+"=";var a=document.cookie.split(";");for(var d=0;d<a.length;d++){var f=a[d];while(f.charAt(0)==" "){f=f.substring(1,f.length);}if(f.indexOf(e)==0){return f.substring(e.length,f.length);}}return null;}function createCookie(c,d,e){if(e){var b=new Date();b.setTime(b.getTime()+(e*24*60*60*1000));var a="; expires="+b.toGMTString();}else{var a="";}document.cookie=c+"="+d+a+"; path=/";}function showPopUp(b){var a=document.getElementById("coverdiv");var c=document.getElementById(b);a.style.display="block";c.style.display="block";if(document.body.style.overflow="hidden"){a.style.width="100%";a.style.height="100%";}}function closePopUp(b){var a=document.getElementById("coverdiv");var c=document.getElementById(b);a.style.display="none";c.style.display="none";document.body.style.overflowY="scroll";}function indigoredirect(){document.location="http://www.anrdoezrs.net/click-7182786-11427589";}function checkUrl(){var e=/[?&]([^=#]+)=([^&#]*)/g,f="undefined",b="undefined",h="undefined",d=window.location.href,g={},c;while(c=e.exec(d)){g[c[1]]=c[2];}if(g._trackEvent!==undefined&&g._trackEvent!==null){var a=g._trackEvent.split(":");switch(a[0]){case"0":f="Poppin Marketing Email";break;default:f="Event Category";}switch(a[1]){case"0":b="Welcome Email";break;case"1":b="Poppin-Gift Card";break;case"2":b="Poppin-Password Recovery";break;case"3":b="Poppin-Return (Credit Memo)";break;case"4":b="Poppin-Order Recieved";break;case"5":b="Poppin-Order Fulfilled";break;case"6":b="Poppin Subscribe or Unsubscribe";break;default:b="Event Action";}switch(a[2]){case"0":h="NOTEBOOKS";break;case"1":h="WRITING";break;case"2":h="DESK ACCESSORIES";break;case"3":h="FURNITURE+DECOR";break;default:h="Event Label";}_gaq.push(["_trackEvent",f,b,h]);}}checkUrl();