var com_netsuite_psg_tools;
if (!com_netsuite_psg_tools) {
    com_netsuite_psg_tools = {
        toString: function () {
            return '[object com_netsuite_psg_tools]';
        }
    };
}
(function psgToolsCommonInit(){

/**
 * A simple map implementation that supports only get/put.
 */
com_netsuite_psg_tools.SimpleMap = function SimpleMap() {
    this.map = {};
};

(function SimpleMapPrototypeInit(){
    var p = com_netsuite_psg_tools.SimpleMap.prototype;
    
    p.toString = function () {
        return '[object com_netsuite_psg_tools.SimpleMap]';
    };
    
    p.put = function put(key, value) {
        this.map[':' + key] = value;
        return this;
    };
    p.get = function get(key) {
        return this.map[':' + key];
    };
}());

com_netsuite_psg_tools.FileResourceInfo = function FileResourceInfo(internalId, name, folderId) {
    this.internalId = internalId;
    this.name = name;
    this.folderId = folderId ? folderId : null;
};
com_netsuite_psg_tools.FileResourceInfo.prototype.toString = function () {
    return '[object com_netsuite_psg_tools.FileResourceInfo]';
};

com_netsuite_psg_tools.newFileResourceInfo = 
    function newFileResourceInfo(internalId, name, folderId) 
{
    return new com_netsuite_psg_tools.FileResourceInfo(internalId, name, folderId);
};

com_netsuite_psg_tools.FileReader =
    function FileReader(nsApi) 
{
    this.nsApi = nsApi;
};

(function initFileReaderPrototype(){
    var p = com_netsuite_psg_tools.FileReader.prototype;
    
    p.loadFile = function loadFile(internalId) {
        var nsApi = this.nsApi,
            objFile;
        
        objFile = this.nsApi.nlapiLoadFile(internalId);
        if (!objFile) {
            throw Error("com_netsuite_psg_tools.FileReader internalid for file not found:" + JSON.stringify(internalId));
        }
        return objFile;
    };
    
    p.read = function read(internalId) {
        var objFile;
        
        if (!internalId) 
            throw Error("com_netsuite_psg_tools.FileReader read given empty paramter");
        objFile = this.loadFile(internalId);
        return objFile.getValue();
    };
}());

com_netsuite_psg_tools.ScriptInfoService = function ScriptInfoService(nsApi) {
    this.nsApi = nsApi;
};
(function initScriptInfoServicePrototype(){
    var p = com_netsuite_psg_tools.ScriptInfoService.prototype; 

    p.getScriptFileId = 
        function getScriptFileId(scriptId) 
    {
        var nsApi = this.nsApi,
            sr;
        if (!scriptId) {
            scriptId = nsApi.nlapiGetContext().getScriptId();
        }
        if (!scriptId) {
            throw Error('com_netsuite_psg_tools.ScriptInfoService ' +
                'getScriptFileId scriptId is empty');
        }
        sr = nsApi.nlapiSearchRecord('script', null, 
            new nsApi.nlobjSearchFilter('scriptid', null, 'is', scriptId),
            new nsApi.nlobjSearchColumn('scriptfile'));
        if (!sr) {
            throw Error('com_netsuite_psg_tools.ScriptInfoService ' +
                'getScriptFileId unable to search scriptfile for ' + scriptId);
        }
        return sr[0].getValue('scriptfile'); 
    };
    
    p.getScriptFolderId = function getScriptFolderId(scriptFileId) {
        if (!scriptFileId) {
            scriptFileId = this.getScriptFileId();
        }
        if (!scriptFileId) {
            throw Error('com_netsuite_psg_tools.ScriptInfoService ' +
                'getScriptFileId scriptId is empty');
        }
        return this.nsApi.nlapiLookupField('file', scriptFileId, 'folder');
    };
}());


}()); //psgToolsCommonInit

