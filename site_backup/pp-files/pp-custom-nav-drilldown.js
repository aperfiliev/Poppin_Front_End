$j.fn.customNavDrilldown = function(options){
		var settings = $j.extend({
			active: true
		}, options);
	
		var options = $j.extend(settings, options);
		var container = this;
		var li_last = $j('<li></li>');
		
		li_last.addClass('last');
		
		var model = {
				item_empty: function(level, name, item_lnk){
					
					var item_obj 		= $j('<li></li>').addClass('level'+level);
					var item_lnk_obj 	= $j('<a></a>').attr({href: item_lnk, title: name});
					
					if(level > 0){
						var span = $j('<span></span>').text(name);
						$j(item_lnk_obj).append(span);
					}else{
						$j(item_lnk_obj).text(name);
					}
					
					return item_obj.append(item_lnk_obj);
				},
				
				processData: function(data){

					var count = 0;
					var global_ul = $j('<ul></ul>').addClass('level0 top-level custom-top-nav');
					
					function setLevel(obj, level){
						
						var container_div 	= $j('<div></div>').addClass('level'+(level+1)+'-container');
						var content_div 	= $j('<div></div>').addClass('level'+(level+1)+'-content');
						var container_ul 	= $j('<ul></ul>').addClass('level'+(level+1));
						var i = 0;
						
						$j.each(obj, function(k,v){
							
							var item_nav = model.item_empty(level, v.n, v.i);
							
							if(v.c){
								sub_level = (level+1);
								var sub_ul = setLevel(v.c, sub_level);
								$j(item_nav).append(sub_ul);
							}else{
								$j(item_nav).addClass('last-level');
							}
							
							if(level == 0){
								$j(item_nav).addClass('item'+i);
							}
							
							if(level > 0){
								container_ul.append(item_nav);
								$j(content_div).append(container_ul);
								$j(container_div).append(content_div);
							}else{
								global_ul.append(item_nav);
							}
							
							i++;
						});
						
						if(level > 0){
							return container_div;
						}else{
							return global_ul;
						}
					}
					
					var nav = setLevel(data, count);
					
					return nav;
					
				}
			}
		
		return this.each(function(){
			
			var _this = this;
			
			$j.ajax({
				'url'		:'/app/site/hosting/scriptlet.nl?script=259&deploy=1',
				'dataType'	:'json',
				'success'	:function(data){
					var nav = model.processData(data);
					$j(nav).append(li_last);
					$j(_this).append(nav).gpNavDrilldown();
				}
			});
			
		});
	}
	
$j(function(){
	$j('#dinamic-top-nav').customNavDrilldown();
});