function suitelet(request, response){
	var customerid = request.getParameter('customerid');
	var leadsource = request.getParameter('leadsource');
	
	switch (leadsource) {
	case '17':
		leadsource = '17 B2B_Facebook_Offer';
		break;
	case '18':
		leadsource = '18 B2B_Paid Search_Offer';
		break;
	case '19':
		leadsource = '19 B2B_Paid Search_NoOffer';
		break;
	case '23':
		leadsource = '23 B2B_LiveIntent_NoOffer';
		break;
	default: //16
		leadsource = '16 B2B_Facebook_NoOffer';
	}
	var customerRec = nlapiLoadRecord('customer', customerid);
	if (customerRec != null) {
		customerRec.setFieldText('leadsource', leadsource);
		nlapiSubmitRecord(customerRec);
	}
}