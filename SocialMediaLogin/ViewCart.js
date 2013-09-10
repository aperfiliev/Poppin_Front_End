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
	function updateQtyField(itemid)
	{
		quantity = document.getElementById(itemid).value;

		if(quantity>=0 && quantity == parseInt(quantity)) {
			max_quantity = document.getElementById('max'+itemid).value;
			itemid = itemid.split('_')[1];
			var params = {orderitemid: itemid, quantity: quantity};
			sendAction('update', params);
		} else {
			$("#dialogresponse").html("Your quantity must be positive numeric value");
			$("#dialogresponse").dialog({ title: "Info" });
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
		if($("input.input-red, input.promoInput-red").size() > 0)
		{
			$("#dialogresponse").html("Some fields are filled incorrectly");
			$("#dialogresponse").dialog({ title: "Info" });
		}
		else
		{
			var checkoutUrl = document.getElementById('checkoutUrl');
			document.location.href = checkoutUrl.value;
		}
	}
	/*
	 * open Help pop-up
	 */
	function showHelp()
	{
		help = document.getElementById("div__help");
		help.setAttribute("style", "display:block");
		bg = document.getElementById("div__help_bg");
		bg.setAttribute("style", "display:block");
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
				
				if(code == "SUCCESS" || code == "ERR_WS_INVALID_COUPON")
				{
					document.getElementById('cartBody').innerHTML = '';
					buildCartItems(items);
				}
			}
			catch (ex)
			{
				alert(ex);
			}
		}
	}