
/**
 *	GENERIC: currency string value to float.
 */
function to_float(value){ return parseFloat(value.toString().replace(/,/g,'').replace(/^[^0-9\.]*/g,'').replace(/\D*?$/,'')); }

/**
 *	GENERIC: float value to currency.
 *	
 *	- amount			float 	- [mandatory] numerical value
 *	- decimals			integer - decimal PLACES to include in the currency (by default 2places)
 *	- symbol			string 	- currency symbol to use, by default its $
 *	- right				boolean - symbol is at the right side 
 *
 */
function to_currency(amount, decs, symbol, right){
	amount	= parseFloat(amount);
	decs	= (typeof decimals != 'undefined')? decimals : 2; 			/* decimal PLACES */
	symbol	= (typeof symbol != 'undefined')? symbol : '$'; 			
	var value = (Math.abs(amount) != Infinity && !isNaN(amount)?
		(amount > 0 && amount.toFixed)?
			amount.toFixed(decs)
			:Math.round(amount*Math.pow(10,decs))/Math.pow(10,decs)
		:0).toString();
	return (typeof right != 'undefined' && right)? value + symbol : symbol + value;
}

/**
 *	GENERIC: get the prices of the referred product.
 *	
 *	- saleSel			dom selector - [mandatory] reference the Sale Price wrapper 
 *	- regSel			dom selector - [mandatory] reference the Regular Price wrapper 
 *	
 *	Returns	object with attributes:
 *	- sale  			float - sale price value
 * 	- regular			float - regular price value
 *	- saves				float - saving difference
 *
 *	Usage:				var prices = get_prices('.pricing .ours span', '.pricing .reg span');
 *						var rate = parseInt(Math.round(prices.saves*100 / prices.sale));
 *						console.log(to_currency(prices.saving) + '('+rate+'%)');
 *
 */
function get_prices(saleSel, regSel){
	var sale, regular;
	$j(saleSel).each(function(){
		var table = $j(this).find('table');				/* check if sale value has a qty pricing table, get the first one */
		sale = to_float((table.length)? 
			(function(table){ 
				var firstPrice = table.find('tr .texttable:last-child').eq(0);
				return firstPrice.length? firstPrice.html() : '$0.00';
			})(table) 
			: $j(this).html());							/* if no table inside must be a simple price */	
	});
	regular = to_float($j(regSel).length? $j(regSel).html() : '$0.00');
	return { 	
		sale:sale, 
		regular:regular, 
		saving: (regular > sale)? regular-sale : 0.00 
	};
}
