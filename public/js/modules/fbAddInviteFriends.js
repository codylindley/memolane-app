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

// this is currently used on /signup2 and /signup3
//	- you'll have to tweak it slightly to use it elsewhere (as it's currently reliant upon on a few things that are unique to those pages)
m.fbAddInviteFriends = function(win,$,undefined){return{

	/*  static  */
	that: this,
	friendsLoaded: false,
	friendsAddedToDom: false,
	friends: {},
	friendsInvited: {
		"existing_users":0,
		"not_on_memolane":0
	},
	
	
	/*  initialize module  */
	initialize:function(){
		if (m.promptFacebookFriends) {
			var that = this;
			
			// if this is shown in a container, do that now
			this.showFriendsContainer();
			$('body').bind('memolane-fbFriendsLoaded', function(){ that.addFriendsToDOM(); });
			
			// get the friends list ready on load
			this.loadFriends();
			
			// if they click to start exploring (on signup step 2)
			$('#startExploringLink').bind( m.clickOrTouchStart, $.proxy( this.showFriendsDialog, this ) );
			
			// setup select all/none
			$('body').delegate('.selectAll', m.clickOrTouchEnd, function(){ $(this).closest('div').find('input[type=checkbox]').prop('checked', true).end().find('.inactive').removeClass('inactive'); return false; });
			$('body').delegate('.selectNone', m.clickOrTouchEnd, function(){ $(this).closest('div').find('input[type=checkbox]').prop('checked', false).end().find('a').addClass('inactive'); return false; });
			
			// enable/disable action button, depending upon whether they have any people selected
			$('body').delegate('#addFriendsDialog input[type=checkbox], #addFriendsList input[type=checkbox]', m.clickOrTouchEnd, function(){
				var $parentDiv = $(this).closest('div');
				if ($parentDiv.find('input[type=checkbox]:checked').length) {
					$parentDiv.find('.inactive').removeClass('inactive');
				}
				else {
					$parentDiv.find('a').addClass('inactive');
				}
			});
			
			// wire up Facebook friends action buttons
			$('body').delegate('#facebookAddExistingFriends', m.clickOrTouchEnd, $.proxy(this.addExistingFriends, this));
			$('body').delegate('#facebookInviteFriends', m.clickOrTouchEnd, $.proxy(this.inviteFriends, this));
		}
	},
	
	
	/*  methods  */
	loadFriends: function(){
		var that = this;
		
		$.ajax({
			type: 'get',
			url: '/add_friends/contacts_facebook',
			success: function(data) {
				// sort & store existing friends
				var existingFriendsSort = _.sortBy(
					data.existing_users, function(prop){ return prop.full_name ? prop.full_name.toLowerCase() : null }
				);
				that.friends.existing_users = existingFriendsSort;
				
				// sort & store invitable friends
				var inviteFriendsSort = _.sortBy(
					data.not_on_memolane, function(prop){ return prop.first_name ? prop.first_name.toLowerCase() : null }
				);
				that.friends.not_on_memolane = inviteFriendsSort;
				
				// report that it's loaded
				that.friendsLoaded = true;
				$('body').trigger('memolane-fbFriendsLoaded');
			},
			error: function() {
				
			}
		});
	},
	
	
	addFriendsToDOM: function(){
		if (!this.friendsAddedToDom) {
			this.friendsAddedToDom = true;
			
			$('#addFriendsDialog, #addFriendsList')
				.find('#dialogContentPlaceholder').empty().append( $.tmpl(this.templates.friendsContent, this.friends) )
				.end().trigger('reposition');
		}
	},
	
	
	showFriendsContainer: function(){
		var $container = $('#fbFriendsContainer');
		
		if ($container.length) {
			$container.html( $.tmpl(this.templates.addFriendsContainer) );
		}
	},
	
	
	showFriendsDialog: function(e){
		var that = this;
		var $dialog = $.tmpl(this.templates.addFriendsDialog);
		$dialog.lightbox_me();
		
		// add friends to the DOM if they're ready
		function addToDOM() {
			if (that.friendsLoaded === true) {
				clearInterval( areFriendsReady );
				that.addFriendsToDOM();
			}
		}
		var areFriendsReady = setInterval(addToDOM, 100);
		
		e.preventDefault();
	},
	
	
	addExistingFriends: function(e){
		var that = this;
		var $this = $(e.target);
		
		if ( !$this.hasClass('inactive') ) {
			// update UI
			$this.addClass('inactive').text( $.i18n.t('Sending friend requests...') );
			
			var memolaneUIDs = [];
			
			$('.addFriendsStep1 li input[type=checkbox]:checked').each(function(){
				memolaneUIDs.push( this.getAttribute("value") );
			});
			
			// tracking event
			m.utilities.trackIt({category:'Activation', action:'Adding Friends', label:'Adding friends during signup', added: memolaneUIDs.length});
			
			$.ajax({
				type: 'post',
				url: '/add_friends/batch_request',
				data: {
					uids: memolaneUIDs
				},
				success: function(data) {
					// update browsing button
					$('#btnStartBrowsing').text( $.i18n.t('Start browsing') );
					
					// remove people I've already invited
					var uidSelector = '#uid_'+ memolaneUIDs.join(',#uid_');
					$(uidSelector).slideUp(function(){ $(this).remove(); });
					
					// update global counter
					that.friendsInvited.existing_users += memolaneUIDs.length;
					
					// all available friends were invited
					if ( that.friends && (that.friends.existing_users.length === that.friendsInvited.existing_users) ) {
						$this.parents('.addFriendsStep').fadeOut(function(){ $(this).remove(); });
					}
					// some friends are still available to invite
					else {
						// update invite button text
						$this.text( $this.attr('data-original-text') );
					}
				},
				error: function() {
					
				}
			});
		}
		
		e.preventDefault();
	},
	
	
	inviteFriends: function(e){
		var that = this;
		var $this = $(e.target);
		
		if ( !$this.hasClass('inactive') ) {
			// update UI
			$this.addClass('inactive').text( $.i18n.t('Sending invites...') );
			
			var memolaneUIDs = [];
			
			$('.addFriendsStep2 li input[type=checkbox]:checked').each(function(){
				memolaneUIDs.push( this.getAttribute("value") );
			});
			
			// tracking event
			m.utilities.trackIt({category:'Activation', action:'Adding Friends', label:'Adding friends during signup', invited: memolaneUIDs.length});
			
			$.ajax({
				type: 'post',
				url: '/add_friends/invite',
				data: {
					emails: memolaneUIDs
				},
				success: function(data) {
					// update browsing button
					$('#btnStartBrowsing').text( $.i18n.t('Start browsing') );
					
					// remove people I've already invited
					var uidSelector = '#uid_'+ memolaneUIDs.join(',#uid_');
					$(uidSelector).slideUp(function(){ $(this).remove(); });
					
					// update global counter
					that.friendsInvited.not_on_memolane += memolaneUIDs.length;
					
					// all available friends were invited
					if ( that.friends && (that.friends.not_on_memolane.length === that.friendsInvited.not_on_memolane) ) {
						$this.parents('.addFriendsStep').fadeOut(function(){ $(this).remove(); });
					}
					// some friends are still available to invite
					else {
						// update invite button text
						$this.text( $this.attr('data-original-text') );
					}
				},
				error: function() {
					
				}
			});
		}
		
		e.preventDefault();
	},
	
	
	/*  templates  */
	templates: {
		friendsContent:
			'<div>'
			+'	{{if existing_users.length > 0}}'
			+'		<div id="addFriends-existing" class="addFriendsStep{{if not_on_memolane.length > 0}} twoSteps{{/if}}">'
			+'		<div class="addFriendsStep1">'
			+'			<h3>'+ $.i18n.t('Send friend requests to your Facebook friends.')
			+'				<span>'+ $.i18n.t('Select:', 'select either all of the items or none') +' <a href="#" class="selectAll">'+ $.i18n.t('all', 'select all items') +'</a> | <a href="#" class="selectNone">'+ $.i18n.t('none', 'select none of the items') +'</a></span>'
			+'			</h3>'
			+'			<ul>'
			+'			{{each existing_users}}'
			+'				<li id="uid_${username}"><input type="checkbox" checked="checked" value="${username}" /> <img src="${image}" alt="'+ $.i18n.t("profile picture") +'" /> <p>${full_name}</p></li>'
			+'			{{/each}}'
			+'			</ul>'
			+'			<a href="#" class="btn-green" id="facebookAddExistingFriends" data-original-text="'+ $.i18n.t("Send request(s)") +'">'+ $.i18n.t("Send request(s)") +'</a>'
			+'		</div>'
			+'		</div>'
			+'	{{/if}}'
			+'	{{if not_on_memolane.length > 0}}'
			+'		<div id="addFriends-invite" class="addFriendsStep{{if existing_users.length > 0}} twoSteps{{/if}}">'
			+'		<div class="addFriendsStep2">'
			+'			<h3>'+ $.i18n.t('Invite Facebook friends to Memolane.')
			+'				<span>'+ $.i18n.t('Select:', 'select either all of the items or none') +' <a href="#" class="selectAll">'+ $.i18n.t('all', 'select all items') +'</a> | <a href="#" class="selectNone">'+ $.i18n.t('none','select none of the items') +'</a></span>'
			+'			</h3>'
			+'			<ul>'
			+'			{{each not_on_memolane}}'
			+'				<li id="uid_${uid}"><input type="checkbox" checked="checked" value="${uid}" /> <img src="${pic_square}" alt="'+ $.i18n.t("profile picture") +'" /> <p>${first_name} ${last_name}</p></li>'
			+'			{{/each}}'
			+'			</ul>'
			+'			<a href="#" class="btn-green" id="facebookInviteFriends" data-original-text="'+ $.i18n.t("Send invite(s)") +'">'+ $.i18n.t("Send invite(s)") +'</a>'
			+'		</div>'
			+'		</div>'
			+'	{{/if}}'
			+'</div>'
		,
		// this is for putting it in a dialog
		addFriendsDialog:
			'<div id="addFriendsDialog" class="memolaneDialog signup" style="width:850px;">'
			+'	<div class="dialogContent">'
			+'		<h2>'+ $.i18n.t('Before you begin exploring...') +' <a href="/explore" class="btn-light-blue" style="float:right;" id="btnStartBrowsing">'+ $.i18n.t('No thanks, let\'s start browsing') +'</a></h2>'
			+'		<div id="dialogContentPlaceholder">'
			+'			<p style="padding-top:10px; text-align:center;"><img src="/img/common/smallLoaderOnGrey.gif" alt="'+ $.i18n.t("loading image") +'" /></p>'
			+'		</div>'
			+'	</div>'
			+'</div>'
		,
		// this is for putting it on the page, not in a dialog
		addFriendsContainer:
			'<div>'
			+'<div id="addFriendsList" class="memolaneDialog signup" style="min-width:850px;">'
			+'	<div class="dialogContent">'
			+'		<h2>'+ $.i18n.t('While you\'re waiting...') +'</h2>'
			+'		<div id="dialogContentPlaceholder">'
			+'			<p style="padding-top:10px; text-align:center;"><img src="/img/common/smallLoaderOnGrey.gif" alt="'+ $.i18n.t("loading image") +'" /></p>'
			+'		</div>'
			+'	</div>'
			+'</div>'
			+'</div>'
	}
	
};}(this,jQuery,this.undefined);

m.fbAddInviteFriends.initialize();