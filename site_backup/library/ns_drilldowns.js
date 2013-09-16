/* Important!			requieres ns_helper_library.js */

/**
 *	Receives the srcObj from the left side and generates a nested lists menu 
 *
 *	Parameters:
 *		- srcObj 				OBJECT with the html, needs to exist - fist check
 *		- rowsSel 				identifier for the rows that hold significant data 
 * 
 *	restrictions:
 *		- colspans determine the indentation level
 */
function createListMenu(srcObj, rowsSel){

	if (srcObj.length){
		var topLevel = (function getMaxColspan(sel, parent){
			var colspan = 0;
			$j(sel,parent).each(function(){
					current = parseInt($j(this).attr('colspan'));
					colspan = (current > colspan)? current : colspan;
			})
			return colspan;
		})(rowsSel+ ' td',srcObj);
		
		if (topLevel <= 0) { return false;} 												/* no colspans: ABORT! */
		
		var topLi;
		var menu = father = $j('<ul>');														
		$j(rowsSel, srcObj).each(function(){
			var cell = $j('td:last', this);													/* last cells of left rows have the links */
			var level = parseInt(cell.attr('colspan'));										/* decreasing colspans reference indentation level */
			var li = $j('<li>').append($j('a', cell).clone().detach().removeAttr('class'));
		
			/* decide who is father (ignore same level siblings) */
			if (level < topLevel) 
				father = $j('<ul>').appendTo(topLi); 	
			else if (level > topLevel)
				father = father.parent().parent();											/* this is why cant't use "parent" for node name, IE crashes */
			
			li.appendTo(father);															/* append & preserve reference to current for next iteration */
			topLevel = level;
			topLi = li;
		});
		return menu;
	}
	else
		return false;																		/* no LEFT column found: ABORT! */
}



/**
 *	Calls the creation of nested lists drilldown menu and inserts where indicated 
 *
 *	receives:
 *		- srcObj			html code with the left column links
 *		- rowSel			selector to locate the left rows with links
 *		- target			selector for the wrapper where to append the menu ('place # before')
 *		- menuId			id for the new menu
 *
 *	example usage:			insertListMenu(Object_with_the_HTML_code,'.portletHandle tr','#where_it_goes','what_id_it_will_have');
 *
 */
function insertListMenu(srcObj, rowSel, target, menuId){
	if(srcObj){ 
        var menu = createListMenu(srcObj, rowSel);
        if(menu)
			$j(target).empty().append(menu.attr('id',menuId));
		else
			return false;																		/* no menu created: ABORT! */
    }
}

/**
 *	General: Formats the menu as requiered. WILL change with each specific site implementation.
 *
 *	receives:
 *		- target			selector for the wrapper where to append the menu ('place # before')
 *		- menuId			id for the new menu
 *		- currentTab		the exact name value for the current tab
 *
 *	example usage:			formatMenu('#menuwrap','menu','<%=getCurrentAttribute("site","currenttablabel","home")%>');
 *	note:					- calls done as above have to be included inside a NetSuite template or theme
 *
 */
/*  */
function formatMenu(target, menuId, currentTab){
	$j('#'+menuId+' > li > a', target).each(function(){ 
		$j(this).html('<span><span><span><span>'+$j(this).text()+'</span></span></span></span>') 
	});	

	/* if supplied set the current tab as active, compare names */
	if(typeof currentTab != 'undefined' && currentTab != null && currentTab){
		$j('#'+menuId+' > li', target).each(function(){
			if($j(this).find('> a').text().toLowerCase() == currentTab.toLowerCase())			
				$j(this).addClass('active'); 
		});
	}
}

