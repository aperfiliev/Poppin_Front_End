 /**
 * Description: SuiteCommerce Advanced Features (Quick order)
 *
 * @copyright (c) 2000-2012, NetSuite Inc.
 * @author rtucat
*  @version 2.0
*/
var GPR_AAE_QIO = function($){
    var objOptions = {
        searchInputId: "qio_search",
        itemInputId: "qio_item",
        qioRowListId: "qio_list",
        maxRows: 10
    };
    
    var reEscape = new RegExp('(\\' + ['/', '.', '*', '+', '?', '|', '(', ')', '[', ']', '{', '}', '\\'].join('|\\') + ')', 'g');
    var intRows = 1;
    var objAutOptions;
    
    return {
        init: function(obj){
            if (obj !== null && obj !== undefined) {
                $.extend(objOptions, obj);
            }
            $('#form_qio #n').val(GPR_OPTIONS.options().siteNumber);
        },
        
        onSelect: function(value, data, el){
            $(el).parent().find('.item').val(data.itemid);
        },
        
        initRows: function(obj){
            objAutOptions = obj;
            $('#' + objOptions.searchInputId + '_0').autocomplete(obj);
            var objRemoveRow = $('<a>').attr({
                "href": "javascript:void(0);"
            }).click(function(){
                GPR_AAE_QIO.delRow($(this).parent().attr("id"));
            });
            objRemoveRow.html("-");
            $('#qvi_row_0').append(objRemoveRow);
        },
        
        addRow: function(){
            intRows = $('.qio .list li').length;
            if (intRows < objOptions.maxRows) {
                var li = $('<li>').attr('id', 'qvi_row_' + intRows);
                li.append($('<input>').attr({
                    "class": "search",
                    "id": objOptions.searchInputId + "_" + intRows,
                    "name": objOptions.searchInputId + "_" + intRows,
                    "type": "input"
                }));
                li.append($('<input>').attr({
                    "class": "item",
                    "type": "hidden",
                    "id": objOptions.itemInputId + "_" + intRows
                }));
                li.append($('<input class="qty" type="input" value="1">'));
                var objRemoveRow = $('<a>').attr({
                    "href": "javascript:void(0);"
                }).click(function(){
                    GPR_AAE_QIO.delRow($(this).parent().attr("id"));
                });
                objRemoveRow.html("-");
                li.append(objRemoveRow);
                li.appendTo('#' + objOptions.qioRowListId);
                $('#' + objOptions.searchInputId + '_' + intRows).autocomplete(objAutOptions);
            }
            else {
                GPR_PUP.show("You reach the max rows limit");
            }
        },
        
        delRow: function(strId){
            intRows = $('.qio .list li').length;
            if (intRows > 1) {
                if (strId == null || strId == undefined) {
                    intRows--;
                    $('.qio .list li').last().remove();
                }
                else {
                    intRows--;
                    $('#' + strId).remove();
                }
            }
            else {
                GPR_PUP.show("Must have at least one row");
            }
        },
        
        addToCart: function(){
            var arrItems = [];
            var bolOk = true;
            $('.qio li .qty').each(function(){
                var arrItem = [];
                var intQty = parseInt($(this).val());
                if (intQty == 'NaN' || intQty == 0) {
                    bolOk = false;
                    $(this).focus();
                    GPR_PUP.show("The Quantity must be greater than 0.");
                    return false;
                }
                else {
                    var strItemId = $(this).parent().find('input.item').val();
                    if (strItemId == "" || strItemId == null || strItemId == undefined) {
                        bolOk = false;
                        $(this).parent().find('input.item').focus();
                        GPR_PUP.show("Please select an Item.");
                        return false;
                    }
                    else {
                        arrItem.push(strItemId);
                        arrItem.push($(this).val());
                        arrItems.push(arrItem);
                    }
                }
            });
            intCntItems = arrItems.length;
            if (bolOk && intCntItems > 0) {
                if (intCntItems > 1) {
                    for (var i = arrItems.length - 2; i >= 0; i--) {
                        $.post("/app/site/backend/additemtocart.nl", {
                            c: GPR_OPTIONS.options().companyId,
                            n: GPR_OPTIONS.options().siteNumber,
                            buyid: arrItems[i][0],
                            itemid: arrItems[i][0],
                            qty: arrItems[i][1]
                        });
                    }
                }
                setTimeout(function(){
                    $('#form_qio #itemid').val(arrItems[intCntItems - 1][0]);
                    $('#form_qio #buyid').val(arrItems[intCntItems - 1][0]);
                    $('#form_qio #qty').val(arrItems[intCntItems - 1][1]);
                    $('#form_qio').submit();
                }, (500 * intCntItems));
            }
        },
        
        formatResult: function(value, data, currentValue){
            var pattern = '(' + currentValue.replace(reEscape, '\\$1') + ')';
            var strDisplayValue = value + ((data.name == "" || data.name == undefined) ? "" : " - " + data.name);
            return ('<span class="value">' + strDisplayValue.replace(new RegExp(pattern, 'gi'), '<strong>$1<\/strong>') + '</span><a class="link" href="' + data.url + '">View</a>');
        },
        
        formatResultSearch: function(value, data, currentValue){
            var pattern = '(' + currentValue.replace(reEscape, '\\$1') + ')';
            var strTitle = '';
            var strDesc = '';
            switch (data.type) {
                case 'first-cat':
                    strTitle = '<div class="search-title">Categories</div>';
                    break;
                case 'first-itm':
                    strTitle = '<div class="search-title">Products</div>'
                    break;
                default:
                    strTitle = ''
                    break;
            }
            strDesc = unescape(data.desc);
            if (strDesc.length > 80) {
                strDesc = strDesc.substr(0, 80) + '...';
            }
            else {
                strDesc = unescape(data.desc);
            }
            return (strTitle + ((data.img != null && data.img != '' && data.img != 'undefined') ? '<img src="' + data.img + '" title="">' : '') + '<span class="search-text"><h5><a href="' + data.url + '" title="">' + value.replace(new RegExp(pattern, 'gi'), '<strong>$1<\/strong>') + '</a></h5><p>' + strDesc + '</p></span>');
        },
        
        parseResponseSearch: function parseResponse(text, query){
            var auxResponseCategories = $(text).find("div#cat-list-cell");
            var auxResponseItems = $(text).find("div .item-list-cell");
            var bolItems = true;
            var bolCategories = true
            
            if (auxResponseCategories.length === 0) {
                bolCategories = false
            }
            if (auxResponseItems.length === 0) {
                bolItems = false;
            }
            if (!bolItems && !bolCategories) {
                response = eval("({query: '" + query + "',suggestions: [],data: []})");
                return response;
            }
            else {
                var strSuggestions = "";
                var strData = "";
                $(auxResponseCategories).each(function(i){
                    var strCategoryName = $(this).find('.cat-desc-cell a').text();
                    var strCategoryUrl = $(this).find('.cat-desc-cell a').attr('href');
                    var strCategoryImg = $(this).find('.cat-thumbnail-cell img').attr('src');
                    strCategoryImg = ((strCategoryImg != '' && strCategoryImg != null && strCategoryImg != 'undefined') ? strCategoryImg.split(';') : '');
                    var strCategoryDesc = $(this).find('.cat-detail-desc-cell').html();
                    strCategoryDesc = escape(strCategoryDesc.replace(/'/gi, '-'));
                    strSuggestions += "'" + strCategoryName.replace(/'/gi, '-') + "',";
                    if (i == 0) {
                        strData += "{url: '" + strCategoryUrl + "',img: '" + strCategoryImg[0] + "', desc:'" + strCategoryDesc + "', type: 'first-cat'},";
                    }
                    else {
                        strData += "{url: '" + strCategoryUrl + "',img: '" + strCategoryImg[0] + "', desc:'" + strCategoryDesc + "', type: 'cat'},";
                    }
                });
                $(auxResponseItems).each(function(i){
                    var strName = $(this).find('.desc-cell a').text();
                    var strItemUrl = $(this).find('.desc-cell a').attr('href');
                    var strItemImg = $(this).find('.thumbnail-cell img').attr('src');
                    strItemImg = ((strItemImg != '' && strItemImg != null && strItemImg != 'undefined') ? strItemImg.split(';') : '');
                    var strItemDesc = $(this).find('.detail-desc-cell').html();
                    strItemDesc = escape(strItemDesc.replace(/'/gi, '-'));
                    strSuggestions += "'" + strName.replace(/'/gi, '-') + "',";
                    if (i == 0) {
                        strData += "{url: '" + strItemUrl + "',img: '" + strItemImg[0] + "', desc:'" + strItemDesc + "', type: 'first-itm'},";
                    }
                    else {
                        strData += "{url: '" + strItemUrl + "',img: '" + strItemImg[0] + "', desc:'" + strItemDesc + "', type: 'itm'},";
                    }
                });
                strSuggestions = strSuggestions.substring(0, (strSuggestions.length - 1));
                strData = strData.substring(0, (strData.length - 1));
                response = eval("({query: '" + query + "',suggestions: [" + strSuggestions + "],data: [" + strData + "]})");
                return response;
            }
        },
        
        viewMoreSearch: function(query){
            return ('<div class="view-more"><a href="/s.nl?search=' + query + '" title="">View all search results</a></div>')
        },
        
        onSelectSearch: function(value, data, obj){
            window.location = data.url;
        }
    }
}(jQuery);


/**
 * Create's the autosuggestions with the search results for a specific input field
 * @param {Object} el The input field
 * @param {Object} options
 * 	autoSubmit 		- Automatically submit the parent form for the input field
 * 	minChar 		- Minimum quantity for begin searching
 *  maxHeight		- Maximum Height for the search results box
 *  deferRequestBy	- Delay the autosuggestion process in x milliseconds
 *  width			- Width for the search results box
 *  highlight		- Highlight the results in the search results box
 *  params{}		- Array object with the parameters
 *  delimiter		- Results delimiter
 *  searchBkgStyle	- CSS Style for the input field when begin the autosuggestion
 *  searchCSSClass	- CSS Class for the search results box
 *  maxResults		- Maximum results to show in the search results box
 *  zIndex			- CSS zindex for the search results box
 *  fnFormatResult	- Function to be executed on each result in order to give a special custom format - Parameters (Value, data, Current Value)
 *  fnViewMore		- Function to customize a especial behavior in order to display more results - Parameters (Query Value)
 *  fnParseResponse	- Function to customize the parse of the response for the ajax call - Parameters (Text Response, Query Value)
 *  fnOnSelect		- Function to be executed after the selection on the search results box - Parameters (Value, Data, Input Field)
 */
(function($){
    function Autocomplete(el, options){
        this.el = $(el);
        this.el.attr('autocomplete', 'off');
        this.suggestions = [];
        this.data = [];
        this.badQueries = [];
        this.selectedIndex = -1;
        this.currentValue = this.el.val();
        this.intervalId = 0;
        this.cachedResponse = [];
        this.onChangeInterval = null;
        this.ignoreValueChange = false;
        this.serviceUrl = options.serviceUrl;
        this.isLocal = false;
        this.options = {
            autoSubmit: false,
            minChars: 1,
            maxHeight: 300,
            deferRequestBy: 0,
            width: 0,
            highlight: true,
            params: {},
            delimiter: null,
            searchBkgStyle: 'none',
            searchCSSClass: 'autocomplete',
            maxResults: 0,
            zIndex: 9999
        };
        this.initialize();
        this.setOptions(options);
    }
    $.fn.autocomplete = function(options){
        return new Autocomplete(this.get(0) || $('<input />'), options);
    };
    Autocomplete.prototype = {
        killerFn: null,
        initialize: function(){
            var me, uid, autocompleteElId;
            me = this;
            uid = Math.floor(Math.random() * 0x100000).toString(16);
            autocompleteElId = 'Autocomplete_' + uid;
            this.killerFn = function(e){
                if ($(e.target).parents('.autocomplete').size() === 0) {
                    me.killSuggestions();
                    me.disableKillerFn();
                }
            };
            if (!this.options.width) {
                this.options.width = this.el.width();
            }
            this.mainContainerId = 'AutocompleteContainter_' + uid;
            $('<div id="' + this.mainContainerId + '" style="position:absolute;z-index:9999;"><div class="' + this.options.searchCSSClass + '-w1"><div class="' + this.options.searchCSSClass + '" id="' + autocompleteElId + '" style="display:none; width:300px;"></div></div></div>').appendTo('.qio .results');
            this.container = $('#' + autocompleteElId);
            this.fixPosition();
            if (window.opera) {
                this.el.keypress(function(e){
                    me.onKeyPress(e);
                });
            }
            else {
                this.el.keydown(function(e){
                    me.onKeyPress(e);
                });
            }
            this.el.keyup(function(e){
                me.onKeyUp(e);
            });
            this.el.blur(function(){
                me.enableKillerFn();
            });
            this.el.focus(function(){
                me.fixPosition();
            });
        },
        setOptions: function(options){
            var o = this.options;
            $.extend(o, options);
            if (o.lookup) {
                this.isLocal = true;
                if ($.isArray(o.lookup)) {
                    o.lookup = {
                        suggestions: o.lookup,
                        data: []
                    };
                }
            }
            $('#' + this.mainContainerId).css({
                zIndex: o.zIndex
            });
            this.container.css({
                maxHeight: o.maxHeight + 'px',
                width: o.width
            });
        },
        clearCache: function(){
            this.cachedResponse = [];
            this.badQueries = [];
        },
        disable: function(){
            this.disabled = true;
        },
        enable: function(){
            this.disabled = false;
        },
        fixPosition: function(){
            var offset = this.el.offset();
            $('#' + this.mainContainerId).css({
                top: (offset.top + this.el.innerHeight()) + 'px',
                left: offset.left + 'px'
            });
        },
        enableKillerFn: function(){
            var me = this;
            $(document).bind('click', me.killerFn);
        },
        disableKillerFn: function(){
            var me = this;
            $(document).unbind('click', me.killerFn);
        },
        killSuggestions: function(){
            var me = this;
            this.stopKillSuggestions();
            this.intervalId = window.setInterval(function(){
                me.hide();
                me.stopKillSuggestions();
            }, 300);
        },
        stopKillSuggestions: function(){
            window.clearInterval(this.intervalId);
        },
        onKeyPress: function(e){
            if (this.disabled || !this.enabled) {
                return;
            }
            switch (e.keyCode) {
                case 27:
                    this.el.val(this.currentValue);
                    this.hide();
                    break;
                case 9:
                case 13:
                    if (this.selectedIndex === -1) {
                        this.hide();
                        return;
                    }
                    this.select(this.selectedIndex);
                    if (e.keyCode === 9) {
                        return;
                    }
                    break;
                case 38:
                    this.moveUp();
                    break;
                case 40:
                    this.moveDown();
                    break;
                default:
                    return;            }
            e.stopImmediatePropagation();
            e.preventDefault();
        },
        onKeyUp: function(e){
            if (this.disabled) {
                return;
            }
            switch (e.keyCode) {
                case 38:
                case 40:
                    return;            }
            clearInterval(this.onChangeInterval);
            if (this.currentValue !== this.el.val()) {
                if (this.options.deferRequestBy > 0) {
                    var me = this;
                    this.onChangeInterval = setInterval(function(){
                        me.onValueChange();
                    }, this.options.deferRequestBy);
                }
                else {
                    this.onValueChange();
                }
            }
        },
        onValueChange: function(){
            clearInterval(this.onChangeInterval);
            this.currentValue = this.el.val();
            var q = this.getQuery(this.currentValue);
            this.selectedIndex = -1;
            if (this.ignoreValueChange) {
                this.ignoreValueChange = false;
                return;
            }
            if (q === '' || q.length < this.options.minChars) {
                this.hide();
            }
            else {
                this.getSuggestions(q);
            }
        },
        getQuery: function(val){
            var d, arr;
            d = this.options.delimiter;
            if (!d) {
                return $.trim(val);
            }
            arr = val.split(d);
            return $.trim(arr[arr.length - 1]);
        },
        getSuggestionsLocal: function(q){
            var ret, arr, len, val, i;
            arr = this.options.lookup;
            len = arr.suggestions.length;
            ret = {
                suggestions: [],
                data: []
            };
            q = q.toLowerCase();
            for (i = 0; i < len; i++) {
                val = arr.suggestions[i];
                if (val.toLowerCase().indexOf(q) === 0) {
                    ret.suggestions.push(val);
                    ret.data.push(arr.data[i]);
                }
            }
            return ret;
        },
        getSuggestions: function(q){
            var cr, me;
            cr = this.isLocal ? this.getSuggestionsLocal(q) : this.cachedResponse[q];
            if (cr && $.isArray(cr.suggestions)) {
                this.suggestions = cr.suggestions;
                this.data = cr.data;
                this.suggest();
            }
            else 
                if (!this.isBadQuery(q)) {
                    me = this;
                    me.options.params.search = q;
                    me.options.params.query = q;
                    this.el.css('background', me.options.searchBkgStyle);
                    $.get(this.serviceUrl, me.options.params, function(txt){
                        me.processResponse(txt);
                    }, 'text');
                }
        },
        isBadQuery: function(q){
            var i = this.badQueries.length;
            while (i--) {
                if (q.indexOf(this.badQueries[i]) === 0) {
                    return true;
                }
            }
            return false;
        },
        hide: function(){
            this.enabled = false;
            this.selectedIndex = -1;
            this.container.hide();
        },
        suggest: function(){
            var me, len, maxResults, viewMore, div, f, v, i, s, mOver, mClick;
            if (this.suggestions.length === 0) {
                this.hide();
                this.container.hide().empty();
                div = $('<div class="selected" title="No Results Found">No Results Found</div>');
                this.container.append(div);
                this.enabled = true;
                this.container.show();
                return;
            }
            me = this;
            len = this.suggestions.length;
            f = this.options.fnFormatResult;
            v = this.getQuery(this.currentValue);
            more = this.options.fnViewMore;
            maxResults = this.options.maxResults;
            viewMore = false;
            mOver = function(xi){
                return function(){
                    me.activate(xi);
                };
            };
            mClick = function(xi){
                return function(){
                    me.select(xi);
                };
            };
            this.container.hide().empty();
            if (!maxResults) {
                maxResults = len;
            }
            else {
                if (len > maxResults) {
                    viewMore = true;
                }
            }
            for (i = 0; i < len && i < maxResults; i++) {
                s = this.suggestions[i];
                div = $((me.selectedIndex === i ? '<div class="selected"' : '<div') + ' title="' + s + '">' + ($.isFunction(f) ? f(s, this.data[i], v) : s) + '</div>');
                div.mouseover(mOver(i));
                div.click(mClick(i));
                this.container.append(div);
            }
            if ($.isFunction(more) && viewMore) {
                this.container.append(more(this.options.params.query));
            }
            this.enabled = true;
            this.container.show();
        },
        processResponse: function(text){
            var response, f;
            try {
                f = this.options.fnParseResponse;
                if ($.isFunction(f)) {
                    response = f(text, this.options.params.query);
                }
                else {
                    response = eval('(' + text + ')');
                }
            } 
            catch (err) {
                return;
            }
            if (!$.isArray(response.data)) {
                response.data = [];
            }
            if (!this.options.noCache) {
                this.cachedResponse[response.query] = response;
                if (response.suggestions.length === 0) {
                    this.badQueries.push(response.query);
                }
            }
            if (response.query === this.getQuery(this.currentValue)) {
                this.suggestions = response.suggestions;
                this.data = response.data;
                this.suggest();
            }
            this.el.css('background', 'none');
        },
        activate: function(index){
            var divs, activeItem;
            divs = this.container.children();
            if (this.selectedIndex !== -1 && divs.length > this.selectedIndex) {
                $(divs.get(this.selectedIndex)).removeClass();
            }
            this.selectedIndex = index;
            if (this.selectedIndex !== -1 && divs.length > this.selectedIndex) {
                activeItem = divs.get(this.selectedIndex);
                $(activeItem).addClass('selected');
            }
            return activeItem;
        },
        deactivate: function(div, index){
            div.className = '';
            if (this.selectedIndex === index) {
                this.selectedIndex = -1;
            }
        },
        select: function(i){
            var selectedValue, f;
            selectedValue = this.suggestions[i];
            if (selectedValue) {
                this.el.val(selectedValue);
                if (this.options.autoSubmit) {
                    f = this.el.parents('form');
                    if (f.length > 0) {
                        f.get(0).submit();
                    }
                }
                this.ignoreValueChange = true;
                this.hide();
                this.onSelect(i);
            }
        },
        moveUp: function(){
            if (this.selectedIndex === -1) {
                return;
            }
            if (this.selectedIndex === 0) {
                this.container.children().get(0).className = '';
                this.selectedIndex = -1;
                this.el.val(this.currentValue);
                return;
            }
            this.adjustScroll(this.selectedIndex - 1);
        },
        moveDown: function(){
            if (this.selectedIndex === (this.suggestions.length - 1)) {
                return;
            }
            this.adjustScroll(this.selectedIndex + 1);
        },
        adjustScroll: function(i){
            var activeItem, offsetTop, upperBound, lowerBound;
            activeItem = this.activate(i);
            offsetTop = activeItem.offsetTop;
            upperBound = this.container.scrollTop();
            lowerBound = upperBound + this.options.maxHeight - 25;
            if (offsetTop < upperBound) {
                this.container.scrollTop(offsetTop);
            }
            else 
                if (offsetTop > lowerBound) {
                    this.container.scrollTop(offsetTop - this.options.maxHeight + 25);
                }
            this.el.val(this.getValue(this.suggestions[i]));
        },
        onSelect: function(i){
            var me, fn, s, d;
            me = this;
            fn = me.options.fnOnSelect;
            s = me.suggestions[i];
            d = me.data[i];
            me.el.val(me.getValue(s));
            if ($.isFunction(fn)) {
                fn(s, d, me.el);
            }
        },
        getValue: function(value){
            var del, currVal, arr, me;
            me = this;
            del = me.options.delimiter;
            if (!del) {
                return value;
            }
            currVal = me.currentValue;
            arr = currVal.split(del);
            if (arr.length === 1) {
                return value;
            }
            return currVal.substr(0, currVal.length - arr[arr.length - 1].length) + value;
        }
    };
}(jQuery));







