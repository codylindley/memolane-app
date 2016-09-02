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

m.services = function(win,$,undefined){return{

	/*  static  */
	$body : $('body'),
	facebookAutoAddTooltip:false,
	$makeLaneBtn : null,
	importableServices : { // object of services (by account.service) that are setup to allow inheriting privacy
		"flickr": {
			"disclaimerText": $.i18n.t('Select \"Import Privacy\" if you want Memolane to automatically import privacy settings from Flickr. Otherwise, the other privacy setting that you select on Memolane for Flickr (public, private, or friends only) will be applied to all the content from Flickr uniformly.'),
			"mappings": {
				"mlPublic": [
					$.i18n.t("Public", "this is the privacy setting label that maps to the Memolane privacy of public - it should match whatever it is called on Flickr")
				],
				"mlFriends": [
					$.i18n.t("Friends", "this is the privacy setting label that maps to the Memolane privacy of friends only - it should match whatever it is called on Flickr"),
					$.i18n.t("Friends &amp; Family", "this is the privacy setting label that maps to the Memolane privacy of friends only - it should match whatever it is called on Flickr")
				],
				"mlPrivate": [
					$.i18n.t("Family", "this is the privacy setting label that maps to the Memolane privacy of private - it should match whatever it is called on Flickr"),
					$.i18n.t("Private", "this is the privacy setting label that maps to the Memolane privacy of private - it should match whatever it is called on Flickr")
				]
			}
		},
                "foursquare": {
                        "disclaimerText": $.i18n.t('Select \"Import Privacy\" if you want Memolane to automatically import privacy settings from Foursquare. Otherwise, the other privacy setting that you select on Memolane for Foursquare (public, private, or friends only) will be applied to all the content from Foursquare uniformly.'),
                        "mappings": {
                                "mlPublic": [
					$.i18n.t("Public", "this is the privacy setting label that maps to the Memolane privacy of public - it should match whatever it is called on Foursquare")
				],
                                "mlFriends": [],
                                "mlPrivate": [
					$.i18n.t("Off the Grid", "this is the privacy setting label that maps to the Memolane privacy of private - it should match whatever it is called on Foursquare")
				]
                        }
                },
                "picasa": {
                        "disclaimerText": $.i18n.t('Select \"Import Privacy\" if you want Memolane to automatically import privacy settings from Picasa. Otherwise, the other privacy setting that you select on Memolane for Picasa (public, private, or friends only) will be applied to all the content from Picasa uniformly.'),
                        "mappings": {
                                "mlPublic": [
					$.i18n.t("Public", "this is the privacy setting label that maps to the Memolane privacy of public - it should match whatever it is called on Picasa")
				],
                                "mlFriends": [],
                                "mlPrivate": [
					$.i18n.t("Private", "this is the privacy setting label that maps to the Memolane privacy of private - it should match whatever it is called on Picasa"),
					$.i18n.t("Limited", "this is the privacy setting label that maps to the Memolane privacy of private - it should match whatever it is called on Picasa"),
					$.i18n.t("Visible with Link", "this is the privacy setting label that maps to the Memolane privacy of private - it should match whatever it is called on Picasa")
				]
                        }
                },
                "soundcloud": {
                        "disclaimerText": $.i18n.t('Select \"Import Privacy\" if you want Memolane to automatically import privacy settings from SoundCloud. Otherwise, the other privacy setting that you select on Memolane for SoundCloud (public, private, or friends only) will be applied to all the content from SoundCloud uniformly.'),
                        "mappings": {
                                "mlPublic": [
					$.i18n.t("Public", "this is the privacy setting label that maps to the Memolane privacy of public - it should match whatever it is called on SoundCloud")
				],
                                "mlFriends": [],
                                "mlPrivate": [
					$.i18n.t("Private", "this is the privacy setting label that maps to the Memolane privacy of private - it should match whatever it is called on SoundCloud")
				]
                        }
                },
                "twitter": {
                        "disclaimerText": $.i18n.t('Select \"Import Privacy\" if you want Memolane to automatically import privacy settings from Twitter. Otherwise, the other privacy setting that you select on Memolane for Twitter (public, private, or friends only) will be applied to all the content from Twitter uniformly.'),
                        "mappings": {
                                "mlPublic": [
					$.i18n.t("Public", "this is the privacy setting label that maps to the Memolane privacy of public - it should match whatever it is called on Twitter")
				],
                                "mlFriends": [],
                                "mlPrivate": [
					$.i18n.t("Protected", "this is the privacy setting label that maps to the Memolane privacy of private - it should match whatever it is called on Twitter")
				]
                        }
                },
                "wordpress": {
                        "disclaimerText": $.i18n.t('Select \"Import Privacy\" if you want Memolane to automatically import privacy settings from WordPress.com. Otherwise, the privacy setting that you select on Memolane for WordPress.com (public, private, or friends only) will be applied to all the content from WordPress.com uniformly.'),
                        "mappings": {
                                "mlPublic": [
					$.i18n.t("Public", "this is the privacy setting label that maps to the Memolane privacy of public - it should match whatever it is called on WordPress.com")
				],
                                "mlFriends": [],
                                "mlPrivate": [
					$.i18n.t("Private", "this is the privacy setting label that maps to the Memolane privacy of private - it should match whatever it is called on WordPress.com"),
					$.i18n.t("Password Protected", "this is the privacy setting label that maps to the Memolane privacy of private - it should match whatever it is called on WordPress.com")
				]
                  }
                }
	},
	privacyLabels : {
		'private' : $.i18n.t("Private", "this is the name of the privacy setting that allows a user to set all memos for a given service to private"),
		'public' : $.i18n.t("Public", "this is the name of the privacy setting that allows a user to set all memos for a given service to public"),
		'friends' : $.i18n.t("Friends Only", "this is the name of the privacy setting that allows a user to set all memos for a given service to only friends"),
		'inherit' : $.i18n.t("Import Privacy", "this is the name of the privacy setting that allows a user to set all memos for a given service to map to the privacy of the originating service")
	},
	added : {},			// added service JSON objects - used by code below
	deleting : [],			// service IDs in the process of being deleted - used by code below
	
	
	/*  initialize module  */
	initialize:function(){
		var that = this;
		
		// check services now, then poll
		this.checkAccounts();
		this.pollAccounts();
		
		// populate this var for pages that have the "Make Lane" button (i.e. step 2 of signup)
		var $makeLane = $('#makeFirstLaneBtn');
		if ($makeLane.length) {
			this.$makeLaneBtn = $makeLane;
			// prevent click if the button is in its inactive state
			this.$makeLaneBtn.bind(m.clickOrTouchEnd, function(e){
				if( $(this).is('.inactive') ) {
					e.preventDefault();
					return false;
				}
				else {
     				// fire tracking event
     				var that = this;
     				m.utilities.trackIt({category:'Activation',action:'Creating a Lane',label:'First lane creation'}, function() { window.location = $(that).attr('href'); });     			   				     				
    			}
    			return false;				
			});			
		}
		
		// user clicks to add a service
		this.$body.find('.services-available li').bind(m.clickOrTouchEnd, function(){ m.utilities.trackIt( {category:'Activation', action:'Adding a service', label:'Adding a service', value:'', "type":"form", "status":"success"}); $(this).addClass('adding'); });
		
		// user clicks to add G+
		this.$body.find('.services-available li .google-plus').bind(m.clickOrTouchEnd, $.proxy(this.GPlusWarningDialog, this));
		
		// user clicks to add RSS
		this.$body.find('.services-available li .feed').bind(m.clickOrTouchEnd, $.proxy(this.addRSSDialog, this));
		
		// user clicks "advanced"
		this.$body.find('.services-added ul:first').delegate('.advancedBtn', m.clickOrTouchEnd, function(){ that.toggleAdvanced( $(this) ); });
		
		$.validity.setup({ outputMode:"modal" });
	},
	
	
	pollAccounts:function(){
		// don't poll more often than 1.5 seconds or when we get the last poll back
		$.when( m.utilities.wait(1500), m.services.checkAccounts() ).done(function(){ m.services.pollAccounts(); });	
	},
	
	
	/*  methods  */
	checkAccounts:function(){
		var that = this;
		return $.ajax({
			type: 'get',
			url: '/accounts',
			success: function(data) {
				
				if(data.accounts.length === 0){
					$('.services-added h6').show();
				}else{
					$('.services-added h6').hide();
				}
				
				var servicesToUpdate = {}; // will be filled only with services that need updating
				var returnedAccountIDs = [];
				
				for (x in data.accounts) {
					var account = data.accounts[x];
					var accountID = account["id"];
					returnedAccountIDs.push(accountID);
					
					// only do something if this account is new/changed
					if ( !that.added[accountID]  ||  (that.added[accountID].account_modified != account.account_modified) ) {
					
						that.added[accountID] = account;
						
						if (account.error) {
							var errorsInTemplate = 'access_revoked remote_service_error mid_delete rss_error';
							// if it's a special type of "error"
							if (errorsInTemplate.indexOf(account.error.type) == -1) {
								that.handleSpecialAccountErrors(account);
							}
							else {
								// this sets us up to nuke the "error" version of the service if a fixed one comes in
								that.deleting.push( account['id'] );
								// the template handles these types of errors
								servicesToUpdate[accountID] = that.createServiceHTML( account );
							}
						}
						else {
							servicesToUpdate[accountID] = that.createServiceHTML( account );
						}
					}
				}
				
				// update LIs
				that.updateDOMwithAddedServices( servicesToUpdate );
				
				// if the account was being deleted, but isn't being delivered any more, the deleting has finished, and we can remove it
				for (y in that.deleting) {
					if ( _.indexOf(returnedAccountIDs, that.deleting[y]) == -1 ) {
						// nuke it from the DOM
						$('#'+ that.deleting[y]).fadeOut(function(){ $(this).remove(); });
						// clean up tracking object
						that.deleting = _.without(that.deleting, that.deleting[y]);
					}
				}
			}
		});
	},
	
	
	// creates a jQuery object of the HTML for a service to be added (used in conjunction with updateDOMwithAddedServices())
	createServiceHTML:function(account) {
		var thisService = $.tmpl(this.templates.addedService, account);
		thisService.find('.getNewContent').bind(m.clickOrTouchEnd, {"account":account}, function(e){ m.services.fetchNewContent(e.data.account); return false; });
		thisService.find('.setPrivacy').bind(m.clickOrTouchEnd, {"account":account}, function(e){ m.services.setPrivacy(e.data.account); return false; });
		thisService.find('.refreshService').bind(m.clickOrTouchEnd, {"account":account}, function(e){ m.services.refetchAllContent(e.data.account); return false; });
		thisService.find('.removeService').bind(m.clickOrTouchEnd, {"account":account}, function(e){ m.services.removeServiceDialog(e.data.account); return false; });
		
		return thisService;
	},
	
	
	// this takes an object containing n objects, each of whose key is the account ID, and value is the jQuery LI to use to replace it
	updateDOMwithAddedServices:function(accounts) {
		if (_.size(accounts)) {		
			var $available = this.$body.find('.services-available');
			var $services = this.$body.find('.services-added ul:first');
			
			if (this.$makeLaneBtn) {
				this.$makeLaneBtn.removeClass('inactive');
				this.$makeLaneBtn = null;
			}
			
			for ( y in accounts ) {
				if (this.added[y]) {
					$available.find('a[class='+ this.added[y].service +']').closest('li').removeClass('adding');
				}
				
				// if the service is already in the DOM, update it
				var $thisService = $services.find('#'+ y);
				if ( $thisService.length ) {
					$thisService.replaceWith( accounts[y] );
				}
				// otherwise, add it to the DOM
				else {
					$services.append( accounts[y] );
				}
				
				// if this is an error, open the edit drawer (which shows the error message)
				$li = $(accounts[y]).find('.serviceAdded.serviceError');
				if ( $li.length ) {
					$li.find('.advancedBtn').click();
				}
			}
		}
		
		// if 
		if (this.facebookAutoAddTooltip === false && m.utilities.urlHash.get('fbConnect')) {
			this.facebookAutoAddTooltip = true;
			var $facebook = $('.serviceAdded.facebook');
			if ($facebook.length){
				$facebook.find('.advancedBtn').trigger('click');
			}
		}
		
	},
	
	
	// this handles errors with accounts that *aren't* added to the "added services" list (e.g. setting privacy and selecting a page)
	handleSpecialAccountErrors:function(account) {
		// no privacy set
		if (account.error.type == 'no_privacy_set') {
			this.setPrivacy(account);
		}
		// no page selected
		else if (account.error.type == 'no_page_selected') {
			$dialog = $.tmpl(m.services.templates.selectPageDialog, account);
			// remove service button
			$dialog.find('.removeService').bind(m.clickOrTouchEnd, {"account":account}, function(e){
				m.services.removeService(e.data.account);
			});
			// when a radio gets selected
			$dialog.find('input:radio').one(m.clickOrTouchEnd, function(){
				$(this).closest('.dialogContent').find('.selectPageBtn').each(function(){
					if ( $(this).css('visibility') != 'visible' ) $(this).css('visibility', 'visible').hide().fadeIn();
				});
			});
			// select page button
			$dialog.find('.selectPageBtn').bind(m.clickOrTouchEnd, function(){
				var pageID = $(this).closest('.dialogContent').find('input:radio:checked').val();
				m.services.setPage(account["id"], pageID);
			});
			
			$dialog.lightbox_me({
				centered: true,
				destroyOnClose: true,
				closeClick: false,
				closeEsc: false
			});
		}
	},
	
	
	// used only for G+, which is a hobbled service
	GPlusWarningDialog:function(e) {
		var $dialog = $.tmpl(this.templates.GPlusWarningDialog);
		var addAnyway = false;
		
		// event for warning dialog
		m.utilities.trackIt({category:'Services', action:'Warn Google+', label:'Warning about Google+ is for public memos only'});
		
		// user clicks to add it anyway
		$dialog.find('.addGPlus').bind(m.clickOrTouchEnd, function(event){
			// event for service added
			m.utilities.trackIt({category:'Services', action:'Add Google+', label:'Adding Google+ as a service'});
			
			// close dialog
			addAnyway = true;
			$dialog.trigger('close');
		});
		
		$dialog.lightbox_me({
			centered: true,
			onClose: function(){
				// if they don't add G+, stop the animation
				if (!addAnyway) {
					$('.google-plus').parent().removeClass('adding');
				}
			}
		});
		
		e.preventDefault();
	},
	
	
	// used only for RSS feeds, which work differently, given that they aren't Oauth
	addRSSDialog:function(e) {
		var $dialog = $.tmpl(this.templates.addRSSDialog);
		
		// user clicks to add feed
		$dialog.find('.addFeedBtn').bind(m.clickOrTouchEnd, function(event){
			
			var urlRegex = /^(https?|ftp|feed):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i;
			
			$.validity.start();
			
			$('#rssFeedURL')
				.require()
				.match(urlRegex, $.i18n.t('This field must be formatted as a valid feed URL.', 'this message informs the user that when they are adding an RSS feed as a service, that it has to be valid URL syntax'));
			
			var results = $.validity.end();
			
			if ( results.valid ) {
				$.ajax({
					url: '/services/feed/finalize',
					data: {
						url : $('#rssFeedURL').val()
					}
				});
				// close the dialog (no need to wait for the request to come back)
				$('#addRSSDialog').trigger('close');
			}
			
			event.preventDefault();
		});
		
		// if I click cancel, not add, remove adding animation from rss add button
		$dialog.find('.close').bind(m.clickOrTouchEnd,function(e){
			$('.formError').remove();
			if($(e.target).hasClass('removeService')){
				$('a.feed').closest('li').removeClass('adding');
			};
		});
		
		$dialog.lightbox_me({
			centered: true,
			closeClick: false,
			closeEsc: false
		});
		
		e.preventDefault();
	},
	
	
	// used for both set privacy API call AND INITIAL set privacy API call
	setPrivacy:function(account) {		
		var $dialog = $.tmpl(m.services.templates.setPrivacyDialog, account);
		// set privacy via API call
		$dialog.find('.privacyTabs li').bind(m.clickOrTouchEnd, {'account':account}, function(e){
			var elementClicked = e.target;
			var privacy = $(e.target).attr('id');
			var account = e.data.account;
			var apiURL = '/account_privacy/';
			// if this is the first time setting it, do a different API call
			if (account.error) apiURL = '/account_initial_privacy/';
			
			$.ajax({
				type: 'post',
				url: apiURL + encodeURIComponent( account['id'] ),
				data: { 'privacy': privacy }, // public, private, friends, or for some services, inherit
				success: function(data) {
					$(elementClicked).closest('.memolaneDialog').trigger('close');
				}
			});
			
			$(this).addClass('smallButtonActive');
			e.preventDefault();
		});
		// show/hide privacy descriptions
		$dialog.find('li a').bind('mouseenter mouseleave '+ m.clickOrTouchEnd, function(e){ 
			var $this = $(this);
			var thisID = $this.attr('id');
			
			// don't hide description if it's the active button
			if ( !$this.hasClass('active') ) {
				// show description on mouseenter
				if (e.type == 'mouseenter') {
					m.services.$body.find('.privacyTabDescription div').hide();
					m.services.$body.find('#'+ thisID +'TabDescription').fadeIn('fast');
				}
				// hide hover description and show active description if it's a mouseleave (and one is active)
				else if ( (e.type == 'mouseleave') && $this.siblings().hasClass('active') ) {
					m.services.$body.find('.privacyTabDescription div').hide();
					var siblingID = $this.siblings('.active').attr('id');
					m.services.$body.find('#'+ siblingID +'TabDescription').fadeIn('fast');
				}
				// hide the description if there's no active button and it's a mouseleave
				else {
					m.services.$body.find('.privacyTabDescription div').hide();
				}
			}
		});
		
		var allowClose = true;
		if (account.error) {
			allowClose = false;
			$dialog.find('.removeService').bind(m.clickOrTouchEnd, {"account":account}, function(e){
				m.services.removeService(e.data.account);
			});
		}
		
		$dialog.lightbox_me({
			closeClick: allowClose,
			closeEsc: allowClose
		});
	},
	
	
	// this sets the page for accounts that have multiple to choose from (e.g. Facebook Pages & Tumblr)
	setPage:function(accountID, pageID) {
		$.ajax({
			type: 'post',
			url: '/utils/set_page',
			data: {
				'account_id' : accountID,
				'page_id' : pageID
			}
		});
	},
	
	
	fetchNewContent:function(account) {
		$.ajax({
			type: 'post',
			url: '/update/'+ encodeURIComponent( account['id'] )
		});
		
		var $dialog = $.tmpl(this.templates.fetchNewDialog, account);
		$dialog.lightbox_me({
			centered: true
		});
	},
	
	
	refetchAllContent:function(account) {
		var $dialog = $.tmpl(this.templates.refetchAllDialog, account);
		
		// user clicks to affirm re-fetching
		$dialog.find('.refetchConfirm').bind(m.clickOrTouchEnd, {'account':account}, function(e){
			var privacy = $(e.target).attr('id');
			var account = e.data.account;
			
			$.ajax({
				type: 'post',
				url: '/refresh/'+ encodeURIComponent( account['id'] )
			});
			
			e.preventDefault();
		});
		
		$dialog.lightbox_me({
			centered: true
		});
	},
	
	
	// used to prompt a dialog for service removal - calls removeService()
	removeServiceDialog:function(account) {
		var $dialog = $.tmpl(this.templates.removeServiceDialog, account);
		
		// user clicks to affirm removal
		$dialog.find('.removeConfirm').bind(m.clickOrTouchEnd, {'account':account}, function(e){
			m.services.removeService(e.data.account);
			e.preventDefault();
		});
		
		$dialog.lightbox_me({
			centered: true
		});
	},
	
	
	// used to do the actual service removal
	removeService:function(account) {
		var accountID = account['id'];
		this.$body.find('.services-available a[class*='+ account.service +']').closest('li').removeClass('adding');
		$.ajax({
			type: 'delete',
			url: '/account/'+ encodeURIComponent( accountID )
		});
		this.$body
			.find('.memolaneDialog').trigger('close')
			.end().find('#'+ accountID).addClass('deleting')
				.find('.serviceSettings').hide();
		this.deleting.push(accountID);
	},
	
	
	toggleAdvanced:function(advancedBtn){
		$advancedBtn = $(advancedBtn);
		$settings = $advancedBtn.parents('.serviceAdded').siblings('.serviceSettings');
		
		if ( $settings.is(':visible') ) {
			$settings.slideUp('fast');
			$advancedBtn.removeClass('open')
		}
		else {
			$settings.slideDown(function(){
				if (m.utilities.urlHash.get('fbConnect')){
					$('.serviceAdded.facebook').next('.serviceSettings').find('.setPrivacy').tipsy({hover:'manual', offset:5, html:true, gravity:'n',fallback:'<p class="zeroMarginBottom">'+$.i18n.t('We\'ve added this service for you and set the privacy level to private. If you want to change that. Click \"Set privacy\".')+'</p>'}).tipsy('show');
				}		
			})
			$advancedBtn.addClass('open');
		}
			
		return false;
	},
	
	
	/*  templates  */	
	templates:{
		addedService:
			'<li id="${id}"{{if error && error.type == "mid_delete"}} class="deleting"{{/if}}>'
			+'	<div class="serviceAdded ${service}{{if error}} serviceError{{/if}}">'
			+'		<div>'
			+'			<img height="30" width="30" src="{{if image}}${image}{{else}}/img/defaults/avatar-140.gif {{/if}}" alt="${service_name}" />'
			+'			<div class="serviceInfo float-left">'
			+'				<h3>{{if username}}${username}{{else}}${user_id}{{/if}}</h3>'
			+'				<div class="currentPrivacy icon${default_privacy}">${m.services.privacyLabels[default_privacy]}</div>'
			+'			</div>'
			+'			<div class="serviceControls float-right">'
			+'				<div class="serviceHealth"><span class="deletingText">'+ $.i18n.t("Deleting", "this is a temporary status message that informs the user that the given service is in the process of being deleted") +'</span></div>'
			+'				<div class="getNewContentBtn getNewContent smallTooltip float-right sml-btn-grey">'+ $.i18n.t("Fetch New Content", "this button allows the user to pull down any new content that exists in the given service") +'</div>'
			+'				<div class="advancedBtn">'+ $.i18n.t("Edit", "this is a button that allows the user to edit certain aspects of the given service") +'</div>'
			+'			</div>'
			+'		</div>'
			+'	</div>'
			+'	<div class="serviceSettings">'
			+'		<div class="serviceSettingsContent">'
			+'			{{if error}}'
			+'				<div class="serviceErrorText">'
			+'					{{if error.type == "access_revoked"}}'
			+'						'+ $.i18n.t('We are no longer authorized to access this ${service_name} account.  You can <a href=\"/services/${service}\" target=\"_blank\">reauthorize it</a> or remove it (by clicking the \"Remove Service\" button below).')
			+'					{{else error.type == "remote_service_error"}}'
			+'						'+ $.i18n.t('Our recent attempts to fetch new content from your ${service_name} account failed. You can wait, or try again now by clicking the \"Fetch New Content\" button.')
			+'					{{else error.type == "mid_delete"}}'
			+'						'+ $.i18n.t('This ${service_name} account (and its memos) are in the process of being deleted.')
			+'					{{else error.type == "rss_error"}}'
			+'						'+ $.i18n.t('This RSS feed is not currently available. You may want to verify that it still exists at <a href=\"${error.description}\" target=\"_blank\">${error.description}</a>.')
			+'					{{/if}}'
			+'				</div>'
			+'			{{/if}}'
			+'			<ul>'
			+'				<li>'
			+'					<a href="#" class="btn-light-blue setPrivacy">'+ $.i18n.t("Set Privacy", "this is the button text for setting privacy on the given service") +'</a>'
			+'				</li>'
			+'				<li>'
			+'					<a href="#" class="btn-light-blue refreshService">'+ $.i18n.t("Re-fetch all content", "this is the button text for re-fetching the given service (which is basically to refresh all stored memos by replacing them with new copies from the originating service)") +'</a>'
			+'				</li>'
			+'				<li>'
			+'					<a href="#" class="btn-light-blue removeService">'+ $.i18n.t("Remove Service", "this is the button text for deleting the given service") +'</a>'
			+'				</li>'
			+'			</ul>'
			+'		</div>'
			+'	</div>'
			+'</li>'
		,
		
		GPlusWarningDialog:
			'<div id="addRSSDialog" class="memolaneDialog">'
			+'	<div class="dialogTopBar">'
			+'		<div class="dialogTitle">'+ $.i18n.t("A special note about Google+") +'</div>'
			+'		<div class="close closeMemolaneDialog removeService">'+ $.i18n.t("cancel", "the cancel button to close the dialog window") +'</div>'
			+'		<div class="clearFloatNoHeight"></div>'
			+'	</div>'
			+'	<div class="dialogContent">'
			+'		<p>'+ $.i18n.t('At this time, Google+ only offers us text posts, photos, links, and locations that you explicitly mark as "public" when publishing them on Google+.') +'</p>'
			+'		<p><a href="/services/google-plus" target="_blank" title="'+ $.i18n.t("Authorize Google+ Page", "Mouse over of add service button on service settings page") +'" class="btn-green float-left addGPlus">'+ $.i18n.t("Continue", "the button text that affirms the user\'s desire to add G+ as a service") +'</a>  <a href="#" class="secondaryAction float-left close">'+ $.i18n.t("No thanks") +'</a></p>'
			+'	</div>'
			+'</div>'
		,
		
		addRSSDialog:
			'<div id="addRSSDialog" class="memolaneDialog">'
			+'	<div class="dialogTopBar">'
			+'		<div class="dialogTitle">'+ $.i18n.t("Add an RSS or Atom feed", "this is the title of the dialog for adding an RSS feed to your Memolane account") +'</div>'
			+'		<div class="close closeMemolaneDialog removeService">'+ $.i18n.t("cancel", "the cancel button to close the dialog window") +'</div>'
			+'		<div class="clearFloatNoHeight"></div>'
			+'	</div>'
			+'	<div class="dialogContent">'
			+'		<p>'+ $.i18n.t("Right click an RSS or Atom subscribe link on your favorite site, copy the link address, and then paste it in the text field below.") +'</p>'
			+'		<input type="text" id="rssFeedURL" style="width:410px" />'
			+'		<p><a href="#" class="btn-green float-left addFeedBtn">'+ $.i18n.t("Add Feeds", "this is the link text for adding an RSS feed to your Memolane account") +'</a></p>'
			+'	</div>'
			+'</div>'
		,
		
		selectPageDialog:
			'<div id="selectPageDialog" class="memolaneDialog">'
			+'	<div class="dialogTopBar">'
			+'		<div class="dialogTitle">'+ $.i18n.t("Select page", "this is the title of the dialog, which prompts the user to pick one of multiple pages associated with the given account") +'</div>'
			+'		<div class="close closeMemolaneDialog removeService">'+ $.i18n.t("cancel adding service", "the link text to close the dialog window and cancel the process of adding the service") +'</div>'
			+'		<div class="clearFloatNoHeight"></div>'
			+'	</div>'
			+'	<div class="dialogContent">'
			+'		<h2 class="header typeJ">'+ $.i18n.t("Which page do you want?") +'</h2>'
			+'		<p>'+ $.i18n.t("In order to add ${service_name}, you need to specify the page you would like to add.  Please select from the following:</p>")
			+'		<p><table>'
			+'			{{each error.pages}}<tr><td><input type="radio" class="selectedPage" name="page" value="${page_id}" /></td><td><img src="${pic}" /></td><td>${name}</td></tr>{{/each}}'
			+'		</table></p>'
			+'		<p><a href="#" class="btn-green float-left close selectPageBtn">'+ $.i18n.t("Submit") +'</a></p>'
			+'	</div>'
			+'</div>'
		,
		
		// used by INITIAL set privacy AND set privacy
		setPrivacyDialog:
			'<div id="privacyDialog" class="memolaneDialog">'
			+'	<div class="dialogTopBar">'
			+'		<div class="dialogTitle">'+ $.i18n.t("Set Privacy") +'</div>'
			+'		{{if error}}'
			+'			<div class="close closeMemolaneDialog removeService">'+ $.i18n.t("cancel adding service", "the link text to close the dialog window and cancel the process of adding the service") +'</div>'
			+'		{{else}}'
			+'			<div class="close closeMemolaneDialog">'+ $.i18n.t("cancel", "the cancel button to close the dialog window") +'</div>'
			+'		{{/if}}'
			+'		<div class="clearFloatNoHeight"></div>'
			+'	</div>'
			+'	<div class="dialogContent">'
			+'		<h2 class="${service}">${username} <br /><span>${service_name}</span></h2>'
			+'		<a href="#" class="close" id="setPrivacyDone" style="display:none;">'+ $.i18n.t("Close", "the text link to close the dialog window") +'</a>'
			+'		<p>'+ $.i18n.t("The privacy setting that you select on Memolane for ${service_name} will be applied to all your content from ${service_name} uniformly.") +'</p>'
			+'		<p>'+ $.i18n.t("Please choose a setting to continue:") +'</p>'
			+'		<ul class="privacyTabs smallButtonBar">'
			+'			<li><a href="#" id="public">'+ $.i18n.t("Public", "this is the name of the privacy setting that allows a user to set all memos for a given service to public") +'</a></li>'
			+'			<li><a href="#" id="friends">'+ $.i18n.t("Friends Only", "this is the name of the privacy setting that allows a user to set all memos for a given service to only friends") +'</a></li>'
			+'			<li><a href="#" id="private">'+ $.i18n.t("Private", "this is the name of the privacy setting that allows a user to set all memos for a given service to private") +'</a></li>'
			+'			{{if m.services.importableServices[service]}}<li><a href="#" id="inherit">'+ $.i18n.t("Import Privacy", "this is the name of the privacy setting that allows a user to set all memos for a given service to map to the privacy of the originating service") +'</a></li>{{/if}}'
			+'		</ul>'
			+'		<div class="privacyTabDescription">'
			+'			<div id="publicTabDescription"><h3>'+ $.i18n.t("Public", "this is the name of the privacy setting that allows a user to set all memos for a given service to public") +'</h3><p>'+ $.i18n.t("All your ${service_name} memos will be visible to everyone who views your lanes, and it can be pulled into lanes created by your Memolane friends. We will notify you by email whenever any of your content gets used on a lane created by one of your Memolane friends so you can remove it if you choose.") +'</p></div>'
			+'			<div id="friendsTabDescription"><h3>'+ $.i18n.t("Friends Only", "this is the name of the privacy setting that allows a user to set all memos for a given service to only friends") +'</h3><p>'+ $.i18n.t("Memos from ${service_name} will only be visible to you and your Memolane friends on all lanes where they appear. We will notify you by email whenever any of your memos are contributed to a lane created by one of your Memolane friends so you can remove it if you choose.") +'</p></div>'
			+'			<div id="privateTabDescription"><h3>'+ $.i18n.t("Private", "this is the name of the privacy setting that allows a user to set all memos for a given service to private") +'</h3><p>'+ $.i18n.t("Memos from ${service_name} will only be visible to you on all lanes where they appear.") +'</p></div>'
			+'			{{if m.services.importableServices[service]}}<div id="inheritTabDescription"><h3>'+ $.i18n.t("Import Privacy Settings", "this is the name of the privacy setting that allows a user to set all memos for a given service to map to the privacy of the originating service") +'</h3><p>{{tmpl m.services.templates.importPrivacyMappingsTable}}</p></div>{{/if}}'
			+'		</div>'
			+'	</div>'
			+'</div>'
		,
		
		fetchNewDialog:
			'<div id="" class="memolaneDialog">'
			+'	<div class="dialogTopBar">'
			+'		<div class="dialogTitle">'+ $.i18n.t("Fetch New Content") +'</div>'
			+'		<div class="close closeMemolaneDialog cancelAddingBtn">'+ $.i18n.t("close", "the text link to close the dialog window") +'</div>'
			+'		<div class="clearFloatNoHeight"></div>'
			+'	</div>'
			+'	<div class="dialogContent">'
			+'		<h2 class="header typeJ">'+ $.i18n.t("We\'re on it!") +'</h2>'
			+'		<p>'+ $.i18n.t("The process of refreshing Memolane with the your most recent ${service_name} memos has begun.") +'</p>'
			+'		<p><strong>'+ $.i18n.t("It\'s not instant.") +'</strong></p>'
			+'		<p>'+ $.i18n.t("It may take us a few minutes to get the update and apply it to your lane(s), but good things come to those who wait.") +'</p>'
			+'		<p><a href="#" class="btn-green float-left close">'+ $.i18n.t("OK") +'</a></p>'
			+'	</div>'
			+'</div>'
		,
		
		refetchAllDialog:
			'<div id="" class="memolaneDialog">'
			+'	<div class="dialogTopBar">'
			+'		<div class="dialogTitle">'+ $.i18n.t("Re-fetch All Content") +'</div>'
			+'		<div class="close closeMemolaneDialog cancelAddingBtn">'+ $.i18n.t("cancel", "the cancel button to close the dialog window") +'</div>'
			+'		<div class="clearFloatNoHeight"></div>'
			+'	</div>'
			+'	<div class="dialogContent">'
			+'		<p><strong>'+ $.i18n.t("Are you sure that you wish to re-fetch all of your ${service_name} memos?") +'</strong></p>'
			+'		<p>'+ $.i18n.t("Re-fetching will gather any changes you have made to previously published content on ${service_name}, but it will also overwrite any custom privacy settings you have made for individual memos on Memolane.") +'</p>'
			+'		<p><a href="#" class="btn-green float-left refetchConfirm close">'+ $.i18n.t("Yes, renew all memos") +'</a> <a href="#" class="secondaryAction float-left close">'+ $.i18n.t("No, I don\'t want that") +'</a></p>'
			+'	</div>'
			+'</div>'
		,
		
		removeServiceDialog:
			'<div id="" class="memolaneDialog">'
			+'	<div class="dialogTopBar">'
			+'		<div class="dialogTitle">'+ $.i18n.t("Remove Service?") +'</div>'
			+'		<div class="close closeMemolaneDialog cancelAddingBtn">'+ $.i18n.t("cancel", "the cancel button to close the dialog window") +'</div>'
			+'		<div class="clearFloatNoHeight"></div>'
			+'	</div>'
			+'	<div class="dialogContent">'
			+'		<p><strong>'+ $.i18n.t("Are you sure you wish to remove your ${service_name} account from Memolane?") +'</strong></p>'
			+'		<p>'+ $.i18n.t("All of your ${service_name} memos will be permanently removed from any lanes where they appear. This action cannot be undone.") +'</p>'
			+'		<p><a href="#" class="btn-red float-left removeConfirm close">'+ $.i18n.t("Yes, REMOVE the service") +'</a> <a href="#" class="secondaryAction float-left close">'+ $.i18n.t("No, I don\'t want that") +'</a></p>'
			+'	</div>'
			+'</div>'
		,
		
		importPrivacyMappingsTable:
			'<table cellpadding="0" cellspacing="0"><tr><th>'+ $.i18n.t("${service_name} Privacy", "this is a title that labels the following table as the mappings of Memolane privacy to the given service privacy, where service_name is a service, like Facebook or Twitter") +'</th><th>&nbsp;</th><th>'+ $.i18n.t("Memolane Privacy") +'</th></tr>'
			+'	{{if m.services.importableServices[service].mappings.mlPublic.length}}'
			+'		<tr><td>{{html m.services.importableServices[service].mappings.mlPublic.join("<br />")}}</td><td><span>&rarr;</span></td><td>'+ $.i18n.t("Public", "this is the name of the privacy setting that allows a user to set all memos for a given service to public") +'</td></tr>'
			+'	{{/if}}'
			+'	{{if m.services.importableServices[service].mappings.mlFriends.length}}'
			+'		<tr><td>{{html m.services.importableServices[service].mappings.mlFriends.join("<br />")}}</td><td><span>&rarr;</span></td><td>'+ $.i18n.t("Friends Only", "this is the name of the privacy setting that allows a user to set all memos for a given service to only friends") +'</td></tr>'
			+'	{{/if}}'
			+'	{{if m.services.importableServices[service].mappings.mlPrivate.length}}'
			+'		<tr><td>{{html m.services.importableServices[service].mappings.mlPrivate.join("<br />")}}</td><td><span>&rarr;</span></td><td>'+ $.i18n.t("Private", "this is the name of the privacy setting that allows a user to set all memos for a given service to private") +'</td></tr>'
			+'	{{/if}}'
			+'</table>'
	}
	
};}(this,jQuery,this.undefined);

m.services.initialize();