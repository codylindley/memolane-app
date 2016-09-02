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

m.topBar = function(win,$,undefined){return{

	/*  static  */

	
	/*  initialize module  */
	initialize:function(){
	
		$(win).bind('resize',function(){m.topBar.runLayout();});
		
		this.runLayout();
	},
	
	/*  methods  */
	runLayout:function(){
		
		var $body = $('body');
		var $header = $('#header');
		var $topBarSearchInput = $('#tb-search input');
			
		//change header styles if the width is less than 1024
		if($body.width() < 1000){
			$header.removeClass('more1024').addClass('less1024');
			$topBarSearchInput.attr('value',$.i18n.t('Search','term used to label search box'));
		}
		if($body.width() >= 1000){
			$header.removeClass('less1024').addClass('more1024');
	            if(m.currentLane){
	        		$topBarSearchInput.attr('value',$.i18n.t('Search memos, lanes & users'));
	            }else{
	            	$topBarSearchInput.attr('value',$.i18n.t('Search lanes & users'));
				}
		}
	}	
		
};}(this,jQuery,this.undefined);

m.topBar.initialize();