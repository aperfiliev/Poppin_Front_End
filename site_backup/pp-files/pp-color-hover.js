$j(function(){
	color_hover = {
		int_w			: null,
		count_elements	: null,
		total_w			: null,
		hover: function(element, collection){
			largein = false;
			element.hover(function(){
				if(largein){ return; }
				largein = true;
				
				each_w = (((color_hover.total_w - color_hover.int_w) - (150 - color_hover.int_w)) / (color_hover.count_elements - 1));
				
				collection.not(this).animate({width: each_w});
				$j(this).animate({width: '150px'});
				$j(this).find('span').css({opacity: 0, display: 'block'}).animate({opacity: 1}, 100);
				
			}, function(){
				$j(this).stop();
				$j(this).find('span').css({display: 'none'});
				
				collection.stop();
				collection.css({width: color_hover.int_w});
				
				largein = false;
			});
			
		}
	}
	
	color_hover.int_w 			= $j('.color-nav li').width();
	color_hover.count_elements 	= $j('.color-nav li').length;
	color_hover.total_w 		= (color_hover.int_w * color_hover.count_elements);
	
	$j('.color-nav li').each(function(){
		color_hover.hover($j(this), $j('.color-nav li'));
	});
});