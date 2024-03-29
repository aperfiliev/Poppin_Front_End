/* gp-slide.js */
(function($){$.fn.gpSlide=function(opts){var defaults={"speed":6000,"animationSpeed":1000,"goto":true,"prev":false,"next":false,"responsive":true,"autorun":true,"animation":'fade'};var opts=$.extend(defaults,opts);return this.each(function(){var self=$(this);var _interface={create:function(obj_this){if(obj_this.hasClass('gp-slide')){return}obj_this.addClass('gp-slide');obj_this.find('ul:first').addClass('gp-slide-items').wrap('<div class="gp-wrap-slide" />');this.wrap_slide=obj_this.find('.gp-wrap-slide');this.wrap_slide_items=obj_this.find('.gp-slide-items');this.items=self.find('.gp-slide-items li');this.total_items=this.items.length-1;if(opts.animation=='fade'){this.items.css({position:'absolute',left:0,top:0,opacity:0});this.items.first().addClass('active').css({'z-index':2,opacity:1})}if(opts.animation=='slide'){var item_width=parseInt(this.items.css('width'));if(!item_width){item_width=parseInt(this.items.width())}var total_width=(item_width*parseInt((this.total_items+1)));this.wrap_slide_items.css({width:total_width});this.items.css({"float":'left',"width":item_width});this.size=item_width}if(opts.prev){this.wrap_slide.prepend('<div class="gp-btn-left" />')}if(opts.next){this.wrap_slide.append('<div class="gp-btn-right" />')}if(opts["goto"]){var active=' active ims-secondary-color';obj_this.append('<ul class="gp-wrap-slide-btns" />');this.items.each(function(i){if(i>0){active=''}obj_this.find('.gp-wrap-slide-btns').append('<li class="btn-'+i+active+'" data-position="'+i+'">'+i+'</li>')})}this.element_slide=obj_this;this.btn_left=this.wrap_slide.find('.gp-btn-left');this.btn_right=this.wrap_slide.find('.gp-btn-right');this.wrap_btns=obj_this.find('.gp-wrap-slide-btns');this.btn=this.wrap_btns.find('li');this.current_slide=0}};var interfaceNew=new _interface.create(self);slide={"next":function(obj){if(!obj.items){return}if(opts["goto"]){var next_btn=(obj.current_slide+1);if(obj.current_slide+1>obj.total_items){next_btn=0}$(obj.btn).removeClass('active').removeClass('ims-secondary-color');$(obj.btn[next_btn]).addClass('active').addClass('ims-secondary-color')}if(opts.animation=='fade'){var active_item=obj.items.get(obj.current_slide);var next_item=obj.items.get(obj.current_slide+1);if(obj.current_slide+1>obj.total_items){next_item=obj.items.get(0)}$(next_item).css({'z-index':1,opacity:1});$(active_item).animate({opacity:0},opts.animationSpeed,function(){obj.items.removeClass('active').removeClass('ims-secondary-color').css({'z-index':'auto'});$(next_item).addClass('active').addClass('ims-secondary-color').css({'z-index':2});obj.current_slide=(obj.current_slide+1);if(obj.current_slide>obj.total_items){obj.current_slide=0}})}if(opts.animation=='slide'){var next_item=(obj.current_slide+1);if(obj.current_slide+1>obj.total_items){next_item=0}$(obj.wrap_slide_items).animate({marginLeft:(0-(obj.size*next_item))},opts.animationSpeed,function(){obj.current_slide=(obj.current_slide+1);if(obj.current_slide>obj.total_items){obj.current_slide=0}})}},"prev":function(obj){if(!obj.items){return}if(opts["goto"]){var prev_btn=(obj.current_slide-1);if(obj.current_slide-1<0){prev_btn=obj.total_items}$(obj.btn).removeClass('active').removeClass('ims-secondary-color');$(obj.btn[prev_btn]).addClass('active').addClass('ims-secondary-color')}if(opts.animation=='fade'){var active_item=obj.items.get(obj.current_slide);var prev_item=obj.items.get(obj.current_slide-1);if(obj.current_slide-1<0){prev_item=obj.items.get(obj.total_items)}$(prev_item).css({'z-index':1,opacity:1});$(active_item).animate({opacity:0},opts.animationSpeed,function(){obj.items.removeClass('active').removeClass('ims-secondary-color').css({'z-index':'auto'});$(prev_item).addClass('active').addClass('ims-secondary-color').css({'z-index':2});obj.current_slide=(obj.current_slide-1);if(obj.current_slide<0){obj.current_slide=obj.total_items}})}if(opts.animation=='slide'){var prev_item=(obj.current_slide-1);if(obj.current_slide-1<0){prev_item=obj.total_items}$(obj.wrap_slide_items).animate({marginLeft:(0-(obj.size*prev_item))},opts.animationSpeed,function(){obj.current_slide=(obj.current_slide-1);if(obj.current_slide<0){obj.current_slide=obj.total_items}})}},"goto":function(pos,obj){if(!obj.items){return}$(obj.btn).removeClass('active').removeClass('ims-secondary-color');$(obj.btn[pos]).addClass('active').addClass('ims-secondary-color');if(opts.animation=='fade'){var active_item=obj.items.get(obj.current_slide);var goto_item=obj.items.get(pos);if(obj.current_slide==pos){return}$(goto_item).css({'z-index':1,opacity:1});$(active_item).animate({opacity:0},opts.animationSpeed,function(){obj.items.removeClass('active').removeClass('ims-secondary-color').css({'z-index':'auto'});$(goto_item).addClass('active').addClass('ims-secondary-color').css({'z-index':2});obj.current_slide=pos})}if(opts.animation=='slide'){if(obj.current_slide==pos){return}$(obj.wrap_slide_items).animate({marginLeft:(0-(obj.size*pos))},opts.animationSpeed,function(){obj.current_slide=pos})}},"autorun":function(obj){var timer;function run(){timer=setInterval(function(){slide.next(obj)},opts.speed)}if(opts.prev){$(obj.btn_left).hover(function(){clearTimeout(timer)},function(){run()})}if(opts.next){$(obj.btn_right).hover(function(){clearTimeout(timer)},function(){run()})}if(opts["goto"]){$(obj.wrap_btns).hover(function(){clearTimeout(timer)},function(){run()})}run()}};if(opts.next){$(interfaceNew.btn_right).live('click',function(e){slide.next(interfaceNew);e.preventDefault()})}if(opts.prev){$(interfaceNew.btn_left).live('click',function(e){slide.prev(interfaceNew);e.preventDefault()})}if(opts["goto"]){$(interfaceNew.btn).live('click',function(e){slide["goto"]($(this).data('position'),interfaceNew);e.preventDefault()})}if(opts.autorun){slide.autorun(interfaceNew)}if(opts.responsive){$(window).resize(function(e){if(!interfaceNew.items){return}if(interfaceNew.wrap_slide.width()<interfaceNew.items.width()||interfaceNew.wrap_slide.width()>interfaceNew.items.width()){interfaceNew.size=interfaceNew.wrap_slide.width();interfaceNew.items.width(interfaceNew.size);interfaceNew.wrap_slide_items.css({width:(interfaceNew.size*(interfaceNew.total_items+1)),marginLeft:0});interfaceNew.current_slide=0}})}})}})(jQuery);$j(function(){if($j('.slide-wrap ul li').length>0){$j('.slide-wrap').gpSlide()}});
/* end of gp-slide.js */
$(".search-social").append($(".free-shipping-container"));
$(".breadcrumbs").css("display", "none");
$("#contentBody").css("padding-bottom", "0");
$("#contentBody").parent().next().remove();
$("#div__body").css("padding-bottom", "0");

