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
    var result = [];
    
    var topic = nlapiLoadRecord('topic', 8),
        count = topic.getLineItemCount('solution'),
        solutionID,
        item,
        title,
        longdescription;
        
    for (var i = 1; i <= count; i++) {
        solutionID = topic.getLineItemValue('solution', 'id', i),
        item = nlapiLoadRecord('solution', solutionID),
        title = item.getFieldValue('title'),
        longdescription = item.getFieldValue('longdescription');
        
        result.push({
            title : title, 
            description : longdescription
        });
        
    }
    response.setContentType('JAVASCRIPT');
    response.write(JSON.stringify(result));
}
