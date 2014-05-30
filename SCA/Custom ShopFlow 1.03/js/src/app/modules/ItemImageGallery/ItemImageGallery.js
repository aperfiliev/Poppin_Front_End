define('ItemImageGallery', ['ItemDetails.View'], function (ItemDetailsView)
{
	'use strict';

	var ItemImageGallery = function ItemImageGallery (options)
	{
		this.options = options;
		this.images = options.images;
		this.$target = options.$target;

		this.intitialize();
	};

	_.extend(ItemImageGallery.prototype, {

		intitialize: function ()
		{
			if (!SC.ENVIRONMENT.isTouchEnabled)
			{
				this.initZoom();
			}

			this.$slider = this.initSlider();

			return this;
		}

	,	hasSameImages: function (images)
		{
			return this.images.length === images.length && _.difference(this.images, images).length === 0;
		}

	,	zoomImageCallback: function ()
		{
			var $this = jQuery(this);

			if ($this.width() <= $this.parent().width())
			{
				$this.remove();
			}

			return this;
		}

	,	initZoom: function ()
		{
			var self = this
			,	images = this.images;

			this.$target.children().each(function (slide_index)
			{
				jQuery(this).zoom({
					url: ImageGalleryModule.resizeZoom(images[slide_index].url)
				,	callback: self.zoomImageCallback
				});
			});

			return this;
		}

	,	buildSliderPager: function (slide_index)
		{
			var image = this.images[slide_index];
			return '<img src="' + ImageGalleryModule.resizeThumb(image.url) + '" alt="' + image.altimagetext + '">';
		}

	,	initSlider: function ()
		{
			return this.$target.bxSlider({
				buildPager: jQuery.proxy(this.buildSliderPager, this)
			,	startSlide: this.options.startSlide
			,	forceStart: this.options.forceStart
			,	adaptiveHeight: true
			});
		}
	});

	var ImageGalleryModule = {

		ItemImageGallery: ItemImageGallery

	,	resizeZoom: function (url)
		{
			return this.resizeImage(url, 'zoom');
		}

	,	resizeThumb: function (url)
		{
			return this.resizeImage(url, 'tinythumb');
		}

	,	getStartSlide: function (view_gallery, images)
		{
			// Slider may not be applicable to the view gallery.
			if (view_gallery && view_gallery.$slider.length && view_gallery instanceof ItemImageGallery && view_gallery.hasSameImages(images))
			{
				return view_gallery.$slider.getCurrentSlide();
			}
		}

	,	initialize: function (view)
		{
			if (view instanceof ItemDetailsView)
			{
				var images = view.model.get('_images')
				,	start_slide = ImageGalleryModule.getStartSlide(view.imageGallery, images);

				view.imageGallery = new ItemImageGallery({
					images: images
				,	$target: view.$('.bxslider')
				,	startSlide: start_slide || 0
				,	forceStart: !_.isUndefined(start_slide)
				});
			}
		}

	,	mountToApp: function (application)
		{
			application.getConfig('macros').itemDetailsImage = 'itemImageGallery';

			if (SC.ENVIRONMENT.jsEnvironment === 'browser')
			{
				this.resizeImage = application.resizeImage;

				application.getLayout().on('afterAppendView', this.initialize);
			}
		}
	};

	return ImageGalleryModule;
});