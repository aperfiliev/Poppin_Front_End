function QadComponent(name, inputId)
{
	/// represents a particular component of an address
	/// and "wraps" a particular DOM input element

	var CHANGED_DELAY = 25; // delay in milliseconds that the component changed event should wait before it fires.

	var _this = this;

	// variables

	// the name of the component
	var _name = "";

	/// the DOM element ID being held
	var _elementId = "";
	/// the DOM element being held
	var _element = null;

	var _currentValue = ""; // the current value
	var _previousValue = ""; // the previous value

	// a value which indicates if the DOM element held by the component is an input type=text or select dropdown list.
	var _isTextbox = true;

	// listeners to an event that fires when values in object are modified.
	var _changed = undefined;

	_this.name = function() { return _name; };
	_this.isTextbox = function() { return _isTextbox; };
	_this.id = function() { return _elementId; };

	// override to string to make display easier to read
	_this.toString = function() { return _this.value(); };

	/// gets a value which indicates if the object contains/holds a DOM element (in a jQuery wrapper)
	_this.hasElement = function() { return undefined !== _element && null !== _element; };

	/// gets a value which indicates if the DOM element held contains a value
	_this.hasValue = function() { _this.recompute(); return _this.hasElement() && !jQuery.isNullOrEmpty(_this.value()); };

	/// gets the previous value held in the component.
	_this.previousValue = function() { return _previousValue; };

	var internalValue = function()
	{
		// private: gets the value of the component from the DOM control which hosts it

		// no element from which to get a value, return whatever we've already got
		if (!_this.hasElement())
		{
			return _currentValue;
		}

		// element is a select list - get its value.
		if (!_this.isTextbox())
		{
			return _element.selectValue();
		}

		var raw = jQuery.trim(_element.val());

		// no value held, return emtpy
		if (jQuery.isNullOrEmpty(raw))
		{
			return "";
		}

		// get rid of multiple consecutive spaces.
		var clean = raw;
		while (clean.indexOf("  ") >= 0)
		{
			clean = clean.replace("  ", " ");
		}

		// multiple consecutive spaces found, overwrite control with clean value.
		if (clean !== raw)
		{
			_this.value(clean);
		}

		return clean;
	};
	_this.value = function(value, text)
	{
		/// public: gets or set the value of the component (if corresponding input element has been attached)
		/// value: if specified acts as the setting value for the control.
		/// text: optional display text for control (select/dropdowns only)

		if (undefined === value)
		{
			return _currentValue;
		}

		// set accessor (when input param provided)
		if (!_this.hasElement())
		{
			return;
		}

		if (jQuery.isNullOrEmpty(value))
		{
			value = "";
		}

		_previousValue = _currentValue;
		_currentValue = value;

		// it's a textbox, set the value and bail
		if (_this.isTextbox())
		{
			return _element.val(value);
		}

		// dropdown list, list contains input, select it
		if (_element.selectContains(value) < 0)
		{
			// the option isn't found in the select, add it and select it
			_element.addOption(value, jQuery.isNullOrEmpty(text) ? value : text);
		}

		_element.selectOption(value);
	};

	_this.form = function()
	{
		// public: gets the reference to the form that the element is on.

		if (!_this.hasElement())
			return null;

		return _element.parents("form")[0];
	}

	_this.submitEvent = function(listener)
	{
		// public: subscribes to the form submit event.
		// listener: the callback function to execute when the form submit event occurs.
		if (_this.hasElement())
		{
			_element.parents("form").submit(listener);
		}
	};
	_this.changedEvent = function(listener)
	{
		/// public: subscribes the supplied listener to the event which occurs when the value of the component changes.
		// listener: the callback function to execute when the value changes.

		if ("function" !== typeof(listener))
		{
			return;
		}

		if (undefined === _changed || null === _changed)
		{
			_changed = [];
		}

		for (var i = 0; i < _changed.length; i++)
		{
			if (listener === _changed[i])
			{
				return; // already in array
			}
		}

		// add listener to the array
		_changed.push(listener);
	};
	var onInputChanged = function(fireEvent)
	{
		// event handler (responsible for firing the event when it occurs)
		var newValue = internalValue();
		if (_currentValue === newValue)
		{
			return false; // nothing has changed
		}

		_previousValue = _currentValue;
		_currentValue = newValue;

		if (fireEvent)
		{
			var callback = function()
			{
				jQuery.each(_changed, function(i, listener)
				{
					// fire the event for each handler
					listener(_this, {});
				});
			};
			window.setTimeout(callback, CHANGED_DELAY);
		}

		return true; // something has changed
	};
	_this.recompute = function()
	{
		// public: forces an update of the object and grabs the new value (if any)
		// from the DOM element - but does not fire the changed event

		// this function is necessary because when the value of the element is set
		// programatically, the corresponding "changed" event listeners don't fire.

		// the solution in this case is to simply grab the value from the DOM element
		// itself (but suppress the firing of the event to any listeners).

		return onInputChanged(false);
	};
	_this.enable = function(enable)
	{
		/// public: indicates that this particular component can be modified.
		/// enable: (bool) value which instructs us to either enable or disable the corresponding
		/// input element of the control.

		if (_this.hasElement())
		{
			_element.attr("disabled", !enable);
		}
	};

	// QadComponent constructor:

	_name = jQuery.isNullOrEmpty(name) ? "Unknown" : name;

	if (undefined === inputId || jQuery.isNullOrEmpty(inputId))
	{
		return; // done performing setup, no elementId provided
	}

	var found = jQuery("#" + inputId);
	if (null === found || 0 === found.length)
	{
		// element could not be found, we're done
		return;
	}

	if (!found.is(":text") && !found.is("select"))
	{
		// element found was not a textbox or a dropdown list
		return;
	}

	if (found.is("select") && found[0].type !== "select-one")
	{
		// dropdown can only have a single value selected
		return;
	}

	_elementId = inputId;
	_element = found;
	_isTextbox = !found.is("select");
	_currentValue = internalValue();

	// subscribe to event so we can determine if changes are made
	_element.blur(onInputChanged);
	_element.change(onInputChanged);
}
function QadStateComponent(inputId, codes)
{
	/// wraps all the functionality of the state component which has a few quirks as compared to
	/// the other components.

	/// inputId: the DOM element to be wrapped
	/// codes: "short" or "alias" codes which should be used

	// call base constructor
	QadStateComponent.baseConstructor.call(this, "State", inputId);

	var _this = this;

	var _matrix = [
		["AL", "Alabama"],
		["AK", "Alaska"],
		["AS", "American Samoa"],
		["AZ", "Arizona"],
		["AR", "Arkansas"],
		["AA", "Armed Forces - Americas"],
		["AE", "Armed Forces - Europe/Africa/Canada"],
		["AP", "Armed Forces - Pacific"],
		["CA", "California"],
		["CO", "Colorado"],
		["CT", "Connecticut"],
		["DE", "Delaware"],
		["DC", "District of Columbia"],
		["FM", "Federated States of Micronesia"],
		["FL", "Florida"],
		["GA", "Georgia"],
		["GU", "Guam"],
		["HI", "Hawaii"],
		["ID", "Idaho"],
		["IL", "Illinois"],
		["IN", "Indiana"],
		["IA", "Iowa"],
		["KS", "Kansas"],
		["KY", "Kentucky"],
		["LA", "Louisiana"],
		["ME", "Maine"],
		["MH", "Marshall Islands"],
		["MD", "Maryland"],
		["MA", "Massachusetts"],
		["MI", "Michigan"],
		["MN", "Minnesota"],
		["MS", "Mississippi"],
		["MO", "Missouri"],
		["MT", "Montana"],
		["NE", "Nebraska"],
		["NV", "Nevada"],
		["NH", "New Hampshire"],
		["NJ", "New Jersey"],
		["NM", "New Mexico"],
		["NY", "New York"],
		["NC", "North Carolina"],
		["ND", "North Dakota"],
		["MP", "Northern Mariana Islands"],
		["OH", "Ohio"],
		["OK", "Oklahoma"],
		["OR", "Oregon"],
		["PW", "Palau"],
		["PA", "Pennsylvania"],
		["PR", "Puerto Rico"],
		["RI", "Rhode Island"],
		["SC", "South Carolina"],
		["SD", "South Dakota"],
		["TN", "Tennessee"],
		["TX", "Texas"],
		["UT", "Utah"],
		["VT", "Vermont"],
		["VI", "Virgin Islands"],
		["VA", "Virginia"],
		["WA", "Washington"],
		["WV", "West Virginia"],
		["WI", "Wisconsin"],
		["WY", "Wyoming"]
	];

	var _abbrToName = {}; var _nameToAbbr = {};
	var _abbrToCode = {}; var _codeToAbbr = {};

	jQuery.each(_matrix, function(i, item)
	{
		var abbr = item[0];
		var name = item[1];

		_abbrToName[abbr] = name;
		_nameToAbbr[name] = abbr;

		if (undefined === codes)
		{
			_abbrToCode[abbr] = abbr;
			_codeToAbbr[abbr] = abbr;
		}
		else
		{
			var code = codes[abbr];
			if (jQuery.isNullOrEmpty(code))
			{
				_abbrToCode[abbr] = code;
				_codeToAbbr[code] = abbr;
			}
		}
	});

	var baseValue = _this.value;
	_this.value = function(value)
	{
		// gets the state abbreviation of the currently selected value.

		value = baseValue(_abbrToCode[value], _abbrToName[value]);
		if (jQuery.isNullOrEmpty(value))
		{
			// nothing returned
			return value;
		}

		// some processing necessary
		var output = _codeToAbbr[value];
		return (undefined === output) ? value : output;
	};
	_this.isState = function()
	{
		/// public: gets a value which indicates if the state element is fully populated

		if (_this.isTextbox())
		{
			return true; // any value is ok
		}

		// in a drop-down list, the value must be found in shortcut objects.

		var value = _this.value();

		// it must be an abbreviation, the fullname or a code. (abbr is found in 2 objects - only need to check 1 here).
		return undefined !== _nameToAbbr[value] || undefined !== _codeToAbbr[value];
	};
}
InheritEx(QadStateComponent, QadComponent); 
function QadAddress(input)
{
	var COOKIE_NAME = "qad_hash";
	var COOKIE_DELIM = "-";
	/// represents an address and wraps all components of an address

	// list of allowed addresses
	QadAddress.Whitelist = {};

	var _this = this;

	// variables
	var _name = "";
	var _street = undefined;
	var _street2 = undefined;
	var _unit = undefined;
	var _city = undefined;
	var _state = undefined;
	var _zip = undefined;
	var _urbanization = undefined;
	var _lastLine = undefined;
	var _country = undefined;
	var _countyFips = undefined;
	var _countyName = undefined;
	var _changed = undefined;
	var _components = undefined; // array of components
	var _isEnabled = true; // indicates if the address can be modified.
	var _onInvalidAddress = undefined; // user-defined callback if the address cannot be verified
	var _onValidAddress = undefined; //user-defined callback if the address can be verified/is valid.
	var _hideNoThanks = false; // if false, will display the "No thanks, use the address I entered" option.
	var _loitering = false; // true if we're waiting for this (unverifiable) address to be corrected by the user
	var _cleaned = false;
	
	var _currentHash = "";
	var _previousHash = "";

	// public get accessors
	_this.name = function() { return _name; };
	_this.street = function() { return _street; };
	_this.street2 = function() { return _street2; };
	_this.unit = function() { return _unit; };
	_this.city = function() { return _city; };
	_this.state = function() { return _state; };
	_this.zip = function() { return _zip; };
	_this.urbanization = function() { return _urbanization; };
	_this.lastLine = function() { return _lastLine; };
	_this.country = function() { return _country; };
	_this.countyFips = function() { return _countyFips; };
	_this.countyName = function() { return _countyName; };
	_this.previousHash = function() { return _previousHash; };
	_this.isEnabled = function() { return _isEnabled; };
	_this.onInvalidAddress = function(address) { return _onInvalidAddress(address); };
	_this.onValidAddress = function(address) { return _onValidAddress(address); };
	_this.hideNoThanks = function() { return _hideNoThanks; };
	_this.loitering = function() { return _loitering; };
	
	_this.form = function()
	{
		// Gets the reference to the form that the input controls are on.
		if (undefined === _components || null === _components || _components.length < 1)
		{
			return null;
		}

		return _components[0].form();
	};

	// methods

	_this.whitelist = function(clean)
	{
		/// public: adds this address (hash-specific) to the whitelist of addresses that
		/// are considered clean even if they may not be.
		/// clean: indicates if the address is clean or not.  A false value removes the address
		/// from the whitelist.

		// if nothing is specified, it's marked as clean
		clean = clean || true;

		QadAddress.Whitelist[_this.hash()] = clean;
	};
	_this.enable = function(enabled)
	{
		/// public: method which enables or disables all elements of the address.

		_isEnabled = enabled;
		jQuery.each(_components, function(i, component)
		{
			component.enable(_isEnabled);
		});
	};
	_this.hash = function(recompute)
	{
		/// public: gets the hash of the current address
		/// recompute: forces a recompute of address' hash.

		if (undefined !== recompute)
		{
			if (undefined === _components || null === _components)
			{
				return ""; // no hash to be computed
			}

			var values = "";
			for (var i = 0; i < _components.length; i++)
			{
				_components[i].recompute(); // force update from DOM element (because changed events may not have fired).
				values += _components[i].value() + "|";
			}

			var newHash = jQuery.hash(values);
			if (newHash !== _currentHash)
			{
				_previousHash = _currentHash;
				_currentHash = newHash;
			}
		}

		return _currentHash;
	};
	_this.isClean = function()
	{
		// public: gets a value which indicates if the address is clean

		if (QadAddress.Whitelist[_this.hash()])
		{
			// address has been whitelisted, it's considered clean (even though it many not be)
			return true;
		}

		var hashes = jQuery.cookie(COOKIE_NAME);
		
		// no addresses have been cleaned
		if (jQuery.isNullOrEmpty(hashes))
		{
			return false;
		}

		if (hashes.indexOf(_this.hash() + COOKIE_DELIM) >= 0)
			return true;
			
		return _cleaned === true;
	};
	_this.isPopulated = function()
	{
		/// public: gets a value which indicates if enough of the address is populated to submit
		if (undefined === _country || null === _country)
		{
			return false;
		}

		// ignore international addresses
		if (!_this.isDomestic())
		{
			return false;
		}

		// the required components for a valid address are street and (last line OR zip OR (city AND state )).
		return (_street.hasValue() || _street2.hasValue()) && ( _lastLine.hasValue() || _zip.hasValue() || ( _city.hasValue() && _state.hasValue() && _state.isState() ) );
	};
	_this.isDomestic = function()
	{
		/// public: gets a value which indicates if the country component is in the USA.
		var value = _country.value();

		// when a country is not specified, USA is assumed
		if (jQuery.isNullOrEmpty(value))
		{
			return true;
		}

		switch (value.toUpperCase())
		{
			case "US": return true;
			case "U.S.": return true;
			case "U S": return true;
			case "U. S.": return true;

			case "USA": return true;
			case "U.S.A.": return true;
			case "U S A": return true;
			case "U. S. A.": return true;

			case "US OF A": return true;
			case "U S OF A": return true;
			case "U.S. OF A": return true;
			case "U. S. OF A": return true;
			case "U. S. OF A.": return true;

			case "US OF AMERICA": return true;
			case "U S OF AMERICA": return true;
			case "U.S. OF AMERICA": return true;
			case "U. S. OF AMERICA": return true;

			case "UNITED STATES": return true;
			case "UNITED STATES - AMERICA": return true;
			case "UNITED STATES OF AMERICA": return true;

			case "840": return true; // ISO: 3166
			case "223": return true; // Zen Cart

			default: return false;
		}
	};
	_this.equals = function(address)
	{
		/// public: gets a value which indicates if the supplied address is equal to this one.
		/// address: the address to be compared with this one.

		// no hash function defined - not an address object
		if (undefined === address || null === address || "function" !== typeof(address.hash))
		{
			return false;
		}

		return _this === address || _this.hash(true) === address.hash(true);
	};
	_this.isIdentical = function(suggestion)
	{
		/// public: gets a value which indicates if the suggestion provided matches this address exactly.
		/// suggestion: the suggestion to be matched.

		if (undefined === suggestion || null === suggestion)
		{
			return false;
		}

		if (!_this.isDomestic())
		{
			return false; // international address
		}

		// make the suggestion "fit" the form elements
		var duplicate = process(suggestion);

		if (trim(_street.toString()) !== trim(duplicate.Street) || trim(_street2.toString()) !== trim(duplicate.Street2) || trim(_unit.toString()) !== trim(duplicate.UnitNumber))
		{
			return false; // something doesn't match *exactly*
		}

		if (trim(_state.toString()) !== trim(duplicate.State))
		{
			return false; // make sure that the name of the state fully spelled out matches
		}

		return trim(_zip.toString()) === trim(duplicate.ZipCode) && trim(_city.toString()) === trim(duplicate.City);
	};

	var getStreetWithoutUnit = function(street, unit) {
		index = street.lastIndexOf(unit);
		
		if (index >= 0)
			street = street.substr(0, index - 1) + street.substr(index + unit.length)

		return trim(street);
	};

	var process = function(suggestion) {
		//trace("Beginning processing.");
		/// private: performs some processing on the suggestion
		/// in order to ensure that the components received back from the server
		/// can be correctly matched with the DOM elements that may or may not
		/// exist on the page.

		if (undefined === suggestion || null === suggestion) {
			//trace("Returning at spot 1 in process(suggestion).");
			return suggestion;
		}

		// no further processing needed
		if (jQuery.isNullOrEmpty(suggestion.UnitNumber)) {
			//trace("Returning at spot 2 in process(suggestion).");
			return suggestion;
		}

		// can't separate unit number - no input DOM element for it
		if (!_unit.hasElement()) {
			//trace("Returning at spot 3 in process(suggestion).");
			return suggestion;
		}

		// return a copy the suggestion (leave the original alone)
		return {
			Street: getStreetWithoutUnit(suggestion.Street || "", suggestion.UnitNumber || ""),
			Street2: suggestion.Street2,
			UnitNumber: suggestion.UnitNumber,
			City: suggestion.City,
			State: suggestion.State,
			ZipCode: suggestion.ZipCode,
			LastLine: suggestion.LastLine,
			Urbanization: suggestion.Urbanization,
			CountyFips: suggestion.CountyFips,
			CountyName: suggestion.CountyName
		};
	};
	function trim(s)
	{
		if(0 === s.length)
		{
			return s;
		}

		var l=0; var r=s.length -1;

		while(l < s.length && s[l] == ' ')
		{	l++; }

		while(r > l && s[r] == ' ')
		{	r-=1;	}
		return s.substring(l, r+1);
	}

	QadAddress.toArray = function(suggestion)
	{
		/// gets the string array representation of the suggestion

		if (undefined === suggestion || null === suggestion)
		{
			return []; // empty array
		}

		return [ suggestion.Street, suggestion.Street2, suggestion.Urbanization, suggestion.LastLine ];
	};
	_this.toArray = function()
	{
		/// public: gets the string array representation of the address
		return [
			_street + " " + _unit,
			"" + _street2,
			"" + _urbanization,
			jQuery.trim(_city + " " + _state + " " + _zip) ];
	};
	_this.assign = function(suggestion)
	{
		/// public: overwrites the values in this address with those of the suggestion.
		/// suggestion: the suggestion to be used as the source of the data.

		if (undefined === suggestion || null === suggestion)
		{
			return;
		}

		// make the values fit uniquely with the number of elements this address contains
		suggestion = process(suggestion);

		_street.value(suggestion.Street);
		_street2.value(suggestion.Street2);
		_unit.value(suggestion.UnitNumber);
		_city.value(suggestion.City);
		_state.value(suggestion.State);
		_zip.value(suggestion.ZipCode);
		_urbanization.value(suggestion.Urbanization);
		_lastLine.value(suggestion.LastLine);
		_countyFips.value(suggestion.CountyFips);
		_countyName.value(suggestion.CountyName);

		_cleaned = true;
		_this.hash(true); // force recompute the hash

		// already added to cookie collection
		if (_this.isClean())
		{
			return;
		}

		// add cleaned address to cookie collection so that it will not be scrubbed again.

		trace("Address assigned: " + _this.name() + " [" + _this.hash() + "]");

		var hashes = jQuery.cookie(COOKIE_NAME);

		if (jQuery.isNullOrEmpty(hashes))
		{
			hashes = "";
		}

		// add the current address to the list of cleaned addresses.
		jQuery.cookie(COOKIE_NAME, hashes + _this.hash() + COOKIE_DELIM, {expires: 30 });
	};
	_this.params = function()
	{
		/// public: creates a new object populated with the components of the address.
		var params = {};

		if (!jQuery.isNullOrEmpty(_street.value())) params["street"] = _street.value();
		if (!jQuery.isNullOrEmpty(_street2.value())) params["street2"] = _street2.value();
		if (!jQuery.isNullOrEmpty(_unit.value())) params["unit"] = _unit.value();
		if (!jQuery.isNullOrEmpty(_city.value())) params["city"] = _city.value();
		if (!jQuery.isNullOrEmpty(_state.value())) params["state"] = _state.value();
		if (!jQuery.isNullOrEmpty(_zip.value())) params["zip"] = _zip.value();
		if (!jQuery.isNullOrEmpty(_urbanization.value())) params["urbanization"] = _urbanization.value();
		if (!jQuery.isNullOrEmpty(_lastLine.value())) params["lastLine"] = _lastLine.value();

		return params;
	};
	_this.submitEvent = function(listener)
	{
		/// public: the "event subscriber" similiar to the += notation found
		/// in .NET event subscriptions for the form submit event.
		/// listener: the callback event to be fired when the event occurs.

		for (var i = 0; i < _components.length; i++)
		{
			_components[i].submitEvent(listener);
		}
	};
	_this.changedEvent = function(listener)
	{
		/// public: adds the function provided as a subscriber to the "changed" event
		/// listener: the callback event to be fired when the event occurs.

		// invalid listener
		if (undefined === listener || null === listener || "function" !== typeof(listener))
		{
			return;
		}

		if (undefined === _changed || null === _changed)
		{
			_changed = [];
		}

		for (var i = 0; i < _changed.length; i++)
		{
			// already in array
			if (listener === _changed[i])
			{
				return;
			}
		}

		// add listener to the array
		_changed.push(listener);
	};
	var onComponentChanged = function(sender, args)
	{
		/// private: event listener which captures events fired when individual components change
		/// sender: the component which caused the event to fire
		/// args: the arguments that described how the component changed.

		var hasPrevious = !jQuery.isNullOrEmpty(sender.previousValue());
		var hasCurrent = !jQuery.isNullOrEmpty(sender.value());

		_cleaned = false;
		_this.hash(true); // recompute the hash

		var change = 0; // value updated/changed
		if (hasPrevious && !hasCurrent)
		{
			change = -1; // value deleted
		} else if (!hasPrevious && hasCurrent)
		{
			change = 1; // value added
		}

		var changeText = "( value modified )";
		if (1 === change) { changeText = "( value added )"; }
		else if (-1 === change) { changeText = "( value removed )"; }

		trace("Component modified: " + _this.name() + "." + sender.name() + "(" + sender.id() + ") \"<u>" + sender.previousValue() + "</u>\" -&gt; \"<u>" + sender.value() + "</u>\" " + changeText);

		// fire the event for each handler
		if (undefined !== _changed && null !== _changed && _changed.length > 0)
		{
			for (var i = 0; i < _changed.length; i++)
			{
				_changed[i]( _this, { change: change, component: sender } );
			}
		}
	};
	_this.setLoitering = function(loitering)
	{
		_loitering = loitering;
	}

	// QadAddress constructor

	if (undefined === input || null === input)
	{
		return;
	}

	_name = jQuery.isNullOrEmpty(input.name) ? "" : input.name;
	_street = new QadComponent("Street", input.street);
	_street2 = new QadComponent("Street2", input.street2);
	_unit = new QadComponent("Unit", input.unit);
	_city = new QadComponent("City", input.city);
	_state = new QadStateComponent(input.state);
	_zip = new QadComponent("ZIP", input.zip);
	_urbanization = new QadComponent("Urbanziation", input.urbanization);
	_lastLine = new QadComponent("Last Line", input.lastLine);
	_country = new QadComponent("Country", input.country);
	_countyFips = new QadComponent("CountyFips", input.countyFips);
	_countyName = new QadComponent("CountyName", input.countyName);
	_components = [ _street, _street2, _unit, _city, _state, _zip, _urbanization, _lastLine, _country, _countyName, _countyFips ];
	_this.hash(true); // construct the original hash
	_onInvalidAddress = undefined === input.onInvalidAddress || "function" !== typeof(input.onInvalidAddress)
		? function() { }
		: input.onInvalidAddress;
	_onValidAddress = undefined === input.onValidAddress || "function" !== typeof(input.onValidAddress)
		? function() { }
		: input.onValidAddress;
	_hideNoThanks = input.hideNoThanks;
	
	for (var i = 0; i < _components.length; i++)
	{
		_components[i].changedEvent(onComponentChanged);
	}
} 
function QadDisplay(displaySettings) {

	// By convention, we make a private "_this" parameter. This is used to make the object available to the private methods.
	// This is a workaround for an error in the ECMAScript Language Specification which causes this to be set incorrectly for inner functions
	var _this = this;

	_this.getResourceDomain = function() {
		return displaySettings.resourceDomain
			|| _this.getWindowProtocol() + "//api.qualifiedaddress.com";
	};

	_this.getWindowProtocol = function() {
		var protocol = window.location.protocol || "https:";
		return protocol.indexOf("http") === 0
			? protocol : "https:"; // if it doesn't start with "http", fallback to "https:"
	};

	var MIN_ADDRESSES = 1; var MAX_ADDRESSES = 4;
	var RESOURCE_URL_PREFIX = _this.getResourceDomain();
	var BRANDING_IMG_SRC = RESOURCE_URL_PREFIX + "/content/images/brand.gif";
	var DEFAULT_STYLESHEET_HREF = RESOURCE_URL_PREFIX + "/content/liveaddress.css";

	var _blocks = [];

	var _dialog = jQuery("#QadDialog"); // the DOM element which holds the dialog
	var _busy = jQuery("#QadBusy"); // the DOM element that shows the busy text
	var _dialogForeground;
	var _choices = undefined;

	var _addresses = 2; // number of selection addresses to display simultaneously (1 == sequential)
	var _animate = "slow"; // default speed of animation

	var _dialogCss = "qad_dialog";  // the css class that holds everything
	var _backgroundCss = "qad_background"; // the css class of the background to the dialog
	var _foregroundCss = "qad_foreground"; // the css class of the foreground to the dialog

	var _headlineText = "Edit Address";
	var _headlineCss = "qad_headline"; // the text for the entire dialog

	var _dialogBodyCss = "qad_dialog_body"; // an individual section represented by choice lists.
	var _choicesListCss = "qad_choices_list"; // holds a single list of choices for an individual address

	var _addressHeaderCss = "qad_address_header";

	var _choiceId = "choice";

	var _suggestionText = "Recommended match:";
	var _invalidSuggestionText = "This address is not recognized by the USPS as valid.<br>Click your address to correct it:";
	var _invalidSuggestionCss = "qad_choice qad_invalid_suggestion"; // a suggestion (clickable) address that the user typed; an invalid address.
	var _invalidSuggestionHeaderCss = "qad_invalid_suggestion_header";
	var _suggestionHeaderCss = "qad_suggestion_header";
	var _suggestionCss = "qad_choice qad_suggestion"; // a suggestion (clickable) address from the server.

	var _originalText = "No thanks. Use the address I entered.";
	var _originalHeaderCss = "qad_original_header";
	var _originalCss = "qad_choice qad_original"; // the original (and clickable) address from the user.

	var _choiceLineCss = "qad_choice_line";

	var _busyText = "Validating address...";
	var _busyCss = "qad_busy";

	var _fullPageOverlay = true; // Flag for whether or not to resize the overlay to cover the entire HTML page.
	var _defaultStylesheet = true;
	var _centerDialogToWindow = true;
	
	var documentElement = document.compatMode === "CSS1Compat" ?
		document.documentElement : document.body;

	_this.busy = function(workers)
	{
		if (undefined === _busy || null === _busy || 0 === _busy.length)
		{
			return;
		}

		return (workers > 0)
			? _busy.show()
			: _busy.hide();
	};
	var onClick = function(callback, item)
	{
		var onCleanup = function()
		{
			// get rid of the first item in the array
			// because it will always be one of the ones that is currently
			// displayed and the reference can safely be lost.
			_blocks.shift();

			if (_blocks.length >= _addresses)
			{
				// if there are others waiting, display the one at position "menu - 1"
				_blocks[_addresses - 1]();
			}
			else if (0 === _blocks.length)
			{
				// done - no more blocks of addresses to be displayed - do cleanup
				_choices.empty();
				
				// Release the page and bring it back into the foreground
				jQuery.unblockUI();
			}

			// execute the callback passing in the index of the choice that was clicked
			callback(item.parent().children("#" + _choiceId).index(item[0]));
		};
		
		// Regardless of animation, clean up the dimension values we stored.
		_dialogForeground.accumulatedHeight = 0;
		_dialogForeground.accumulatedWidth = 0;
		
		if ("none" === _animate)
		{
			item.parent().hide();
			onCleanup();
		}
		else
		{
			item.parent().hide(_animate, onCleanup);
		}
	};
	
	_this.enqueue = function(callback, name, items, validationSuccess, hideNoThanks)
	{
		var container = jQuery("<div>")
			.appendTo(_choices)
			.addClass(_choicesListCss)
			//.append(jQuery("<div>").append(name).addClass(_addressHeaderCss))
			.hide();
		
		_blocks.push(function()
		{
			jQuery.each(items, function(i, item)
			{
				var original = i === items.length - 1;
				var choice = undefined;
				
				if (original || 0 === i)
				{
					if (!validationSuccess)
					{
						// Adds the label that informs the user of an invalid address
						jQuery("<div>")
							.appendTo(container)
							.append(original ? null : _invalidSuggestionText)
							.addClass(original ? _originalHeaderCss : _invalidSuggestionHeaderCss);
						
						choice = jQuery("<div>")
							.appendTo(container)
							.addClass(original ? _originalCss : _invalidSuggestionCss)
							.attr({id: _choiceId})
							.click(function() { onClick(callback, jQuery(this)); });
					}
					else
					{
						// Adds the "Recommended match:" label...
						jQuery("<div>")
							.appendTo(container)
							.append(original ? null : _suggestionText)
							.addClass(original ? _originalHeaderCss : _suggestionHeaderCss);
							
						choice = jQuery("<div>")
							.appendTo(container)
							.addClass(original ? _originalCss : _suggestionCss)
							.attr({id: _choiceId})
							.click(function() { onClick(callback, jQuery(this)); });
					}
				}
				
				// This block will actually create the "holder" for a suggested address
				if (!original && i > 0)
				{
					if (!validationSuccess)
					{
						choice = jQuery("<div>")
							.appendTo(container)
							.addClass(original ? _originalCss : _invalidSuggestionCss)
							.attr({id: _choiceId})
							.click(function() { onClick(callback, jQuery(this)); });
					}
					else
					{
						choice = jQuery("<div>")
							.appendTo(container)
							.addClass(original ? _originalCss : _suggestionCss)
							.attr({id: _choiceId})
							.click(function() { onClick(callback, jQuery(this)); });
					}
				}
				
				if (original)
				{
					if (!hideNoThanks)
					{
						// Display "No thanks" option to the user.
						jQuery("<div>")
							.appendTo(choice)
							.append(_originalText);
					}
					else
					{
						// Hide the "no thanks" div; even an empty one would still be
						// click able if not hidden.
						choice.css("display", "none");
					}
				}
				else
				{
					// Show the address line-upon-line and precept-upon-precept.
					var _orig = items[items.length - 1];
					jQuery.each(item, function(i, line)
					{
						if (!jQuery.isNullOrEmpty(line))
						{
							if(_orig[i] != line)
								line = "<span class='red'>" + line + "</span>";
							jQuery("<div>")
								.appendTo(choice)
								.append(line)
								.addClass(_choiceLineCss);
						}
					});
				}
			});
		});
		
		if (_blocks.length <= _addresses)
		{
			// Run the function we just prepared (populates the container)
			_blocks[_blocks.length - 1]();
		}
		
		// Get the window's dimensions		
		var documentWidth = jQuery(document).width();
		var windowHeight = jQuery(window).height();
		
		// Update the location of the dialog (re-center it with the new address)
		UpdateDialogPosition(container, documentWidth, windowHeight);
		
		var _cont = _choices.parent();
		if(!_cont.find("label").length){
			_cont = jQuery("<div>").appendTo(_cont);
			_cont.append(jQuery("<div>").addClass("formmsg").html("If you are unable to find your address from the list provided above, you can continue to edit it in the text below:"));
			_cont = jQuery("<div>").appendTo(_cont).addClass("form");
			_cont.append(jQuery("<div>").addClass("row").append(jQuery("<label>").append("Name <span>*</span>")).append(jQuery("<input type='text' name='attention_input'>").val(jQuery("#attention_input").val())));
			_cont.append(jQuery("<div>").addClass("row").append(jQuery("<label>").append("Company Name <span></span>")).append(jQuery("<input type='text' name='addressee_input'>").val(jQuery("#addressee_input").val())));
			_cont.append(jQuery("<div>").addClass("row").append(jQuery("<label>").append("Address 1 <span>*</span>")).append(jQuery("<input type='text' name='addr1'>").val(jQuery("#addr1").val())));
			_cont.append(jQuery("<div>").addClass("row").append(jQuery("<label>").append("Address 2 <span></span>")).append(jQuery("<input type='text' name='addr2'>").val(jQuery("#addr2").val())));
			_cont.append(jQuery("<div>").addClass("row").append(jQuery("<label>").append("City <span>*</span>")).append(jQuery("<input type='text' name='city'>").val(jQuery("#city").val())));
			_cont.append(jQuery("<div>").addClass("row").append(jQuery("<label>").append("State/Province <span>*</span>")).append(jQuery('<select name="dropdownstate"><option value="" selected=""></option><option value="AL">Alabama</option><option value="AK">Alaska</option><option value="AZ">Arizona</option><option value="AR">Arkansas</option><option value="AA">Armed Forces Americas</option><option value="AE">Armed Forces Europe</option><option value="AP">Armed Forces Pacific</option><option value="CA">California</option><option value="CO">Colorado</option><option value="CT">Connecticut</option><option value="DE">Delaware</option><option value="DC">District of Columbia</option><option value="FL">Florida</option><option value="GA">Georgia</option><option value="HI">Hawaii</option><option value="ID">Idaho</option><option value="IL">Illinois</option><option value="IN">Indiana</option><option value="IA">Iowa</option><option value="KS">Kansas</option><option value="KY">Kentucky</option><option value="LA">Louisiana</option><option value="ME">Maine</option><option value="MD">Maryland</option><option value="MA">Massachusetts</option><option value="MI">Michigan</option><option value="MN">Minnesota</option><option value="MS">Mississippi</option><option value="MO">Missouri</option><option value="MT">Montana</option><option value="NE">Nebraska</option><option value="NV">Nevada</option><option value="NH">New Hampshire</option><option value="NJ">New Jersey</option><option value="NM">New Mexico</option><option value="NY">New York</option><option value="NC">North Carolina</option><option value="ND">North Dakota</option><option value="OH">Ohio</option><option value="OK">Oklahoma</option><option value="OR">Oregon</option><option value="PA">Pennsylvania</option><option value="PR">Puerto Rico</option><option value="RI">Rhode Island</option><option value="SC">South Carolina</option><option value="SD">South Dakota</option><option value="TN">Tennessee</option><option value="TX">Texas</option><option value="UT">Utah</option><option value="VT">Vermont</option><option value="VA">Virginia</option><option value="WA">Washington</option><option value="WV">West Virginia</option><option value="WI">Wisconsin</option><option value="WY">Wyoming</option></select>').val(jQuery("#dropdownstate").val())));
			_cont.append(jQuery("<div>").addClass("row").append(jQuery("<label>").append("Zip/Postal Code <span>*</span>")).append(jQuery("<input type='text' name='zip' class='short'>").val(jQuery("#zip").val())));
			_cont.append(jQuery("<div>").addClass("row").append(jQuery("<label>").append("Country <span>*</span>")).append(jQuery('<select name="country"><option value=""></option><option value="US" selected="">United States</option></select>').val(jQuery("#country").val())));
			_cont.append(jQuery("<div>").addClass("row").append(jQuery("<label>").append("Phone <span>*</span>")).append(jQuery("<input type='text' name='phone'>").val(jQuery("#phone").val())).append(jQuery("<div>").addClass("note").css("margin-bottom", "5px").html("(ex: 555-321-9876)")));
			
			_cont.append($("<div>").addClass("cyan").addClass("note").html("We now ship to Alaska, Hawaii, US Territories, APO and FPO addresses."));
			_cont.append($("<div>").addClass("note").html("Additional shipping charges will apply. Get shipping options, estimated delivery dates and charges at chackout."));
			_cont.append($("<div>").addClass("red").addClass("note").html("<b>NOTE:</b> We cannot ship to international addresses at this time.  Call us at 888.676.7746 if you need help."));
			
			_cont = _choices.parent();
			
			_cont.append(jQuery("<div>").html("Use this address").addClass("formaddress").click(function() {
				jQuery("#attention_input").val(_cont.find("[name=attention_input]").val());
				jQuery("#addressee_input").val(_cont.find("[name=addressee_input]").val());
				jQuery("#addr1").val(_cont.find("[name=addr1]").val());
				jQuery("#addr2").val(_cont.find("[name=addr2]").val());
				jQuery("#city").val(_cont.find("[name=city]").val());
				jQuery("#dropdownstate").val(_cont.find("[name=dropdownstate]").val());
				jQuery("#zip").val(_cont.find("[name=zip]").val());
				jQuery("#country").val(_cont.find("[name=country]").val());
				jQuery("#phone").val(_cont.find("[name=phone]").val());
				jQuery(choice[choice.length - 1]).click();					
			}));
			
			_cont.append(jQuery("<div>").html("Cancel").addClass("closebtn").click(function() {
				jQuery(choice[choice.length - 1]).click();
			}));
		} else {
			_cont.find("[name=attention_input]").val(jQuery("#attention_input").val());
			_cont.find("[name=addressee_input]").val(jQuery("#addressee_input").val());
			_cont.find("[name=addr1]").val(jQuery("#addr1").val());
			_cont.find("[name=addr2]").val(jQuery("#addr2").val());
			_cont.find("[name=city]").val(jQuery("#city").val());
			_cont.find("[name=dropdownstate]").val(jQuery("#dropdownstate").val());
			_cont.find("[name=zip]").val(jQuery("#zip").val());
			_cont.find("[name=country]").val(jQuery("#country").val());
			_cont.find("[name=phone]").val(jQuery("#phone").val());
		}
	
		// Show the dialog using BlockUI.
		jQuery.blockUI({
			message: _dialog,
			centerX: false, // set these to true if ever switching to use BlockUI centering
			centerY: false,
			fadeIn: 0,
			fadeOut: 0,
			css: {
				left: documentWidth / 2 - (_dialogForeground.accumulatedWidth / 2), // custom centering; these won't be required
				top: jQuery(window).scrollTop() + 50,  // if we ever give it _dialogForeground instead, as long as
				width: "100%",														// _dialogForeground has dimensions (or has its dimenions set here)
				position: "absolute",
				padding: 0,
				border: "none",
				cursor: "normal"
			}
		});
		
		// When this goes after the blockUI thing, it all runs smoother.
		container.show("none" === _animate ? undefined : _animate);
	};
	
	function UpdateDialogPosition(container, documentWidth, windowHeight)
	{
		// Centering the dialog is a bugger because the dialog, oddly
		// enough, (and this is how we designed it, why, I don't know...)
		// doesn't contain any content. _dialogForeground (nested in _dialog) contains all the stuff.
		// _dialog literally contains nothing, no dimensions, only some styling.
		// To center the dialog, we can't have blockUI do it alone because we feed
		// it _dialog, not _dialogForeground. And _dialog has no dimensions.
		// So we need to center it using CSS ourselves. But _dialogForeground also
		// has no dimensions until it's injected into the DOM, but we have to make it
		// invisible (so there's no flickering) when we do that. So here we go!
		
		_dialog.css("visibility", "hidden"); // hide it for when we inject it
		container.show(); // give it all the content to "size it up"
		_dialog.show(); // "inject it" into the DOM
		var dialogWidth = container.width(); // get the dimensions
		var dialogHeight = _dialogForeground.height();
		container.hide(); // get rid of this for now
		_dialog.hide(); // "un-inject" them from the DOM
		_dialog.css("visibility", "visible"); // and this is so we can display it later
		
		// If there's more than 1 address, we need to account for that, since it calculates
		// the dimensions of one of those address containers at a time.
		_dialogForeground.accumulatedWidth += dialogWidth;
		_dialogForeground.accumulatedHeight = dialogHeight > _dialogForeground.accumulatedHeight ? dialogHeight : _dialogForeground.accumulatedHeight;
	}

	// QadDisplay constructor

	if (undefined === displaySettings || null === displaySettings)
	{
		displaySettings = {};
	}
	// find the "dialog" element
	if (!jQuery.isNullOrEmpty(displaySettings.dialogId))
	{
		_dialog = jQuery("#" + displaySettings.dialogId);
	}
	// find the "busy" element
	if (!jQuery.isNullOrEmpty(displaySettings.busyId))
	{
		_busy = jQuery("#" + displaySettings.busyId);
	}
	if ("number" === typeof(displaySettings.addresses) && displaySettings.addresses >= MIN_ADDRESSES && displaySettings.addresses <= MAX_ADDRESSES)
	{
		_addresses = displaySettings.addresses;
	}
	if ("string" === typeof(displaySettings.headlineText))
	{
		_headlineText = displaySettings.headlineText;
	}
	if ("string" === typeof(displaySettings.suggestionText))
	{
		_suggestionText = displaySettings.suggestionText;
	}
	if ("string" === typeof(displaySettings.originalText))
	{
		_originalText = displaySettings.originalText;
	}
	if ("string" === typeof(displaySettings.busyText))
	{
		_busyText = displaySettings.busyText;
	}
	if ("string" === typeof(displaySettings.animate))
	{
		_animate = displaySettings.animate;
	}
	// CSS Settings
	if ("string" === typeof(displaySettings.busyCss))
	{
		 _busyCss = displaySettings.busyCss;
	}
	if ("string" === typeof(displaySettings.dialogCss))
	{
		 _dialogCss = displaySettings.dialogCss;
	}
	if ("string" === typeof(displaySettings.backgroundCss))
	{
		 _backgroundCss = displaySettings.backgroundCss;
	}
	 if ("string" === typeof(displaySettings.foregroundCss))
	{
		 _foregroundCss = displaySettings.foregroundCss;
	}
	if ("string" === typeof(displaySettings.headlineCss))
	{
		 _headlineCss = displaySettings.headlineCss;
	}
	if ("string" === typeof(displaySettings.dialogBodyCss))
	{
		 _dialogBodyCss = displaySettings.dialogBodyCss;
	}
	if ("string" === typeof(displaySettings.choiceListCss))
	{
		 _choiceListCss = displaySettings.choiceListCss;
	}
	if ("string" === typeof(displaySettings.addressHeaderCss))
	{
		 _addressHeaderCss = displaySettings.addressHeaderCss;
	}
	if ("string" === typeof(displaySettings.choiceLineCss))
	{
		 _choiceLineCss = displaySettings.choiceLineCss;
	}
	if ("string" === typeof(displaySettings.suggestionHeaderCss))
	{
		 _suggestionHeaderCss = displaySettings.suggestionHeaderCss;
	}
	if ("string" === typeof(displaySettings.suggestionCss))
	{
		 _suggestionCss = displaySettings.suggestionCss;
	}
	if ("string" === typeof(displaySettings.originalHeaderCss))
	{
		 _originalHeaderCss = displaySettings.originalHeaderCss;
	}
	if ("string" === typeof(displaySettings.originalCss))
	{
		 _originalCss = displaySettings.originalCss;
	}
	if ("boolean" === typeof(displaySettings.fullPageOverlay))
	{
		_fullPageOverlay = displaySettings.fullPageOverlay;
	}
	if ("boolean" === typeof(displaySettings.centerDialogToWindow))
	{
		_centerDialogToWindow = displaySettings.centerDialogToWindow;
	}

	if ((undefined === displaySettings.defaultStylesheet) || ("boolean" === typeof(displaySettings.defaultStylesheet) && true === displaySettings.defaultStylesheet))
	{
		_defaultStylesheet = true;

		// Check to see if the createStyleSheet function exists (IE Only)
		// if it exists then use it to add the CSS Style Sheet, otherwise
		// use jQuery. Adding the stylesheet with jQuery doesn't work in IE.
		if (document.createStyleSheet)
		{
			document.createStyleSheet(DEFAULT_STYLESHEET_HREF);
		}
		else
		{
			jQuery("<link>").attr("rel", "stylesheet").attr("href", DEFAULT_STYLESHEET_HREF).appendTo("head");
		}
	}
	else
	{
			_defaultStylesheet = false;
	}

	if (_busy.length > 0)
	{
		_busy.hide().append(_busyText).addClass(_busyCss);
	}

	if (0 === _dialog.length)
	{
		_dialog = jQuery("<div>").appendTo("body");
	}

	// get the menu all ready to go
	_dialog.css("display", "none")
		.addClass(_dialogCss);
	_choices = jQuery("<div>").addClass(_dialogBodyCss);

	// create the foreground - the actual menu
	_dialogForeground = jQuery("<div>")
		.appendTo(_dialog)
		.addClass(_foregroundCss)
		.append(
			jQuery("<div>")
				.append(_headlineText)
				.addClass(_headlineCss))
		.append(_choices);
	_dialogForeground.accumulatedWidth = 0;
	_dialogForeground.accumulatedHeight = 0;
	
	_dialogForeground.append( // BRANDING
		jQuery("<div>")
			.css("text-align", "center")
			.css("clear", "both")
			.css("font-size", "10px")
			.css("color", "#577688")
			.css("text-decoration", "none")
		.append(jQuery("<img>")
			.attr("align", "middle")
			.attr("src", BRANDING_IMG_SRC)
			.attr("border", "0"))
	);
}
 
