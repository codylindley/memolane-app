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

m.embedLane = function(win,$,undefined){return{

	/* static */
	
	
	/*  initialize module  */
	initialize:function(){
			//share lane event
		$('#embed-lane a').bind(m.clickOrTouchStart,$.proxy(this.embedLane,this));
	},
	
	
	/*  methods  */
	embedLane:function(){
	
			var that = this;
			
			var $dialog = $(this.templates.embedLaneDialog);
			
			// fire dialog
			$dialog.lightbox_me({
				destroyOnClose: true,
				onLoad: function(){		
					that.setupEmbedCode();		
				},
				destroyOnClose:true
			});
		
		return false;
	},
	
	setupEmbedCode: function(){
	
		var that = this;
		var $embedCode = $('#embedCode');
		var $embedW = $('#embedW');
		var $embedH = $('#embedH');
		var $embedBg = $('#embedBg');
		var $embedBorder = $('#embedBorder');
		var $transBg = $('#transBg');
		var $transB = $('#transB');
		var $noneBg = $('#noneBg');
		var $noneB = $('#noneB');
		
		var update = function(){
			
			that.setEmbedCode($embedW.val(),$embedH.val(),$embedBorder.val()||$('#transB,#noneB').filter(':checked').val(),$embedBg.val()||$('#transBg,#noneBg').filter(':checked').val());
		};
		
		
		$('#transBg,#transB').click(function(){
		
			$(this).parent().find('input:checkbox:last').removeAttr('checked');
		
			var $input = $(this).parent().find('input:text');
		
			if($(this).is(':checked')){
				$input.val('').addClass('transparentInput');
			}else{
				$input.val('').removeClass('transparentInput');
			}
			
			if($(this).parent().find('input:checkbox:checked').length === 0){
				if($input.attr('id') === 'embedBg'){
					$input.miniColors('value','#000000');
				}else{
					$input.miniColors('value','#ffffff');
				}
			}
			
			update();
		
		});
		
		$('#noneBg,#noneB').click(function(){
		
			$(this).parent().find('input:checkbox:first').removeAttr('checked');
		
			var $input = $(this).parent().find('input:text');

			$input.val('').removeClass('transparentInput');
			
			if($(this).parent().find('input:checkbox:checked').length === 0){
				if($input.attr('id') === 'embedBg'){
					$input.miniColors('value','#000000');
				}else{
					$input.miniColors('value','#ffffff');
				}
			}
			
			update();
		
		});

		
		$('#embedBg,#embedBorder')
			.miniColors({change:function(){
				$(this).removeClass('transparentInput').parent().find(':checkbox').removeAttr('checked');update();}
			})
			.focus(function(){
				$(this).removeClass('transparentInput').parent().find(':checkbox').removeAttr('checked');
			})
			.filter('#embedBg')
			.blur(function(){
				if($(this).val() === '' || $(this).val() === '#'){
					$(this).miniColors('value','#000000');
				}
			})
			.end()
			.filter('#embedBorder')
			.blur(function(){
				if($(this).val() === '' || $(this).val() === '#'){
					$(this).miniColors('value','#ffffff');
				}
			});
		
		$('#embedBg').miniColors('value','#515151');
		$('#embedBorder').miniColors('value','#333333');
		
		$('#embedW,#embedH,#embedBg,#embedBorder')
			.bind('blur keyup', function(){
					update();
				})
			.filter('#embedW,#embedH')
			.numeric()
			.blur(function(){
				if($(this).val() === '' ){
					$(this).val('500');
				}
			});

		update();
		
	},
	
	setEmbedCode:function(w,h,b,bg){
	
		var $embedCode = $('#embedCode');

		$embedCode.val('<script src="'+$.tmpl(this.templates.jsEmbedCode, {url:window.location.protocol+'//'+window.location.host+'/lanes/'+m.currentLane.id,w:w,h:h,b:b,bg:bg}).text()+'"></script>');
	
	},
	
	/* html templates  */
	templates:{
		embedLaneDialog:
			'<div id="embed-lane-dialog" class="memolaneDialog">'
			+'	<div class="dialogTopBar">'
			+'		<div class="dialogTitle">'+$.i18n.t('Embed a lane settings')+'</div>'
			+'		<div class="close closeMemolaneDialog cancelAddingBtn">'+$.i18n.t('close','close dialog')+'</div>'
			+'		<div class="clearFloatNoHeight"></div>'
			+'	</div>'
			+'	<div class="dialogContent" id="embedALaneUI">'
			/*+'<div class="embed-lane-option">'
			+'	<p>Embed type:</p>'
			+'	<label><input type="radio"> HTML</label>'
			+'	<label><input type="radio"> Wordpress shortcode (<a href="#">download</a> our plugin)</label>'
			+'</div>'*/	
			+'<div class="embed-lane-option">'
			+'	<label>'+$.i18n.t('Width x Height:')+'</label>'
			+'	<input type="text" id="embedW" value="600" style="width:30px"> x <input type="text" value="300" id="embedH" style="width:30px">'
			+'</div>'		
			+'<div class="embed-lane-option">'
			+'	<label>'+$.i18n.t('Background color:')+'</label>'
			+'	<input type="text" id="embedBg" style="width:60px"> or <input class="bgChoice" type="checkbox" id="transBg" value="transparent">'+$.i18n.t('Transparent')+'<input class="bgChoice" value="none" type="checkbox" id="noneBg">'+$.i18n.t('None', 'Selection for no background color on embed lane dialog')
			+'</div>'
			+'<div class="embed-lane-option">'
			+'	<label>'+$.i18n.t('Border color:')+'</label>'
			+'	<input type="text" id="embedBorder" style="width:60px"> or <input value="transparent" type="checkbox" class="bChoice" id="transB">'+$.i18n.t('Transparent')+'<input class="bChoice" value="none" type="checkbox" id="noneB">'+$.i18n.t('None', 'Selection for no border on embed lane dialog')
			+'</div>'
			+'<p>'+$.i18n.t('Cut and paste the code below into your web page ( <a target=\"_blank\" href=\"https://github.com/Memolane/JS-Embed-Plugin\">advanced options</a> ):')+'</p>'
			+'<textarea id="embedCode"></textarea>'
			+'	</div>'
			+'</div>',
			
		jsEmbedCode:
			'<div>${url}.js?{{if w}}width=${w}&{{/if}}{{if h}}height=${h}&{{/if}}{{if b}}{{if b != "none"}}border=1px solid ${encodeURIComponent(b)}{{else}}border=${b}{{/if}}&{{/if}}{{if bg}}background=${encodeURIComponent(bg)}{{/if}}</div>',
			
		wordpressEmbedCode: ''
			
	}
	
};}(this,jQuery,this.undefined);

m.embedLane.initialize();