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


m.topBarDropDowns = function(win,$,undefined){ return {
 
  	$tbDropDowns :$('.tb-dropdown'),
  	$dropDowns :$('.dd-container'),
  	$dropDownsListContent :$('.dd-list-content'),
  	jScrollGutter:5,
  	loaderClass:"small-loader-on-grey",
  	ddListHeight:350,
  	ddWaitHeight:100,
  	friendsContext:"main",
  	friendRequests:0,
  	hashOnPageLoad : window.location.hash.substring(1).toLowerCase(),
  	
  	
    /*  initialize module  */
    initialize: function(){
      	
      	var that = this;
  		//when a button in the topbar that has a dropdown is clicked initiate dropdown	
  		this.$tbDropDowns.bind(m.clickOrTouchStart,$.proxy(this.initDD,this));
  		
      	this.$dropDownsListContent.jScrollPane({verticalGutter:that.jScrollGutter});
      
  		//close drop if you click off the dropdown
  		$(document).bind(m.clickOrTouchStart,$.proxy(this.closeAllDropdownsFromClickOff,this));
  		
  		// actionables from dropdown items
  		this.$dropDownsListContent
			.delegate('.dd-friends-remove', m.clickOrTouchStart, function(e){ 
				that.removeFriendDialog($(this)); 
				return false;
	      		})
	      		
			.delegate(".dd-friends-pending-remove", m.clickOrTouchStart, function(e){ 
				that.removeFriendPendingRequest(e, $(this)); 
				return false;
			  	})
			
			.delegate(".dd-friends-friend-yes", m.clickOrTouchStart, function(e){ 
				that.acceptFriendRequest(e, $(this)); 
				return false;
			  	})
			  	
			.delegate(".dd-friends-friend-no", m.clickOrTouchStart, function(e){ 
				that.rejectFriendRequest(e, $(this)); 
				return false;
			  	})
			  	
			.delegate('.dd-lanes-remove', m.clickOrTouchStart, function(e){ 
				that.removeLaneDialog($(this)); 
				return false;
	    		})
	    		
	    	.delegate('.dd-lanes-fav-remove', m.clickOrTouchStart, function(e){ 
				that.removeLaneFav($(this)); 
				return false;
	    		})
	    
	    	.delegate('.dd-lanes-edit', m.clickOrTouchStart, function(e){ 
				that.editLane($(this));
	    		})
	    	
	    	.delegate('.dd-lanes-remove-contrib', m.clickOrTouchStart, function(e){ 
				that.removeLaneContributorDialog($(this)); 
				return false;
	    		});
	    		
	    	
	    	$('.dd-friends-types').delegate('a', m.clickOrTouchStart, function(e){
	    		
				that.toggleFriendsTypes(e);
				return false;
				});
			

	    // number of unread news
	    this.getNewNewsNumber();
	    
	    // number of incoming friends requests
	    this.getIncomingFriendsRequestsNumber();

		
	   	if (this.hashOnPageLoad) {
	   		
	   		var hashAction = m.utilities.urlHash.get("topBar");
	   		if (hashAction) {
	   		
	   		setTimeout(function(){
	    	
		    	switch(hashAction) {
		    		case "getFriends": 
		    			$("#dd-friends-button").trigger("click");
		    		break;	
		    		
		    		case "getNews": 
		    			$("#dd-news-button").trigger("click");
		    		break;	
		    		
		    		case "getLanes": 
		    			$("#dd-lanes-button").trigger("click");
		    		break;	
		    	} 
	    	}
	    	
	    	,1500);
	    	
	    	}// eof if there's a hash action for topBar
	    }
 
  		//FOR beyond h-bird 0.1
  		//code for tab system in lanes to change tabs
  		$('#dd-lanes .smallButtonBar li a').bind(m.clickOrTouchStart,function(){
  			var $this = $(this);
  			if($this.hasClass('smallButtonActive')){return false};
  			var idAttr = $(this).parent().attr('id');
  			$this.closest('ul')
  				.find('a')
  				.removeClass('smallButtonActive')
  				.end()
  				.end()
  				.addClass('smallButtonActive');
  			$('#dd-fav-lanes,#dd-your-lanes').hide();
  			
  			$('#'+idAttr.slice(0,idAttr.indexOf('-btn')))
  				.addClass("visibility-hidden")
  				.show()
  				.height(100);
  			
  			var ul_height = $('#'+idAttr.slice(0,idAttr.indexOf('-btn'))+' ul').height();
				ul_height = (ul_height > 400) ? 400 : ul_height;
  			
  			$('#'+idAttr.slice(0,idAttr.indexOf('-btn')))
  				.show()
  				.css("height",(ul_height)+"px").removeClass(that.loaderClass)
				.jScrollPane({verticalGutter:that.jScrollGutter})
				.removeClass("visibility-hidden")
				.find(".jspVerticalBar").removeClass("visibility-hidden");
  				
  			return false;
  		});
  		
  		
  	}, // eof initialize



    // used for all dropdowns, on "click"
  	initDD:function(e){
  	
  		var $this = $(e.currentTarget),
  	    	button = $this.attr('data-ddid'),
  			$dropdown = $('#' + button),
  			$ddContainer = $('.dd-container');

		//if the dropdown you are clicking on is open close and return
		if($dropdown.css('visibility') === 'visible'){
				// CLOSE IT
				this.closeDropdown($this,$dropdown); return false;
			} else {
				// OPEN IT
				switch(button){
					case ("dd-friends"): this.getFriends(); break;
					case ("dd-lanes"): this.getLanes(); break;
					case ("dd-news"): this.getNews(); break;
				}
			
			// if other dropdowns are open, close them
			if($ddContainer.filter(function(){return $(this).css('visibility') == 'visible';}).length){
				this.closeAllDropdowns();
			}
			// postion and open clicked dropdown
			this.positionDropdown($this,$dropdown);
		}

  	},


	  
	///////////// NEWS STUFF ///////////////
	////////////////////////////////////////
	
	//  psql to refresh "newness" on all events, or after date below
	//  update users set last_read_feed='2000-01-01 10:00:00' where username='USERNAME';
	////////////////////////////////////////
	
	getNews : function(){
	
		var that = this,
			$dropDown = $('#dd-news'),
			ul_height = 0;
		      
		$dropDown.find(".dd-list-content")
			.addClass(that.loaderClass)
			.css("height", that.ddWaitHeight).find("ul").empty().end()
			.find(".jspVerticalBar").addClass("visibility-hidden");
		  
			that.getNewNewsNumber();
		
			$.ajax({ 	
		    url: "/feed",
		    cache: false,
		    success: function (data) {           
		      
		    	// there should at least be the welcome and shout messages!
		
				var i=0, 
					len = data.feed.length,
					newsObj = {}, 
					li = '',
					listItems = '',
					dateStr = '',
					tmpl = '';
	
				while (i < len) {
					newsObj = data.feed[i];
					//console.log(newsObj);				
					// get date string like "4 hrs ago", "yesterday", etc
					newsObj.date_str = m.utilities.dateFormatRelative(newsObj.created_at);
					
					tmpl = that.templates.news[newsObj.type];
					
					// get html string
					li = $("<div />").append($.tmpl(tmpl, newsObj)).html();
					
					listItems = li + listItems;
					
					i++;								
				} // end while
				
				if(len === 0){
					listItems = '<li class="no-dd-list-item">'+$.i18n.t('No news yet')+'</li>'
				}
							
				$dropDown.find(".dd-list-content ul").html(listItems);
				
				var ul_height = $dropDown.find(".dd-list-content ul").height();
				ul_height = (ul_height > that.ddListHeight) ? that.ddListHeight : ul_height;
				  	    
				$dropDown
					.find(".dd-list-content").removeClass(that.loaderClass).css("height",(ul_height)+"px")
					.jScrollPane({verticalGutter:that.jScrollGutter})
					.find(".jspVerticalBar").removeClass("visibility-hidden");
		
		    } // eof success
		});    
	},
	
	
	getNewNewsNumber:function(){
		var n = 4;
		$.ajax({ 	
			url: "/feed/volume",
			success: function (data) { 
				n = parseInt(data.volume);
				if (n > 0 ) {
					$("#tb-news-count").css("display", "inline").children("span").text(n);
				} else {
					$("#tb-news-count").css("display", "none");
				}			
			} // eof success
		});
	},
	
	
	hideNewNewsIndicator:function() {
		var $numb = $("#tb-news-count");
		if ($numb.css("display") != "none") {
			$numb.fadeOut();
		}
	},
  
  
	


	 ////// FRIENDS //////////
	/////////////////////////


	// status types: requests (incoming)
	//               current
	//               pending (outgoing)
	getFriends: function () {
				
		var that = this,
			$dropDown = $('#dd-friends'),
			$mainPane = $('.dd-friends-main-pane'),
			$pendingPane = $('.dd-friends-pending-pane');
		
		$(".dd-friends-types .smallButtonBar a").removeClass('smallButtonActive');
		$("#dd-friends-main").addClass('smallButtonActive');
		
		// show pending pane until we get height
		$pendingPane.show().find("ul").empty()
		$mainPane.show();

		$mainPane
			.css("height", that.ddWaitHeight).addClass(that.loaderClass)
			.find("ul").empty().end()
			.find(".jspVerticalBar").addClass("visibility-hidden");
  
		$.ajax({ 	
			url: "/friends/all",
			cache: false,
			success: function (data) {
			
				//alpha order by last name
				var data = _.sortBy(
					data,function(prop){return prop.other_first_name ? prop.other_first_name.toLowerCase():null
				});
				
				var i=0, 
					frobj = {}, 
					li = '',
					tmpl = {},
					listItemsMain = '',
					listItemsPending = '',
					status = '',
					len = data.length,
					main_ht = 0,
					pend_ht = 0,
					friendsNumbers = {'pending':0, 'requested':0, 'accepted':0};
					content = {'pending':'', 'accepted':'', 'requested':''};
	
				while (i < len) {
				
					frobj = data[i];
					
					status = frobj.status;
					friendsNumbers[status]++;
					
					tmpl = that.templates.friends[status];
					
					// get html string
					li = $("<div />").append($.tmpl(tmpl, frobj)).html();
										
					content[status] += li;
			
					i++;
													
				} // end while
				
				// if any INCOMING requests are here, put them at top of list
				if (friendsNumbers.requested || friendsNumbers.accepted) { 
					
					listItemsMain += content.requested;
				
					listItemsMain += content.accepted;
					 
				} else {
					listItemsMain = '<li class="no-dd-list-item">'+$.i18n.t('You got peeps, everyone does. Why not make a friend. You can use search to find Memolane users to befriend. Or visit a user\'s dashboard and request some good old-fashioned friendship.')+'</li>';
				}  
				
				// PENDING (OUTGOING) WILL BE IN SEPARATE TAB
				if (friendsNumbers.pending){
					listItemsPending = content.pending;
				} else {
					listItemsPending = '<li class="no-dd-list-item">'+$.i18n.t('At this time you haven\'t requested any friendships. Don\'t be shy, Memolane is best enjoyed with friends.')+'</li>';
				}
				
				
				// MAIN PANE
				$mainPane.find("ul").html(listItemsMain);
				main_ht = $mainPane.find("ul").height();
				main_ht = (main_ht > that.ddListHeight) ? that.ddListHeight : main_ht;
				$mainPane
					.css("height",(main_ht)+"px")
					.removeClass(that.loaderClass)
					.jScrollPane({verticalGutter:that.jScrollGutter})
					.find(".jspVerticalBar").removeClass("visibility-hidden");
				
				
				// PENDING PANE ("Friend Requests Sent")
				// add content to pending pane
				$pendingPane.find("ul").html(listItemsPending);
				pend_ht = $pendingPane.find("ul").height();
				pend_ht = (pend_ht > that.ddListHeight) ? that.ddListHeight : pend_ht;
				// hide this pane _after_ we get height
				$pendingPane
					.hide()
					.css("height",(pend_ht)+"px")
					.removeClass(that.loaderClass)
					.jScrollPane({verticalGutter:that.jScrollGutter})
					.find(".jspVerticalBar").removeClass("visibility-hidden");
					
				that.setNewFriendsIndicator(friendsNumbers["requested"]);
			
			} // eof success
			
		    
		});         
	},
	
	
	getIncomingFriendsRequestsNumber:function(){
		var that=this;
		$.ajax({ 	
			url: "/friends/requested",
			cache: false,
			success: function (data) { 
				that.setNewFriendsIndicator(data.length);
			} // eof success
		});
	},
		
	
	setNewFriendsIndicator : function(n){
		this.friendRequests = n;
		if (n > 0 ) {
			$("#tb-friends-count").css("display", "inline").children("span").text(n);
		} else {
			$("#tb-friends-count").css("display", "none");
		}			
	},
	
	
	toggleFriendsTypes:function(e) {
		var $button = $(e.target),
			// which of 3 buttons (memos|lanes|users) was pressed?
			context = ($button.attr("id")).replace("dd-", "");
		
		this.friendsContext = context;

		$("#dd-friends .dd-list-content").hide();
		$(".dd-" + context + "-pane").show();
	
		$(".dd-friends-types .smallButtonBar a").removeClass('smallButtonActive');
		$button.addClass('smallButtonActive');

		if(".dd-" + context + "-pane" === '.dd-friends-pending-pane'){
			$('.dd-friends-pending-pane').data('jsp').reinitialise();
		}
		
		e.preventDefault();
		
	},
	
	  
	/// REMOVE FRIEND I (prompt)
	// used to prompt a dialog for service removal - calls removeService()
	removeFriendDialog:function($a){
		
		var that = this;
		var friend = {	"first_name":$a.attr("data-first_name"),
		          		"last_name":$a.attr("data-last_name"),
		          		"full_name":$a.attr("data-full_name"),
		          		"username":$a.attr("data-username")};
		          
		var $dialog = $.tmpl(m.globalTemplates.dialogs.removeFriend, friend);
		
		// user clicks to affirm removal
		$dialog.find('.removeConfirm').bind(m.clickOrTouchEnd, {'something':'other'}, function(e){
			
			if (m.dashboard) {
				m.dashboard.removeFriend(friend.username);
			} else {
				that.removeFriend(friend.username);
			}
			e.preventDefault();
		});
			
		$dialog.lightbox_me({
			centered: true
		});
	},
	
	
	/// REMOVE FRIEND II
	//  AFTER DIALOG CONFIRM
	removeFriend:function(username) {
	  	var that = this;
	
		$.ajax({ 	
		    type: 'delete',
		    url: '/friends/' + username,
		    success: function (data) { 
				// refresh the menu
				that.getFriends();
		    } 
		});
		
		
	
	},
	
  
 	// reject INCOMING request
 	// requires no modal confirmation
	rejectFriendRequest:function(e, $a) {

		var that = this,
			friend = {	"first_name":$a.attr("data-first_name"),
		          		"last_name":$a.attr("data-last_name"),
		          		"full_name":$a.attr("data-full_name"),
		          		"username":$a.attr("data-username")};
		          				
		$dialog = $.tmpl(m.globalTemplates.dialogs.rejectFriendRequest, friend);
	    $dialog.lightbox_me({
			centered: true
		});
		
		if (m.dashboard) {
			m.dashboard.removeFriend(friend.username);
		} else {
			that.removeFriend(friend.username);			
		}
		
		that.getFriends();		

		that.setNewFriendsIndicator(that.friendRequests -1);
		
	},
	
	
	// requires no modal confirmation
	acceptFriendRequest:function(e, $a) {
    	
		var that = this,	
			fr = {	username: $a.attr("data-username"),
	          		first_name: $a.attr("data-first_name"),
	          		last_name: $a.attr("data-last_name"),
	          		full_name: $a.attr("data-full_name")};
	          				
		if (m.dashboard){
			m.dashboard.acceptFriend(fr.username);
			
		} else {
			
			$.ajax({ 	
				type: 'post',
				cache: false,
				url: '/friends/'+ fr.username +'/accept',
				success: function (data) { 
								
					$dialog = $.tmpl(m.globalTemplates.dialogs.acceptFriendRequest, fr);
			
					$dialog.lightbox_me({
						centered: true
					});
					
			    } // eof success
			});
		}
		that.getFriends();
		that.setNewFriendsIndicator(that.friendRequests -1);

	},
	

	// remove OUTGOING friend request
	removeFriendPendingRequest:function(e, $e){
		var that = this,
			username = $e.data('username');
		
		if (m.dashboard) {
			m.dashboard.removeFriend(username);
		} else {
			that.removeFriend(username);
		}
		that.getFriends();
	},


	
	///////// END FRIENDS STUFF 
	//////////////////////////////////
	 
	 
	 
	 
	
	  
	//////// LANES STUFF
	//////////////////////////////////
	
	getLanes : function () {	
		var that = this,
			$dropDown = $('#dd-lanes'),
			$ddYourLanes = $('#dd-your-lanes'),
			$ddul;
			
		$("#dd-your-lanes-btn a").addClass('smallButtonActive');
		$("#dd-fav-lanes-btn a").removeClass('smallButtonActive');
		$('#dd-fav-lanes').hide().find('ul').empty();
		$ddYourLanes
			.show()
			.css("height", that.ddWaitHeight)
			.addClass(that.loaderClass)
			.find('ul')
			.empty()
			.end()
			.find(".jspVerticalBar")
			.addClass("visibility-hidden");
		
		$.ajax({ 	
			url: '/'+ m.currentUser.username + "/lanes",
			cache: false,
			success: function (data) { 		
		
				if(data.length){
					$.tmpl(that.templates.lanes.main, _.sortBy(data,function(prop){return prop.title ? prop.title.toLowerCase():null}))
					.appendTo($dropDown.find("#dd-your-lanes ul"));
				}else{
					$('<li class="no-dd-list-item">'+$.i18n.t('Start creating a lane by clicking on the \"New Lane\" button above.')+'</li>').appendTo($dropDown.find("#dd-your-lanes ul"));
				}	
				
				var ul_height = $ddYourLanes.find("ul").height();
				ul_height = (ul_height > 400) ? 400 : ul_height;
				
				$dropDown
					.find("#dd-your-lanes")
					.css("height",(ul_height)+"px").removeClass(that.loaderClass)
					.jScrollPane({verticalGutter:that.jScrollGutter})
					.find(".jspVerticalBar").removeClass("visibility-hidden");
			} 
		});
		
		$.ajax({ 	
			url: '/'+ m.currentUser.username + "/favorite_lanes",
			cache: false,
			data: {
				"username": m.currentUser.username
			},
			success: function (data) { 
				
				if(data.length){									
					$.tmpl(that.templates.lanes.fav, _.sortBy(data,function(prop){return prop.title ? prop.title.toLowerCase():null}))
					.appendTo($dropDown.find("#dd-fav-lanes ul"));
				}else{
					$('<li class="no-dd-list-item">'+$.i18n.t('Add lanes to this list by going to a lane and clicking \"Follow lane\"')+'</li>').appendTo($dropDown.find("#dd-fav-lanes ul"));
				}	

			} 
		});	
		
	},	
	
	removeLaneDialog:function($a) {  
		var that = this,
			title = $a.attr("data-lane_title"),
			id =  $a.attr("data-lane_id"),
			lane = {"title": title},
			template = m.globalTemplates.dialogs.removeLane,
			$dialog = $.tmpl(template, lane);
		
		// user clicks to confirm removal
		$dialog.find('.removeConfirm').bind(m.clickOrTouchEnd, function(e){
			
			$a.closest('li').remove();
			
			var ul_height = $('#dd-your-lanes').find("ul").height();
				ul_height = (ul_height > 400) ? 400 : ul_height;
			
			$('#dd-your-lanes')
				.css("height",(ul_height)+"px").removeClass(that.loaderClass)
				.jScrollPane({verticalGutter:that.jScrollGutter});		
			
			if (m.dashUser) {
				m.dashboard.removeLane(id);
			} else {
				// are we on the lane being removed??
				that.removeLane(id);
			}
			
			e.preventDefault();
		});
		

		$dialog.lightbox_me({
			centered: true
		});
	},
	
	removeLaneFav:function($a){
	
			var id =  $a.attr("data-lane_id");
			$a.closest('li').remove();
			
			var ul_height = $('#dd-fav-lanes').find("ul").height();
				ul_height = (ul_height > 400) ? 400 : ul_height;
			
			$('#dd-fav-lanes')
				.css("height",(ul_height)+"px").removeClass(this.loaderClass)
				.jScrollPane({verticalGutter:this.jScrollGutter});
					
			if (m.dashUser) {
				$('.dashFaves #'+id).find('.remove-fav').trigger(m.clickOrTouchEnd);
			} else {	
				if(m.currentLane && m.currentLane.id === id){
					$('#follow-unfollow').trigger(m.clickOrTouchEnd);
				}else{
					$.ajax({url: '/lanes/favorite',type : 'DELETE',data: {lane_id:id}});
				}	
			}
	},
	
	removeLaneContributorDialog:function($a) {  
		var that = this,
			title = $a.attr("data-lane_title"),
			id =  $a.attr("data-lane_id"),
			owner =  $a.attr("data-owner"),
			template = "",
			lane = {"lane_title":title},
			template = m.globalTemplates.dialogs.removeLaneContributor,
			$dialog = $.tmpl(template, lane);
		
		// user clicks to confirm removal
		$dialog.find('.removeConfirm').bind(m.clickOrTouchEnd, function(e){
		
			if (m.dashboard) {
				m.dashboard.removeLaneContributor(id);
			} else {
				that.removeLaneContributor(id, owner);
			}
			e.preventDefault();
		});

		$dialog.lightbox_me({
			centered: true
		});
	},
	
	
	editLane:function($e){
		var id = $e.data("id");
		if (m.currentLane && (m.currentLane.id == id)){
			window.location = ("/" + m.currentUser.username + "/" + m.currentLane.title + "?e=1#drawer=edit");
			return false;	
		}	
		// otherwise we're using the basic link for the lane with #edit
	},	
	
	
	
	removeLane:function( id ){
		var that = this;
		$.ajax({
			type: 'delete',
			url: '/lanes/'+ id,
			success: function() {
				if (m.currentLane && (m.currentLane.id == id)){
					window.location = ("/" + m.currentUser.username);
					return false;	
				} else {		
					that.getLanes();
				}
			}
		});
	},
	
	
	
	removeLaneContributor:function(id, owner){
		var that = this,
			username = m.currentUser.username;

		$.ajax({
			type: 'delete',
			url: '/lanes/contributor',
			data: {
				"lane_id": id,
				"username": username
			},
			success: function() {
			
				if (m.currentLane && (m.currentLane.id == id)){
					window.location = ("/" + owner + "/" + m.currentLane.title);
					return false;	
				} else {		
					that.getLanes();
				}
				
			}
		});
	},
	
	
	
	
	
	
	
	 ////////// GENERAL STUFF //////////////
	////////////////////////////////////////

	openDropdown:function(button,dropdown){	
		button.addClass('tb-dropdown-open');
		if (m.search) { m.search.closeSearchDD() };
		dropdown.css('visibility','visible');
	},
	
	closeDropdown:function(button,dropdown){
		if (button.data("ddid") == "dd-news") {
			this.hideNewNewsIndicator();
		}
		button.removeClass('tb-dropdown-open');
		dropdown.css('visibility','hidden');
	},
	
	closeAllDropdownsFromClickOff:function(e){
		if($(e.target).closest('.dd-container,.tb-dropdown, .memolaneDialog').length){
			return;
		}
		this.closeAllDropdowns();
	},
	
	closeAllDropdowns:function(e){
		$('.dd-container').css('visibility','hidden');
		this.$tbDropDowns.removeClass('tb-dropdown-open');
	},
	
	
	positionDropdown:function(button,dropdown){
		//if this is called from layout.js grab what we need
		var button = button || $('.tb-dropdown-open');
		var dropdown = dropdown || $('.dd-container').filter(function(){return $(this).css('visibility') == 'visible';});
		var btnLeft = button.offset().left;
		var btnTop = button.offset().top + 45;
		var widthOfViewport = $(window).width();

		if(btnLeft+dropdown.width() > widthOfViewport){
			btnLeft = btnLeft - (btnLeft+dropdown.width() - widthOfViewport);
		}

		dropdown.css({'top':btnTop+'px','left':btnLeft+'px'});
		
		if(dropdown.css('visibility') === 'hidden'){
			this.openDropdown(button,dropdown);
		}
		return false;
		
	},	



	templates : {
		
	// NEWS TEMPLATES
		news : {
      
			// phased out, but keep until hummingbird 0.2 
			// in case there's a lingering news item with this type
			friendship_request: '',

			welcome_shout:
				'<li class="clearfix {{if is_new==true}}new-news{{/if}}">'
				+'	<div class="dd-news-item">'
				+'		<img src="/img/dropdowns/news-welcome.png">'
				+		$.i18n.t('Welcome to Memolane. Start sharing the timeline of your social life today by spreading the word to your friends on', "followed by \"Twitter and Facebook\"")
				+'		<a class="shareURL" href="#" data-share-link="/'+(m.currentUser ? m.currentUser.username : "")+'" data-share-text="'+$.i18n.t('Check out my new Memolane profile')+'" data-share-dialog-text="'+$.i18n.t('Share profile on')+'"><span class="icon"></span>'+$.i18n.t('Twitter and Facebook')+'</a>.'
				+'	</div>'
				+'	<div class="dd-news-item-date">${date_str}</div>'
				+'</li>',
        
			welcome_invite:
				'<li class="clearfix {{if is_new==true}}new-news{{/if}}">'
				+'	<div class="dd-news-item">'
				+'		<img src="/img/dropdowns/news-tell-friends.png">'
				+		$.i18n.t('Tell a friend about Memolane!')
				+'	</div>'
				+'	<div class="dd-news-item-date">${date_str}</div>'
				+'</li>',
        
			new_user_invited_by: 
				'<li class="clearfix {{if is_new==true}}new-news{{/if}}">'
				+'	<div class="dd-news-item">'
				+'		<a href="/${content.other.username}"><img src="/${content.other.username}/image"></a>'
				+ 		$.i18n.t('<a href=\"**SEND_INVITOR_FRIEND_REQUEST**\">Click here</a> to send them a friend request', "note: do NOT alter the \"SEND_INVITOR_FRIEND_REQUEST\" text")
				+'	</div>'
				+'	<div class="dd-news-item-date">${date_str}</div>'
				+'</li>',
        
			friendship:
				'<li class="clearfix {{if is_new==true}}new-news{{/if}}">'
				+'	<div class="dd-news-item">'
				+		$.i18n.t('<a href=\"/${content.friend.username}\">${content.friend.full_name}</a> and <a href=\"/${content.other.username}\">${content.other.full_name}</a> are now friends')
				+'	</div>'
				+'	<div class="dd-news-item-date">${date_str}</div>'
				+'</li>',
       
			friendship_request_accepted:
				'<li class="clearfix {{if is_new==true}}new-news{{/if}}">'
				+'	<div class="dd-news-item">'
				+'		<a href="/${content.friend.username}"><img src="/${content.friend.username}/image"></a>'
				+		$.i18n.t('<a href=\"/${content.friend.username}\">${content.friend.full_name}</a> is now your friend')
				+'	</div>'
				+'	<div class="dd-news-item-date">${date_str}</div>'
				+'</li>',
    
			lane_new_contributor:
				'<li class="clearfix {{if is_new==true}}new-news{{/if}}">'
				+'	<div class="dd-news-item">'
				+'		<a href="/lanes/${content.lane.id}" title="'+ $.i18n.t('view lane') +'">'
				+'			<img src="/lanes/${content.lane.id}/avatar.small" alt="'+ $.i18n.t('top bar avatar', "this labels the lane avatar") +'"/>'
				+'		</a>'
				+'		<a href="/${content.new_contributor.username}">${content.new_contributor.full_name}</a> '
				+		$.i18n.t('has been added to the lane <span class=\"lane-name-DD\"><a href=\"/lanes/${content.lane.id}\" title=\"view lane\">${content.lane.title}</a></span>', "this phrase is preceded by the contributor\'s first and last name")
				+'	</div>'
				+'<div class="dd-news-item-date">${date_str}</div>'
				+'</li>',

			added_to_lane:
				'<li class="clearfix {{if is_new==true}}new-news{{/if}}">'
				+'	<div class="dd-news-item">'
				+'		<a href="/${content.added_by.username}"><img src="/${content.added_by.username}/image"></a>'
				+'		<a href="/${content.added_by.username}">${content.added_by.full_name}</a> '
				+		$.i18n.t('has added you as a contributor to the lane', "this phrase is preceded by the user\'s first and last name")
				+'		 <a href="/lanes/${content.lane.id}">${content.lane.title}</a></div>'
				+'	<div class="dd-news-item-date">${date_str}</div>'
				+'</li>'
		}, // eof news dropdown templates
        
 
      // LANES TEMPLATES
		lanes : {
			main:
				'<li class="clearfix">'
				+'	<a href="/${owner.username}/${title}" title="'+ $.i18n.t('view lane') +'">'
				+'		<div class="dd-list-item">'
				+'			<img src="/lanes/${id}/avatar.small" alt="'+ $.i18n.t('top bar avatar', "this labels the lane avatar") +'"/>'
				+'			<span class="lane-name-DD">${title}</span>'
					// if a contributor
				+'	{{if role=="contributor"}}'
				+'			<span class="lane-type-DD">('+ $.i18n.t('contributor', "this label indicates that the user is a contributor to the given lane") +')</span>'
				+'		</div>'
				+'		<a href="#" class="dd-lanes-remove-contrib" data-lane_id="${id}" data-owner="${owner.username}" data-lane_title="${title}" title="'+ $.i18n.t('remove my content from this lane') +'">X</a>'
					// or if user is the owner
				+'	{{else}}'
				+'		</div>'
				+'		<a href="#" class="dd-lanes-remove" data-lane_id="${id}" data-lane_title="${title}"  title="'+ $.i18n.t('delete lane') +'">X</a>'
				+'		<a href="/${owner.username}/${title}#drawer=edit" class="dd-lanes-edit" title="'+ $.i18n.t('edit lane') +'" data-id="${id}">X</a>'
				+'	{{/if}}'
				+'	</a></li>',
			fav:
				'<li class="clearfix">'
				+'	<a href="/${owner.username}/${title}" title="'+ $.i18n.t('view lane') +'">'
				+'	<div class="dd-list-item">'
				+'		<img src="/lanes/${id}/avatar.small" alt="'+ $.i18n.t('top bar avatar', "this labels the lane avatar") +'"/>'
				+'		<span class="lane-name-DD">${title}</span>'
				+'		<span class="lane-type-DD">'+ $.i18n.t('by ${owner.full_name}') +' (${owner.username})</span>'
				+'	</div>'
				+'{{if true}}'
				+'	<a href="#" class="dd-lanes-fav-remove" data-lane_id="${id}" data-lane_title="${title}"  title="'+ $.i18n.t('Remove from favorites') +'" >X</a>'
				+'{{/if}}'
				+'</a></li>'
				
		}, // eof lanes dropdown templates
      
      	// FRIENDS TEMPLATES
		friends: {
			accepted:
				'<li class="clearfix">'
				+'	<a href="/${other_username}" title="'+$.i18n.t('view dashboard')+'">'
				+'	<div class="dd-list-item">'
				+'		<img src="/${other_username}/image" alt="'+ $.i18n.t('top bar avatar', "this labels the lane avatar") +'"/>'
				+'		<span class="name-friends-DD">${other_full_name}</span> '
				+'		<span class="user-name-friends-DD">(${other_username})</span></div>'
				+'		<a href="#" class="dd-friends-remove" title="'+$.i18n.t('remove friend')+'" data-username="${other_username}" data-first_name="${other_first_name}"  data-last_name="${other_last_name}" data-full_name="${other_full_name}">X</a>'
				+'	</div>'
				+'</a></li>',
			
			requested:
				'<li class="clearfix friend-request-list">'
				+'	<a href="/${other_username}" title="'+ $.i18n.t('view dashboard') +'">'
				+'		<div class="dd-list-item">'
				+'			<img src="/${other_username}/image" alt="'+ $.i18n.t('top bar avatar', "this labels the lane avatar") +'"/>'
				+'			<span class="name-friends-DD">${other_full_name}</span> '
				+'			<span class="user-name-friends-DD">(${other_username})</span>'
				+'		</div>'
				+'		<a href="#" data-username="${other_username}" data-first_name="${other_first_name}" '
				+'			data-last_name="${other_last_name}" data-full_name="${other_full_name}" class="dd-friends-friend-no" '
				+'			title="'+ $.i18n.t('Ignore Friendship Request') +'">'+ $.i18n.t('Ignore', "this is the short label for denying a friendship request") +'</a>'
				+' 		<a href="#" data-username="${other_username}" data-first_name="${other_first_name}" data-last_name="${other_last_name}" data-full_name="${other_full_name}" class="dd-friends-friend-yes" title="'+$.i18n.t('Confirm Friendship Request')+'">Confirm</a>'
				+'</a></li>',
 			
			pending:
				'<li class="clearfix">'
				+'	<a href="/${other_username}" title="'+ $.i18n.t('view dashboard') +'">'
				+'	<div class="dd-list-item">'
				+'		<img src="/${other_username}/image" alt="'+ $.i18n.t('top bar avatar', "this labels the lane avatar") +'"/>'
				+'		<span class="name-friends-DD">${other_full_name}</span> '
				+'		<span class="user-name-friends-DD">(${other_username})</span></div>'
				+'		<a href="#" data-username="${other_username}" class="dd-friends-pending-remove" title="'+ $.i18n.t('remove friend request') +'" data-username="${other_username}" data-first_name="${other_first_name}" data-last_name="${other_last_name}" data-full_name="${other_full_name}">X</a>'
				+'	</div>'
				+'</a></li>'
		}


	} // eof templates
	
};}(this,jQuery,this.undefined);

if(m.currentUser != null){
	m.topBarDropDowns.initialize();
}