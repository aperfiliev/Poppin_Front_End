// ImageNotAvailable.js
// --------------------
// Simple Module that will make sure that
// if an image files to load it will load an alternative image in it
define('ImageNotAvailable', function ()
{
	'use strict';
	
	return {
		mountToApp: function (application)
		{
			// Every time a new view is rendered
			application.getLayout().on('afterAppendView', function (view)
			{
				// it will look at the img and bind the error event to it
				view.$('img').on('error', function ()
				{
					// and haven't tried to changed it before, so we don't enter an infinite loop
					if (!this.errorCounter)
					{
						// it will set the src of the img to the default image not available.
						// you can set logic based on size or a class for displaying different urls if you need
						this.src = application.getConfig('imageNotAvailable', '');
						this.errorCounter = true;
					}
				});
			});
		}
	};
});