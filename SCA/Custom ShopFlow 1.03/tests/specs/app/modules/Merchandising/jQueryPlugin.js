/*jshint laxcomma:true*/
define(['Merchandising.jQueryPlugin'], function (jQueryPlugin)
{
	'use strict';

	return describe('Merchandising.jQueryPlugin', function ()
	{
		it('adds `merchandisingZone` as a jQuery method', function ()
		{
			expect('merchandisingZone' in jQuery()).toBe(true);
		});
	});
});