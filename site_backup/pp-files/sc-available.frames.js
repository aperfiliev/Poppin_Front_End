$j(function($) {
    available_frames_hover = {
        rgb2hex : function(rgb) {
            rgb = rgb.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+))?\)$/);
            function hex(x) {
                return ("0" + parseInt(x).toString(16)).slice(-2);
            }

            return hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
        },
        create : function(element) {
            txt = $('a', element).attr('rel');
            span = $('<span></span>').addClass('color-over').css({
                opacity : 0,
                position : 'absolute',
                display : 'none'
            })
            span_text = $('<span></span>').addClass('color-text').text(txt);
            $(span).append(span_text);
            element.css({
                position : 'relative'
            }).append(span);
        },
        hover : function(element) {
            element.hover(function() {
                $(this).find('.color-over').css({
                    display : 'block'
                }).animate({
                    bottom : '40px',
                    opacity : 1
                });
            }, function() {
                $(this).find('.color-over').animate({
                    bottom : '35px',
                    opacity : 0
                }, function() {
                    $(this).css({
                        display : 'none'
                    })
                });
            });
        }
    };
    var arrIds = [];
    var objIdsPos = {};
    var colors = $('#available-sizes-list li').each(function(i) {
        var _this = $(this);
        var _id = _this.data('sizeid');
        if (_id) {
            arrIds.push(_id);
            objIdsPos[_id] = i;
        } else {
            _this.remove();
        }
    });

    if (arrIds.length)
        $.ajax({
            "url" : "/app/site/hosting/scriptlet.nl",
            "data" : {
                "script" : "265",
                "deploy" : "1",
                "_ids" : arrIds.join()
            },
            "dataType" : "json",
            "success" : function(objData) {
                var _id = null;
                for (_id in objData) {
                    var li = $(colors[objIdsPos[_id]]);
                    li.children().css("background", "url(" + objData[_id] + ") no-repeat top left");
                    available_frames_hover.create(li);
                    available_frames_hover.hover(li);
                    objIdsPos[_id] = undefined;
                }
                for (_remaining in objIdsPos)
                    $(colors[objIdsPos[_remaining]]).remove();
                colors = undefined;
                if (_id)
                    $('.product-page .available-frames-block').show();
            },
            "error" : function(e) {
                if (window.console)
                    console.debug(e);
            }
        });
});