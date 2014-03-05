/* gp-slide.js */
(function($){$.fn.gpSlide=function(opts){var defaults={"speed":6000,"animationSpeed":1000,"goto":true,"prev":false,"next":false,"responsive":true,"autorun":true,"animation":'fade'};var opts=$.extend(defaults,opts);return this.each(function(){var self=$(this);var _interface={create:function(obj_this){if(obj_this.hasClass('gp-slide')){return}obj_this.addClass('gp-slide');obj_this.find('ul:first').addClass('gp-slide-items').wrap('<div class="gp-wrap-slide" />');this.wrap_slide=obj_this.find('.gp-wrap-slide');this.wrap_slide_items=obj_this.find('.gp-slide-items');this.items=self.find('.gp-slide-items li');this.total_items=this.items.length-1;if(opts.animation=='fade'){this.items.css({position:'absolute',left:0,top:0,opacity:0});this.items.first().addClass('active').css({'z-index':2,opacity:1})}if(opts.animation=='slide'){var item_width=parseInt(this.items.css('width'));if(!item_width){item_width=parseInt(this.items.width())}var total_width=(item_width*parseInt((this.total_items+1)));this.wrap_slide_items.css({width:total_width});this.items.css({"float":'left',"width":item_width});this.size=item_width}if(opts.prev){this.wrap_slide.prepend('<div class="gp-btn-left" />')}if(opts.next){this.wrap_slide.append('<div class="gp-btn-right" />')}if(opts["goto"]){var active=' active ims-secondary-color';obj_this.append('<ul class="gp-wrap-slide-btns" />');this.items.each(function(i){if(i>0){active=''}obj_this.find('.gp-wrap-slide-btns').append('<li class="btn-'+i+active+'" data-position="'+i+'">'+i+'</li>')})}this.element_slide=obj_this;this.btn_left=this.wrap_slide.find('.gp-btn-left');this.btn_right=this.wrap_slide.find('.gp-btn-right');this.wrap_btns=obj_this.find('.gp-wrap-slide-btns');this.btn=this.wrap_btns.find('li');this.current_slide=0}};var interfaceNew=new _interface.create(self);slide={"next":function(obj){if(!obj.items){return}if(opts["goto"]){var next_btn=(obj.current_slide+1);if(obj.current_slide+1>obj.total_items){next_btn=0}$(obj.btn).removeClass('active').removeClass('ims-secondary-color');$(obj.btn[next_btn]).addClass('active').addClass('ims-secondary-color')}if(opts.animation=='fade'){var active_item=obj.items.get(obj.current_slide);var next_item=obj.items.get(obj.current_slide+1);if(obj.current_slide+1>obj.total_items){next_item=obj.items.get(0)}$(next_item).css({'z-index':1,opacity:1});$(active_item).animate({opacity:0},opts.animationSpeed,function(){obj.items.removeClass('active').removeClass('ims-secondary-color').css({'z-index':'auto'});$(next_item).addClass('active').addClass('ims-secondary-color').css({'z-index':2});obj.current_slide=(obj.current_slide+1);if(obj.current_slide>obj.total_items){obj.current_slide=0}})}if(opts.animation=='slide'){var next_item=(obj.current_slide+1);if(obj.current_slide+1>obj.total_items){next_item=0}$(obj.wrap_slide_items).animate({marginLeft:(0-(obj.size*next_item))},opts.animationSpeed,function(){obj.current_slide=(obj.current_slide+1);if(obj.current_slide>obj.total_items){obj.current_slide=0}})}},"prev":function(obj){if(!obj.items){return}if(opts["goto"]){var prev_btn=(obj.current_slide-1);if(obj.current_slide-1<0){prev_btn=obj.total_items}$(obj.btn).removeClass('active').removeClass('ims-secondary-color');$(obj.btn[prev_btn]).addClass('active').addClass('ims-secondary-color')}if(opts.animation=='fade'){var active_item=obj.items.get(obj.current_slide);var prev_item=obj.items.get(obj.current_slide-1);if(obj.current_slide-1<0){prev_item=obj.items.get(obj.total_items)}$(prev_item).css({'z-index':1,opacity:1});$(active_item).animate({opacity:0},opts.animationSpeed,function(){obj.items.removeClass('active').removeClass('ims-secondary-color').css({'z-index':'auto'});$(prev_item).addClass('active').addClass('ims-secondary-color').css({'z-index':2});obj.current_slide=(obj.current_slide-1);if(obj.current_slide<0){obj.current_slide=obj.total_items}})}if(opts.animation=='slide'){var prev_item=(obj.current_slide-1);if(obj.current_slide-1<0){prev_item=obj.total_items}$(obj.wrap_slide_items).animate({marginLeft:(0-(obj.size*prev_item))},opts.animationSpeed,function(){obj.current_slide=(obj.current_slide-1);if(obj.current_slide<0){obj.current_slide=obj.total_items}})}},"goto":function(pos,obj){if(!obj.items){return}$(obj.btn).removeClass('active').removeClass('ims-secondary-color');$(obj.btn[pos]).addClass('active').addClass('ims-secondary-color');if(opts.animation=='fade'){var active_item=obj.items.get(obj.current_slide);var goto_item=obj.items.get(pos);if(obj.current_slide==pos){return}$(goto_item).css({'z-index':1,opacity:1});$(active_item).animate({opacity:0},opts.animationSpeed,function(){obj.items.removeClass('active').removeClass('ims-secondary-color').css({'z-index':'auto'});$(goto_item).addClass('active').addClass('ims-secondary-color').css({'z-index':2});obj.current_slide=pos})}if(opts.animation=='slide'){if(obj.current_slide==pos){return}$(obj.wrap_slide_items).animate({marginLeft:(0-(obj.size*pos))},opts.animationSpeed,function(){obj.current_slide=pos})}},"autorun":function(obj){var timer;function run(){timer=setInterval(function(){slide.next(obj)},opts.speed)}if(opts.prev){$(obj.btn_left).hover(function(){clearTimeout(timer)},function(){run()})}if(opts.next){$(obj.btn_right).hover(function(){clearTimeout(timer)},function(){run()})}if(opts["goto"]){$(obj.wrap_btns).hover(function(){clearTimeout(timer)},function(){run()})}run()}};if(opts.next){$(interfaceNew.btn_right).live('click',function(e){slide.next(interfaceNew);e.preventDefault()})}if(opts.prev){$(interfaceNew.btn_left).live('click',function(e){slide.prev(interfaceNew);e.preventDefault()})}if(opts["goto"]){$(interfaceNew.btn).live('click',function(e){slide["goto"]($(this).data('position'),interfaceNew);e.preventDefault()})}if(opts.autorun){slide.autorun(interfaceNew)}if(opts.responsive){$(window).resize(function(e){if(!interfaceNew.items){return}if(interfaceNew.wrap_slide.width()<interfaceNew.items.width()||interfaceNew.wrap_slide.width()>interfaceNew.items.width()){interfaceNew.size=interfaceNew.wrap_slide.width();interfaceNew.items.width(interfaceNew.size);interfaceNew.wrap_slide_items.css({width:(interfaceNew.size*(interfaceNew.total_items+1)),marginLeft:0});interfaceNew.current_slide=0}})}})}})(jQuery);$j(function(){if($j('.slide-wrap ul li').length>0){$j('.slide-wrap').gpSlide()}});
/* end of gp-slide.js */
/* get Lead Source functions */
function getCommentsFromEl(el, asArray) {
	var result,
	$el = $(el).contents();
	result = $el.filter(function () {
			return this.nodeType == 8;
		});
	if (asArray) {
		result = $.makeArray(result.map(function () {
			return this.nodeValue;
		}));
	}
	return result;
};
$.fn.getComments = function (asArray) {
	return getCommentsFromEl(this, asArray);
};
function getLeadSource() {
	
	var comments = $("head").getComments(),
		i = comments.length,
		g = '', comment, ls = {};
	
	while(i !== 0) {
		i--;
		comment = comments[i].data;
		if(comment.search("leadsource") !== -1) {
			g = comment;
			break;
		}
	}
	
	var f = g.indexOf("leadsource=")+11;
	var s = g.substring(f, g.indexOf("=", f)).lastIndexOf(" ");
	var result = g.substring(f, f+s).trim();
	
	if(result != '') {
		switch (g) {
		case '17':
			result = '17 B2B_Facebook_Offer';
			break;
		case '18':
			result = '18 B2B_Paid Search_Offer';
			break;
		case '19':
			result = '19 B2B_Paid Search_NoOffer';
			break;
		default: //16
			result = '16 B2B_Facebook_NoOffer';
		}
		return result;
	} else {
		return '15 B2B Direct Mail Lead Generation';
	}
};

