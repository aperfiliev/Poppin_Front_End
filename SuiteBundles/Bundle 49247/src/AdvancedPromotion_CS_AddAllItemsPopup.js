var TRANS_CS_AddAllItemsPopup = {};

function init_CS_AddAllItemsPopup() {
	var translates_CS_AddAllItemsPopup = [];
	translates_CS_AddAllItemsPopup.push(new TranslateMember('label.whatsthis', 'HELP_WHATSTHIS', "What's This"));
	translates_CS_AddAllItemsPopup.push(new TranslateMember('label.addanother', 'LABEL_ADD_ANOTHER', "Add Another"));
	translates_CS_AddAllItemsPopup.push(new TranslateMember('label.remove', 'LABEL_REMOVE', "Remove"));
	translates_CS_AddAllItemsPopup.push(new TranslateMember('label.remove.tier', 'LABEL_REMOVE_TIER', "Remove Tier"));
	translates_CS_AddAllItemsPopup.push(new TranslateMember('error.maxtier.reached', 'ERROR_MAXTIER_REACHED', "A promotion can only use 10 tiers."));
	TRANS_CS_AddAllItemsPopup = new TranslateHelper(translates_CS_AddAllItemsPopup);
}

var TranslateInitFunctions;
var TranslateInit;
if (!TranslateInitFunctions) TranslateInitFunctions = [];
TranslateInitFunctions.push(init_CS_AddAllItemsPopup);
if (TranslateInit) TranslateInit();

function randomString(length) {
	var chars = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    var retVal = '';

	for (var i = 0; i < length; i++) {
		retVal = retVal + chars[Math.floor(Math.random() * chars.length)];
	}
	return retVal;
}

var disabler = function(i, source) {
	var x = $(source);
	x.attr("disabled", "disabled");
	x.children().each(disabler);
};

var enabler = function(i, source) {
	var x = $(source);
	x.removeAttr("disabled");
	x.children().each(enabler);
};


var hider = function(i, source) {
	var x = $(source);
	x.hide();
	x.children().each(hider);
};

var shower = function(i, source) {
	var x = $(source);
	x.show();
	x.children().each(shower);
};


var LabelWithHelp = function(pLabel, pID) {
	this.label = pLabel;
	this.identifier = pID;
};


