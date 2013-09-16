
/* Important!			requieres jQuery */

/**
 *	GENERIC: check functions
 * 	isNull - returns boolean true if function or method exist. Notice: for non existing vars if will abort!
 * 
 */
function isDef(x)	{ return (typeof x!=='undefined'); }
function isBool(x)	{ return (isDef(x) && typeof x==='boolean'); }
function isNull(x)	{ return (isDef(x) && x===null); }
function isEmpty(x)	{ return (!isNull(x) && x.toString().replace(/\s/gi,'')===''); }

/**
 *	GENERIC: receives a URL and a function to process the returned html 
 * 
 *	- url				url 				target page to retreive (must be on same domain !)
 *	- processor			function name 		receives the query and does something with it
 *
 */
function process_url(url, processor){
    $j.ajax({
		url: url,
		type: "GET",
		dataType: "html",
		success: function(msg){	processor(msg); },
		complete: function(XMLHttpRequest, textStatus) { },		
		beforeSend: function(XMLHttpRequest) { },
		error: function(XMLHttpRequest, textStatus, errorThrown) { }
	});
}


/**
 *	GENERIC: Remove img tags on response html text.
 *	
 */
function delete_img_tags(html){ return html.toString().replace(/\<img.+?\>/gi,""); }


/**
 *	GENERIC: Depurate HTML code.
 *	
 *	- cut html from start till </head> and from </body> to end 
 *	- remove scripts
 *	- remove iframes 
 *	- remove forms 
 *  - remove selects
 *  - remove options
 *
 * 	- kill_imgs 		boolean 		if true, also delete all img tags
 *
 */
function depurate_html(html, kill_imgs){ 	 
	var code = html.split('</head>')[1].split('</body>')[0].replace(/<body(?:\s+(?:.|\s)*?)?>/ig,'').replace(/(\<script)\s*[^\>]*\>([^\<]*\<\/script>)?/gi,'').replace(/(\<iframe)\s*[^\>]*\>([^\<]*\<\/iframe>)?/gi,'').replace(/(\<form)\s*[^\>]*\>([^\<]*\<\/form>)?/gi,'').replace(/(\<select)\s*[^\>]*\>([^\<]*\<\/select>)?/gi,'').replace(/<\/form>|<\/select>|<\/script>/gi,'').replace(/(\<option)\s*[^\>]*\>([^\<]*\<\/option>)?/gi,'');
	
	if(isDef(kill_imgs) && kill_imgs) { code = delete_img_tags(code); }
	return code;
}


/**
 *	GENERIC: get the specified element and return a jQuery object
 *	
 *	- html				html			content in html format
 *	- id				selector 		id of the element being queried for
 *
 */
function html_to_object(html, id){ return $j(depurateHTML(html)).find(id); }



/**
 *	GENERIC: tabs switcher
 *	
 *	- contents 			selector 		content class (for the tabs)
 *	- labels			selector 		labels class 
 *
 */
function tabs_switcher(contents, labels){
    var tabs = $j(contents); 
    var labels = $j(labels);
    tabs.hide();
    	labels.click(function(){
        tabs.hide();
        tabs.filter($j(this).find('a').attr('href')).show();
		labels.removeClass('active previous');		
        $j(this).addClass('active');	
		$j(this).prev().addClass('previous');
		return false;
    }).filter(':first').click();	
    if(tabs.length == 1) {tabs.addClass('first');} 
}

/**
 *	GENERIC: change default NetSuite search box 
 *	
 *	
 *	- wrapper		selector 		search wrapper:'#search_wrap'
 *	- label			selector 		default search label: 'td.smalltextnolink'
 *	- input			selector 		default search input box:'input.input'
 *	- button		selector 		default search button:'input#go'
 *	- strict		string			strict label for the input box.
 *
 *	usage: 			change_NS_search('#search_wrap', 'td.smalltextnolink', 'input.input', 'input#go', 'Enter keywords')
 *
 */
 function change_NS_search(wrapper, label, input, button, strict){
	var input 		= $j(input, wrapper);																		
	var button 		= $j(button, wrapper);
	var label  		= $j(label, wrapper).text();
	var it_label 	= (typeof strict != 'undefined')? strict : label;	
	
	$j(button).attr({value: label});
	
	$j(input).addClass('blur').attr({value: it_label}).focus(function(){ 
	 	$j(this).attr({value: ''}).removeClass('blur').addClass('focus');
	 	if ($j.browser.webkit)
	 		if(navigator.userAgent.match(/iPhone/i) || navigator.userAgent.match(/iPad/i) || navigator.userAgent.match(/iPod/i))
	 			$j(document).get(0).addEventListener('touchstart', function (event) { $j(input).blur(); }, false);
	})
	.blur(function (){	
		if($j(this).attr('value') == ''){ $j(this).attr({value: it_label}).removeClass('focus').addClass('blur');}
	})
	.keyup(function(event){	
		if (event.keyCode == 13){ $j(button).click(); }	
	});
}




