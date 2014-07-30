<script type='text/javascript'>

	var url = nlapiResolveURL('SUITELET', 'customscript_cds_sl_page_pageinit', 'customdeploy_cds_sl_page_pageinit');
	var response = nlapiRequestURL(url);
	var js = response.getBody().replace(/<--.*?-->/g, '');
	js = js.replace(/<!--.*?-->/g, '');
	eval(js);

</script>