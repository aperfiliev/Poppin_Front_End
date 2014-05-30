// BootUtilities.js
// ----------------------

// Defines console for IE.
// Used to prevent the application to stop working in IE
/*jshint evil:true, unused:false*/ 
;(function ()
{
	'use strict';
	// verify if there not console
	if (typeof window.console === 'undefined') 
	{
		window.console = {};

		var i = 0
		// defining default function
		,	noop = function () {}
		// defining methods names for console.
		,	methods = ['assert', 'error', 'clear', 'count', 'debug', 'dir', 'dirxml', 'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log', 'profile', 'profileEnd', 'table', 'time', 'timeEnd', 'trace', 'warn'];
		// adding all methods
		for (; i < methods.length; i++)
		{
			window.console[methods[i]] = noop;
		}
	}
	// adding memory object
	if (typeof window.console.memory === 'undefined')
	{
		window.console.memory = {};
	}
	
})();

//Define a function to load script at runtime
//The script can be removed of the generated html by the server seo, please see Starter.js. 
function loadScript(data)
{
	'use strict';
	
	var element;

	if (data.url)
	{
		element = '<script src="'+ data.url +'"></script>';
	}
	else
	{
		element = '<script>'+ data.code + '</script>';
	}

	if (data.seo_remove)
	{
		document.write(element);
	}
	else
	{ 
		document.write('</div>'+ element +'<div class="seo-remove">');
	}
}