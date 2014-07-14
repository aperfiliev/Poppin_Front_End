function checkUrl() {
	var regex = /[?&]([^=#]+)=([^&#]*)/g,
	_category = 'undefined',
	_action = 'undefined',
	_label = 'undefined',
	url = window.location.href,
	params = {},
	match;
	
	while(match = regex.exec(url)) {
		params[match[1]] = match[2];
	}
	if(params._trackEvent !== undefined && params._trackEvent !== null) {
		var _trackEvent = params._trackEvent.split(':');
		switch (_trackEvent[0]) {
		case '0':
			_category = 'Poppin Marketing Email';
			break;
		default:
			_category = 'Event Category';
		}
		
		switch (_trackEvent[1]) {
		case '0':
			_action = 'Welcome Email';
			break;
		case '1':
			_action = 'Poppin-Gift Card';
			break;
		case '2':
			_action = 'Poppin-Password Recovery';
			break;
		case '3':
			_action = 'Poppin-Return (Credit Memo)';
			break;
		case '4':
			_action = 'Poppin-Order Recieved';
			break;
		case '5':
			_action = 'Poppin-Order Fulfilled';
			break;			
		case '6':
			_action = 'Poppin Subscribe or Unsubscribe';
			break;				
		default:
			_action = 'Event Action';
		}
		
		switch (_trackEvent[2]) {
		case '0':
			_label = 'NOTEBOOKS';
			break;
		case '1':
			_label = 'WRITING';
			break;
		case '2':
			_label = 'DESK ACCESSORIES';
			break;
		case '3':
			_label = 'FURNITURE+DECOR';
			break;
		default:
			_label = 'Event Label';
		}
		_gaq.push(['_trackEvent', _category, _action, _label]);
	}
}
// URL should contain _trackEvent param. ex: http://sandbox.poppin.com/Notebooks-/?_trackEvent=0:1:1

checkUrl();