// Copyright (c) 2008 Camrivox Ltd.
//
// Search for an entity match to a phone number
//
// This should be installed into NetSuite as a Suitelet with the following
// parameters.
// Script Name: camrivoxContactLookupSuitelet
// Script ID: customscript_camrivox_contactlookup
// Script function: camrivoxFindContactSuitelet
// Deployment Title: camrivoxContactLookupSuitelet (automatic)
// Deployment ID: customdeploy_camrivox_contactlookup
// Roles: All Roles
// Groups: All Employees
// Execute as admin: No
// Available without login: No

// A search object to keep the code tidy

function Search(number,op,allMatches,allFields) {
    this.phoneNumber = number;
    this.searchOp = op;
    this.allMatches = allMatches;
    this.allFields = allFields;

    this.errors = '';
    this.results = '';

    this.doSearch = Search_doSearch;
}

// Convert a string to a form acceptable as the contents of
// an XML element - any of "'&<> have to be converted to
// entity references
function xmlify(i) {
    if(typeof i!="string") {
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

function camrivoxFindContactSuitelet(request,response) {
    var phoneNumber = request.getParameter('phoneNumber');
    
    // Perform the search
    var searchOp = request.getParameter('searchOp');

    // Default to exact search.
	if(!searchOp || searchOp.length==0) {
	    searchOp = 'is';
	}

	// allMatches defines whether or not all matching records are to
	// be returned, or just the first
	var allMatches = false;

	// allFields defines whether to search all possible phone number
	// fields for a record, or just the 'main' one
	var allFields = false;

	var matches = request.getParameter('matchBehaviour');
	if(matches && matches.length>0) {
	    allMatches = (matches.indexOf('M')!=-1);
	    allFields = (matches.indexOf('F')!=-1);
	}

	var search = new Search(phoneNumber,searchOp,allMatches,allFields);

	// recordTypes specifies which record types to search. The order
	// in which they are searched is fixed, for now.
	var recordTypes = request.getParameter('recordTypes');
	if(!recordTypes || recordTypes.length==0) {
	    // If not specified, search all record types
	    recordTypes = 'CoCuEmLePaVe';
	}

	// Set up the XML container
	response.write("<?xml version='1.0'?><searchResults><contacts>\n");

	// Go for a contact first - configurable?
	if(recordTypes.indexOf('Co')!=-1) {
	    searchContacts(search);
	}

	if(search.results.length==0 || search.allMatches) {
	    if(recordTypes.indexOf('Cu')!=-1) {
		searchCustomers(search);
	    }
	}

	if(search.results.length==0 || search.allMatches) {
	    if(recordTypes.indexOf('Em')!=-1) {
		searchEmployees(search);
	    }
	}

	if(search.results.length==0 || search.allMatches) {
	    if(recordTypes.indexOf('Le')!=-1) {
		searchLeads(search);
	    }
	}

	if(search.results.length==0 || search.allMatches) {
	    if(recordTypes.indexOf('Pa')!=-1) {
		searchPartners(search);
	    }
	}

	if(search.results.length==0 || search.allMatches) {
	    if(recordTypes.indexOf('Ve')!=-1) {
		searchVendors(search);
	    }
	}

	if(search.results.length>0) {
	    response.write(search.results);
	} else {
	    // No contacts available
	}
	response.write("</contacts>\n");

	if(search.errors.length>0) {
	    response.write("<errors>\n"+search.errors+"</errors>\n");
	}
	response.write("</searchResults>\n");
}

// Write the XML fragment for a found contact
function writeContact(id,type,phoneNumber,name,company,companyId) {
    var xmlFragment = "<contact id='"+id+"'>";
    xmlFragment += "<type>"+xmlify(type)+"</type>";
    xmlFragment += "<name>"+xmlify(name)+"</name>";
    xmlFragment += "<number>"+xmlify(phoneNumber)+"</number>";
    xmlFragment += "<company>"+xmlify(company)+"</company>";
    xmlFragment += "<companyId>"+xmlify(companyId)+"</companyId>";
    xmlFragment += "</contact>\n";

    return xmlFragment;
}

// Form a name from the various name fields of a record
function getName(salutation,firstName,lastName,entityId)
{
    var name = "";

    var hasSalutation = (salutation && salutation.length>0);
    var hasFirstName = (firstName && firstName.length>0);
    var hasLastName = (lastName && lastName.length>0);
    var hasEntityId = (entityId && entityId.length>0);

    // If we are lacking name details, but have an external id,
    // use that
    if(hasEntityId && !(hasFirstName && hasLastName)) {
	name = entityId;
    } else {
	if(hasSalutation) {
	    name += salutation+" ";
	}

	if(hasFirstName) {
	    name += firstName+" ";
	}

	if(hasLastName) {
	    name += lastName;
	}
    }

    return name;
}

// Common function to generate the contact information for records which
// are 'organisations' - partner, customer, vendor
// It expects the searchResult parameter to support columns:
// companyName,entityId,saluation,firstName,lastName,isPerson
function writeOrganisationResult(recordType,searchResult,matchedNumberField) {
    var company = searchResult.getValue('companyName');
    var entityId = searchResult.getValue('entityId');

    var name = null;

    // Depending whether the record is for a person, use the
    // entityId as a stand-by for one of the fields
    var personEntity = null;
    var companyEntity = null;

    if(searchResult.getValue('isPerson')=='T') {
	personEntity = entityId;
    } else {
	companyEntity = entityId;
    }

    name = getName(searchResult.getValue('salutation'),
		   searchResult.getValue('firstName'),
		   searchResult.getValue('lastName'),
		   personEntity);

    if(!company || company.length==0) {
	company = companyEntity;
    }

    return writeContact(searchResult.getId(),recordType,
			searchResult.getValue(matchedNumberField),name,company);
}

// For future, should support special contact form showing e.g. open cases,
// orders, invoices, for a given phone number/contact

// ------------------ Customer search criteria --------------------

function searchCustomers(search) {
    var searchFields = new Array('phone','altPhone','mobilePhone','homePhone');

    var resultColumns = new Array('salutation','firstName','lastName','companyName',
			    'isPerson','entityId');

    // Example of more advanced searching - search mobile and home phone fields
    // only for customers who are a 'person'. Not actually necessary, but
    // at the moment NS does not support searching on these fields anyway.
    if(search.phoneNumber) {
      var mobileSearch = new Array();
      mobileSearch[0] = new nlobjSearchFilter('mobilePhone',null,search.searchOp,search.phoneNumber,null);
      mobileSearch[1] = new nlobjSearchFilter('isPerson',null,'is','T',null);

      var homeSearch = new Array();
      homeSearch[0] = new nlobjSearchFilter('homePhone',null,search.searchOp,search.phoneNumber,null);
      homeSearch[1] = new nlobjSearchFilter('isPerson',null,'is','T',null);

      searchFields = new Array('phone','altPhone',mobileSearch,homeSearch);

      // As we have hidden the mobile and home fields in specific searches, we need to add these
      // explicitly as result columns.
      resultColumns = new Array('salutation','firstName','lastName','companyName',
			    'isPerson','entityId','mobilePhone','homePhone');

    }

    search.doSearch('customer',searchFields,resultColumns,writeCustomerResult);
}

function writeCustomerResult(searchResult,matchedNumberField) {
    return writeOrganisationResult('customer',searchResult,matchedNumberField);
}

// ------------------ Contact search criteria --------------------

function searchContacts(search) {
    var searchFields = new Array('phone','mobilePhone','officePhone','homePhone');

    var companyJoin = new Array('companyname','company');
    var resultColumns = new Array('salutation','firstName','lastName','entityId','company',companyJoin);

    search.doSearch('contact',searchFields,resultColumns,writeContactResult);
}

function writeContactResult(searchResult,matchedNumberField) {
    var name = getName(searchResult.getValue('salutation'),
    		       searchResult.getValue('firstName'),
    		       searchResult.getValue('lastName'),
    		       searchResult.getValue('entityId'));

    var company = searchResult.getValue('companyname','company');
    var companyId = searchResult.getValue('company');

    return writeContact(searchResult.getId(),'contact',
			searchResult.getValue(matchedNumberField),name,company,companyId);
}

// ------------------ Employee search criteria --------------------

// Employee records actually have the same fields as contacts.
function searchEmployees(search) {
    var searchFields = new Array('phone','mobilePhone','officePhone','homePhone');

    var resultColumns = new Array('salutation','firstName','lastName','entityId');

    search.doSearch('employee',searchFields,resultColumns,writeEmployeeResult);
}

function writeEmployeeResult(searchResult,matchedNumberField) {
    var name = getName(searchResult.getValue('salutation'),
		       searchResult.getValue('firstName'),
		       searchResult.getValue('lastName'),
		       searchResult.getValue('entityId'));

    return writeContact(searchResult.getId(),'employee',
			searchResult.getValue(matchedNumberField),name);
}

// ------------------ Lead search criteria --------------------

function searchLeads(search) {
    var searchFields = new Array('phone','addressPhone','mobilePhone',
				 'altPhone','homePhone');

    var resultColumns = new Array('salutation','firstName','lastName',
				  'companyName','isPerson','entityId');


    search.doSearch('lead',searchFields,resultColumns,writeLeadResult);
}

function writeLeadResult(searchResult,matchedNumberField) {
    return writeOrganisationResult('lead',searchResult,matchedNumberField);
}


// ------------------ Partner search criteria --------------------

function searchPartners(search) {
    var searchFields= new Array('phone','mobilePhone','homePhone');

    var resultColumns = new Array('salutation','firstName','lastName','companyName','isPerson','entityId');

    search.doSearch('partner',searchFields,resultColumns,writePartnerResult);
}

function writePartnerResult(searchResult,matchedNumberField) {
    return writeOrganisationResult('partner',searchResult,matchedNumberField);
}

// ------------------ Vendor search criteria --------------------

function searchVendors(search) {
    var searchFields= new Array('phone','mobilePhone','homePhone');

    var resultColumns = new Array('salutation','firstName','lastName','companyName','isPerson','entityId');

    search.doSearch('vendor',searchFields,resultColumns,writeVendorResult);
}

function writeVendorResult(searchResult,matchedNumberField) {
    return writeOrganisationResult('vendor',searchResult,matchedNumberField);
}

// ------------------- Generic search function -------------------

function Search_doSearch(recordType,searchFields,resultColumns,makeResultFn)
{
    // Set up the result column array
    var columns = new Array();
    for(var c = 0;c<resultColumns.length;++c) {
	var column = resultColumns[c];

	// If the column is an array, assume it specifies a join column
	if(column instanceof Array) {
	    columns[c] =
		new nlobjSearchColumn(column[0],column[1]);
	} else {
	    columns[c] =
		new nlobjSearchColumn(column);
	}
    }
    
    var carryOn = true;

    var numFields = searchFields.length;
    if(!this.allFields) {
	numFields = 1;
    }

    for(var f = 0;f<numFields && carryOn;++f) {
	var filters;

	// Allow callers to specify more complex search expressions directly,
	// if not assume the element is the name of the field to check against
	// the number
	var searchField = searchFields[f];
	if(searchField instanceof Array) {
	    filters = searchField;
	} else {
            if(this.phoneNumber) {
  	      filters = new Array();
	      filters[0] =
		new nlobjSearchFilter(searchField,null,this.searchOp,this.phoneNumber,'@NONE@');
            }

  	    // Add in the search field as a result column so we know the exact
	    // number matched against
	    columns[resultColumns.length] = new nlobjSearchColumn(searchFields[f]);
	}

	var searchResults = null;
	try {
	    searchResults = nlapiSearchRecord(recordType,null,filters,columns);
	} catch(e) {
	    this.errors += "<error><exception>"+xmlify(e.toString())+"</exception><recordType>"+xmlify(recordType)+"</recordType><filter>"+xmlify(searchField)+"</filter></error>\n";
	}

	if(searchResults) {
	    for(var r = 0;r<searchResults.length;++r) {
		this.results += makeResultFn(searchResults[r],searchFields[f]);

		if(!this.allMatches) {
		    carryOn = false;
		}
	    }
	}
    }
}


    
