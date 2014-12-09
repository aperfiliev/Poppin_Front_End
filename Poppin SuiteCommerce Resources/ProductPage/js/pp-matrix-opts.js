(function($) {
	$.fn.scCutsomOptions = function(options) {
		var settings = $.extend({
			base_url : '/',
			folder : 'site/pp-initials/',
			format : '.png',
			image_url : null,
			table_data_opts : '.table-data-options',
			options_container : '.options-container',
			addcart_wrap : '.addcart-wrap'
		}, options);

		var options = $.extend(settings, options);
		settings.image_url = settings.base_url + settings.folder;
		colors = {
			change : function(element, select_obj) {
				$(select_obj).val(element.data('val'));
				element.addClass('selected');
			},

			imageName : function(name) {
				return name.replace(/\s/g, "-");
			}
		};
		return this.each(function() {
			var select_obj = this;
			var table_container = $(select_obj).closest(settings.table_data_opts);
			var options_container = $(table_container).parent(settings.options_container);
			var color_list = $('<ul class="colors-list"></ul>');
			var btn_cart_wrap = $(options_container).parent().find(settings.addcart_wrap);
			$(select_obj).val('');
			var selected_indicator = $("<div class='selected_circle' style='display:none;width:57px;height:57px;position:absolute;background:url(//poppin.imgix.net/pp-initials/selected.png)'></div>");
			$(options_container).append(color_list).append(selected_indicator);
			$(btn_cart_wrap).addClass('block-btn').append('<span class="block-btn-over"></span>');
			var collection = $();
			$('option', select_obj).each(function() {
				if ($(this).val() != '') {
					value = $(this).val();
					name = $(this).text();
					html = $('<li>' + name + '</li>');
					html.data({
						val : value,
						name : name
					});
					collection = collection.add(html);
				}
			});
			$(color_list).html(collection);
			$(collection).click(function() {
				var _this = $(this);
				var offset = _this.offset(); 
				selected_indicator.css({
					"display" : "block",
					"top" : offset.top - 5,
					"left" : offset.left - 13
				});
				$(collection).removeClass('selected');
				$(btn_cart_wrap).find('.block-btn-over').remove();
				colors.change(_this, select_obj);
			});

		});
	}
})(jQuery);
