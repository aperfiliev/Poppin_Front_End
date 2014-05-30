/*jshint laxcomma:true*/
require.config({
	paths: {
		'Application': 'js/src/app/Application'
	,	'ApplicationSkeleton': 'js/src/core/ApplicationSkeleton'
	,	'Main': 'js/src/core/Main'
	,	'NavigationHelper': 'js/src/app/modules/NavigationHelper/NavigationHelper'
	,	'UrlHelper': 'js/src/app/modules/UrlHelper/UrlHelper'
	,	'Utils': 'js/src/core/Utils'
	,	'StringFormat': 'js/src/core/extras/String.format'
	,	'ExtrasUnderscoreTemplates': 'js/src/core/extras/Underscore.templates'
	,	'ExtrasApplicationSkeletonLayout.showContent': 'js/src/core/extras/ApplicationSkeleton.Layout.showContent'
	,	'ExtrasApplicationSkeletonLayout.showInModal': 'js/src/core/extras/ApplicationSkeleton.Layout.showInModal'
	,	'ExtrasBackboneView': 'js/src/core/extras/Backbone.View'
	,	'ExtrasBackboneView.render': 'js/src/core/extras/Backbone.View.render'
	,	'ExtrasBackbone.cachedSync': 'js/src/core/extras/Backbone.cachedSync'
	,	'ExtrasBackboneModel': 'js/src/core/extras/Backbone.Model'
	,	'ExtrasBackboneSync': 'js/src/core/extras/Backbone.Sync'
	,	'Bootstrap.Slider': 'js/src/core/extras/Bootstrap.Slider'
	,	'jquery.serializeObject': 'js/src/core/extras/jQuery.serializeObject'
	,	'Backbone.View.saveForm': 'js/src/core/extras/Backbone.View.saveForm'
	,	'BackToTop': 'js/src/app/modules/BackToTop/BackToTop'
	,	'Content': 'js/src/app/modules/Content/Content'
	,	'MyAccountConfiguration': 'js/src/app/Configuration'
	,	'Content.DataModels': 'js/src/app/modules/Content/Content.DataModels'
	,	'Content.LandingPages': 'js/src/app/modules/Content/Content.LandingPages'
	,	'Content.EnhancedViews': 'js/src/app/modules/Content/Content.EnhancedViews'
	,	'Facets': 'js/src/app/modules/Facets/Facets'
	,	'Facets.Translator': 'js/src/app/modules/Facets/Facets.Translator'
	,	'Facets.Helper': 'js/src/app/modules/Facets/Facets.Helper'
	,	'Facets.Model': 'js/src/app/modules/Facets/Facets.Model'
	,	'Facets.Router': 'js/src/app/modules/Facets/Facets.Router'
	,	'Facets.Views': 'js/src/app/modules/Facets/Facets.Views'
	,	'Categories': 'js/src/app/modules/Categories/Categories'
	,	'ItemDetails': 'js/src/app/modules/ItemDetails/ItemDetails'
	,	'ItemDetails.Collection': 'js/src/app/modules/ItemDetails/ItemDetails.Collection'
	,	'ItemDetails.Model': 'js/src/app/modules/ItemDetails/ItemDetails.Model'
	,	'ItemDetails.Router': 'js/src/app/modules/ItemDetails/ItemDetails.Router'
	,	'ItemDetails.View': 'js/src/app/modules/ItemDetails/ItemDetails.View'
	,	'ItemOptionsHelper': 'js/src/app/modules/ItemOptionsHelper/ItemOptionsHelper'
	,	'Cart': 'js/src/app/modules/Cart/Cart'
	,	'Cart.Views': 'js/src/app/modules/Cart/Cart.Views'
	,	'Cart.Router': 'js/src/app/modules/Cart/Cart.Router'
	,	'LiveOrder.Collection': 'js/src/app/modules/Order/LiveOrder.Collection'
	,	'LiveOrder.Model': 'js/src/app/modules/Order/LiveOrder.Model'
	,	'OrderWizard.Router': 'js/src/app/modules/OrderWizard/OrderWizard.Router'
	,	'OrderWizard.Step': 'js/src/app/modules/OrderWizard/OrderWizard.Step'
	,	'OrderWizard.View': 'js/src/app/modules/OrderWizard/OrderWizard.View'
	,	'Order.Model': 'js/src/app/modules/Order/Order.Model'
	,	'OrderLine.Collection': 'js/src/app/modules/Order/OrderLine.Collection'
	,	'OrderLine.Model': 'js/src/app/modules/Order/OrderLine.Model'
	,	'OrderPaymentmethod.Collection': 'js/src/app/modules/Order/OrderPaymentmethod.Collection'
	,	'OrderPaymentmethod.Model': 'js/src/app/modules/Order/OrderPaymentmethod.Model'
	,	'OrderShipmethod.Collection': 'js/src/app/modules/Order/OrderShipmethod.Collection'
	,	'OrderShipmethod.Model': 'js/src/app/modules/Order/OrderShipmethod.Model'
	,	'ErrorManagement': 'js/src/app/modules/ErrorManagement/ErrorManagement'
	,	'Address.Model': 'js/src/app/modules/Address/Address.Model'
	,	'Address.Collection': 'js/src/app/modules/Address/Address.Collection'
	,	'Address': 'js/src/app/modules/Address/Address'
	,	'Address.Views': 'js/src/app/modules/Address/Address.Views'
	,	'Address.Router': 'js/src/app/modules/Address/Address.Router'
	,	'CreditCard.Model': 'js/src/app/modules/CreditCard/CreditCard.Model'
	,	'CreditCard.Collection': 'js/src/app/modules/CreditCard/CreditCard.Collection'
	,	'PromocodeSupport': 'js/src/app/modules/PromocodeSupport/PromocodeSupport'
	,	'Profile': 'js/src/app/modules/Profile/Profile'
	,	'ItemsKeyMapping': 'js/src/app/ItemsKeyMapping'
	,	'OrderWizard.Module.TermsAndConditions': 'js/src/app/modules/OrderWizard/OrderWizard.Module.TermsAndConditions'
	,	'OrderWizard.Module.PaymentMethod.Creditcard': 'js/src/app/modules/OrderWizard/OrderWizard.Module.PaymentMethod.Creditcard'
	,	'OrderWizard.Module.PaymentMethod': 'js/src/app/modules/OrderWizard/OrderWizard.Module.PaymentMethod'
	,	'OrderWizard.Module.ShowPayments':'js/src/app/modules/OrderWizard/OrderWizard.Module.ShowPayments'
	,	'SC.ENVIRONMENT': 'tests/specs/sc.environment'
	,	'User.Model': 'js/src/app/modules/User/Model'
	,	'Wizard.Router': 'js/src/app/modules/Wizard/Wizard.Router'
	,	'Wizard.Step': 'js/src/app/modules/Wizard/Wizard.Step'
	,	'Wizard.StepGroup': 'js/src/app/modules/Wizard/Wizard.StepGroup'
	,	'Wizard.View': 'js/src/app/modules/Wizard/Wizard.View'
	,	'Wizard.Module': 'js/src/app/modules/Wizard/Wizard.Module'
	,	'Wizard': 'js/src/app/modules/Wizard/Wizard'

	,	'ProductList': 'js/src/app/modules/ProductList/ProductList'
	,	'ProductList.Model': 'js/src/app/modules/ProductList/ProductList.Model'
	,	'ProductList.Collection': 'js/src/app/modules/ProductList/ProductList.Collection'
	,	'ProductListItem.Model': 'js/src/app/modules/ProductList/ProductListItem.Model'
	,	'ProductListItem.Collection': 'js/src/app/modules/ProductList/ProductListItem.Collection'
	,	'ProductListDetails.View': 'js/src/app/modules/ProductList/ProductListDetails.View'
	,	'ProductListDeletion.View': 'js/src/app/modules/ProductList/ProductListDeletion.View'
	,	'ProductListLists.View': 'js/src/app/modules/ProductList/ProductListLists.View'
	,	'ProductListCreation.View': 'js/src/app/modules/ProductList/ProductListCreation.View'
	,	'ProductListAddedToCart.View': 'js/src/app/modules/ProductList/ProductListAddedToCart.View'
	,	'ProductListMenu.View': 'js/src/app/modules/ProductList/ProductListMenu.View'
	,	'ProductListControl.Views': 'js/src/app/modules/ProductList/ProductListControl.Views'
	,	'ProductList.Router': 'js/src/app/modules/ProductList/ProductList.Router'
	,	'ProductListItemEdit.View': 'js/src/app/modules/ProductList/ProductListItemEdit.View'

	,	'OrderWizard.Module.Address' : 'js/src/app/modules/OrderWizard/OrderWizard.Module.Address'

	,	'Invoice.Model':'js/src/app/modules/Invoice/Invoice.Model'
	,	'Invoice.Collection':'js/src/app/modules/Invoice/Invoice.Collection'
	,	'InvoicePayment.Collection':'js/src/app/modules/Invoice/InvoicePayment.Collection'
	,	'InvoicePayment.Model':'js/src/app/modules/Invoice/InvoicePayment.Model'
	,	'InvoiceDepositApplication.Collection':'js/src/app/modules/Invoice/InvoiceDepositApplication.Collection'
	,	'InvoiceDepositApplication.Model':'js/src/app/modules/Invoice/InvoiceDepositApplication.Model'
	,	'Invoice.OpenList.View':'js/src/app/modules/Invoice/Invoice.OpenList.View'
	,	'Invoice.PaidList.View':'js/src/app/modules/Invoice/Invoice.PaidList.View'
	,	'Invoice.Details.View':'js/src/app/modules/Invoice/Invoice.Details.View'
	,	'Invoice.Router':'js/src/app/modules/Invoice/Invoice.Router'
	,	'Invoice':'js/src/app/modules/Invoice/Invoice'

	,	'DepositApplication': 'js/src/app/modules/DepositApplication/DepositApplication'
	,	'DepositApplication.Model': 'js/src/app/modules/DepositApplication/DepositApplication.Model'
	,	'DepositApplication.Views': 'js/src/app/modules/DepositApplication/DepositApplication.Views'

	,	'Payment.Model':'js/src/app/modules/Payment/Payment.Model'

	,	'CreditMemo' : 'js/src/app/modules/CreditMemo/CreditMemo'
	,	'CreditMemo.Model' : 'js/src/app/modules/CreditMemo/CreditMemo.Model'
	,	'CreditMemo.Collection' : 'js/src/app/modules/CreditMemo/CreditMemo.Collection'
	,	'CreditMemo.Views' : 'js/src/app/modules/CreditMemo/CreditMemo.Views'

	,	'LivePayment.Model' : 'js/src/app/modules/LivePayment/LivePayment.Model'
	,	'LivePayment' : 'js/src/app/modules/LivePayment/LivePayment'

	,	'Deposit' : 'js/src/app/modules/Deposit/Deposit'
	,	'Deposit.Collection' : 'js/src/app/modules/Deposit/Deposit.Collection'
	,	'Deposit.Model' : 'js/src/app/modules/Deposit/Deposit.Model'
	,	'Deposit.Views' : 'js/src/app/modules/Deposit/Deposit.Views'

	,	'ListHeader': 'js/src/app/modules/ListHeader/ListHeader'

	,	'PaymentWizard':'js/src/app/modules/PaymentWizard/PaymentWizard'
	,	'PaymentWizard.Module.Configuration':'js/src/app/modules/PaymentWizard/PaymentWizard.Module.Configuration'
	,	'PaymentWizard.Module.TotalReview':'js/src/app/modules/PaymentWizard/PaymentWizard.Module.TotalReview'
	,	'PaymentWizard.Module.Deposit':'js/src/app/modules/PaymentWizard/PaymentWizard.Module.Deposit'
	,	'PaymentWizard.Module.Invoice':'js/src/app/modules/PaymentWizard/PaymentWizard.Module.Invoice'
	,	'PaymentWizard.Module.ShowInvoices':'js/src/app/modules/PaymentWizard/PaymentWizard.Module.ShowInvoices'
	,	'PaymentWizard.Module.InvoiceSummary':'js/src/app/modules/PaymentWizard/PaymentWizard.Module.InvoiceSummary'
	,	'PaymentWizard.Module.ConfirmationNavigation':'js/src/app/modules/PaymentWizard/PaymentWizard.Module.ConfirmationNavigation'
	,	'PaymentWizard.Module.Summary':'js/src/app/modules/PaymentWizard/PaymentWizard.Module.Summary'
	,	'PaymentWizard.Module.ShowTotal':'js/src/app/modules/PaymentWizard/PaymentWizard.Module.ShowTotal'
	,	'PaymentWizard.Module.ShowPayments':'js/src/app/modules/PaymentWizard/PaymentWizard.Module.ShowPayments'
	,	'PaymentWizard.Router':'js/src/app/modules/PaymentWizard/PaymentWizard.Router'
	,	'PaymentWizard.Step':'js/src/app/modules/PaymentWizard/PaymentWizard.Step'
	,	'PaymentWizard.View':'js/src/app/modules/PaymentWizard/PaymentWizard.View'
	,	'PaymentWizard.EditAmount.View':'js/src/app/modules/PaymentWizard/PaymentWizard.EditAmount.View'

	,	'PaymentMethod' : 'js/src/app/modules/Payment/PaymentMethod'
	,	'MenuTree': 'js/src/core/extras/MenuTree'

	,	'PrintStatement.Views'	:	'js/src/app/modules/PrintStatement/PrintStatement.Views'
	,	'PrintStatement.Model'	:	'js/src/app/modules/PrintStatement/PrintStatement.Model'
	,	'PrintStatement.Router'	:	'js/src/app/modules/PrintStatement/PrintStatement.Router'
	}
,	shim: {

		'Main': {
			deps: ['Backbone']
		}
	,	'ApplicationSkeleton': {
			deps: ['Backbone', 'Utils']
		}
	,	'Utils': {
			deps: ['underscore', 'jQuery', 'StringFormat']
		}
	,	'Application': {
			deps: ['ApplicationSkeleton', 'Main', 'Backbone', 'ExtrasApplicationSkeletonLayout.showContent',
			'ExtrasBackboneView.render', 'ExtrasApplicationSkeletonLayout.showInModal', 'ExtrasBackboneView',
			'ExtrasUnderscoreTemplates']
		}
	,	'ExtrasApplicationSkeletonLayout.showInModal': {
			deps: ['ApplicationSkeleton', 'Bootstrap']
		}
		// extras/
	,	'ExtrasBackboneModel': {
			deps: ['Backbone']
		}
	,	'ExtrasBackboneSync': {
			deps: ['Backbone']
		}
	,	'ProductListItem.Collection': {
			deps: ['ProductListItem.Model']
		}
	,	'ExtrasBackbone.cachedSync': {
			deps: ['Backbone']
		}
	,	'ErrorManagement': {
			deps: ['Backbone', 'Utils']
		}
	,	'ExtrasApplicationSkeletonLayout.showContent': {
			deps: ['ApplicationSkeleton', 'Backbone']
		}
	,	'ExtrasUnderscoreTemplates': {
			deps: ['Main'] //important !
		}
	,	'ExtrasBackboneView.render': {
			deps: ['ExtrasBackboneView', 'ExtrasUnderscoreTemplates', 'BackboneValidation']
		}
	,	'ExtrasBackboneView': {
			deps: ['Backbone']
		}

	,	'NavigationHelper': {
			deps: ['UrlHelper']
		}

	,	'ItemsKeyMapping': {
			deps: ['underscore']
		}

	,	'UrlHelper': {
			deps: ['Backbone', 'Utils']
		}

	,	'Facets.Translator': {
			deps: ['Backbone']
		}
	,	'Facets.Views': {
			deps: ['Bootstrap.Slider']
		}

	,	'ItemDetails.Model': {
			deps: ['ExtrasBackbone.cachedSync']
		}

	,	'ListHeader' : {
			deps: ['Backbone', 'Utils']
		}

	,	'OrderWizard.Router': {
			deps: ['Backbone', 'underscore', 'Utils', 'UrlHelper', 'SC.ENVIRONMENT','Bootstrap']
		}

	,	'BackToTop': {
			deps: ['Utils']
		}

	,	'PromocodeSupport': {
			deps: ['Utils']
		}

	,	'LiveOrder.Model': {
			deps: ['Backbone']
		}

		// Content
	,	'Content': {
			deps: ['Content.DataModels', 'Content.LandingPages', 'Content.EnhancedViews', 'Utils']
		}
	,	'Content.DataModels': {
			deps: ['ExtrasBackbone.cachedSync']
		}

		// Payments / Billing
	,	'PaymentWizard' : {
			deps: ['Utils','ExtrasBackboneView', 'ExtrasUnderscoreTemplates', 'BackboneValidation']
		}
	,	'Deposit' : {
			deps: ['Utils','ExtrasBackboneView', 'ExtrasUnderscoreTemplates', 'BackboneValidation']
		}
	,	'Deposit.Views': {
			deps: ['Utils','ExtrasBackboneView', 'ExtrasUnderscoreTemplates', 'BackboneValidation']	
		}
	,	'DepositApplication' : {
			deps: ['Utils','ExtrasBackboneView', 'ExtrasUnderscoreTemplates', 'BackboneValidation']
		}
	,	'DepositApplication.Views': {
			deps: ['Utils','ExtrasBackboneView', 'ExtrasUnderscoreTemplates', 'BackboneValidation']	
		}
	,	'CreditMemo' : {
			deps: ['Utils','ExtrasBackboneView', 'ExtrasUnderscoreTemplates', 'BackboneValidation']
		}
	,	'PaymentWizard.EditAmount.View' : {
			deps: ['Utils','ExtrasBackboneView', 'ExtrasUnderscoreTemplates', 'BackboneValidation']
		}
	,	'OrderPaymentmethod.Model' : {
			deps: ['Utils','ExtrasBackboneView', 'ExtrasUnderscoreTemplates', 'BackboneValidation']
		}
	,	'Invoice' : {
			deps : ['Invoice.Model', 'Invoice.Collection', 'Invoice.Details.View','Invoice.PaidList.View','Invoice.OpenList.View', 'Invoice.Router']
		}
	,	'Invoice.Details.View' : {
			deps: ['Utils','ExtrasBackboneView', 'ExtrasUnderscoreTemplates', 'BackboneValidation']
		}
	,	'Invoice.Model' : {
			deps: ['Utils','ExtrasBackboneView', 'ExtrasUnderscoreTemplates', 'BackboneValidation']
		}
	,	'PaymentWizard.Module.ConfirmationNavigation' : {
			deps: ['Utils','ExtrasBackboneView', 'ExtrasUnderscoreTemplates', 'BackboneValidation']
		}
		// Address
	,	'Address': {
			deps: ['Utils','ExtrasBackboneView', 'ExtrasUnderscoreTemplates', 'BackboneValidation']
		}
	,	'Address.Views': {
			deps: ['Utils','ExtrasBackboneView', 'ExtrasUnderscoreTemplates', 'BackboneValidation']
		}
	,	'Address.Model': {
			deps: ['Utils','ExtrasBackboneView', 'ExtrasUnderscoreTemplates', 'BackboneValidation']
		}

		// ProductList
	,	'ProductList.Model': {
			deps: ['Utils', 'ExtrasBackboneModel', 'ExtrasBackboneSync']
		}
	,	'ProductList.Collection': {
			deps: ['ProductList.Model']
		}
	,	'ProductListItem.Model': {
			deps: ['Utils', 'ExtrasBackboneModel', 'ExtrasBackboneSync']
		}
	,	'ProductListDetails.View': {
			deps: ['ExtrasBackboneView', 'ExtrasUnderscoreTemplates', 'BackboneValidation', 'ExtrasBackboneView.render']
		}
	,	'ProductListMenu.View': {
			deps: ['ExtrasBackboneView', 'ExtrasUnderscoreTemplates', 'BackboneValidation', 'ExtrasBackboneView.render']
		}
	,	'ProductListDeletion.View': {
			deps: ['ExtrasBackboneView', 'ExtrasUnderscoreTemplates', 'BackboneValidation', 'ExtrasBackboneView.render']
		}
	,	'ProductListControl.Views': {
			deps: ['ExtrasBackboneView', 'ExtrasUnderscoreTemplates', 'BackboneValidation', 'ExtrasBackboneView.render']
		}
	,	'ProductListAddedToCart.View': {
			deps: ['ExtrasBackboneView', 'ExtrasUnderscoreTemplates', 'BackboneValidation', 'ExtrasBackboneView.render']
		}
	,	'ProductList.Router' : {
			deps: ['Backbone']
		}

		//Wizard
	,	'Wizard' : {
			deps: ['Utils','ExtrasBackboneView', 'ExtrasUnderscoreTemplates', 'BackboneValidation']
		}
	,	'Wizard.Module' : {
			deps: ['Utils','ExtrasBackboneView', 'ExtrasUnderscoreTemplates', 'BackboneValidation']
		}
	,	'Wizard.View' : {
			deps: ['Utils','ExtrasBackboneView', 'ExtrasUnderscoreTemplates', 'BackboneValidation']
		}
	,	'Wizard.Step' : {
			deps: ['Utils','ExtrasBackboneView', 'ExtrasUnderscoreTemplates', 'BackboneValidation']
		}

	,	'CreditCard.Model': {
			deps: ['Utils','ExtrasBackboneView', 'ExtrasUnderscoreTemplates', 'BackboneValidation']
		}
	,	'MenuTree':
		{
			deps: ['Backbone', 'underscore', 'jQuery']
		}

	,	'PrintStatement.Router' : {
			deps	:	['Backbone']
		}
	,	'PrintStatement.Views'	:{
			deps:['ErrorManagement', 'jquery.serializeObject','Backbone.View.saveForm']
		}
	}
});
