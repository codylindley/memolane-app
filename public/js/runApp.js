/*---------------------------------------------------------------------------------------------------- 

JS Conventions

- Constructors should start with a capital letter
- Opening braces go on the same line as the statement e.g. if(true){
- Use the triple equality operator e.g. === not ==
- Use jslint when you can to keep things clean
- Braces are always used even if you have the option to omit e.g. don't do if(true)return;
- Always use ; even if you don't need too

Memolane App Conventions

- Single quotes are USED for all js unless you are dealing with a JSON property or HTML attributes
- Do not use constructors and prototypes for singletons
- Use camel case capitalization e.g. goToThatAndThis
- Use tab for indenting
- Everything should be contained inside of its own namespace or the m. namespace
- For long strings use string concatenation e.g. http://minify.me/?dqnhz6
- Pick jQuery events carefully as most of the events used will require a custom event string
- Modules keep there own state as static properties or as data() on the DOM element 

----------------------------------------------------------------------------------------------------*/


//dialogs, global settings
$.fn.lightbox_me.defaults.destroyOnClose = true;
$.fn.lightbox_me.defaults.centered = true;

//browser-tablet-phone Notice
m.utilities.browser.init();
var currentBrowser = m.utilities.browser;

if(currentBrowser.browser === 'Firefox' && parseInt($.browser.version,10) < 6 ||
currentBrowser.browser === 'Opera' && parseInt($.browser.version,10) < 11 ||
currentBrowser.browser === 'Explorer' && parseInt($.browser.version,10) < 9
){
	$('<div class="notifications badnews-notice"><div class="notice-text">'+$.i18n.t('You appear to be using an older browser. Did it come with a free toaster? Memolane and the internet in general looks better with Explorer 9, Opera 11+, Chrome 12+, Firefox 6+, and Safari 5+, so <a href=\"http://browsehappy.com/\">please consider upgrading</a> and come back to visit. P.S. The irony that we don\'t support viewing on mobile phones is not lost on us.')+' <a href="#" class="close-notice">X</a></div></div>').notify({expires: false});
}

if (top === self){
if(m.deviceIsIphone || (Modernizr.touch && !m.deviceIsIpad && !m.deviceIsAndroid) || (screen.width <= 480 && !m.deviceIsAndroid)){
	$('<div class="notifications badnews-notice"><div class="notice-text">'+$.i18n.t('We\'re working on shrinking Memolane for mobile phones, in the meantime please check out Memolane on a larger screen. We suggest an iPad, Android tablet, or the desktop or laptop of your choice.')+' <a href="#" class="close-notice">X</a></div></div>').notify({expires: false, mobile:true, stack:'below'});	
}else if((m.deviceIsAndroid && !navigator.userAgent.toLowerCase().match(/android 3/i)) || (screen.width <= 480 && m.deviceIsAndroid)){
	$('<div class="notifications badnews-notice"><div class="notice-text">'+$.i18n.t('Get the Memolane app for Android by visiting <a href=\"http://m.memolane.com\">http://m.memolane.com</a>')+' <a href="#" class="close-notice">X</a></div></div>').notify({expires: false, mobile:true, stack:'below'});
}
}

//setup all ajax requests
$.ajaxSetup({data: {'_csrf':m.csrf}});

// if delete is used for xhr send url delete param..hack for IE 
$.ajaxPrefilter(function(options){
  if (options.type.toLowerCase() === "delete"){
  	options.data = options.data + '&_method=DELETE';
  }
});

//global ajax error
/*$(document).ajaxError(function(event,jqXHR,settings,thrownError){

if(jqXHR.status === 500 || jqXHR.status === 404){
	$('<div class="notifications badnews-notice"><div class="notice-text">a 404 or 500 occurred for ajax http call<a href="#" class="close-notice">X</a></div></div>').notify({expires: false});
}

});
*/



