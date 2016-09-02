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

m.settingsLayout = function(win,$,undefined){return{

	/*  static  */
	$body : $('body'),
	$header : null,
	$content : null,
	contentHeightNative : null,
	
	
	/*  initialize module  */
	initialize:function(){
		this.$header = this.$body.find('#header'),
		this.$content = this.$body.find('#content'),
		this.contentHeightNative = this.$content.height();
		
		$(win).bind('resize',function(){ m.settingsLayout.runLayout(); });
		this.runLayout();
	},
	
	
	/*  methods  */
	runLayout:function(){
		var newHeight = this.$body.height() - this.$header.outerHeight() - ( this.$content.outerHeight() - this.$content.height() );
		if ( newHeight > this.contentHeightNative ) {
			this.$content.height( newHeight );
		}
	}
		
};}(this,jQuery,this.undefined);

m.settingsLayout.initialize();