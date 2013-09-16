$j(document).ready(function() {
	var getcards = $j('.card-wrap').html()
	if ($j('.greytitle').html() == 'Address Information'){
	$j('.table-content-area td:first').append('<div class="card-wrap">'+getcards+'</div>')
	
	} else if ($j('.greytitle:last').html() == 'Enter New Shipping Address'){
		$j('#tbl_submitter').parent().parent().parent().parent().parent().prepend('<div class="card-wrap">'+getcards+'</div>')}

	
$j('.message-textarea').keyup(countmessage);
$j('.card-no-card input#card-message').change(hideshow);
$j('.card-no-card input#no-card').change(hideshow);
$j('.card-no-card label').click(hideshow)

$j('.select-ocation #ocation').change(selectocation)


			$j.getJSON('https://checkout.sandbox.netsuite.com/c.3363929/Poppin/CardMessage/cardmessage.ss?action=get',function(data){
				$j.each(data, function(entryIndex, entry){
					if (entry.columns.custrecord_cardmessage_occasion !== undefined){
					var messelect = '<option id="id_'+entry.columns.custrecord_cardmessage_occasion.internalid+'" value="'+entry.columns.custrecord_cardmessage_occasion.name+'">' + entry.columns.custrecord_cardmessage_occasion.name+ '</option>';	
					$j('#ocation').append(messelect);
					$j('#ocation option:first').attr('id','no-select')
						$j('#ocation [id]').each(function(){
						  var ids = $j('[id="'+this.id+'"]');
						  if(ids.length>1 && ids[0]==this)
							$j('#ocation #'+this.id+':last').remove();
						}); }
						
				});						   
				$j.each(data, function(entryIndex, entry){
					if (entry.columns.custrecord_cardmessage_occasion !== undefined){
					var messclick = '<li id="id_'+entry.columns.custrecord_cardmessage_occasion.internalid+'"><a>' + entry.columns.custrecord_cardmessage_message + '</a></li>';	
					$j('.message-selector .message-content ul').append(messclick);
					$j('.message-content li a').click(addmessages)
					}
					});						   
			});


});


function countmessage(){
	var message_total = 250;
	var longitud = $j(this).val().length;
	var resto = message_total - longitud;
	var messagecontent = $j(this).val()
	
	$j('.message-char').html(resto);
	if(resto <= 0){
	$j('.message-textarea').attr("maxlength", 250);
	}
$j.ajax({
      type: 'POST',
      data: messagecontent,
      url: 'https://checkout.sandbox.netsuite.com/c.3363929/Poppin/CardMessage/cardmessage.ss?action=set&msg='+messagecontent,
      cache:false
    });
	}

function addmessages(){
	var messagelink = $j(this).html();
	$j('.message-area textarea').val(messagelink);
	var message_total = 250;
	var longitud = $j(this).html().length;
	var resto = message_total - longitud;
	$j('.message-char').html(resto);

$j.ajax({
      type: 'POST',
      data: messagelink,
      url: 'https://checkout.sandbox.netsuite.com/c.3363929/Poppin/CardMessage/cardmessage.ss?action=set&msg='+messagelink,
      cache:false
    });

	}

function selectocation(){
		var selectedocation = $j('.select-ocation option:selected').attr('id')
		var selectedocationname = $j('.select-ocation option:selected').val()
					$j.ajax({
				  type: 'POST',
				  data: selectedocation,
				  url: 'https://checkout.sandbox.netsuite.com/c.3363929/Poppin/CardMessage/cardmessage.ss?action=ocation&ocationmsg='+selectedocationname,
				  cache:false
				});
if ($j('.card-no-card input#card-message').is(':checked')){
			if(selectedocation!=='no-select'){
			$j('.message-selector .wrap-content li').hide()
			$j('.message-selector #'+selectedocation).show()
			$j('.message-content').show()
			$j('.message-selector').show()

			} else {$j('.message-selector').hide()
					$j.ajax({
					  type: 'POST',
					  data: 'No Card Message',
					  url: 'https://checkout.sandbox.netsuite.com/c.3363929/Poppin/CardMessage/cardmessage.ss?action=ocation&ocationmsg=No Occasion Selected',
					  cache:false
					});
			}

			}
		}
	
	
function hideshow() {
		$j(this).prev().attr('checked','checked')
			if ( $j(this).attr('id') == 'card-message' ){
				$j('.select-card .message-area').slideDown();
					var selectedocation = $j('.select-ocation option:selected').attr('id')
					if(selectedocation!=='no-select'){
						$j('.message-selector .wrap-content li').hide()
						$j('.message-selector #'+selectedocation).show()
						$j('.message-content').show()
						$j('.message-selector').show()
						$j('.message-area textarea').val('')
						$j('.message-char').html('250')

					} //else {$j('.message-selector').show();$j('.message-selector .message-content').show()}
			} else {
				$j('.select-card .message-area').slideUp();
				$j('.message-area textarea').val('')
				$j('.message-selector').hide()
				$j('.message-area textarea').val('No Card Message');
				$j.ajax({
					  type: 'POST',
					  data: 'No Card Message',
					  url: 'https://checkout.sandbox.netsuite.com/c.3363929/Poppin/CardMessage/cardmessage.ss?action=set&msg=No Card Message',
					  cache:false
					});
			}
		}
	