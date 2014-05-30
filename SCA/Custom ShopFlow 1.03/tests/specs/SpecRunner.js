var use_blanket = false; 
var deps = use_blanket ? ['jasmineHtml','blanket'] : ['jasmineHtml']; 

require(deps, function (jasmine,blanket)
{
	var jasmineEnv = jasmine.getEnv();
	jasmineEnv.updateInterval = 1000;

	var htmlReporter = new jasmine.HtmlReporter();

	jasmineEnv.addReporter(htmlReporter);
	jasmineEnv.specFilter = function (spec)
	{
		return htmlReporter.specFilter(spec);
	};

	if(use_blanket)
	{
		blanket.options('debug',true);
		blanket.options('filter',/(tests\/specs\/app)|(js\/src)/);	
	}

	require(specs, function ()
	{
		jasmineEnv.execute();
	});	
});
//This is necessary due to a blanket bug at startup along with the fix customized blanket library.
window.addEventListener("load",function()
{
	window.isLoaded = true;
},false);