/**
 * Description: SuiteCommerce Advanced Features (Slider)
 *
 * @copyright (c) 2000-2012, NetSuite Inc.
 * @author fbuschiazzo 
*  @version 1.0
*/

GPR_AAE_SLD = function($) {
    var objOptions = {
        "Columns" : [{
            "name" : "custrecord_gpr_aae_sld_slidesort",
            "sort" : true
        }, {
            "name" : "custrecord_gpr_aae_sld_slidelink"
        }, {
            "name" : "custrecord_gpr_aae_sld_slideimage"
        }],
        "Filters" : [],
        "processFn" : null,
        "onErrorFn" : null
    };

    return {
        init : function(obj) {
            if (obj !== null && obj !== undefined) {
                $.extend(objOptions, obj);
            }
            GPR_AAE_SLD.createSlide();
        },

        createSlide : function() {
            var objRequest = {};
            objRequest.Columns = objOptions.Columns
            objRequest.Filters = objOptions.Filters
            $.ajax({
                url : "/app/site/hosting/restlet.nl?script=customscript_gpr_aae_ss_sld_slideimages&deploy=customdeploy_gpr_aae_ss_sld_slideimages",
                type : "GET",
                data : {
                    'request' : JSON.stringify(objRequest)
                },
                contentType : "application/json",
                dataType : "json",
                success : function(data) {
                    if (data.hasOwnProperty('Error')) {
                        if ($.isFunction(objOptions.onErrorFn))
                           objOptions.onErrorFn(); 
                        else
                           alert("An Unexpected error occurred. Please Try again...");                                                 
                    } else {
                        if ($.isFunction(objOptions.processFn))
                            objOptions.processFn(data);
                        else
                            console.log(data);                        
                    }
                },
                error : function(XMLHttpRequest) {
                    if ($.isFunction(objOptions.onErrorFn))
                        objOptions.onErrorFn(); 
                    else
                       alert("An Unexpected error occurred. Please Try again...");
                        
                }
            });
        }
    }
}(jQuery); 