GPR_AAE_WLP.addCartItems = function(strWlpNumber){
	
var objOptions = {
        addCartItemsURL: "/app/site/hosting/scriptlet.nl?script=customscript_gpr_aae_ss_wlp_addcartitems&deploy=customdeploy_gpr_aae_ss_wlp_addcartitems",
        itemsCntId: "wlp_cnt_items",
        wishListRowClass: "wlp-item",
        addBtnCntId: "wlp_addbtn",
        addCartBtnCntId: "wlp_addcartbtn",
        loginLnkCntId: "wlp_loginlnk",
        showInfoCntId: "wlp_info",
        msgs: ["Item was added successfully.", "Item already added", "Invalid parameters sent, please contact the administrator...", "Wish List disable, please contact the administrator...", "Item was removed successfully.", "Items were cleared successfully.", "Unespected error, please contact the administrator...", "No Item Found", "No Items Found", "Items were added successfully.", "No items found in the Shopping Cart", "All Items already added"]
    };
	var strCartSSURL = "/checkout/services/cart.ss";
	
	function showPopUp(strMsg){
        GPR_PUP.show(strMsg);		
    }
    

	if (GPR_OPTIONS.options().customerId === "") {
		window.location.href = GPR_OPTIONS.options().loginURL + "&did_javascript_redirect=T&redirect_count=1";
	}
	else {
		jQuery.ajax({

			url : strCartSSURL,
	
			data: 'data={"method":"get"}',
	
			type : "POST",
	
			success : function(data) {
				
				var arrItems = data.result.items;
				var arrItemsAux = [];
				if (data.header.status.code == "SUCCESS") {   
					for (var i = 0; i < arrItems.length; i++) {
						arrItemsAux.push(arrItems[i].orderitemid);
					}
					var strParams = {
						sitenumber: GPR_OPTIONS.options().siteNumber,
						customerid: escape(GPR_OPTIONS.options().customerId),
						itemsid: escape(arrItems.join(";")),
						wlpnumber: strWlpNumber
					};
					jQuery.ajax({
						url: objOptions.addCartItemsURL + "&callback=?",
						type: "GET",
						dataType: "jsonp",
						data: strParams,
						success: function(json){
							if (json.Errors.length > 0) {
								jQuery.each(json.Errors, function(i, val){
									GPR_AJAX_TOOLS.showError(objOptions.showInfoCntId + "_save", 'Save Cart Items', val.code, val.details);
								});
							}
							else {
								GPR_AAE_WLP.getItems(strWlpNumber);
								showPopUp(objOptions.msgs[json.Results.msgcode]);                                        
							}
						},
						beforeSend: function(XMLHttpRequest){
							GPR_AJAX_TOOLS.startLoading(objOptions.showInfoCntId + "_save", 'Adding...');
						},
						complete: function(XMLHttpRequest, textStatus){
							GPR_AJAX_TOOLS.stopLoading(objOptions.showInfoCntId + "_save");
						},
						error: function(XMLHttpRequest, textStatus, errorThrown){
							GPR_AJAX_TOOLS.showError(objOptions.showInfoCntId + "_save", 'Add Items', textStatus, errorThrown);
						}
					});
				}
				else {
					showPopUp(objOptions.msgs[10]);
				}
	
			},
	
			beforeSend : function(XMLHttpRequest) {
	
				GPR_AJAX_TOOLS.startLoading(objOptions.showInfoCntId, 'Getting Cart Items...');
	
			},
	
			complete : function(XMLHttpRequest, textStatus) {
	
				GPR_AJAX_TOOLS.stopLoading(objOptions.showInfoCntId);
	
			},
	
			error : function(XMLHttpRequest, textStatus, errorThrown) {
	
				GPR_AJAX_TOOLS.showError(objOptions.showInfoCntId, 'Get Cart Items', textStatus, errorThrown);
	
			}
	
		});
	}
}