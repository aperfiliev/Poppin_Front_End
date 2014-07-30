
function beforeSubmit_override_address(type){
    if (type == 'create' || type == 'edit') {
        var so = nlapiGetNewRecord();
		var shipaddressee = so.getFieldValue('shipaddressee');
		var billaddressee = so.getFieldValue('billaddressee');
		var shipaddress = so.getFieldValue('shipaddress');
		var billaddress = so.getFieldValue('billaddress');
		if (shipaddressee){
			var newShipAddressee = shipaddressee.replace(',',' ').replace('Mr.','Mr. ').replace('Mrs/Ms.','Mrs/Ms. ');
			so.setFieldValue('shipaddressee',newShipAddressee);
			var newShipAddress = shipaddress.replace(shipaddressee, newShipAddressee);
			so.setFieldValue('shipaddress',newShipAddress);
		}
		if (billaddressee){
			var newBillAddressee = billaddressee.replace(',',' ').replace('Mr.','Mr. ').replace('Mrs/Ms.','Mrs/Ms. ');
			so.setFieldValue('billaddressee',newBillAddressee);
			var newBillAddress = billaddress.replace(billaddressee, newBillAddressee);
			so.setFieldValue('billaddress', newBillAddress);
		}
    }
}