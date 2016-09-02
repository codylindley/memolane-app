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

m.addFriends = function(win,$,undefined){return{

	/*  static  */
	continuePollingGmail : false,
	
	
	/*  initialize module  */
	initialize:function(){
		var that = this;
		
		// click to add friends
		$('.addFriends').live(m.clickOrTouchEnd, $.proxy(this.initialAddFriendsDialog, this));
		
		// enable/disable action button, depending upon whether they have any people selected
		$('body').delegate('#addFriendsDialog input[type=checkbox]', m.clickOrTouchEnd, function(){
			var $parentDiv = $(this).closest('div');
			if ($parentDiv.find('input[type=checkbox]:checked').length) {
				$parentDiv.find('.inactive').removeClass('inactive');
			}
			else {
				$parentDiv.find('a').addClass('inactive');
			}
		});
		
		// skip step
		$('body').delegate('#addFriendsDialog .skipStep', m.clickOrTouchEnd, function(){ $(this).closest('div').hide().siblings().show(); return false; });
		
		// setup select all/none
		$('body').delegate('#addFriendsDialog .selectAll', m.clickOrTouchEnd, function(){ $(this).closest('div').find('input[type=checkbox]').prop('checked', true).end().find('.inactive').removeClass('inactive'); return false; });
		$('body').delegate('#addFriendsDialog .selectNone', m.clickOrTouchEnd, function(){ $(this).closest('div').find('input[type=checkbox]').prop('checked', false).end().find('a').addClass('inactive'); return false; });
		
		// wire up Gmail select friends action buttons
		$('body').delegate('#addFriendsDialog #gmailAddExistingFriends', m.clickOrTouchEnd, $.proxy(this.addExisting, this));
		$('body').delegate('#addFriendsDialog #gmailInviteFriends', m.clickOrTouchEnd, $.proxy(this.inviteFriends, this));
		
		// wire up Facebook add friends button
		$('body').delegate('#addFriendsDialog #facebookAddExistingFriends', m.clickOrTouchEnd, $.proxy(this.addExisting, this));
		
		// enable/disable invite by email button, based on email addresses validity
		$('body').delegate('#addFriendsByEmail', 'keyup', function(){ if ( that.validateEmailList() ) { $(this).siblings('.inactive').removeClass('inactive'); } else { $(this).siblings('.addFriendsBtnEmail').addClass('inactive'); } });
		
		// wire up invite by email button
		$('body').delegate('#addFriendsDialog .addFriendsBtnEmail', m.clickOrTouchEnd, $.proxy(this.sendEmailInvites, this));
		
		// setup validation for email lists
		$.validity.setup({ outputMode:"modal" });
			$.validity.patterns.emailList = /^(([a-zA-Z0-9_\-\.\+]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5}){1,25})+([\,.][ .]*(([a-zA-Z0-9_\-\.\+]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5}){1,25})+)*$/;
			$.validity.messages.emailList = $.i18n.t('Email invites must be formatted as a series of email addresses, separated by commas.');

	},
	
	
	/*  methods  */
	validateEmailList:function(){
		var $emails = $('#addFriendsByEmail');
		if ($emails.val().length) {
			$.validity.start();
			$emails.match('emailList');
			var results = $.validity.end();
			return results.valid;
		}
		else {
			return false;
		}
	},
	
	
	sendEmailInvites:function(e){
		var that = this;
		
		var emails = $('#addFriendsByEmail').val();
		
		if (emails.length && this.validateEmailList()) {
			// trim spaces, encode +'s
			emails = emails.replace(/ /g, '').replace(/\+/g, '%2B');
			// make it an array
			emails = emails.split(',');
			
			$.ajax({
				type: 'post',
				url: '/add_friends/email_invite',
				data: {
					"emails" : emails
				},
				success: function(data) {
					$('#addFriendsDialog')
						.find('.dialogContent').empty().append( $.tmpl(that.templates.emailDialogContent, data) )
						.end().trigger('reposition');
				},
				error: function() {
					$('#addFriendsDialog')
						.find('.dialogContent').empty().append( $.tmpl(that.templates.genericError) )
						.end().trigger('reposition');
				}
			});
		}
		
		e.preventDefault();
	},
	
	
	pollGmail:function(){
		var that = this;
		
		// don't poll more often than every second or when we get the last poll response back
		$.when( m.utilities.wait(1000), that.checkGmail() ).done(function(){
			if (that.continuePollingGmail) {
				that.pollGmail();
			}
		});
	},
	
	
	checkGmail:function(){
		var that = this;
		
		// get the Oauth token
		$.ajax({
			type: 'get',
			cache: false,
			url: '/add_friends/auth_gmail_verifier',
			success: function(data) {
				// Oauth approval
				if (data.status != 'not ready') {
					that.continuePollingGmail = false;
					
					// use the Oauth token to get contacts
					$.ajax({
						type: 'get',
						url: '/add_friends/contacts_gmail',
						data: {
							oauth_verifier : data
						},
						success: function(users) {
							// if the user has contacts that aren't yet Memolane friends
							if (users.existing_users.length || users.users_to_invite.length) {
								$('#addFriendsDialog')
									.find('.dialogContent').empty().append( $.tmpl(that.templates.GmailDialogContent, users) )
									.end().trigger('reposition');
							}
							// you're already friends w/ all those people
							else if (users.friends.length) {
								$('#addFriendsDialog')
									.find('.dialogContent').empty().append( $.tmpl(that.templates.GmailDialogError_TooPopular) )
									.end().trigger('reposition');
							}
							// nobody returned
							else {
								$('#addFriendsDialog')
									.find('.dialogContent').empty().append( $.tmpl(that.templates.GmailDialogError_GenericOrNoFriends) )
									.end().trigger('reposition');
							}
						},
						// failed Oauth attempt (either bad/rejected key or server issue)
						error: function(errorData) {
							$('#addFriendsDialog')
								.find('.dialogContent').empty().append( $.tmpl(that.templates.GmailDialogError_BadKey) )
								.end().trigger('reposition');
						}
					});
				}
				// else continue polling
			},
			// Oauth error
			error: function() {
				that.continuePollingGmail = false;
				
				$('#addFriendsDialog')
					.find('.dialogContent').empty().append( $.tmpl(that.templates.genericError) )
					.end().trigger('reposition');
			}
		});
	},
	
	
	checkFacebook:function(){
		var that = this;
		
		// get the Oauth token
		$.ajax({
			type: 'get',
			cache: false,
			url: '/add_friends/contacts_facebook',
			success: function(data) {
				$('#addFriendsDialog')
					.find('.dialogContent').empty().append( $.tmpl(that.templates.FacebookDialogContent, data) )
					.end().trigger('reposition');
			},
			error: function(data) {
				var err = $.parseJSON(data.responseText);
				if (err.error.type == "object_not_found") {
					$('#addFriendsDialog')
						.find('.dialogContent').empty().append( $.tmpl(that.templates.FacebookDialogError_noAccount) )
						.end().trigger('reposition');
				}
				else {
					$('#addFriendsDialog')
						.find('.dialogContent').empty().append( $.tmpl(that.templates.genericError) )
						.end().trigger('reposition');
				}
			}
		});
	},
	
	
	addExisting:function() {
		var that = this;
		
		var $actionBtn = $('#addFriends-existing .submitFriendship');
		if ($actionBtn.not('.inactive)').length) {
			var friends = [];
			$('#addFriends-existing input[type=checkbox]:checked').each(function(){
				friends.push( this.getAttribute("value") );
			});
			
			if (friends.length) {
				$.ajax({
					type: 'post',
					url: '/add_friends/batch_request',
					data: {
						"uids" : friends
					},
					success: function() {
						// last step
						if ( $actionBtn.is('.addFriendsLastStep') ) {
							$('#addFriendsDialog')
								.find('.dialogContent').empty().append( $.tmpl(that.templates.successMessage) )
								.end().trigger('reposition');
						}
						// there's another step
						else {
							$actionBtn.parent('div').hide().siblings().show();
						}
					},
					error: function() {
						$('#addFriendsDialog')
							.find('.dialogContent').empty().append( $.tmpl(that.templates.genericError) )
							.end().trigger('reposition');
					}
				});
			}
		}
		
		return false;
	},
	
	
	inviteFriends:function() {
		var that = this;
		
		var $actionBtn = $('#addFriends-invite .submitFriendship');
		if ($actionBtn.not('.inactive)').length) {
			var friends = [];
			$('#addFriends-invite input[type=checkbox]:checked').each(function(){
				friends.push( this.getAttribute("value") );
			});
			
			if (friends.length) {
				$.ajax({
					type: 'post',
					url: '/viral/invite',
					data: {
						"emails" : friends
					},
					success: function() {
						$('#addFriendsDialog')
							.find('.dialogContent').empty().append( $.tmpl(that.templates.successMessage) )
							.end().trigger('reposition');
					},
					error: function() {
						$('#addFriendsDialog')
							.find('.dialogContent').empty().append( $.tmpl(that.templates.genericError) )
							.end().trigger('reposition');
					}
				});
			}
		}
		
		return false;
	},
	
	
	initialAddFriendsDialog:function(e) {
		var that = this;
		
		var $dialog = $.tmpl(this.templates.addFriendsDialog);
		
		// Gmail
		$dialog.find('.addFriendsBtnGmail').bind(m.clickOrTouchEnd, function(){
			// start polling to see if they've approved the Oauth request
			that.continuePollingGmail = true;
			that.pollGmail();
			
			// show loading in the UI
			$(this).parent().find('.loading').show();
		});
		
		// Facebook
		$dialog.find('.addFriendsBtnFacebook').bind(m.clickOrTouchEnd, function(e){
			that.checkFacebook();
			
			// show loading in the UI
			$(this).parent().find('.loading').show();
			
			e.preventDefault();
		});
		
		$dialog.lightbox_me();
		
		e.preventDefault();
	},
	
	
	/*  templates  */	
	templates:{
		addFriendsDialog:
			'<div id="addFriendsDialog" class="memolaneDialog" style="width:500px;">'
			+'	<div class="dialogTopBar">'
			+'		<div class="dialogTitle">'+$.i18n.t('Add friends')+'</div>'
			+'		<div class="close closeMemolaneDialog removeService">'+$.i18n.t('cancel','close dialog')+'</div>'
			+'		<div class="clearFloatNoHeight"></div>'
			+'	</div>'
			+'	<div class="dialogContent">'
			+'		<div style="float:left; width:150px; text-align:center;">'
			+'			<div style="padding-bottom:20px; border-bottom:1px solid #e1e1e1;">'
			+'				<img src="/img/common/services/icon-gmail.png" alt="Gmail logo" style="padding-bottom:5px;" /><p style="margin-bottom:10px;">'+$.i18n.t('Select friends from<br />your Gmail address book.')+'</p><a href="/add_friends/auth_gmail" target="_blank" class="btn-green addFriendsBtnGmail">'+$.i18n.t('Gmail','gmail web email')+'</a><img class="loading" src="/img/common/smallLoaderOnGrey.gif" />'
			+'			</div>'
			+'			<div style="margin-top:20px;">'
			+'				<img src="/img/common/services/icon-facebook.png" alt="Facebook logo" style="padding-bottom:5px;" /><p style="margin-bottom:10px;">'+$.i18n.t('Select friends from<br />your Facebook.')+'</p><a href="#" class="btn-green addFriendsBtnFacebook">'+$.i18n.t('Facebook','Facebook, the online web application')+'</a><img class="loading" src="/img/common/smallLoaderOnGrey.gif" />'
			+'			</div>'
			+'		</div>'
			+'		<div style="float:left; width:270px; border-left:1px solid #e1e1e1; padding-left:20px; margin-left:20px;">'
			+'			<p>'+$.i18n.t('If you know the email addresses of the people you would like to invite to Memolane and send friend requests to, enter them below (separated by commas).')+'</p>'
			+'			<textarea id="addFriendsByEmail" style="margin-bottom:15px; width:260px; height:141px;"></textarea>'
			+'			<a href="#" class="btn-green addFriendsBtnEmail submitFriendship inactive">'+$.i18n.t('Send e-mail invite(s)')+'</a>'
			+'		</div>'
			+'	</div>'
			+'</div>'
		,
		
		// the structure of this content matters a lot for the JS - namely, that the only <div> is the one surrounding the entire step
		GmailDialogContent:
			'{{if existing_users.length}}'
			+'	<div id="addFriends-existing" class="addFriendsStep">'
			+'		<p>'+$.i18n.t('These people are already on Memolane.  Select the ones you want to send a friend request to:')+'</p>'
			+'		{{if existing_users.length > 1}}<p>'+$.i18n.t('Select:','select either all of the items or none')+' <a href="#" class="selectAll">'+$.i18n.t('all','select all items')+'</a> | <a href="#" class="selectNone">'+$.i18n.t('none','select none of the items')+'</a></p>{{/if}}'
			+'		<ul>'
			+'			{{each existing_users}}'
			+'				<li><input type="checkbox" checked="checked" value="${username}" /> <img src="${image}" /> <p>${name}<br /><span>${email}</span></p></li>'
			+'			{{/each}}'
			+'		</ul>'
			+'		<a href="#" id="gmailAddExistingFriends" class="btn-green submitFriendship{{if !users_to_invite.length}} addFriendsLastStep{{/if}}">'+$.i18n.t('Send request(s) to selected friend(s)</a> or')+' {{if users_to_invite.length}}<a href="#" class="skipStep">'+$.i18n.t('skip this step')+'</a>{{else}}<a href="#" class="close">'+$.i18n.t('close window')+'</a>{{/if}}'
			+'	</div>'
			+'{{/if}}'
			+'{{if users_to_invite.length}}'
			+'	<div id="addFriends-invite" class="addFriendsStep">'
			+'		<p>'+$.i18n.t('Everyone listed below is not on Memolane yet. Send them an invite and simultaneously ask them to be your friend.', 'text on the gmail friends invite dialog' )+'</p>'
			+'		{{if users_to_invite.length > 1}}<p>'+$.i18n.t('Select:','select either all of the items or none')+' <a href="#" class="selectAll">'+$.i18n.t('all','select all items')+'</a> | <a href="#" class="selectNone">'+$.i18n.t('none','select none of the items')+'</a></p>{{/if}}'
			+'		<ul>'
			+'			{{each users_to_invite}}'
			+'				<li><input type="checkbox" checked="checked" value="${emails[0]}" /> <img src="${image}" /> <p>${name}<br /><span>${emails[0]}</span></p></li>'
			+'			{{/each}}'
			+'		</ul>'
			+'		<a href="#" id="gmailInviteFriends" class="btn-green submitFriendship addFriendsLastStep">'+$.i18n.t('Send invite(s) to selected friend(s)</a>')+ '</a> ' + $.i18n.t('or', '_or_ between invite button and close link on invite friends dialog') + ' <a href="#" class="close">'+$.i18n.t('close window')+'</a>'
			+'	</div>'
			+'{{/if}}'
		,
		GmailDialogError_BadKey:
			'<p>'+$.i18n.t('It looks like we\'re either having server issues, or you denied our request to connect to Gmail.')+'</p>'
			+'<p>'+$.i18n.t('Click \"Add Friends\" to try again.')+'</p>'
			+'<p style="margin-bottom:0;"><a href="#" class="btn-green close">'+$.i18n.t('OK','ok button for dialog')+'</a></p>'
		,
		GmailDialogError_TooPopular:
			'<p>'+$.i18n.t('It looks like you\'re too popular!')+'</p>'
			+'<p>'+$.i18n.t('You\'re already Memolane friends with all of your Gmail contacts!')+'</p>'
			+'<p style="margin-bottom:0;"><a href="#" class="btn-green close">'+$.i18n.t('OK','ok button for dialog')+'</a></p>'
		,
		GmailDialogError_GenericOrNoFriends:
			'<p>'+$.i18n.t('It looks like either we\'re having a server issue, or we didn\'t get a list of contacts.')+'</p>'
			+'<p>'+$.i18n.t('You may want to check your Gmail contacts list to ensure there are email addresses there.</p>')
			+'<p style="margin-bottom:0;"><a href="#" class="btn-green close">'+$.i18n.t('OK','ok button for dialog')+'</a></p>'
		,
		
		// the structure of this content matters a lot for the JS - namely, that the only <div> is the one surrounding the entire step
		FacebookDialogContent:
			'{{if existing_users && existing_users.length}}'
			+'	<div id="addFriends-existing" class="addFriendsStep addFriendsFacebook">'
			+'		<p>'+$.i18n.t('These people are already on Memolane.  Select the ones you want to send a friend request to:')+'</p>'
			+'		{{if existing_users.length > 1}}<p>'+$.i18n.t('Select:','select either all of the items or none')+' <a href="#" class="selectAll">'+$.i18n.t('all','select all items')+'</a> | <a href="#" class="selectNone">'+$.i18n.t('none','select none of the items')+'</a></p>{{/if}}'
			+'		<ul>'
			+'			{{each existing_users}}'
			+'				<li><input type="checkbox" checked="checked" value="${username}" /> <img src="${image}" /> <p>${full_name}<br /><span>${email}</span></p></li>'
			+'			{{/each}}'
			+'		</ul>'
			+'		<a href="#" id="facebookAddExistingFriends" class="btn-green submitFriendship addFriendsLastStep">'+$.i18n.t('Send request(s) to selected friend(s)')+'</a> '+$.i18n.t('or', '_or_ between two buttons. X button or Y button')+ ' <a href="#" class="close">'+$.i18n.t('close window')+'</a>'
			+'	</div>'
			+'{{else}}'
			+'	<div class="addFriendsStep">'
			+'		{{if friends && friends.length}}'
			+'			<p>'+$.i18n.t('It looks like you\'re already Memolane friends with all of your Facebook contacts - way to go social animal.')+'</p>'
			+'		{{else}}'
			+'			<p>'+$.i18n.t('Unfortunately, we were not able to find any existing Memolane users from your Facebook account.')+'</p>'
			+'		{{/if}}'
			+'		<p style="margin-bottom:0;"><a href="#" class="btn-green close">'+$.i18n.t('OK','ok button for dialog')+'</a></p>'
			+'	</div>'
			+'{{/if}}'
		,
		FacebookDialogError_noAccount:
			'<p>'+$.i18n.t('You need to connect your Facebook account to Memolane in order to add friends from there.')+'</p>'
			+'<p>'+$.i18n.t('Go to your <a href=\"/settings/services\">my services</a> page to do so.')+'</p>'
			+'<p style="margin-bottom:0;"><a href="#" class="btn-green close">'+$.i18n.t('OK','ok button for dialog')+'</a></p>'
		,
		
		emailDialogContent:
			'{{if friends_requests_sent && friends_requests_sent.length}}'
			+'	<p>'+$.i18n.t('The following people are already on Memolane, so we sent them a friend request instead.')+'</p>'
			+'	<ul class="noCheckbox">'
			+'		{{each friends_requests_sent}}'
			+'			<li><img src="${image}" /> <p class="addedFriendsEmail">${full_name}</p></li>'
			+'		{{/each}}'
			+'	</ul>'
			+'	<p style="margin-bottom:0;"><a href="#" class="btn-green close">'+$.i18n.t('Done','done button for dialog')+'</a></p>'
			+'{{else}}'
			+'	<p>Hurray!  Your invites have been sent!</p>'
			+'	<p style="margin-bottom:0;"><a href="#" class="btn-green close">'+$.i18n.t('OK','ok button for dialog')+'</a></p>'
			+'{{/if}}'
		,
		
		genericError:
			'<p>It looks like there was a problem.</p>'
			+'<p>'+$.i18n.t('You may want to try again in a bit, or let us know this happened (by clicking the \"Feedback\" link on the upper right).')+'</p>'
			+'<p style="margin-bottom:0;"><a href="#" class="btn-green close">'+$.i18n.t('OK','ok button for dialog')+'</a></p>'
		,
		successMessage:
			'<p>Hurray!  Your invites have been sent!</p>'
			+'<p style="margin-bottom:0;"><a href="#" class="btn-green close">'+$.i18n.t('OK','ok button for dialog')+'</a></p>'
	}
	
};}(this,jQuery,this.undefined);

m.addFriends.initialize();