function QadServer( serverSettings, displaySettings, inputs )
{
	// ensure we have a compatible browser
	if ("Safari" === BrowserDetect.browser && BrowserDetect.version >= 2) {}
	else if ("Opera" === BrowserDetect.browser && BrowserDetect.version >= 9) {}
	else if ("Explorer" === BrowserDetect.browser && BrowserDetect.version >= 6) {}
	else if ("Firefox" === BrowserDetect.browser && BrowserDetect.version >= 1.5) {}
	else if ("Netscape" === BrowserDetect.browser && BrowserDetect.version >= 6) { }
	else if ("Chrome" === BrowserDetect.browser && BrowserDetect.version >= 1) { }
	else
	{
		return; // don't even do anything if the browser isn't sufficient
	}

	var MIN_FAILURES = 1; var MAX_FAILURES = 10;
	var MIN_TIMEOUT = 2; var MAX_TIMEOUT = 15; // in seconds
	var MIN_SUGGESTIONS = 1; var MAX_SUGGESTIONS = 10;

	// By convention, we make a private "_this" parameter. This is used to make the object available to the private methods.
	// This is a workaround for an error in the ECMAScript Language Specification which causes this to be set incorrectly for inner functions
	var _this = this;

	var _addresses = [];
	var _key = "0";
	var _url = "https://api.qualifiedaddress.com/Script/";
	var _service = "verify";
	var _suggestions = 5;
	var _demo = false;
	var _autoClean = true;
	var _maxFailures = 2; // number of times the server-based API can fail before all requests are simply allowed through.
	var _timeout = 7.5; // length of time, in seconds, which the JSON request waits before failure.
	var _failures = 0; // number of failures when attempting to reach the API.
	var _busySubmit = false; // disables the submit while validating addresses...
	var _requests = 0; // number of outstanding requests to the server.
	var _display = undefined;
	var _submitId = undefined; // ID of the Submit button for the address validating.
	var _properCase = false; // provides uppercase output by default (rather than proper case).
	var _button = undefined; // jQuery object of the last button clicked.
	var _allowPost = true; // submit form after addresses have been selected.
	var _onComplete = undefined; // user-defined callback "hook" after all addresses have finished processing
	var _ignoreAddresses = []; // addresses to ignore until the form is submitted (as dictated by user input)
	
	var onInvalidAddress = function(address, callback)
	{
		// Executed when an address cannot be cleaned because it is invalid.
		// Called at the end of processing.
		trace("** Invalid address; could not be verified. **");
		
		// Perform the callback if there is one to execute.
		if ("function" === typeof(address.onInvalidAddress))
		{
			// The user's custom function
			address.onInvalidAddress(address);
		}
		if ("function" === typeof(callback))
		{
			// Our callback function
			callback(address);
		}
	};
	
	var toClean = function()
	{
		// private: gets a value which confirms that all processing on all addresses is complete
		var numToClean = 0;

		if (undefined === _addresses || null === _addresses || 0 === _addresses.length)
		{
			return 0; // no addresses to be cleaned
		}

		// too many failures - let everything through
		if (_failures >= _maxFailures)
		{
			return 0;
		}

		for (var i = 0; i < _addresses.length; i++)
		{
			if (undefined === _addresses[i])
			{
				continue;
			}
				
			_addresses[i].hash(true); // recompute all values found in the address to ensure it's actually clean
			
			if (_addresses[i].isPopulated() && _addresses[i].isDomestic() && !_addresses[i].isClean())
			{
				numToClean ++;
			}
		}

		return numToClean;
	};
	
	var onCleanFinally = function(address, callback)
	{
		/// private: method that is called when all address processing has been complete.
		/// address: the address to be cleaned.
		/// callback: the callback to be called.

		// address has finished processing, renable it
		address.enable(true);

		// remove display text (if no other requests are pending)
		_display.busy(_requests);
		
		if ("function" === typeof(callback))
		{
			callback(address);
		}
	};
	
	var onRequestComplete = function(address, callback, json)
	{
		/// private: callback which is invoked when the results of the call to the server have been received.
		/// callback: the method to be called when all processing is complete.
		/// json: the results of the call to the server.
		
		// Start out with 0 suggestions received.
		var suggestionsReceived = 0;
		
		// If there wasn't a success, don't do anything.
		if (undefined === json || json.Success !== true)
		{
			_requests = 0;
			onCleanFinally(address, callback);
			return false;
		}
		
		if (undefined !== json && null !== json)
		{
			if (undefined !== json.Addresses && null !== json.Addresses && json.Addresses.length > 0)
			{
				if (undefined !== json.Addresses[0] && null !== json.Addresses[0])
				{
					suggestionsReceived = json.Addresses[0].length;
				}
			}
		}

		trace("Submission complete: " + address.name() + " [" + address.hash() + "] - " + suggestionsReceived + " suggestions found.");
		trace("Suggestions desired: " + _suggestions);
		suggestionsReceived = suggestionsReceived > _suggestions ? _suggestions : suggestionsReceived;

		if (undefined !== json && null !== json && !json.Success)
		{
			// Output debugging info if API or processing mechanism is offline
			trace(json.Message);
		}

		var onClick = function(index)
		{
			// Function called when a valid address suggestion is clicked
			var hash = address.hash();

			if (index < 0 || suggestionsReceived > index)
			{
				jQuery.each(_addresses, function(i, item)
				{
					if (address === item || hash === item.hash(true))
					{
						item.assign(json.Addresses[0][index]);
					}
				});
			}
			else
			{
				// original address selected, mark as clean
				address.whitelist();
			}
			
			if (address.valid)
			{
				// The address is valid, so run any user-defined onValidAddress functions.
				address.onValidAddress(address);
			}
			
			address.setLoitering(false); // it's valid so we obviously won't wait for the user to fix it
			_requests--;
			onCleanFinally(address, callback);
		};
		
		var invalidOnClick = function(index)
		{
			// Function called when an invalid address is clicked (i.e. what the user typed).
			
			// Validating the address failed, but we still need
			// to handle events when the user clicks something on the
			// display, being whether to "Fix it" or "No thanks; just use the
			// address that was entered."			
			
			// For invalid addresses, there are always only two possibilities:
			// either they clicked the first or the second option. The first is to not
			// whitelist it because that means they'll go back and fix it (element [0]).
			// The second is element [-1] or [1] which means they just want to use what they typed.
			// To our system, then it's as if "nothing happened" with the address.
			if (index !== 0)
			{
				// "No Thanks; just use what I typed" -- allow the address
				// to be used anyway
				address.whitelist();
				address.setLoitering(false); // apparently it's OK and we're not waiting on it.
				
				// The user clicked "No thanks" when autoClean is set to true.
				// Don't bug them about it again until they submit the form.
				if (_autoClean)
				{
					_ignoreAddresses.push(address.name());
				}
				
				// Oh, and if it's a "No thanks" on the invalid address,
				// we now "consider" it valid, so go ahead and run onInvalidAddress:
				address.onValidAddress(address);
			}
			else
			{
				// We're destroying the reference to any original callback function
				// and replacing it with this one because this scenario (when an address
				// can't be cleaned and the user chooses to fix it) is the only one
				// in which it's as if nothing ever happened. So we just call
				// the user's callback function instead, if there is one.
				callback = address.onInvalidAddress;
				address.setLoitering(true); // waiting on the address to be fixed by the user
			}
			
			_requests--;
			onCleanFinally(address, callback);
		};
		
		if (0 === suggestionsReceived)
		{
			// Address validation failed. No suggestions to display.
			
			// If the user is perhaps still typing their address,
			// and clicked "No thanks" already, and autoClean is true,
			// then don't bug them about it again until they submit the form.
			// Here we check to see if the address is already ignored.
			if (_autoClean && undefined === callback)
			{
				for (var i = 0; i < _ignoreAddresses.length; i++)
				{
					if (address.name() === _ignoreAddresses[i])
					{
						_requests--; // treat this as "handled"
						onCleanFinally(address, callback); // re-enable the form and stuff
						return; // don't continue or show the dialog
					}
				}
			}
			
			// Assemble the item to display on the suggestion frame
			var invalidItems = [];
			var addrArray = address.toArray();
			
			// First one is the "No thanks" option which will whitelist it.
			// Second one is the option for the user to fix the invalid address.
			invalidItems.push(addrArray);
			invalidItems.push(addrArray);
			
			// Display the suggestions
			_display.enqueue(invalidOnClick, address.name(), invalidItems, false, address.hideNoThanks());
			
			// Failed validation; don't submit form or continue!
			return false;
		}
		else
		{
			// In this case (at least 1 suggestion), there's no invalid addresses that we're
			//waiting for the user to correct, so reset the value.
			_loitering = false;
			address.valid = true; // used to call the user's onValidAddress function later on
		}

		var items = [];
		for (var i = 0; i < suggestionsReceived; i++)
		{
			// See if the address on the form is the same as one of the suggested addresses
			if (address.isIdentical(json.Addresses[0][i]))
			{
				// Just use the typed address if it's the same. Don't display suggestions to user.
				return onClick(i);
			}
			else
			{
				items.push(QadAddress.toArray(json.Addresses[0][i]));
			}
		}
		
		items.push(address.toArray());
		
		// Display the verified suggestions to the user
		_display.enqueue(onClick, address.name(), items, true, address.hideNoThanks());
	};
	
	var clean = function(address, callback)
	{
		/// private: cleans the address provided (if possible)
		/// address: the address to be cleaned.
		/// callback: the callback to be called once all process is complete.
		if (undefined === address || null === address || !address.isDomestic())
		{
			return;
		}

		if (address.isClean())
		{
			trace("Address already cleaned: " + address.name() + " [" + address.hash() + "]");
		}

		// abort any previous request for the same address (if one exists)
		json.remoteloader.cancel(address.previousHash());

		if (!address.isPopulated() || address.isClean() || !address.isEnabled() || _failures >= _maxFailures)
		{
			return onCleanFinally(address, callback);
		}

		for (var i = 0; i < _addresses.length; i++)
		{
			if (address === _addresses[i] || _addresses[i].isEnabled())
			{
				continue;
			}
			else if (address.equals(_addresses[i]))
			{
				 // identical address already submitted, once cleaned, both will be modified when the response is received.
				trace(address.name() + " [" + address.hash() + "] identical to already submitted " + _addresses[i].name() + " [" + _addresses[i].hash() + "]");
				return onCleanFinally(address, callback);
			}
		}

		if (!_key)
		{
			trace("Invalid key.  Unable to submit address for cleaning.");
			return onCleanFinally(address, callback);
		}

		address.enable(false); // address is about to be cleaned, disable it
		_display.busy(++_requests); // display "busy" status.

		trace("<u>Address submitted: " + address.name() + " [" + address.hash() + "]</u>");

		var url = _url
			+ ((_url.indexOf("?") > -1) ? "&" : "?") + "service=" + _service
			+ (_demo ? "&demo=" : "")
			+ "&key=" + _key
			+ "&suggestions=" + _suggestions
			+ "&callback=json.remoteloader.callback"
			+ "&id=" + address.hash()
			+ "&properCase=" + _properCase
			+ "&" + jQuery.param(address.params());

		json.remoteloader.load(
			{
				url: url,
				timeout: (_timeout * 1000), // convert to milliseconds
				onFailure: function(request_id)
				{
					trace("Submission failure: " + address.name() + " [" + request_id + "]");
					_failures++;
					onRequestComplete(address, callback, undefined);
				},
				onCancel: function(request_id)
				{
					trace("<u>Submission cancelled: " + address.name() + " [" + request_id + "]</u>");
					onRequestComplete(address, callback, undefined);
				},
				onSuccess: function(json, request_id)
				{
					onRequestComplete(address, callback, json);
				}
			},
			address.hash()
		);
	};
	var submitHandler = function(form)
	{
		/// private: event which fires when the form is about to be submitted to the server.
		trace("onSubmit fired.");
		
		if (!_busySubmit && _requests > 0)
		{
			return false; // cannot submit while validating addresses
		}
		
		if (toClean() <= 0 && _requests <= 0)
		{
			if (false === _onComplete())
			{
				// Don't submit if onComplete wants it to stop.
				return false;
			}
			if (false !== _allowPost)
			{
				// But if onComplete and allowPost allow it, then submit it.
				return true;
			}
		}

		// Check to see if a submit button for the addres was set in the
		// constructor, if so then if the button click is not the submit
		// button then let the submission continue.
		if (_submitId !== undefined && jQuery("#" + _submitId)[0] !== _button[0])
		{
			return true;
		}

		var cleanCallback = function(address)
		{		
			// Function that continues processing the form after processing on the QAD end is done
			trace("onSubmit callback - Address: " + address.name() + " [" + address.hash() + "]");
			
			// Find out if we're waiting on any invalid addresses ("loitering")
			var loitering = false;
			for (var i = 0; i < _addresses.length; i ++)
			{
				if (_addresses[i].loitering() === true)
				{
					loitering = true;
					break;
				}
			}
			
			trace("Loitering (waiting for user to fix an unverifiable address): " + loitering);
			
			// resume submission after all processing is complete if autoSubmit is set to true.
			if (loitering || !_allowPost)
			{
				return; // don't POST if we're waiting for them to fix at least one unverifiable address
			}
			
			trace("*** SUBMIT ***");
				
			if (undefined !== _button && null !== _button && _button.length > 0)
			{
				_button.click();
			}
			else if ("function" === typeof(form.submit))
			{
				form.submit();
			}
//			else if (jQuery(form.submit).is(":button,:submit"))
//			{
//				jQuery(form.submit).click();
//			}
		};

		for (var i = 0; i < _addresses.length; i++)
		{
			// clean the address and if we're all done, force a submit of the form
			clean(_addresses[i], cleanCallback);
		}

		trace("onSubmit complete.");

		return false;
	};
	_this.submit = submitHandler;

	var onAddressChanged = function(sender, args)
	{
		/// private: event which fires when the address has changed.
		/// sender: the address that changed
		/// args: arguments about how the address changed.

		trace("Address modified: " + sender.name() + " [" + sender.previousHash() + "] -&gt; [" + sender.hash() + "]");

		// only clean if autoclean (because address has changed) is enabled and components have been added or changed (not deleted).
		if (_autoClean && args.change >= 0)
		{
			clean(sender);
		}
	};

	var submitEvent = function(form)
	{
		// Check to see if a valid form was passed in.
		if (null === form || undefined === form)
		{
			return;
		}

		// if the form already has the new onsubmit
		// then return.
		if (form.onsubmitChanged)
		{
			return;
		}

		// Get the form's current onsubmit
		var prevOnsubmit = form.onsubmit;

		// Create a new onsubmit function.
		var onSubmit = function()
		{
			if ("function" === typeof(prevOnsubmit) && !prevOnsubmit())
			{
				return false;
			}

			return submitHandler(form);
		};

		// Set the form's onsubmit to the function.
		form.onsubmit = onSubmit;

		// Set the form to being changed.
		form.onsubmitChanged = true;
	};

	// QadServer constructor
	if ("undefined" === typeof(jQuery) || "undefined" === typeof(QadDisplay) || "undefined" === typeof(QadAddress) || "undefined" === typeof(QadComponent))
	{
		return;
	}
	if (undefined === serverSettings || null === serverSettings || undefined === inputs || null === inputs)
	{
		return trace("invalid parameters supplied.");
	}

	_key = serverSettings.key;

	if (!jQuery.isNullOrEmpty(serverSettings.url))
	{
		_url = serverSettings.url;
	}
	if ("http:" === document.location.protocol)
	{
		// if the page is plain, old http, call the scripts from http.
		_url = _url.replace("https://", "http://");
	}
	else if ("https:" === document.location.protocol)
	{
		// if the page secure ensure the calls are done via https (to avoid browser warnings).
		_url = _url.replace("http://", "https://");
	}

	if (!jQuery.isNullOrEmpty(serverSettings.service))
	{
		_service = serverSettings.service;
	}
	if ("boolean" === typeof(serverSettings.demo))
	{
		_demo = serverSettings.demo;
	}
	if ("boolean" === typeof(serverSettings.autoClean))
	{
		_autoClean = serverSettings.autoClean;
	}
	if ("number" === typeof(serverSettings.suggestions) && serverSettings.suggestions >= MIN_SUGGESTIONS && serverSettings.suggestions <= MAX_SUGGESTIONS)
	{
		_suggestions = serverSettings.suggestions;
	}
	if ("number" === typeof(serverSettings.timeout) && serverSettings.timeout >= MIN_TIMEOUT && serverSettings.timeout <= MAX_TIMEOUT)
	{
		_timeout = serverSettings.timeout;
	}
	if ("number" === typeof(serverSettings.maxFailures) && serverSettings.maxFailures >= MIN_FAILURES && serverSettings.maxFailures <= MAX_FAILURES)
	{
		_maxFailures = serverSettings.maxFailures;
	}
	if ("boolean" === typeof(serverSettings.busySubmit))
	{
		_busySubmit = serverSettings.busySubmit;
	}
	if ("boolean" === typeof(serverSettings.allowPost))
	{
		_allowPost = serverSettings.allowPost;
	}
	if (!jQuery.isNullOrEmpty(serverSettings.submitId))
	{
		_submitId = serverSettings.submitId;
	}
	if ("boolean" === typeof(serverSettings.properCase))
	{
		_properCase = serverSettings.properCase;
	}

	// Carry through the onComplete callback... return true by default.
	_onComplete = serverSettings.onComplete || function() { return true; };

	_display = new QadDisplay(displaySettings);

	jQuery.each(inputs, function(i, input)
	{
		if (undefined === input || null === input)
		{
			return;
		}

		_addresses.push(new QadAddress(input));
		_addresses[i].changedEvent(onAddressChanged);

		// Setup the onsubmit event for the from.
		submitEvent(_addresses[i].form());

		// fire address changed as soon as form loads
		onAddressChanged(_addresses[i], { change: 1 /* value(s) added */ } );
	});

	// Get the last button that was just clicked.
	jQuery(":submit,:button,:image").click(function()
	{
		if (0 === _requests)
		{
			_button = jQuery(this);
		}
	});
}
 
function QadApi( serverSettings, displaySettings, inputs )
{
	if ("undefined" === typeof(jQuery))
	{
		return; // don't do anything, no jQuery to work with
	}

	jQuery(function()
	{
		if ("undefined" === typeof(QadServer.current))
		{
			QadServer.current = new QadServer(serverSettings, displaySettings, inputs);
		}
	});
}