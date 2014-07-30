// String.format.js
// ----------------
// Used for the translation method in Utils.js
// Will replace $(n) for the n parameter entered 
// eg: "This $(0) a $(1), $(0) it?".format("is", "test");
//     returns "This is a test, is it?"
(function () {
	'use strict';
	
	String.prototype.format = function ()
	{
		var args = arguments;

		return this.replace(/\$\((\d+)\)/g, function (match, number)
		{ 
			return typeof args[number] !== 'undefined' ? args[number] : match;
		});
	};

})();