var ValueUnitObject = function(pLabel, pSelectBoxPrefix, pValuePrefix, pContainerId, pSelectOptions, pSelected, pValues) {
	
	var rowNo = 0;
	var selectOptions = pSelectOptions;
	var unfilteredOptions = pSelectOptions;
	var selectBoxPrefix = pSelectBoxPrefix;
	var valuePrefix = pValuePrefix;
	var containerId = pContainerId;
	var selectBoxIds = [];
	var zeroSelect = true;
	var zeroOnly = false;
	var selection = pSelected;
	var values = pValues;
	var label = pLabel;
	var enabled = true;

	
	var Filter = function(prefix) {
		var sbprefix = prefix;
		var re = new RegExp("^" + sbprefix + "[0-9]+$");
		this.filter = function(index) {
			return re.test(this.id);
		};
	};
	var sbFilter = new Filter(selectBoxPrefix);
	var ibFilter = new Filter(valuePrefix);

	
	var item_table = $('<table>').css('border-collapse', 'collapse').css('border-style','none');
	var inner_item_table = $('<span>');
	var tmptr = $('<tr>');
	if (label) {
		var anch = null;
		var xz = null;
		if (label instanceof LabelWithHelp) {
			anch = $('<a>').text(label.label).css('vertical-align','text-top').attr('class', 'smallgraytextnolink'); 
			anch.click(function() {nlFieldHelp(96,'NONE_NEEDED', label.identifier, this);});
			anch.mouseleave(function(){this.className='smallgraytextnolink';});
			anch.mouseover(function(){this.className='smallgraytext'; return true;});
			anch.css('cursor', 'help');
			anch.attr('title', TRANS_CS_AddAllItemsPopup.HELP_WHATSTHIS);
			anch.attr("href", "javascript:void('help')");
			xz = $('<td>').append(anch).css('vertical-align','text-top');
		} else {
			xz = $('<td>').text(label).css('vertical-align','text-top').attr('class', 'smallgraytextnolink');
		}
		
		xz.css('width', '100px');
		xz.css('text-align', 'right');
		
		tmptr.append(xz);
	}
	tmptr.append($('<td>').append(inner_item_table));
	item_table.append(tmptr);
	$('#' + containerId).append(item_table);
	
	var adder = $('<a>');
	adder.text(TRANS_CS_AddAllItemsPopup.LABEL_ADD_ANOTHER);
	adder.css('cursor', 'pointer');
	adder.attr('class', 'smallgraytextnolink');
	inner_item_table.after(adder);
	
	
	var isInUse = function (value, except) {
		var i = 0;
		var retVal = false;
		var finder = function(i,elem) {
			if ($(elem).val() == value) {
				retVal = true;
				return false;
			}
		};
		
		$('select').filter(sbFilter.filter).each(finder);

		return retVal;
	};
	
	var onSelectBoxChange = function () {
		redrawSelectBoxes();
		notifyObservers();
	};
	
	var renderOptions = function (selectBox, selected) {
		
		var $opts = null;
		var i;
		var idx = null;
		var selectBoxId = selectBox.attr("id");
		var selectNumbers = $('select').filter(sbFilter.filter).length;
		// var matcher = new RegExp('^(' + pSelectBoxPrefix + ')([0-9]+)$');
		for (i = 0; i < selectOptions.length; i++) {
			zeroSelect = (selected == '0');
			if (isInUse(selectOptions[i].value, selectBoxId)) continue;
			if ((zeroOnly) && (i > 0) && (selectOptions[i].value != "0")) {
				continue;
			} else if ((!zeroSelect) && (i == 0) && (selectOptions[i].value == "0") && (selectNumbers > 1)) {
				continue;
			} else if ((selectNumbers == 1) && (selected == 0)) {
				adder.hide();
			} else if ((selectNumbers == 1) && (selected != 0) && (selects() > 1)) {
				adder.show();
			}

				
			$opts = $('<option>');
			$opts.text(selectOptions[i].text);
			$opts.val(selectOptions[i].value);
	
			if ((selected) && (selectOptions[i].value == selected)) {
				$opts.attr('selected', 'selected');
				
			}
			
			selectBox.append($opts);
			
			if ((i == 0) && (selectOptions[i].value == "0")) {
				$opts = $('<option>');
				$opts.text('--------');
				$opts.val('--------');
				$opts.attr('disabled', 'true');
				selectBox.append($opts);
			}
		}
	};
	
	var redrawSelectBoxes = function () {
		var i;
		var selectedValue = null;
		var swidth = 0;
		var render = function(i, elem) {
			selectBox = $(elem);
			selectedValue = selectBox.val();
			selectBox.children().remove();
			renderOptions(selectBox, selectedValue);
			if (selectBox.outerWidth() > swidth) swidth = selectBox.outerWidth();
			
		};
		
		var widthAdjust = function(i, elem) {
			$(elem).width(swidth);
		};
		$('select').filter(sbFilter.filter).each(render);
		$('select').filter(sbFilter.filter).each(widthAdjust);
	};

	var renumber = function() {
		
	};

	var selects = function() {
		var sel = selectOptions.length;
		if ((!zeroSelect)  && (rowNo >= 1) && (selectOptions[0].value === "0")) sel--;
		return sel;
	};
	
	var removeSelectBox = function(reference) {
		
		var ref = reference;
		this.remover = function() {
			if (rowNo > 1) {
				ref.remove();
				redrawSelectBoxes();
				rowNo--;
				if (rowNo < selects() ) {
					adder.show();
				}
			}
			if (rowNo > 1) $('a[id^="' + 'remover' + selectBoxPrefix + '"]').show();
			else $('a[id^="' + 'remover' + selectBoxPrefix + '"]').hide();
	};
		var stopper = true;
	};

	
	var drawSelectBox = function (selected, val) {
	
		if (!(selectOptions instanceof Array)) return;
		
		var newSelectBoxId = selectBoxPrefix + rowNo;
		var newTextBoxId = valuePrefix + rowNo;
		var removeId = 'remover' + selectBoxPrefix + rowNo;
		
		var $new_row = $('<div>');
		// $new_row.attr('class','effectStatic');
		inner_item_table.append($new_row);
		
		if (valuePrefix) {
			var $amount_cell = $('<span>');
			
			var $amountBox = $("<input>");

			$amount_cell.attr('class','effectStatic');
			$amount_cell.css('vertical-align','top');
			$amountBox.attr('class', 'inputrt');
			
			$amountBox.attr('type', 'text');
			$amountBox.attr('id', newTextBoxId);
			$amountBox.val(val);
			$amount_cell.append($amountBox);
			$new_row.append($amount_cell);
			$new_row.append('&nbsp;');
		}
		
		var $currency_cell = $('<span>');
		var $selectBox = $('<select>');
		$selectBox.change(onSelectBoxChange);
		$selectBox.attr('id', newSelectBoxId);
		$currency_cell.append($selectBox);
		$currency_cell.attr('class', 'effectStatic');
		$currency_cell.css('vertical-align','top');
		$selectBox.attr('class', 'inputreq');
		$new_row.append($currency_cell);

		var $remove_text = $('<a>');
		var x = new removeSelectBox($new_row);
		$remove_text.click(x.remover);
		$remove_text.text(TRANS_CS_AddAllItemsPopup.LABEL_REMOVE);
		$remove_text.css('cursor', 'pointer');
		$remove_text.css('padding-left', '5px');
		$remove_text.attr('class', 'smallgraytextnolink');
		$new_row.append($remove_text);
		$remove_text.after($('<br>'));
		$remove_text.attr('id', removeId);

		
		rowNo++;

		if (rowNo > 1) $('a[id^="' + 'remover' + selectBoxPrefix + '"]').show();
		else $('a[id^="' + 'remover' + selectBoxPrefix + '"]').hide();
		
		renderOptions($selectBox, selected);
		redrawSelectBoxes(newSelectBoxId);
		
		var sel = selectOptions.length;
		if ((sel) && (selectOptions[0].value === "0")) sel--;
	
		if (rowNo >= selects() ) {
			adder.hide();
		}
	};

	this.getRowNo = function() {return rowNo;};

	this.enable = function() {
		enabler(0, item_table);
		
		if ((!zeroSelect)  && (rowNo < selects())) {
			adder.show();
		}
		if (rowNo > 1) $('a[id^="' + 'remover' + selectBoxPrefix + '"]').show();
		enabled = true;
	};
	
	this.disable = function() {
		disabler(0, item_table);
		adder.hide();
		$('a[id^="' + 'remover' + selectBoxPrefix + '"]').hide();
		enabled = false;
	};

	this.toggle = function() {
		if (enabled) {
			disabler(0, item_table);
			disabler(0, adder);
			enabled = false;
		} else {
			enabler(0, item_table);
			if ((!zeroSelect)  && (rowNo < selects())) {
				enabler(0, adder);
			}
			enabled = true;
		}
	};
	
	this.getValues = function() {
		if (!enabled) return [];
		
		var Filler = function(pContainer) {
			var container = pContainer;
			this.fill = function(i, elem) {
				container.push($(elem).val());
			};
			this.getContainer = function() {return container;};
			this.setContainer = function(pCont) {container = pCont;};
		};
		
		var vvalues = null;
		var sselection = null;
		var retVal = [];
		var filler = new Filler();

		filler.setContainer([]);
		$('input').filter(ibFilter.filter).each(filler.fill);
		vvalues = filler.getContainer();
		
		filler.setContainer([]);
		$('select').filter(sbFilter.filter).each(filler.fill);
		sselection = filler.getContainer();
		
		var aarrayDiff = sselection.length - vvalues.length;
		if (aarrayDiff > 0) {
			for (i = 0; i < aarrayDiff; i++) vvalues.push(null);
		}

		if (sselection.length > 0) {
			for (var i = 0; i < vvalues.length; i++) {
				retVal.push({"key" : sselection[i], "value" : vvalues[i]});
			} 
		}
		return retVal;
	};

	this.isEnabled = function() {return enabled;};
	
	var filter = function(filterCriteria) {
		var tmpArr = [];
		for (var i = 0; i < unfilteredOptions.length; i++) {
			if (jQuery.inArray(unfilteredOptions[i].value, filterCriteria) == -1) {
				tmpArr.push(unfilteredOptions[i]);
			}
		}
		selectOptions = tmpArr;
	};

	this.getSelectOptions = function() {return selectOptions;};
	this.redraw = function() {redrawSelectBoxes();};

	var filterData = [];
	
	var observers = [];
	
	this.register = function(observer) {
		observers.push(observer);
		notifyObservers();
	};
	
	this.unregister = function() {
		// to follow
	};
	
	this.notify = function(data) {
		// filter(filterData);
		zeroOnly = data;
		if (zeroOnly) {
			$('select').filter(sbFilter.filter).each(function(i, elem) {
					if (i > 0) {
						$(elem).parent().parent().remove();
						rowNo--;
					}
				}
			);
			redrawSelectBoxes();
		}
		redrawSelectBoxes();
		// redrawSelectBoxes();
	};

	var notifyObservers = function() {
		if (observers.length == 0) return;
		var hasNonZero = false;
		$('select').filter(sbFilter.filter).each(function(i, elem) {
			if ($(elem).val() != "0") {
				hasNonZero = true;
				return false;
			}
		});
		for (var j = 0; j < observers.length; j++) {
			if (observers[j].notify) observers[j].notify(hasNonZero);
		}
	};

	this.getContainerId = function() {return containerId;};
	
	this.getContainer = function() {
		return item_table;
	};
	
	var i;

	if (!selection) selection = ['0'];
	if (!(selection instanceof Array)) selection = [selection];
	
	if (!values) values = [''];
	if (!(values instanceof Array)) values = [values];
	
	var arrayDiff = selection.length - values.length;
	if (arrayDiff > 0) {
		for (i = 0; i < arrayDiff; i++) values.push('');
	}
	adder.click(drawSelectBox);

	for (i = 0; i < selection.length; i++) 
		drawSelectBox(selection[i], values[i]);	

};

