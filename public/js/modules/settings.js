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

m.settings = function(win,$,undefined){return{

	/*  static  */
	$body : $('body'),
	$form : $('.settingsForm'),

	/*  initialize module  */
	initialize:function(){
		// validation defaults
		$.validity.setup({ outputMode:"modal" });
		
		// process form
		var that = this;
		this.$form.submit(function(e){ that.processForm(); e.preventDefault(); });
		
		// update username in label with input value
		$('#settingsUsername')
			.bind('keyup', function(){
				$('#settingsUsernameDisplay').text( $(this).val() );
			})
			.keypress(function(e) {
				if(e.which == 32){ e.preventDefault(); }
			});
		
		// delete account
		$('#deleteAccount').bind(m.clickOrTouchEnd, $.proxy(function(){return this.deleteAccount()}, this));
		
		// reset ajax messages when user interacts w/ form again
		$('input:not([type=submit]), textarea').bind(m.clickOrTouchEnd, function(){ 
			$('.form-message').hide(); 
		});
		
		$('.user-upload-input-file').ajaxfileupload({
			'action': '/users/'+m.currentUser.userID+'/image.upload',
			'params': {
				'_csrf':m.csrf
			},
			'onComplete': function(response){
				$('.user-avatar')
					    .load(function(){
						    $('#avatar-user-loader').removeClass('avatar-user-loader');
						    var $dashboardImg = $('#tb-dashboard img');
						    var dashboardSrc = $dashboardImg.attr('src')
						    $dashboardImg.attr('src',dashboardSrc+'?time=' + new Date());
					    })
					    .attr('src',$('.user-avatar').attr('src')+'?time=' + new Date());
			},
			'onStart': function() {
				$('#avatar-user-loader').addClass('avatar-user-loader');
			}
		});
		
	},
	
	/*  main methods  */
	
	processForm:function(){
		if ( this.validateForm() ) {
			if (
				// in the case of FB Connect signup, and the like, we don't require a password (since they don't have one with us)
				m.currentUser.requires_pw
				&&
				(
					( $('#settingsEmail').length && $('#settingsEmail').val() != m.currentUser.email )
					||
					( $('#settingsUsername').length && $('#settingsUsername').val() != m.currentUser.username )
					||
					( $('#settingsNewPassword').length && $('#settingsNewPassword').val().length )
				)
			){
				this.requirePassword();
			}
			else {
				this.submitForm();
			}
		}
	},
	
	
	requirePassword:function(){
		var that = this;
		var $dialog = $.tmpl(this.templates.dialogs.passwordConfirm);
		$dialog.find('.passwordSubmit').click(function(e){ $(this).parents('form:first').submit(); e.preventDefault(); });
		$dialog.find('form').submit(function(e){
			$.validity.setup({ outputMode:"label" });
			$.validity.start();
				$('#passwordConfirm').require();
			var results = $.validity.end();
			
			if (results.valid) {
				that.submitForm( $('#passwordConfirm').val() );
				that.$body.find('.close:last').click();
			}
			
			$.validity.setup({ outputMode:"modal" });
			
			e.preventDefault();
		});
		$dialog.lightbox_me({
			onLoad : function() {
				$('#passwordConfirm').focus();
			},
			destroyOnClose : true
		});
	},
	
	
	validateForm:function(){
		$.validity.start();
			// basic validation
			this.$form
				.find('.required').require()
				.end()
				.find('.email').match('email')
			;
			
			// only set new password requirements if they are resetting their password
			var $newPass = this.$form.find('#settingsNewPassword');
			if ( $newPass.length && $newPass.val().length ) {
				$newPass.minLength(8);
			}
		var results = $.validity.end();
		
		return results.valid;
	},
	
	
	// WARNING: this method assumes validation has already taken place!
	submitForm:function( optionalPassword ){
		var that = this;
		
		// my account form
		if (this.$form.is('#settingsFormAccount')) {
			// show processing UI
			$('.form-message').hide();
			$('.form-message-processing').show();
			
			// do processing
			var dataObj = {
				first_name : $('#settingsFirstName').val(),
				last_name : $('#settingsLastName').val(),
				bio : $('#settingsBio').val()
			}
			if (m.currentUser.email != $('#settingsEmail').val()) {
				// reset currentUser email and setup data object
				dataObj.email = $('#settingsEmail').val();
			}
			if (m.currentUser.username != $('#settingsUsername').val()) {
				// reset currentUser username and setup data object
				dataObj.username = $('#settingsUsername').val();
			}
			if ( $('#settingsNewPassword').length && $('#settingsNewPassword').val().length ) {
				dataObj.new_password = $('#settingsNewPassword').val();
			}
			
			if (optionalPassword) {
				dataObj.password = optionalPassword;
			}
			else if ( $('#passwordConfirm').length && $('#passwordConfirm').val().length ) {
				dataObj.password = $('#passwordConfirm').val();
			}
			
			$.ajax({
				type: 'POST',
				url: '/users/update',
				data: dataObj,
				error:function(errorJSON){
					var obj = jQuery.parseJSON(errorJSON.responseText);
					var errors = obj.error;
					
					if (errors.type == "non_unique") {
						var errorText = '';
						for (x in errors.ids) {
							errorText += m.utilities.capitalizeString( errors.ids[x] );
						}
						errorText += ' '+ $.i18n.t("is already taken.", "this error message is preceded by the username that the user is trying to set for his/her account");
						
						$('.form-message').hide();
						$('.form-message-error').text(errorText).show();
					}
					else {
						$('.form-message').hide();
						$('.form-message-error').text( $.i18n.t("Error.", "this is a message that tells the user a generic error has occurred in their form submission") ).show();
					}
				},
				success:function(){
					$('.form-message').hide();
					$('.form-message-success').show();
					
					if (dataObj.email) {
						m.currentUser.email = dataObj.email;
					}
					if (dataObj.username) {
						m.currentUser.username = dataObj.username;
						$('#tb-dashboard').attr('href', '/'+ dataObj.username);
					}
					if (dataObj.new_password) {
						$('#settingsNewPassword').val('');
						
						// if this is the first time they're setting a password, reload the page, so they're out of the "no password" state
						if ( !m.currentUser.requires_pw ) {
							m.currentUser.requires_pw = true;
						}
					}
				}
			});
		}
		
		// music playback form
		else if (this.$form.is('#settingsFormMusic')) {
			var musicVal = this.$form.find('input[type=radio]:checked');
			if (musicVal.length) {
				$('.form-message').hide();
				$('.form-message-processing').show();
				$.ajax({
					type: 'POST',
					url: '/music_provider',
					data: {
						provider: musicVal.val().toLowerCase()
					},
					error:function(){
						$('.form-message').hide();
						$('.form-message-error').show();
					},
					success:function(){
						$('.form-message').hide();
						$('.form-message-success').show();
					}
				});
			}
		}
		
		// notifications form
		else if (this.$form.is('#settingsFormNotifications')) {
			var $checkboxes = this.$form.find('input[type=checkbox]');
			if ($checkboxes.length) {
				$('.form-message').hide();
				$('.form-message-processing').show();
				$.ajax({
					type: 'PUT',
					url: '/mail_notifications',
					data: {
						friendship_request : $checkboxes.filter('[name=friendship_request]').is(':checked'),
						added_to_lane : $checkboxes.filter('[name=added_to_lane]').is(':checked'),
                                                daily_reminder : $checkboxes.filter('[name=daily_reminder]').is(':checked'),
                                                memo_liked : $checkboxes.filter('[name=memo_liked]').is(':checked'),
                                                new_memo_comment : $checkboxes.filter('[name=new_memo_comment]').is(':checked'),
                                                new_lane_follower : $checkboxes.filter('[name=new_lane_follower]').is(':checked')
					},
					error:function(){
						$('.form-message').hide();
						$('.form-message-error').show();
					},
					success:function(){
						$('.form-message').hide();
						$('.form-message-success').show();
					}
				});
			}
		}
	},
	
	
	deleteAccount:function(){
		var that = this;
		var $dialog = $.tmpl(this.templates.dialogs.deleteAccount);
		$dialog.find('.deleteConfirm').bind(m.clickOrTouchEnd, function(e){
			$.validity.setup({ outputMode:"label" });
			$.validity.start();
				$('#deleteAccountPassword').require();
			var results = $.validity.end();
			
			if (results.valid || !m.currentUser.requires_pw) {
				var $actionBar = $(this);
				$actionBar.parent('div').find('a').hide().end().find('div').text( $.i18n.t('Deleting...', 'deletion in progress') ).show();
				
				$.ajax({
					type: 'POST',
					url: '/close_account',
					data: {
						password: $('#deleteAccountPassword').val()
					},
					statusCode: {
						200: function() {
							window.location.href = '/';
						},
						401: function() {
							$actionBar.parent('div').find('a:first').show().end().find('div').text( $.i18n.t('Password error!') );
						}
					}
				});
			}
			else $.validity.setup({ outputMode:"modal" });
			
			e.preventDefault();
		});
		$dialog.lightbox_me({
			centered: true
		});
		
		return false;
	},
	
	
	
	
	/*  templates  */
	
	templates:{
		dialogs:{
			passwordConfirm:
				'<div id="" class="memolaneDialog">'
				+'	<div class="dialogTopBar">'
				+'		<div class="dialogTitle">'+ $.i18n.t('Confirm Your Password') +'</div>'
				+'		<div class="close closeMemolaneDialog cancelAddingBtn">'+ $.i18n.t("cancel", "the cancel button to close the dialog window") +'</div>'
				+'		<div class="clearFloatNoHeight"></div>'
				+'	</div>'
				+'	<div class="dialogContent">'
				+'		<p><strong>'+ $.i18n.t('Your changes require a password') +'</strong></p>'
				+'		<form style="margin-bottom:0;">'
				+'			<p>'+ $.i18n.t('Please enter you current password to confirm your password change:') +' <input type="password" id="passwordConfirm" /></p>'
				+'			<p><a href="#" class="btn-red float-left passwordSubmit">'+ $.i18n.t('Submit', 'text for button to submit form') +'</a> <a href="#" class="secondaryAction float-left close">'+$.i18n.t('Cancel','cancel action')+'</a></p>'
				+'		</form>'
				+'	</div>'
				+'</div>'
			,
			
			deleteAccount:
				'<div id="" class="memolaneDialog">'
				+'	<div class="dialogTopBar">'
				+'		<div class="dialogTitle">'+ $.i18n.t('Permanently Delete Account?') +'</div>'
				+'		<div class="close closeMemolaneDialog cancelAddingBtn">'+ $.i18n.t("cancel", "the cancel button to close the dialog window") +'</div>'
				+'		<div class="clearFloatNoHeight"></div>'
				+'	</div>'
				+'	<div class="dialogContent">'
				+'		<p><strong>'+ $.i18n.t('Do you want to delete your Memolane account permanently? All memos, created lanes, lane contributions, and friend connections will be permanently lost.') +'</strong></p>'
						// in the case of FB Connect signup, and the like, we don't require a password (since they don't have one with us)
				+'		{{if m.currentUser.requires_pw}}'
				+'			<p>'+ $.i18n.t('Enter your password to confirm:') +' <input type="password" id="deleteAccountPassword" style="margin-bottom:0;" /></p>'
				+'		{{/if}}'
				+'		<div style="padding-bottom:10px;"><a href="#" class="btn-red float-left deleteConfirm" style="margin-right:10px;">'+ $.i18n.t('Yes, DELETE my account') +'</a> <a href="#" class="secondaryAction float-left close" style="margin-left:10px; line-height:19px;">'+ $.i18n.t('No, I want to keep my account') +'</a> <div style="display:none; line-height:21px; padding-left:10px;">'+ $.i18n.t('Deleting...', 'deletion in progress') +'</div></div>'
				+'	</div>'
				+'</div>'
		}
	}
	
};}(this,jQuery,this.undefined);

m.settings.initialize();