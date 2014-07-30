
if (!Celigo) {
    var Celigo = {};
}

Celigo.GetFormConfigurations = (function(){
    return {
  
        main: function(request, response){
            try {
  
                var attribset = request.getParameter('attributesetid');
                if (!attribset) {
                    response.write(JSON.stringify({
                        id: attribset,
                        elems: {}
                    }));
                }
               
                nlapiLogExecution('DEBUG', 'Start Processing');
                var formConfigLoader = new Celigo.LoadFormConfig();
                
                var formConfigObj = formConfigLoader.read(attribset);
                response.write(JSON.stringify({
                    id: attribset,
                    elems: formConfigObj
                }));
                
              //response.write(nlapiGetContext().getSetting('SESSION', 'MAGENTOIC_FORM_CONFIGURATIONS'));
            
            } 
            catch (e) {
                response.write((e.name || e.getCode()) + ': ' + (e.message || e.getDetails()) + ' check line ' + $.getLineNumber(e));
                //args(Error object, script name, receipients, author Employee Id)
                $.handleError(e, 'TEMPLATE-ScheduledScript-CS.js', ['sreevalli.gorremuchu@celigo.com'], nlapiGetUser());
                nlapiLogExecution('ERROR', e.name || e.getCode(), e.message || e.getDetails());
                nlapiLogExecution('ERROR', 'check line', $.getLineNumber(e));
            }
            
        }
        
    }
    
})();
