/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       19 Feb 2013     esia
 * 2.00		  17 Apr 2013	  esia			   246651
 *
 */

/**
 * @param {Number} toversion
 * @returns {Void}
 */
function beforeInstallUpdate(toversion) {
	var advStoreFrontFeature = nlapiGetContext().getFeature('suitecommerceenterprise');
	if (!advStoreFrontFeature) {
		throw new nlobjError('INSTALLATION_ERROR', 'This bundle requires that the Suitecommerce Advanced feature be enabled.');
	}
}
