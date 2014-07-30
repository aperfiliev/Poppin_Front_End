var $j = jQuery.noConflict();
/* ns-fix.js */
$j(function () {
    var cat_collumns_count = 3,
        item_collumns_count = 3,
        home_item_collumns_count = 5,
        related_item_collumns_count = 2,
        cat_cell_td_obj = $j(".td-cat-cell"),
        item_cell_td_obj = $j(".td-item-cell"),
        home_cell_td_obj = $j(".td-home-cell"),
        related_cell_td_obj = $j(".td-related-cell"),
        portlet_left_nav_table_obj = $j(".table-left-nav");
    var table_global_search_obj = $j(".table-global-search");
    var global_search_text = "SEARCH AND YOU WILL FIND...";
    var global_search_btn_text = "";
    var item_cat_cust_pag_wrap = $j(".toolbal");
    var item_cat_cust_pag_left_img = new Array("/site/pp-templates/pag-left.gif", 11, 16);
    var item_cat_cust_page_right_img = new Array("/site/pp-templates/pag-right.gif", 11, 16);
    var login_obj = $j("#header .login");
    var logout_obj = $j("#header .logout");
    var breadcrum_edit = true;
    var breadcrumb_container = $j(".breadcrumbs");
    var breadcrumb_separation = " / ";
    $j("#outerwrapper, #innerwrapper, #div__body").attr({
        style: ""
    });
    $j(".external").each(function () {
        $j(this).attr({
            target: "_blank"
        })
    });
    $j(cat_cell_td_obj).each(function (i) {
        i++;
        if (i % cat_collumns_count == 0) {
            $j(this).addClass("td-last")
        }
        $j(this).hover(function () {
            $j(this).addClass("over")
        }, function () {
            $j(this).removeClass("over")
        })
    });
    $j(item_cell_td_obj).each(function (i) {
        i++;
        if (i % item_collumns_count == 0) {
            $j(this).addClass("td-last")
        }
        $j(this).hover(function () {
            $j(this).addClass("over")
        }, function () {
            $j(this).removeClass("over")
        })
    });
    $j(home_cell_td_obj).each(function (i) {
        i++;
        if (i % home_item_collumns_count == 0) {
            $j(this).addClass("td-last")
        }
        $j(this).hover(function () {
            $j(this).addClass("over")
        }, function () {
            $j(this).removeClass("over")
        })
    });
    $j(related_cell_td_obj).each(function (i) {
        i++;
        if (i % related_item_collumns_count == 0) {
            $j(this).addClass("td-last")
        }
        $j(this).hover(function () {
            $j(this).addClass("over")
        }, function () {
            $j(this).removeClass("over")
        })
    });
    $j(portlet_left_nav_table_obj).each(function () {
        $j("table", this).addClass("table-group").attr({
            cellspacing: 0,
            cellpadding: 0,
            border: 0,
            width: "100%"
        })
    });
    $j(".table-group", portlet_left_nav_table_obj).each(function () {
        $j("tr", this).addClass("tr-item")
    });
    $j(".tr-item", portlet_left_nav_table_obj).each(function () {
        var tds_colspan_count = $j("td:first", this).attr("colspan");
        if (!tds_colspan_count) {
            tds_colspan_count = 0
        }
        var class_level_name = "level" + (parseInt(tds_colspan_count) + 1);
        $j(this).addClass(class_level_name);
        if (jQuery.browser.msie && jQuery.browser.version == "7.0") {
            $j("td", this).removeAttr("style");
            $j("td", this).removeAttr("width");
            var tds_length = $j("td", this).length;
            $j("td", this).each(function (i) {
                if ((i + 1) < tds_length) {
                    $j(this).remove()
                }
            })
        } else {
            $j("td", this).attr({
                style: "",
                width: "",
                align: "",
                colspan: ""
            }).not(":last").remove()
        }
        $j(".smalltext", this).removeClass();
        $j(".textboldnolink", this).removeClass().addClass("active")
    });
    var global_search_btn_go = $j("input#go", table_global_search_obj);
    var global_search_txt_field = $j("input.input", table_global_search_obj);
    $j(global_search_btn_go).attr({
        value: global_search_btn_text
    });
    $j(global_search_txt_field).addClass("focus-out").attr({
        value: global_search_text
    }).focus(function () {
        $j(this).attr({
            value: ""
        }).removeClass("focus-out").addClass("focus-in");
        if ($j.browser.webkit) {
            if (navigator.userAgent.match(/iPhone/i) || navigator.userAgent.match(/iPad/i) || navigator.userAgent.match(/iPod/i)) {
                $j(document).get(0).addEventListener("touchstart", function (event) {
                    $j(global_search_txt_field).blur()
                }, false)
            }
        }
    }).blur(function () {
        if ($j(this).attr("value") == "") {
            $j(this).attr({
                value: global_search_text
            }).removeClass("focus-in").addClass("focus-out")
        }
    }).keyup(function (event) {
        if (event.keyCode == 13) {
            $j(global_search_btn_go).click()
        }
    });
    if ($j(".gp_custom_pagination").length > 0 && $j(item_cat_cust_pag_wrap).length > 0) {
        $j(".gp_custom_pagination").parent().addClass("page-txt");
        $j(".gp_custom_pagination").parent().parent().parent().parent().addClass("gp_table_pagination");
        var newPagination = $j(".gp_table_pagination").html();
        var newPaginationText = $j(newPagination).find(".gp_custom_pagination");
        $j(item_cat_cust_pag_wrap).append('<div class="new-pag-wrap"><div class="left-data"><table class="gp_new_pagination">' + newPagination + '</table></div><div class="right-data"></div></div>');
        $j(item_cat_cust_pag_wrap).find(".right-data").html(newPaginationText);
        $j(item_cat_cust_pag_wrap).find(".page-txt").html("Page");
        if (item_cat_cust_pag_left_img != "" && item_cat_cust_page_right_img != "") {
            $j(".gp_new_pagination img").each(function (i) {
                $j(this).addClass("image" + i)
            });
            $j(".gp_new_pagination img").parent("a").addClass("page-img-link");
            $j(".gp_new_pagination .image0, .gp_new_pagination .image2").attr({
                src: item_cat_cust_pag_left_img[0],
                width: item_cat_cust_pag_left_img[1],
                height: item_cat_cust_pag_left_img[2]
            });
            $j(".gp_new_pagination .image1, .gp_new_pagination .image3").attr({
                src: item_cat_cust_page_right_img[0],
                width: item_cat_cust_page_right_img[1],
                height: item_cat_cust_page_right_img[2]
            })
        }
    }
    if ($j(login_obj).length > 0 && $j(logout_obj).length > 0) {
        if (log_mail) {
            $j(login_obj).addClass("hidden");
            $j(logout_obj).removeClass("hidden")
        }
    }
    if (breadcrum_edit) {
        if (breadcrumb_container.length > 0) {
            var brd = breadcrumb_container.html();
            brd = brd.replace(/&nbsp;&gt;&nbsp;/gi, breadcrumb_separation);
            breadcrumb_container.html(brd)
        }
    }
});
/* gp-functions.js */
(function ($) {
    $j.fn.gpTabs = function (options) {
        var settings = $j.extend({
            active: true
        }, options);
        var options = $j.extend(settings, options);
        return this.each(function () {
            var tabs_container = $j(this);
            var tabs_nav = $j(".tabs-nav li a", tabs_container);
            var tabs_content = $j(".tabs-content", tabs_container);
            $j(tabs_content).each(function (i) {
                if ($j(this).html().length == 0) {
                    $j(this).remove();
                    $j(tabs_nav.get(i)).parent().remove()
                }
            });
            $j(tabs_content).hide().filter(":first").show();
            $j(tabs_nav).click(function () {
                $j(tabs_content).hide().filter(this.hash).show();
                $j(tabs_nav).parent().removeClass("active");
                $j(this).parent().addClass("active");
                return false
            }).filter(":first").click()
        })
    };
    $j.fn.gpNavDrilldown = function (options) {
        var settings = $j.extend({
            active: true
        }, options);
        var options = $j.extend(settings, options);
        return this.each(function () {
            $j("li", this).hover(function () {
                $j(this).addClass("over")
            }, function () {
                $j(this).removeClass("over")
            });
            if ($j.browser.webkit) {
                if (navigator.userAgent.match(/iPhone/i) || navigator.userAgent.match(/iPad/i) || navigator.userAgent.match(/iPod/i)) {
                    $j("li", this).each(function () {
                        $j(this).get(0).addEventListener("touchstart", function (event) {
                            $j(document).get(0).addEventListener("touchstart", function (event) {})
                        }, false)
                    })
                }
            }
        })
    };
    $j.fn.gpItemListCarousel = function (options) {
        var settings = $j.extend({
            active: true,
            controls: true,
            table_wrap: $j(),
            tr_wrap: $j(),
            tr_first_row: $j(),
            controls_wrap: $j(),
            controls_left: $j(),
            controls_right: $j(),
            product_list_wrap: $j(),
            addto_wrap: ".addto"
        }, options);
        var options = $j.extend(settings, options);
        var td_collection = this;

        function _initialize() {
            if ($j(td_collection).length > 1) {
                _start()
            }
            return false
        }

        function _start() {
            _prepareHTML()
        }

        function _prepareHTML() {
            $j.each(td_collection, function (i) {
                $j(this).parent().addClass("tr-wrap");
                if (i == 0) {
                    $j(this).parent().addClass("tr-first-row")
                }
            });
            $j(td_collection).closest("table").addClass("gpc-table-wrap");
            settings.table_wrap = $j(td_collection).closest("table.gpc-table-wrap");
            settings.tr_wrap = $j(".tr-wrap", settings.table_wrap);
            settings.tr_first_row = $j(".tr-first-row", settings.table_wrap);
            _moveElements()
        }

        function _moveElements() {
            $j(td_collection).each(function () {
                var addto_form = $j(this).parent("form");
                var addto = $j(settings.addto_wrap, this);
                var parent_wrap = $j(addto).parent();
                if (addto_form.length) {
                    addto_form = addto_form.clone().html("")
                } else {
                    addto_form = $j(this).prev()
                }
                $j(addto_form).append(addto);
                $j(parent_wrap, this).append(addto_form);
                $j(settings.tr_first_row).append($j(this))
            });
            $j(settings.tr_wrap).not(settings.tr_first_row).remove();
            if (settings.controls) {
                _prepareControlsHTML()
            }
        }

        function requiredControls() {
            var td_width = $j(td_collection).width();
            var product_list_width = $j(settings.product_list_wrap).width();
            var table_list_width = $j(settings.table_wrap).width();
            var items_to_show = (product_list_width / td_width);
            if (table_list_width > product_list_width) {
                if (product_list_width == (td_width * items_to_show)) {
                    return true
                }
            } else {
                return false
            }
        }

        function _controlsAction() {
            var td_width = $j(td_collection).width();
            var product_list_width = $j(settings.product_list_wrap).width();
            var table_list_width = $j(settings.table_wrap).width();
            var negative_margin_by_item = (0 - td_width);
            var negative_margin_limit = (0 - (table_list_width - product_list_width));
            var animation_active = false;
            if ($j.browser.webkit) {
                if (navigator.userAgent.match(/iPhone/i) || navigator.userAgent.match(/iPad/i) || navigator.userAgent.match(/iPod/i)) {
                    detectOrientation();

                    function detectOrientation() {
                        if (typeof window.onorientationchange != "undefined") {
                            if (orientation == 90 || orientation == 180) {
                                td_width = $j(td_collection).css("width");
                                product_list_width = $j(settings.product_list_wrap).css("width");
                                table_list_width = $j(settings.table_wrap).width();
                                if (td_width == "auto") {
                                    td_width = 0
                                }
                                if (product_list_width == "auto") {
                                    product_list_width = 0
                                }
                                if (table_list_width == "auto") {
                                    table_list_width = 0
                                }
                                td_width = parseInt(td_width);
                                product_list_width = parseInt(product_list_width);
                                table_list_width = parseInt(table_list_width);
                                negative_margin_by_item = (0 - td_width);
                                negative_margin_limit = (0 - (table_list_width - product_list_width))
                            }
                            if (orientation == 0 || orientation == -90) {
                                td_width = $j(td_collection).css("width");
                                product_list_width = $j(settings.product_list_wrap).css("width");
                                table_list_width = $j(settings.table_wrap).width();
                                if (td_width == "auto") {
                                    td_width = 0
                                }
                                if (product_list_width == "auto") {
                                    product_list_width = 0
                                }
                                if (table_list_width == "auto") {
                                    table_list_width = 0
                                }
                                td_width = parseInt(td_width);
                                product_list_width = parseInt(product_list_width);
                                table_list_width = parseInt(table_list_width);
                                negative_margin_by_item = (0 - td_width);
                                negative_margin_limit = (0 - (table_list_width - product_list_width))
                            }
                            $j(settings.table_wrap).css({
                                "margin-left": 0
                            });
                            $j(settings.controls_left).addClass("disable");
                            $j(settings.controls_right).removeClass("disable")
                        }
                    }
                    window.onorientationchange = detectOrientation
                }
            }

            function moveLeft() {
                if (!animation_active) {
                    animation_active = true;
                    var margin_left = parseInt($j(settings.table_wrap).css("margin-left"));
                    if (margin_left < 0) {
                        $j(settings.controls_right).removeClass("disable");
                        if (settings.quantityMove > 1) {
                            $j(settings.table_wrap).animate({
                                marginLeft: (margin_left - (negative_margin_by_item * settings.quantityMove))
                            }, 200, function () {
                                animation_active = false
                            })
                        } else {
                            $j(settings.table_wrap).animate({
                                marginLeft: (margin_left - negative_margin_by_item)
                            }, 200, function () {
                                animation_active = false
                            })
                        }
                    } else {
                        $j(settings.controls_left).addClass("disable");
                        animation_active = false
                    }
                }
            }

            function moveRight() {
                if (!animation_active) {
                    animation_active = true;
                    var margin_left = parseInt($j(settings.table_wrap).css("margin-left"));
                    if (margin_left > negative_margin_limit) {
                        $j(settings.controls_left).removeClass("disable");
                        $j(settings.table_wrap).animate({
                            marginLeft: (margin_left + (negative_margin_by_item * settings.quantityMove))
                        }, 200, function () {
                            animation_active = false
                        })
                    } else {
                        $j(settings.controls_right).addClass("disable");
                        animation_active = false
                    }
                }
            }
            $j(settings.controls_left).bind("click", function () {
                moveLeft()
            });
            $j(settings.controls_right).bind("click", function () {
                moveRight()
            });
            if ($j.browser.webkit) {
                if (navigator.userAgent.match(/iPhone/i) || navigator.userAgent.match(/iPad/i) || navigator.userAgent.match(/iPod/i)) {
                    var star_pos = null;
                    var move_direction = null;
                    settings.table_wrap[0].addEventListener("touchstart", function (event) {
                        star_pos = event.targetTouches[0].pageX
                    }, false);
                    settings.table_wrap[0].addEventListener("touchend", function (event) {
                        if (move_direction) {
                            if (move_direction == "left") {
                                moveLeft();
                                move_direction = null
                            }
                            if (move_direction == "right") {
                                moveRight();
                                move_direction = null
                            }
                        }
                    }, false);
                    $j(settings.table_wrap).bind("touchmove", function (e) {
                        e.preventDefault();
                        var touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
                        var x = touch.pageX;
                        if (star_pos) {
                            if (x < star_pos) {
                                move_direction = "right"
                            }
                            if (x > star_pos) {
                                move_direction = "left"
                            }
                        }
                    })
                }
            }
        }

        function _prepareControlsHTML() {
            var controls_wrap = $j('<div class="gpc-controls-wrap"></div>');
            var product_list_wrap = $j('<div class="product-list-wrap"></div>');
            $j(settings.table_wrap).wrap(controls_wrap);
            $j(settings.table_wrap).wrap(product_list_wrap);
            settings.controls_wrap = $j(settings.table_wrap).parent().parent();
            settings.product_list_wrap = $j(settings.table_wrap).parent();
            if (requiredControls()) {
                var controls_left = $j('<div class="controls-left"><span>Left</span></div>');
                var controls_right = $j('<div class="controls-right"><span>Right</span></div>');
                $(settings.controls_wrap).prepend(controls_left);
                $(settings.controls_wrap).append(controls_right);
                settings.controls_left = $j(controls_left, settings.controls_wrap);
                settings.controls_right = $j(controls_right, settings.controls_wrap);
                _controlsAction()
            } else {
                $j(settings.controls_wrap).addClass('no-controls');
                $j(settings.table_wrap).removeAttr('width');
            }
        }
        _initialize()
    }
})(jQuery);
$j(function () {
    if ($j(".tabs-container").length > 0) {
        $j(".tabs-container").gpTabs()
    }
    $j("#nav").gpNavDrilldown();
    $j(".top-links").gpNavDrilldown()
});
/* pp-custom-nav-drilldown.js */
$j.fn.customNavDrilldown = function (options) {
    var settings = $j.extend({
        active: true
    }, options);
    var options = $j.extend(settings, options);
    var container = this;
    var li_last = $j("<li></li>");
    li_last.addClass("last");
    var model = {
        item_empty: function (level, name, item_lnk) {
            var item_obj = $j("<li></li>").addClass("level" + level);
            var item_lnk_obj = $j("<a></a>").attr({
                href: item_lnk,
                title: name
            });
            if (level > 0) {
                var span = $j("<span></span>").text(name);
                $j(item_lnk_obj).append(span)
            } else {
                $j(item_lnk_obj).text(name)
            }
            return item_obj.append(item_lnk_obj)
        },
        processData: function (data) {
            var count = 0;
            var global_ul = $j("<ul></ul>").addClass("level0 top-level custom-top-nav");

            function setLevel(obj, level) {
                var container_div = $j("<div></div>").addClass("level" + (level + 1) + "-container");
                var content_div = $j("<div></div>").addClass("level" + (level + 1) + "-content");
                var container_ul = $j("<ul></ul>").addClass("level" + (level + 1));
                var i = 0;
                $j.each(obj, function (k, v) {
                    var item_nav = model.item_empty(level, v.n, v.i);
                    if (v.c) {
                        sub_level = (level + 1);
                        var sub_ul = setLevel(v.c, sub_level);
                        $j(item_nav).append(sub_ul)
                    } else {
                        $j(item_nav).addClass("last-level")
                    } if (level == 0) {
                        $j(item_nav).addClass("item" + i)
                    }
                    if (level > 0) {
                        container_ul.append(item_nav);
                        $j(content_div).append(container_ul);
                        $j(container_div).append(content_div)
                    } else {
                        global_ul.append(item_nav)
                    }
                    i++
                });
                if (level > 0) {
                    return container_div
                } else {
                    return global_ul
                }
            }
            var nav = setLevel(data, count);
            return nav
        }
    };
    return this.each(function () {
        var _this = this;
        $j.ajax({
            url: "/app/site/hosting/scriptlet.nl?script=259&deploy=1",
            dataType: "json",
            success: function (data) {
                var nav = model.processData(data);
                $j(nav).append(li_last);
                $j(_this).append(nav).gpNavDrilldown()
            }
        })
    })
};
$j(function () {
    $j("#dinamic-top-nav").customNavDrilldown()
});
/* gp-slide.js */
(function ($) {
    $.fn.gpSlide = function (opts) {
        var defaults = {
            "speed": 6000,
            "animationSpeed": 1000,
            "goto": true,
            "prev": false,
            "next": false,
            "responsive": true,
            "autorun": true,
            "animation": 'fade'
        };
        var opts = $.extend(defaults, opts);
        return this.each(function () {
            var self = $(this);
            var _interface = {
                create: function (obj_this) {
                    if (obj_this.hasClass('gp-slide')) {
                        return
                    }
                    obj_this.addClass('gp-slide');
                    obj_this.find('ul:first').addClass('gp-slide-items').wrap('<div class="gp-wrap-slide" />');
                    this.wrap_slide = obj_this.find('.gp-wrap-slide');
                    this.wrap_slide_items = obj_this.find('.gp-slide-items');
                    this.items = self.find('.gp-slide-items li');
                    this.total_items = this.items.length - 1;
                    if (opts.animation == 'fade') {
                        this.items.css({
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            opacity: 0
                        });
                        this.items.first().addClass('active').css({
                            'z-index': 2,
                            opacity: 1
                        })
                    }
                    if (opts.animation == 'slide') {
                        var item_width = parseInt(this.items.css('width'));
                        if (!item_width) {
                            item_width = parseInt(this.items.width())
                        }
                        var total_width = (item_width * parseInt((this.total_items + 1)));
                        this.wrap_slide_items.css({
                            width: total_width
                        });
                        this.items.css({
                            "float": 'left',
                            "width": item_width
                        });
                        this.size = item_width
                    }
                    if (opts.prev) {
                        this.wrap_slide.prepend('<div class="gp-btn-left" />')
                    }
                    if (opts.next) {
                        this.wrap_slide.append('<div class="gp-btn-right" />')
                    }
                    if (opts["goto"]) {
                        var active = ' active ims-secondary-color';
                        obj_this.append('<ul class="gp-wrap-slide-btns" />');
                        this.items.each(function (i) {
                            if (i > 0) {
                                active = ''
                            }
                            obj_this.find('.gp-wrap-slide-btns').append('<li class="btn-' + i + active + '" data-position="' + i + '">' + i + '</li>')
                        })
                    }
                    this.element_slide = obj_this;
                    this.btn_left = this.wrap_slide.find('.gp-btn-left');
                    this.btn_right = this.wrap_slide.find('.gp-btn-right');
                    this.wrap_btns = obj_this.find('.gp-wrap-slide-btns');
                    this.btn = this.wrap_btns.find('li');
                    this.current_slide = 0
                }
            };
            var interfaceNew = new _interface.create(self);
            slide = {
                "next": function (obj) {
                    if (!obj.items) {
                        return
                    }
                    if (opts["goto"]) {
                        var next_btn = (obj.current_slide + 1);
                        if (obj.current_slide + 1 > obj.total_items) {
                            next_btn = 0
                        }
                        $(obj.btn).removeClass('active').removeClass('ims-secondary-color');
                        $(obj.btn[next_btn]).addClass('active').addClass('ims-secondary-color')
                    }
                    if (opts.animation == 'fade') {
                        var active_item = obj.items.get(obj.current_slide);
                        var next_item = obj.items.get(obj.current_slide + 1);
                        if (obj.current_slide + 1 > obj.total_items) {
                            next_item = obj.items.get(0)
                        }
                        $(next_item).css({
                            'z-index': 1,
                            opacity: 1
                        });
                        $(active_item).animate({
                            opacity: 0
                        }, opts.animationSpeed, function () {
                            obj.items.removeClass('active').removeClass('ims-secondary-color').css({
                                'z-index': 'auto'
                            });
                            $(next_item).addClass('active').addClass('ims-secondary-color').css({
                                'z-index': 2
                            });
                            obj.current_slide = (obj.current_slide + 1);
                            if (obj.current_slide > obj.total_items) {
                                obj.current_slide = 0
                            }
                        })
                    }
                    if (opts.animation == 'slide') {
                        var next_item = (obj.current_slide + 1);
                        if (obj.current_slide + 1 > obj.total_items) {
                            next_item = 0
                        }
                        $(obj.wrap_slide_items).animate({
                            marginLeft: (0 - (obj.size * next_item))
                        }, opts.animationSpeed, function () {
                            obj.current_slide = (obj.current_slide + 1);
                            if (obj.current_slide > obj.total_items) {
                                obj.current_slide = 0
                            }
                        })
                    }
                },
                "prev": function (obj) {
                    if (!obj.items) {
                        return
                    }
                    if (opts["goto"]) {
                        var prev_btn = (obj.current_slide - 1);
                        if (obj.current_slide - 1 < 0) {
                            prev_btn = obj.total_items
                        }
                        $(obj.btn).removeClass('active').removeClass('ims-secondary-color');
                        $(obj.btn[prev_btn]).addClass('active').addClass('ims-secondary-color')
                    }
                    if (opts.animation == 'fade') {
                        var active_item = obj.items.get(obj.current_slide);
                        var prev_item = obj.items.get(obj.current_slide - 1);
                        if (obj.current_slide - 1 < 0) {
                            prev_item = obj.items.get(obj.total_items)
                        }
                        $(prev_item).css({
                            'z-index': 1,
                            opacity: 1
                        });
                        $(active_item).animate({
                            opacity: 0
                        }, opts.animationSpeed, function () {
                            obj.items.removeClass('active').removeClass('ims-secondary-color').css({
                                'z-index': 'auto'
                            });
                            $(prev_item).addClass('active').addClass('ims-secondary-color').css({
                                'z-index': 2
                            });
                            obj.current_slide = (obj.current_slide - 1);
                            if (obj.current_slide < 0) {
                                obj.current_slide = obj.total_items
                            }
                        })
                    }
                    if (opts.animation == 'slide') {
                        var prev_item = (obj.current_slide - 1);
                        if (obj.current_slide - 1 < 0) {
                            prev_item = obj.total_items
                        }
                        $(obj.wrap_slide_items).animate({
                            marginLeft: (0 - (obj.size * prev_item))
                        }, opts.animationSpeed, function () {
                            obj.current_slide = (obj.current_slide - 1);
                            if (obj.current_slide < 0) {
                                obj.current_slide = obj.total_items
                            }
                        })
                    }
                },
                "goto": function (pos, obj) {
                    if (!obj.items) {
                        return
                    }
                    $(obj.btn).removeClass('active').removeClass('ims-secondary-color');
                    $(obj.btn[pos]).addClass('active').addClass('ims-secondary-color');
                    if (opts.animation == 'fade') {
                        var active_item = obj.items.get(obj.current_slide);
                        var goto_item = obj.items.get(pos);
                        if (obj.current_slide == pos) {
                            return
                        }
                        $(goto_item).css({
                            'z-index': 1,
                            opacity: 1
                        });
                        $(active_item).animate({
                            opacity: 0
                        }, opts.animationSpeed, function () {
                            obj.items.removeClass('active').removeClass('ims-secondary-color').css({
                                'z-index': 'auto'
                            });
                            $(goto_item).addClass('active').addClass('ims-secondary-color').css({
                                'z-index': 2
                            });
                            obj.current_slide = pos
                        })
                    }
                    if (opts.animation == 'slide') {
                        if (obj.current_slide == pos) {
                            return
                        }
                        $(obj.wrap_slide_items).animate({
                            marginLeft: (0 - (obj.size * pos))
                        }, opts.animationSpeed, function () {
                            obj.current_slide = pos
                        })
                    }
                },
                "autorun": function (obj) {
                    var timer;

                    function run() {
                        timer = setInterval(function () {
                            slide.next(obj)
                        }, opts.speed)
                    }
                    if (opts.prev) {
                        $(obj.btn_left).hover(function () {
                            clearTimeout(timer)
                        }, function () {
                            run()
                        })
                    }
                    if (opts.next) {
                        $(obj.btn_right).hover(function () {
                            clearTimeout(timer)
                        }, function () {
                            run()
                        })
                    }
                    if (opts["goto"]) {
                        $(obj.wrap_btns).hover(function () {
                            clearTimeout(timer)
                        }, function () {
                            run()
                        })
                    }
                    run()
                }
            };
            if (opts.next) {
                $(interfaceNew.btn_right).live('click', function (e) {
                    slide.next(interfaceNew);
                    e.preventDefault()
                })
            }
            if (opts.prev) {
                $(interfaceNew.btn_left).live('click', function (e) {
                    slide.prev(interfaceNew);
                    e.preventDefault()
                })
            }
            if (opts["goto"]) {
                $(interfaceNew.btn).live('click', function (e) {
                    slide["goto"]($(this).data('position'), interfaceNew);
                    e.preventDefault()
                })
            }
            if (opts.autorun) {
                slide.autorun(interfaceNew)
            }
            if (opts.responsive) {
                $(window).resize(function (e) {
                    if (!interfaceNew.items) {
                        return
                    }
                    if (interfaceNew.wrap_slide.width() < interfaceNew.items.width() || interfaceNew.wrap_slide.width() > interfaceNew.items.width()) {
                        interfaceNew.size = interfaceNew.wrap_slide.width();
                        interfaceNew.items.width(interfaceNew.size);
                        interfaceNew.wrap_slide_items.css({
                            width: (interfaceNew.size * (interfaceNew.total_items + 1)),
                            marginLeft: 0
                        });
                        interfaceNew.current_slide = 0
                    }
                })
            }
        })
    }
})(jQuery);
$j(function () {
    if ($j('.slide-wrap ul li').length > 0) {
        $j('.slide-wrap').gpSlide()
    }
});
var GPR_COOKIES = function (A) {
    return {
        create: function (E, F, B) {
            var C = "";
            if (B) {
                var D = new Date();
                D.setTime(D.getTime() + (B * 24 * 60 * 60 * 1000));
                C = "; expires=" + D.toGMTString()
            }
            document.cookie = E + "=" + escape(F) + C + "; path=/"
        },
        read: function (C) {
            var B = "",
                D = "";
            if (document.cookie.length > 0) {
                B = document.cookie.indexOf(C + "=");
                if (B != -1) {
                    B = B + C.length + 1;
                    D = document.cookie.indexOf(";", B);
                    if (D == -1) {
                        D = document.cookie.length
                    }
                    return unescape(document.cookie.substring(B, D))
                }
            }
            return null
        },
        erase: function (B) {
            this.create(B, "", -1)
        }
    }
}(jQuery);
var GPR_OPTIONS = function (B) {
    var A = {
        loginURL: document.location,
        cartURL: document.location,
        checkoutURL: document.location,
        siteNumber: 1,
        customerId: "",
        companyId: ""
    };
    return {
        init: function (C) {
            if (C !== null && C !== undefined) {
                B.extend(A, C)
            }
        },
        options: function () {
            return A
        },
        getUrlVar: function (D) {
            var C = "[\\?&]" + D + "=([^&#]*)";
            var G = new RegExp(C);
            var F = window.location.href;
            var E = G.exec(F);
            if (E == null) {
                return ""
            } else {
                return E[1]
            }
        }
    }
}(jQuery);
var GPR_AJAX_TOOLS = function (B) {
    var A = {
        loadingImgURL: ""
    };
    return {
        init: function (C) {
            if (C !== null && C !== undefined) {
                B.extend(A, C)
            }
        },
        startLoading: function (C, D) {
            B("#" + C + " .gpr-loading").remove();
            B("#" + C + " .gpr-errors").remove();
            B("#" + C).append('<div class="gpr-loading"><span>' + D + '</span><img src="' + A.loadingImgURL + '"/></div>')
        },
        stopLoading: function (C) {
            B("#" + C + " .gpr-loading").remove();
            B("#" + C + " .gpr-errors").remove()
        },
        showError: function (C, E, F, D) {
            B("#" + C + " .gpr-loading").remove();
            B("#" + C + " .gpr-errors").remove();
            B("#" + C).append('<div class="gpr-errors">' + E + ", code: " + unescape(F) + ", details: " + unescape(D) + "</div>")
        }
    }
}(jQuery);

