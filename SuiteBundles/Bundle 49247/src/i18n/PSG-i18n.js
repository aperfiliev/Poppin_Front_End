var com_netsuite_psg_tools;
if (!com_netsuite_psg_tools) {
    throw Error("PSGSFF-i18n.js requires PSG-tools-common.js");
}

(function initPSGTi18n(){
    "use strict";
    
if (!com_netsuite_psg_tools.i18n) {
    com_netsuite_psg_tools.i18n = {
        toString: function () {
            return '[object com_netsuite_psg_tools.i18n]';
        }
    };
}
var psgt = com_netsuite_psg_tools;
var psgt_i18n = com_netsuite_psg_tools.i18n;

psgt_i18n.TKey = function TranslationKey(
    translateId)
{
    this.translateId = translateId;
};
(function initTKey(){
    var p = psgt_i18n.TKey.prototype;
    p.toString = function () {
        return this.translateId;
    };
    p.getTranslationKey = function () {
        return this.translateId;
    };
}());

psgt_i18n.TString = function TranslatableString(
    translateId,
    defaultValue) 
{
    this.translateId = translateId;
    this.defaultValue = defaultValue;
};
(function initTString(){
    var p = psgt_i18n.TString.prototype;
    p.toString = function () {
         return this.defaultValue;
    };
    p.getTranslationKey = function () {
        return this.translateId;
    };
}());

/*
 * 
 * @interface
 */
psgt_i18n.Translator =
    function Translator() 
{
    this.lookUpKey = function lookUpKey(key, options) {
        throw Error("Translator:lookUpKey must be overridden");
    },
    this.translate = function translate(s, options) {
        var key,
            translated/*,
            noTranslationValue*/;
        
//        noTranslationValue = s;
        if (typeof s.getTranslationKey === 'function') {
            key = s.getTranslationKey();
//            noTranslationValue = s.toString();
        } else {
            key = s;
        }
        translated = this.lookUpKey(key, options);
        if (typeof translated === 'undefined') {
            // if throwExceptionOnMissingTranslations
            throw Error('translate:No translation found for key:' + key);
//            return noTranslationValue;
        } else {
        	if (arguments.length > 2) {
        		for (var i = 2; y < arguments.length; i++) {
        			var marker = '{' + (i - 2) + '}';
        			translated = translated.replace(marker, arguments[i]);
        		}
        	}
            return translated;
        }
    };
};

/**
 * @constructor
 */
psgt_i18n.InMemoryTranslator = function InMemoryTranslator() {
    var psgt = com_netsuite_psg_tools,
        map;
    map = new psgt.SimpleMap(); // <translation-key, translated-value>
    this.defaultMap = map;
    this.defaultLocale = 'en';
    this.locale = ''; // current locale
    this.localesWithTranslations = new psgt.SimpleMap(); // <locale, TranslationsSimpleMap>
};

(function initInMemoryTranslatorPrototype(){
    var p = new psgt_i18n.Translator();

    psgt_i18n.InMemoryTranslator.prototype = p;
    p.addDefaultTranslation = function (key, value) {
        var map = this.defaultMap;
        map.put(key, value);
                
        return this;
    };
    
    p.addNewLocale = function addNewLocale(locale) {
        var withTranslationsMap = this.localesWithTranslations,
            psgt = com_netsuite_psg_tools;
        
        if (!locale) {
            throw Error('addNewLocale: invalid_locale');
        }
        withTranslationsMap.put(locale, new psgt.SimpleMap());
        return this;
    };
    p.getLocaleTranslations = function (locale) {
        var withTranslationsMap = this.localesWithTranslations;
        return withTranslationsMap.get(locale);  
    };
    
    p.addTranslation = function (locale, key, value) {
        var localeTranslations;// = this.defaultMap;
        
        if (!locale) {
            throw Error('addTranslation: locale is empty for ' + key +':'+ value);
        };
        localeTranslations = this.getLocaleTranslations(locale);
        if (!localeTranslations) {
            this.addNewLocale(locale);
            localeTranslations = this.getLocaleTranslations(locale);
        }
        if (typeof localeTranslations.get(key) !== 'undefined') {
            var duplicateEntryError = new Error(
                'Duplicate entry for (locale.key):' +
                ['(', locale, '.', key,  ')'].join(''));
            duplicateEntryError.name = 'Error_DuplicateEntry';
            duplicateEntryError.existingEntry = {
                'locale': locale,
                'key': key,
                'value': value
            };
            duplicateEntryError.newValue = value;
            throw duplicateEntryError;
        }
        localeTranslations.put(key, value);
        return this;
    };
    p.setLocale = function setLocale(s) {
        if (Object.prototype.toString.call(s) !== '[object String]') {
            throw Error('psgt_i18n.InMemoryTranslator setLocale:' +
                'argument must be a string');
        }
        this.locale = s;
        return this;
    };
    p.lookUpKey = function lookUpKey(key, options) {
        var map = this.defaultMap;

        if (options) {
            // allow overrides
        } else {
            // ? fallback behavior
            if (this.locale) {
                map = this.getLocaleTranslations(this.locale);
            }
            if (!map) {
                // revert to default if no translation map for locale
                map = this.defaultMap;
            }
        }
        return map.get(key);
    };
}());

psgt_i18n.newKey = 
    function newKey(translateId)
{
    return new psgt_i18n.TKey(translateId);
};

psgt_i18n.newString = 
    function newString(translateId, defaultValue) 
{
    return new psgt_i18n.TString(translateId, defaultValue);
};

psgt_i18n.newInMemoryTranslator =
    function newInMemoryTranslator(seedObj)
{
    var t = new psgt_i18n.InMemoryTranslator();
    return t;
};

// Translation Appender? per format supported
psgt_i18n.ResxE4XTranslationSource = 
    function ResxE4XTranslationSource(locale, xmlE4x, options)
{
    if (!xmlE4x) {
        throw Error('ResxE4XTranslationSource: xmlE4x must not be empty');
    }
    this.locale = locale;
    this.xmlE4x = xmlE4x;
    this.options = options;
};

(function initResxE4XTranslationSource(){
    var p = psgt_i18n.ResxE4XTranslationSource.prototype;

    p.doesXmlNodeHaveChildren = function isXmlNodeNotEmpty(node) {
        return node && node.length() > 0;
    };
    // legacy SB has an extra "page" node enclosing data 
    p.isLegacySBFormat = function isLegacySBFormat(xmlE4x) {
        return this.doesXmlNodeHaveChildren(xmlE4x.page);
    };
    
    // must iterate over each page
    // prepend page's name attribute, if it exists
    p.addTranslationsViaLegacySBFormat = 
        function addTranslationsViaLegacySBFormat(translator) 
    {
        var locale = this.locale,
            xmlE4x = this.xmlE4x,
            containerNode,
            i = 0, il = 0, j = 0, jl = 0,
            dataNode, prefix, key, value;
        
        if (this.doesXmlNodeHaveChildren(xmlE4x.page)) {
            containerNode = xmlE4x.page;
            il = containerNode.length();
        } else {
            throw Error('addTranslationsViaLegacySBFormat: no "page" nodes found');
        }
        for (i = 0; i < il; i += 1) {
            prefix = containerNode[i].@name.toString();
            jl = containerNode[i].data.length();
            
            for (j = 0; j < jl; j += 1) {
                dataNode = containerNode[i].data[j];
                if (this.doesXmlNodeHaveChildren(dataNode)) {
                    if (!dataNode.@name.toString()) {
//                        throw Error('data node name falsy. prefix:' + prefix + 
//                            ' name:' + dataNode.@name.toString());
                        var emptyKeyEx = new Error('Resx legacy SB data node name is empty');
                        emptyKeyEx.name = 'Error_EmptyKey';
                        throw emptyKeyEx;
                    }
                    if (prefix) {
                        key = prefix + '.' + dataNode.@name.toString();
                    } else {
                        key = dataNode.@name.toString();
                    }
                    value = dataNode.value.toString();
                    translator.addTranslation(locale, key, value);
                };
            };
        };
    };
    p.addTranslationsTo = function addTranslationsTo(translator) {
        var locale = this.locale,
            xmlE4x = this.xmlE4x,
            containerNode = xmlE4x,
            i = 0, il,
            dataNode, key, value;

        if (this.isLegacySBFormat(xmlE4x)) {
            this.addTranslationsViaLegacySBFormat(translator);
        } else {
            // iterate over each data element, attribute 'name' is the key
            if (this.doesXmlNodeHaveChildren(containerNode.data)) {
                il = containerNode.data.length();
                for (i = 0; i < il; i += 1) {
                    dataNode = containerNode.data[i];
                    
                    key = dataNode.@name.toString();
                    if (!key) {
                        var emptyKeyEx = new Error('Resx data node name is empty');
                        emptyKeyEx.name = 'Error_EmptyKey';
                        throw emptyKeyEx;
                    }
                    // legacy FAM support (page attribute)
                    if (dataNode.@page.toString()) {
                        key = dataNode.@page.toString() + '.' + key;
                    }
                    // end legacy FAM support
                    value = dataNode.value.toString();
                    translator.addTranslation(locale, key, value);
                };
                // log lvl 5 il data nodes/translations added
            };
        };
        return this;
    };
}());

psgt_i18n.FileCabinetResourceLister = 
    function FileCabinetResourceLister(
        nsApi, baseFolderId, includeFilterRegExp) 
{
    this.nsApi = nsApi;
    this.baseFolderId = baseFolderId;
    if (!includeFilterRegExp) {
        throw Error("psgt_i18n.FileCabinetResourceLister: includeFilterRegExp is required");
    }
    this.includeFilterRegExp = includeFilterRegExp;
};

(function initFileCabinetResourceLister(){
    var p = psgt_i18n.FileCabinetResourceLister.prototype;
    
    /**
     * @this {com_netsuite_psg_tools.i18n.FileCabinetResourceLister}
     * @param {Array.<nlobjSearchResult>} sr 
     * @param {RegExp} nameIncludeRegEx
     */
    p.filterSearchResults = function filterSearchResults(sr, nameIncludeRegEx) {
        var filtered;
        if (!sr) {
            sr = [];
        }
        filtered = sr;
        if (nameIncludeRegEx) {
            filtered = sr.filter(function srNameFilter(v){
                return nameIncludeRegEx.test(v.getValue('name'));
            });
        };
        return filtered;
    };
    
    /**
     *
     * @this {com_netsuite_psg_tools.i18n.FileCabinetResourceLister}
     * @param {Array.<nlobjSearchResult>} searchResults
     * @returns {Array.<com_netsuite_psg_tools.FileResourceInfo>}
     */
    p.makeFileResourceInfoListFrom = function makeFileResourceInfoListFrom(searchResults) {
        var list = searchResults.map(function mapSearchResultToFileResourceInfo(v) {
            return com_netsuite_psg_tools.newFileResourceInfo(
                v.getValue('internalid'), 
                v.getValue('name'), 
                v.getValue('folder'));
        });
        return list;
    };
    
    /**
     * @this {com_netsuite_psg_tools.i18n.FileCabinetResourceLister}
     * @returns {Array.<com_netsuite_psg_tools.FileResourceInfo>}
     */
    p.searchForResourceFiles = function () {
        var nsApi = this.nsApi,
            baseFolderId = this.baseFolderId,
            includeFilterRegExp = this.includeFilterRegExp,
            sr, sf, sc, srFiltered = [];

        sf = [];
        if (baseFolderId) {
            sf.push(
                new nsApi.nlobjSearchFilter('folder', null, 'is', baseFolderId));
        }
        sc = [];
        sc.push(
            new nsApi.nlobjSearchColumn('internalid'),
            new nsApi.nlobjSearchColumn('name'),
            new nsApi.nlobjSearchColumn('folder'));
        sr = nsApi.nlapiSearchRecord('file', null, 
            sf,
            sc);
        srFiltered = this.filterSearchResults(sr, includeFilterRegExp);
        
        return this.makeFileResourceInfoListFrom(srFiltered);
    }
    
    /**
     * @this {com_netsuite_psg_tools.i18n.FileCabinetResourceLister}
     * @returns {Array.<com_netsuite_psg_tools.FileResourceInfo>}
     */
    p.listResources = function listResources() {
        var fileInfoList;
        
        fileInfoList = this.searchForResourceFiles();
        return fileInfoList; 
    };
}());

psgt_i18n.TranslationFileResourceLoader =
    function TranslationFileResourceLoader(nsApi)
{
    this.nsApi = nsApi;
    this.locale = null;// @deprecated - remove
    this.resourceList = null;
    this.fileReader = null;
};

(function initTranslationFileResourceLoader(){
    var p = psgt_i18n.TranslationFileResourceLoader.prototype;
    
    /**
     * @protected
     */
    p.createFileReader = function createFileReader() {
        return new psgt.FileReader(this.nsApi);
    };
    /**
     * @protected
     */
    p.xmlStringToE4x = function xmlStringToE4x(xmlString) {
        var xmlHeaderRegEx = /<\?xml[^>]*\?>/,
            xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>';
        // xmlString = xmlString.replace(/<\?xml[^>]*\?>/, "");
        // the XML constructor requires the xml header!
        if (!xmlHeaderRegEx.test(xmlString)) {
            xmlString = xmlHeader + xmlString;
        }
        // note: NetSuite's XML constructor REQUIRES the xml header
        return new XML(xmlString);
    };
    
    /**
     * @nosideeffects
     */
    p.createTranslationSource = function createTranslationSource(locale, xmlE4x) {
        return new psgt_i18n.ResxE4XTranslationSource(locale, xmlE4x);
    };

    /**
     * @param {com_netsuite_psg_tools.i18n.Translator} translator
     * @param {com_netsuite_psg_tools.FileResourceInfo} resourceInfo
     * @param {string} locale where to register the translations to
     */
    p.loadTo = function loadTo(translator, resourceInfo, locale) {
        var fileContent, source;
        
        this.fileReader = this.createFileReader();
        if (!locale) {
            throw Error("psgt_i18n.TranslationFileResourceLoader loadTo:" +
                "locale must not be empty");
        }
        if (!resourceInfo) {
            throw Error("psgt_i18n.TranslationFileResourceLoader loadTo:" +
                "resourceInfo must not be empty");
        }
        
        fileContent = this.fileReader.read(resourceInfo.internalId);
        source = this.createTranslationSource(locale, this.xmlStringToE4x(fileContent));
        source.addTranslationsTo(translator);
        return this;
    };
}());

psgt_i18n.UserLocale = function UserLocale(nsApi) {
    this.nsApi = nsApi;
};

(function initUserLocalePrototype(){
    var p = psgt_i18n.UserLocale.prototype;
    
    p.getLocale = function () {
        var nsApi = this.nsApi;
        
        return nsApi.nlapiGetContext().getPreference('LANGUAGE');
    };
}());

/**
 * Creates a translator object
 * @constructor
 * @param nsApi the object containing the NetSuite api
 */
psgt_i18n.TranslatorBuilder = 
    function TranslatorBuilder(nsApi) 
{
	
    if (nsApi) {
        this.nsApi = nsApi;
    } else {
        this.nsApi = function getGlobal() { return this; };
    }
    
    // this.nsApi = nsApi;
    this.baseFolderId = null; 
    this.includeFilterRegExp = null;
    this.resourceLister = null;
    this.scriptInfoService = null;
    this.resourceLoader = null;
    this.currentLocale = null;
    
    this.userOverrideTranslatorFiller = null;
};

(function initTranslatorBuilderPrototype(){
    var p = psgt_i18n.TranslatorBuilder.prototype;
    
    /**
     * Limit the file cabinet search to begin with the folder id provided
     * 
     * When a base folder id is not provided, the directory of the currently
     * running script is used to limit the search for resources.
     * @param {string|number} v folder internalId to filter the resource search
     */
    p.withBaseFolderId = function withBaseFolderId(v) {
        this.baseFolderId = v;
        return this;
    };
    
    /**
     * (Required)Include only file cabinet resources matching the regular expression
     * 
     * Example: withIncludeFilter(/\.resx\.xml)
     * @param {RegExp} regExp 
     */
    p.withIncludeFilter = function withIncludeFilter(regExp) {
        this.includeFilterRegExp = regExp;
        return this;
    };
    
    /**
     * (Optional) Override the script info service to use
     * 
     * The script info service is used to find the directory of the currently
     * running script
     * @param {com_netsuite_psg_tools.ScriptInfoService} v
     */
    p.withScriptInfoService = function withScriptInfoService(v) {
        this.scriptInfoService = v;
        return this;
    };
    
    /**
     * (internal) Instantiate a ScriptInfoService
     */
    p.createScriptInfoService = function createScriptInfoService() {
        return new com_netsuite_psg_tools.ScriptInfoService(this.nsApi);
    };
    
    /**
     * (Optional) Override the resource lister to use
     * 
     * The default resource lister is a 
     * com_netsuite_psg_tools.i18n.FileCabinetResourceLister
     */
    p.withResourceLister = function withResourceLister(v) {
        this.resourceLister = v;
        return this;
    };
    
    /**
     * (internal) Instantiate a file cabinet resource lister
     * @param {string|number} baseFolderId
     * @param {RegExp} includeFilter
     */
    p.createFileCabinetResourceLister = 
        function createFileCabinetResourceLister(baseFolderId, includeFilter) 
    {
        return new psgt_i18n.FileCabinetResourceLister(
            this.nsApi, baseFolderId, includeFilter);
    };
    
    /**
     * (internal)Initialize the prerequisites of the resource lister if necessary
     * 
     * Relies on the baseFolderId (set via withBaseFolderId())
     * Relies on the includeFilterRegExp (set via withIncludeFilter())
     * 
     * @returns {Array.<com_netsuite_psg_tools.FileResourceInfo>}
     */
    p.initResourceLister =
        function initResourceLister() 
    {
        var resourceLister = this.resourceLister,
            baseFolderId = this.baseFolderId,
            includeFilterRegExp = this.includeFilterRegExp;
        
        if (!resourceLister) {
            if (!baseFolderId) {
                if (!this.scriptInfoService) {
                    this.scriptInfoService = this.createScriptInfoService();
                }
                this.baseFolderId = this.scriptInfoService.getScriptFolderId();
                if (!includeFilterRegExp) {
                    throw Error("psgt_i18n.TranslatorBuilder: includeFilterRegExp is required");
                }
            }
        }
    };
    
    /**
     * (optional) Override the resource loader to use
     * 
     * The default resource loader is a
     * com_netsuite_psg_tools.i18n.TranslationFileResourceLoader
     */
    p.withResourceLoader = function withResourceLoader(v) {
        this.resourceLoader = v;
        return this;
    };
    
    /**
     * (optional) Specify the current locale
     * 
     * If not specified, the current locale it auto detected.
     */
    p.withLocale = function withLocale(v) {
        this.currentLocale = v;
        return this;
    };
    
    /**
     * (optional) Override the translator to use
     * 
     * The default translator used is a
     * com_netsuite_psg_tools.i18n.PriorityLookupInMemoryTranslator
     * @param {Translator} v
     */
    p.withTranslator = function withTranslator(v) {
        this.translator = v;
        return this;
    };
    
    /**
     * (internal) Instantiate the translator to use
     */
    p.createTranslator = function createTranslator() {
        return new psgt_i18n.PriorityLookupInMemoryTranslator();
    };
    
    /**
     * (internal) Instantiate the resource loader to use
     */
    p.createResourceLoader = function createResourceLoader() {
        return new psgt_i18n.TranslationFileResourceLoader(this.nsApi);
    };
    
    /**
     * Obtain the current user locale
     */
    p.getCurrentUserLocale = function getCurrentUserLocale() {
        return new psgt_i18n.UserLocale(this.nsApi).getLocale();
    };
    
    /**
     * (internal) Initialize the translator based on the current locale and supported locales
     * 
     * 
     * @param {psgt_i18n.SupportedLocales} supportedLocales
     */
    p.initializeTranslator = function initializeTranslator(supportedLocales) {
        var translator, currentLocale;
        
        this.initResourceLister();
        if (!this.translator) {
            this.translator = this.createTranslator();
        }
        if (!this.currentLocale) {
            this.currentLocale = this.getCurrentUserLocale();
        }
        currentLocale = this.currentLocale;
        var localePriority = supportedLocales.createLocalePriorityList(currentLocale);
        
        if (localePriority.length === 0) {
            throw Error('TranslatorBuilder initializeTranslator:' +
                'no locales supported:' + currentLocale);
        }
        
        var folderId = this.baseFolderId,
            includeFilterRegEx = this.includeFilterRegExp;
        
        var b = this.createTranslatorFillerBuilder()
                .withIncludeFilter(includeFilterRegEx);
        if (folderId) {
            b.withFolderId(folderId);
        }
        if (this.resourceLister) {
            b.withResourceLister(this.resourceLister);
        }
        if (this.resourceLoader) {
            b.withResourceLoader(this.resourceLoader);
        }
        
        var mainTranslationFiller = b.build();

        translator = this.translator;
        mainTranslationFiller.fillTranslator(translator, localePriority);
        
        if (this.userOverrideTranslatorFiller) {
            // load all available override translations (according to localePriority)
            // weave the locale-override into the localePriority
            localePriority = this.userOverrideTranslatorFiller.fillTranslator(translator, localePriority);
        }

        this.translator.setLocale(localePriority);
        return this.translator;
    };
    
    /**
     * (internal) Instantiate the translator filler builder to use
     */
    p.createTranslatorFillerBuilder = function createTranslatorFillerBuilder() {
        return new psgt_i18n.TranslatorFillerBuilder(this.nsApi);
    };
    
    /**
     * (Optional) Configure the translator with user override support
     *
     * User translation override files will be loaded into the translator
     * built.  
     * @param {RegExp} includeFilterRegEx the name filter for override resources
     * @param {RegExp} localeFromNameRegEx the regex to extract the locale from the resource name
     * @param {string|number} folderId the optional folder id to search override resources from
     */
    p.withUserOverrideSupport = function withUserOverrideSupport(
        includeFilterRegEx,
        localeFromNameRegEx,
        folderId) 
    {
        var b;
        
        b = this.createTranslatorFillerBuilder()
                .withIncludeFilter(includeFilterRegEx)
                .withLocaleFromNameRE(localeFromNameRegEx)
                .enableOverrideLocaleKey()
                .allowMissingResource();
        if (folderId) {
            b.withFolderId(folderId);
        }    
        this.userOverrideTranslatorFiller = b.build();
        
        return this;
    };
    /**
     * Build the translator object according to options enabled
     * 
     * Example invocation:
     * Support only en_US and jp locales.
     *    b.build({
     *      en_US: ['en'],
     *      jp: null
     *    });
     * @param {Object.<string, Array.<string>>} localeSupportMap map of locales supported 
     */
    p.build = function build(localeSupportMap) {
        var supportedLocales,
            translator;

        supportedLocales = new psgt_i18n.SupportedLocales();
        supportedLocales.addLocaleSupportMap(localeSupportMap);
        translator = this.initializeTranslator(supportedLocales);
        
        return translator;
    };
}());

/**
 * @constructor
 */
psgt_i18n.LocaleToNamedResourceMapper = function LocaleToNamedResourceMapper(localeFromNameRE) {
    if (!localeFromNameRE) {
        this.localeFromNameRE = this.getDefaultLocaleFromNameRE();
    } else {
        this.localeFromNameRE = localeFromNameRE; 
    }
    this.localeToResourceMap = null;
};

(function initLocaleToNamedResourceMapperProto(){
    var p = psgt_i18n.LocaleToNamedResourceMapper.prototype;
    
    p.getDefaultLocaleFromNameRE = function getDefaultLocaleFromNameRE() {
        // match returns ['en_US', 'en_US'] given "foo-whatever.en_US.resx.xml"
        return new RegExp("([^\\.\\s]*)(?=.resx.xml)");
    };
    /**
     * @param {Array.<com_netsuite_psg_tools.FileResourceInfo>}resourceList 
     */
    p.addResourceList = function addResourceList(resourceList) {
        var map = {},
            localeFromNameRE = this.localeFromNameRE;
        // for lvl5 log: localeFromNameRE
        
        resourceList.forEach(function localeByName(resourceEntry, i) {
            var matches,
                localeForEntry;
            
            //for lvl10 log: resourceEntry, i
            if (!resourceEntry.name || typeof resourceEntry.name != 'string') {
                throw Error('ResourceEntry must have name:' + i + ' ' +
                    JSON.stringify(resourceEntry));
            }
            matches = resourceEntry.name.match(localeFromNameRE);
          //for lvl10 log: matches
            if (!matches || !matches[0]) {
                throw Error("psgt_i18n.LocaleToNamedResourceMapper addResourceList:" +
                    "No locale string matched using " + localeFromNameRE + " from " +
                    JSON.stringify(resourceEntry));
            }
            localeForEntry = matches[0];
            map[localeForEntry] = resourceEntry;
        });
        this.localeToResourceMap = map;
        //for lvl10 log: map
        return this;
    };
    
    p.resourceFor = function resourceFor(locale) {
        return this.localeToResourceMap[locale];
    };
}());

/**
 * Represents the list of supported locales
 * 
 * The list of supported locales is defined by calling add() or
 * addWithFallback()
 * 
 * @constructor
 */
psgt_i18n.SupportedLocales = function SupportedLocales() {
    this.supportedMap = {};
};
psgt_i18n.SupportedLocales.defaultLocaleKey = 'default';

(function initSupportedLocalesProto() {
    var p = psgt_i18n.SupportedLocales.prototype;
    
    /**
     * Add a supported locale
     * @params {string} locale
     */
    p.add = function add(locale) {
        var map = this.supportedMap;
        
        map[locale] = [];
        return this;
    };
    
    /**
     * Add a supported locale with a list of fallback locales
     * @param {string} locale
     * @param {Array.<string>} fbList list of fallback locales
     */
    p.addWithFallback = function addWithFallback(locale, fbList) {
        var map = this.supportedMap;
        if (!locale) {
            throw Error("psgt_i18n.addWithFallback getFallbackList(locale):" +
                "locale must not be empty");
        }
        if (map[locale]) {
            throw Error("psgt_i18n.addWithFallback getFallbackList(locale):" +
                "locale already added:" + locale);
        }
        var uniqueKeys = {};
        uniqueKeys[locale] = true;
        if (Array.isArray(fbList)) {
            fbList.forEach(function (fbEntry){
                if (uniqueKeys[fbEntry]) {
                    throw Error("psgt_i18n.addWithFallback getFallbackList(locale):" +
                        "Duplicate locale entry in fallback:" + fbEntry);
                }
                uniqueKeys[fbEntry] = true;
            });
            map[locale] = fbList;
        } else {
            if (fbList) {
                map[locale] = [fbList];
            };
        }
        return this;
    };
    
    p.addLocaleSupportMap = function addLocaleSupportMap(sampleLocaleSupportMap) {
        for (var i in sampleLocaleSupportMap) {
            if (sampleLocaleSupportMap.hasOwnProperty(i)) {
                this.addWithFallback(i, sampleLocaleSupportMap[i] || []);
            };
        }
        return this;
    };
    /**
     * Returns list of fallback locales associated with the given locale
     * @param {string} locale
     */
    p.getFallbackList = function getFallbackList(locale) {
        var map = this.supportedMap,
            fbList;
        
        if (!locale) {
            throw Error("psgt_i18n.SupportedLocales getFallbackList(locale):" +
                "locale must not be empty");
        }
        fbList = map[locale];
        if (!fbList) {
            throw Error("psgt_i18n.SupportedLocales getFallbackList(locale):" +
                "unsupported locale:" + locale);
        };
        return fbList;
    };
    
    /**
     * Returns true if the locale is considered supported
     * 
     * A supported locale 
     * @param {string} locale
     */
    p.isSupported = function isSupported(locale) {
        var map = this.supportedMap;
        
        return !!map[locale];
    };
    
    p.createLocalePriorityList = function createLocalePriorityList(locale) {
        var localePriority = [];
        
        if (!this.isSupported(locale)) {
            if (this.isSupported(psgt_i18n.SupportedLocales.defaultLocaleKey)) {
                localePriority = this.getFallbackList(psgt_i18n.SupportedLocales.defaultLocaleKey);
            } else {
                throw Error("psgt_i18n.SupportedLocales createLocalePriorityList:" +
                    "unsupported locale:" + locale);
            };
        } else {
            localePriority = [locale];
            if (this.getFallbackList(locale)) {
                localePriority = [].concat(
                    localePriority, 
                    this.getFallbackList(locale));
            };
        }
        return localePriority;
    };
}());

/**
 * @constructor
 * @extends com_netsuite_psg_tools.i18n.InMemoryTranslator
 */
psgt_i18n.PriorityLookupInMemoryTranslator = 
    function PriorityLookupInMemoryTranslator() 
{
    psgt_i18n.InMemoryTranslator.call(this);
};

(function initPriorityLookupInMemoryTranslator(){
    var p = new psgt_i18n.InMemoryTranslator();
    psgt_i18n.PriorityLookupInMemoryTranslator.prototype = p;
    
    /**
     * Accepts an array of locales indicating the priority of locale lookup
     * @override
     * @param localeList
     */
    p.setLocale = function setLocale(localeList) {
        if (Object.prototype.toString.call(localeList) === '[object Array]') {
            this.locale = localeList;
        } else {
            this.locale = [localeList];
        }
        return this;
    };
    /**
     * Handle key lookup when locale is an array of locales.
     * 
     * @override
     * @returns {(String|undefined)}
     */
    p.lookUpKey = function lookUpKey(key, options) {
        var localePriorityList,
            translation,
            self = this,
            map;
        
        if (this.locale) {
            if (Array.isArray(this.locale)) {
                localePriorityList = this.locale; 
            } else {
                localePriorityList = [this.locale];
            }
            // try to get translations according to the locale priority list.
            localePriorityList.every(function doPriorityLookup(locale) {
                map = self.getLocaleTranslations(locale);
                if (map) {
                    translation = map.get(key);
                }
                return typeof translation === 'undefined';
            });
        } else {
            // defaultMap is the last resort?
            map = this.defaultMap;
            translation = map.get(key);
        }
        return translation;
    };
    
}());

/**
 * 
 * An object to coordinate the loading of translation resources to the translator
 * 
 * The loading order depends on the locale priority provided to fillTranslator()
 * @constructor
 * @param {com_netsuite_psg_tools.i18n.ResourceLister} resourceLister
 * @param {com_netsuite_psg_tools.i18n.LocaleToNamedResourceMapper} localeToNamedResourceMapper
 * @param {com_netsuite_psg_tools.i18n.ResourceLoader} resourceLoader
 */
psgt_i18n.TranslatorFiller =
    function TranslatorFiller(
        resourceLister, localeToNamedResourceMapper, resourceLoader) {
    this.resourceLister = resourceLister;
    this.localeToNamedResourceMapper = localeToNamedResourceMapper;
    if (!resourceLoader) {
        throw Error('TranslatorFiller():'+
            'resourceLoader is mandatory');
    }
    this.resourceLoader = resourceLoader;
    
    this.willAllowMissingResource = false;
    this.willOverrideLocaleKey = false;
};

(function initTranslatorFillerProto(){
    var p = psgt_i18n.TranslatorFiller.prototype;
    
    /**
     * create an alternate key to associate with translation overrides.
     * 
     * Used in fillTranslator only when this.willOverrideLocaleKey = true
     * @returns string
     */
    p.createOverridenLocaleKey = function createOverridenLocaleKey(locale) {
        return locale + '-override';
    };
    
    p.enableOverrideLocaleKey = function enableOverrideLocaleKey() {
        this.willOverrideLocaleKey = true;
        return this;
    };
    
    p.allowMissingResource = function allowMissingResource() {
        this.willAllowMissingResource = true;
        return this;
    };
    /**
     * 
     * @param {com_netsuite_psg_tools.i18n.Translator} translator
     * @param {Array.<string>} localePriorityList
     */
    p.fillTranslator = function fillTranslator(translator, localePriorityList) {
        var resourceLister = this.resourceLister,
            localeToResourceMapper = this.localeToNamedResourceMapper,
            resourceLoader = this.resourceLoader,
            resourceList,
            self = this,
            revisedLocalePriorityList = [];
            
        resourceList = resourceLister.listResources();
        localeToResourceMapper.addResourceList(resourceList);
        localePriorityList.forEach(function loadTranslationResources(locale){
            var resourceEntry = localeToResourceMapper.resourceFor(locale),
                localeKey = locale;
            
            if (self.willOverrideLocaleKey) {
                localeKey = self.createOverridenLocaleKey(locale);
            }            
            if (resourceEntry) {
                // log lvl10 locale has override
                resourceLoader.loadTo(
                    translator,
                    resourceEntry,
                    localeKey);
                revisedLocalePriorityList.push(localeKey);
            } else {
                if (!self.willAllowMissingResource) {
                    throw Error("psgt_i18n.TranslatorFiller fillTranslator:" +
                        "missing resource for locale:" + localeKey);
                };
            }
            // log lvl10 locale has no override
            revisedLocalePriorityList.push(locale);
        });
        return revisedLocalePriorityList;
    };
}());

/**
 * @constructor
 */
psgt_i18n.TranslatorFillerBuilder = 
    function TranslatorFillerBuilder(nsApi) 
{
    
    if (nsApi) {
        this.nsApi = nsApi;
    } else {
        this.nsApi = (function getGlobal(){ return this; });
    }
    
    // this.nsApi = nsApi;
    this.folderId = null;
    this.includeFilterRE = this.getDefaultIncludeFilter();
    
    this.resourceLister = null;
    this.localeToResourceMapper = null;
    this.resourceLoader = null;
};

(function initTranslatorFillerBuilderProto(){
    var p = psgt_i18n.TranslatorFillerBuilder.prototype;
    
    p.getDefaultIncludeFilter = function getDefaultIncludeFilter() {
        return new RegExp(/.override\.resx\.xml$/i);
    };
    
    p.withIncludeFilter = function withIncludeFilter(re) {
        this.includeFilterRE = re;
        return this;
    };
    
    p.withFolderId = function withFolderId(folderId) {
        this.folderId = folderId;
        return this;
    };
    
    p.withLocaleFromNameRE = function withLocaleFromNameRE(v) {
        this.localeFromNameRE = v;
        return this;
    };
    p.withResourceLister = function withResourceLister(v) {
        this.resourceLister = v;
        return this;
    } 
    p.createResourceLister = function createResourceLister(folderId, includeFilter) {
        var rLister = new psgt_i18n.FileCabinetResourceLister(
            this.nsApi,
            folderId,
            includeFilter);
        return rLister;
    };
    
    p.createLocaleToNamedResourceMapper = function (localeFromNameRE) {
        return new psgt_i18n.LocaleToNamedResourceMapper(localeFromNameRE);
    };
    
    p.createTranslatorFiller = 
        function createTranslatorFiller(
            resourceLister, localeToNamedResourceMapper, resourceLoader) 
    {
        return new psgt_i18n.TranslatorFiller(
            resourceLister,
            localeToNamedResourceMapper,
            resourceLoader);
    };
    
    p.withResourceLoader = function withResourceLoader(v) {
        this.resourceLoader = v;
        return this;
    };
    
    p.createResourceLoader = function createResourceLoader() {
        return new psgt_i18n.TranslationFileResourceLoader(this.nsApi);
    };
    
    p.enableOverrideLocaleKey = function enableOverrideLocaleKey() {
        this.willOverrideLocaleKey = true;
        return this;
    };
    
    p.allowMissingResource = function allowMissingResource() {
        this.allowMissingResourceForLocale = true;
        return this;
    };
    
    p.build = function build() {
        var resourceLister,
            localeToResourceLookup,
            resourceLoader,
            translatorFiller;
        
        if (!this.resourceLister) {
            resourceLister = this.createResourceLister(this.folderId, this.includeFilterRE);
        } else {
            resourceLister = this.resourceLister;
        }
        localeToResourceLookup = this.createLocaleToNamedResourceMapper(this.localeFromNameRE);
        if (!this.resourceLoader) {
            resourceLoader = this.createResourceLoader();
        } else {
            resourceLoader = this.resourceLoader;
        }
        translatorFiller = this.createTranslatorFiller(resourceLister, localeToResourceLookup, resourceLoader);
        if (this.willOverrideLocaleKey) {
            translatorFiller.enableOverrideLocaleKey();
        }
        if (this.allowMissingResourceForLocale) {
            translatorFiller.allowMissingResource();
        }
        return translatorFiller;
    };
}());

}()); // initPSGTi18n



function advPromoTranslateInit(nsApi) {
        var ns;
        if (nsApi) {
            ns = nsApi;
        } else {
            ns = this;
        }
	
        var psgt = com_netsuite_psg_tools;
        var psgt_i18n = psgt.i18n;
	    
        var t = new psgt_i18n.TranslatorBuilder(ns).withIncludeFilter(/\.resx\.xml$/i).build({
            'en_US': [], // if the en_US resource is not found, an error is thrown
            'es_ES': [], 
            'fr_CA': [], 
            'fr_FR': [],
            'cs_CZ': [],
            'da_DK': [],
            'de_DE': [],
            'it_IT': [],
            'ja_JP': [],
            'ko_KR': [],
            'nl_NL': [],
            'pt_BR': [],
            'sv_SE': [],
            'th_TH': [],
            'zh_CN': [],
            'zh_TW': [],
            'ru_RU': [],
            'default': ['en'], // The default entry is used for unsupported locales
        });
        return t;
};
