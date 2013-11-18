// Order.Model.js
// -----------------------
// Model for showing information about an order
define('Order.Model', ['OrderLine.Collection', 'OrderShipmethod.Collection', 'Address.Collection', 'CreditCard.Collection','OrderPaymentmethod.Collection'], function (OrderLinesCollection, ShipmethodsCollection, AddressesCollection, CreditCardsCollection, OrderPaymentmethodCollection)
{
	'use strict';

	return Backbone.Model.extend({
		
		linesCollection: OrderLinesCollection

	,	initialize: function (attributes)
		{
			this.on('change:lines', function (model, lines)
			{
				model.set('lines', new model.linesCollection(lines), {silent: true});
			}); 

			this.trigger('change:lines', this, attributes && attributes.lines || []);

			this.on('change:shipmethods', function (model, shipmethods)
			{
				model.set('shipmethods', new ShipmethodsCollection(shipmethods), {silent: true});
			});
			this.trigger('change:shipmethods', this, attributes && attributes.shipmethods || []);

			this.on('change:addresses', function (model, addresses)
			{
				model.set('addresses', new AddressesCollection(addresses), {silent: true});
			});
			this.trigger('change:addresses', this, attributes && attributes.addresses || []);

			this.on('change:paymentmethods', function (model, paymentmethods)
			{
				model.set('paymentmethods', new OrderPaymentmethodCollection(paymentmethods), {silent: true});
			});
			this.trigger('change:paymentmethods', this, attributes && attributes.paymentmethod || []);
		}
	});
});
