if ($j.browser.webkit) {
	if(navigator.userAgent.match(/iPhone/i) || navigator.userAgent.match(/iPad/i) || navigator.userAgent.match(/iPod/i)){
		
		$j(function(){
			$j('#nav .color-nav').prepend('<img src="/site/pp-header/bg-shopbycolor-txt.gif" class="btn-showcolor" />');
		});
		
	}
}