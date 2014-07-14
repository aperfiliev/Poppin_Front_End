(function($) {
	//Tabs
	$j.fn.gpTabs = function(options){
		var settings = $j.extend({
			active:	true
		}, options);
	
		var options = $j.extend(settings, options);
	
		return this.each(function(){

			var tabs_container = $j(this);
			var tabs_nav = $j('.tabs-nav li a', tabs_container);
			var tabs_content = $j('.tabs-content', tabs_container);
			
			$j(tabs_content).each(function(i){
				if($j(this).html().length == 0){
					$j(this).remove();
					$j(tabs_nav.get(i)).parent().remove();
				}
			});
			
			$j(tabs_content).hide().filter(':first').show();
			
			$j(tabs_nav).click(function () {
				$j(tabs_content).hide().filter(this.hash).show();
				$j(tabs_nav).parent().removeClass('active');
				$j(this).parent().addClass('active');
		
				return false;
				
			}).filter(':first').click();
			
		});
	}
	
	//Navigation Drilldown
	$j.fn.gpNavDrilldown = function(options){
		var settings = $j.extend({
			active:	true
		}, options);
	
		var options = $j.extend(settings, options);
	
		return this.each(function(){

			$j('li', this).hover(function(){
				$j(this).addClass('over');
			}, function(){
				$j(this).removeClass('over');
			});
			
			if ($j.browser.webkit) {
				if(navigator.userAgent.match(/iPhone/i) || navigator.userAgent.match(/iPad/i) || navigator.userAgent.match(/iPod/i)){
					
					$j('li', this).each(function(){

						$j(this).get(0).addEventListener('touchstart', function (event) {
							$j(document).get(0).addEventListener('touchstart', function (event) {});
						}, false);

					});

				}
			}
			
		});
	}
	
	//Item list horizontal
	$j.fn.gpItemListCarousel = function(options){
		var settings = $j.extend({
			active:	true,
			controls: true,
			table_wrap: $j(),
			tr_wrap: $j(),
			tr_first_row: $j(),
			controls_wrap: $j(),
			controls_left: $j(),
			controls_right: $j(),
			product_list_wrap: $j(),
			addto_wrap: '.addto'
		}, options);
	
		var options = $j.extend(settings, options);
		
		var td_collection = this;
		
		//
		//Initialize
		//
		function _initialize() {
			if($j(td_collection).length > 1){
				_start();
			}
			return false;
		}
		
		//
		//Star Plugin
		//
		function _start() {
			
			_prepareHTML();
			
		}
		
		//
		//Prepare HTML and set jQuery Objects
		//
		function _prepareHTML(){

			$j.each(td_collection, function(i){
				$j(this).parent().addClass('tr-wrap');
				if(i == 0){
					$j(this).parent().addClass('tr-first-row');
				}
			});
			
			$j(td_collection).closest('table').addClass('gpc-table-wrap');
			
			settings.table_wrap 	= $j(td_collection).closest('table.gpc-table-wrap');
			settings.tr_wrap 		= $j('.tr-wrap', settings.table_wrap);
			settings.tr_first_row 	= $j('.tr-first-row', settings.table_wrap);
			
			_moveElements();
			
			/*$j(settings.td_cell).parent().addClass('tr-wrap');
			$j(settings.td_cell).first().parent().addClass('tr-first-row');*/
			
			
			
		}
		
		//
		//Move cells and remove rest elements
		//
		function _moveElements(){
			
			$j(td_collection).each(function(){
				
				var addto_form 		= $j(this).parent('form');
				var addto 			= $j(settings.addto_wrap, this);
				var parent_wrap 	= $j(addto).parent();
				
				if(addto_form.length){
					addto_form = addto_form.clone().html('');
				}else{
					addto_form = $j(this).prev();
				}
				
				$j(addto_form).append(addto);
				
				
				$j(parent_wrap, this).append(addto_form);
				$j(settings.tr_first_row).append($j(this));
			});
			
			$j(settings.tr_wrap).not(settings.tr_first_row).remove();
			
			if(settings.controls){
				_prepareControlsHTML();
			}
			
		}
		
		//
		//Check if is necesary the controls
		//
		function requiredControls(){
			
			//Sizes
			var td_width 			= $j(td_collection).width();
			var product_list_width 	= $j(settings.product_list_wrap).width();
			var table_list_width 	= $j(settings.table_wrap).width();
			var items_to_show 		= (product_list_width / td_width);

			//If the table is > to the view
			if(table_list_width > product_list_width){
				
				//Check the width by items == to the width of the container
				if(product_list_width == (td_width * items_to_show)){
					return true;
				}
			}else{
				return false;
			}
		}
		
		//
		//Left and right actions
		//
		function _controlsAction(){
			
			//Sizes
			var td_width 					= $j(td_collection).width();
			var product_list_width 			= $j(settings.product_list_wrap).width();
			var table_list_width 			= $j(settings.table_wrap).width();
			var negative_margin_by_item 	= (0 - td_width);
			var negative_margin_limit		= (0 - (table_list_width -product_list_width));
			
			var animation_active = false;
			
			//Detect Orientation
			if ($j.browser.webkit) {
				if(navigator.userAgent.match(/iPhone/i) || navigator.userAgent.match(/iPad/i) || navigator.userAgent.match(/iPod/i)){
					detectOrientation();
					function detectOrientation(){
						if(typeof window.onorientationchange != 'undefined'){
							
							if (orientation == 90 || orientation == 180) {
								
								//Orientation landscape, recalculate sizes
								td_width 					= $j(td_collection).css('width');
								product_list_width 			= $j(settings.product_list_wrap).css('width');
								table_list_width 			= $j(settings.table_wrap).width();
								
								if(td_width == 'auto'){
									td_width = 0;
								}
								if(product_list_width == 'auto'){
									product_list_width = 0;
								}
								if(table_list_width == 'auto'){
									table_list_width = 0;
								}
								
								td_width 					= parseInt(td_width);
								product_list_width 			= parseInt(product_list_width);
								table_list_width 			= parseInt(table_list_width);
								
								negative_margin_by_item 	= (0 - td_width);
								negative_margin_limit		= (0 - (table_list_width - product_list_width));
								
							}
							
							if (orientation == 0 || orientation == -90) {
								
								//Orientation portrait, recalculate sizes
								td_width 					= $j(td_collection).css('width');
								product_list_width 			= $j(settings.product_list_wrap).css('width');
								table_list_width 			= $j(settings.table_wrap).width();
								
								if(td_width == 'auto'){
									td_width = 0;
								}
								if(product_list_width == 'auto'){
									product_list_width = 0;
								}
								if(table_list_width == 'auto'){
									table_list_width = 0;
								}
								
								td_width 					= parseInt(td_width);
								product_list_width 			= parseInt(product_list_width);
								table_list_width 			= parseInt(table_list_width);
								
								negative_margin_by_item 	= (0 - td_width);
								negative_margin_limit		= (0 - (table_list_width - product_list_width));
								
							}
							
							$j(settings.table_wrap).css({'margin-left': 0});
							$j(settings.controls_left).addClass('disable');
							$j(settings.controls_right).removeClass('disable');
						}
					}
					window.onorientationchange = detectOrientation;
				}
			}
			
			function moveLeft(){
				
				if(!animation_active){
					
					animation_active = true;
					
					var margin_left = parseInt($j(settings.table_wrap).css('margin-left'));
					
					if(margin_left < 0 ){
						$j(settings.controls_right).removeClass('disable');
						$j(settings.table_wrap).animate({marginLeft: (margin_left - negative_margin_by_item)}, 200, function(){ animation_active = false; });
					}else{
						$j(settings.controls_left).addClass('disable');
						animation_active = false;
					}
				}
				
			}
			
			function moveRight(){
				
				if(!animation_active){
					
					animation_active = true;
				
					var margin_left = parseInt($j(settings.table_wrap).css('margin-left'));
					
					if(margin_left > negative_margin_limit ){
						$j(settings.controls_left).removeClass('disable');
						$j(settings.table_wrap).animate({marginLeft: (margin_left + negative_margin_by_item)}, 200, function(){ animation_active = false; });
					}else{
						$j(settings.controls_right).addClass('disable');
						animation_active = false;
					}
				
				}
				
			}
			
			//Controls
			$j(settings.controls_left).bind('click', function(){
				moveLeft();
			});
			$j(settings.controls_right).bind('click', function(){
				moveRight();
			});
			
			// Iphone / Ipod / Ipad controls
			if ($j.browser.webkit) {
				if(navigator.userAgent.match(/iPhone/i) || navigator.userAgent.match(/iPad/i) || navigator.userAgent.match(/iPod/i)){
					
					var star_pos = null;
					var move_direction = null;
					
					//Touch controls
					settings.table_wrap[0].addEventListener('touchstart', function (event) {
						star_pos = event.targetTouches[0].pageX;
					}, false);
					
					settings.table_wrap[0].addEventListener('touchend', function (event) {

						if(move_direction){
							
							if(move_direction == 'left'){
								moveLeft();
								move_direction = null;
							}
							
							if(move_direction == 'right'){
								moveRight();
								move_direction = null;
							}
							
						}
						
					}, false);
					
					$j(settings.table_wrap).bind('touchmove',function(e){
						e.preventDefault();
						var touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
						var x = touch.pageX;
						if(star_pos){
							if(x < star_pos){
								move_direction = 'right';
							}
							if(x > star_pos){
								move_direction = 'left';
							}
						}
					});
					
				}
			}
			
		}
		
		//
		//Prepare Controls HTML, left and right
		//
		function _prepareControlsHTML(){
			
			//Create HTML
			var controls_wrap 		= $j('<div class="gpc-controls-wrap"></div>');
			var product_list_wrap	= $j('<div class="product-list-wrap"></div>');
			
			//Apply HTML
			$j(settings.table_wrap).wrap(controls_wrap);
			$j(settings.table_wrap).wrap(product_list_wrap);
			
			//Set Global objects
			settings.controls_wrap 		= $j(settings.table_wrap).parent().parent();
			settings.product_list_wrap	= $j(settings.table_wrap).parent();
			
			//Check controls active
			if(requiredControls()){
				
				//Create HTML
				var controls_left 		= $j('<div class="controls-left"><span>Left</span></div>');
				var controls_right 		= $j('<div class="controls-right"><span>Right</span></div>');
			
				//Apply HTML
				$(settings.controls_wrap).prepend(controls_left);
				$(settings.controls_wrap).append(controls_right);
				
				//Set Global objects
				settings.controls_left 		= $j(controls_left, settings.controls_wrap);
				settings.controls_right 	= $j(controls_right, settings.controls_wrap);
				
				_controlsAction();
			
			}else{
				$(settings.controls_wrap).addClass('no-controls');
			}
			
		}
		
		//Initialize the plugin
		_initialize();

	}
	
})(jQuery);

$j(function(){
	
	//Product view
	if($j('.tabs-container').length > 0){
		$j('.tabs-container').gpTabs();
	}
	
	//Item list carousel
	/*if($j('.td-home-cell').length > 0){
		$j('.td-home-cell').gpItemListCarousel();
	}*/
	
	//Drilldown
	$j('#nav').gpNavDrilldown();
	$j('.top-links').gpNavDrilldown();

});