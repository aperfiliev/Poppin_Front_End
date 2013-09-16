var show_by_color = {
	info_url : show_by_color_info_url,
	selected_params : null,
	selected_array : null,
	available_url : true,
	update : function(obj) {

		var action = null;
		var add = 'add';
		var remove = 'remove';

		if (!show_by_color.selected_params) {
			if (show_by_color.available_url) {
				show_by_color.selected_params = show_by_color.get_url_vars()["showingcolor"];
				show_by_color.available_url = false;
			}
		}

		selected_params = show_by_color.selected_params;

		if (selected_params) {
			show_by_color.selected_array = selected_params.split(',');
		}

		if (!selected_params && obj) {
			window.location = $j(obj).attr('href');
			return;
		}

		if (selected_params && !obj) {
			$j.each(show_by_color.selected_array, function(index, value) {
				$j('.color-nav li.' + value).find('a').addClass('selected');
			});
		}

		if (selected_params && obj) {

			var color = $j(obj).data('color');

			if ($j.inArray(color, show_by_color.selected_array) == '-1') {

				show_by_color.selected_array.push(color);
				selected_params = '';
				action = add;

				$j.each(show_by_color.selected_array, function(index, value) {
					if (index == 0) {
						comma = '';
					} else {
						comma = ',';
					}
					selected_params = selected_params + comma + value;
				});

				$j(obj).addClass('selected');

			} else {

				action = remove;

				$j.each(show_by_color.selected_array, function(index, value) {
					if (value == color) {
						show_by_color.selected_array.splice(index, 1);
					}
				});

				selected_params = '';

				if (show_by_color.selected_array[0]) {
					$j.each(show_by_color.selected_array, function(index, value) {
						if (index == 0) {
							comma = '';
						} else {
							comma = ',';
						}
						selected_params = selected_params + comma + value;
					});
				}

				$j(obj).removeClass('selected');

			}

		}

		$j('.color-nav li a').each(function() {

			var color = $j(this).data('color');

			var url = show_by_color.info_url + '?showingcolor=' + color;
			$j(this).attr({
				href : url
			});

		});

		show_by_color.selected_params = selected_params;

		var colorsMap = {
			"black" : 14,
			"white" : 1,
			"gray" : 22,
			"brown" : 73,
			"purple" : 7,
			"pink" : 6,
			"red" : 2,
			"orange" : 10,
			"navy" : 19,
			"pool-blue" : 9,
			"aqua" : 11,
			"lime-green" : 15,
			"yellow" : 13,
		};
		var arrSelectedColors = show_by_color.selected_array || [];
		for (var i = 0; i < arrSelectedColors.length; i++)
			arrSelectedColors[i] = colorsMap[arrSelectedColors[i]];

		return arrSelectedColors;
	},

	get_url_vars : function() {
		var vars = {};
		var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m, key, value) {
			vars[key] = value;
		});
		return vars;
	},

	prepare_data : function() {
		$j('.color-nav li a').each(function() {
			$j(this).data('color', $j(this).parent().attr('class'));
			$j(this).data('url', $j(this).attr('href'));
		});
	}
}

$j(function() {
	$j('.color-nav li a').click(function(evt) {
		evt.preventDefault();
		var colors = show_by_color.update($j(this))
		GPItemList.getItemsByColor(colors);
		return false;
	});
	show_by_color.prepare_data();
	show_by_color.update();
});