/* say-no layover functions */
$(document).ready(function() {
	$('body').on('click','#leadform-overlay, .close-button', function(){
		closeLeadForm();
	});
	$('body').on('click','a.request', function(){
		openLeadForm();
	});
});

/* end of say-no layover functions */

/* lead form functions */
/*
 * GA event and declare lead form
 */
function campaignCheck() {
	var regex = /[?&]([^=#]+)=([^&#]*)/g,
	url = window.location.href,
	_form_url = 'undefined',
	_label = 'undefined',
	_leadsource = '22 SEMOFFICE',
	params = {},
        pnum = '(855) 498-3943',
	match;
	
	while(match = regex.exec(url)) {
		params[match[1]] = match[2];
	}
	
	// choke for getting leadsource from cookies
	if(true) {
		_leadsource = '22 SEMOFFICE';
	}

	_form_url = 'http://www.poppin.com/app/site/crm/externalleadpage.nl?compid=3363929&formid=29&h=24c40b9a228c09dd9a46&amp;leadsource='+_leadsource+'&amp;pnum='+pnum;
	
	switch (params.campaign_id) {
	case '2':
		_label = 'campaign_id = 2';
		break;
	case '3':
		_label = 'campaign_id = 3';
		break;
	case '4':
		_label = 'campaign_id = 4';
		break;
	default:
		_label = 'campaign_id = 1';
	}
	
	createLeadForm(_form_url);
	_gaq.push(['_trackEvent', 'Office-Supplies', 'Landing Page', _label]);
}
campaignCheck();

function createLeadForm(url) {
	var leadformHtml = '<div id="leadform-overlay">' +
		 '<div class="leadform">' +
		 '<iframe scrolling="no" frameborder="0" allowtransparency="yes" marginheight="0" marginwidth="0" src="'+url+'" style="width: 785px;height: 612px;overflow: hidden;"></iframe>' +
		 '<div class="close-button"></div>' +
		 '</div>' +
		 '</div>';
	jQuery("#office-supplies").append(leadformHtml);
}
function openLeadForm() {
	jQuery("#leadform-overlay").css("display", "block");
}
function closeLeadForm() {
	jQuery("#leadform-overlay").css("display", "none");
}
/* end of lead form functions */
