/**
 * Description: SuiteCommerce Advanced Features (Store Locator)
 *
 * @copyright (c) 2000-2012, NetSuite Inc.
 * @author pbecco
*  @version 1.0
*/
var GPR_STL = function($){
    var objOptions = {
        getURL: '/app/site/hosting/scriptlet.nl?script=customscript_gpr_aae_ss_stl_getstores&deploy=customdeploy_gpr_aae_ss_stl_getstores',
        cntId: '',
        tplCntId: '',
        zipcodeCntId: 'sl_zip',
        rangeCntId: 'sl_range',
        geolocatorInit: 'true',
        totalCntId: '',
		mapCanvas: 'map_canvas',
        infoCntId: '',
        submitCntId: 'sl_submit'
    };
	
	var map;
	var geocoder;
	var markers = [];	
	var startLatlng;
	var infoWindowLevel = 0;
	var circle;
	
	function deleteOverlays() {
	  if (markers) {
	    for (i in markers) {
	      markers[i].setMap(null);
	    }
	    markers = [];
	  }
	}
	
    function processResults(objResult,objPoint,radius){
    	circle.setMap(null);
		zoom = 11;
		if(radius == 10){
			zoom = 10;
		}
		if(radius == 20){
			zoom = 9;
		}
		if(radius == 50){
			zoom = 8;
		}
		map.setZoom(zoom);
		deleteOverlays();	
		if (objResult.Errors) {
            $.each(objResult.Errors, function(i, val){
				_gprCommon.popUp.show("Unexpected error");
            });
        }else {
            $.each(objResult, function(i, val){
				var lat = val.custrecord_gpr_aae_stl_latitude;
                var lng = val.custrecord_gpr_aae_stl_longitude;                
                var addressDisplayText = "";    
				var directionsLink = "http://maps.google.com/maps?f=d&source=s_d&daddr=";            

                if (val.name != "") {
                    addressDisplayText += "<b>" + unescape(val.name) + "</b><br />";
                }
                if (val.addr1 != "") {
                    var address = val.custrecord_gpr_aae_stl_address1;                    
                    addressDisplayText += unescape(address) + "<br />";
                    address.replace(/%20/g, '+');
                    directionsLink += address;
                }
                if (val.addr2 != "") {
                    var address2 = val.custrecord_gpr_aae_stl_address2;                 
                    addressDisplayText += unescape(address2) + "<br />";
                    address2.replace(/%20/g, '+');
                    directionsLink += "," + address2;
                }                
                if (val.city != "") {
                    var city = val.custrecord_gpr_aae_stl_city;                   
                    addressDisplayText += unescape(city) + ", ";
                    city.replace(/%20/g, '+');
                    directionsLink += "," + city;
                }
                if (val.state != "") {
                    var state = unescape(val.custrecord_gpr_aae_stl_state);                   
                    addressDisplayText += state + "  ";
                    state.replace(/%20/g, '+');
                    directionsLink += "," + state;
                }
            
                if (val.zip != "") {
                    var zip = val.custrecord_gpr_aae_stl_zipcode;                 
                    addressDisplayText += unescape(zip) + "<br />";
                    zip.replace(/%20/g, '+');
                    directionsLink += "," + zip;
                }
                if (val.custrecord_gpr_aae_stl_storephone != "" && val.custrecord_gpr_aae_stl_storephone != "null" && val.custrecord_gpr_aae_stl_storephone != null) {                
                    addressDisplayText += "<br />Phone: " + unescape(val.custrecord_gpr_aae_stl_storephone) + "<br />";
                }
                if (val.custrecord_gpr_aae_stl_website != "" && val.custrecord_gpr_aae_stl_website != "null") {
                    addressDisplayText += "<a href=\"" + unescape(val.custrecord_gpr_aae_stl_website) + "\">View Website</a><br />";
                }                
                directionsLink += "&hl=en=&mra=ls&ie=UTF8&t=h&z=12";
                addressDisplayText += "<a href=\"" + directionsLink + "\" target=\"_blank\">Get Directions</a><br />";                
                
				addressDisplayText = "<div id='divpopup'>" + addressDisplayText + "</div>";
				addMarker(val.custrecord_gpr_aae_stl_latitude, val.custrecord_gpr_aae_stl_longitude, addressDisplayText);		
                				
                var li = $('<li>');
                li.attr('id', 'sl' + i).appendTo('#sl_list');
                $("#" + objOptions.tplCntId).children().clone().appendTo(li);               
                li.find(".title").html(unescape(val.name));
                li.find(".address1").html(unescape(val.custrecord_gpr_aae_stl_address1));
				li.find(".address2").html(unescape(val.custrecord_gpr_aae_stl_address2));
				li.find(".city").html(unescape(val.custrecord_gpr_aae_stl_city));
				li.find(".state").html(unescape(val.custrecord_gpr_aae_stl_state));
				li.find(".zip").html(unescape(val.custrecord_gpr_aae_stl_zipcode));
                li.find(".country").html(unescape(val.custrecord_gpr_aae_stl_country));
				li.find(".directions").click(function(){
					google.maps.event.trigger(markers[i], "click");
				});
            });
            circle = new google.maps.Circle({          
	          radius: (radius*1609.344),
	          center: objPoint,
	          strokeWeight: 1,
	          fillOpacity: 0.25,
	          clickable: false,
	          fillColor: '#981B4B',
	          strokeColor: '#981B4B',
	          map: map
	        });            
			map.setCenter(objPoint);

        }
    }
	
	function addMarker(lat, lng, html) {
		var myLatlng = new google.maps.LatLng(lat,lng);		
		var marker = new google.maps.Marker({
	    	position: myLatlng, 
	      	map: map, 
	      	animation: google.maps.Animation.DROP
	  	});
		var infoWindow = new google.maps.InfoWindow({
	    	content: html,
	    	maxWidth: 200
	    });		
	    google.maps.event.addListener(marker, 'click', function() {
			infoWindow.setZIndex(++infoWindowLevel);
	      	infoWindow.open(map,marker);
	    });
        markers.push(marker);
	}

	var map;
	var pos = new google.maps.LatLng(41.850033, -87.6500523);
	
	
	

		
	function geoLocalization(map){
		// Try HTML5 geolocation
		if(navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(function(position) {
				pos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
				map.setCenter(pos,11);
				GPR_STL.getInit(position.coords.latitude, position.coords.longitude, 5);

				}, function() {
					_gprCommon.popUp.show("This browser don't support geolocalization");
			});
		}
	}
	
	function addElement(tag_type, target, parameters) {
		//Create element
		var newElement = document.createElement(tag_type);
		//Add parameters
		if (typeof parameters != 'undefined') {
		  for (parameter_name in parameters) {
			newElement.setAttribute(parameter_name, parameters[parameter_name]);
		  }
		}
		//Append element to target
		target.appendChild(newElement);
	}
			    
    return {
		fnSubmit: function(){
			var pos = map.getCenter();
			GPR_STL.get(pos.$a, pos.ab);
		},
        init: function(obj){
            if (obj !== null && obj !== undefined) {
                $.extend(objOptions, obj);
            }
			$(document).ready(function(){
				$("#" + objOptions.submitCntId).click(GPR_STL.fnSubmit);
				var mapDiv = document.getElementById('map_canvas');
				var myOptions = {
					zoom: 11,
					center: pos,
					navigationControlOptions: {position: "BOTTOM_LEFT", style: "ANDROID"},
					mapTypeId: google.maps.MapTypeId.ROADMAP
				}
				map = new google.maps.Map(mapDiv, myOptions);
				
				geoLocalization(map);
		
				geocoder = new google.maps.Geocoder();
				circle = new google.maps.Circle({          
					  radius: 1000,
					  center: startLatlng,
					  strokeWeight: 1,
					  fillOpacity: 0.45,
					  clickable: false,
					  fillColor: '#981B4B',
					  strokeColor: '#981B4B'
					});   				
			});
        },
		
        get: function(lat, lng){ 
			var strZip = $('#' + objOptions.zipcodeCntId).val();           
			var strRadius = $('#' + objOptions.rangeCntId).val();
			if(strZip != ""){
				objOptions.geolocatorInit = false;
			}
            if(!objOptions.geolocatorInit && strZip != ""){
				var country = "";
            	var regex = /(\d\d\d\d\d)|(\d\d\d\d)||([A-Za-z]\d[A-Za-z] \d[A-Za-z]\d)/;
            	if (!regex.test(strZip)) {
					_gprCommon.popUp.show('Please enter a vaild postal code');
            	    return;
            	}
            	strZip = strZip.replace(/ /g, '');	

				geocoder.geocode({
					address: strZip
				}, function(results, status){
					
					if (status == google.maps.GeocoderStatus.OK) {
						lat = results[0].geometry.location.lat();
						lng = results[0].geometry.location.lng();
						GPR_STL.getInit(lat, lng, strRadius);
					}
					else {
						_gprCommon.popUp.show(strZip + ' Not Found...');
					}
				});
			}else{
			    GPR_STL.getInit(lat, lng, strRadius);
			}
        },

        getInit: function(lat, lng, strRadius){
                    var objParams = {
                        dlat: lat,
                        dlng: lng,
						siteNumber: _gprCommon.options.siteNumber,
                        ddistance: strRadius
                    };
					var objPoint = new google.maps.LatLng(lat,lng);
					$.ajax({
                        url: objOptions.getURL,
                        type: "GET",
						contentType : "application/json",
	                    dataType: "json",
                        data: objParams,
						success: function(data, XMLHttpRequest, textStatus){
							if(textStatus.getResponseHeader('Custom-Header-Status') == "403" || textStatus.getResponseHeader('Custom-Header-Status') == "500" ){
								_gprCommon.popUp.show(data.errorMessage);
							}else{
								processResults(data,objPoint,strRadius);
							}
                        },
                        error: function(XMLHttpRequest, textStatus, errorThrown){
                            _gprCommon.popUp.show("Your session has expired. Reloading the page...");
							if(XMLHttpRequest.status = 401) {
								document.location.reload();
							}
                        }
                    });
        }
    }
}(jQuery);