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

		$("li.mini-cart > a").html(order.totalfound);
		if(order!=0 && order.totalfound!=0)
		{
			// Insert table rows and cells into body
			for ( var i = 0; i < order['items'].length; i++) {
				buildItemRow(cartBody, i, order['items'][i]);
			}
			addEmptyRow(cartBody);
			
			buildOrderSummary(order['summary'].subtotal, order['summary'].tax, order['summary'].shippingcost, order['summary'].discount, order['summary'].total);
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
			
			buildOrderSummary(order['summary'].subtotal, order['summary'].tax, order['summary'].shippingcost, order['summary'].discount, order['summary'].total);
		}
	}
	/*
	 * Dynamically build out the item row
	 */
	function buildItemRow(table, num, order)
	{
		var row, cell;
		var error_msg = '';
		row = table.insertRow(-1);
		row.setAttribute("id", "carttablerow"+num);
		
		cell = row.insertCell(-1);
		cell.setAttribute("valign", "top");
		cell.setAttribute("class", "texttablectr");
		if(order.storedisplaythumbnail != "")
		{

			var ctnt = document.createElement("img");
			ctnt.setAttribute("src", order.storedisplaythumbnail);
			ctnt.setAttribute("style", "height:120px; width: auto;");
//ctnt.setAttribute("width", "120");
			ctnt.setAttribute("border", "0");
			cell.appendChild(ctnt);
		}
		
		cell = row.insertCell(-1);
		cell.setAttribute("valign", "top");
		cell.setAttribute("class", "texttable");
		cell.setAttribute("style", "padding-top: 40px;");
		var ctnt = document.createElement("a");
		ctnt.setAttribute("href", order.storeurl);
		ctnt.setAttribute("target", "_self");
		ctnt.setAttribute("class", "titlelink");
		ctnt.setAttribute("onclick", "window.open(this.href,'_blank'); return false;");
		
		ctnt.innerHTML = order.name;
		cell.appendChild(ctnt);
		
		cell = row.insertCell(-1);
		cell.setAttribute("valign", "top");
		cell.setAttribute("align", "center");
		cell.setAttribute("class", "texttable");
		cell.setAttribute("style", "padding-top: 40px;");
		
		if(order.promotionamount) {
			cell.innerHTML = '<span class="titlespan"><span style="text-decoration: line-through;">' + formatPrice(order.price) 
							+ '</span><br><span style="color:red">' 
							+ formatPrice(order.price_discounted) + '</span></span>';
		} else {
			cell.innerHTML = '<span class="titlespan">' + formatPrice(order.price) + '</span>';
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
		ctnt.setAttribute("value", order.quantity);
		ctnt.setAttribute("name", '_'+order.orderitemid);
		ctnt.setAttribute("id", '_'+order.orderitemid);
		if(order.itemtype === 'giftcert'){
			ctnt.setAttribute("disabled", "disabled");
			ctnt.setAttribute("style", "border:0;");
			
		}

		if(order.isdropshipitem)
		{
			if(order.quantity>250)
			{
				ctnt.setAttribute("class", "input-red");
				error_msg = '<p>Your quantity must be</p><p> less or equal 250</p>';
			}
		}
		else if(order.itemtype !=='giftcert' && order.quantityavailable < order.quantity)
		{
			var plus_one = order.quantityavailable +1;
			ctnt.setAttribute("class", "input-red");
			if(order.quantityavailable == 0){
				error_msg = '<p>This item is out of stock</p>';
			} else {
				error_msg = '<p>Your quantity must be</p><p> less than ' + plus_one + '</p>';
			}
		}
		div.appendChild(ctnt);
		var ctnt = document.createElement("input");
		ctnt.setAttribute("type", "hidden");
		ctnt.setAttribute("value", order.quantityavailable);
		ctnt.setAttribute("id", 'max_'+order.orderitemid);
		div.appendChild(ctnt);
		
		if(order.orderitemid != 0)
		{
			if(order.itemtype !=='giftcert'){
				var ctnt = document.createElement("a");
				ctnt.setAttribute("href", "#");
				ctnt.setAttribute("id", "remove"+num);
				ctnt.setAttribute("class", "updateLink");
				ctnt.setAttribute("onclick", "updateQtyField('"+order.orderitemid+"')");
				ctnt.setAttribute("alt", "Click to update quantity");
				ctnt.innerHTML += 'Update';
				div.appendChild(ctnt);
				div.innerHTML += '<br>';
			}
			var ctnt = document.createElement("a");
			ctnt.setAttribute("href", "#");
			ctnt.setAttribute("id", "remove"+num);
			ctnt.setAttribute("class", "removeLink");
			ctnt.setAttribute("onclick", "removeItem('_"+order.orderitemid+"')");
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
		
		if(order.promotionamount) {
			cell.innerHTML = '<span class="titlespan">' + formatPrice(order.promotionamount) + '</span>';
		} else {
			cell.innerHTML = '<span class="titlespan">' + formatPrice(order.amount) + '</span>';
		}
		
		cell = row.insertCell(-1);
		cell.setAttribute("valign", "top");
		cell.setAttribute("class", "texttable");
		cell.setAttribute("style", "display: none");
		cell.innerHTML = "";
		
		if(error_msg != '')
		{
			powerTip.create('_'+order.orderitemid, error_msg, 'powerTip' + order.orderitemid, -52, 10);
			$('#' + '_' + order.orderitemid).on('focusin', function() { powerTip.hide('powerTip' + order.orderitemid); }) ;
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
	function buildOrderSummary(subtotal, tax, shipping, discount, total)
	{
		$("#actionbar").html("");
		tbody = document.getElementById('actionbar');
		
		var row, cell;
		row = tbody.insertRow(-1);
		
		cell = row.insertCell(-1);
		cell.setAttribute("colspan", "2");
		cell.innerHTML = '<h3>Order Summary</h3>';
		
		row = tbody.insertRow(-1);
		cell = row.insertCell(-1);
		cell.innerHTML = 'Subtotal';
		cell = row.insertCell(-1);
		cell.setAttribute("class", "right");
		cell.innerHTML = subtotal;
		
		row = tbody.insertRow(-1);
		cell = row.insertCell(-1);
		cell.innerHTML = 'Shipping';
		cell = row.insertCell(-1);
		cell.setAttribute("class", "right");
		cell.innerHTML = shipping;
		
		row = tbody.insertRow(-1);
		cell = row.insertCell(-1);
		cell.innerHTML = 'Tax';
		cell = row.insertCell(-1);
		cell.setAttribute("class", "right");
		cell.innerHTML = tax;
		
		if(discount != '') {
			row = tbody.insertRow(-1);
			cell = row.insertCell(-1);
			cell.innerHTML = 'Discount';
			cell = row.insertCell(-1);
			cell.setAttribute("class", "right");
			cell.innerHTML = discount;
		}
		
		row = tbody.insertRow(-1);
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
			if(isvalid === 'F' && promocode.message === undefined )
				promocode.message = "<p>In order for your code to work, you need </p><p>to add more Poppin products to your cart.</p>";
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
		//ctnt.setAttribute("title", description);
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
			powerTip.create('promoInput', promocode.message,
					'powerTipPromo', -50, 40);
			$('#promoInput').on('focusin', function() { powerTip.hide('powerTipPromo'); }) ;
		}
		if(description != '')
		{
			div = document.createElement("div");
			div.setAttribute("class", "promoLink");
			div.innerHTML = "Promo details";	// Promo details text
			promoCodeDiv.appendChild(div);
			
			div = document.createElement("div");
			div.setAttribute("class", "promoDescription");
			div.setAttribute("style", "display: none;");
			div.innerHTML = description;
			promoCodeDiv.appendChild(div);
			
			$('.promoLink').hover(
					function() { $('.promoDescription').css('display', 'block'); },
					function() { $('.promoDescription').css('display', 'none'); });

			/*$('#promoInput').hover(
					function() { powerTip.create('promoInput', '<p>'+description+'</p>', 'powerDiv', -28, 40); },
					function() { powerTip.hide('powerDiv');});*/
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
	