var TextboxObject = function(pLabel, pValuePrefix, pContainerId, pValue) {
	var valuePrefix = pValuePrefix;
	var newTextBoxId = valuePrefix + '0';
	var containerId = pContainerId;
	var enabled = true;
	var value = pValue;
	var label = pLabel;
	
	
	var inputBox = $('<input>');
	inputBox.attr('type', 'text');
	inputBox.attr('id', newTextBoxId);
	inputBox.val(value);
	inputBox.attr('class', 'inputrt');
	
	var newTable = $('<table>').css('border-collapse', 'collapse').css('border-style','none');
	var tmpRow = $('<tr>');
	if (label) {
		var anch = null;
		var xz = null;
		if (label instanceof LabelWithHelp) {
			anch = $('<a>').text(label.label).css('vertical-align','text-top').attr('class', 'smallgraytextnolink'); 
			anch.click(function() {nlFieldHelp(96,'NONE_NEEDED', label.identifier, this);});
			anch.mouseleave(function(){this.className='smallgraytextnolink';});
			anch.mouseover(function(){this.className='smallgraytext'; return true;});
			anch.css('cursor', 'help');
			anch.attr('title', TRANS_CS_AddAllItemsPopup.HELP_WHATSTHIS);
			anch.attr("href", "javascript:void('help')");
			xz = $('<td>').append(anch).css('vertical-align','text-top');
		} else {
			anch = $('<span>').text(label).css('vertical-align','text-top').attr('class', 'smallgraytextnolink');
			xz = $('<td>').text(label).css('vertical-align','text-top').attr('class', 'smallgraytextnolink');
		}
		
		xz.css('width', '100px');
		xz.css('text-align', 'right');
		
//		tmptr.append(xz);
		tmpRow.append(xz);
	}
	
	tmpRow.append($('<td>').append(inputBox).attr('class','effectStatic'));
	newTable.append(tmpRow);
	$('#' + containerId).append(newTable);

	this.enable = function() {
		enabler(0, newTable);
		enabled = true;
	};
	
	this.disable = function() {
		disabler(0, newTable);
		enabled = false;
	};
	
	this.toggle = function() {
		if (enabled) {
			disabler(0, newTable);
			enabled = false;
		} else {
			enabler(0, newTable);
			enabled = true;
		}
	};
	
	this.getValues = function() {
		return inputBox.val();
	};
	
	this.isEnabled = function() {return enabled;};

	this.getContainerId = function() {return containerId;};

	this.getContainer = function() {
		return newTable;
	};

	
};