/* end of get Lead Source functions */

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
	$('body').on('click','.call-main a', function(){
		openLeadForm();
	});
	$('body').on('click','.prefooter-info a', function(){
		openLeadForm();
	});
});

/* end of say-no layover functions */

/* lead form functions */
/*
 * GA event and declare lead form
 */
function campaignCheck() {
	var //regex = /[?&]([^=#]+)=([^&#]*)/g,
		url = window.location.href,
		_label = 'undefined',
		_leadsource = getLeadSource(),
		_form_url = 'http://sandbox.poppin.com/app/site/crm/externalleadpage.nl?compid=3363929&formid=31&h=aca5aa20af2daa9eb9ce&leadsource='+_leadsource,
		_phoneNumber = '(866) 547-0970',
		params = {},
		match;

	/*while(match = regex.exec(url)) {
		params[match[1]] = match[2];
	}*/
	
	params = url.split("/");
	match = params[params.lastIndexOf("WorkHappy") + 1];

	//switch (params.campaign_id) {
	switch (match) {
		case 'FB2':
			_label = 'B2B_Facebook_Offer';
			_phoneNumber = '(866) 547-0970';
			$(".prefooter-info").first().append(" to get your <strong>free $100</strong>");
			$(".call-strings").after($(".call-main"));
			$(".call-strings").html("...free, to help you ditch the drab!").css("margin-left", "170px").css("padding-top", "26px").css("line-height", "30px").css("color", "black");
			$(".call-main").html('CALL TODAY <strong class="phoneNumber">(866) 547-0970</strong> OR <strong><a href="#" onclick="return false;">Click Here</a></strong>TO CLAIM.');
			$(".call-us").css("background-image", "url(http://sandbox.poppin.com/site/pp-sources/workhappy/call_.jpg)");
			break;
		case 'SE2':
			_label = 'B2B_Paid Search_Offer';
			_phoneNumber = '(855) 784-2263';
			$(".prefooter-info").first().append(" to get your <strong>free $100</strong>");
			$(".call-strings").after($(".call-main"));
			$(".call-strings").html("...free, to help you ditch the drab!").css("margin-left", "170px").css("padding-top", "26px").css("line-height", "30px").css("color", "black");
			$(".call-main").html('CALL TODAY <strong class="phoneNumber">(866) 547-0970</strong> OR <strong><a href="#" onclick="return false;">Click Here</a></strong>TO CLAIM.');
			$(".call-us").css("background-image", "url(http://sandbox.poppin.com/site/pp-sources/workhappy/call_.jpg)");
			break;
		case 'SE1':
			_label = 'B2B_Paid Search_NoOffer';
			_phoneNumber = '(855) 784-2263';
			$(".cat-heading p strong:contains('Desk Accessories + Office Essentials:')").text("Office Essentials:");
			break;
		default: //FB1
			_label = 'B2B_Facebook_NoOffer';
			_phoneNumber = '(866) 547-0970';
			$(".cat-heading p strong:contains('Desk Accessories + Office Essentials:')").text("Office Essentials:");
	}
	$('.phoneNumber').text(_phoneNumber);
	_form_url = _form_url + '&pnum=' + _phoneNumber;
	
	createLeadForm(_form_url);
	_gaq.push(['_trackEvent', 'Work Happy', 'Landing Page', _label]);
}
campaignCheck();

function createLeadForm(url) {
	var leadformHtml = '<div id="leadform-overlay">' +
		'<div class="leadform">' +
		'<iframe scrolling="no" frameborder="0" allowtransparency="yes" marginheight="0" marginwidth="0" src="'+url+'" style="width: 785px;height: 612px;overflow: hidden;"></iframe>' +
		'<div class="close-button"></div>' +
		'</div>' +
		'</div>';
	jQuery("#workhappy").append(leadformHtml);
}
function openLeadForm() {
	jQuery("#leadform-overlay").css("display", "block");
}
function closeLeadForm() {
	jQuery("#leadform-overlay").css("display", "none");
}
/* end of lead form functions */