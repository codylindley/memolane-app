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

/*
	!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!  WARNING  !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
	
		This script has dependencies, namely that you have to have this on the page:
	
		<div id="fb-root"></div>
		<script>(function(d, s, id) {
		  var js, fjs = d.getElementsByTagName(s)[0];
		  if (d.getElementById(id)) return;
		  js = d.createElement(s); js.id = id;
		  js.src = "//connect.facebook.net/en_US/all.js#xfbml=1&appId=289687984381582";
		  fjs.parentNode.insertBefore(js, fjs);
		}(document, 'script', 'facebook-jssdk'));</script>
*/

m.fbConnect = function(win,$,undefined){return{

	/*  static  */
	$body : $('body'),
	
	
	/*  initialize module  */
	initialize:function(){
		var that = this;
		
		if ( that.$body.find('#fb-root').length === 0 ) {
			that.$body.append('<div id="fb-root"></div>');
		}
		
		// Facebook login
		window.fbAsyncInit = function() {
			FB.init({
				appId: m.fbAppID,
				status: true, 
				cookie: true,
				xfbml: true,
				oauth: true
			});
			
			$('.facebookLoginBtn, #facebookBigButtonTop, #facebookBigButtonBottom')
				.removeClass('inactive')
				.bind(m.clickOrTouchEnd, function(e){				    
					// fire Facebook's login window
					FB.login(function(response) {
						if (response.authResponse) {
							that.sendAccessTokenToBackend( FB.getAuthResponse()['accessToken'] );
						}
						// else user cancelled login or didn't finish logging in
					}, {scope: 'user_about_me,email,user_activities,user_events,user_groups,user_likes,user_location,user_notes,user_photo_video_tags,user_photos,user_videos,read_stream,offline_access,publish_stream'});
					
					e.preventDefault();
				});
		};
		(function(d){
			var js, id = 'facebook-jssdk'; if (d.getElementById(id)) {return;}
			js = d.createElement('script'); js.id = id; js.async = true;
			js.src = "//connect.facebook.net/en_US/all.js";
			d.getElementsByTagName('head')[0].appendChild(js);
		}(document));
	},
	
	
	/*  modules  */
	sendAccessTokenToBackend:function(accessToken){
		var that = this;
		
		// call only once you have a valid FB access token
		$.ajax({
			type: 'POST',
			url: '/_snc/facebook',
			data: {
				_csrf: m.csrf,
				access_token: accessToken,
				skip_initial: true
			},
			success:function(data){
				if (data.status == 'returning user' || data.status == 'account merged') {
					win.mpq.register({'facebook-connect-user': true}, "all");
					m.utilities.trackIt(
						{category:'Rentention',action:'Login',label:'successful facebook login',value:1,"type":"facebook","status":"success"},
						function() { window.location.reload(); }
					);
				}
				else if (data.status == 'new account') {
					win.mpq.register({'facebook-connect-user': true}, "all");
					m.utilities.trackIt(
						{category:'Activation',action:'Signup',label:'successful signup',value:'',type:"facebook",status:"success"},
						function() { window.location.href = "/signup2#fbConnect=true"; }
					);
				}
				else if (data.status == 'conflict') {
					var $dialog = $.tmpl(that.templates.dialogs.emailConflict);
					
					// user types in their password
					$dialog.find('#mergeAccountPassword').keyup(function(){
						// hide the password error if there is one
						$('#fbConnectWrongPW').css('visibility', 'hidden');
						
						// make the merge button active only when there's a password of some sort
						if ( $(this).val().length === 0 ) {
							$('.mergeConfirm').addClass('inactive');
						}
						else {
							$('.mergeConfirm').removeClass('inactive');
						}
					});
					
					// password resent
					$dialog.find('#sendAnotherPassword').bind(m.clickOrTouchEnd, function(e){
						// remove link, add loading icon when they click
						$('#sendAnotherPassword').hide();
						$('#fbConnectPWLoading').fadeIn();
						
						// hide the password error if there is one
						$('#fbConnectWrongPW').css('visibility', 'hidden');
						
						$.ajax({
							type: 'POST',
							url: '/reset',
							data: {
								_csrf: m.csrf,
								email: data.email
							},
							success:function(data){
								// show success message
								$('#fbConnectPWLoading').hide();
								$('#fbConnectPWSuccess').fadeIn();
							},
							error:function(err){
								// show generic error message
								$('#fbConnectPWLoading').hide();
								$('#fbConnectPWError').fadeIn();
							}
						});
						
						e.preventDefault();
					});
					
					// user wants to merge accounts
					$dialog.find('.mergeConfirm').bind(m.clickOrTouchEnd, function(e){
						if ( $(this).is(':not(.inactive)') ) {
							$.ajax({
								type: 'POST',
								url: '/_snc/facebook',
								data: {
									_csrf: m.csrf,
									access_token: accessToken,
									skip_initial: true,
									password: $('#mergeAccountPassword').val()
								},
								success:function(data){
									if (data.status == 'returning user'){
										win.mpq.register({'facebook-connect-user': true}, "all");
										m.utilities.trackIt(
											{category:'Rentention',action:'Login',label:'successful facebook login',value:1,"type":"facebook","status":"success"},
											function() { window.location.reload(); }
										);
									}
									else if (data.status == 'new account') {
										win.mpq.register({'facebook-connect-user': true}, "all");
										m.utilities.trackIt(
											{category:'Activation',action:'Signup',label:'successful facebook signup',value:'',type:"facebook",status:"success"},
											function() { window.location.href = "/signup2#fbConnect=true"; }
										);									
									}
									else if (data.status == 'merge error') {
										$('#mergeAccountPassword').val('');
										$('#fbConnectWrongPW').css('visibility', 'visible');
									}
									else if (data.status == 'error') {										
										// fire off generic error
										var $dialog = $.tmpl(that.templates.dialogs.genericError);
										
										$dialog.lightbox_me({
											centered: true
										});
									}
								},
								error:function(err){
									// fire off generic error
									var $dialog = $.tmpl(that.templates.dialogs.genericError);
									
									$dialog.lightbox_me({
										centered: true
									});
								}
							});
						}
						else {
							// don't close the dialog
							e.stopPropagation();
						}
						
						e.preventDefault();
					});
					
					// fire off the dialog
					$dialog.lightbox_me({
						centered: true
					});
				}
				else if (data.status == 'error') {
					// fire off generic error
					var $dialog = $.tmpl(that.templates.dialogs.genericError);
					
					$dialog.lightbox_me({
						centered: true
					});
				}
			},
			error:function(){
				// fire off generic error
				var $dialog = $.tmpl(that.templates.dialogs.genericError);
				
				$dialog.lightbox_me({
					centered: true
				});
			}
		});
	},
	
	
	/*  templates  */	
	templates:{
		dialogs:{
			emailConflict:
				'<div id="" class="memolaneDialog">'
				+'	<div class="dialogTopBar">'
				+'		<div class="dialogTitle">'+ $.i18n.t("Account conflict") +'</div>'
				+'		<div class="close closeMemolaneDialog cancelAddingBtn">'+ $.i18n.t("close", "the close button to close the dialog window") +'</div>'
				+'		<div class="clearFloatNoHeight"></div>'
				+'	</div>'
				+'	<div class="dialogContent">'
				+'		<p><strong>'+ $.i18n.t("Your Facebook account or the email address associated with it has already been used on Memolane.") +'</strong></p>'
				+'		<p>'+ $.i18n.t("If you already have a Memolane account and want the ability to sign in with Facebook, enter your Memolane password below and we\'ll make the switch.") +'</p>'
				+'		<div style="overflow:hidden; line-height:16px;">'
				+'			<label>'+ $.i18n.t("Enter Memolane password:")
				+'				<div id="fbConnectWrongPW" style="position:absolute; display:inline; visibility:hidden; padding-left:10px; color:red;">Wrong password</div><br />'
				+'				<input type="password" id="mergeAccountPassword" style="width:150px; float:left;">'
				+'				<span style="line-height:38px; font-size:12px; position:relative; left:10px; max-width:none; margin:0;">'
				+'					<a href="#" id="sendAnotherPassword" style="font-weight:bold;">'+ $.i18n.t("I forgot, send me a new one.", "the link a user can click to have us send them a new password") +'</a>'
				+'					<span id="fbConnectPWLoading" style="display:none; line-height:inherit; margin:0; max-width:none;"><img src="/img/common/smallLoaderOnWhite.gif" alt="'+ $.i18n.t("loading image", "this is the alternative text that shows if a user hovers over a loading image") +'" /></span>'
				+'					<span id="fbConnectPWSuccess" style="display:none; color:#690; line-height:inherit; margin:0; max-width:none;">'+ $.i18n.t("Ok, we emailed you a new password.") +'</span>'
				+'					<span id="fbConnectPWError" style="display:none; color:#red; line-height:inherit; margin:0; max-width:none;">'+ $.i18n.t("There was an error sending your password.") +'</span>'
				+'				</span>'
				+'			</label>'
				+'		</div>'
				+'		<div style="line-height:16px;"><a href="#" class="btn-green float-left mergeConfirm inactive">'+ $.i18n.t("Merge accounts") +'</a> <span style="float:left; margin:2px 8px 0 10px;">'+ $.i18n.t("or", "connecting two different options") +'</span> <a href="/signup" class="secondaryAction float-left close" style="margin-left:0; font-weight:bold;">'+ $.i18n.t("make a new account") +'</a></div>'
				+'	</div>'
				+'</div>',
			genericError:
				'<div id="" class="memolaneDialog">'
				+'	<div class="dialogTopBar">'
				+'		<div class="dialogTitle">'+ $.i18n.t("Error") +'</div>'
				+'		<div class="close closeMemolaneDialog cancelAddingBtn">'+ $.i18n.t("close", "the close button to close the dialog window") +'</div>'
				+'		<div class="clearFloatNoHeight"></div>'
				+'	</div>'
				+'	<div class="dialogContent">'
				+'		<p><strong>'+ $.i18n.t("Error", "some generic error occurred and this is the heading informing the user of that") +'</strong></p>'
				+'		<p>'+ $.i18n.t("There was an error somewhere along the line.  Please try again.") +'</p>'
				+'		<div style="line-height:16px;"><a href="#" class="btn-green float-left close">'+ $.i18n.t("OK") +'</a></div>'
				+'	</div>'
				+'</div>'
		}
	}
	
};}(this,jQuery,this.undefined);

m.fbConnect.initialize();