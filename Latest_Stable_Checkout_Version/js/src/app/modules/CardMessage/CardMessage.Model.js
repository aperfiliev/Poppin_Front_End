/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       22 Jan 2014     ashykalov
 *
 */
// CardMessage.Model.js
// -------------------------------
// Sends and gets cardmessage 

define('CardMessage.Model', function ()
{
	'use strict';

	return Backbone.Model.extend({
		urlRoot: 'services/cardmessage.ss'
	});
});