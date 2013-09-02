/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       19 Aug 2013     sforostiuk
 *
 */

	/*
	 * Dynamically build out the cart header
	 */
	function buildCartHeader() {
		var thead = carttable.createTHead();
		var row, cell;
		
		row = thead.insertRow(-1);
		row.setAttribute("id", "carttableheader");
		
		cell = row.insertCell(-1);
		cell.setAttribute("class", "smalltext");
		cell.align = "left";
		cell.width = "20%";
		cell.innerHTML = '<div class="listheadercustom">ITEMS IN YOUR CART</div>';
		
		cell = row.insertCell(-1);
		cell.setAttribute("class", "smalltext");
		cell.align = "left";
		cell.width = "23%";
		cell.innerHTML = '<div class="listheadernosort">Item</div>';
		
		cell = row.insertCell(-1);
		cell.setAttribute("class", "smalltext");
		cell.align = "left";
		cell.width = "10%";
		cell.innerHTML = '<div class="listheadernosort">Price</div>';
		
		cell = row.insertCell(-1);
		cell.setAttribute("class", "smalltext");
		cell.align = "left";
		cell.width = "6%";
		cell.innerHTML = '<div class="listheadernosort">Quantity</div>';
		
		cell = row.insertCell(-1);
		cell.setAttribute("class", "smalltext");
		cell.align = "left";
		cell.width = "10%";
		cell.innerHTML = '<div class="listheadernosort">Total</div>';
		
		cell = row.insertCell(-1);
		cell.setAttribute("class", "smalltext");
		cell.align = "center";
		cell.width = "5%";
		cell.innerHTML = '<div class="listheadernosort"></div>';
		
	}
	/*
	 * Dynamically build out the cart
	 */
	function buildCartItems(order) {

		if(order!=0 && order.totalfound!=0)
		{
			// Insert table rows and cells into body
			for ( var i = 0; i < order['items'].length; i++) {
				buildItemRow(cartBody, i, 
						order['items'][i].storedisplaythumbnail, 
						order['items'][i].storeurl, 
						order['items'][i].name, 
						order['items'][i].quantity, 
						order['items'][i].quantityavailable, 
						order['items'][i].orderitemid, 
						order['items'][i].storedescription, 
						order['items'][i].price, 
						order['items'][i].amount
					);
			}
			addEmptyRow(cartBody);
			
			buildOrderSummary(actionbar, order['summary'].subtotal, order['summary'].tax, order['summary'].total);
			buildPromoCodeDiv(order.promocode);
			
			var checkoutUrl = document.getElementById('checkoutUrl');
			checkoutUrl.value = order.checkouturl;
			
			var continueUrl = document.getElementById('continueUrl');
			continueUrl.value = order.continueshoppingurl;
			
			$(".checkoutDiv").show();
			$(".promoCode").show();
			
			//showTips();
		} else {
			$(".checkoutDiv").hide();
			$(".promoCode").hide();
			
			buildOrderSummary(actionbar, order['summary'].subtotal, order['summary'].tax, order['summary'].total);
		}
	}
	/*
	 * 
	 */
	function showTips()
	{
		$(".input-red").powerTip('show');
		$(".promoInput-red").powerTip('show');
	}
	/*
	 * Dynamically build out the item row
	 */
	function buildItemRow(table, num, storedisplaythumbnail, itemurl, name, quantity, quantityavailable, orderitemid, storedescription, rate_formatted, amount_formatted)
	{
		var row, cell;
		var error_msg = '';
		row = table.insertRow(-1);
		row.setAttribute("id", "carttablerow"+num);
		
		cell = row.insertCell(-1);
		cell.setAttribute("valign", "top");
		cell.setAttribute("class", "texttablectr");
		if(storedisplaythumbnail != "")
		{
			var ctnt = document.createElement("img");
			ctnt.setAttribute("src", storedisplaythumbnail);
			ctnt.setAttribute("height", "120");
			ctnt.setAttribute("border", "0");
			cell.appendChild(ctnt);
		}
		
		cell = row.insertCell(-1);
		cell.setAttribute("valign", "top");
		cell.setAttribute("class", "texttable");
		cell.setAttribute("style", "padding-top: 40px;");
		var ctnt = document.createElement("a");
		ctnt.setAttribute("href", itemurl);
		ctnt.setAttribute("target", "_self");
		ctnt.setAttribute("class", "titlelink");
		ctnt.innerHTML = name;
		cell.appendChild(ctnt);
		cell.innerHTML += '<br><span class="titlespan">' + storedescription + '</span>';
		
		cell = row.insertCell(-1);
		cell.setAttribute("valign", "top");
		cell.setAttribute("class", "texttable");
		cell.setAttribute("style", "padding-top: 40px;");
		cell.innerHTML = '<span class="titlespan">' + formatPrice(rate_formatted) + '</span>';
		
		cell = row.insertCell(-1);
		cell.setAttribute("valign", "top");
		cell.setAttribute("class", "texttable");
		cell.setAttribute("style", "padding-top: 38px;");
		var ctnt = document.createElement("input");
		ctnt.setAttribute("class", "input");
		ctnt.setAttribute("type", "text");
		ctnt.setAttribute("size", "6");
		ctnt.setAttribute("maxlength", "6");
		ctnt.setAttribute("value", quantity);
		ctnt.setAttribute("name", '_'+orderitemid);
		ctnt.setAttribute("id", '_'+orderitemid);
		if(quantityavailable < quantity)
		{
			ctnt.setAttribute("class", "input-red");
			error_msg = '<p>Your quantity must be</p><p> less than ' + quantityavailable + '</p>';
		}
		cell.appendChild(ctnt);
		var ctnt = document.createElement("input");
		ctnt.setAttribute("type", "hidden");
		ctnt.setAttribute("value", quantityavailable);
		ctnt.setAttribute("id", 'max_'+orderitemid);
		cell.appendChild(ctnt);
		
		if(orderitemid != 0)
		{
			var ctnt = document.createElement("a");
			ctnt.setAttribute("href", "#");
			ctnt.setAttribute("id", "remove"+num);
			ctnt.setAttribute("class", "updateLink");
			ctnt.setAttribute("onclick", "updateQtyField('_"+orderitemid+"')");
			ctnt.setAttribute("alt", "Click to update quantity");
			ctnt.innerHTML += 'Update';
			cell.appendChild(ctnt);
			
			cell.innerHTML += '<br>';
			var ctnt = document.createElement("a");
			ctnt.setAttribute("href", "#");
			ctnt.setAttribute("id", "remove"+num);
			ctnt.setAttribute("class", "removeLink");
			ctnt.setAttribute("onclick", "removeItem('_"+orderitemid+"')");
			ctnt.setAttribute("alt", "Click to remove item");
			ctnt.innerHTML += 'Remove';
			cell.appendChild(ctnt);
			cell.innerHTML += '<br>';
		}
		
		cell = row.insertCell(-1);
		cell.setAttribute("valign", "top");
		cell.setAttribute("class", "texttable");
		cell.setAttribute("style", "padding-top: 40px;");
		cell.innerHTML = '<span class="titlespan">' + formatPrice(amount_formatted) + '</span>';
		
		cell = row.insertCell(-1);
		cell.setAttribute("valign", "top");
		cell.setAttribute("class", "texttable");
		cell.innerHTML = "";
		
		if(error_msg != '')
		{
			$('#'+'_'+orderitemid).data('powertip', error_msg);
			$('#'+'_'+orderitemid).powerTip({ placement: 'n', mouseOnToPopup: true });
		}
	}
	/*
	 * Build Total/Tax/Subtotal rows
	 */
	function addEmptyRow(table)
	{
		var row, cell;
		row = table.insertRow(-1);
		row.setAttribute("style", "display: none;");
		
		cell = row.insertCell(-1);
		cell.setAttribute("class", "texttable");
		cell.innerHTML = "&nbsp;";
		
		cell = row.insertCell(-1);
		cell.setAttribute("class", "texttable");
		cell.innerHTML = "&nbsp;";
		
		cell = row.insertCell(-1);
		cell.setAttribute("class", "texttable");
		cell.innerHTML = "&nbsp;";
		
		cell = row.insertCell(-1);
		cell.setAttribute("class", "texttable");
		cell.innerHTML = "&nbsp;";
		
		cell = row.insertCell(-1);
		cell.setAttribute("class", "texttable");
		cell.innerHTML = "&nbsp;";
		
		cell = row.insertCell(-1);
		cell.setAttribute("class", "texttable");
		cell.innerHTML = "&nbsp;";
	}
	/*
	 * 
	 */
	function buildOrderSummary(table, subtotal, tax, total)
	{
		table.innerHTML = '';
		
		var row, cell;
		row = table.insertRow(-1);
		
		cell = row.insertCell(-1);
		cell.setAttribute("colspan", "2");
		cell.innerHTML = '<h3>Order Summary</h3>';
		
		row = table.insertRow(-1);
		cell = row.insertCell(-1);
		cell.innerHTML = 'Subtotal';
		cell = row.insertCell(-1);
		cell.innerHTML = subtotal;
		
		row = table.insertRow(-1);
		cell = row.insertCell(-1);
		cell.innerHTML = 'Shipping';
		cell = row.insertCell(-1);
		cell.innerHTML = '$0.00';
		
		row = table.insertRow(-1);
		cell = row.insertCell(-1);
		cell.innerHTML = 'Tax';
		cell = row.insertCell(-1);
		cell.innerHTML = tax;
		
		row = table.insertRow(-1);
		row.setAttribute("class", "totalRow");
		cell = row.insertCell(-1);
		cell.innerHTML = 'Total';
		cell = row.insertCell(-1);
		cell.innerHTML = total;
	}
	/*
	 * 
	 */
	function buildPromoCodeDiv(promocode)
	{
		var code = '';
		var isvalid = 'N';
		
		if(promocode.isvalid != null)
		{
			isvalid = promocode.isvalid;
		}
		if(promocode.promocode != null)
		{
			code = promocode.promocode;
		}
		
		var promoCodeDiv = document.getElementById('promoCodeDiv');
		promoCodeDiv.innerHTML = '';
		
		var h3 = document.createElement("h3");
		h3.innerHTML = "Have a Promo Code?";
		promoCodeDiv.appendChild(h3);
		
		var span = document.createElement("span");
		span.innerHTML = "Enter your promotional code or coupon code below. Limit one per customer please.";
		promoCodeDiv.appendChild(span);
		
		var div = document.createElement("div");
		
		var ctnt = document.createElement("input");
		ctnt.setAttribute("class", "promoInput");
		ctnt.setAttribute("id", "promoInput");
		ctnt.setAttribute("type", "text");
		ctnt.setAttribute("value", code);
		if(isvalid === 'F')
		{
			ctnt.setAttribute("class", "promoInput-red");
		}
		div.appendChild(ctnt);
		
		if(code == '')
		{
			var ctnt = document.createElement("input");
			ctnt.setAttribute("class", "promoApply");
			ctnt.setAttribute("type", "submit");
			ctnt.setAttribute("value", "Apply");
			ctnt.setAttribute("onclick", "applyPromo()");
			div.appendChild(ctnt);
		}
		
		if(code != '')
		{
			var ctnt = document.createElement("input");
			ctnt.setAttribute("class", "promoApply");
			ctnt.setAttribute("id", "removePromo");
			ctnt.setAttribute("type", "submit");
			ctnt.setAttribute("value", "Remove");
			ctnt.setAttribute("onclick", "removePromo()");
			div.appendChild(ctnt);
		}
		
		promoCodeDiv.appendChild(div);
		if(isvalid === 'F')
		{
			$('#promoInput').data('powertip', '<p>Invalid code</p>');
			$('#promoInput').powerTip({ placement: 'n', mouseOnToPopup: true });
		}
	}
	/*
	 * Format price
	 */
	function formatPrice(price)
	{
		var tmp = price.split('$')[1].split('.');
		
		if (tmp[1] == '00') {
			return '$' + tmp[0];
		} else {
			return price;
		}
	}