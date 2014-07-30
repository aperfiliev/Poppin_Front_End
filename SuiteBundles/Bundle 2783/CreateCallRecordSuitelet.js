// Create a 'journal' (call record) form for an entity.
// 
// It can create both Phone Call and Note records on an entity.
//
// Note form parameters:
//  title=<subject of note>
//  message=<memo contents of note>
//  contactId=<NS id of target record>
//  writeNote=yes
//  optional: recordType=<record type of contact, default is 'entity'>
//
// Phone Call form parameters:
//  title=<subject of call>
//  message=<contents of note>
//  contactId=<NS id of target record>
//  contactType=<type of target record>
//  optional: companyId=<id of company target record is attached to>
//     For contact and employee records, the companyId needs to be specified or the record
//     cannot be attached.
//  startTime=<start time of call, 24 hour format 'HH:mm'>
//  endTime=<end time of call, 24 hour format 'HH:mm'>
//  timeFormat=[0-3] 0=>hh:mm am/pm 1=>HH:mm 2=>hh-mm am/pm 3=>HH-mm
//  optional: phoneNumber=<number involved in call>
//
// This should be installed into NetSuite as a Suitelet with the following
// parameters.
// Script Name: camrivoxCreateCallRecordSuitelet
// Script ID: customscript_camrivox_createcallrecord
// Script Function: camrivoxCreateCallRecordSuitelet
// Deployment Title: camrivoxCreateCallRecordSuitelet (automatic)
// Deployment ID: customdeploy_camrivox_createcallrecord
// Roles: All Roles
// Groups: All Employees
// Execute as admin: No
// Available without login: No

