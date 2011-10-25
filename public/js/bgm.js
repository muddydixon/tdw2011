browser = (((navigator.appName == "Netscape") && (parseInt(navigator.appVersion) >= 3 ))); 

if ( browser) {
	document.write(
	'<embed src="supposed.mid" autostart="true" hidden="true" loop="true">',
	'<\/embed>');
} 
else {
	document.write('<bgsound src="supposed.mid" loop="infinite">');
}
