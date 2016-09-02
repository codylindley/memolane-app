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

m.memoComments = function(win,$,undefined){return{

	/*  statics  */
	$body : $('body'),
	$laneViewport : $('#lane-viewport'),
	currentMemoID : '',
	totalMemoComments : 0,
	
	
	/*  initialize module  */
	initialize:function(){
		// handle comments
		this.$laneViewport.delegate('.openMemo .memo_comments', m.clickOrTouchEnd, $.proxy(this.openCommentsDialog, this));
		
		// handle comment submissions
		this.$body.delegate('#memoCommentButton', m.clickOrTouchEnd, $.proxy(this.postComment, this));
		
		// delete comment
		this.$body.delegate('.commentDelete', m.clickOrTouchEnd, $.proxy(this.deleteComment, this));
		
		// enable/disable post comment button, dependent upon valid comment being entered
		this.$body.delegate('#memoEnterComment textarea', 'keyup', function(){
			if ( $.trim( $(this).val() ) != "" ) {
				$('#memoCommentButton').removeClass('inactive');
			}
			else {
				$('#memoCommentButton').addClass('inactive');
			}
		});
	},
	
	
	/*  methods  */
	openCommentsDialog:function(e){
		var that = this;
		
		//add hash so url can be copied
		win.location.hash = m.utilities.urlHash.set('showcomments=true');
		
		this.currentMemoID = $(e.currentTarget).attr("data-id");
		
		// show dialog w/ loader
		var $dialog = $.tmpl( this.templates.dialogs.comments.loading );
		$dialog.lightbox_me({
			destroyOnClose: true,
			onClose:function(){
				//add hash so url can be copied
				win.location.hash = m.utilities.urlHash.remove('showcomments');
				m.memos.openMemoCommentsOnPageLoad = undefined;	
			},
			onLoad: function(){
				// set focus
				$('#memoCommentsDialog').find('textarea').focus();
			}
		});
		
		$('.privacyTooltip').tipsy({gravity:'ne', offset:5}).click(function(){ return false; });
		
		// make AJAX request for comments, send that to dialogs template
		$.ajax({
			type: 'get',
			url:'/comments/by_memo',
                        data:{'memo_id':this.currentMemoID},
			success: function(data){
				// update global comment count
				that.totalMemoComments = data.length;
				
				// created named array, for easier use in the template
				var comments = {};
				comments.comments = data;
				
				// render HTML
				var newHTML = $.tmpl( that.templates.dialogs.comments.loaded, comments ).html();
				
				// replace dialog content
				$dialog.find('#memoComments').html( newHTML );
				
				$dialog.find('.dialogTitle .commentCount').text( that.totalMemoComments ).show();
				
				// set comment container height
				that.setCommentContainerHeight();
			}
		});
		
		e.preventDefault();
	},
	
	
	postComment : function(e) {
		var that = this;
		var $button = $(e.currentTarget);
		
		if ( $button.not(".inactive").length ) {
			var $textarea = $button.siblings('textarea');
			var newComment = $textarea.val();
			
			// update interface
			$textarea.text("");
			$button.addClass("inactive").text( $.i18n.t("Posting...", "this is a temporary status to let the user know that their comment is in the process of being posted") );
			
			// make AJAX request
			$.ajax({
				type: 'post',
				url: '/comments',
				data: {
                                        'memo_id': that.currentMemoID,
					'lane_id': m.currentLane.id,
					'text': newComment
				},
				success: function(data) {
					// tweak data object
					data.comment.addedComment = true;
					
					// update comments
					var selector = $('#memoComments').data('jsp') ? '#memoComments .jspPane' : '#memoComments';
					$(selector)
						.prepend( $.tmpl( that.templates.dialogs.comments.comment, data.comment ).html() )
						.find('li:first')
							// set background to yellow
							.css('background', '#ffc')
							.hide()
							// fade it in
							.fadeIn(
								1500,
								// hide the yellow after it's there for a second
								function(){
									var $this = $(this);
									setTimeout( function(){ $this.css('background', 'none') }, 1000);
								}
							)
					;
					
					// if it's already being scrolled, update the scroll, otherwise, resize the dialog
					if ( $('#memoComments').data('jsp') ) {
						$('#memoComments').data('jsp').reinitialise();
					}
					else {
						that.setCommentContainerHeight();
					}
					
					// update global comment count
					that.totalMemoComments++;
					m.memos.memoStore[ m.utilities.cleanMemoId( that.currentMemoID ) ].comment_count = that.totalMemoComments;
					
					// update commenting interface
					$textarea.val('');
					$button.addClass("inactive").text( $.i18n.t("Post Comment", "this is the button text that informs the user they can post a comment") );
					
					// update interface w/ comment count
					$('.openMemo .commentCount, #memoCommentsDialog .commentCount').text( that.totalMemoComments );
					$('#'+ m.utilities.cleanMemoId( that.currentMemoID ) +' .memo_comments').text( that.totalMemoComments ).addClass('memo_comments_show');
				}
			});
		}
		
		e.preventDefault();
	},
	
	
	deleteComment : function(e){
		var that = this;
		
		var $deleteButton = $(e.currentTarget);
		var $thisComment = $deleteButton.parents('li:first');
		var commentID = $thisComment.attr('data-comment-id');
		
		$deleteButton.removeClass('commentDelete').addClass('commentDeleting');
		
		$.ajax({
			type: 'delete',
			url: '/comments/'+ commentID,
			success: function(data) {
				removeCommentFromInterface( $thisComment );
			},
			error: function(err){
				// update interface
				$deleteButton.addClass('commentDelete').removeClass('commentDeleting');
				
				// comment already deleted
				if (err.status == 410) {
					removeCommentFromInterface();
				}
				// show error message
				else {
					var errorMessage = '';
					
					if (err.status == 401) {
						errorMessage += $.i18n.t("We\'re sorry, but it seems there was an error deleting the comment. Make sure you're still logged in and try again.");
					}
					else {
						errorMessage += $.i18n.t("We\'re sorry, but it seems there was an error deleting the comment. This could be a number of issues, but is likely due to connection problems on your side or server problems on ours.  Your best bet is to wait a bit, reload the page, and try again.");
					}
					
					// write error message to interface
					$thisComment
						.append('<div class="notifications badnews-notice" style="position:absolute; top:-1px; right:0; margin-top:0;"><div class="notice-text">'+ errorMessage +'<a href="#" class="close-notice" title="'+ $.i18n.t('remove this notice', 'this informs the user that they can click to remove a temporary status message') +'">X</a></div></div>')
						.find('.badnews-notice .close-notice').bind(m.clickOrTouchEnd, function(e){
							$(this).parents('.badnews-notice').fadeOut(function(){ $(this).remove(); });
							e.preventDefault();
						});
				}
			}
		});
		
		// this is used by success AND by error 410 (i.e. the comment has already been deleted)
		removeCommentFromInterface = function() {
			// update DOM
			$thisComment.fadeOut(function(){
				var $this = $(this);
				var $container = $this.parents('#memoComments');
				
				$this.remove();
				
				// if it's already being scrolled, see if we still need the scroll
				if ( $('#memoComments').data('jsp') ) {
					that.setCommentContainerHeight();
				}
				else {
					$('#memoCommentsDialog').trigger('reposition');
				}
			});
			
			// update global comment count
			that.totalMemoComments--;
			m.memos.memoStore[ m.utilities.cleanMemoId( that.currentMemoID ) ].comment_count = that.totalMemoComments;
			
			// update large memo spots w/ comment count
			$('.openMemo .commentCount, #memoCommentsDialog .commentCount').text( that.totalMemoComments );
			
			// update memos w/ comment count
			var $smlMemo = $('#'+ m.utilities.cleanMemoId( that.currentMemoID ) +' .memo_comments');
			if ( that.totalMemoComments == 0 ) {
				$smlMemo.removeClass('memo_comments_show');
				
				$('.largeMemoFooterBar .commentCount').text('');
			}
			else {
				$smlMemo.text( that.totalMemoComments );
			}
		};
		
		e.preventDefault();
	},
	
	
	// this sets the right height for the comments container & uses jScrollPane for scrolling
	setCommentContainerHeight : function(){
		// remove jScrollPane so we can get accurate height of memos
		if ( $('#memoComments').data('jsp') ){
			$('#memoComments').data('jsp').destroy();
		}
		// remove any previously set height for memos, so we can get an accurate one
		$('#memoComments').removeAttr('style');
		
		var dialogH = $('#memoCommentsDialog').height();
		var availableH = $('body').height() - 80; // 40 each for dialog top & bottom padding
		var memosH = $('#memoComments').height();
		
		// there's some odd timing issue, where the memo heights aren't quite registered yet - this is to combat that
		if ( !memosH && m.memoComments.totalMemoComments ) {
			var interval = setInterval( function(){
					memosH = $('#memoComments').height();
					if (memosH) {
						clearInterval( interval );
						doActualSizing();
					}
				},
				25
			)
		}
		else {
			doActualSizing();
		}
		
		function doActualSizing() {
			if ( availableH < dialogH ) {
				var dialogNonComments = dialogH - memosH;
				var newH = availableH - dialogNonComments;
				
				$('#memoComments').height( newH );
				$('#memoComments').jScrollPane();
			}
			
			$('#memoCommentsDialog').trigger('reposition');
		}
	},
	
	
	parseCommentText : function( comment ){
		// parse links
		// NOTE: this has been removed for now, evidently to avoid spam
		//comment = m.utilities.linkify( comment );
		
		// convert line breaks to HTML, then return
		return comment.replace(/\r\n|\n\r|\r|\n/g, '<br />');
	},
	
	
	/*  methods  */
	templates: {
		dialogs: {
			comments: {
				loading:
					'<div id="memoCommentsDialog" class="memolaneDialog largeMemoDialog">'
					+'	<div class="dialogTopBar">'
					+'		<div class="dialogTitle">'+ $.i18n.t("Comments", "this is the title for the comments dialog") +' (<span class="commentCount"></span>)</div>'
					+'		<div class="close closeMemolaneDialog">'+ $.i18n.t("close" , "clicking on this button closes the dialog window") +'</div>'
					+'		<div class="clearFloatNoHeight"></div>'
					+'	</div>'
					+'	<div class="dialogContent">'
					+'		<div id="memoEnterComment">'
					+'		{{if m.currentUser}}'
					+'			<textarea placeholder="'+ $.i18n.t('Type your comment here...', 'placeholder text that prompts the user to leave a comment') +'"></textarea>'
					+'			<a href="#" class="btn-green inactive" id="memoCommentButton">'+ $.i18n.t("Post Comment", "this is the button text that informs the user they can post a comment") +'</a>'
					+'			<a href="#" class="privacyTooltip" original-title="'+ $.i18n.t('Comments can be seen by the same people who can see the memo.  If this is a public memo, anyone can see its comments.  If it\'s a \'friends only\' memo, only the friends of the memo owner can see them.') +'"><span></span>'+ $.i18n.t('Learn about comment privacy') +'</a>'
					+'		{{else}}'
					+'			'+ $.i18n.t('Itchin\' to leave a comment?  Why not <a href=\"/login\">log in</a> or <a href=\"/signup\">sign up</a>?')
					+'		{{/if}}'
					+'		</div>'
					+'		<ul id="memoComments">'
					+'			<li style="text-align:center;"><img src="/img/common/smallLoaderOnGrey.gif" alt="'+ $.i18n.t("loading comments...", "tells the user the comments they are trying to view are loading") +'" /></li>'
					+'		</ul>'
					+'	</div>'
					+'</div>'
				,
				loaded:
					'<div>'
					+'	{{tmpl( comments ) m.memoComments.templates.dialogs.comments.comment}}'
					+'</div>'
				,
				comment:
					'{{if addedComment}}<div>{{/if}}' // this is so it can be used w/ jQuery.html(), as well as natively in templates
					+'	<li data-comment-id="${id}">'
					+'		<div class="commentHeader">'
					+'			{{if m.currentUser && (m.currentUser.userID == memo_owner_id || m.currentUser.userID == poster_id)}}<a href="#" class="commentDelete">'+ $.i18n.t('Delete', 'this tells the user they can delete this comment') +'</a>{{/if}}'
					+'			<a href="/${user.username}" title="{{if m.currentUser && (m.currentUser.userID == poster_id)}}'+ $.i18n.t('Comment by you', 'this informs the user that they made the associated comment on the memo') +'{{else}}'+ $.i18n.t('Comment by ${user.full_name}', 'this informs the user who made this comment on the given memo') +'{{/if}}"><img src="/${user.username}/image.small" class="float-left" alt="'+ $.i18n.t('user avatar', 'this simply labels the small user image, for those who can\'t see it') +'" /> {{if m.currentUser && (m.currentUser.userID == poster_id)}}'+ $.i18n.t('You said:', 'this shows that the user who is viewing the comment is also the one who made it') +'{{else}}'+ $.i18n.t('${user.full_name} said:', 'this shows who made the given comment') +'{{/if}}</a><br />'
					+'			<div class="commentTime">${m.utilities.dateFormatRelative( created_at )}</div>'
					+'		</div>'
					+'		<div class="commentText">{{html m.memoComments.parseCommentText( text )}}</div>'
					+'	</li>'
					+'{{if addedComment}}</div>{{/if}}' // this is so it can be used w/ jQuery.html(), as well as natively in templates
			}
		}
	}
	
};}(this,jQuery,this.undefined);

m.memoComments.initialize();