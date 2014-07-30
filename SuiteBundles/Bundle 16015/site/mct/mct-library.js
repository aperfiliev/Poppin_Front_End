/**
 * Description: SuiteCommerce Advanced Features (Mini Cart)
 *
 * @copyright (c) 2000-2012, NetSuite Inc.
 * @author rtucat
 *  @version 2.0
 */

GPR_AAE_MCT = function($) {
	var objOptions = {
		itemsCntId : "mct_cnt_items",
		showInfoCntId : "mct_info",
		urlParamId : "_upditm",
		maxItems : 3,
		imagePos : 1,
		namePos : 2,
		qtyPos : 3,
		descriptionPos : 4,
		optionsPos : 5,
		pricePos : 6
	}, bolViewMore = false;

	function removeItem() {
		//Removes an item from the shopping cart.
		//Used only by the minicart remove buttons.
		//'this' references to the remove button
		$($(this).parents("li")[0]).find("input").val(0);
		updateCart();
	}

	function updateCart() {
		var arrUpdateItems = [];
		$('#' + objOptions.itemsCntId + ' input').each(function() {
			var arrItem = [];
			arrItem.push($(this).attr("id"));
			arrItem.push($(this).val());
			arrUpdateItems.push(arrItem);
		});
		$("#mct_updcart").remove();
		var objIframe = $('<iframe>');
		var strCartURL = GPR_OPTIONS.options().cartURL
		var strOption = "?";
		if (strCartURL.indexOf('?') != -1) {
			strOption = "&"
		}
		objIframe.attr("src", GPR_OPTIONS.options().cartURL + strOption + objOptions.urlParamId + "=" + escape(arrUpdateItems.join(';')));
		objIframe.attr("id", "mct_updcart");
		objIframe.css("display", "none");
		objIframe.appendTo("#div__header");
		objIframe.load(function() {
			window.location.reload();
		})
	}

	return {
		init : function(obj) {
			if (obj !== null && obj !== undefined) {
				$.extend(objOptions, obj);
			}
		},

		getItems : function() {
			$.ajax({
				url : GPR_OPTIONS.options().cartURL,
				type : "GET",
				success : function(data) {
					$('#' + objOptions.itemsCntId).empty().append($('<ul>').attr({
						'id' : 'mct_list',
						'class' : 'item-list'
					}));
					$(data).find("tr[id^=carttablerow]").each(function(i) {
						if (i > 4)//Always show up to 5 items
							return false;
						var li = $('<li>');
						li.attr('id', 'mct_list_item' + i).appendTo('#mct_list');
						$(".mct .cell_template").children().clone().appendTo(li);
						li.find(".cell-image").append($(this).children(':nth-child(' + objOptions.imagePos + ')').html());
						li.find(".cell-name").append($(this).children(':nth-child(' + objOptions.namePos + ')').html());
						li.find(".cell-price").append($(this).children(':nth-child(' + objOptions.pricePos + ')').html());
						li.find(".cell-qty").append($(this).children(':nth-child(' + objOptions.qtyPos + ')').html()).find("input").attr("readonly","readonly");
						li.find(".cell-options").append($(this).children(':nth-child(' + objOptions.optionsPos + ')').html());
						li.find(".remove-item").bind("click", removeItem);
					});
					var items = $('.mini-cart a:eq(0)').text();
					var items_text = "item";
					if (items > 1)
						items_text += "s";
					$(".mc-foot-content").css("text-align", "center").html('<a href="' + GPR_OPTIONS.options().cartURL + '">View Cart (' + items + ') ' + items_text + '</a>');
					$('#' + objOptions.itemsCntId).fadeIn(1000);
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
		},
		updateCart : function() {
			var strUpdateItems = unescape(GPR_OPTIONS.getUrlVar(objOptions.urlParamId));
			if (strUpdateItems !== "") {
				var arrUpdateItems = strUpdateItems.split(';');
				for (var i = 0; i < arrUpdateItems.length; i++) {
					var arrItem = arrUpdateItems[i].split(',');
					$('input#' + arrItem[0]).val(arrItem[1]);
				};
				$('form#cart').submit();
			}
		}
	}
}(jQuery);