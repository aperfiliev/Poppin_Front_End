var set='';
function setGARedirectUrl(url) {
	   var redir_elem = url;

	   _gaq.push(function() {
	    var tracker = _gaq._getAsyncTracker();
	    redir_elem = tracker._getLinkerUrl(url);
	   });
	   window.location = redir_elem;
	   return false;
	  }
jQuery(document).ready(
		function(){
			jQuery(window).scroll(function () {
				if(jQuery(window).scrollTop() + jQuery(window).height() > jQuery(document).height() - 300 ) {
					//do nothing
				} else if(jQuery(window).scrollTop()<300){
					jQuery('#floatingTotal').animate({top:0},{duration:1000,queue:false});
				} else if(jQuery(window).scrollTop()%200==0){
					//do nothing
				} else{
					set = jQuery(document).scrollTop()-200+"px";
					jQuery('#floatingTotal').animate({top:set},{duration:1000,queue:false});
				}
			});
		});