<script type="text/javascript">
if (jQuery('form#loginform').length || jQuery('form#new-customer-register').length) {
    _gaq.push(['_trackPageview','/login-register']);
} else if (jQuery('table#carttable').length) {
    _gaq.push(['_trackPageview','/shopping-cart']);
} else {
    _gaq.push(['_trackPageview']);
}
</script>