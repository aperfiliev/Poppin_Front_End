// Backbone.View.render.js
// -----------------------
// Extends native Backbone.View with a custom rendering method
(function ()
{
	'use strict';
	
	_.extend(Backbone.View.prototype, {

		_render: function ()
		{
			// http://backbonejs.org/#View-undelegateEvents
			this.undelegateEvents();
			
			// if there is a collection or a model, we 
			(this.model || this.collection) && Backbone.Validation.bind(this);
			
			// Renders the template 
			var tmpl = SC.template(this.template+'_tmpl', {view: this});
			
			// Workaround for internet explorer 7. href is overwritten with the absolute path so we save the original href
			// in data-href (only if we are in IE7)
			// IE7 detection courtesy of Backbone
			// More info: http://www.glennjones.net/2006/02/getattribute-href-bug/
			var isExplorer = /msie [\w.]+/
			,	docMode = document.documentMode
			,	oldIE = (isExplorer.exec(navigator.userAgent.toLowerCase()) && (!docMode || docMode <= 7));
			
			if (oldIE)
			{
				tmpl = tmpl.replace(/href="(.+?)(?=")/g,'$&" data-href="$1');
			}

			// appends the content to the view's element
			this.$el.html(tmpl);
			// http://backbonejs.org/#View-delegateEvents
			this.delegateEvents();

			return this;
		}

	,	render: function () 
		{
			return this._render();
		}
	});
})();