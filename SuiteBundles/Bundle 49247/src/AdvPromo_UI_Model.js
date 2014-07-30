/**
 * Module Description Here
 * You are using the default templates which should be customized to your needs.
 * You can change your user name under Preferences->NetSuite Plugin->Code Templates.
 * 
 * Version    Date            Author           Remarks
 * 1.00       15 Feb 2012     adimaunahan
 *                            rwong
 */

var mainModel;
var shippingModel;

var NLClass = function(args) {
	var klass = function() {
		return (this.initialize) ? this.initialize.apply(this, arguments) : this;
	};
	for (var key in args) klass.prototype[key] = args[key];
	return klass;
};

var MainModel = new NLClass({
	initialize : function () {
		this.promotionalOffers = new Array(); // array of PromotionalOfferModel
		this.promotionalOfferLimits = new Array();
	}
});

var PromotionalOfferModel = new NLClass({
	initialize : function () {
		this.currencyId = -1;
		this.offerLabel = null;
		this.amount = -1;
		this.isPercent = true; // true, false
	}
});

var PromotionalLimitModel = new NLClass({
	initialize : function () {
		this.currencyId = -1;
		this.limitLabel = null;
		this.amount = -1;
		this.isUnit = false; // true, false
	}
});

var OrderDiscountSublistModel = new NLClass({
	initialize : function () {
		this.name = null;
		this.promotionalOffer = null;
		this.limit = null;
		this.previewLink = null; 
		this.editLink = null;
		this.deleteLink = null;
	}
});

var PromotionalOfferJsonDbModel = new NLClass({
	initialize : function () {
		this.oper = null; // 'A' - add, 'D' - delete
		this.amount = null; // 10
		this.isPercent = null; // 'T', 'F'
		this.limit = null;  // 50
		this.isUnit = null; // 'T', 'F'
		this.currId = null; // 2
	}
});

var ShippingModel = new NLClass({
	initialize : function () {
		this.discountType = new Array(); // array of DicountTypeModel
		this.shippingOffer = new Array(); // array of ShippingOfferModel
		this.shippingMethod = new Array(); // array of ShippingMethodModel
	}
});

var DiscountTypeModel = new NLClass({
	initialize : function () {
		this.discountType = -1;
	}
});

var ShippingOfferModel = new NLClass({
	initialize : function () {
		this.currencyId = -1;
		this.currencyLabel = null;
		this.amount = -1;
	}
});

var ShippingMethodModel = new NLClass({
	initialize : function () {
		//this.shippingMethod = -1;
		//this.shippingMethodLabel = null;
		this.shippingMethod = new Array();
		this.shippingMethodLabel = new Array();
	}
});
