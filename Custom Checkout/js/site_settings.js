BTQ.siteSettings = (function() {
	
	var _siteSettings;
    var _service = 'sitesettings.ss';

	var EVTS = BDK.konst.Events;

	// bridge methods for handling from the front-end.
	function loadSettings () {
		
		var data = BTQ.isDevEnvironment() ? {"method" : "get"} : '{"method":"get"}';
        BDK.ajax.talk(new BDK.ajax.Request(loadSettingsCallback.bind(this), data, BTQ.getBaseServiceUrl(true) + _service, false));
	}
	
	function loadSettingsCallback(transport) {

		// if it was a successful login then show the nextView otherwise show error message
		_siteSettings = transport.responseJSON;
		
		if (_siteSettings) {
			_siteSettings = _siteSettings.result.sitesettings;
            
            // Only need to sync from shopping to checkout.
            var syncUrl = _siteSettings.touchpoints.serversync;
            if (syncUrl && syncUrl.length > 5 && ('https' === syncUrl.substring(0,5).toLowerCase())) {
    			callServerViaIframe(_siteSettings.touchpoints.serversync);
            }
		}
	}
		
	// load settings and setup cross domain.
	function setup() {
			
		loadSettings();
	}

	function callServerViaIframe(src) {
		
		var name = "serversync";
		ifrm = document.createElement("iframe");
		ifrm.setAttribute("name", name);
		ifrm.setAttribute("id", name);
		ifrm.setAttribute("src", src);
		ifrm.style.width = "0 px";
		ifrm.style.height = "0 px";
		ifrm.style.visibility = "hidden";
		document.body.appendChild(ifrm);
	}
	
    // return public API
	return {
        name : "siteSettings",
        getSiteSettings : function() {
        	return _siteSettings;
        },
        reloadSiteSettings : function() {
        	loadSettings();
        },
        startup : function(){
			try{
            	BDK.observe("historyReady", setup, this, false, this.name + ": get the latest settings from the server");
            	BDK.observe(["userLoggedIn", "userRegistered"], setup, this, false, this.name + ": user has logged in. reload settings because it has changed.");
			}
        	catch(e) {
        		BDK.fire("lx:debug","siteSettings.js: " + Object.toJSON(e));
        	}    
		}
	}       
})();
