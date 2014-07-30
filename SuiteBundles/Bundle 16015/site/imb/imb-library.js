/**
 * Description: SuiteCommerce Advanced Features (Image Browser)
 *
 * @copyright (c) 2000-2012, NetSuite Inc.
 * @author rtucat
*  @version 2.0
*/

var GPR_AAE_IMB = function($){
    //GLOBAL VARIABLES
    var isIE6 = ($.browser.msie && $.browser.version < 7);
    var body = $(document.body);
    var jqzoompluging_disabled = false; //disables the plugin globally
    $.fn.jqzoom = function(options){
        return this.each(function(){
            var node = this.nodeName.toLowerCase();
            if (node == 'a') {
                new jqzoom(this, options);
            }
        });
    };
    
    /**
     * Shows the entire large image
     */
    var popup = (function(){
        var img, p, imgcnt, pmouseDown = false, loading = false, bg = $('<div class="bgpopup">'), w = $(window);
        
        function getCenterCoords(jqElem){
            return {
                left: Math.floor((w.width() - jqElem.width()) / 2) + "px",
                top: Math.floor((w.height() - jqElem.height()) / 2) + "px"
            }
        }
        
        function setImageContainerSize(){
            $(imgcnt).css({
                height: img.offsetHeight,
                width: img.offsetWidth
            })
        }
        
        function showLoadingMsg(){
        
        }
        function hideLoadingMsg(){
        
        }
        return {
            init: function(popupref, imgcont, closebtn, dragarea){
                if (!popupref) {
                    throw new Error("Invalid popup.init call: popupref is not defined.");
                }
                var that = this;
                bg.click(function(){
                    that.close()
                }).hide().appendTo("body");
                p = popupref;
                imgcnt = imgcont || p;
                $(p).css({
                    top: 0,
                    left: "-10000px"
                }).show();
                if (closebtn) {
                    $(closebtn).click(function(e){
                        e.preventDefault();
                        that.close();
                        return false
                    })
                }
                if (dragarea) {
                    document.body.ondragstart = function(){
                        return false;
                    };
                    $(dragarea).mousedown(function(evt){
                        var o = $(p).offset(), evt_offset = {
                            x: evt.pageX - o.left + w.scrollLeft(),
                            y: evt.pageY - o.top + w.scrollTop()
                        }
                        $(document).bind("mousemove.gpImbPopup", function(e){
                            /* Move the popup */
                            $(p).css({
                                top: (e.pageY - evt_offset.y) + 'px',
                                left: (e.pageX - evt_offset.x) + 'px'
                            })
                        })
                    }).mouseup(function(){
                        $(document).unbind("mousemove.gpImbPopup")
                    });
                }
                return this
            },
            setImage: function(image){
                var cnt = $(imgcnt);
                img = $(image).clone().removeAttr("style").removeAttr("class").removeAttr("height").removeAttr("width").get(0);
                cnt.children().remove();
                cnt.append(img);
                return this
            },
            close: function(){
                var i = $(img).unbind('load');
                img = null;
                loading = false;
                i.remove();
                $(p).css({
                    top: 0,
                    left: "-10000px"
                }).show();
                bg.hide();
                return this
            },
            show: function(){
                if (!img) {
                    throw new Error("popup.show method cannot be called before setting an image.")
                }
                bg.css({
                    width: w.width() + "px",
                    height: w.height() + "px"
                }).show();
                var jqp = $(p), coords;
                if (img.complete) {
                    //The image is already loaded
                    setImageContainerSize();
                    coords = getCenterCoords(jqp);
                    jqp.hide().css(coords).fadeIn("slow");
                }
                else {
                    loading = true;
                    showLoadingMsg();
                    $(img).bind('load', function(){
                        setImageContainerSize();
                        coords = getCenterCoords(jqp);
                        hideLoadingMsg();
                        jqp.hide().css(coords).fadeIn("slow");
                        loading = false;
                    })
                }
                return this
            }
        }
    })();
    
    var jqzoom = function(el, options){
        var api = null;
        api = $(el).data("jqzoom");
        if (api) 
            return api;
        var obj = this;
        var settings = $.extend({}, $.jqzoom.defaults, options || {});
        obj.el = el;
        el.rel = $(el).attr('rel');
        //ANCHOR ELEMENT
        el.zoom_active = false;
        el.zoom_disabled = false; //to disable single zoom instance
        el.largeimageloading = false; //tell us if large image is loading
        el.largeimageloaded = false; //tell us if large image is loaded
        el.scale = {};
        el.timer = null;
        el.mousepos = {};
        el.mouseDown = false;
        $(el).css({
            'outline-style': 'none',
            'text-decoration': 'none'
        });
        //BASE IMAGE
        var img = $("img:eq(0)", el);
        var iframe = $("<iframe>").attr({
        	"width":"480",
        	"height":"360",
        	"frameborder":"0",
        	"style": "margin:60px 0"
        }).hide();
        img.before(iframe);
        el.title = $(el).attr('title');
        el.imagetitle = img.attr('title');
        var zoomtitle = ($.trim(el.title).length > 0) ? el.title : el.imagetitle;
        var smallimage = new Smallimage(img);
        var lens = new Lens();
        var stage = new Stage();
        var largeimage = new Largeimage();
        var loader = new Loader();
        //preventing default click,allowing the onclick event [exmple: lightbox]
        $(el).bind(settings.swapImageTrigger, function(e){
            e.preventDefault();
            return false;
        });
        //setting the default zoomType if not in settings
        var zoomtypes = ['standard', 'drag', 'innerzoom', 'reverse'];
        if ($.inArray($.trim(settings.zoomType), zoomtypes) < 0) {
            settings.zoomType = 'standard';
        }
        $.extend(obj, {
            create: function(){ //create the main objects
                //create ZoomPad
                if ($(".zoomPad", el).length == 0) {
                    el.zoomPad = $('<div/>').addClass('zoomPad');
                    img.wrap(el.zoomPad);
                }
                if (settings.zoomType == 'innerzoom') {
                    settings.zoomWidth = smallimage.w;
                    settings.zoomHeight = smallimage.h;
                }
                //creating ZoomPup
                if ($(".zoomPup", el).length == 0) {
                    lens.append();
                }
                //creating zoomWindow
                if ($(".zoomWindow", el).length == 0) {
                    stage.append();
                }
                //creating Preload
                if ($(".zoomPreload", el).length == 0) {
                    loader.append();
                }
                //preloading images
                if (settings.preloadImages || settings.zoomType == 'drag' || settings.alwaysOn) {
                    obj.load();
                }
                obj.init();
            },
            init: function(){
                //drag option
                if (settings.zoomType == 'drag') {
                    $(".zoomPad", el).mousedown(function(){
                        el.mouseDown = true;
                    });
                    $(".zoomPad", el).mouseup(function(){
                        el.mouseDown = false;
                    });
                    document.body.ondragstart = function(){
                        return false;
                    };
                    $(".zoomPad", el).css({
                        cursor: 'default'
                    });
                    $(".zoomPup", el).css({
                        cursor: 'move'
                    });
                }
                if (settings.enableRolloverZoom) {
                    if (settings.zoomType == 'innerzoom') {
                        $(".zoomWrapper", el).css({
                            cursor: 'crosshair'
                        });
                    }
                    $(".zoomPad", el).bind('mouseenter mouseover', function(event){
                        img.attr('title', '');
                        $(el).attr('title', '');
                        el.zoom_active = true;
                        //if loaded then activate else load large image
                        smallimage.fetchdata();
                        if (el.largeimageloaded) {
                            obj.activate(event);
                        }
                        else {
                            obj.load();
                        }
                    });
                    $(".zoomPad", el).bind('mouseleave', function(event){
                        obj.deactivate();
                    });
                    $(".zoomPad", el).bind('mousemove', function(e){
                    
                        //prevent fast mouse movements not to fire the mouseout event
                        if (e.pageX > smallimage.pos.r || e.pageX < smallimage.pos.l || e.pageY < smallimage.pos.t || e.pageY > smallimage.pos.b) {
                            lens.setcenter();
                            return false;
                        }
                        el.zoom_active = true;
                        if (el.largeimageloaded && !$('.zoomWindow', el).is(':visible')) {
                            obj.activate(e);
                        }
                        if (el.largeimageloaded && (settings.zoomType != 'drag' || (settings.zoomType == 'drag' && el.mouseDown))) {
                            lens.setposition(e);
                        }
                    });
                }
                var thumb_preload = new Array();
                var i = 0;
                //binding click event on thumbnails
                var thumblist = new Array();
                thumblist = $('a').filter(function(){
                    var regex = new RegExp("gallery[\\s]*:[\\s]*'" + $.trim(el.rel) + "'", "i");
                    var rel = $(this).attr('rel');
                    if (regex.test(rel)) {
                        return this;
                    }
                });
                if (thumblist.length > 0) {
                    //getting the first to the last
                    var first = thumblist.splice(0, 1);
                    thumblist.push(first);
                }
                thumblist.each(function(){
                    //preloading thumbs
                    if (settings.preloadImages) {
                        var thumb_options = $.extend({}, eval("(" + $.trim($(this).attr('rel')) + ")"));
                        if(thumb_options.largeimage != "video") {
                        	thumb_preload[i] = new Image();
                        	thumb_preload[i].src = thumb_options.largeimage;
                        	i++;
                        }
                    }
                    $(this).bind(settings.swapImageTrigger, function(e) {
                        if (!$(this).hasClass('zoomThumbActive')) {
                            thumblist.each(function() {
                                $(this).removeClass('zoomThumbActive');
                            });
                            e.preventDefault();
                            obj.swapimage(this);
                        }
                        return false;
                    });
                    if (settings.enableLargeImagePopup) {
                        $(this).bind(settings.showLareImgHdlr, function(e){
                            e.preventDefault();
                            popup.close().setImage(largeimage.node).show();
                            return false;
                        });
                    }
                });
            },
            load: function(){
                if (el.largeimageloaded == false && el.largeimageloading == false) {
                    var url = $(el).attr('href');
                    el.largeimageloading = true;
                    largeimage.loadimage(url);
                }
            },
            activate: function(e){
                clearTimeout(el.timer);
                //show lens and zoomWindow
                lens.show();
                stage.show();
            },
            deactivate: function(e){
                switch (settings.zoomType) {
                    case 'drag':
                        //nothing or lens.setcenter();
                        break;
                    default:
                        img.attr('title', el.imagetitle);
                        $(el).attr('title', el.title);
                        if (settings.alwaysOn) {
                            lens.setcenter();
                        }
                        else {
                            stage.hide();
                            lens.hide();
                        }
                        break;
                }
                el.zoom_active = false;
            },
            swapimage: function(link) {
                el.largeimageloading = false;
                el.largeimageloaded = false;
                var options = new Object();
                options = $.extend({}, eval("(" + $.trim($(link).attr('rel')) + ")"));
                if (options.smallimage && options.largeimage) {
                    var smallimage = options.smallimage;
                    var largeimage = options.largeimage;
                    $(link).addClass('zoomThumbActive');
                    if(largeimage == "video") {
                    	el.largeimageloading = el.largeimageloaded = true;
                    	img.hide();
                    	iframe.attr("src", "http://www.youtube.com/embed/" + smallimage.split("/").pop() + "?rel=0").show();
                    } else {
                    	iframe.removeAttr("src").hide();
                    	$(el).attr('href', largeimage);
                    	img.show();
                    	smallimage += (smallimage.indexOf("?") < 0 ? "?d=" : "&d=") + (new Date()).getTime();
                    	img.attr('src', smallimage);
                    }
                    lens.hide();
                   	stage.hide();
                   	obj.load();
                } else {
                    alert('ERROR :: Missing parameter for largeimage or smallimage.');
                    throw 'ERROR :: Missing parameter for largeimage or smallimage.';
                }
                return false;
            }
        });
        //sometimes image is already loaded and onload will not fire
        if (img[0].complete) {
            //fetching data from sallimage if was previously loaded
            smallimage.fetchdata();
            if ($(".zoomPad", el).length == 0) 
                obj.create();
        }
        /*========================================================,
         |   Smallimage
         |---------------------------------------------------------:
         |   Base image into the anchor element
         `========================================================*/
        function Smallimage(image){
            var $obj = this;
            this.node = image[0];
            this.findborder = function(){
                var bordertop = 0;
                bordertop = image.css('border-top-width');
                btop = '';
                var borderleft = 0;
                borderleft = image.css('border-left-width');
                bleft = '';
                if (bordertop) {
                    for (i = 0; i < 3; i++) {
                        var x = [];
                        x = bordertop.substr(i, 1);
                        if (isNaN(x) == false) {
                            btop = btop + '' + bordertop.substr(i, 1);
                        }
                        else {
                            break;
                        }
                    }
                }
                if (borderleft) {
                    for (i = 0; i < 3; i++) {
                        if (!isNaN(borderleft.substr(i, 1))) {
                            bleft = bleft + borderleft.substr(i, 1)
                        }
                        else {
                            break;
                        }
                    }
                }
                $obj.btop = (btop.length > 0) ? eval(btop) : 0;
                $obj.bleft = (bleft.length > 0) ? eval(bleft) : 0;
            };
            this.fetchdata = function(){
                $obj.findborder();
                $obj.w = image.width();
                $obj.h = image.height();
                $obj.ow = image.outerWidth();
                $obj.oh = image.outerHeight();
                $obj.pos = image.offset();
                $obj.pos.l = image.offset().left + $obj.bleft;
                $obj.pos.t = image.offset().top + $obj.btop;
                $obj.pos.r = $obj.w + $obj.pos.l;
                $obj.pos.b = $obj.h + $obj.pos.t;
                $obj.rightlimit = image.offset().left + $obj.ow;
                $obj.bottomlimit = image.offset().top + $obj.oh;
                
            };
            this.node.onerror = function(){
                alert('Problems while loading image.');
                throw 'Problems while loading image.';
            };
            this.node.onload = function(){
                $obj.fetchdata();
                if ($(".zoomPad", el).length == 0) 
                    obj.create();
            };
            return $obj;
        };
        /*========================================================,
         |  Loader
         |---------------------------------------------------------:
         |  Show that the large image is loading
         `========================================================*/
        function Loader(){
            var $obj = this;
            this.append = function(){
                this.node = $('<div/>').addClass('zoomPreload').css('visibility', 'hidden').html(settings.preloadText);
                $('.zoomPad', el).append(this.node);
            };
            this.show = function(){
                this.node.top = (smallimage.oh - this.node.height()) / 2;
                this.node.left = (smallimage.ow - this.node.width()) / 2;
                //setting position
                this.node.css({
                    top: this.node.top,
                    left: this.node.left,
                    position: 'absolute',
                    visibility: 'visible'
                });
            };
            this.hide = function(){
                this.node.css('visibility', 'hidden');
            };
            return this;
        }
        /*========================================================,
         |   Lens
         |---------------------------------------------------------:
         |   Lens over the image
         `========================================================*/
        function Lens(){
            var $obj = this;
            this.node = $('<div/>').addClass('zoomPup');
            //this.nodeimgwrapper = $("<div/>").addClass('zoomPupImgWrapper');
            this.append = function(){
                $('.zoomPad', el).append($(this.node).hide());
                if (settings.zoomType == 'reverse') {
                    this.image = new Image();
                    this.image.src = smallimage.node.src; // fires off async
                    $(this.node).empty().append(this.image);
                }
            };
            this.setdimensions = function(){
                this.node.w = (parseInt((settings.zoomWidth) / el.scale.x) > smallimage.w) ? smallimage.w : (parseInt(settings.zoomWidth / el.scale.x));
                this.node.h = (parseInt((settings.zoomHeight) / el.scale.y) > smallimage.h) ? smallimage.h : (parseInt(settings.zoomHeight / el.scale.y));
                this.node.top = (smallimage.oh - this.node.h - 2) / 2;
                this.node.left = (smallimage.ow - this.node.w - 2) / 2;
                //centering lens
                this.node.css({
                    top: 0,
                    left: 0,
                    width: this.node.w + 'px',
                    height: this.node.h + 'px',
                    position: 'absolute',
                    display: 'none',
                    borderWidth: 1 + 'px'
                });
                
                if (settings.zoomType == 'reverse') {
                    this.image.src = smallimage.node.src;
                    $(this.node).css({
                        'opacity': 1
                    });
                    
                    $(this.image).css({
                        position: 'absolute',
                        display: 'block',
                        left: -(this.node.left + 1 - smallimage.bleft) + 'px',
                        top: -(this.node.top + 1 - smallimage.btop) + 'px'
                    });
                }
            };
            this.setcenter = function(){
                //calculating center position
                this.node.top = (smallimage.oh - this.node.h - 2) / 2;
                this.node.left = (smallimage.ow - this.node.w - 2) / 2;
                //centering lens
                this.node.css({
                    top: this.node.top,
                    left: this.node.left
                });
                if (settings.zoomType == 'reverse') {
                    $(this.image).css({
                        position: 'absolute',
                        display: 'block',
                        left: -(this.node.left + 1 - smallimage.bleft) + 'px',
                        top: -(this.node.top + 1 - smallimage.btop) + 'px'
                    });
                    
                }
                //centering large image
                largeimage.setposition();
            };
            this.setposition = function(e){
                el.mousepos.x = e.pageX;
                el.mousepos.y = e.pageY;
                var lensleft = 0;
                var lenstop = 0;
                
                function overleft(lens){
                    return el.mousepos.x - (lens.w) / 2 < smallimage.pos.l;
                }
                
                function overright(lens){
                    return el.mousepos.x + (lens.w) / 2 > smallimage.pos.r;
                    
                }
                
                function overtop(lens){
                    return el.mousepos.y - (lens.h) / 2 < smallimage.pos.t;
                }
                
                function overbottom(lens){
                    return el.mousepos.y + (lens.h) / 2 > smallimage.pos.b;
                }
                
                lensleft = el.mousepos.x + smallimage.bleft - smallimage.pos.l - (this.node.w + 2) / 2;
                lenstop = el.mousepos.y + smallimage.btop - smallimage.pos.t - (this.node.h + 2) / 2;
                if (overleft(this.node)) {
                    lensleft = smallimage.bleft - 1;
                }
                else 
                    if (overright(this.node)) {
                        lensleft = smallimage.w + smallimage.bleft - this.node.w - 1;
                    }
                if (overtop(this.node)) {
                    lenstop = smallimage.btop - 1;
                }
                else 
                    if (overbottom(this.node)) {
                        lenstop = smallimage.h + smallimage.btop - this.node.h - 1;
                    }
                
                this.node.left = lensleft;
                this.node.top = lenstop;
                this.node.css({
                    'left': lensleft + 'px',
                    'top': lenstop + 'px'
                });
                if (settings.zoomType == 'reverse') {
                    if ($.browser.msie && $.browser.version > 7) {
                        $(this.node).empty().append(this.image);
                    }
                    
                    $(this.image).css({
                        position: 'absolute',
                        display: 'block',
                        left: -(this.node.left + 1 - smallimage.bleft) + 'px',
                        top: -(this.node.top + 1 - smallimage.btop) + 'px'
                    });
                }
                
                largeimage.setposition();
            };
            this.hide = function(){
                img.css({
                    'opacity': 1
                });
                this.node.hide();
            };
            this.show = function(){
            
                if (settings.zoomType != 'innerzoom' && (settings.lens || settings.zoomType == 'drag')) {
                    this.node.show();
                }
                
                if (settings.zoomType == 'reverse') {
                    img.css({
                        'opacity': settings.imageOpacity
                    });
                }
            };
            this.getoffset = function(){
                var o = {};
                o.left = $obj.node.left;
                o.top = $obj.node.top;
                return o;
            };
            return this;
        };
        /*========================================================,
         |   Stage
         |---------------------------------------------------------:
         |   Window area that contains the large image
         `========================================================*/
        function Stage(){
            var $obj = this;
            this.node = $("<div class='zoomWindow'><div class='zoomWrapper'><div class='zoomWrapperTitle'></div><div class='zoomWrapperImage'></div></div></div>");
            this.ieframe = $('<iframe class="zoomIframe" src="javascript:\'\';" marginwidth="0" marginheight="0" align="bottom" scrolling="no" frameborder="0" ></iframe>');
            this.setposition = function(){
                this.node.leftpos = 0;
                this.node.toppos = 0;
                if (settings.zoomType != 'innerzoom') {
                    //positioning
                    switch (settings.position) {
                        case "left":
                            this.node.leftpos = (smallimage.pos.l - smallimage.bleft - Math.abs(settings.xOffset) - settings.zoomWidth > 0) ? (0 - settings.zoomWidth - Math.abs(settings.xOffset)) : (smallimage.ow + Math.abs(settings.xOffset));
                            this.node.toppos = Math.abs(settings.yOffset);
                            break;
                        case "top":
                            this.node.leftpos = Math.abs(settings.xOffset);
                            this.node.toppos = (smallimage.pos.t - smallimage.btop - Math.abs(settings.yOffset) - settings.zoomHeight > 0) ? (0 - settings.zoomHeight - Math.abs(settings.yOffset)) : (smallimage.oh + Math.abs(settings.yOffset));
                            break;
                        case "bottom":
                            this.node.leftpos = Math.abs(settings.xOffset);
                            this.node.toppos = (smallimage.pos.t - smallimage.btop + smallimage.oh + Math.abs(settings.yOffset) + settings.zoomHeight < screen.height) ? (smallimage.oh + Math.abs(settings.yOffset)) : (0 - settings.zoomHeight - Math.abs(settings.yOffset));
                            break;
                        default:
                            this.node.leftpos = (smallimage.rightlimit + Math.abs(settings.xOffset) + settings.zoomWidth < screen.width) ? (smallimage.ow + Math.abs(settings.xOffset)) : (0 - settings.zoomWidth - Math.abs(settings.xOffset));
                            this.node.toppos = Math.abs(settings.yOffset);
                            break;
                    }
                }
                this.node.css({
                    'left': this.node.leftpos + 'px',
                    'top': this.node.toppos + 'px'
                });
                return this;
            };
            this.append = function(){
                $('.zoomPad', el).append(this.node);
                this.node.css({
                    position: 'absolute',
                    display: 'none',
                    zIndex: 5001
                });
                if (settings.zoomType == 'innerzoom') {
                    this.node.css({
                        cursor: 'default'
                    });
                    var thickness = (smallimage.bleft == 0) ? 1 : smallimage.bleft;
                    $('.zoomWrapper', this.node).css({
                        borderWidth: thickness + 'px'
                    });
                }
                
                $('.zoomWrapper', this.node).css({
                    width: Math.round(settings.zoomWidth) + 'px',
                    borderWidth: thickness + 'px'
                });
                $('.zoomWrapperImage', this.node).css({
                    width: '100%',
                    height: Math.round(settings.zoomHeight) + 'px'
                });
                //zoom title
                $('.zoomWrapperTitle', this.node).css({
                    width: '100%',
                    position: 'absolute'
                });
                
                $('.zoomWrapperTitle', this.node).hide();
                if (settings.title && zoomtitle.length > 0) {
                    $('.zoomWrapperTitle', this.node).html(zoomtitle).show();
                }
                $obj.setposition();
            };
            this.hide = function(){
                switch (settings.hideEffect) {
                    case 'fadeout':
                        this.node.fadeOut(settings.fadeoutSpeed, function(){
                        });
                        break;
                    default:
                        this.node.hide();
                        break;
                }
                this.ieframe.hide();
            };
            this.show = function(){
                switch (settings.showEffect) {
                    case 'fadein':
                        this.node.fadeIn();
                        this.node.fadeIn(settings.fadeinSpeed, function(){
                        });
                        break;
                    default:
                        this.node.show();
                        break;
                }
                if (isIE6 && settings.zoomType != 'innerzoom') {
                    this.ieframe.width = this.node.width();
                    this.ieframe.height = this.node.height();
                    this.ieframe.left = this.node.leftpos;
                    this.ieframe.top = this.node.toppos;
                    this.ieframe.css({
                        display: 'block',
                        position: "absolute",
                        left: this.ieframe.left,
                        top: this.ieframe.top,
                        zIndex: 99,
                        width: this.ieframe.width + 'px',
                        height: this.ieframe.height + 'px'
                    });
                    $('.zoomPad', el).append(this.ieframe);
                    this.ieframe.show();
                }
            };
        };
        /*========================================================,
         |   LargeImage
         |---------------------------------------------------------:
         |   The large detailed image
         `========================================================*/
        function Largeimage(){
            var $obj = this;
            this.node = new Image();
            this.loadimage = function(url){
                //showing preload
                loader.show();
                this.url = url;
                this.node.style.position = 'absolute';
                this.node.style.border = '0px';
                this.node.style.display = 'none';
                this.node.style.left = '-10000px';
                this.node.style.top = '0px';
                document.body.appendChild(this.node);
                this.node.src = url; // fires off async
            };
            this.fetchdata = function(){
                var image = $(this.node);
                var scale = {};
                this.node.style.display = 'block';
                $obj.w = image.width();
                $obj.h = image.height();
                $obj.pos = image.offset();
                $obj.pos.l = image.offset().left;
                $obj.pos.t = image.offset().top;
                $obj.pos.r = $obj.w + $obj.pos.l;
                $obj.pos.b = $obj.h + $obj.pos.t;
                scale.x = ($obj.w / smallimage.w);
                scale.y = ($obj.h / smallimage.h);
                el.scale = scale;
                document.body.removeChild(this.node);
                $('.zoomWrapperImage', el).empty().append(this.node);
                //setting lens dimensions;
                lens.setdimensions();
            };
            this.node.onerror = function(){
                alert('Problems while loading the big image.');
                throw 'Problems while loading the big image.';
            };
            this.node.onload = function(){
            	//Fix for ie bug
            	$(this).removeAttr('height').removeAttr('width');
                //fetching data
                $obj.fetchdata();
                loader.hide();
                el.largeimageloading = false;
                el.largeimageloaded = true;
                if (settings.enableRolloverZoom && (settings.zoomType == 'drag' || settings.alwaysOn)) {
                    lens.show();
                    stage.show();
                    lens.setcenter();
                }
            };
            this.setposition = function(){
                var left = -el.scale.x * (lens.getoffset().left - smallimage.bleft + 1);
                var top = -el.scale.y * (lens.getoffset().top - smallimage.btop + 1);
                $(this.node).css({
                    'left': left + 'px',
                    'top': top + 'px'
                });
            };
            return this;
        };
        
        $(el).data("jqzoom", obj);
    };
    //es. $.jqzoom.disable('#jqzoom1');
    $.jqzoom = {
        defaults: {
            zoomType: 'standard',
            //innerzoom/standard/reverse/drag
            zoomWidth: 300,
            //zoomWindow  default width
            zoomHeight: 300,
            //zoomWindow  default height
            xOffset: 10,
            //zoomWindow x offset, can be negative(more on the left) or positive(more on the right)
            yOffset: 0,
            //zoomWindow y offset, can be negative(more on the left) or positive(more on the right)
            position: "right",
            //zoomWindow default position
            preloadImages: true,
            //image preload
            preloadText: 'Loading zoom',
            title: true,
            lens: true,
            imageOpacity: 0.4,
            alwaysOn: false,
            showEffect: 'show',
            //show/fadein
            hideEffect: 'hide',
            //hide/fadeout
            fadeinSpeed: 'slow',
            //fast/slow/number
            fadeoutSpeed: '2000',
            //fast/slow/number
            swapImageTrigger: "click",
            // Event listened in order to change the media image.
            enableRolloverZoom: true
            // Enables the rollover functionallity.
        
        },
        disable: function(el){
            var api = $(el).data('jqzoom');
            api.disable();
            return false;
        },
        enable: function(el){
            var api = $(el).data('jqzoom');
            api.enable();
            return false;
        },
        disableAll: function(el){
            jqzoompluging_disabled = true;
        },
        enableAll: function(el){
            jqzoompluging_disabled = false;
        }
    };
    return {
        init: function(obj, images, options){
            var defaults = {
                draggablePopup: true,
                // If true, the large image popup is draggable.
                enableLargeImagePopup: true,
                // Enables the large image popup.
                popupDragArea: null,
                //Specifies the popup draggable area.
                popupSelector: ".imb .popup",
                popupCloseBtn: ".popup-close",
                popupImgCnt: ".popup-image",
                showLareImgHdlr: "dblclick",
                // Event listened in order to show up the large image popup.
                thumbsList: ".imb #thumblist tr"
                //Thumbnails list selector
            }
            $.extend(defaults, options);
            obj = $(obj);
            /* Check images and build the gallery */
            var th = images.arrThumbs, med = images.arrImages, lg = images.arrLarge, maxlen = Math.min(th.length, med.length), images = 0;
            if (maxlen > 1) {
                var thlist = $(defaults.thumbsList), elem;
                thlist.hide();
                for (var i = 0; i < maxlen; i++) {
                    if (th[i] !== '' && med[i] !== '') {
                        images++;
                        elem = $("<td>");
                        elem.append($("<div class='imb-thumbnail'>").append($("<a>").attr({
                            href: "javascript:void(0)",
                            rel: "{gallery:'imb-gal',smallimage:'" + med[i] + "',largeimage:'" + ((lg[i] !== '') ? lg[i] : med[i]) + "'}"
                        }).append($("<img>").attr("src", th[i]))));
                        thlist.append(elem)
                    }
                }
                if (images > 1) {
                    if (th.length) {
                        $('a:first', thlist).addClass("zoomThumbActive")
                    }
                    thlist.show();
                    thlist.find("td").gpItemListCarousel({"quantityMove": 2});
                } else {
                    thlist.closest("div").find(".txt").hide();
                    thlist.remove();
                }
            }
            if (defaults.enableLargeImagePopup) {
                var p = $(defaults.popupSelector), imgcnt = $(defaults.popupImgCnt, p), closebtn = $(defaults.popupCloseBtn, p), darea;
                if (defaults.draggablePopup) {
                    darea = $(defaults.popupDragArea, p).get(0) || p.get(0);
                }
                popup.init(p.get(0), imgcnt.get(0), closebtn.get(0), darea);
                if (images == 1) {
                    var img = new Image();
                    img.src = lg[0] || med[0];
                    obj.bind(defaults.showLareImgHdlr, function(){
                        popup.setImage(img);
                        popup.show();
                    })
                }
            }
            obj.attr("title", $(".imb .gallerytitle").html()).jqzoom(defaults);
        }
    }
}(jQuery);
