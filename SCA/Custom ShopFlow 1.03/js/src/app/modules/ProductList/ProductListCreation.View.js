// ProductListCreation.Views.js
// -----------------------
// View to handle Product Lists creation
// TODO: rename this file to ProductListEditView
define('ProductListCreation.View', ['ProductList.Model', 'ProductListItem.Collection'], 
	function (ProductListModel, ProductListItemCollection)
{
	'use strict';

	return Backbone.View.extend({

		template: 'product_list_new'

	,	attributes: {'class': 'container product-list-new'}

	,	events : 
		{
			'submit form': 'saveForm'
		,	'keypress [type="text"]': 'preventEnter'
		}

	,	initialize: function (options)
		{
			this.application = options.application;
			this.parentView = options.parentView;
			this.model = options.model;
			this.isEdit = this.model.get('internalid'); 
			this.page_header = this.getTitle();
		}

		// Prevents not desired behaviour when hitting enter
	,	preventEnter: function(event)
		{
			if (event.keyCode === 13) 
			{
				event.preventDefault();
			}
		}

		// Sets focus on the name field and returns the correct title text
	,	getTitle: function ()
		{
			this.$('[name="name"]').focus();
			return this.isEdit ? _('Edit your list').translate() : _('Create a new list').translate(); 
		}

		// Handles the form submit on save
	,	saveForm: function()
		{
			var self = this
			,	save_promise = Backbone.View.prototype.saveForm.apply(self, arguments); 
			save_promise && save_promise.done(function ()
			{
				self.model.set('items', new ProductListItemCollection(self.model.get('items')));
				self.$containerModal && self.$containerModal.modal('hide');
				if (self.isEdit) 
				{
					self.application.getProductLists().add(self.model, {merge: true}); 
					self.application.getLayout().updateMenuItemsUI();
					self.parentView.render();
					if (self.parentView.$el.hasClass('ProductListDetailsView'))
					{
						self.parentView.showConfirmationMessage(
							_('Good! The list was successfully updated. ').translate()
						);
					}
					else
					{
						self.parentView.showConfirmationMessage(
							_('Good! Your $(0) list was successfully updated. ').translate('<a href="/productlist/' + self.model.get('internalid') + '">' + self.model.get('name') + '</a>')
						);
					}
				}
				else
				{					
					self.application.getProductLists().add(self.model);
					self.application.getLayout().updateMenuItemsUI();
					self.parentView.showConfirmationMessage(
						_('Good! Your $(0) list was successfully created. ').translate('<a href="/productlist/' + self.model.get('internalid') + '">' + self.model.get('name') + '</a>')
					);					
				}
				self.parentView.highlightList && self.parentView.highlightList(self.model.get('internalid')); 
			});		
		}

		// Get new list name
	,	getName: function ()
		{
			return this.$('.product-list-new-name-input input').val();
		}

		// Get new list notes
	,	getNotes: function ()
		{
			return this.$('.product-list-new-notes-input textarea').val();
		}

	});

});
