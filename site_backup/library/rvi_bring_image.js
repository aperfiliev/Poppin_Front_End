
$j(document).ready(function(){
	$j('.rvi_thumb').each(function(){$j(this).attr('src','/site/pm-files/thumbloader.gif');});
});

$j(window).load(function(){
	$j('.rvi_thumb').each(function(){
		var item_url = $j(this).parents('a').eq(0).attr('href');
		if(item_url){
			(function rvi_thumb(url, source, target){
				$j.ajax({
					url: url,
					type: "GET",
					dataType: "html",
					success: function(msg){	
						var src = $j(msg).find(source).attr('title');
						if(src)
							$j('#'+target).attr('src',src);			
						else				
							$j('#'+target).remove();
					}
				});
			})(item_url, "div[id^=item_rvi_thumb]", $j(this).attr('id'));
		}
	});	
});	