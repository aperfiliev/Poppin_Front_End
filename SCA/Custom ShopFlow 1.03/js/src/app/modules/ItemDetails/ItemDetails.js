// ItemDetails.js
// --------------
// Groups the different components of the Module
define('ItemDetails'
,	['ItemDetails.Model', 'ItemDetails.Collection', 'ItemDetails.View', 'ItemDetails.Router']
,	function (Model, Collection, View, Router)
{
	'use strict';

	return {
		View: View
	,	Model: Model
	,	Router: Router
	,	Collection: Collection
	,	mountToApp: function (application, options)
		{
			// Wires the config options to the url of the model 
			Model.prototype.urlRoot = _.addParamsToUrl(Model.prototype.urlRoot, application.getConfig('searchApiMasterOptions.itemDetails', {}));
			// and the keymapping
			Model.prototype.keyMapping = application.getConfig('itemKeyMapping', {});

			Model.prototype.itemOptionsConfig = application.getConfig('itemOptions', []);

			Model.prototype.itemOptionsDefaultMacros = application.getConfig('macros.itemOptions', {});
			
			if (options && options.startRouter)
			{
				return new Router({application: application, model: Model, view: View});
			}
		}
	};
});