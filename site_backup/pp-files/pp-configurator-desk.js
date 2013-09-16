$j.fn.deskConfigurator = function(options){
		var settings = $j.extend({
			colorsJson: '',
			quickPickTitle: 'Quick Pick',
			cartTitle: 'My Desk',
			cartDefaultText: 'Mouseover a product on the desktop to get started or select a Quick Pick color.',
			cartCurrency: '$',
			itemsCart: new Array(),
			grandTotal: 0
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
							'inboxes':	new Array('1', 'set of 2 stacking inboxes'),
							'bitsbobs':	new Array('2', 'bits + bobs tray'),
							//'halftray':	new Array('3', 'accessory tray'),
							'cup':		new Array('4', 'pen cup'),
							'pens':		new Array('5', 'pack of 12 signature ballpoint pens'),
							'ruler':	new Array('6', 'ruler'),
							'scissors':	new Array('7', 'scissors'),
							'tape':		new Array('8', 'tape dispenser'),
							'stapler':	new Array('9', 'stapler'),
							'spiral':	new Array('10', 'medium spiral notebook')
						},
						
						default_images: {
							'inboxes':	'/site/pp-design-desk/default-items/inboxes.png',
							'bitsbobs':	'/site/pp-design-desk/default-items/bitsbobs.png',
							//'halftray':	'/site/pp-design-desk/default-items/halftray.png',
							'cup':		'/site/pp-design-desk/default-items/cup.png',
							'pens':		'/site/pp-design-desk/default-items/pens.png',
							'ruler':	'/site/pp-design-desk/default-items/ruler.png',
							'scissors':	'/site/pp-design-desk/default-items/scissors.png',
							'tape':		'/site/pp-design-desk/default-items/tape.png',
							'stapler':	'/site/pp-design-desk/default-items/stapler.png',
							'spiral':	'/site/pp-design-desk/default-items/spiral.png'
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
						
						default_products_container:	$j(default_products),
						
						collection: null,
						
						new_product: function(product_id, product_type_id, product_image, product_image_thumb, product_name, product_price){
							
							var item_empty 		= $j('<li></li>').addClass('item')
													.attr({'id': product_id})
													.data({
														'product_id': product_id,
														'product_type_id': product_type_id,
														'product_image': product_image,
														'product_image_thumb': product_image_thumb,
														'product_name': product_name,
														'product_price': product_price
													});
													
							var item_image_thumb	= $j('<img>').addClass('thumb-image').attr({src: product_image_thumb});
							
							return $j(item_empty)
								.append(item_image_thumb);

						}
						
					}
					
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
						.append(this.table.type_stapler);
						
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
						btn_add: 		$j('<button></button>').attr({type: 'button', title: 'Add to cart'}).addClass('add-to-cart').text('Add to cart'),
						btn_add2: 		$j('<button></button>').attr({type: 'button', title: 'Add to cart'}).addClass('add-to-cart').text('Add to cart'),
						btn_clear:		$j('<button></button>').attr({type: 'button', title: 'Clear all'}).addClass('clear-all').text('Clear all'),
						btn_update:		$j('<button></button>').attr({type: 'button', title: 'Update'}).addClass('update').text('Update'),
						
						new_product: function(product_id, product_type_id, product_name, product_price){
							
							var item_empty = $j('<li></li>')
												.addClass('item')
												.attr({'id': product_id})
												.data({price: product_price, product_type_id: product_type_id})
												.css({height: 0, opacity: 0});
												
							var item_content			= $j('<div></div>').addClass('item-content');
							var item_qty				= $j('<input />').attr({type: 'text', name: 'qty'}).addClass('qty').val(1);
							var item_id					= $j('<input />').attr({type: 'hidden', name: 'itemid'}).addClass('itemid').val(product_id);
							var item_name				= $j('<span></span>').addClass('name').text(product_name);
							var item_price				= $j('<span></span>').addClass('price').text(' - '+settings.cartCurrency+product_price);
							var item_remove				= $j('<span></span>').addClass('remove');
							
							$j(item_content)
								.append(item_qty)
								.append(item_id)
								.append(item_name)
								.append(item_price)
								.append(item_remove);
							
							return $j(item_empty).append(item_content);

						}
					}
					
					var cart_head 				= $j('<div></div>').addClass('cart-head');
					var cart_title 				= $j('<span></span>').addClass('cart-title').text(settings.cartTitle);
					var cart_default_item 		= $j('<li></li>').addClass('cart-default-item').text(settings.cartDefaultText);
					var cart_foot 				= $j('<div></div>').addClass('cart-foot');
					var cart_total_container 	= $j('<div></div>').addClass('cart-total-wrap');
					var cart_total_text 		= $j('<span></span>').addClass('cart-total').text('Total');
					
					$j(cart_head).append(cart_title).append(this.cart.btn_add);
					$j(this.cart.list).append(cart_default_item);
					$j(cart_total_container).append(cart_total_text).append(this.cart.total_price);
					$j(cart_foot).append(cart_total_container).append(this.cart.btn_clear).append(this.cart.btn_update).append(this.cart.btn_add2);
					$j(this.cart.container).append(cart_head).append(this.cart.list).append(cart_foot);
					
					
					$j(container).append(this.cart.container);
					
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
					
					$j(container).append(quick_pick_container);
					
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
							
							settings.itemsCart = new Array();
							settings.grandTotal = 0;
							
							$j(view.cart.container).addClass('cart-empty');
							$j(view.cart.total_price).html('');
							
							actions.resetTable();
							
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
						
						updateCart: function(){

							var gran_total = 0;
							var cart_list = view.cart.list[0];
							var remove_items = new Array();
							
							if(settings.itemsCart.length > 0){
								
								//remove items qty 0
								$j.each(settings.itemsCart, function(key, id){
									
									var element_id 			= '#'+id;
									var element_in_cart 	= $j(element_id, cart_list);
									var qty 				= $j('.qty', element_in_cart).val();
									var price 				= $j(element_in_cart).data('price');
									var product_type_id 	= $j(element_in_cart).data('product_type_id');
									
									if(qty == 0){
										actions.removeQtyZero(id, price, product_type_id);
									}
									
									
								});
								
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
									
								}
								
								if(settings.itemsCart.length == 0){
									$j(view.cart.container).addClass('cart-empty');
									
									settings.grandTotal = 0;
									actions.pushPrice();
									
								}
								
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
											$j(view.cart.container).addClass('cart-empty');
											
											settings.grandTotal = 0;
											actions.pushPrice();
											
										}
										
									});
									
								}
							});
							
						},
						
						clearItemsInCartByType: function(product_type_id){
							
							$j('li', view.cart.list[0]).each(function(){
								
								var type_id 	= $j(this).data('product_type_id');
								var id 			= $j(this).attr('id');
								
								if(type_id == product_type_id){
									
									$j(this).animate({height: 0, opacity: 0}, 400, function(){
										$j(this).remove();
									});
									
									var check = $j.inArray(id, settings.itemsCart);
									
									if(check != '-1'){
										settings.itemsCart.splice(check,1);
									}
									
								}
								
							});
							
							return true;
							
						},
						
						setCart: function(product_id, product_type_id, product_name, product_price){
							
							$j(view.cart.container).removeClass('cart-empty');
							
							if(!actions.checkItemInCart(product_id)){
								
								if( actions.clearItemsInCartByType(product_type_id) ){
									
									settings.itemsCart.push(product_id);
									//settings.grandTotal = (parseFloat(settings.grandTotal) + parseFloat(product_price));
									
									var new_product = view.cart.new_product(product_id, product_type_id, product_name, product_price);
									new_product = $j(new_product[0]);
									
									new_product.find('.remove').click(function(){
										actions.remove(product_id, product_price, product_type_id);
									});
									
									$j(view.cart.list).append( new_product );
									
									new_product.animate({height: 43, opacity: 1});
									
									//actions.pushPrice();
									
									actions.updateCart();
								}
								
							}
							
							actions.loadingDialogBox(false);
							
						},
						
						update: function(product_id, product_type_id, product_image, product_name, product_price){
							
							var type_obj = actions.getObjTypeById(product_type_id);
							
							if(type_obj){
								$j('img.desk-image', type_obj).attr({'src': product_image});
								actions.setCart(product_id, product_type_id, product_name, product_price);
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
										
										if(product_type_id && product_image){
											actions.update(product_id, product_type_id, product_image, product_name, product_price);
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
								if(key){
									reorder_array.push(value);
								}
							});
							
							return reorder_array;
							//console.log(data);
							//return data;
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
											
											if(this.price){
												product_price = this.price;
											}
											
											if(product_type_id && product_image_thumb && product_image && product_price){
												
												var type_obj = actions.getObjTypeById(product_type_id);
												var new_item = view.table.new_product(product_id, product_type_id, product_image, product_image_thumb, product_name, product_price);
									
												$j(new_item[0]).click(function(){
													actions.update(product_id, product_type_id, product_image, product_name, product_price);
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
								$j('.color-name', obj).css({opacity: 0, bottom: '25px', display: 'block'}).animate({opacity: 1, bottom: '30px'}, 200);
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
							var bottom = obj_dialogbox.css('bottom');
							obj_dialogbox.css({opacity: 0, display: 'block', bottom: (parseInt(bottom) - 5)}).animate({opacity: 1, bottom: parseInt(bottom)}, 200, function(){ actions.loadingDialogBox(false); });
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

						}
						
					}
				}
				
			}
		
		return this.each(function(){
			
			var poppin_data = new configurator.model();
			var poppin_desk = new configurator.createInterface(poppin_data);
			var poppin_actions = new configurator.controller(poppin_desk);
			
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
			
			$j(window).load(function(){
				poppin_actions.loading(false);
			});

		});
	}
	
$j(function(){
	$j('#design-a-desc-configurator').deskConfigurator();
});