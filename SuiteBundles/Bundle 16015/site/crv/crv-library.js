/**
 * Description: SuiteCommerce Advanced Features (Customer Reviews)
 *
 * @copyright (c) 2000-2012, NetSuite Inc.
 * @author rtucat
*  @version 3.0
*/

var GPR_AAE_CRV = function($){
	 var objOptions = {
        saveFormURL: "",
	    itemId: "",	
	    saveId: "crv_save",
		formIframeId: "crv_save_iframe",
		formLinkId: "crv_save_link",
		starsWrapId: "crv_stars_wrap",
		ratingInputId: "custrecord_gpr_aae_crv_rating",
		anonymousText: "Your Identity is Anonymous",
		reviewerInputId: "custrecord_gpr_aae_crv_reviewer",
		maxReviewsCount: 5	
     }, strReviewerCnt = "";
	 
	 return {
	 	init: function(obj){
            if (obj !== null && obj !== undefined) {
                $.extend(objOptions, obj);
            }			
        },
		
		showForm: function(){
			if ($('#' + objOptions.formIframeId).is(':hidden')) {
		        $('#' + objOptions.formIframeId).slideDown(500);
		    }
		    else {
		        $('#' + objOptions.formIframeId).slideUp(500);
		    }
		},
		
		setFormURL: function(){
			var strURL = objOptions.saveFormURL + '&custrecord_gpr_aae_crv_itemid=' + objOptions.itemId + '&custrecord_gpr_aae_crv_customerid=' + GPR_OPTIONS.options().customerId + '&custrecord_gpr_aae_crv_sitenumber=' + GPR_OPTIONS.options().siteNumber + '&custrecord_gpr_aae_crv_state=3'; 
			var objIFrame = $('<iframe>');			
			objIFrame.attr({id: 'crv_save_iframe',name: 'crv_save_iframe', src: strURL, frameborder: '0', scrolling: 'no', marginwidth: '0', marginheight: '0', allowtransparency: 'yes'});
			//objIFrame.addClass('save-iframe');
			objIFrame.css('display', 'none');
			objIFrame.appendTo('#' + objOptions.saveId);	
		},
		
		setAnonymous: function(obj){
			var bolAnonymus = obj.checked;
		    var objNameInput = $("#" + objOptions.reviewerInputId);		    
		    if (bolAnonymus) {       
				strReviewerCnt = objNameInput.val();				
		        objNameInput.val(objOptions.anonymousText);
				objNameInput.attr({'class': 'input-disable', 'disabled': true});				
		    }
		    else {		
				objNameInput.val(strReviewerCnt);
				objNameInput.removeAttr('disabled');
		        objNameInput.attr('class', 'inputreq');
		        strReviewerCnt = "";
		    }
		},
		
		initRatingLinks: function (){
		    for (var i = 1; i <= objOptions.maxReviewsCount; i++) {		        
		        $("<a>").attr({
		            'title': "Rating " + i,
		            'href': "javascript:void(0);",
					'class': "stars",
					'id': i
		        }).click(function(e){
					var bolOk = true;
				    $("#" + objOptions.starsWrapId + ">a").each(function(i, val){
				        if (bolOk) {
				            $(val).attr('class', 'stars-selected');
				            if (val == e.target) {
				                $("#" + objOptions.ratingInputId).val(i + 1);
				                bolOk = false;
				            }
				        }
				        else {
				            $(val).attr('class', 'stars');
				        }
				    });					
				}).hover(function(e){
					var bolOk = true;
				    $("#" + objOptions.starsWrapId + ">a").each(function(i, val){
				        if (bolOk) {
				            $(val).attr('class', 'stars-hover');
				            if (val == e.target) {
				                bolOk = false;
				            }
				        }
				        else {
				            $(val).attr('class', 'stars');
				        }
				    });
				},function(){
					var bolOk = true;
				    $("#" + objOptions.starsWrapId + ">a").each(function(i, val){
				        if ($("#" + objOptions.ratingInputId).val() == i) {
				            bolOk = false;
				        }
				        if (bolOk) {
				            $(val).attr('class', 'stars-selected');
				        }
				        else {
				            $(val).attr('class', 'stars');
				        }
				    });
				}).appendTo("#" + objOptions.starsWrapId);
		    }
		} 
	 }	
}(jQuery);