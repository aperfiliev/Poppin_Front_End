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
		cell.align = "center";
		cell.width = "20%";
		cell.innerHTML = '<div class="listheadernosort">Item</div>';
		
		cell = row.insertCell(-1);
		cell.setAttribute("class", "smalltext");
		cell.align = "left";
		cell.width = "23%";
		cell.innerHTML = '<div class="listheadernosort">Description</div>';
		
		cell = row.insertCell(-1);
		cell.setAttribute("class", "smalltext");
		cell.align = "center";
		cell.width = "10%";
		cell.innerHTML = '<div class="listheadernosort">Price</div>';
		
		cell = row.insertCell(-1);
		cell.setAttribute("class", "smalltext");
		cell.align = "center";
		cell.width = "6%";
		cell.innerHTML = '<div class="listheadernosort">Qty</div>';
		
		cell = row.insertCell(-1);
		cell.setAttribute("class", "smalltext");
		cell.align = "center";
		cell.width = "10%";
		cell.innerHTML = '<div class="listheadernosort">Total</div>';
		
		cell = row.insertCell(-1);
		cell.setAttribute("class", "smalltext");
		cell.align = "center";
		cell.width = "1%";
		cell.setAttribute("style", "display: none");
		cell.innerHTML = '<div class="listheadernosort"></div>';
		
	}
	/*
	 * Dynamically build out the cart
	 */
	function buildCartItems(order) {

		if(order!=0 && order.totalfound!=0)
		{
			$("li.mini-cart > a").html(order.totalfound);
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
						order['items'][i].price_discounted, 
						order['items'][i].amount,
						order['items'][i].promotionamount,
						order['items'][i].isdropshipitem
					);
			}
			addEmptyRow(cartBody);
			
			buildOrderSummary(actionbar, order['summary'].subtotal, order['summary'].tax, order['summary'].shippingcost, order['summary'].discount, order['summary'].total);
			buildPromoCodeDiv(order.promocode);
			
			var checkoutUrl = document.getElementById('checkoutUrl');
			checkoutUrl.value = order.checkouturl;
			
			var continueUrl = document.getElementById('continueUrl');
			continueUrl.value = order.continueshoppingurl;
			
			$(".checkoutDiv").show();
			$(".promoCode").show();
			
		} else {
			$(".checkoutDiv").hide();
			$(".promoCode").hide();
			
			buildOrderSummary(actionbar, order['summary'].subtotal, order['summary'].tax, order['summary'].shippingcost, order['summary'].discount, order['summary'].total);
		}
	}
	/*
	 * Dynamically build out the item row
	 */
	function buildItemRow(table, num, storedisplaythumbnail, itemurl, name, quantity, quantityavailable, orderitemid, storedescription, rate_formatted, rate_discounted, amount_formatted, promotionamount, isdropshipitem)
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
		ctnt.setAttribute("onclick", "window.open(this.href,'_blank'); return false;");
		
		ctnt.innerHTML = name;
		cell.appendChild(ctnt);
		
		cell = row.insertCell(-1);
		cell.setAttribute("valign", "top");
		cell.setAttribute("align", "center");
		cell.setAttribute("class", "texttable");
		cell.setAttribute("style", "padding-top: 40px;");
		
		if(promotionamount) {
			cell.innerHTML = '<span class="titlespan"><span style="text-decoration: line-through;">' + formatPrice(rate_formatted) 
							+ '</span><br><span style="color:red">' 
							+ formatPrice(rate_discounted) + '</span></span>';
		} else {
			cell.innerHTML = '<span class="titlespan">' + formatPrice(rate_formatted) + '</span>';
		}
		
		cell = row.insertCell(-1);
		cell.setAttribute("valign", "top");
		cell.setAttribute("align", "center");
		cell.setAttribute("class", "texttable");
		cell.setAttribute("style", "padding-top: 38px;");
		var div = document.createElement("div");
		div.setAttribute("style", "position: relative;");
		
		var ctnt = document.createElement("input");
		ctnt.setAttribute("class", "input");
		ctnt.setAttribute("type", "text");
		ctnt.setAttribute("size", "6");
		ctnt.setAttribute("maxlength", "6");
		ctnt.setAttribute("value", quantity);
		ctnt.setAttribute("name", '_'+orderitemid);
		ctnt.setAttribute("id", '_'+orderitemid);

		if(isdropshipitem)
		{
			if(quantity>250)
			{
				ctnt.setAttribute("class", "input-red");
				error_msg = '<p>Your quantity must be</p><p> less or equal 250</p>';
			}
		}
		else if(quantityavailable < quantity)
		{
			var plus_one = quantityavailable +1;
			ctnt.setAttribute("class", "input-red");
			if(quantityavailable == 0){
				error_msg = '<p>This item is out of stock</p>';
			} else {
				error_msg = '<p>Your quantity must be</p><p> less than ' + plus_one + '</p>';
			}
		}
		div.appendChild(ctnt);
		var ctnt = document.createElement("input");
		ctnt.setAttribute("type", "hidden");
		ctnt.setAttribute("value", quantityavailable);
		ctnt.setAttribute("id", 'max_'+orderitemid);
		div.appendChild(ctnt);
		
		if(orderitemid != 0)
		{
			var ctnt = document.createElement("a");
			ctnt.setAttribute("href", "#");
			ctnt.setAttribute("id", "remove"+num);
			ctnt.setAttribute("class", "updateLink");
			ctnt.setAttribute("onclick", "updateQtyField('"+orderitemid+"')");
			ctnt.setAttribute("alt", "Click to update quantity");
			ctnt.innerHTML += 'Update';
			div.appendChild(ctnt);
			
			div.innerHTML += '<br>';
			var ctnt = document.createElement("a");
			ctnt.setAttribute("href", "#");
			ctnt.setAttribute("id", "remove"+num);
			ctnt.setAttribute("class", "removeLink");
			ctnt.setAttribute("onclick", "removeItem('_"+orderitemid+"')");
			ctnt.setAttribute("alt", "Click to remove item");
			ctnt.innerHTML += 'Remove';
			div.appendChild(ctnt);
			div.innerHTML += '<br>';
		}
		cell.appendChild(div);
		
		cell = row.insertCell(-1);
		cell.setAttribute("valign", "top");
		cell.setAttribute("align", "center");
		cell.setAttribute("class", "texttable");
		cell.setAttribute("style", "padding-top: 40px;");
		
		if(promotionamount) {
			cell.innerHTML = '<span class="titlespan">' + formatPrice(promotionamount) + '</span>';
		} else {
			cell.innerHTML = '<span class="titlespan">' + formatPrice(amount_formatted) + '</span>';
		}
		
		cell = row.insertCell(-1);
		cell.setAttribute("valign", "top");
		cell.setAttribute("class", "texttable");
		cell.setAttribute("style", "display: none");
		cell.innerHTML = "";
		
		if(error_msg != '')
		{
			powerTip.create('_'+orderitemid, error_msg, 'powerTip' + orderitemid, -52, 10);
			$('#' + '_' + orderitemid).on('focusin', function() { powerTip.hide('powerTip' + orderitemid); }) ;
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
		cell.setAttribute("style", "display: none");
		cell.innerHTML = "&nbsp;";
	}
	/*
	 * 
	 */
	function buildOrderSummary(table, subtotal, tax, shipping, discount, total)
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
		cell.setAttribute("class", "right");
		cell.innerHTML = subtotal;
		
		row = table.insertRow(-1);
		cell = row.insertCell(-1);
		cell.innerHTML = 'Shipping';
		cell = row.insertCell(-1);
		cell.setAttribute("class", "right");
		cell.innerHTML = shipping;
		
		row = table.insertRow(-1);
		cell = row.insertCell(-1);
		cell.innerHTML = 'Tax';
		cell = row.insertCell(-1);
		cell.setAttribute("class", "right");
		cell.innerHTML = tax;
		
		if(discount != '') {
			row = table.insertRow(-1);
			cell = row.insertCell(-1);
			cell.innerHTML = 'Discount';
			cell = row.insertCell(-1);
			cell.setAttribute("class", "right");
			cell.innerHTML = discount;
		}
		
		row = table.insertRow(-1);
		row.setAttribute("class", "totalRow");
		cell = row.insertCell(-1);
		cell.innerHTML = 'Total';
		cell = row.insertCell(-1);
		cell.setAttribute("class", "right");
		cell.innerHTML = total;
	}
	/*
	 * 
	 */
	function buildPromoCodeDiv(promocode)
	{
		var code = '';
		var description = '';
		var isvalid = 'N';
		
		if(promocode.isvalid != null)
		{
			isvalid = promocode.isvalid;
		}
		if(promocode.promocode != null)
		{
			code = promocode.promocode;
			description = promocode.description;
		}
		
		var promoCodeDiv = document.getElementById('promoCodeDiv');
		promoCodeDiv.innerHTML = '';
		
		var h3 = document.createElement("h3");
		h3.innerHTML = "Have a Promo Code?";
		promoCodeDiv.appendChild(h3);
		
		var span = document.createElement("span");
		span.innerHTML = "Enter your promotional code or coupon code below. Limit one per order please.";
		promoCodeDiv.appendChild(span);
		
		var div = document.createElement("div");
		div.setAttribute("style", "position: relative;");
		
		var ctnt = document.createElement("input");
		ctnt.setAttribute("class", "promoInput");
		ctnt.setAttribute("id", "promoInput");
		ctnt.setAttribute("type", "text");
		ctnt.setAttribute("value", code);
		ctnt.setAttribute("title", description);
		if(isvalid === 'F')
		{
			ctnt.setAttribute("class", "promoInput-red");
		}
		else if(code != '')
		{
			ctnt.setAttribute("style", "background: #8ACEDF;");
			ctnt.setAttribute("readonly", "");
		}
		div.appendChild(ctnt);
		
		if(isvalid === 'F' || isvalid === 'N')
		{
			var ctnt = document.createElement("input");
			ctnt.setAttribute("class", "promoApply");
			ctnt.setAttribute("type", "submit");
			ctnt.setAttribute("value", "Apply");
			ctnt.setAttribute("onclick", "applyPromo()");
			div.appendChild(ctnt);
		} else {
			var ctnt = document.createElement("input");
			ctnt.setAttribute("class", "promoRemove");
			ctnt.setAttribute("id", "removePromo");
			ctnt.setAttribute("type", "submit");
			ctnt.setAttribute("value", "Remove");
			ctnt.setAttribute("onclick", "removePromo()");
			div.appendChild(ctnt);
		}
		
		promoCodeDiv.appendChild(div);
		if(isvalid === 'F')
		{
			powerTip.create('promoInput', '<p>Gone are the days of humdrum</p><p>office products &#8211; and that promo code</p>',
					'powerTipPromo', -50, 40);
			$('#promoInput').on('focusin', function() { powerTip.hide('powerTipPromo'); }) ;
		}
	}
	/*
	 * Format price
	 */
	function formatPrice(price)
	{
		var tmp = price.split('$')[1].split('.');
		tmp[0] = tmp[0].replace(/(\d{1,2}?)((\d{3})+)$/, "$1,$2");
		
		if (tmp[1] == '00') {
			return '$' + tmp[0];
		} else {
			return '$' + tmp[0] + '.' + tmp[1];
		}
	}
	/*
	 * 
	 */
	function buildHelp(help)
	{
		var row, cell;
		
		if(help!=0 && help.length!=0)
		{
			for ( var i = 0; i < help.length; i++)
			{
				row = helpBody.insertRow(-1);
				row.setAttribute("valign", "top");
				
				cell = row.insertCell(-1);
				cell.setAttribute("class", "medtext solution");
				cell.align = "left";
				
				var h3 = document.createElement("h3");
				h3.setAttribute("class", "title");
				h3.innerHTML = help[i].title;
				cell.appendChild(h3);
				
				var div = document.createElement("div");
				div.setAttribute("class", "description dontShow loaded");
				div.setAttribute("style", "display: none;");
				div.innerHTML = '<p>' + help[i].description + '</p>';
				cell.appendChild(div);
			}
		}
		
		$('td.solution > .title').on('click', function(e) {
			e.preventDefault();
			var newclass = $(this).hasClass('active')?'title':'title active';
			$(this).attr('class',newclass);
			
			var content = $(this).next('div');
			if($(this).hasClass('active')) {
				content.slideDown('fast');
			} else {
				content.slideUp('slow');
			}
		});
	}
	