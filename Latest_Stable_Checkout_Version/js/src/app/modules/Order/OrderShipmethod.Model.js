// OrderShipmethod.Model.js
// ------------------------
// Single ship method
define('OrderShipmethod.Model', function ()
{
	'use strict';

	return Backbone.Model.extend({
		getFormattedShipmethod: function ()
		{
			return this.get('name');
		}
	});

	
});
