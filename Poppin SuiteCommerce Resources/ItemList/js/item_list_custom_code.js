//The tab image is load from the File Cabinet,
//the image name should be the name of the tab
//just text without spaces or special characters and all lowercase
//example: Category Name => categoryname.jpg
var parent_category = $j('.category_data .parent_category').text();
var name_category = $j('.category_data .name_category').text();
if(parent_category == 'No'){
	name_image = name_category.replace(/[^A-Za-z0-9]/g,"");
	name_image = name_image.toLowerCase();
	image_url = '/site/pp-cat-images/'+name_image+'.jpg';
	$j('<img />').error(function(){
		return false;
	}).load(function(){
		$j('.cat-banner').html(this);
	}).attr({src: image_url, alt: name_category});
}