var GPR_TOOLS = function (C) {
    var B = {};
    var A = ["00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "0A", "0B", "0C", "0D", "0E", "0F", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "1A", "1B", "1C", "1D", "1E", "1F", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "2A", "2B", "2C", "2D", "2E", "2F", "30", "31", "32", "33", "34", "35", "36", "37", "38", "39", "3A", "3B", "3C", "3D", "3E", "3F", "40", "41", "42", "43", "44", "45", "46", "47", "48", "49", "4A", "4B", "4C", "4D", "4E", "4F", "50", "51", "52", "53", "54", "55", "56", "57", "58", "59", "5A", "5B", "5C", "5D", "5E", "5F", "60", "61", "62", "63", "64", "65", "66", "67", "68", "69", "6A", "6B", "6C", "6D", "6E", "6F", "70", "71", "72", "73", "74", "75", "76", "77", "78", "79", "7A", "7B", "7C", "7D", "7E", "7F", "80", "81", "82", "83", "84", "85", "86", "87", "88", "89", "8A", "8B", "8C", "8D", "8E", "8F", "90", "91", "92", "93", "94", "95", "96", "97", "98", "99", "9A", "9B", "9C", "9D", "9E", "9F", "A0", "A1", "A2", "A3", "A4", "A5", "A6", "A7", "A8", "A9", "AA", "AB", "AC", "AD", "AE", "AF", "B0", "B1", "B2", "B3", "B4", "B5", "B6", "B7", "B8", "B9", "BA", "BB", "BC", "BD", "BE", "BF", "C0", "C1", "C2", "C3", "C4", "C5", "C6", "C7", "C8", "C9", "CA", "CB", "CC", "CD", "CE", "CF", "D0", "D1", "D2", "D3", "D4", "D5", "D6", "D7", "D8", "D9", "DA", "DB", "DC", "DD", "DE", "DF", "E0", "E1", "E2", "E3", "E4", "E5", "E6", "E7", "E8", "E9", "EA", "EB", "EC", "ED", "EE", "EF", "F0", "F1", "F2", "F3", "F4", "F5", "F6", "F7", "F8", "F9", "FA", "FB", "FC", "FD", "FE", "FF"];
    return {
        init: function (D) {
            if (D !== null && D !== undefined) {
                C.extend(B, D)
            }
        },
        uncode: function (D) {
            var E = "";
            for (i = 0; i < D.length; i++) {
                E += "%" + A[D.charCodeAt(i)]
            }
            return E
        }
    }
}(jQuery);
var _gprCommon = function ($) {
    var objCommonOptions = {
        loginURL: document.location,
        cartURL: document.location,
        checkoutURL: document.location,
        siteNumber: 1,
        customerId: "",
        companyId: ""
    };
    var arrDecToHex = ["00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "0A", "0B", "0C", "0D", "0E", "0F", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "1A", "1B", "1C", "1D", "1E", "1F", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "2A", "2B", "2C", "2D", "2E", "2F", "30", "31", "32", "33", "34", "35", "36", "37", "38", "39", "3A", "3B", "3C", "3D", "3E", "3F", "40", "41", "42", "43", "44", "45", "46", "47", "48", "49", "4A", "4B", "4C", "4D", "4E", "4F", "50", "51", "52", "53", "54", "55", "56", "57", "58", "59", "5A", "5B", "5C", "5D", "5E", "5F", "60", "61", "62", "63", "64", "65", "66", "67", "68", "69", "6A", "6B", "6C", "6D", "6E", "6F", "70", "71", "72", "73", "74", "75", "76", "77", "78", "79", "7A", "7B", "7C", "7D", "7E", "7F", "80", "81", "82", "83", "84", "85", "86", "87", "88", "89", "8A", "8B", "8C", "8D", "8E", "8F", "90", "91", "92", "93", "94", "95", "96", "97", "98", "99", "9A", "9B", "9C", "9D", "9E", "9F", "A0", "A1", "A2", "A3", "A4", "A5", "A6", "A7", "A8", "A9", "AA", "AB", "AC", "AD", "AE", "AF", "B0", "B1", "B2", "B3", "B4", "B5", "B6", "B7", "B8", "B9", "BA", "BB", "BC", "BD", "BE", "BF", "C0", "C1", "C2", "C3", "C4", "C5", "C6", "C7", "C8", "C9", "CA", "CB", "CC", "CD", "CE", "CF", "D0", "D1", "D2", "D3", "D4", "D5", "D6", "D7", "D8", "D9", "DA", "DB", "DC", "DD", "DE", "DF", "E0", "E1", "E2", "E3", "E4", "E5", "E6", "E7", "E8", "E9", "EA", "EB", "EC", "ED", "EE", "EF", "F0", "F1", "F2", "F3", "F4", "F5", "F6", "F7", "F8", "F9", "FA", "FB", "FC", "FD", "FE", "FF"];
    return {
        init: function (obj) {
            $.extend(objCommonOptions, (obj || {}))
        },
        options: function () {
            return objCommonOptions
        }(),
        popUp: function () {
            var objOptions = {
                fade: 500,
                winTimeOut: 7000
            };

            function createPopUp(strMsg) {
                $(".gpr-pup-win").remove();
                $("body").append('<div class="gpr-pup-win">' + strMsg + "</div>");
                $(".gpr-pup-win").fadeTo(0, 0);
                $(".gpr-pup-win").append('<div class="gpr-pup-close">X Close</div>');
                $(".gpr-pup-win").fadeTo(objOptions.fade, 1);
                $(".gpr-pup-close").click(function () {
                    $(".gpr-pup-win").fadeTo(objOptions.fade, 0, function () {
                        $(".gpr-pup-win").remove()
                    })
                })
            }
            return {
                init: function (obj) {
                    $.extend(objOptions, (obj || {}))
                },
                show: function (strMsg) {
                    createPopUp(strMsg);
                    setTimeout(function () {
                        $(".gpr-pup-win").fadeTo(objOptions.fade, 0, function () {
                            $(".gpr-pup-win").remove()
                        })
                    }, objOptions.winTimeOut)
                },
                showModal: function (strMsg) {
                    createPopUp(strMsg)
                },
                hideModal: function () {
                    $(".gpr-pup-win").fadeTo(objOptions.fade, 0, function () {
                        $(".gpr-pup-win").remove()
                    })
                }
            }
        }(),
        cookies: function () {
            return {
                create: function (strName, strValue, intDays) {
                    var strExpires = "";
                    if (intDays) {
                        var dteDate = new Date();
                        dteDate.setTime(dteDate.getTime() + (intDays * 24 * 60 * 60 * 1000));
                        strExpires = "; expires=" + dteDate.toGMTString()
                    }
                    document.cookie = strName + "=" + (escape(strValue)).trim() + strExpires + "; path=/"
                },
                read: function (strName) {
                    var strStart = "",
                        strEnd = "";
                    if (document.cookie.length > 0) {
                        strStart = document.cookie.indexOf(strName + "=");
                        if (strStart != -1) {
                            strStart = strStart + strName.length + 1;
                            strEnd = document.cookie.indexOf(";", strStart);
                            if (strEnd == -1) {
                                strEnd = document.cookie.length
                            }
                            var strValue = (unescape(document.cookie.substring(strStart, strEnd))).trim();
                            if (strValue.length > 0) {
                                return strValue
                            } else {
                                return null
                            }
                        }
                    }
                    return null
                },
                erase: function (strName) {
                    this.create(strName, "", -1)
                }
            }
        }(),
        getUrlVar: function (name) {
            var regexS = "[\\?&]" + name + "=([^&#]*)";
            var regex = new RegExp(regexS);
            var tmpURL = window.location.href;
            var results = regex.exec(tmpURL);
            if (results == null) {
                return ""
            } else {
                return results[1]
            }
        },
        ajax: function () {
            var objOptions = {
                loadingStateHtml: "",
                follower: null,
                loadingIconHeight: 32,
                loadingIconWidth: 32
            };

            function _startLoading() {
                objOptions.follower.css("display", "block")
            }

            function _stopLoading() {
                objOptions.follower.css("display", "none")
            }
            return {
                init: function (obj) {
                    $.extend(objOptions, (obj || {}));
                    objOptions.follower.html(objOptions.loadingStateHtml).ajaxStart(function () {
                        _startLoading()
                    }).ajaxStop(function () {
                        _stopLoading()
                    });
                    $(document).bind("mousemove", function (e) {
                        objOptions.follower.css({
                            top: (e.pageY - objOptions.loadingIconHeight) + "px",
                            left: (e.pageX - objOptions.loadingIconWidth) + "px"
                        })
                    })
                },
                showError: function (strCntId, strSource, strCode, strDetails) {
                    $("#" + strCntId + " .gpr-loading").remove();
                    $("#" + strCntId + " .gpr-errors").remove();
                    $("#" + strCntId).append('<div class="gpr-errors">' + strSource + ", code: " + unescape(strCode) + ", details: " + unescape(strDetails) + "</div>")
                }
            }
        }(),
        addToCart: function () {
            var _url = "/app/site/backend/additemtocart.nl",
                _account = null;

            function Item(id, category, qty, opts) {
                this.id = id;
                this.category = category;
                this.qty = qty;
                this.opts = opts
            }
            Item.prototype.hasOptions = function () {
                return this.opts != null
            };

            function makeSyncAjaxRequest(d) {
                var _callback = function () {};
                if (arguments.length > 1) {
                    _callback = arguments[1]
                }
                $.ajax({
                    type: "POST",
                    url: _url,
                    cache: false,
                    data: d,
                    error: function (XMLHttpRequest) {
                        throw new Error("Failed attempt to add items to the shopping cart.")
                    },
                    complete: _callback
                })
            }
            return {
                getItemInstanceFromForm: function (objForm) {
                    var elems = objForm.elements;
                    with(elems) {
                        var _id = buyid.value,
                            _qty = qty.value,
                            _cat = category.value
                    }
                    var _sel = $(elems).filter("[name^=custcol]"),
                        _opts = null;
                    if (_sel.length) {
                        _opts = {};
                        for (var i = 0; i < _sel.length; i++) {
                            if (_sel[i].getAttribute("type") == "checkbox") {
                                _opts[_sel[i].name] = _sel[i].checked ? "T" : "F"
                            } else {
                                _opts[_sel[i].name] = _sel[i].value
                            }
                        }
                    }
                    return this.getItemInstance(_id, _qty, _cat, _opts)
                },
                getItemInstance: function (id, qty, category) {
                    var options = (arguments.length > 3) ? arguments[3] : null;
                    return new Item(id, category, qty, options)
                },
                addToCart: function (arrItems) {
                    if (_account === null) {
                        throw new Error("Account number is not set.")
                    }
                    var data = {
                        c: _account
                    };
                    data.buyid = "multi";
                    var arrMulti = [];
                    for (var i = 0; i < arrItems.length; i++) {
                        var arrItem = [];
                        var arrOpts = [];
                        arrItem.push(arrItems[i].id);
                        arrItem.push(arrItems[i].qty);
                        if (arrItems[i].hasOptions()) {
                            for (var opname in arrItems[i].opts) {
                                var arrOpt = [];
                                var value = arrItems[i].opts[opname];
                                if (value != "" && value != null && value != undefined) {
                                    value = value.replace(",", "-").replace("|", "-").replace(";", "-");
                                    arrOpt.push(opname);
                                    arrOpt.push(value);
                                    arrOpts.push(arrOpt.join("|"))
                                }
                            }
                            if (arrOpts.length) {
                                arrItem.push(arrOpts.join("||"))
                            }
                        }
                        if (arrItem.length) {
                            arrMulti.push(arrItem.join(","))
                        }
                    }
                    if (arrMulti.length) {
                        data.multi = arrMulti.join(";");
                        if ((arguments.length > 1) && (typeof arguments[1] == "function")) {
                            makeSyncAjaxRequest(data, arguments[1])
                        } else {
                            makeSyncAjaxRequest(data)
                        }
                    }
                },
                setAccountNumber: function (c) {
                    if (_account === null) {
                        _account = c
                    }
                }
            }
        }(),
        uncode: function (strText) {
            var strCoded = "";
            for (i = 0; i < strText.length; i++) {
                strCoded += "%" + arrDecToHex[strText.charCodeAt(i)]
            }
            return strCoded
        }
    }
}(jQuery);
if (typeof String.prototype.trim != "function") {
    String.prototype.trim = function () {
        return this.replace(/^\s+|\s+$/g, "")
    }
}
if (typeof String.prototype.capitalize != "function") {
    String.prototype.capitalize = function () {
        return this.replace(/(^|\s)([a-z])/g, function (A, C, B) {
            return C + B.toUpperCase()
        })
    }
}
if (typeof Number.prototype.formatMoney != "function") {
    Number.prototype.formatMoney = function (G, E, C) {
        var F = this,
            G = isNaN(G = Math.abs(G)) ? 2 : G,
            E = E == undefined ? "," : E,
            C = C == undefined ? "." : C,
            D = F < 0 ? "-" : "",
            B = parseInt(F = Math.abs(+F || 0).toFixed(G)) + "",
            A = (A = B.length) > 3 ? A % 3 : 0;
        return D + (A ? B.substr(0, A) + C : "") + B.substr(A).replace(/(\d{3})(?=\d)/g, "$1" + C) + (G ? E + Math.abs(F - B).toFixed(G).slice(2) : "")
    }
}

var GPR_AAE_RVI = function (C) {
    var B = {
        getItemsURL: "/app/site/hosting/scriptlet.nl?script=customscript_gpr_aae_ss_rvi_getitems&deploy=customdeploy_gpr_aae_ss_rvi_getitems",
        itemsCntId: "rvi_cnt_items",
        showInfoCntId: "rvi_info",
        msgs: ["Item was added successfully.", "Item already added", "Invalid parameters sent, please contact the administrator...", "Wish List disable, please contact the administrator..."]
    };

    function A(D) {
        GPR_PUP.show(D)
    }
    return {
        init: function (D) {
            if (D !== null && D !== undefined) {
                C.extend(B, D)
            }
        },
        getItems: function () {
            var G = GPR_COOKIES.read("rvi_n" + GPR_OPTIONS.options().siteNumber);
            if (G !== "" && G != null) {
                var I = [];
                var H = G.split(",");
                for (var E = 0; E < H.length; E++) {
                    if (H[E] == null || H[E] == "") {
                        H.splice(E, 1);
                        E--
                    } else {
                        var J = C("form");
                        for (var F = 0; F < J.length; F++) {
                            if (C(J[F]).attr("id") == "form" + H[E]) {
                                I.push(H[E]);
                                break
                            }
                        }
                    }
                }
                var D = I.join();
                var G = H.join();
                var K = {
                    items: G,
                    itemsnocart: D,
                    sitenumber: GPR_OPTIONS.options().siteNumber
                };
                C.ajax({
                    url: B.getItemsURL + "&callback=?",
                    type: "GET",
                    dataType: "jsonp",
                    data: K,
                    success: function (L) {
                        if (L.Errors.length > 0) {
                            C.each(L.Errors, function (M, N) {
                                GPR_AJAX_TOOLS.showError(B.showInfoCntId + "_items", "Show Items", N.code, N.details)
                            })
                        } else {
                            H = L.Items;
                            C("#" + B.itemsCntId).html(unescape(L.Results.html));
                            C(".rvi_item").hide();
                            C.each(L.Items, function (M, N) {
                                C.ajax({
                                    url: unescape(N.url),
                                    type: "GET",
                                    dataType: "html",
                                    success: function (W) {
                                        var R = W;
                                        strStart = "<!--BEGIN_GPR_SALESPRICE";
                                        strEnd = "END_GPR_SALESPRICE-->";
                                        intI = R.indexOf(strStart);
                                        intF = R.indexOf(strEnd);
                                        var U = "&nbsp;";
                                        if (intI != -1 && intF != -1) {
                                            intI += strStart.length;
                                            U = R.substring(intI, intF)
                                        }
                                        C("#rvi_price_" + N.internalid).html(unescape(U));
                                        strStart = "<!--BEGIN_GPR_STKMESSAGE";
                                        strEnd = "END_GPR_STKMESSAGE-->";
                                        intI = R.indexOf(strStart);
                                        intF = R.indexOf(strEnd);
                                        var S = "";
                                        if (intI != -1 && intF != -1) {
                                            intI += strStart.length;
                                            S = R.substring(intI, intF)
                                        }
                                        C("#rvi_stkmessage_" + N.internalid).html(unescape(S));
                                        strStart = "<!--BEGIN_GPR_ITEMOPTIONS";
                                        strEnd = "END_GPR_ITEMOPTIONS-->";
                                        intI = R.indexOf(strStart);
                                        intF = R.indexOf(strEnd);
                                        var Q = "";
                                        if (intI != -1 && intF != -1) {
                                            intI += strStart.length;
                                            Q = R.substring(intI, intF)
                                        }
                                        strStart = "<!--BEGIN_GPR_ADDTOCARTITEMID";
                                        strEnd = "END_GPR_ADDTOCARTITEMID-->";
                                        intI = R.indexOf(strStart);
                                        intF = R.indexOf(strEnd);
                                        var T = "&nbsp;";
                                        if (intI != -1 && intF != -1) {
                                            intI += strStart.length;
                                            T = R.substring(intI, intF)
                                        }
                                        strStart = "<!--BEGIN_GPR_ADDTOCARTQTY";
                                        strEnd = "END_GPR_ADDTOCARTQTY-->";
                                        intI = R.indexOf(strStart);
                                        intF = R.indexOf(strEnd);
                                        var P = "&nbsp;";
                                        if (intI != -1 && intF != -1) {
                                            intI += strStart.length;
                                            P = R.substring(intI, intF)
                                        }
                                        if (!N.nocart && C("#wlp_cnt_items").length <= 0) {
                                            C(".rvi_item #form" + N.internalid + " #rvi_ops_" + N.internalid).prepend(unescape(Q + T));
                                            C(".rvi_item #form" + N.internalid + " #rvi_qty_" + N.internalid).prepend(unescape(P));
                                            strStart = "<!--BEGIN_GPR_ADDTOCARTCLICKSCRIPT";
                                            strEnd = "END_GPR_ADDTOCARTCLICKSCRIPT-->";
                                            intI = R.indexOf(strStart);
                                            intF = R.indexOf(strEnd);
                                            var V = "#";
                                            if (intI != -1 && intF != -1) {
                                                intI += strStart.length;
                                                V = R.substring(intI, intF)
                                            }
                                            C("#rvi_addtocart_img_" + N.internalid).click(function () {
                                                if (document.forms["form" + N.internalid].onsubmit()) {
                                                    document.forms["form" + N.internalid].submit()
                                                }
                                            });
                                            strStart = "<!--BEGIN_GPR_ADDTOCARTSUBMITSCRIPT";
                                            strEnd = "END_GPR_ADDTOCARTSUBMITSCRIPT-->";
                                            intI = R.indexOf(strStart);
                                            intF = R.indexOf(strEnd);
                                            var O = "#";
                                            if (intI != -1 && intF != -1) {
                                                intI += strStart.length;
                                                O = R.substring(intI, intF)
                                            }
                                            C("#rvi_addtocart_onsubmit_" + N.internalid).html(unescape(O))
                                        } else {
                                            C("#rvi_addtocart_" + N.internalid).remove();
                                            C("#rvi_price_" + N.internalid).find('span[id^="itemprice"]').attr("id", "");
                                            C("#rvi_stkmessage_" + N.internalid).find('span[id^="itemavail"]').attr("id", "")
                                        }
                                        C("#rvi_item_" + N.internalid).fadeIn(500)
                                    },
                                    beforeSend: function (O) {
                                        GPR_AJAX_TOOLS.startLoading(B.showInfoCntId + "_items", "Getting Item Info...")
                                    },
                                    complete: function (O, P) {
                                        GPR_AJAX_TOOLS.stopLoading(B.showInfoCntId + "_items")
                                    },
                                    error: function (O, Q, P) {
                                        GPR_AJAX_TOOLS.showError(B.showInfoCntId + "_items", "Get Item Info", Q, P)
                                    }
                                })
                            })
                        }
                    },
                    beforeSend: function (L) {
                        GPR_AJAX_TOOLS.startLoading(B.showInfoCntId + "_items", "Getting Items...")
                    },
                    complete: function (L, M) {
                        GPR_AJAX_TOOLS.stopLoading(B.showInfoCntId + "_items")
                    },
                    error: function (L, N, M) {
                        GPR_AJAX_TOOLS.showError(B.showInfoCntId + "_items", "Get Items", N, M)
                    }
                })
            }
        },
        saveItem: function (I) {
            var D = "";
            var H = "";
            var E = false;
            if (I !== "") {
                var H = GPR_COOKIES.read("rvi_n" + GPR_OPTIONS.options().siteNumber);
                if (H == null) {
                    D = I
                } else {
                    var G = H.split(",");
                    for (var F = 0; F < G.length; F++) {
                        if (I == G[F]) {
                            E = true;
                            break
                        }
                    }
                    if (!E) {
                        D = I + "," + H
                    } else {
                        D = H
                    }
                }
                GPR_COOKIES.create("rvi_n" + GPR_OPTIONS.options().siteNumber, D, 10)
            }
        }
    }
}(jQuery);

/* mct and initialization script */
GPR_AAE_MCT = function ($) {
    var objOptions = {
            itemsCntId: "mct_cnt_items",
            showInfoCntId: "mct_info",
            urlParamId: "_upditm",
            maxItems: 3,
            imagePos: 1,
            namePos: 2,
            qtyPos: 3,
            descriptionPos: 4,
            optionsPos: 5,
            pricePos: 6
        },
        bolViewMore = false;

    function removeItem() {
        //Removes an item from the shopping cart.
        //Used only by the minicart remove buttons.
        //'this' references to the remove button
        $($(this).parents("li")[0]).find("input").val(0);
        updateCart();
    }

    function updateCart() {
        var arrUpdateItems = [];
        $('#' + objOptions.itemsCntId + ' input').each(function () {
            var arrItem = [];
            arrItem.push($(this).attr("id"));
            arrItem.push($(this).val());
            arrUpdateItems.push(arrItem);
        });
        $("#mct_updcart").remove();
        var objIframe = $('<iframe>');
        var strCartURL = GPR_OPTIONS.options().cartURL
        var strOption = "?";
        if (strCartURL.indexOf('?') != -1) {
            strOption = "&"
        }
        objIframe.attr("src", GPR_OPTIONS.options().cartURL + strOption + objOptions.urlParamId + "=" + escape(arrUpdateItems.join(';')));
        objIframe.attr("id", "mct_updcart");
        objIframe.css("display", "none");
        objIframe.appendTo("#div__header");
        objIframe.load(function () {
            window.location.reload();
        })
    }
    return {
        init: function (obj) {
            if (obj !== null && obj !== undefined) {
                $.extend(objOptions, obj);
            }
        },

        getItems: function () {
            if (!$(".container-mini-cart").length)
                return;
            $.ajax({
                url: '/s.nl?sc=3',
                //GPR_OPTIONS.options().cartURL,
                type: "GET",
                success: function (data) {
                    var arrItems = [];
                    var objItemsMap = {};
                    var ul = $('<ul>').attr({
                        'id': 'mct_list',
                        'class': 'item-list'
                    }).hide();
                    $(data).find("tr[id^=carttablerow]").each(function (i) {
                        if (i > 4) //Always show up to 5 items
                            return false;
                        var li = $('<li>');
                        li.attr('id', 'mct_list_item' + i);
                        $(".mct .cell_template").children().clone().appendTo(li);
                        li.find(".cell-image").append('<p>' + $(this).children(':nth-child(' + objOptions.imagePos + ')').html() + '</p>');
                        li.find(".cell-name").append($(this).children(':nth-child(' + objOptions.namePos + ')').html());
                        li.find(".cell-price").append($(this).children(':nth-child(' + objOptions.pricePos + ')').html());
                        var itemID = li.find(".cell-qty").append('<p>' + $(this).children(':nth-child(' + objOptions.qtyPos + ')').html() + '</p>').find("input").attr("readonly", "readonly").attr("id");
                        if (this.children[7].innerHTML.indexOf("Initial:") != -1) {
                            itemID = /(\d+)/.exec(itemID)[0];
                            arrItems.push(itemID);
                            objItemsMap[itemID] = i;
                        }
                        li.find(".cell-options").append($(this).children(':nth-child(' + objOptions.optionsPos + ')').html());
                        li.find(".remove-item").bind("click", removeItem);
                        li.appendTo(ul);
                    });
                    if (arrItems.length)
                        $.ajax({
                            "url": "/app/site/hosting/scriptlet.nl?script=customscript_pp_ss_items_names&deploy=customdeploy_pp_ss_items_names",
                            "data": {
                                "_ids": arrItems.join(",")
                            },
                            "dataType": "JSON",
                            "success": function (objData) {
                                for (var key in objData) {
                                    var i = objItemsMap[key];
                                    ul.children(":eq(" + i + ")").find(".cell-name a").html(objData[key]);
                                }
                                ul.show();
                            }
                        });
                    else
                        ul.show();
                    $('#' + objOptions.itemsCntId).empty().append(ul);
                    var items = $('.mini-cart a:eq(0)').text();
                    var items_text = "item";
                    if (items > 1)
                        items_text += "s";
                    $(".mc-foot-content").css("text-align", "center").html('<a href="' + GPR_OPTIONS.options().cartURL + '">View Cart (' + items + ') ' + items_text + '</a>');
                    $('#' + objOptions.itemsCntId).fadeIn(1000);
                },
                beforeSend: function (XMLHttpRequest) {
                    GPR_AJAX_TOOLS.startLoading(objOptions.showInfoCntId, 'Getting Cart Items...');
                },
                complete: function (XMLHttpRequest, textStatus) {
                    GPR_AJAX_TOOLS.stopLoading(objOptions.showInfoCntId);
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    GPR_AJAX_TOOLS.showError(objOptions.showInfoCntId, 'Get Cart Items', textStatus, errorThrown);
                }
            });
        },
        updateCart: function () {
            var strUpdateItems = unescape(GPR_OPTIONS.getUrlVar(objOptions.urlParamId));
            if (strUpdateItems !== "") {
                var arrUpdateItems = strUpdateItems.split(';');
                for (var i = 0; i < arrUpdateItems.length; i++) {
                    var arrItem = arrUpdateItems[i].split(',');
                    $('input#' + arrItem[0]).val(arrItem[1]);
                };
                $('form#cart').submit();
            }
        }
    }
}(jQuery);

(function (a) {
    a(window).load(function () {
        var d = a(".top-links .mini-cart"),
            c = d.offset(),
            h = null,
            i = 1000,
            f = a(".rollover_mct");
        var e = a("#nav .mini-cart");

        function j() {
            f.slideUp("slow");
            clearInterval(h);
            h = null
        }
        d.hover(function () {
            if (h === null) {
                f.slideDown("slow")
            } else {
                clearTimeout(h)
            }
        }, function () {
            h = setTimeout(j, i)
        });
        e.hover(function () {
            if (h === null) {
                f.slideDown("slow")
            } else {
                clearTimeout(h)
            }
        }, function () {
            h = setTimeout(j, i)
        });
        f.hover(function () {
            clearTimeout(h)
        }, function () {
            h = setTimeout(j, i)
        });
        var g = parseInt(d.children().text());
        if (g) {
            GPR_AAE_MCT.getItems()
        }
        var b = parseInt(GPR_COOKIES.read("mct_items"));
        if (g > b) {
            d.mouseover();
            h = setTimeout(j, i * 5)
        }
        GPR_COOKIES.create("mct_items", g)
    })
})(jQuery);
/* __pp-navigation-fixed.js */
$j(function () {
    user_agent = navigator.userAgent.toLowerCase();
    navfixtop = {
        scroll_top: null,
        scrolling: function (obj) {
            $j(window).scroll(function (e) {
                if ($j(this).scrollTop() > navfixtop.scroll_top) {
                    obj.addClass("fixed-nav");
                    $j(".container-mini-cart").addClass("fixed-cart")
                } else {
                    if ($j(this).scrollTop() < navfixtop.scroll_top) {
                        obj.removeClass("fixed-nav");
                        $j(".container-mini-cart").removeClass("fixed-cart")
                    }
                }
            })
        }
    };
    var flag_searchfix = 0;
    $j("#nav .top-nav li.search .src-btn").css({
        cursor: "pointer"
    }).click(function () {
        if (flag_searchfix == 0) {
            console.log(flag_searchfix);
            $j("#nav li.search .search-drilldown").css({
                display: "block"
            });
            flag_searchfix = 1;
            return
        }
        if (flag_searchfix == 1) {
            console.log(flag_searchfix);
            $j("#nav li.search .search-drilldown").css({
                display: "none"
            });
            flag_searchfix = 0;
            return
        }
    })
});
/* pp-color-hover.js */
$j(function () {
    color_hover = {
        int_w: null,
        count_elements: null,
        total_w: null,
        hover: function (element, collection) {
            largein = false;
            element.hover(function () {
                if (largein) {
                    return
                }
                largein = true;
                each_w = (((color_hover.total_w - color_hover.int_w) - (95 - color_hover.int_w)) / (color_hover.count_elements - 1));
                collection.not(this).animate({
                    width: each_w
                });
                $j(this).animate({
                    width: "95px"
                });
                $j(this).find("span").css({
                    opacity: 0,
                    display: "block"
                }).animate({
                    opacity: 1
                }, 100)
            }, function () {
                $j(this).stop();
                $j(this).find("span").css({
                    display: "none"
                });
                collection.stop();
                collection.css({
                    width: color_hover.int_w
                });
                largein = false
            })
        }
    };
    color_hover.int_w = $j(".color-nav li").width();
    color_hover.count_elements = $j(".color-nav li").length;
    color_hover.total_w = (color_hover.int_w * color_hover.count_elements);
    $j(".color-nav li").each(function () {
        color_hover.hover($j(this), $j(".color-nav li"))
    })
});
/* ns_helper.js */
function isDef(x) {
    return (typeof x !== "undefined")
}

function isBool(x) {
    return (isDef(x) && typeof x === "boolean")
}

function isNull(x) {
    return (isDef(x) && x === null)
}

function isEmpty(x) {
    return (!isNull(x) && x.toString().replace(/\s/gi, "") === "")
}

function process_url(url, processor) {
    $j.ajax({
        url: url,
        type: "GET",
        dataType: "html",
        success: function (msg) {
            processor(msg)
        },
        complete: function (XMLHttpRequest, textStatus) {},
        beforeSend: function (XMLHttpRequest) {},
        error: function (XMLHttpRequest, textStatus, errorThrown) {}
    })
}

function delete_img_tags(html) {
    return html.toString().replace(/\<img.+?\>/gi, "")
}

function depurate_html(html, kill_imgs) {
    var code = html.split("</head>")[1].split("</body>")[0].replace(/<body(?:\s+(?:.|\s)*?)?>/ig, "").replace(/(\<script)\s*[^\>]*\>([^\<]*\<\/script>)?/gi, "").replace(/(\<iframe)\s*[^\>]*\>([^\<]*\<\/iframe>)?/gi, "").replace(/(\<form)\s*[^\>]*\>([^\<]*\<\/form>)?/gi, "").replace(/(\<select)\s*[^\>]*\>([^\<]*\<\/select>)?/gi, "").replace(/<\/form>|<\/select>|<\/script>/gi, "").replace(/(\<option)\s*[^\>]*\>([^\<]*\<\/option>)?/gi, "");
    if (isDef(kill_imgs) && kill_imgs) {
        code = delete_img_tags(code)
    }
    return code
}

function html_to_object(html, id) {
    return $j(depurateHTML(html)).find(id)
}

function tabs_switcher(contents, labels) {
    var tabs = $j(contents);
    var labels = $j(labels);
    tabs.hide();
    labels.click(function () {
        tabs.hide();
        tabs.filter($j(this).find("a").attr("href")).show();
        labels.removeClass("active previous");
        $j(this).addClass("active");
        $j(this).prev().addClass("previous");
        return false
    }).filter(":first").click();
    if (tabs.length == 1) {
        tabs.addClass("first")
    }
}

function change_NS_search(wrapper, label, input, button, strict) {
    var input = $j(input, wrapper);
    var button = $j(button, wrapper);
    var label = $j(label, wrapper).text();
    var it_label = (typeof strict != "undefined") ? strict : label;
    $j(button).attr({
        value: label
    });
    $j(input).addClass("blur").attr({
        value: it_label
    }).focus(function () {
        $j(this).attr({
            value: ""
        }).removeClass("blur").addClass("focus");
        if ($j.browser.webkit) {
            if (navigator.userAgent.match(/iPhone/i) || navigator.userAgent.match(/iPad/i) || navigator.userAgent.match(/iPod/i)) {
                $j(document).get(0).addEventListener("touchstart", function (event) {
                    $j(input).blur()
                }, false)
            }
        }
    }).blur(function () {
        if ($j(this).attr("value") == "") {
            $j(this).attr({
                value: it_label
            }).removeClass("focus").addClass("blur")
        }
    }).keyup(function (event) {
        if (event.keyCode == 13) {
            $j(button).click()
        }
    })
}

function init_input_textfield(selector, value) {
    var field = $j(selector);
    if (field.length) {
        field.focus(function () {
            if ($j(this).attr("value") == value) {
                $j(this).attr("value", "")
            }
        }).blur(function () {
            if ($j(this).attr("value") == "") {
                $j(this).attr("value", value)
            }
        }).attr("value", value)
    }
}

function random_cell_order(source, cell, target, items, cols, wrapper) {
    var cells = $j(cell, source).clone();
    var count = cells.length > 50 ? 50 : cells.length;
    var n = isNaN(items) ? count : items > count ? 4 : Math.abs(items);
    var c = isNaN(cols) ? n : cols > n ? n : Math.abs(cols);
    if (count > 1) {
        var disordered = (function listRand(min, max) {
            var rand = new Array();
            for (var x = min; x <= max; x++) {
                rand.push(x)
            }
            return !isNull(jQuery.shuffle) ? jQuery.shuffle(rand) : rand
        })(0, count - 1);
        for (var d = 1; d < n; d++) {
            $j(cells[disordered[d - 1]]).addClass(d && !(d % c) ? "lastCol" : "").appendTo($j(target))
        }
        $j(source).remove()
    } else {
        if (count < 1 && !isNull(wrapper)) {
            $j(wrapper).remove()
        }
    }
}

function check_lists_lines(list, line, value, del) {
    var list = $j(list);
    del = isBool(del) ? del : true;
    if (list.length) {
        $j(line, list).each(function () {
            if ($j(this).find(value + ":empty").length && del) {
                $j(this).remove()
            }
        });
        return $j(line, list).length ? true : (function (list) {
            if (del) {
                list.remove()
            }
            return false
        })(list)
    }
    return false
};