var TextboxObjectGroup = function(pLabels, pValuePrefix, pContainerId, pValues) {
	var valuePrefix = pValuePrefix;
	var containerId = pContainerId;
	var enabled = true;
	var values = pValues;
	var labels = pLabels;
	var values = pValues;
	var tierCount = 0;
	var maxTiers = 0;
	var inputBoxes = [];
	var trs = [];

	var trAddAnother = $('<tr>');
	var remover = $('<a>');
	remover.text(TRANS_CS_AddAllItemsPopup.LABEL_REMOVE);
	remover.text('Remove');
	remover.css('cursor', 'pointer');
	remover.attr('class', 'smallgraytextnolink');

	var showRow = function() {
		if (!enabled) return;
		var remCol = 2;
		shower(0, trs[tierCount]);
		tierCount++;
		if (tierCount >= maxTiers) hider(0, trAddAnother);
		if (tierCount > 1) {
			remCol = trs[tierCount-1].children().length - 1;
			var z = $(trs[tierCount-1].children()[remCol]);
			z.append(remover);
			remover.show();
		}
	};

	var hideRow = function() {
		if (!enabled) return;
		var remCol = 2;
		tierCount--;
		hider(0, trs[tierCount]);
		if (tierCount < maxTiers) shower(0, trAddAnother);
		if (tierCount > 1) {
			remCol = trs[tierCount-1].children().length - 1;
			$(trs[tierCount-1].children()[remCol]).append(remover);
			remover.show();
		} else {
			remCol = trs[0].children().length - 1;
			$(trs[0].children()[remCol]).children().remove();
		}
	};
	remover.click(hideRow);


	
	if (!(labels instanceof Array)) labels = [labels];
	if (!(values instanceof Array)) values = [values];
	
	maxTiers = labels.length;


	var newTable = $('<table>').css('border-collapse', 'collapse').css('border-style','none');
	for (var i = 0; i < maxTiers; i++) {
		var inputBox = $('<input>');
		inputBox.attr('type', 'text');
		inputBox.attr('id', (valuePrefix + i));
		inputBox.val(values[i]);
		inputBox.attr('class', 'inputrt');
		inputBoxes.push(inputBox);
		
		var tmpRow = $('<tr>');
		
		
		
		if (labels[i]) {
			var anch = null;
			var xz = null;
			if (labels[i] instanceof LabelWithHelp) {
				anch = $('<a>').text(labels[i].label).css('vertical-align','text-top').attr('class', 'smallgraytextnolink'); 
				anch.click(function() {nlFieldHelp(96,'NONE_NEEDED', labels[i].identifier, this);});
				anch.mouseleave(function(){this.className='smallgraytextnolink';});
				anch.mouseover(function(){this.className='smallgraytext'; return true;});
				anch.css('cursor', 'help');
				anch.attr('title', TRANS_CS_AddAllItemsPopup.HELP_WHATSTHIS);
				anch.attr("href", "javascript:void('help')");
				xz = $('<td>').append(anch).css('vertical-align','text-top');
			} else {
				anch = $('<span>').text(labels[i]).css('vertical-align','text-top').attr('class', 'smallgraytextnolink');
				xz = $('<td>').text(labels[i]).css('vertical-align','text-top').attr('class', 'smallgraytextnolink');
			}
			
			xz.css('width', '100px');
			xz.css('text-align', 'right');
			
			tmpRow.append(xz);
		}
		tmpRow.append($('<td>').append(inputBox).attr('class','effectStatic'));
		var removeCell = $('<td>');
		
		
		if (i > 0) {
			removeCell.append(remover);
		}
		
		tmpRow.append(removeCell);
		
		trs.push(tmpRow);
		newTable.append(tmpRow);

		if ((i > 0) && (i >= values.length)) {
			// tmpRow.hide();
			hider(0, tmpRow);
		} else {
			tierCount++;
		}

	}


	
	var adder = $('<a>');
	adder.text(TRANS_CS_AddAllItemsPopup.LABEL_ADD_ANOTHER);
	adder.text('Add');
	adder.css('cursor', 'pointer');
	adder.attr('class', 'smallgraytextnolink');
	adder.click(showRow);
	
	
	trAddAnother.append($('<td>'));
	trAddAnother.append($('<td>').append(adder));
	newTable.append(trAddAnother);

	$('#' + containerId).append(newTable);
	
	
	
	this.enable = function() {
		enabler(0, newTable);
		enabled = true;
	};
	
	this.disable = function() {
		disabler(0, newTable);
		enabled = false;
	};
	
	this.toggle = function() {
		if (enabled) {
			disabler(0, newTable);
			enabled = false;
		} else {
			enabler(0, newTable);
			enabled = true;
		}
	};
	
	this.getValues = function() {
		var retval = [];
		for (var i = 0; ((i < inputBoxes.length) && (i < tierCount)); i++) {
			retval.push(inputBoxes[i].val());
		}
		return retval;
	};
	
	this.isEnabled = function() {return enabled;};

	this.getContainerId = function() {return containerId;};

	this.getContainer = function() {
		return newTable;
	};

	
};