// Convert a string to a form acceptable as the contents of
// an XML element - any of "'&<> have to be converted to
// entity references
function xmlify(i) {
    if(!i) {
	return '';
    }

   // Replace ampersands first, as they appear in the
   // other entity references
   var o = i.replace(/&/g,"&amp;");
   o = o.replace(/</g,"&lt;");
   o = o.replace(/>/g,"&gt;");
   o = o.replace(/'/g,"&apos;");
   o = o.replace(/"/g,"&quot;");

   return o;
}

function readTime(ts) {
    var time = null;

    if(ts) {
	var fields = ts.split(':');
	if(fields.length==2) {
	    try {
		time = new Array();
		time[0] = parseInt(fields[0]);
		time[1] = parseInt(fields[1]);
	    } catch(e) {
	    }
	}
    }
    return time;
}

function formatTime(time,formatIndex) {
    // Ignore the format index for now
    var textTime;

    var separator = '-';

    switch(formatIndex) {
    default:
    case 0:
	separator = ':';
    case 2:
	// 12-hour
	if(time[0]>11) {
	    if(time[0]>12) {
		textTime = (time[0]-12)+separator+time[1]+' pm';
	    } else {
		textTime = '12'+separator+time[1]+' pm';
	    }
	} else if(time[0]==0) {
	    textTime = '12'+separator+time[1]+' am';
	} else {
	    textTime = time[0]+separator+time[1]+' am';
	}
	break;
    case 1:
	separator = ':';
    case 3:
	// 24-hour
	textTime = time[0]+separator+time[1];
	break;
    }
    return textTime;
}

function daysInMonth(month,year) {
    var monthDays = new Array(31,28,31,30,31,30,31,31,30,31,30,31);

    var d = monthDays[month];
    if(d==28) {
	// February
	if(year%4==0 && (year%100!=0 || year%400==0)) {
	    // Leap year
	    d = 29;
	}
    }
    return d;
}

function createNoteRecord(title,message,recordId) {
    var result = null;

    try {
	var newNote = nlapiCreateRecord('note');

	newNote.setFieldValue('title',title);

	// For future use: allow the caller to specify the record type.
	// Currently, all the records we deal with are of type 'entity'
	var recordType = request.getParameter('recordType');
	if(!recordType) {
	    recordType = 'entity';
	}

	newNote.setFieldValue(recordType,recordId);
	
	newNote.setFieldValue('note',message);

	var noteId = nlapiSubmitRecord(newNote,true);

	result = "<noteId>"+noteId+"</noteId>";
    } catch(e) {
	result = "<error>Exception: "+xmlify(e)+"</error>";
    }
    return result;
}

function camrivoxCreateCallRecord(request,response) {

    response.write("<?xml version='1.0'?><createCallRecord>");

    var title = request.getParameter('title');
    var message = request.getParameter('message');

    var writeNote = (request.getParameter('writeNote')!=null);

    if(title && message) {

	try {

	    var contactId = request.getParameter('contactId');

	    if(writeNote) {
		if(contactId) {
		    response.write(createNoteRecord(title,message,contactId));
		} else {
		    response.write("<error>No contact Id to write note for</error>");
		}
	    } else {
	    
		var callStart = readTime(request.getParameter('callStart'));
		
		if(callStart) {
		    var callEnd = readTime(request.getParameter('callEnd'));
		    // Have to have an end time which is later than the start time
		    if(!callEnd || (callEnd[0]==callStart[0] && callEnd[1]==callStart[1])) {
			callEnd = new Array();
			callEnd[0] = callStart[0];
			callEnd[1] = callStart[1]+1;
			if(callEnd[1]==60) {
			    callEnd[1] = 0;
			    callEnd[0] = callEnd[0]+1;
			    if(callEnd[0]==24) {
				callEnd[0] = 0;
			    }
			}
		    }

		    var date = new Date();
	    
		    if(callEnd) {
			if(callEnd[0]<callStart[0] ||
			   (callEnd[0]==callStart[0] && callEnd[1]<callStart[1])) {
			    // call ended earlier in the day that it started - so
			    // it must have started the previous day
			    var newDay = date.getDate()-1;
			    var newMonth = date.getMonth();
			    var newYear = date.getFullYear();
			    if(newDay<1) {
				newDay = daysInMonth(newMonth,newYear);
				newMonth = newMonth - 1;
			    
				if(newMonth<0) {
				    newMonth = 11;
				    newYear = newYear - 1;
				}
			    }
			    date = new Date(newYear,newMonth,newDay);
			}
		    }
		}

		var newCall = nlapiCreateRecord('phonecall');

		if(date) {
		    newCall.setFieldValue('startdate',nlapiDateToString(date));
		    if(callStart) {
			var timeFormat = 0;
			var timeFormatParam = request.getParameter('timeFormat');
			if(timeFormatParam) {
			    try {
				timeFormat = parseInt(timeFormatParam);
				if(timeFormat<0 || timeFormat>3) {
				    timeFormat = 0;
				}
			    } catch(e) {
			    }
			} 

			newCall.setFieldValue('timedevent','T');
			newCall.setFieldValue('starttime',formatTime(callStart,timeFormat));
			if(callEnd) {
			    newCall.setFieldValue('endtime',formatTime(callEnd,timeFormat));
			}
		    }
		}

		// Check for non-compulsory fields
		var phoneNumber = request.getParameter('phoneNumber');
		if(phoneNumber) {
		    newCall.setFieldValue('phone',phoneNumber);
		}

		var companyId = request.getParameter('companyId');
		var contactType = request.getParameter('contactType');
		if(!companyId) {
		    if(contactId && contactType) {
			if(contactType=='contact' || contactType=='employee') {

			    var contact = nlapiLoadRecord(contactType,contactId);
			    var companyId = contact.getFieldValue('company');
			    if(companyId) {
				newCall.setFieldValue('contact',contactId);
				newCall.setFieldValue('company',companyId);
			    } else {
				// Without a company Id, the contact ID cannot be set.
				// Add the contact's name to the title
				var firstName = contact.getFieldValue('firstname');
				var lastName = contact.getFieldValue('lastname');
				if(firstName && lastName) {
				    title += ' ('+contactType+' '+firstName+' '+lastName+')';
				}
			    }
			} else {
			    newCall.setFieldValue('company',contactId);
			}
		    }
		} else {
		    newCall.setFieldValue('company',companyId);
		    if(contactId) {
			newCall.setFieldValue('contact',contactId);
		    }
		}

		newCall.setFieldValue('title',title);
		newCall.setFieldValue('message',message);
		newCall.setFieldValue('status','COMPLETE');

		var callId = nlapiSubmitRecord(newCall,true);
	    
		response.write("<callRecordId>"+callId+"</callRecordId>");
	    }

	} catch(e) {
	    response.write("<error>Exception: "+e+"</error>");
	}
    } else {
	response.write("<error>");
	if(!title) {
	    response.write("No title");
	    if(!message) {
		response.write(" or message");
	    }
	} else {
	    response.write("No message");
	}
	response.write(" given</error>");
    }
    response.write("</createCallRecord>");
}
