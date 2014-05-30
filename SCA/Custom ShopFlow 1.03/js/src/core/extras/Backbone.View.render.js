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

			//Apply permissions
			var $tmpl = this.applyPermissions(tmpl);

			this.$el.empty();

			this.trigger('beforeViewRender', this);
			
			// TODO: Review this
			// appends the content to the view's element
			if (SC.ENVIRONMENT.jsEnvironment === 'server')
			{
				this.$el[0].innerHTML = $tmpl[0].innerHTML;	
			}
			else
			{
				this.$el.append($tmpl);
			}
			
			this.trigger('afterViewRender', this);

			// http://backbonejs.org/#View-delegateEvents
			this.delegateEvents();

			return this;
		}

		// Given an HTML template string, removes the elements from the DOM that
		// do not comply with the list of permissions level
		// The permission level is specified by using the data-permissions attribute and data-permissions-operator (the latter is optional)
		// on any html tag in the following format:
		// <permission_category>.<permission_name>.<minimum_level>
		// permission_category and permission_name come from SC.ENVIRONMENT.permissions. (See commons.js)
		// e.g:
		//     <div data-permissions="transactions.tranFind.1"></div>
		//     <div data-permissions="transactions.tranCustDep.3,transactions.tranDepAppl.1 lists.tranFind.1"></div>
		// Notice several permissions can be separated by space or comma, by default (in case that data-permissions-operator is missing) all permission will be evaluates 
		// as AND, otherwise data-permissions-operator should have the value OR
		// e.g:
		//     <div data-permissions="transactions.tranFind.1"></div>
		//     <div data-permissions="transactions.tranCustDep.3,transactions.tranDepAppl.1 lists.tranFind.1" data-permissions-operator="OR" ></div>

	,	applyPermissions: function (tmpl)
		{
			// We need to wrap the template in a container so then we can find 
			// and remove parent nodes also (jQuery.find only works in descendants).
			var $template = SC.ENVIRONMENT.jsEnvironment === 'server' ? jQuery('<div/>').append(tmpl) : jQuery(tmpl)
			,	$permissioned_elements = $template.find('[data-permissions]');

			$permissioned_elements.each(function ()
			{
				var $el = jQuery(this)
				,	element_permission = $el.data('permissions')
				,	perms = element_permission.split(/[\s,]+/)
				,	perm_operator = $el.data('permissions-operator') || 'AND'
				,	perm_eval
				,	perm_evaluation = perm_operator !== 'OR';

				_.each(perms, function (perm)
				{
					var perm_tokens = perm.split('.');

					perm_eval = !(perm_tokens.length === 3 &&
						perm_tokens[2] < 5 &&
						SC.ENVIRONMENT.permissions &&
						SC.ENVIRONMENT.permissions[perm_tokens[0]] &&
						SC.ENVIRONMENT.permissions[perm_tokens[0]][perm_tokens[1]] < perm_tokens[2]);

					if (perm_operator === 'OR')
					{
						perm_evaluation = perm_evaluation || perm_eval;
					}
					else
					{
						perm_evaluation = perm_evaluation &&  perm_eval;
					}
				});

				if (!perm_evaluation)
				{
					$el.remove();
				}
			});

			return $template;
		}

	,	render: function ()
		{
			return this._render();
		}
	});
})();