var ValueUnitObjectGroup = function(pLabels, pSelectBoxPrefix, pValuePrefix, pContainerId, pSelectOptions, pSelected, pValues, pFromSavedSearch) {
	var valuePrefix = pValuePrefix;
	var selectPrefix = pSelectBoxPrefix;
	var containerId = pContainerId;
	var selOptions = pSelectOptions;
//	var selecteds = pSelectOptions;
	var selecteds = pSelected;
	var enabled = true;
	var values = pValues;
	var labels = pLabels;
	var values = pValues;
	var tierCount = 0;
	var maxTiers = 0;
	var inputBoxes = [];
	var trs = [];
	var fromSavedSearch = pFromSavedSearch;

	var trAddAnother = $('<tr>');
	var remover = $('<a>');
	remover.text(TRANS_CS_AddAllItemsPopup.LABEL_REMOVE);
	remover.text('Remove');
	remover.css('cursor', 'pointer');
	remover.attr('class', 'smallgraytextnolink');
	remover.attr('id', 'removeTierLink');

	var showRow = function() {
		if (!enabled) return;
		var remCol = 2;
		shower(0, trs[tierCount]);
		tierCount++;
		if (tierCount > maxTiers) {
			// do not hide Add Another Tier link, just do nothing
			// hider(0, trAddAnother);
			tierCount--;
			alert(TRANS_CS_AddAllItemsPopup.ERROR_MAXTIER_REACHED);
			return;
		}
		if (tierCount > 1) {
			remCol = trs[tierCount-1].children().length - 1;
			var z = $(trs[tierCount-1].children()[remCol]);
			z.append(remover);
			remover.show();
		}
		
		prettifyLayoutOfTierLinks(fromSavedSearch);
	};

	var hideRow = function() {
		if (!enabled) return;
		var remCol = 2;
		tierCount--;
		hider(0, trs[tierCount]);
		if (tierCount < maxTiers) shower(0, trAddAnother);
		if (tierCount > 1) {
			remCol = trs[tierCount-1].children().length - 1;
			$(trs[tierCount-1].children()[remCol]).append(remover);
			remover.show();
		} else {
//			remCol = trs[0].children().length - 1;
//			$(trs[0].children()[remCol]).children().remove();
			remCol = trs[tierCount-1].children().length - 1;
			$(trs[tierCount-1].children()[remCol]).append(remover);
			remover.show();
		}
		
//		alert('fromSavedSearch = ' + fromSavedSearch);
		prettifyLayoutOfTierLinks(fromSavedSearch);
	};
	remover.click(hideRow);

	if (!values) values = [];
	if (!selecteds) selecteds = [];
	
	if (!(labels instanceof Array)) labels = [labels];
	if (!(values instanceof Array)) values = [values];
	
	maxTiers = labels.length;


	var newTable = $('<table>').css('border-collapse', 'collapse').css('border-style','none');
	for (var i = 0; i < maxTiers; i++) {
	
		var tmpRow = $('<tr>');
		var tSelPrefix = selectPrefix + '_' + i + '_';
		var tValPrefix = valuePrefix + '_' + i + '_';
		var vbox = new ValueUnitObject(labels[i], tSelPrefix, tValPrefix, containerId, selOptions, selecteds[i], values[i]);
		
		
		tmpRow.append($('<td>').append(vbox.getContainer()));
		var removeCell = $('<td>');
		inputBoxes.push(vbox);
		
		if (i > 0) {
			removeCell.append(remover);
		}
		
		tmpRow.append(removeCell);
		
		trs.push(tmpRow);
		newTable.append(tmpRow);

		if ((i > 0) && (i >= values.length)) {
			// tmpRow.hide();
			hider(0, tmpRow);
		} else {
			tierCount++;
		}

	}


	
	var adder = $('<a>');
	adder.text(TRANS_CS_AddAllItemsPopup.LABEL_ADD_ANOTHER);
	// adder.text('Add');
	adder.css('cursor', 'pointer');
	adder.attr('class', 'smallgraytextnolink');
	adder.click(showRow);
	
	
	// trAddAnother.append($('<td>'));
	trAddAnother.append($('<td>').append(adder));
	newTable.append(trAddAnother);

	$('#' + containerId).append(newTable);
	
	// fix for edit mode (show Remove Tier if more than one tier)
	if(tierCount > 1){
		var z1 = $(trs[tierCount-1].children()[1]);
		z1.append(remover);
		remover.show();	
	}	
	
	this.enable = function() {
		enabler(0, newTable);
		enabled = true;
	};
	
	this.disable = function() {
		disabler(0, newTable);
		enabled = false;
	};
	
	this.toggle = function() {
		if (enabled) {
			disabler(0, newTable);
			enabled = false;
		} else {
			enabler(0, newTable);
			enabled = true;
		}
	};
	
	this.getValues = function() {
		var retval = [];
		for (var i = 0; ((i < inputBoxes.length) && (i < tierCount)); i++) {
			retval.push(inputBoxes[i].getValues());
		}
		return retval;
	};
	
	this.isEnabled = function() {return enabled;};

	this.getContainerId = function() {return containerId;};

	this.getContainer = function() {
		return newTable;
	};

};


var ValueUnitObjectGroupEdit = function(pLabels, pSelectBoxPrefix, pValuePrefix, pContainerId, pSelectOptions, pSelected, pValues) {

	var valuePrefix = pValuePrefix;
	var selectPrefix = pSelectBoxPrefix;
	var containerId = pContainerId;
	var selOptions = pSelectOptions;
//	var selecteds = pSelectOptions;
	var selecteds = pSelected;
	var enabled = true;
	var values = pValues;
	var labels = pLabels;
	var values = pValues;
	var tierCount = 0;
	var maxTiers = 0;
	var inputBoxes = [];
	var trs = [];

	var trAddAnother = $('<tr>');
	var remover = $('<a>');
	remover.text(TRANS_CS_AddAllItemsPopup.LABEL_REMOVE);
	remover.text('Remove');
	remover.css('cursor', 'pointer');
	remover.attr('class', 'smallgraytextnolink');

	var showRow = function() {
		if (!enabled) return;
		var remCol = 2;
		shower(0, trs[tierCount]);
		tierCount++;
		if (tierCount >= maxTiers) hider(0, trAddAnother);
		if (tierCount > 1) {
			remCol = trs[tierCount-1].children().length - 1;
			var z = $(trs[tierCount-1].children()[remCol]);
			z.append(remover);
			remover.show();
		}
	};

	var hideRow = function() {
		if (!enabled) return;
		var remCol = 2;
		tierCount--;
		hider(0, trs[tierCount]);
		if (tierCount < maxTiers) shower(0, trAddAnother);
		if (tierCount > 1) {
			remCol = trs[tierCount-1].children().length - 1;
			$(trs[tierCount-1].children()[remCol]).append(remover);
			remover.show();
		} else {
			remCol = trs[0].children().length - 1;
			$(trs[0].children()[remCol]).children().remove();
		}
	};
	remover.click(hideRow);

	if (!values) values = [];
	if (!selecteds) selecteds = [];
	
	if (!(labels instanceof Array)) labels = [labels];
	if (!(values instanceof Array)) values = [values];
	
	maxTiers = labels.length;


	var newTable = $('<table>').css('border-collapse', 'collapse').css('border-style','none');
	for (var i = 0; i < maxTiers; i++) {
	
		var tmpRow = $('<tr>');
		var tSelPrefix = selectPrefix + '_' + i + '_';
		var tValPrefix = valuePrefix + '_' + i + '_';
		var vbox = new ValueUnitObject(labels[i], tSelPrefix, tValPrefix, containerId, selOptions, selecteds[i], values[i]);
		
		
		tmpRow.append($('<td>').append(vbox.getContainer()));
		var removeCell = $('<td>');
		inputBoxes.push(vbox);
		
		if (i > 0) {
			removeCell.append(remover);
		}
		
		tmpRow.append(removeCell);
		
		trs.push(tmpRow);
		newTable.append(tmpRow);

		if ((i > 0) && (i >= values.length)) {
			// tmpRow.hide();
			hider(0, tmpRow);
		} else {
			tierCount++;
		}

	}


	
	var adder = $('<a>');		// comment out test dudai
//	adder.text(TRANS_CS_AddAllItemsPopup.LABEL_ADD_ANOTHER);
//	adder.text("Add New Tier");
//	// adder.text('Add');
//	adder.css('cursor', 'pointer');
//	adder.attr('class', 'smallgraytextnolink');
//	adder.click(showRow);
//	
//	
//	// trAddAnother.append($('<td>'));
//	trAddAnother.append($('<td>').append(adder));
//	newTable.append(trAddAnother);
//
//	$('#' + containerId).append(newTable);
	
	
	
	this.enable = function() {
		enabler(0, newTable);
		enabled = true;
	};
	
	this.disable = function() {
		disabler(0, newTable);
		enabled = false;
	};
	
	this.toggle = function() {
		if (enabled) {
			disabler(0, newTable);
			enabled = false;
		} else {
			enabler(0, newTable);
			enabled = true;
		}
	};
	
	this.getValues = function() {
		var retval = [];
		for (var i = 0; ((i < inputBoxes.length) && (i < tierCount)); i++) {
			retval.push(inputBoxes[i].getValues());
		}
		return retval;
	};
	
	this.isEnabled = function() {return enabled;};

	this.getContainerId = function() {return containerId;};

	this.getContainer = function() {
		return newTable;
	};
};

