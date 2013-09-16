$j(function(){
	
	//
	//Config vars
	//
	
	//Numbers of columns by layout
	var cat_collumns_count = 			3;
	var item_collumns_count = 			3;
	var home_item_collumns_count = 		5;
	var related_item_collumns_count = 	2;
	
	//td class object for cell templates
	var cat_cell_td_obj = 				$j('.td-cat-cell');
	var item_cell_td_obj = 				$j('.td-item-cell');
	var home_cell_td_obj = 				$j('.td-home-cell');
	var related_cell_td_obj = 			$j('.td-related-cell');
	
	//table left navigation element
	var portlet_left_nav_table_obj = 	$j('.table-left-nav');
	
	//table search element
	var table_global_search_obj = 		$j('.table-global-search');
	
	//Text in search field
	var global_search_text = 			'SEARCH AND YOU WILL FIND...';
	
	//Text in search button
	var global_search_btn_text = 		'';
	
	//Pagination destination element (recomended <div class="toolbal"></div>)
	var item_cat_cust_pag_wrap = 		$j('.toolbal'); 
	
	//Pagination left and right images (values required: url, width and height)
	var item_cat_cust_pag_left_img =	new Array('/site/pp-templates/pag-left.gif', 11, 16);
	var item_cat_cust_page_right_img =	new Array('/site/pp-templates/pag-right.gif', 11, 16);
	
	//Login / logout class object (required var log_mail in head sectin)
	var login_obj = 					$j('#header .login');
	var logout_obj = 					$j('#header .logout');
	
	//Breadcrumb wrap object
	var breadcrum_edit =				true;
	var breadcrumb_container = 			$j('.breadcrumbs');
	var breadcrumb_separation =			' / ';
	
	//
	//End config vars
	//
	
	//Site
	$j('#outerwrapper, #innerwrapper, #div__body').attr({style: ''});
	
	//Exteranl links
	$j('.external').each(function(){
		$j(this).attr({target: '_blank'});
	});
	
	//Category / Item List
	$j(cat_cell_td_obj).each(function(i){
		i++;
		if(i%cat_collumns_count == 0){
			$j(this).addClass('td-last');
		}
		$j(this).hover(function(){
			$j(this).addClass('over');
		}, function(){
			$j(this).removeClass('over');
		});
	});
	
	$j(item_cell_td_obj).each(function(i){
		i++;
		if(i%item_collumns_count == 0){
			$j(this).addClass('td-last');
		}
		$j(this).hover(function(){
			$j(this).addClass('over');
		}, function(){
			$j(this).removeClass('over');
		});
	});
	
	$j(home_cell_td_obj).each(function(i){
		i++;
		if(i%home_item_collumns_count == 0){
			$j(this).addClass('td-last');
		}
		$j(this).hover(function(){
			$j(this).addClass('over');
		}, function(){
			$j(this).removeClass('over');
		});
	});
	
	$j(related_cell_td_obj).each(function(i){
		i++;
		if(i%related_item_collumns_count == 0){
			$j(this).addClass('td-last');
		}
		$j(this).hover(function(){
			$j(this).addClass('over');
		}, function(){
			$j(this).removeClass('over');
		});
	});
	
	//Left
	$j(portlet_left_nav_table_obj).each(function(){
		$j('table', this).addClass('table-group').attr({
			cellspacing: 0,
			cellpadding: 0,
			border: 0,
			width: '100%'
		});
	});
	
	$j('.table-group', portlet_left_nav_table_obj).each(function(){
		$j('tr', this).addClass('tr-item');
	});
	
	$j('.tr-item', portlet_left_nav_table_obj).each(function(){
		//var tds_count = $j('td', this).size();
		
		var tds_colspan_count = $j('td:first', this).attr('colspan');
		
		if(!tds_colspan_count){
			tds_colspan_count = 0;
		}
		
		//$j(this).addClass('level'+(tds_count-1));
		var class_level_name = 'level'+(parseInt(tds_colspan_count)+1);
		$j(this).addClass(class_level_name);
		
		//(ie7 bug here)
		if( $j.browser.msie && $j.browser.version == '7.0' ){
			
			$j('td', this).removeAttr( 'style' );
			$j('td', this).removeAttr( 'width' );
			
			var tds_length = $j('td', this).length;
			
			$j('td', this).each(function(i){
				if((i+1) < tds_length){
					$j(this).remove();
				}
			});
			
		}else{
			$j('td', this).attr({
				style: '',
				width: '',
				align: '',
				colspan: ''
			}).not(':last').remove();
		}
		
		$j('.smalltext', this).removeClass();
		$j('.textboldnolink', this).removeClass().addClass('active');
		
	});
	
	//Search
	var global_search_btn_go 		= $j('input#go', table_global_search_obj);
	var global_search_txt_field 	= $j('input.input', table_global_search_obj);
	
	$j(global_search_btn_go).attr({value: global_search_btn_text});
	
	$j(global_search_txt_field).addClass('focus-out').attr({value: global_search_text}).focus(function(){ 
		
		$j(this).attr({value: ''}).removeClass('focus-out').addClass('focus-in');
		
		if ($j.browser.webkit) {
			if(navigator.userAgent.match(/iPhone/i) || navigator.userAgent.match(/iPad/i) || navigator.userAgent.match(/iPod/i)){
				
				$j(document).get(0).addEventListener('touchstart', function (event) {
					$j(global_search_txt_field).blur();
				}, false);
				
			}
		}
		
	}).blur(function (){
		if($j(this).attr('value') == ''){
			$j(this).attr({value: global_search_text}).removeClass('focus-in').addClass('focus-out');
		}
	}).keyup(function(event){
		if (event.keyCode == 13){
			$j(global_search_btn_go).click();
		}
	});
	
	//Pagination
	if($j('.gp_custom_pagination').length > 0 && $j(item_cat_cust_pag_wrap).length > 0){
		$j('.gp_custom_pagination').parent().addClass('page-txt');
		$j('.gp_custom_pagination').parent().parent().parent().parent().addClass('gp_table_pagination');
		var newPagination = $j('.gp_table_pagination').html();
		var newPaginationText = $j(newPagination).find('.gp_custom_pagination');
		
		//Destination element
		$j(item_cat_cust_pag_wrap).append('<div class="new-pag-wrap"><div class="left-data"><table class="gp_new_pagination">'+newPagination+'</table></div><div class="right-data"></div></div>');
		
		$j(item_cat_cust_pag_wrap).find('.right-data').html(newPaginationText);
		$j(item_cat_cust_pag_wrap).find('.page-txt').html('Page')
		
		if(item_cat_cust_pag_left_img != '' && item_cat_cust_page_right_img != ''){
			$j('.gp_new_pagination img').each(function(i){
				$j(this).addClass('image'+i);
			});
			
			$j('.gp_new_pagination img').parent('a').addClass('page-img-link');
			
			$j('.gp_new_pagination .image0, .gp_new_pagination .image2').attr({
				'src': item_cat_cust_pag_left_img[0],
				'width': item_cat_cust_pag_left_img[1],
				'height': item_cat_cust_pag_left_img[2]
			});
			
			$j('.gp_new_pagination .image1, .gp_new_pagination .image3').attr({
				'src': item_cat_cust_page_right_img[0],
				'width': item_cat_cust_page_right_img[1],
				'height': item_cat_cust_page_right_img[2]
			});
		}
		
	}
	
	//Login Logout
	if($j(login_obj).length > 0 && $j(logout_obj).length > 0){
		if(log_mail){
			$j(login_obj).addClass('hidden');
			$j(logout_obj).removeClass('hidden');
		}
	}
	
	//Breadcrums
	if(breadcrum_edit){
		if(breadcrumb_container.length > 0){
			var brd = breadcrumb_container.html();
			brd = brd.replace(/&nbsp;&gt;&nbsp;/gi, breadcrumb_separation);
			breadcrumb_container.html(brd);	
		}
	}
	
});