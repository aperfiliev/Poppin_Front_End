/**
 * Description: SuiteCommerce Advanced Features (Back In Stock Notification)
 *
 * @copyright (c) 2000-2012, NetSuite Inc.
 * @author rtucat
*  @version 2.0
*/

var GPR_AAE_BSN = function($){
	 var objOptions = {
	 	checkChildQtyURL: '/app/site/hosting/scriptlet.nl?script=customscript_gpr_aae_ss_bsn_chkchildqty&deploy=customdeploy_gpr_aae_ss_bsn_chkchildqty',
		checkQtyURL: '/app/site/hosting/scriptlet.nl?script=customscript_gpr_aae_ss_bsn_chkqty&deploy=customdeploy_gpr_aae_ss_bsn_chkqty',
		saveFormURL: '',
		showInfoCntId: 'bsn_info',
		formLinkId: 'bsn_save_link',
		formIframeId: 'bsn_save_iframe',
		containerId: 'bsn_save'
     };
	 
	 return {
	 	init: function(obj){
            if (obj !== null && obj !== undefined) {
                $.extend(objOptions, obj);
            }
        },
		
		setOptionsEvent: function(){
			$("select[id^='custcol']").change(function(){
					GPR_AAE_BSN.checkChildQty();
			});
		},
		
		checkQty: function(){
			$('#' + objOptions.formIframeId).hide();
			var objParams = {
				parentid: objOptions.itemId
			};
			$.ajax({
				url: objOptions.checkQtyURL,	      
				type: "GET",		
				dataType: "jsonp",
				data: objParams,
				success: function(data){
					if (data.Errors.length > 0) {  
						$.each(data.Errors, function(i, val){	
							GPR_AJAX_TOOLS.showError(objOptions.showInfoCntId, 'Check Stock', val.code, val.details);
							$('#' + objOptions.containerId).hide();		  		 			            
						});
					}else{												
						if(data.Results.matrix){
							GPR_AAE_BSN.setOptionsEvent();
						}else{
							if (data.Results.available) {
								$('#' + objOptions.containerId).hide();
							}else{
								$('#' + objOptions.formIframeId).attr('src', objOptions.saveFormURL + '&custrecord_gpr_aae_bsn_itemid=' + objOptions.itemId  + '&custrecord_gpr_aae_bsn_customerid=' + GPR_OPTIONS.options().customerId + '&custrecord_gpr_aae_bsn_sitenumber=' + GPR_OPTIONS.options().siteNumber);
		    					$('#' + objOptions.formLinkId).attr('href', objOptions.saveFormURL + '&custrecord_gpr_aae_bsn_itemid=' + objOptions.itemId  + '&custrecord_gpr_aae_bsn_customerid=' + GPR_OPTIONS.options().customerId + '&custrecord_gpr_aae_bsn_sitenumber=' + GPR_OPTIONS.options().siteNumber);
								$('#' + objOptions.containerId).show();
							}
						}					        
					}
				},
                beforeSend: function(XMLHttpRequest){
                    GPR_AJAX_TOOLS.startLoading(objOptions.showInfoCntId, 'Checking Stock...');
                },
                complete: function(XMLHttpRequest, textStatus){
                    GPR_AJAX_TOOLS.stopLoading(objOptions.showInfoCntId);
                },
                error: function(XMLHttpRequest, textStatus, errorThrown){
                    GPR_AJAX_TOOLS.showError(objOptions.showInfoCntId, 'Check Stock', textStatus, errorThrown);
                }		  
			});
		},
		
		checkChildQty: function(){
			$('#' + objOptions.formIframeId).hide();
			var arrItemOptions = [];
			var bolAllSelected = true;			
			$("select[id^='custcol'] option:selected").each(function(){		
				if ($(this).val() != ''){
					arrItemOptions.push($(this).text());
				}else{
					bolAllSelected = false;
				}
			});
			if (bolAllSelected){
				var strItemOptions ;
				var objParams = {
					parentid: objOptions.itemId,
					itemoptions: GPR_TOOLS.uncode(arrItemOptions.join('|'))
				};
				
				$.ajax({
					url: objOptions.checkChildQtyURL,	      
					type: "GET",		
					dataType: "jsonp",
					data: objParams,
					success: function(data){
						if (data.Errors.length > 0) {  
							$.each(data.Errors, function(i, val){	
								GPR_AJAX_TOOLS.showError(objOptions.showInfoCntId, 'Check Child Stock', val.code, val.details);
								$('#' + objOptions.containerId).hide();		  		 			            
							});
						}else{												
							if (data.Results.available) {
								$('#' + objOptions.containerId).hide();
							}else{
								$('#' + objOptions.formIframeId).attr('src', objOptions.saveFormURL + '&custrecord_gpr_aae_bsn_itemid=' + objOptions.itemId + '&custrecord_gpr_aae_bsn_childid=' + data.Results.childid + '&custrecord_gpr_aae_bsn_customerid=' + GPR_OPTIONS.options().customerId + '&custrecord_gpr_aae_bsn_sitenumber=' + GPR_OPTIONS.options().siteNumber);
		    					$('#' + objOptions.formLinkId).attr('href', objOptions.saveFormURL + '&custrecord_gpr_aae_bsn_itemid=' + objOptions.itemId + '&custrecord_gpr_aae_bsn_childid=' + objOptions.childid + '&custrecord_gpr_aae_bsn_customerid=' + GPR_OPTIONS.options().customerId + '&custrecord_gpr_aae_bsn_sitenumber=' + GPR_OPTIONS.options().siteNumber);
								$('#' + objOptions.containerId).show();
							}				        
						}
					},
                    beforeSend: function(XMLHttpRequest){
                        GPR_AJAX_TOOLS.startLoading(objOptions.showInfoCntId, 'Checking Child Stock...');
                    },
                    complete: function(XMLHttpRequest, textStatus){
                        GPR_AJAX_TOOLS.stopLoading(objOptions.showInfoCntId);
                    },
                    error: function(XMLHttpRequest, textStatus, errorThrown){
                        GPR_AJAX_TOOLS.showError(objOptions.showInfoCntId, 'Check Child Stock', textStatus, errorThrown);
                    }		  
				});
			}
		},
		
		showForm: function(){
			if ($('#' + objOptions.formIframeId).is(':hidden')) {
		        $('#' + objOptions.formIframeId).show();
		    }
		    else {
		        $('#' + objOptions.formIframeId).hide();
		    }
		}
	 }	
}(jQuery);

