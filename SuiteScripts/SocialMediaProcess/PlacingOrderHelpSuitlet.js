/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       03 Sep 2013     sforostiuk
 *
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function suitelet(request, response)
{
	var result = [{"title":"", "description":"" }];
	
	var topic = nlapiLoadRecord('topic', 8);
	topic = JSON.parse(JSON.stringify(topic));
	var items = topic.solution;

	for(var i=0; i<items.length; i++)
	{
		var internalId = items[i].solution.internalid;
		var item = nlapiLoadRecord('solution', internalId);
		item = JSON.parse(JSON.stringify(item));
		result[i] = { 'title' : item.title, 'description' : item.longdescription };
	}
	
	response.write(JSON.stringify(result));
}
