(function($)
{
    $.fn.removeStyle = function(style)
    {
        var search = new RegExp(style + '[^;]+;?', 'g');

        return this.each(function()
        {
            $(this).attr('style', function(i, style)
            {
                return style.replace(search, '');
            });
        });
    };
})(jQuery);

$j.fn.deskConfigurator = function(options){
		var settings = $j.extend({
			colorsJson: '',
			pageTitle: 'Design-a-Desk',
			quickPickTitle: 'Poppin Picks',
			cartTitle: 'My Desk',
			cartMessageTop: 'Play dress up with your desk. Pull together a great ensemble by choosing a Poppin Pick or simply mousing over a product on the desktop.',
			cartDefaultText: ' What are you waiting for?',
			cartEmptyText: '',
			cartCurrency: '$',
			txtOutStock: '- <span>Sold Out</span>',
			itemsCart: new Array(),
			grandTotal: 0,
			openCart: 0,
			bg_url_desk: '//poppin.imgix.net/pp-design-desk/table.png?auto=format',
			bg_url_shadow: '//poppin.imgix.net/pp-design-desk/shadow.png?auto=format',
			errorMessage: 'An error occurred, please try again later',
			socialImageUrl: '',
			socialClicked: '',
			socialWin: '',
			basedesk: ''
			
		}, options);
	
		var options = $j.extend(settings, options);
		var container = this;
		
		
		$j.ajax({
			url: '/app/site/hosting/scriptlet.nl?script=178&deploy=1&compid=3363929&h=f9014d86888b0223fef1',
			contentType : "application/json",
			dataType : "json",
			type: "GET",
			async: false,
			success: function(data){
				settings.colorsJson = data;
			}
		});
		
		var configurator = {
				model: function(){
					return data = {
					
						available_types: {
							'inboxes':	new Array('1', 'Stacking Inboxes'),
							'bitsbobs':	new Array('2', 'Bits + Bobs Tray'),
							//'halftray':	new Array('3', 'accessory tray'),
							'cup':		new Array('4', 'Pen Cup'),
							'pens':		new Array('5', 'Signature Ballpoint Pens'),
							'ruler':	new Array('6', 'Ruler'),
							'scissors':	new Array('7', 'Scissors'),
							'tape':		new Array('8', 'Tape Dispenser'),
							'stapler':	new Array('9', 'Stapler'),
							'spiral':	new Array('10', 'Medium Spiral Notebook')
						},
						
						default_images: {
							'inboxes':	'//poppin.imgix.net/pp-design-desk/default-items/inboxes.png?auto=format',
							'bitsbobs':	'//poppin.imgix.net/pp-design-desk/default-items/bitsbobs.png?auto=format',
							//'halftray':	'//poppin.imgix.net/pp-design-desk/default-items/halftray.png?auto=format',
							'cup':		'//poppin.imgix.net/pp-design-desk/default-items/cup.png?auto=format',
							'pens':		'//poppin.imgix.net/pp-design-desk/default-items/pens.png?auto=format',
							'ruler':	'//poppin.imgix.net/pp-design-desk/default-items/ruler.png?auto=format',
							'scissors':	'//poppin.imgix.net/pp-design-desk/default-items/scissors.png?auto=format',
							'tape':		'//poppin.imgix.net/pp-design-desk/default-items/tape.png?auto=format',
							'stapler':	'//poppin.imgix.net/pp-design-desk/default-items/stapler.png?auto=format',
							'spiral':	'//poppin.imgix.net/pp-design-desk/default-items/spiral.png?auto=format'
						},
						
						getTypeIdByCode: function(type_code){
							
							var id;
							
							$j.each(data.available_types, function(key, value){
								if(key == type_code){
									id = this[0];
								}
							});
							
							return id;
						},
						
						getTypeLabelById: function(type_id){
							
							var label;
							
							$j.each(data.available_types, function(){
								if(this[0] == type_id){
									label = this[1];
								}
							});
							
							return label;
							
						},
						
						getTypeCodeById: function(type_id){

							var code;
							
							$j.each(data.available_types, function(key, value){
								if(this[0] == type_id){
									code = key;
								}
							});
							
							return code;
							
						},
						
						colorsCollection: function(){
							
							var data_array = new Array();
							
							if(settings.colorsJson.length > 0){
								$j.each(settings.colorsJson, function(){
									
									var columns = this.columns;
									var id = this.id;
									var internalid = columns.internalid.internalid;
									var name = columns.name;
									var src = columns.custrecord_conf_color_img.name;
									var hex = columns.custrecord_conf_color_hex;
									
									data_array.push({id: id, internalid: internalid, name: name, src: src, hex: hex });
									
								});
							}
							
							return data_array;
							
						}
					}
					
				},
				
				createInterface: function(model_data){
					
					//Create Table
					
					var table = $j('<div></div>').addClass('table-wrap');
					var shadow = $j('<div></div>').addClass('products-shadow');
					var default_products = $j('<div></div>').addClass('default-products');
					
					var types_template_html = '<div class="dialogbox-container">'+
												'<div class="title"></div>'+
												'<ul class="list"></ul>'+
											   '</div>';
					var desk_image_html		= '<img class="desk-image" />';
					
					this.table = {
						
						model:			model_data,
						
						type_stapler:	$j('<div></div>')
											.data({'src': model_data.default_images.stapler, 'type': 'stapler'})
											.addClass('type-stapler item-type')
											.append( $j(desk_image_html).attr({src: model_data.default_images.stapler}) )
											.append(types_template_html),

						type_tape:		$j('<div></div>')
											.data({'src': model_data.default_images.tape, 'type': 'tape'})
											.addClass('type-tape item-type')
											.append( $j(desk_image_html).attr({src: model_data.default_images.tape}) )
											.append(types_template_html),
											
						type_pens:		$j('<div></div>')
											.data({'src': model_data.default_images.pens, 'type': 'pens'})
											.addClass('type-pens item-type')
											.append( $j(desk_image_html).attr({src: model_data.default_images.pens}) )
											.append(types_template_html),
											
						/*type_halftray:	$j('<div></div>')
											.data({'src': model_data.default_images.halftray, 'type': 'halftray'})
											.addClass('type-halftray item-type')
											.append( $j(desk_image_html).attr({src: model_data.default_images.halftray}) )
											.append(types_template_html),*/
											
						type_scissors:	$j('<div></div>')
											.data({'src': model_data.default_images.scissors, 'type': 'scissors'})
											.addClass('type-scissors item-type')
											.append( $j(desk_image_html).attr({src: model_data.default_images.scissors}) )
											.append(types_template_html),
											
						type_ruler:	$j('<div></div>')
											.data({'src': model_data.default_images.ruler, 'type': 'ruler'})
											.addClass('type-ruler item-type')
											.append( $j(desk_image_html).attr({src: model_data.default_images.ruler}) )
											.append(types_template_html),

											
						type_cup:		$j('<div></div>')
											.data({'src': model_data.default_images.cup, 'type': 'cup'})
											.addClass('type-cup item-type')
											.append( $j(desk_image_html).attr({src: model_data.default_images.cup}) )
											.append(types_template_html),
											
						type_inboxes:	$j('<div></div>')
											.data({'src': model_data.default_images.inboxes, 'type': 'inboxes'})
											.addClass('type-inboxes item-type')
											.append( $j(desk_image_html).attr({src: model_data.default_images.inboxes}) )
											.append(types_template_html),
											
						type_bitsbobs:	$j('<div></div>')
											.data({'src': model_data.default_images.bitsbobs, 'type': 'bitsbobs'})
											.addClass('type-bitsbobs item-type')
											.append( $j(desk_image_html).attr({src: model_data.default_images.bitsbobs}) )
											.append(types_template_html),
											
						type_spiral: 	$j('<div></div>')
											.data({'src': model_data.default_images.spiral, 'type': 'spiral'})
											.addClass('type-spiral item-type')
											.append( $j(desk_image_html).attr({src: model_data.default_images.spiral}) )
											.append(types_template_html),
											
						social_container: $j('<div></div>').addClass('social-container'),
						
						btn_fb:			$j('<a></a>').addClass('sb_button').html('<span class="sb_button_icon"></span><span class="sb_button_text">Share</span>').attr({'href': '#'}),
						btn_tw: 		$j('<a></a>').attr({'href': '#'}).html('<iframe scrolling="no" frameborder="0" allowtransparency="true" src="http://platform.twitter.com/widgets/tweet_button.1347008535.html#_=1350670437261&amp;count=none&amp;counturl=http%3A%2F%2Fwww.poppin.com%2FDesign_a_Desk.html&amp;id=twitter-widget-0&amp;lang=en&amp;original_referer=http%3A%2F%2Fwww.poppin.com%2FDesign_a_Desk.html&amp;size=m&amp;text=Design%20a%20Desk&amp;url=http%3A%2F%2Fwww.poppin.com%2FDesign_a_Desk.html&amp;via=poppin" class="twitter-share-button twitter-count-none" style="width: 59px; height: 20px;" title="Twitter Tweet Button" data-twttr-rendered="true"></iframe>'),
						
						btn_pt: $j('<a></a>').attr({'href':'#'}).addClass('pinterest-button').text('Pin It!'),
											
						default_products_container:	$j(default_products),
						
						collection: null,
						
						new_product: function(product_id, product_type_id, product_image, product_image_thumb, product_name, product_price, product_q_available){
							
							var item_empty 		= $j('<li></li>').addClass('item')
													.attr({'id': product_id})
													.data({
														'product_id': product_id,
														'product_type_id': product_type_id,
														'product_image': product_image,
														'product_image_thumb': product_image_thumb,
														'product_name': product_name,
														'product_price': product_price,
														'product_q_available': product_q_available
													});
													
							var item_image_thumb	= $j('<img>').addClass('thumb-image').attr({src: product_image_thumb});
							
							return $j(item_empty).append(item_image_thumb);

						}
						
					}
					
					$j(this.table.social_container).append(this.table.btn_tw).append(this.table.btn_fb).append(this.table.btn_pt);
					
					$j(this.table.default_products_container)
						.append(this.table.type_spiral)
						.append(this.table.type_inboxes)
						.append(this.table.type_bitsbobs)
						.append(this.table.type_cup)
						.append(this.table.type_ruler)
						.append(this.table.type_scissors)
						//.append(this.table.type_halftray)
						.append(this.table.type_pens)
						.append(this.table.type_tape)
						.append(this.table.type_stapler)
						.append(this.table.social_container);
						
						
					$j(shadow).html(this.table.default_products_container);
					$j(table).html(shadow);
					
					$j(container).append(table);
					
					var collection = $j();
					
					collection = collection
						.add( $j(this.table.type_spiral) )
						.add( $j(this.table.type_bitsbobs) )
						.add( $j(this.table.type_inboxes) )
						.add( $j(this.table.type_cup) )
						.add( $j(this.table.type_ruler) )
						.add( $j(this.table.type_scissors) )
						//.add( $j(this.table.type_halftray) )
						.add( $j(this.table.type_pens) )
						.add( $j(this.table.type_tape) )
						.add( $j(this.table.type_stapler) );
					
					this.table.collection = collection;
					
					//Create Cart
					
					this.cart = {
						container: 		$j('<div></div>').addClass('cart-container cart-empty'),
						list: 			$j('<ul></ul>').addClass('cart-list'),
						total_price: 	$j('<span></span>').addClass('cart-total-price'),
						counter_items:	$j('<span></span>').addClass('cart-counter-items'),
						btn_add: 		$j('<button></button>').attr({type: 'button', title: 'Add to cart'}).addClass('add-to-cart').text('Add to cart'),
						btn_add2: 		$j('<button></button>').attr({type: 'button', title: 'Add to cart'}).addClass('add-to-cart').text('Add to cart'),
						btn_clear:		$j('<button></button>').attr({type: 'button', title: 'Clear all'}).addClass('clear-all').text('Clear all'),
						btn_update:		$j('<button></button>').attr({type: 'button', title: 'Update'}).addClass('update').text('Update'),
						empty_message:	$j('<span></span>').addClass('cart-empty-message').text(settings.cartEmptyText),
						cart_head: 		$j('<div></div>').addClass('cart-head'),
						cart_title:		$j('<span></span>').addClass('cart-title').text(settings.cartTitle),
						
						new_product: function(product_id, product_type_id, product_name, product_price, product_q_available){
							
							var item_empty = $j('<li></li>')
												.addClass('item')
												.attr({'id': product_id})
												.data({price: product_price, product_type_id: product_type_id, product_q_available: product_q_available})
												.css({height: 0, opacity: 0});
												
							var item_content			= $j('<div></div>').addClass('item-content');
							var item_qty				= $j('<input />').attr({type: 'text', name: 'qty'}).addClass('qty').val(1);
							var item_id					= $j('<input />').attr({type: 'hidden', name: 'itemid'}).addClass('itemid').val(product_id);
							var item_name				= $j('<span></span>').addClass('name').text(product_name);
							var item_price				= $j('<span></span>').addClass('price').text(' - '+settings.cartCurrency+product_price);
							var item_availability		= $j('<span></span>').addClass('availability').css({display: 'none'});
							var item_remove				= $j('<span></span>').addClass('remove');
							
							$j(item_content)
								.append(item_qty)
								.append(item_id)
								.append(item_name)
								.append(item_price)
								.append(item_availability)
								.append(item_remove);
							
							return $j(item_empty).append(item_content);

						}
					}
					
					var cart_top_message 		= $j('<span></span>').addClass('cart-top-message').html(settings.cartMessageTop);
					var cart_default_item 		= $j('<li></li>').addClass('cart-default-item').text(settings.cartDefaultText);
					var cart_foot 				= $j('<div></div>').addClass('cart-foot');
					var cart_total_container 	= $j('<div></div>').addClass('cart-total-wrap');
					var cart_total_text 		= $j('<span></span>').addClass('cart-total').text('Total');
					
					var wrap_list_foot			= $j('<div></div>').addClass('wrap-list-foot');
					var container_list_foot		= $j('<div></div>').addClass('container-list-foot');
					
					$j(this.cart.cart_head).append(this.cart.cart_title).append(this.cart.empty_message).append(this.cart.btn_add);
					$j(this.cart.list).append(cart_default_item);
					$j(cart_total_container).append(cart_total_text).append(this.cart.total_price).append(this.cart.counter_items);
					$j(cart_foot).append(cart_total_container).append(this.cart.btn_clear).append(this.cart.btn_update).append(this.cart.btn_add2);
					$j(container_list_foot).append(this.cart.list).append(cart_foot);
					$j(wrap_list_foot).append(container_list_foot);
					$j(this.cart.container).append(cart_top_message).append(this.cart.cart_head).append(wrap_list_foot);
					
					
					$j(container).prepend(this.cart.container);
					
					//Create Quick Pick
					var colors = model_data.colorsCollection();
					
					var quick_pick_container 	= $j('<div></div>').addClass('quick-pick-container');
					var quick_pick_title		= $j('<div></div>').addClass('quick-pick-title').text(settings.quickPickTitle);
					var list 					= $j('<ul></ul>').addClass('list-quick-pick');

					$j.each(colors, function(){
						
						var id = this.id;
						var internalid = this.internalid;
						var name = this.name;
						var src = this.src;
						var hex = this.hex;
						
						var li_item = $j('<li></li>').data({id: id, internalid: internalid, name: name}).addClass(name.toLowerCase());
						var color_name = $j('<span></span>').addClass('color-name').text(name.toLowerCase());
						
						if(hex){
							//hex = '#'+hex;
							$j(color_name).css({'background-color': hex});
						}else{
							$j(color_name).css({'color': '#000'});
						}
						
						$j(li_item).append('<img src="'+src+'" />').append(color_name);
						$j(list).append(li_item);
						
					});
					
					this.quickpicklist = {
						list: $j(list)
					}
					
					$j(quick_pick_container)
						.append(quick_pick_title)
						.append(this.quickpicklist.list);
					
					$j(container).prepend(quick_pick_container);
					
					//loading html
					
					var loading_table = $j('<div></div>').addClass('loading-table').css({opacity: 0.5});
					var loading_dialogbox = $j('<div></div>').addClass('loading-dialogbox').css({opacity: 0.5});
					this.loading = {
						state: true,
						loading_table: loading_table
					}
					
					this.loadingtype = {
						state: false,
						loading_dialogbox: loading_dialogbox
					}
					
					$j(container).append(this.loading.loading_table).append(this.loadingtype.loading_dialogbox);
					
					//Create Big Image Container
					this.bigimage = {
						canvas: 		$j('<canvas></canvas>').addClass('big-image'),
					}
					
					var canvas_container = $j('<div></div>').addClass('canvas-container');
					
					$j(canvas_container).append(this.bigimage.canvas)
					$j(container).append(canvas_container);
					
					var img_desk = new Image();
					settings.basedesk = $j(img_desk).attr({src: '//poppin.imgix.net/pp-design-desk/base-desk.jpg?auto=format'});
					
				},
				
				//###############################################
				//################## ACTIONS ####################
				//###############################################
				
				controller: function(view){
					return actions = {
						
						//return true if find in array or false if not exist
						checkItemInCart: function(product_id){
							
							var check = $j.inArray(product_id, settings.itemsCart);
							return (check == '-1')? false: true;
							
						},
						
						resetTable: function(){
							
							var collection = view.table.collection;
							
							$j(collection).each(function(){
								
								src = $j(this).data('src');
								$j('img.desk-image', this).attr({src: src});

							});

						},
						
						clearAll: function(){
							
							$j('li', view.cart.list[0]).not('.cart-default-item').remove();
							$j('li.cart-default-item', view.cart.list[0]).animate({height: '22px', opacity: 1});
							
							settings.itemsCart = new Array();
							settings.grandTotal = 0;
							settings.openCart = 0;
							
							$j(view.cart.btn_add).css({display: 'none'});
							$j(view.cart.btn_clear).css({display: 'none'});
							$j(view.cart.btn_update).css({display: 'none'});
							
							$j(view.cart.container).addClass('cart-empty');
							$j(view.cart.cart_title).removeClass('has-items').removeClass('open');
							
							$j(view.cart.total_price).html('');
							
							actions.resetTable();
							
							actions.pushPrice();
							actions.pushTotalCount();

							
						},
						
						addtoCart: function(){
							
							actions.loading(true);
							
							var cart_url = '/app/site/backend/additemtocart.nl?c=3363929&buyid=multi&multi=';
							var items_id_in_cart = settings.itemsCart;
							var cart_list = view.cart.list[0];

							if(items_id_in_cart.length > 0){
								
								var count_items = items_id_in_cart.length;
								var sep_items = ';';
								var sep_item_qty = ',';
								var i = 1;
								var items_string = '';
								var url_add = '';
								
								$j.each(items_id_in_cart, function(key, id){
									
									var element_id = '#'+id;
									var qty = $j(element_id, cart_list).find('.qty').val();
									
									if(i==count_items){
										sep_items = '';
									}
									
									if(qty > 0){
										items_string = items_string+id+sep_item_qty+qty+sep_items;
									}
									i++;
								});
								
								if(items_string != ''){
									url_add = cart_url+items_string;
									window.location = url_add;
								}
								
							}
							
						},
						
						//return null or jQuery obj
						getObjTypeById: function(type_id){
							
							var collection = view.table.collection;
							var type_obj = null;
							var type_code = view.table.model.getTypeCodeById(type_id);
							
							$j(collection).each(function(){
								if( $j(this).data('type') == type_code){
									type_obj = $j(this);
								}
							});
							
							return type_obj;
						},
						
						updateCart: function(allowQtyZero){

							var gran_total = 0;
							var cart_list = view.cart.list[0];
							var remove_items = new Array();
							
							if(settings.itemsCart.length > 0){
								
								//remove items qty 0
								if(!allowQtyZero){
									$j.each(settings.itemsCart, function(key, id){
										
										var element_id 			= '#'+id;
										var element_in_cart 	= $j(element_id, cart_list);
										var qty 				= $j('.qty', element_in_cart).val();
										var price 				= $j(element_in_cart).data('price');
										var product_type_id 	= $j(element_in_cart).data('product_type_id');
										
										if(qty == 0){
											remove_items.push(id)
											//actions.removeQtyZero(id, price, product_type_id);
										}
										
										
									});
									
									$j.each(remove_items, function(key, id){
										var element_id 			= '#'+id;
										var element_in_cart 	= $j(element_id, cart_list);
										var price 				= $j(element_in_cart).data('price');
										var product_type_id 	= $j(element_in_cart).data('product_type_id');
										
										actions.removeQtyZero(id, price, product_type_id);
									});
									
								}
								
								if(settings.itemsCart.length > 0){
									$j.each(settings.itemsCart, function(key, id){
									
										var element_id 			= '#'+id;
										var element_in_cart 	= $j(element_id, cart_list);
										var qty 				= $j('.qty', element_in_cart).val();
										var price 				= $j(element_in_cart).data('price');
										var product_type_id 	= $j(element_in_cart).data('product_type_id');
										
										if(qty > 0){
											var total_price = (price * parseInt(qty));
											gran_total = (parseFloat(gran_total) + parseFloat(total_price));
										}
	
									});
									
									if(gran_total > 0){
										settings.grandTotal = gran_total;
										actions.pushPrice();
									}
									
									actions.pushTotalCount();
									
									if(!$j(view.cart.cart_title).hasClass('has-items')){
										$j(view.cart.cart_title).addClass('has-items');
										$j(view.cart.total_price).css({display: 'none'});
										$j(view.cart.counter_items).css({display: 'inline'});
									}
									
									if($j(view.cart.cart_title).hasClass('has-items')){
										if(!$j(view.cart.cart_title).hasClass('open')){
											$j(view.cart.total_price).css({display: 'none'});
											$j(view.cart.counter_items).css({display: 'inline'});
										}
									}
									
									$j(view.cart.cart_empty_message).hide();
								}
								
								if(settings.itemsCart.length == 0){
									
									actions.clearAll();

									//$j(view.cart.container).addClass('cart-empty');
									//$j(view.cart.cart_title).removeClass('has-items').removeClass('open');
									//settings.grandTotal = 0;
									//actions.pushPrice();
									//actions.pushTotalCount();
									
								}
								
							}
						},
						
						showCart: function(){
							
							if(settings.openCart == 0){
								$j(view.cart.cart_title).addClass('open');
								settings.openCart = 1;
								$j('li', view.cart.list[0]).animate({height: 48, opacity: 1});
								
								$j(view.cart.btn_add).css({opacity: 0, display: 'inline'}).animate({opacity: 1});
								$j(view.cart.btn_clear).css({opacity: 0, display: 'inline'}).animate({opacity: 1});
								$j(view.cart.btn_update).css({opacity: 0, display: 'inline'}).animate({opacity: 1});
								
								$j(view.cart.counter_items).css({display: 'none'});
								$j(view.cart.total_price).css({opacity: 0, display: 'inline'}).animate({opacity: 1});
								
								return;
							}
							
							if(settings.openCart == 1){
								$j(view.cart.cart_title).removeClass('open');
								settings.openCart = 0;
								$j('li', view.cart.list[0]).animate({height: 0, opacity: 0});
								
								$j(view.cart.btn_add).animate({opacity: 1}, function(){ $j(this).css({display: 'none'}); });
								$j(view.cart.btn_clear).animate({opacity: 1}, function(){ $j(this).css({display: 'none'}); });
								$j(view.cart.btn_update).animate({opacity: 1}, function(){ $j(this).css({display: 'none'}); });
								
								$j(view.cart.total_price).css({display: 'none'});
								$j(view.cart.counter_items).css({opacity: 0, display: 'inline'}).animate({opacity: 1});
								
								actions.updateCart();
								
								return;
							}
							
						},
						
						removeQtyZero: function(product_id, product_price, product_type_id){
							
							//remove in cart box
							$j('li', view.cart.list[0]).each(function(){
								if($j(this).attr('id') == product_id){
									
									$j(this).animate({height: 0, opacity: 0}, 400, function(){
										$j(this).remove();
									});
									
								}
							});
							
							var type_obj = actions.getObjTypeById(product_type_id);
							var default_src =  $j(type_obj).data('src');
							
							$j('img.desk-image', type_obj).attr({'src': default_src});
							
							var check = $j.inArray(product_id, settings.itemsCart);
							if(check != '-1'){
								settings.itemsCart.splice(check,1);
							}
							
						},
						
						pushPrice: function(){
							settings.grandTotal = settings.grandTotal.toFixed(2);
							$j(view.cart.total_price).html( settings.cartCurrency+settings.grandTotal );
						},
						
						pushTotalCount: function(){
							var counter_items_text = '';
							var i = 0;
							var cart_list = view.cart.list[0];
							
							if(settings.itemsCart.length > 0){
								
								$j.each(settings.itemsCart, function(key, id){
									
									var element_id 			= '#'+id;
									var element_in_cart 	= $j(element_id, cart_list);
									var qty 				= $j('.qty', element_in_cart).val();
									
									if(parseInt(qty) > 0){
										i = i+parseInt(qty);
									}
									
								});
								
								if(i > 1){
									counter_items_text = i+' Items';
								}
								if(i == 1){
									counter_items_text = i+' Item';
								}
								
							}
							
							$j(view.cart.counter_items).html(counter_items_text);
						},
						
						remove: function(product_id, product_price, product_type_id){
							
							//change image in table
							var type_obj = actions.getObjTypeById(product_type_id);
							var default_src =  $j(type_obj).data('src');
							
							$j('img.desk-image', type_obj).attr({'src': default_src});
							
							//Remove in array cart set
							var check = $j.inArray(product_id, settings.itemsCart);
							if(check != '-1'){
								settings.itemsCart.splice(check,1);
							}
							
							actions.updateCart();
							
							//refresh grand total
							//settings.grandTotal = (parseFloat(settings.grandTotal) - parseFloat(product_price));
							//actions.pushPrice();
							
							//remove in cart box
							$j('li', view.cart.list[0]).each(function(){
								if($j(this).attr('id') == product_id){
									
									$j(this).animate({height: 0, opacity: 0}, 400, function(){
										$j(this).remove();
										
										//if cart is empty show default message and hide buttons
										if(settings.itemsCart.length == 0){
											
											actions.clearAll();
											//$j(view.cart.container).addClass('cart-empty');
											//settings.grandTotal = 0;
											//actions.pushPrice();
											
										}
										
									});
									
								}
							});
							
						},
						
						clearItemsInCartByType: function(product_type_id){
							
							$j('li', view.cart.list[0]).each(function(){
								
								var type_id 	= $j(this).data('product_type_id');
								var id 			= $j(this).attr('id');
								
								if(type_id){

									if(type_id == product_type_id){
										
										$j(this).animate({height: 0, opacity: 0}, 400, function(){
											$j(this).remove();
										});
										
										$j.each(settings.itemsCart, function(key, val){
											if(val == id){
												check = settings.itemsCart.splice(key,1);
											}
										});
										
										//var check = $j.inArray(id, settings.itemsCart);
										/*if(check != '-1'){
											settings.itemsCart.splice(check,1);
										}*/
										
									}
								
								}
								
							});
							
							return true;
							
						},
						
						setCart: function(product_id, product_type_id, product_name, product_price, product_q_available, allowQtyZero){
							
							$j(view.cart.container).removeClass('cart-empty');
							
							if(!actions.checkItemInCart(product_id)){
								
								if( actions.clearItemsInCartByType(product_type_id) ){
									
									settings.itemsCart.push(product_id);
									//settings.grandTotal = (parseFloat(settings.grandTotal) + parseFloat(product_price));
									
									var new_product = view.cart.new_product(product_id, product_type_id, product_name, product_price, product_q_available);
									new_product = $j(new_product[0]);
									
									new_product.find('.remove').click(function(){
										actions.remove(product_id, product_price, product_type_id);
									});
									
									if(!product_q_available || product_q_available == 0){
										new_product.find('.availability').html(settings.txtOutStock).css({display: 'inline'});
										new_product.find('.qty').val(0).attr({'disabled': 'disabled'});
									}
									
									$j(view.cart.list).append( new_product );
									
									if(settings.openCart){
										new_product.animate({height: 48, opacity: 1});
									}
									
									//actions.pushPrice();
									if(allowQtyZero){
										actions.updateCart(true);
									}else{
										actions.updateCart();
									}
									
								}
								
							}
							
							actions.loadingDialogBox(false);
							
						},
						
						update: function(product_id, product_type_id, product_image, product_name, product_price, product_q_available, allowQtyZero){
							
							var type_obj = actions.getObjTypeById(product_type_id);
							
							if(type_obj){
								if(product_q_available > 0){
									$j('img.desk-image', type_obj).attr({'src': product_image});
								}else{
									$j('img.desk-image', type_obj).attr({'src': type_obj.data('src')});
								}
								
								actions.setCart(product_id, product_type_id, product_name, product_price, product_q_available, allowQtyZero);
							}
							
						},
						
						updateByColorId: function(color_id){
							
							actions.clearAll();
							actions.loadingDialogBox(true);
							
							var url_by_color = '/app/site/hosting/scriptlet.nl?script=182&deploy=1&compid=3363929&h=3ac10482284de289c977&color='+color_id;
							$j.ajax({
								url: url_by_color,
								contentType : "application/json",
								dataType : "json",
								type: "GET",
								success: function(data){
									
									$j.each(data, function(key, val){
									
										//###############################################
										//what happens if several products has same type?
										//###############################################
										
										var product_id 		= key;
										var product_type_id	= null;
										var product_image 	= null;
										var product_name 	= null;
										var product_price 	= null;
										var product_q_available = 0;
										
										if(this.type){
											product_type_id = this.type.internalid
										}
										
										if(this.imgD){
											product_image = this.imgD.name;
										}
										
										if(this.name){
											product_name = this.name;
										}else if(this.name2){
											product_name = this.name2;
										}
										
										if(this.price){
											product_price = this.price;
										}
										
										if(this.qtyAvailable){
											product_q_available = this.qtyAvailable;
										}
										
										if(product_type_id && product_image){
											actions.update(product_id, product_type_id, product_image, product_name, product_price, product_q_available, true);
										}
										
									});
									
									if(data.error){
										actions.loadingDialogBox(false);
									}
									
								}
							});
							
						},
						
						resetDialogBox: function(){
							var collection = view.table.collection;
							
							$j('.dialogbox-container', collection).css({display: 'none'});
							
							$j(collection).each(function(){
								$j('.dialogbox-container', this);
								$j('.list', this).html('');
							});
							
							actions.loadingDialogBox(false);
						},
						
						correctOrdering: function(data){
							
							var order_array 	= [];
							var reorder_array 	= [];
							
							$j.each(data, function(key, value){
								
								value.itemid = key;
								
								if(!this.order){
									order_array.push(value);
								}else{
								
									if(!order_array[this.order]){
										order_array[this.order] = value;
									}else{
										order_array.push(value);
									}
								}
								
							});
							
							$j.each(order_array, function(key, value){
								if(key && value){
									reorder_array.push(value);
								}
							});
							
							return reorder_array;

						},
						
						showItemsByType: function(type_id){
							
							actions.resetDialogBox();
							actions.loadingDialogBox(true);
							
							var url_items_by_type = '/app/site/hosting/scriptlet.nl?script=182&deploy=1&compid=3363929&h=3ac10482284de289c977&type='+type_id;
							
							var request = $j.ajax({
									url: url_items_by_type,
									contentType : "application/json",
									dataType : "json",
									type: "GET",
									success: function(data){

										type_obj = actions.getObjTypeById(type_id);
										
										$j('.title', type_obj).text(view.table.model.getTypeLabelById(type_id));
										
										data = actions.correctOrdering(data);
										
										$j.each(data, function(key, val){
										
											//###############################################
											//what happens if several products has same type?
											//###############################################
											
											var product_id 			= parseInt(val.itemid);
											var product_type_id		= null;
											var product_image 		= null;
											var product_image_thumb	= null;
											var product_name 		= null;
											var product_price 		= null;
											var product_q_available = 0;
											
											if(this.type){
												product_type_id = this.type.internalid
											}
											
											if(this.imgD){
												product_image = this.imgD.name;
											}
											
											if(this.imgM){
												product_image_thumb = this.imgM.name;
											}
											
											if(this.name){
												product_name = this.name;
											}else if(this.name2){
												product_name = this.name2;
											}
											
											if(this.qtyAvailable){
												product_q_available = this.qtyAvailable;
											}
											
											if(this.price){
												product_price = this.price;
											}
											
											if(product_type_id && product_image_thumb && product_image && product_price){
												
												var type_obj = actions.getObjTypeById(product_type_id);
												var new_item = view.table.new_product(product_id, product_type_id, product_image, product_image_thumb, product_name, product_price, product_q_available);
									
												$j(new_item[0]).click(function(){
													actions.update(product_id, product_type_id, product_image, product_name, product_price, product_q_available, true);
												});
												
												$j('.list', type_obj).append(new_item);
	
											}
											
										});
										
										actions.showDialogBox($j('.dialogbox-container', type_obj));
	
									}
								
							});
							
							return request;
						},
						
						showColorTitle: function(obj, state){
							
							if(state == true){
								obj.addClass('color-over');
								$j('.color-name', obj).css({opacity: 0, bottom: '31px', display: 'block'}).animate({opacity: 1, bottom: '36px'}, 200);
							}
							
							if(state == false){
								obj.removeClass('color-over');
								$j('.color-name', obj).css({display: 'none'});
							}
							
						},
						
						loading: function(state){

							if(state == false){
								$j(view.loading.loading_table).css({display: 'none'});
								view.loading.state = false;
							}
							
							if(state == true){
								$j(view.loading.loading_table).css({display: 'block'});
								view.loading.state = true;
							}
							
							if(!state){
								return view.loading.state;
							}
							
						},
						
						loadingDialogBox: function(state){
							
							if(state == false){
								$j(view.loadingtype.loading_dialogbox).css({display: 'none'});
								view.loadingtype.state = false;
							}
							
							if(state == true){
								$j(view.loadingtype.loading_dialogbox).css({display: 'block'});
								view.loadingtype.state = true;
							}
							
							if(!state){
								return view.loadingtype.state;
							}

						},
						
						showDialogBox: function(obj_dialogbox){
							
							obj_dialogbox.removeStyle('bottom');
							obj_dialogbox.removeStyle('top');
							
							var window_h = $j(window).height();
							var scroll_top = $j(document).scrollTop();
							var element_top = $j(obj_dialogbox).parent().offset().top;
							var element_h = $j(obj_dialogbox).parent().height();
							
							var space_top = ((parseInt(element_top) + (element_h / 2)) - parseInt(scroll_top));
							var space_bottom = (parseInt(window_h) - space_top);
							
							
							
							if(space_top > space_bottom){
								obj_dialogbox.removeClass('bottom_pos');
								obj_dialogbox.addClass('top_pos');
							
								var bottom = obj_dialogbox.css('bottom');
								obj_dialogbox.css({opacity: 0, display: 'block', bottom: (parseInt(bottom) - 5)}).animate({opacity: 1, bottom: parseInt(bottom)}, 200, function(){ actions.loadingDialogBox(false); });
							}
							
							if(space_bottom > space_top){
								obj_dialogbox.removeClass('top_pos');
								obj_dialogbox.addClass('bottom_pos');
								
								var top = obj_dialogbox.css('top');
								obj_dialogbox.css({opacity: 0, display: 'block', top: (parseInt(top) - 5)}).animate({opacity: 1, top: parseInt(top)}, 200, function(){ actions.loadingDialogBox(false); });
							}
							
						},
						
						typeHover: function(type_obj){
							
							var request;
							var type = type_obj.data('type');
							var type_id = view.table.model.getTypeIdByCode(type);
							
							type_obj.on('mouseenter',function(){
								
								$j(this).addClass('type-over');
								
								if(type_id){
									request = actions.showItemsByType(type_id);
								}
								
							});
							
							type_obj.on('mouseleave',function(){
								
								request.abort();
								
								$j(this).removeClass('type-over');
								actions.resetDialogBox();
								
							});

						},
						
						setCanvasImages: function(){
							
							var images_to_load = [];
							
							function imagesLoad(){
								var obj = $j();
								var init = function () {
												for (var i = 0; i < images_to_load.length; i ++) {
													obj = obj.add(images_to_load[i]);
												}
												
												return obj;
											}
								
								return init();
							}
							
							var w = $j(view.table.default_products_container).width();
							var h = $j(view.table.default_products_container).height();
							var cv = $j(view.bigimage.canvas).get(0);
							var ctx = cv.getContext('2d');
							var collection = view.table.collection;
							//var img_desk = new Image();
							//var img_shadow = new Image();
							
							$j(cv).attr({width: w, height: h});
							
							ctx.clearRect(0,0,w,h);
							
							/*$j(img_desk).attr({src: settings.bg_url_desk});
							images_to_load.push(img_desk);
							ctx.drawImage(img_desk, 0, 0);*/
							
							/*$j(img_shadow).attr({src: settings.bg_url_shadow});
							images_to_load.push(img_shadow);
							ctx.drawImage(img_shadow, 0, 0);*/
							
							//Base Desk
							var img_desk = settings.basedesk[0];
							
							ctx.drawImage(img_desk, 0, 0);
							
							$j(collection).each(function(){
								
								x = parseInt($j(this).css('left'));
								y = parseInt($j(this).css('top'));
								
								src = $j('img.desk-image', this).attr('src');
								
								var img = new Image();
								
								$j(img).attr({src: src});
								images_to_load.push(img);
								ctx.drawImage(img, x, y);

							});
							
							obj = imagesLoad();
							obj_count = obj.length;
							onj_count_int = 0;
							actions.loading(true);
							$j(obj).each(function(){
								$j(this).load(function(){
									onj_count_int++;
									if(onj_count_int == obj_count){
										actions.getImageUrl();
									}
								});
							});

						},
						
						setSocialPlugin: function(){
							
							var social_name = settings.socialClicked;
							var social_image = settings.socialImageUrl;
							
							var p_name = 'Design-a-Desk @ Poppin';
							var p_id = '46';
							var p_url = 'http://www.poppin.com/Design_a_Desk.html';
							var p_desc = settings.cartDefaultText;
							var domain = 'http://www.poppin.com/';
							var current_domain = 'http://www.poppin.com';
							var current_domain_name = 'www.poppin.com';
							var origin = 'http://www.poppin.com/f39b544aeae7776';
							
							if(social_name == 'fb'){
								<!-- http://developers.facebook.com/docs/reference/dialogs/feed/ -->
								var fb =		'http://static.ak.facebook.com/connect/xd_arbiter.php?'+
												'version=17#cb=f2acd2f5127a518'+
												'&origin='+encodeURIComponent(origin)+
												'&domain='+current_domain_name+
												'&relation=opener'+
												'&frame=f3c09932810e646'+
												'&result=%22xxRESULTTOKENxx%22';
								
								var fb_url = 	'https://www.facebook.com/dialog/feed?app_id=139313082868948'+
												'&display=popup'+
												'&name='+encodeURIComponent(p_name)+
												'&link='+encodeURIComponent(p_url)+
												'&picture='+encodeURIComponent(social_image)+
												'&caption='+encodeURIComponent(domain)+
												'&description='+encodeURIComponent(p_desc)+
												//'&message=undefined'+
												//'&api_key=139313082868948'+
												'&locale=en_US'+
												//'&sdk=joey'+
												'&redirect_uri='+encodeURIComponent('http://shop.poppin.com/site/html-facebook-redirect.html');
												//'&next='+encodeURIComponent(fb);
								
								settings.socialWin.location.href = fb_url;
								
							}
							if(social_name == 'pt'){
								
								var pt_url = 	'http://pinterest.com/pin/create/button/?'+
												'url='+encodeURIComponent(p_url)+
												'&media='+encodeURIComponent(social_image)+
												'&description='+encodeURIComponent(p_name);
											
								settings.socialWin.location.href = pt_url;
							}
							if(social_name == 'tw'){
								
							}
							if(social_name == 'gp'){
								
							}
							
						},
						
						getImageUrl: function(){
							
							var cv = $j(view.bigimage.canvas).get(0);
							var jpeg_base64 = cv.toDataURL("image/jpeg");
							
							jpeg_base64 = jpeg_base64.replace('data:image/jpeg;base64,','');
							
							var request = $j.ajax({
									//url: '/app/site/hosting/scriptlet.nl?script=190&deploy=1&compid=3363929',
									url: '/app/site/hosting/scriptlet.nl?script=customscript_pp_ss_image_generator&deploy=customdeploy_pp_ss_image_generator',
									data: {'file': jpeg_base64},
									//contentType : "application/json",
									dataType : "html",
									type: "POST",
									success: function(data){
										actions.loading(false);
										
										obj = eval(data);
										
										if(obj.error){
											alert(settings.errorMessage);
										}
										
										if(obj.url){
											settings.socialImageUrl = obj.url;
											actions.setSocialPlugin();
										}
										
									}
								
							});
							
							return request;
						}
						
					}
				}
				
			}
		
		return this.each(function(){
			
			var poppin_data = new configurator.model();
			var poppin_desk = new configurator.createInterface(poppin_data);
			var poppin_actions = new configurator.controller(poppin_desk);
			
			$j('head').append("<link>");
			css = $j('head').children(":last");
			css.attr({ rel:  'stylesheet', type: 'text/css', href: 'http://cdn-cwa.buddymedia.com/v/2012101716/styles/sharewidget.css'});

			
			if(poppin_desk.quickpicklist.list){
				
				//each color
				$j('li', poppin_desk.quickpicklist.list).hover(function(){

					$j(this).addClass('color-over');
					poppin_actions.showColorTitle($j(this), true);
					
				}, function(){
					
					poppin_actions.showColorTitle($j(this), false);
				
				}).click(function(){
					
					var color_id = $j(this).data('internalid');
					poppin_actions.updateByColorId(color_id);
					
				});
			}
			
			if($j(poppin_desk.table.collection).length > 0){
				
				//each element on the table	
				$j(poppin_desk.table.collection).each(function(){
					poppin_actions.typeHover($j(this));
				});
			}
			
			if($j(poppin_desk.table.btn_tw).length > 0){
				$j(poppin_desk.table.btn_tw).click(function(){
					return false;
				});
			}
			
			if($j(poppin_desk.table.btn_fb).length > 0){
				$j(poppin_desk.table.btn_fb).click(function(){
					
					settings.socialClicked = 'fb';
					poppin_actions.setCanvasImages();
					
					var w = window.open('about:blank','Share','location=1,toolbar=0,scrollbars=1,status=1,menubar=0,width=575,height=240');
					settings.socialWin = w;
					
					return false;
				});
			}
			
			if($j(poppin_desk.table.btn_pt).length > 0){
				$j(poppin_desk.table.btn_pt).click(function(){
					
					settings.socialClicked = 'pt';
					poppin_actions.setCanvasImages();
					
					var w = window.open('about:blank','Share','location=1,toolbar=0,scrollbars=1,status=1,menubar=0,width=665,height=300');
					settings.socialWin = w;
					
					return false;
				});
			}
			
			
			if($j(poppin_desk.cart.btn_clear).length > 0){
			
				$j(poppin_desk.cart.btn_clear).click(function(){
					poppin_actions.clearAll();
				});
			}
			
			if($j(poppin_desk.cart.btn_add).length > 0){
				$j(poppin_desk.cart.btn_add).click(function(){
					poppin_actions.addtoCart();
				});
			}
			
			if($j(poppin_desk.cart.btn_add2).length > 0){
				$j(poppin_desk.cart.btn_add2).click(function(){
					poppin_actions.addtoCart();
				});
			}
			
			if($j(poppin_desk.cart.btn_update).length > 0){
				$j(poppin_desk.cart.btn_update).click(function(){
					poppin_actions.updateCart();
				});
			}
			
			/*$j(poppin_desk.cart.cart_title).click(function(){
				if($j(this).hasClass('has-items')){
					poppin_actions.showCart();
				}
			});*/
			
			var time_cart;
			
			$j(poppin_desk.cart.cart_head).hover(function(){
				
				clearTimeout(time_cart);
				
				if($j(poppin_desk.cart.cart_title).hasClass('has-items') && !$j(poppin_desk.cart.cart_title).hasClass('open')){
					poppin_actions.showCart();
				}
				
			}, function(){
				
			});
			
			$j(poppin_desk.cart.container).hover(function(){
				
				clearTimeout(time_cart);
				
			}, function(){
				
				if($j(poppin_desk.cart.cart_title).hasClass('has-items') && $j(poppin_desk.cart.cart_title).hasClass('open')){
					
					time_cart = setTimeout(poppin_actions.showCart, 500);
					
				}
				
			});
			
			$j(window).load(function(){
				poppin_actions.loading(false);
			});

		});
	}
	
/*$j(function(){
	$j('#design-a-desc-configurator').deskConfigurator();
});*/