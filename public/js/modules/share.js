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

m.share = function(win,$,undefined){return{

	/*  initialize module  */
	initialize:function(){
	
		//share lane event
		$('.shareURL').live(m.clickOrTouchStart,$.proxy(this.shareDialog,this));

	},
	
	
	/*  methods  */

	hostname: function() {
		if (m.embeddedParams.custom_hostname != '') {
			return m.embeddedParams.custom_hostname;
		} else {
			return window.location.hostname;
		}
	},

	pathname: function(shareLink) {
		if (shareLink != null) {
			if (m.embeddedParams.custom_pathname != '') {
				var args = shareLink.split('?');
				return m.embeddedParams.custom_pathname + '?' + args[1];
			} else {
				return shareLink;
			}
		} else {
			return m.embeddedParams.custom_pathname;
		}
	},

	shareDialog: function(e){
		var $elm = $(e.target);
		
		// show a warning message if user is trying to share a memo & that memo isn't public
		var showMemoWarning = false;
		var memoPrivacy = '';
		if ($elm.hasClass('memo_share') && $elm.data('privacy') && $elm.data('privacy') != 'public') {
			showMemoWarning = true;
			memoPrivacy = $elm.data('privacy');
		}

		var shareLink = $elm.data('share-link');
		var hostname = this.hostname();
		var pathname = this.pathname(shareLink);
		
		var url = window.location.protocol +'//'+ hostname + pathname.replace(/ /g,'%20');

		var $dialog = $.tmpl( this.templates.shareLaneDialog, 
			{
				'url':encodeURIComponent(url),
				'shareText':encodeURIComponent($elm.data('share-text')),
				'shareDialogText':$elm.data('share-dialog-text'),
				'showMemoWarning': showMemoWarning,
				'memoPrivacy': memoPrivacy
			});
		
		$dialog
			.find(".shareFacebook").click(function(e){
				window.open( $(this).attr('href'), $.i18n.t('Share on Facebook'), 'width=600,height=400');
				e.preventDefault();
			}).end()
			// action for Twitter
			.find(".shareTwitter").click(function(e){
				window.open( $(this).attr('href'), $.i18n.t('Share on Twitter'), 'width=600,height=400');
				e.preventDefault();
			}).end()
			.find('#shortenURL').click(function(){ $(this).select(); })
			.end()
			.lightbox_me({
				centered: true
			});

		$.ajax({
			url: '/shorten?custom_hostname=' + encodeURIComponent(window.location.protocol +'//'+ hostname) + '&path='+ encodeURIComponent('/'+ pathname),
			success: function(data) {
				$('#shareURL').css('visibility','visible').find("#shortenURL").val(data.url).focus().select();
			}
		});

		e.preventDefault();
	},
	
	/* html templates  */
	templates:{
		//make sure you give all dialogs a width inline style
		shareLaneDialog:
			'<div id="shareLaneDialog" class="memolaneDialog" style="width:400px">'
			+'	<div class="dialogTopBar">'
			+'		<div class="dialogTitle">${shareDialogText}</div>'
			+'		<div class="close closeMemolaneDialog">'+ $.i18n.t('close', 'close share dialog') +'</div>'
			+'		<div class="clearFloatNoHeight"></div>'
			+'	</div>'
			+'	<div class="dialogContent">'
			+'		{{if showMemoWarning}}'
			// friends
			+'			{{if memoPrivacy == "friends"}}'
			+'				<div class="notifications warningnews-notice" style="float:none; margin-bottom:20px;"><div class="notice-text" style="margin:0; border:0;">'
			+'				<h2>'+ $.i18n.t('Tell your friends about this memo') +'</h2>'
			+'				'+ $.i18n.t('FYI - this is a Friends Only memo and only visible to you and your Memolane friends. Change the privacy setting by clicking on the (image of the lock icon) to share this memo with anyone.')
			+'				</div></div>'
			// private
			+'			{{else}}'
			+'				<div class="notifications badnews-notice" style="float:none; margin-bottom:20px;"><div class="notice-text" style="margin:0; border:0;">'
			+'				<h2>'+ $.i18n.t('Tell your friends about this memo') +'</h2>'
			+'				'+ $.i18n.t('FYI - this is a Private memo and only visible to you. Change the privacy setting by clicking on the (image of the lock icon) to share this memo with your friends.')
			+'				</div></div>'
			+'			{{/if}}'
			+'		{{/if}}'
			+'		<ul class="shareMemoOptions">'
			// hide FB & Twitter options if the memo isn't public
			+'		{{if !showMemoWarning}}'
			+'			<li><a href="http://www.facebook.com/share.php?u=${url}&amp;t=${shareText}" class="shareFacebook">'+ $.i18n.t('Facebook', 'Facebook, the online web application') +'</a></li>'
			+'			<li><a href="http://twitter.com/share?via=memolane&amp;text=${shareText}&amp;url=${url}" class="shareTwitter">'+ $.i18n.t('Twitter', 'Twitter, the online web application') +'</a></li>'
			+'		{{/if}}'
			+'			<li id="shareURL">'
			+'				<label>'+ $.i18n.t('Link:', 'a link to the page the user is sharing') +' <input id="shortenURL" type="text"></label>'
			+'			</li>'
			+'		</ul>'
			+'	</div>'
			+'</div>'
	}
	
};}(this,jQuery,this.undefined);

m.share.initialize();