/**
 *	GENERIC: Initialize an INPUT text field 
 *	
 *	- selector			selector 		input box
 *	- value 			string 			value to include on blur event
 */		
function init_input_textfield(selector, value){
	var field = $j(selector);
	if(field.length){
		field.focus(function(){	
			if($j(this).attr('value') == value)	
				$j(this).attr('value', ''); 
		})
		.blur(function(){	
			if($j(this).attr('value') == '')	
				$j(this).attr('value', value); 
			})
		.attr('value', value);
	}				 
}


/**
 *	item list: random sorting of n cell items from a pool of up to 50
 *	
 *	- source			source item list wrapper selector (cells have to appear inside this initially)
 *	- cell 				cells wrapper selector
 *	- target			target recipient selector
 *	- items 			maximum number of items to be displayed (top is 50)
 * 	- cols				maximum number of columns to be displayed (top is 50)
 *	- wrapper			wrapper selector in case it needs to be hidden (if not included it does not hide)
 *
 */
function random_cell_order(source, cell, target, items, cols, wrapper){
	var cells = $j(cell, source).clone();
	var count = cells.length > 50?50:cells.length; 														/* count cells */
	var n = isNaN(items)? count : items > count ? 4 : Math.abs(items);
	var c = isNaN(cols)? n : cols > n ? n : Math.abs(cols);

	/* have cells ? create disordered list of int values, use list to randomize the append of the cells into target */
	if(count > 1){	
		var disordered = (function listRand(min,max){ 
			var rand = new Array(); 
			for(var x=min; x<=max; x++) 
				rand.push(x); 
			return !isNull(jQuery.shuffle)? jQuery.shuffle(rand):rand;			
		})(0,count-1);																		
		for(var d=1; d < n; d++) 																	/* append n rand cells */
			$j(cells[disordered[d-1]]).addClass(d && !(d%c)?'lastCol':'').appendTo($j(target));			
			//$j(cells[disordered[d]]).appendTo($j(target)).addClass(!((d+1)%c)?'lastCol':'');		
		$j(source).remove();
	} else { 
		if(count < 1 && !isNull(wrapper)) 
			$j(wrapper).remove(); 
	}
}

/**
 *	check an unordered list of items emptyeting the empty ones, returns false if all empty 
 *	
 *	usage:			if(!check_lists_lines('.prod .data .specs', 'li', 'span')){
 *						$j('.prod .data .specs').remove();
 *						$j('.prod .reviewsBrief').addClass('shorterBrief');
 *					}
 *	
 */
function check_lists_lines(list, line, value, del){
	var list = $j(list);
    del = isBool(del) ? del : true;
    if(list.length){
        $j(line ,list).each(function(){ if($j(this).find(value+':empty').length && del) { $j(this).remove() }});
        return $j(line ,list).length ? true : (function(list){ if (del) {list.remove();} return false; })(list);						
    }
    return false; 
}


/**
 *	for an image element remove its source attribute NetSuite resize parameter 
 *	
 */
/*
function remove_NS_resize(img){
	if(isDef(img)){
		if(typeof img==="String" && (img.indexof('.') > -1 || img.indexof('#') > -1)) { img = $j(img); }

		img.each(function(){
			var src = $j(this).attr('src');
			if(isDef(src) && src.indexOf('resizeid=') > -1){
				$j(this).attr('src',src.split("resizeid=")[0]);	
			}
		});
	}
}
*/						//$j('.item-cell img').each(function(){remove_NS_resize($j(this))});
