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

m.language = function(win,$,undefined){return{

	/*  static  */
	$langSettings:$('#language-settings'),
	
	/*  initialize module  */
	initialize:function(){
	
		this.$langSettings.bind(m.clickOrTouchStart,this.openLangSettingsDialog);
			
	},
	
	/*  methods  */
	openLangSettingsDialog:function(){
	
		var $dialog = $('<div id="language-settings-dialog" class="memolaneDialog">'
			+'	<div class="dialogTopBar">'
			+'		<div class="dialogTitle">'+$.i18n.t('Language Settings')+'</div>'
			+'		<div class="close closeMemolaneDialog cancelAddingBtn">'+$.i18n.t('cancel','cancel dialog actions')+'</div>'
			+'		<div class="clearFloatNoHeight"></div>'
			+'	</div>'
			+'	<div class="dialogContent">'
			+'	<p>'+$.i18n.t('Select your preferred language:')+'</p>'
			+'	<ul>'
			+'	<li><label id="en-flag"><input type="radio" value="en" name="language-selected" /></li></label>'
			+'	<li><label id="ja-flag"><input type="radio" value="ja" name="language-selected" /></li></label>'
			+'	</ul>'
			+' 	<div class="clear"></div>'
			+'	<p><a href="#" id="change-language-btn" class="btn-green float-left close">'+$.i18n.t('OK','ok button for dialog')+'</a></p>'
			+'	</div>'
			+'</div>');
		
		$dialog
		.find('input')
		.each(function(index){
			var $this = $(this);
			if($this.val() === m.currentLanguage){
				$(this).prop("checked", true);
			}
		})
		.end()
		.find('#change-language-btn')
		.click(function(){
			var language = $(this).closest('.dialogContent').find('input:checked').val();
			var theHash = win.location.hash || '';
			win.location.href = win.location.href.split('#')[0].split('?')[0] + '?lang=' + language + theHash;
		})
		.end()
		.lightbox_me({
			centered: true
		});
		
		return false;	
	
	}
	
	
};}(this,jQuery,this.undefined);

m.language.initialize();