var ToggleLabels = function(pLabel1, pLabel2, pLabel) {
	this.radioLabel1 = pLabel1;
	this.radioLabel2 = pLabel2;
	this.label  = pLabel;
};

var Toggle = function(pSelectBoxPrefix, pValuePrefix, pContainerId, pToggleLabels, pForm1, pForm2, pEnabled) {
	
	var selectBoxPrefix = pSelectBoxPrefix;
	var valuePrefix = pValuePrefix;
	var containerId = pContainerId;
	var form1 = pForm1;
	var form2 = pForm2;

	var toggleContainer = $('<table>').css('border-collapse', 'collapse').css('border-style','none');
	
	var anch = "";
	
	var toggleRow1 = $('<tr>');
	var toggleRow2 = $('<tr>');
	
	if (pToggleLabels.label) {
		var xz = null;
		if (pToggleLabels.label instanceof LabelWithHelp) {
			anch = $('<a>').text(pToggleLabels.label.label).css('vertical-align','text-top').attr('class', 'smallgraytextnolink'); 
			anch.click(function() {nlFieldHelp(96,'NONE_NEEDED', pToggleLabels.label.identifier, this);});
			anch.mouseleave(function(){this.className='smallgraytextnolink';});
			anch.mouseover(function(){this.className='smallgraytext'; return true;});
			anch.css('cursor', 'help');
			anch.attr('title', TRANS_CS_AddAllItemsPopup.HELP_WHATSTHIS);
			anch.attr("href", "javascript:void('help')");
			xz = $('<td>').append(anch);
		} else {
			xz = $('<td>').text(pToggleLabels.label).css('vertical-align','text-top').attr('class', 'smallgraytextnolink');
		}
		
		var xy = $('<td>');
		toggleRow1.append(xz);
		toggleRow2.append(xy);
		// xz.css('width', '200px');
		xz.css('text-align', 'right');
	}

	
	var radio1 = $('<input>');
	var radName = randomString(20);
	radio1.attr('name', radName);
	radio1.attr('type', 'radio');
	radio1.attr('class', 'radio');
	radio1.css('white-space', 'nowrap');
	radio1.css('padding', '0px');
	radio1.val('1');
	var xz = null;
	if (pToggleLabels.radioLabel1) {
		if (pToggleLabels.radioLabel1 instanceof LabelWithHelp) {
			anch = $('<a>').text(pToggleLabels.radioLabel1.label).css('vertical-align','text-top').attr('class', 'smallgraytextnolink'); 
			anch.click(function() {nlFieldHelp(96,'NONE_NEEDED', pToggleLabels.radioLabel1.identifier, this);});
			anch.mouseleave(function(){this.className='smallgraytextnolink';});
			anch.mouseover(function(){this.className='smallgraytext'; return true;});
			anch.css('cursor', 'help');
			anch.attr('title', TRANS_CS_AddAllItemsPopup.HELP_WHATSTHIS);
			anch.attr("href", "javascript:void('help')");
			xz = $('<td>').append(anch).css('vertical-align','middle');
		} else {
			xz = $('<td>').text(pToggleLabels.radioLabel1).css('vertical-align','middle').attr('class', 'smallgraytextnolink');
		}
		
		xz.css('text-align', 'right');
	}
	toggleRow1.append($('<td>').append(radio1).css('vertical-align','middle'));
	if (xz != null) toggleRow1.append(xz);
	toggleRow1.append($('<td>').append(form1.getContainer()).css('vertical-align','middle'));
	
	
	var radio2 = $('<input>');
	radio2.attr('name', radName);
	radio2.attr('type', 'radio');
	radio2.attr('class', 'radio');
	radio2.css('white-space', 'nowrap');
	radio2.css('padding', '0px');
	radio2.val('2');
	var xz = null;
	if (pToggleLabels.radioLabel2) {
		if (pToggleLabels.radioLabel2 instanceof LabelWithHelp) {
			anch = $('<a>').text(pToggleLabels.radioLabel2.label).css('vertical-align','text-top').attr('class', 'smallgraytextnolink'); 
			anch.click(function() {nlFieldHelp(96,'NONE_NEEDED', pToggleLabels.radioLabel2.identifier, this);});
			anch.mouseleave(function(){this.className='smallgraytextnolink';});
			anch.mouseover(function(){this.className='smallgraytext'; return true;});
			anch.css('cursor', 'help');
			anch.attr('title', TRANS_CS_AddAllItemsPopup.HELP_WHATSTHIS);
			anch.attr("href", "javascript:void('help')");
			xz = $('<td>').append(anch).css('vertical-align','middle');
		} else {
			xz = $('<td>').text(pToggleLabels.radioLabel2).css('vertical-align','middle').attr('class', 'smallgraytextnolink');
		}
		
		xz.css('text-align', 'right');
	}
	toggleRow2.append($('<td>').append(radio2).css('vertical-align','middle'));
	if (xz != null) toggleRow2.append(xz);
	toggleRow2.append($('<td>').append(form2.getContainer()));
	
	toggleContainer.append(toggleRow1);
	toggleContainer.append(toggleRow2);
	$('#' + containerId).before(toggleContainer);

	
	var rbutton = 0;
	
	if (pEnabled) {
		form1.disable();
		form2.enable();
		radio1.removeAttr('checked');
		radio2.attr('checked', 'checked');
		rbutton = 1;
	} else {
		form1.enable();
		form2.disable();
		radio2.removeAttr('checked');
		radio1.attr('checked', 'checked');
		rbutton = 0;
	}

	var Toggler = function(pFirst, pSecond) {
		var first = pFirst;
		var second = pSecond;
		this.toggle = function() {
			first.toggle();
			second.toggle();
			if (rbutton) {
				radio1.attr('checked', 'checked');
				radio2.removeAttr('checked');
				rbutton = 0;
				
			} else {
				radio1.removeAttr('checked');
				radio2.attr('checked', 'checked');
				rbutton = 1;
			}
		};
		this.rbt1 = function() {
			first.enable();
			second.disable();
			radio2.removeAttr('checked');
			radio1.attr('checked', 'checked');
			rbutton = 0;
		};
		this.rbt2 = function() {
			first.disable();
			second.enable();
			radio1.removeAttr('checked');
			radio2.attr('checked', 'checked');
			rbutton = 1;
		};
	};
	var toggle = new Toggler(form1, form2);
	
	radio1.click(toggle.rbt1);
	radio2.click(toggle.rbt2);
	
	this.getValues = function () {
		if ((form1.isEnabled) && (!form2.isEnabled())) {
			return form1.getValues();
		} else {
			return form2.getValues();
		}
	};
	
	this.notify = function(data) {
		zeroOnly = data;
		if (zeroOnly) {
			form2.disable();
			radio2.attr('disabled', true);
			form1.enable();
			radio1.attr('checked', 'checked');
		} else {
			radio2.attr('disabled', false);
		}
	};


};

