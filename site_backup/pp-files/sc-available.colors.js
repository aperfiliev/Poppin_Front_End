$j(function($) {
	available_colors_hover = {
		rgb2hex : function(rgb) {
			rgb = rgb.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+))?\)$/);
			function hex(x) {
				return ("0" + parseInt(x).toString(16)).slice(-2);
			}

			return hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
		},
		create : function(element) {
			txt = $('a', element).attr('title');
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
	var colors = $('#available-colors-list li').each(function(i) {
		var _this = $(this);
		var _id = _this.data('colorid');
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
				"script" : "customscript_available_colors_ths",
				"deploy" : "customdeploy_available_colors_ths",
				"_ids" : arrIds.join()
			},
			"dataType" : "json",
			"success" : function(objData) {
				var _id = null;
				for (_id in objData) {
					var li = $(colors[objIdsPos[_id]]);
					li.children().css("background-image", "url(" + objData[_id] + ")");
					available_colors_hover.create(li);
					available_colors_hover.hover(li);
					objIdsPos[_id] = undefined;
				}
				for (_remaining in objIdsPos)
					$(colors[objIdsPos[_remaining]]).remove();
				colors = undefined;
				if (_id)
					$('.product-page .available-colors-block').show();
			},
			"error" : function(e) {
				if (window.console)
					console.debug(e);
			}
		});
});