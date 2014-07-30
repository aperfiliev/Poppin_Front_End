var AdvPromo;
if (!AdvPromo) { AdvPromo = {}; }

AdvPromo.GlobalConstants = new function GlobalConstants() {
	
	this.CONST_ELIGIBILITY_CUSTOMER_TYPE_SAVED_SEARCH = 1;
	this.CONST_ELIGIBILITY_CUSTOMER_TYPE_CUSTOMER = 2;
	
	this.CONST_POPUP_WINNAME = 'thepopup'; // do not change this, otherwise, Groovy calls to setPopUpAsContext() will fail
	
};