var ToggleSelector = function(pSelectBoxPrefix, pContainerId, pLabel, pStateName, pForms, pEnabled) {
	var selectBoxPrefix = pSelectBoxPrefix;
	// var valuePrefix = pValuePrefix;
	var containerId = pContainerId;
	// var form1 = pForm1;
	// var form2 = pForm2;
	var enabled = pEnabled;
	if (isNaN(enabled)) enabled = 0;
	var formRef = [];
	var forms = pForms;
	if (!forms) forms = [];
	if (!(forms instanceof Array)) forms = [forms];
	var stateNames = pStateName;
	if (!stateNames) forms = [];
	if (!(stateNames instanceof Array)) stateNames = [stateNames];
	
	
	
	var toggleContainer = $('<table>').css('border-collapse', 'collapse').css('border-style','none');
	
	var anch = "";
	

	var row = $('<tr>'); 
	if (pLabel) {
		var xz = null;
		if (pLabel instanceof LabelWithHelp) {
			anch = $('<a>').text(pLabel).css('vertical-align','text-top').attr('class', 'smallgraytextnolink'); 
			anch.click(function() {nlFieldHelp(96,'NONE_NEEDED', pToggleLabels.label.identifier, this);});
			anch.mouseleave(function(){this.className='smallgraytextnolink';});
			anch.mouseover(function(){this.className='smallgraytext'; return true;});
			anch.css('cursor', 'help');
			anch.attr('title', TRANS_CS_AddAllItemsPopup.HELP_WHATSTHIS);
			anch.attr("href", "javascript:void('help')");
			xz = $('<td>').append(anch);
		} else {
			xz = $('<td>').text(pLabel).css('vertical-align','text-top').attr('class', 'smallgraytextnolink');
		}
		
		xz.css('text-align', 'right');
		row.append($('<td>').append(xz));
	}

	
	
	var formRow = $('<tr>');
	for (var i = 0; i < forms.length; i++) {
		var tds = $('<td>').append(forms[i].getContainer());
		
		if (i == enabled) shower(tds);
		else hider(tds);
		
		formRef.push(tds);
		formRow.append(tds);
	}

	
	var ToggleChangeHelper = function(pToggler){
		var toggler = pToggler;
		this.onChange = function() {
			for (var i = 0; i < formRef.length; i++) {
				// hider(formRef[i]);
				formRef[i].hide();
			}
			// shower(formRef[toggler.val()]);
			formRef[toggler.val()].show();
		};
	};
	
	var selectorCell = $('<td>');
//	var selector = $('<select>');	//D dudai
	var selector = $('<select id = "offerSelect">');	// A dudai
	var togglerChanger = new ToggleChangeHelper(selector);
	selector.change(togglerChanger.onChange);
	for (var i = 0; i < stateNames.length; i++) {
		var opt = $('<option>');
		opt.text(stateNames[i]);
		opt.val(i);
		selector.append(opt);
	}
	selectorCell.append(selector);
	row.append(selectorCell);
	selector.val(enabled);
	selector.change();
	
	toggleContainer.append(row);
	toggleContainer.append(formRow);
	$('#' + containerId).before(toggleContainer);
	
	

	this.getContainer = function() {return toggleContainer;};
	
	this.getSelectedValue = function() {return parseInt($('#offerSelect').val());};	// A dudai
	
};

