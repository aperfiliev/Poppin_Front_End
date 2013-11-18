// OrderWizard.Module.Address.Billing.js
// -------------------------------------
// 
define('OrderWizard.Module.Address.Billing', ['OrderWizard.Module.Address'],  function (OrderWizardModuleAddress)
{
	'use strict';

	return OrderWizardModuleAddress.extend({

		manage: 'billaddress'
	,	sameAsManage: 'shipaddress'

	,	errors: ['ERR_CHK_INCOMPLETE_ADDRESS', 'ERR_CHK_SELECT_BILLING_ADDRESS', 'ERR_CHK_INVALID_BILLING_ADDRESS', 'ERR_WS_INVALID_BILLING_ADDRESS']
	,	sameAsMessage: _('Same as shipping address').translate()

	,	selectAddressErrorMessage: {
			errorCode: 'ERR_CHK_SELECT_BILLING_ADDRESS'
		,	errorMessage: _('Please select a billing address').translate()
		}

	,	invalidAddressErrorMessage: {
			errorCode: 'ERR_CHK_INVALID_BILLING_ADDRESS'
		,	errorMessage: _('The selected billing address is invalid').translate()
		}
	});
});
