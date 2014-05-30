// OrderLine.Model.js
// -----------------------
// Model for showing information about a line in the order
define('OrderLine.Model', ['ItemDetails.Model'], function (ItemDetailsModel)
{
	'use strict';

	return Backbone.Model.extend({
		
		initialize: function (attributes)
		{
			this.on('change:item', function (model, item)
			{
				model.set('item', new ItemDetailsModel(_.extend(item, {
					line_id: model.get('internalid')
				,	options: model.get('options')
				,	quantity: model.get('quantity')
				})), {silent: true});
			});
			
			this.trigger('change:item', this, attributes && attributes.item || {});

			this.on('error', function (model, jqXhr)
			{
				var result = JSON.parse(jqXhr.responseText)
				,	error_details = result.errorDetails;

				if (error_details && error_details.status === 'LINE_ROLLBACK')
				{
					model.set('internalid', error_details.newLineId);
				}
			});
		}
		
	,	toJSON: function ()
		{
			var options = this.attributes.options;

			// Custom attributes include the id and value as part of the array not the format expected in service
			if (options instanceof Array)
			{
				var newOptions = {};

				_.each(options, function (e)
				{
					newOptions[e.id.toLowerCase()] = e.value;
				});

				options = newOptions;
			}

			return {
				item: {
					internalid: (this.attributes.item.get('_matrixParent').get('_id')) ? this.attributes.item.get('_matrixParent').get('_id') : this.attributes.item.get('_id') 
				}
			,	quantity: this.attributes.quantity
			,	options: options
			};
		}
	});	
});