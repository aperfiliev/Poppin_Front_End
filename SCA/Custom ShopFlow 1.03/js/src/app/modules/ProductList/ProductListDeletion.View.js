// ProductListDeletion.Views.js
// -----------------------
// View to handle Product Lists (lists and items) deletion
define('ProductListDeletion.View', function ()
{
	'use strict';

	return Backbone.View.extend({

		template: 'product_list_delete_confirm'

	,	title: _('Delete item').translate()

	,	page_header: _('Delete item').translate()

	,	events : 
		{
			'click [data-action="delete"]' : 'confirmDelete'
		}

	,	initialize: function (options)
		{
			this.application = options.application;
			this.parentView = options.parentView;
			this.target = options.target;
			this.title = options.title;
			this.page_header = options.title;
			this.body_text = options.body_text;
			this.confirm_delete_method = options.confirm_delete_method;
			this.confirm_buttom_label = options.confirm_buttom_label || _('Yes, remove it').translate(); 
		}

		// Invokes parent view delete confirm callback function
	,	confirmDelete : function ()
		{
			this.parentView[this.confirm_delete_method](this.target);
		}

		// Sets focus con cancel button and returns the title text
	,	getTitle: function ()
		{
			this.$('[data-action="cancel"]').focus();
			return _('Delete product list').translate();
		}
	});

});