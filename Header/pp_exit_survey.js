var EXITSURVEYSOCKET;

jQuery(document).ready(function(){
	//exit survey socket
	if(window.location.href.indexOf("checkout.sandbox.netsuite.com")!=-1){
		if( jQuery(".breadcrumbs").html().indexOf('Thanks')>-1){
			var exitsurveyqs = GPR_OPTIONS.options().cartURL;
			exitsurveyqs = exitsurveyqs.substring(exitsurveyqs.indexOf('?'), exitsurveyqs.length);
			EXITSURVEYSOCKET = new easyXDM.Socket({ 
				//xdm: easyXDM.noConflict("EXITSURVEYSOCKET"), 
				remote: "https://checkout.sandbox.netsuite.com/c.3363929/Poppin/SocialMediaLogin2/ExitSurvey.ssp"+exitsurveyqs,
				container: "exitsurveyplaceholder",
				onReady:function(){
					this.container.getElementsByTagName("iframe")[0].style.width= "440px";
					//this.container.getElementsByTagName("iframe")[0].style.height= "230px";
					$("#exitsurveyplaceholder iframe").on("load", function() { $(this).height($(this).contents().find("body").height());});
					//parse ordernumber
					var ordernum = $( "td:contains('Your confirmation number is')" ).text();
					ordernum = ordernum.substring(ordernum.lastIndexOf('Your confirmation number is ')+28,ordernum.length);
					ordernum = ordernum.substring(ordernum.indexOf('-')+1,ordernum.length);
					EXITSURVEYSOCKET.postMessage(ordernum);
				},
				onMessage: function(message, origin){
					if(message.indexOf('close')>-1){
						jQuery('#exitsurveyplaceholder').hide();
						jQuery('#coverdiv').hide();
					}
					else if(message.indexOf('show')>-1){
						jQuery('#exitsurveyplaceholder').show();
						jQuery('#coverdiv').show();
					}
					else if(message.indexOf('setHeight')>-1){
						//this.container.getElementsByTagName("iframe")[0].style.height= message.substring(message.indexOf(':')+1)+"px";
					}
					else if(message.indexOf('answerempty')>-1){
						alert(poppinres.text.exitsurveyempty);
					}
				}
			});
			//jQuery('#exitsurveyplaceholder').show();
		}
	}
});