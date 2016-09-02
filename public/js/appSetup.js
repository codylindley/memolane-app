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


/*---------------------------------------------------------------------------------------------------- 
application constants/globals
----------------------------------------------------------------------------------------------------*/
m.deviceIsIpad = navigator.userAgent.match(/iPad/i) != null;
m.deviceIsIphone = navigator.userAgent.match(/iPhone/i) != null;
m.deviceIsAndroid = navigator.userAgent.toLowerCase().indexOf("android") > -1;
m.isIE9 = $.browser.version === '9.0'?true:false;
m.isIE8 = $.browser.version === '8.0'?true:false;

//click or Touch
m.clickOrTouchStart = Modernizr.touch ? 'touchstart' : 'click';
m.clickOrTouchEnd = Modernizr.touch ? 'touchend' : 'click';

//mouse enter/leave vs touch start/end
m.mouseEnterOrTouchStart = Modernizr.touch ? 'touchstart' : 'mouseenter';
m.mouseLeaveOrTouchEnd = Modernizr.touch ? 'touchend' : 'mouseleave';

//mouse down/move/up/out/over vs touch start/move/end
m.mouseDownOrTouchStart = Modernizr.touch ? 'touchstart' : 'mousedown';
m.mouseMoveOrTouchMove = Modernizr.touch ? 'touchmove' : 'mousemove';
m.mouseUpOrTouchEnd = Modernizr.touch ? 'touchend' : 'mouseup';
m.mouseOutOrTouchEnd = Modernizr.touch ? 'touchend' : 'mouseout';
m.mouseOverOrTouchStart = Modernizr.touch ? 'touchstart' : 'mouseover';

//make sure console does not sink the ship
if (typeof console == "undefined" || typeof console.log == "undefined"){
	var console = { log: function() {} }; 
}
