/* ====================================================================
 * SLIDER
 * We developed jQuery plugin to provide range slider functionality
 * Used on file: facet_range_macro.txt
 *
 * We tried to follow same syntax and practices as Bootstrap.js
 * so we are using Bootstrap's jsHint settings
 * http://blog.getbootstrap.com/2012/04/19/bootstrap-jshint-and-recess/
 * ==================================================================== */

!function ($) {

	'use strict';

	/* SLIDER CLASS DEFINITION
	 * ======================= */

	var Slider = function (element, options) {
		this.init(element, options);
	};

	Slider.prototype = {

		init: function (element, options)
		{
			var $element = $(element)
			,	$children = $element.children();

			this.$element = $element;
			this.options = options;

			this.values = this.parseValues(options.values, $element.data());
			this.$bar = $children.filter('.bar');

			this.controls = {
				$low: $children.filter('[data-control="low"]')
			,	$high: $children.filter('[data-control="high"]')
			};

			this.slideToInitial(true);
			this.listen();
		}

	,	parseValues: function (defaults, dom_data)
		{
			var values = {
				min: dom_data.min || defaults.min
			,	max: dom_data.max || defaults.max
			};

			$.extend(values, {
				low: Math.max(dom_data.low || defaults.min, values.min)
			,	high: Math.min(dom_data.high || defaults.high, values.max)
			});

			return values;
		}

	,	listen: function ()
		{
			var proxy = jQuery.proxy;

			this.$element
				.on('mousedown.slider.data-api', proxy(this.handleMouseDown, this))
				.on('touchstart.slider.data-api', proxy(this.handleMouseDown, this));

			$('html')
				.on('mousemove.slider.data-api', proxy(this.handleMouseMove, this))
				.on('touchmove.slider.data-api', proxy(this.handleMouseMove, this))

				.on('mouseup.slider.data-api', proxy(this.handleMouseUp, this))
				.on('touchend.slider.data-api', proxy(this.handleMouseUp, this))
				.on('touchcancel.slider.data-api', proxy(this.handleMouseUp, this));
		}

	,	getMinBoundary: function () {
			return this.$element.offset().left;
		}

	,	getMaxBoundary: function () {
			return this.getMinBoundary() + this.$element.innerWidth();
		}

	,	handleMouseDown: function (e)
		{
			if (e.which !== 1 && e.type !== 'touchstart') {
				return;
			} 

			var page_x = this.getPageX(e)
			,	$target = $(e.target);

			if ($target.is('a') || $target.is('button'))
			{
				if (this.values.low === this.values.max || this.values.high === this.values.min)
				{
					$target = this.controls['$'+ (page_x < this.$element.offset().left + this.$element.innerWidth() / 2 ? 'high':'low')];
				}

				this.$dragging = $target;
				this.$element.trigger('start', this);
			}
			else
			{
				this.$dragging = this.getClosestControl(page_x);
				this.slideToValue(this.getSlidValue(page_x));
			}

			e.preventDefault();
		}

	,	handleMouseMove: function (e)
		{
			if (!this.$dragging) {
				return;	
			} 

			var page_x = this.getPageX(e)
			,	slid_value = this.getSlidValue(page_x)

			,	is_low = this.$dragging.data('control') === 'low'
			,	value = Math[is_low ? 'min':'max'](slid_value, this.values[is_low ? 'high':'low']);

			this.slideToValue(value);

			e.preventDefault();	
		}

	,	handleMouseUp: function (e)
		{
			if (!this.$dragging) {
				return;
			}

			this.$dragging = null;
			this.$element.trigger('stop', this);

			e.preventDefault();
		}

	,	getPageX: function (e)
		{
			var touch = e.originalEvent && e.originalEvent.touches ? e.originalEvent.touches[0] || e.originalEvent.changedTouches[0] : null;
			return touch ? touch.pageX : e.pageX;
		}

	,	getSlidValue: function (page_x)
		{
			var minBoundary = this.getMinBoundary()
			,	maxBoundary = this.getMaxBoundary()
			,	location = page_x > maxBoundary ? maxBoundary : page_x < minBoundary ? minBoundary : page_x;

			return ((location - minBoundary) / this.$element.innerWidth() * this.getSizeInValue() + this.values.min);
		}

	,	getClosestControl: function (page_x)
		{
			var value = this.getSlidValue(page_x)
			,	distance_low = Math.abs(this.values.low - value)
			,	distance_high = Math.abs(this.values.high - value)
			,	$low = this.controls.$low;

			if (distance_low !== distance_high)
			{
				return distance_low < distance_high ? $low : this.controls.$high;
			}
			else
			{
				return page_x < $low.offset().left ? $low : this.controls.$high;
			}
		}

	,	getSizeInValue: function () {
			return this.values.max - this.values.min;
		}

	,	moveControl: function ($control, value)
		{
			return $control.css({
				left: ((value - this.values.min) * 100 / this.getSizeInValue()) +'%'
			});
		}
	
	,	resizeBar: function ()
		{
			return this.$bar.css({
				left: ((this.values.low - this.values.min) * 100 / this.getSizeInValue()) +'%'
			,	width: ((this.values.high - this.values.low) / this.getSizeInValue()) * 100 +'%'
			});
		}

	,	slideToInitial: function (trigger)
		{
			this.slideControls();
			this.resizeBar();

			if (trigger)
			{
				this.$element.trigger('slide', this);
			}
		}

	,	slideControls: function ()
		{
			this.moveControl(this.controls.$low, this.values.low);
			this.moveControl(this.controls.$high, this.values.high);
		}

	,	slideToValue: function (value)
		{
			var is_low = this.$dragging.data('control') === 'low';
			this.values[is_low ? 'low':'high'] = value;
			
			this.moveControl(this.$dragging, value);
			this.resizeBar();

			this.$element.trigger('slide', this);
		}
	};

	/* SLIDER PLUGIN DEFINITION
	 * ======================== */

	// standar jQuery plugin definition
	$.fn.slider = function (option)
	{
		return this.each(function ()
		{
			var $this = $(this)
			,	data = $this.data('slider');

			// if it wasn't initialized, we do so
			if (!data) {
				// we extend the passed options with the default ones
				var options = $.extend({}, $.fn.slider.defaults, typeof option === 'object' && options);
				$this.data('slider', (data = new Slider(this, options)));	
			}
		});
	};

	$.fn.slider.Constructor = Slider;

	$.fn.slider.defaults = {
		values: {
			min: 0
		,	max: 100
		}
	};

	/* SLIDER DATA-API
	 * =============== */

	$(window).on('load', function () {
		$('[data-toggle="slider"]').slider();
	});

}(window.jQuery);