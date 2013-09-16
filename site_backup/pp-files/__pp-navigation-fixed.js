$j(function(){

user_agent = navigator.userAgent.toLowerCase();

	navfixtop = {
		scroll_top: null,
		scrolling: function(obj){
			$j(window).scroll(function (e) {
				if( $j(this).scrollTop() > navfixtop.scroll_top ){
					obj.addClass('fixed-nav');
					$j('.container-mini-cart').addClass('fixed-cart');
				}else if($j(this).scrollTop() < navfixtop.scroll_top){
					obj.removeClass('fixed-nav');
					$j('.container-mini-cart').removeClass('fixed-cart');
				}
			});
		}
	}

	/*if( user_agent.indexOf('safari/534') != '-1' ){
		
		$j('body').addClass('body-safari');
		
		var new_nav = $j('#nav').clone();
		
		$j(new_nav).addClass('safari-browser');
		$j('body').append(new_nav);
		
		navfixtop.scroll_top = $j('#nav').offset().top;
		navfixtop.scrolling($j('.safari-browser'));
		
		$j('.safari-browser').gpNavDrilldown();
		
	}else{
		
		//(ie7 bug here)
		if( $j.browser.msie && $j.browser.version == '7.0' ){
			
			var t = $j('#nav').position().top;
			navfixtop.scroll_top = t;
			
		}else{
			navfixtop.scroll_top = $j('#nav').offset().top;
		}
		
		
		navfixtop.scrolling($j('#nav'));
		
	}*/
	
	/*$j('.search-drilldown .input-search-submit').click(function(){
		var search_val = $j('.search-drilldown .input-search-drilldown').val();
		if(search_val != ''){
			$j('.table-global-search .input').val(search_val);
			$j('.table-global-search #go').click();
		}
		return false;
	});*/
	
	var flag_searchfix = 0;
	$j('#nav .top-nav li.search .src-btn').css({cursor: 'pointer'}).click(function(){
		
		if(flag_searchfix == 0){
			console.log(flag_searchfix);
			$j('#nav li.search .search-drilldown').css({display: 'block'});
			flag_searchfix = 1;
			return;
		}
		
		if(flag_searchfix == 1){
			console.log(flag_searchfix);
			$j('#nav li.search .search-drilldown').css({display: 'none'});
			flag_searchfix = 0;
			return;
		}
		
	});
});

//ERROR mozilla/5.0 (windows nt 6.1) applewebkit/534.52.7 (khtml, like gecko) version/5.1.2 safari/534.52.7
//ERROR mozilla/5.0 (windows nt 6.1; wow64) applewebkit/534.52.7 (khtml, like gecko) version/5.1.2 safari/534.52.7
//ERROR mozilla/5.0 (windows nt 6.1) applewebkit/534.50 (khtml, like gecko) version/5.1 safari/534.50

//ERROR mozilla/5.0 (macintosh; intel mac os x 10_6_8) applewebkit/534.57.2 (khtml, like gecko) version/5.1.7 safari/534.57.2

//OK mozilla/5.0 (iphone; cpu iphone os_5_1_1 like mac os x) applewebkit/534.46 (khtml, like gecko) version/5.1 mobile/9b208 safari/7534.48.3