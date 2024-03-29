/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       19 Aug 2013     sforostiuk
 *
 */
	var xmlhttp = new XMLHttpRequest();
	/*
	 * Updates single item quantity
	 */
	function updateQtyField(orderitemid)
	{
		var itemid = "_" + orderitemid;
		quantity = document.getElementById(itemid).value;

		if(quantity>=0 && quantity == parseInt(quantity)) {
			max_quantity = document.getElementById('max'+itemid).value;
			itemid = itemid.split('_')[1];
			var params = {orderitemid: itemid, quantity: quantity};
			sendAction('update', params);
		} else {
			var error_msg = "<p>Wait, how many do you want?</p><p>Better double-check that.</p>";
			
			powerTip.create('_'+orderitemid, error_msg, 'powerTip' + orderitemid, -52, 10);
			$j('#' + '_' + orderitemid).on('focusin', function() { powerTip.hide('powerTip' + orderitemid); }) ;
			$j('#' + '_' + orderitemid).attr('class','input-red');
		};
	}
	/*
	 * Add item to cart (click action in up-sell banner)
	 */
	function addItem(itemid)
	{
		var params = {netsuiteid: itemid, quantity: 1};
		sendAction('add', params);
	}
	/*
	 * remove single item
	 */
	function removeItem(itemid)
	{
		itemid = itemid.split('_')[1];
		var params = {orderitemid: itemid};
		sendAction('remove', params);
	}
	/*
	 * Apply Coupon Code
	 */
	function applyPromo()
	{
		code = document.getElementById("promoInput").value;
		var params = {promocode: code};
		sendAction('applyPromo', params);
	}
	/*
	 * Discard Coupon Code
	 */
	function removePromo()
	{
		var params = {};
		sendAction('removePromo', params);
	}
	/*
	 * Redirection to store
	 */
	function continueShopping()
	{
		var continueUrl = document.getElementById('continueUrl');
		document.location.href = continueUrl.value;
	}
	/*
	 * confirm checkout
	 */
	function checkout()
	{
		if($j("input.promoInput-red").size() > 0)
		{
			removePromo();
		}
		if($j("input.input-red").size() > 0)
		{
			$j("#dialogresponse").html("Some fields are filled incorrectly");
			$j("#dialogresponse").dialog({ title: "Info" });
			return false;
		}
		else
		{
			//var checkoutUrl = document.getElementById('checkoutUrl');
			//document.location.href = checkoutUrl.value;
			return true;
		}
	}
	/*
	 * open Help pop-up
	 */
	function showHelp()
	{
		var isPlaceOrderHelpBuilt = jQuery('#helpBody tr').length;
		if (isPlaceOrderHelpBuilt) {
    		help = document.getElementById("div__help");
    		help.setAttribute("style", "display:block");
    		bg = document.getElementById("div__help_bg");
    		bg.setAttribute("style", "display:block");
        } else {
        	loadHelpTopics();
        }
        
	}
	/*
	 * close Help pop-up
	 */
	function closeHelp()
	{
		help = document.getElementById("div__help");
		help.setAttribute("style", "display:none");
		bg = document.getElementById("div__help_bg");
		bg.setAttribute("style", "display:none");
	}
	/*
	 * AJAX call for any action
	 */
	function sendAction(method, params)
	{
		xmlhttp.onreadystatechange = handleServiceResponse;
		xmlhttp.open('post', 'ViewCartService.ss', true);
		xmlhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
		
		try
		{
			req = 'method='+method;
			for(var key in params) req += '&'+key+'='+params[key];
			xmlhttp.send(req);
		}
		catch (ex)
		{
			alert(ex);
		}
		document.body.style.cursor = 'wait';
	}
	/*
	 * Process result of AJAX call
	 */
	function handleServiceResponse()
	{
		if (xmlhttp.readyState == 4 && xmlhttp.status == 200)
		{
			document.body.style.cursor = 'default';
			try
			{
				var resp = JSON.parse(xmlhttp.responseText);
				var code = resp.header.status.code;
				var items = resp.result;
				items.message = resp.header.status.message;
				
				if(code == "SUCCESS" || code == "ERR_WS_INVALID_COUPON")
				{
					if(code == "ERR_WS_INVALID_COUPON")
					{
						items.promocode.isvalid = "F";
						items.promocode.promocode = resp.header.status.promocode;
						items.promocode.message = resp.header.status.message;
						items.promocode.description = resp.header.status.description;
						_gaq.push(['_trackEvent', 'Shopping Cart', 'Promocode error', resp.header.status.event]);
					}
					$j("#cartBody").html("");
					buildCartItems(items);
				}
			}
			catch (ex)
			{
				alert(ex);
			}
		}
	}