function pageInitSample(type) {
	
	// var currencyList = JSON.parse(nlapiGetFieldValue('custpage_currencies'));
	var currencyNameColumn = new nlobjSearchColumn('name');
	var currencySearch = nlapiSearchRecord('currency', null, null, [currencyNameColumn]);
	var currencyList = [{"value":"0", "text":"<Units>"}];
	var bz = [];
	var id = null;
	var name = null;

	for ( i = 0; i < currencySearch.length; i++) {
		id = currencySearch[i].getId();
		name = currencySearch[i].getValue(currencyNameColumn);
		currencyList.push({"value":id, "text":name});
		bz.push({"value":id, "text":name});
	}

	
	// This sorts the currency list by name
	currencyList.sort(function (a, b) {
		if ((a.value == 0) && (b.value != 0)) return -1;
		else if ((a.value != 0) && (b.value == 0)) return 1;
		else if (a.text.toLocaleUpperCase() < b.text.toLocaleUpperCase()) return -1;
		else if (a.text.toLocaleUpperCase() > b.text.toLocaleUpperCase()) return 1;
		else return 0; 
	});
	
	/*
	$.allItemsForm = new ValueUnitObject('currencyUnit', 'amount', 'custpage_all_items_list', currencyList, ['1']);
	$.allItemsForm2 = new ValueUnitObject('currencyUnitt', 'amountt', 'custpage_all_items_list2', currencyList, [1, 2]);
	$.allItemsForm3 = new ValueUnitObject('currencyUnity', 'amounty', 'custpage_all_items_list3', bz, [1,3], [542, 23]);
	*/
	var selectBoxPrefix='currencyUnitt', valuePrefix='amountt', containerId='custpage_all_items_list2';
	
	// $('#' + containerId).css('border-collapse', 'collapse');
	
	var selectOptions = currencyList;
	var selectedValues = ['2', '1'];
	var inputBoxValues = ['54.1', '32.1'];
	var theLabel = "Discount Offer";
	// var selector = new ValueUnitObject(theLabel, selectBoxPrefix, valuePrefix, containerId, selectOptions, selectedValues, inputBoxValues);
	var selector = new ValueUnitObject(theLabel, selectBoxPrefix, valuePrefix, containerId, selectOptions);

	
	var percentValue = '20.0';
	var valueBox = new TextboxObject(theLabel, 'amountz', containerId, percentValue);
	
	var labels = new ToggleLabels('percent', 'amount', 'Discount Type');
	// $.allItemsForm = new Toggle(selectBoxPrefix, valuePrefix, containerId, labels, valueBox, selector, 1);
	$.allItemsForm = new Toggle(selectBoxPrefix, valuePrefix, containerId, labels, valueBox, selector, 1);
	$.selector = selector;
	
	
	
	// Create another table adjacent to custpage_all_items_list3
	$('#custpage_all_items_list3').after($('<div>').attr('id', 'custpage_all_items_list4'));
	
	// This is an example of the removal of currency-currency pairing
	// This uses the observer pattern so that the first form can notify the
	// other form to filter-out the available select options.
	$.allForm1 = new ValueUnitObject('Promotional Offer', 'currencyUnity', 'amounty', 'custpage_all_items_list3', selectOptions, selectedValues, inputBoxValues);
	$.allForm2 = new ValueUnitObject('Limit', 'currencyUnitz', 'amountz', 'custpage_all_items_list4', selectOptions, ['0'], []);
	$.allForm1.register($.allForm2); // allform2 is registered as an observer of allform1
	
	var stopper = true;
	
}

function prettifyLayoutOfTierLinks(fromSavedSearch){

	var removeTierLabel = TRANS_CS_AddAllItemsPopup.LABEL_REMOVE;
	var removeTierAdjustedLabel = '| ' + TRANS_CS_AddAllItemsPopup.LABEL_REMOVE_TIER;
	var tierCount = 0;
	
	var secondTd = $('#custpage_tiers > table > tbody > tr > td:nth-child(2) > a');
	var removeTierLink = secondTd.filter(function(index) {
		   return ($(this).text() == removeTierLabel || $(this).text() == removeTierAdjustedLabel);
	});

	// move the 'Remove Tier' link beside 'Add Another Tier'
	removeTierLink.text(removeTierAdjustedLabel);
	var removeTierDiv = $('#custpage_tiers > table > tbody > tr:nth-child(11) > td > div:nth-child(2)');
	removeTierDiv.empty();
	removeTierDiv.append(removeTierLink);
	
	// hide Add Another links for currencies
	var eligibilityTypes = $('select[id^="custpage_curr_tier_"]');
	
	// loop over the select boxes
	jQuery.each(eligibilityTypes, function(index, value) { 

		var objId = $(this).attr('id');
		var trIndex = parseInt(objId.substring(19, 20)) + 1;
		
		// only process displyed 'tr'		
		var displayTypeObj = $('#custpage_tiers > table > tbody > tr:nth-child(' + trIndex + ')');
		var displayTypeValue = displayTypeObj.css('display');
		
		if(displayTypeValue != 'none'){
			
			var selectBoxValue = $(this).val();
			if(selectBoxValue == 0){
			
				// hide Add Another link below textbox
				var addAnotherCurrencyLink = $('#custpage_tiers > table > tbody > tr:nth-child(' + trIndex + ') > td > table > tbody > tr > td:nth-child(2) > a');
				addAnotherCurrencyLink.hide();
				
				// hide Remove link beside select box
				$('#removercustpage_curr_tier_' + (trIndex-1) + '_0').hide();
			}
			else{
				var nextCurr = $('#removercustpage_curr_tier_' + (trIndex-1) + '_1');
				
				if(typeof nextCurr.attr('id') == 'undefined'){
					$('#removercustpage_curr_tier_' + (trIndex-1) + '_0').hide();
				}
			}
			
			tierCount = trIndex;
		}		
	});
	
	// to make sure that Remove Tier links will be hidden if tierIndex is just one
	if(tierCount == 1){
		removeTierDiv.hide();
	}
	else{
		removeTierDiv.show();
	}
}

// init_CS_AddAllItemsPopup();