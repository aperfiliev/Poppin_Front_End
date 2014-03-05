
$(".search-social").append($(".free-shipping-container"));
$(".breadcrumbs").css("display", "none");
$("#contentBody").css("padding-bottom", "0");
$("#contentBody").parent().next().remove();
$("#div__body").css("padding-bottom", "0");

/* say-no layover functions */
$(document).ready(function() {
	$('body').on('click','#leadform-overlay, .close-button', function(){
		closeLeadForm();
	});
	$('body').on('click','.number a', function(){
		openLeadForm();
	});
});

/* end of say-no layover functions */

/* lead form functions */
/*
 * GA event and declare lead form
 */
function campaignCheck() {
	var regex = /[?&]([^=#]+)=([^&#]*)/g,
	url = window.location.href,
	_form_url = 'undefined',
	_label = 'undefined',
	_leadsource = '22 SEMOFFICE',
	params = {},
	match;
	
	while(match = regex.exec(url)) {
		params[match[1]] = match[2];
	}
	
	// choke for getting leadsource from cookies
	if(true) {
		_leadsource = '22 SEMOFFICE';
	}
	
	_form_url = 'http://sandbox.poppin.com/app/site/crm/externalleadpage.nl?compid=3363929&amp;formid=35&amp;h=9e753133b4b54c4283bf&amp;leadsource='+_leadsource;
	
	switch (params.campaign_id) {
	case '2':
		_label = 'campaign_id = 2';
		break;
	case '3':
		_label = 'campaign_id = 3';
		break;
	case '4':
		_label = 'campaign_id = 4';
		break;
	default:
		_label = 'campaign_id = 1';
	}
	
	createLeadForm(_form_url);
	_gaq.push(['_trackEvent', 'Office-Supplies', 'Landing Page', _label]);
}
campaignCheck();

function createLeadForm(url) {
	var leadformHtml = '<div id="leadform-overlay">' +
		 '<div class="leadform">' +
		 '<iframe scrolling="no" frameborder="0" allowtransparency="yes" marginheight="0" marginwidth="0" src="'+url+'" style="width: 785px;height: 612px;overflow: hidden;"></iframe>' +
		 '<div class="close-button"></div>' +
		 '</div>' +
		 '</div>';
	jQuery("#office-supplies").append(leadformHtml);
}
function openLeadForm() {
	jQuery("#leadform-overlay").css("display", "block");
}
function closeLeadForm() {
	jQuery("#leadform-overlay").css("display", "none");
}
/* end of lead form functions */
