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

m.dashboard = function(win,$,undefined){return{

	/*  static  */
	$body : $('body'),
	$profile : null,
	$lanes : null,
	$friends : null,
	$friendCount : null, // DOM element for friend count
	$favLanes : $('.dashFaves'),
	lanesByID : {},
	favLanesByID : {},
	allFriendsByUN : {}, // store a full list of all friends, by username, for easier reference later
	
	/*  initialize module  */
	initialize:function(){
		this.$profile = this.$body.find('#dashProfile');
		this.$lanes = this.$body.find('.dashLanes:first');
		this.$friends = this.$body.find('#dashFriends');
		this.$friendCount = this.$friends.find('#dashFriendCount');
		
		if (m.dashUser.self){
			this.$body.find('.dashMineOnly').fadeIn();
		}else{
			this.$body.addClass('notMyDashboard');
		}
		
		//aplhabetiz … lists
		m.dashUser.lanes =  _.sortBy(
			m.dashUser.lanes,function(prop){return prop.title ? prop.title.toLowerCase():null}
		);
		m.dashUser.favorite_lanes = _.sortBy(
			m.dashUser.favorite_lanes,function(prop){return prop.title ? prop.title.toLowerCase():null}
		);
		m.dashUser.friends = _.sortBy(
			m.dashUser.friends,function(prop){return prop.first_name ? prop.first_name.toLowerCase():null}
		);
		m.dashUser.friend_requests = _.sortBy(
			m.dashUser.friend_requests,function(prop){return prop.first_name ? prop.first_name.toLowerCase():null}
		);
		m.dashUser.friend_pending = _.sortBy(
			m.dashUser.friends_pending,function(prop){return prop.first_name ? prop.first_name.toLowerCase():null}
		);
		
		// set up a hash of lanes, by ID, for easier lookup later in the code
		for (x in m.dashUser.lanes) this.lanesByID[ m.dashUser.lanes[x]['id'] ] = m.dashUser.lanes[x];
		
		// set up a hash of fav lanes, by ID, for easier lookup later in the code
		for (x in m.dashUser.favorite_lanes) this.favLanesByID[ m.dashUser.favorite_lanes[x]['id'] ] = m.dashUser.favorite_lanes[x];
		
		// set up a hash of all friends, by username, for easier lookup later
		var d = m.dashUser;
		for ( i in d.friends ) this.allFriendsByUN[ d.friends[i]['username'] ] = d.friends[i];
		for ( j in d.friend_requests ) this.allFriendsByUN[ d.friend_requests[j]['username'] ] = d.friend_requests[j];
		for ( k in d.friends_pending ) this.allFriendsByUN[ d.friends_pending[k]['username'] ] = d.friends_pending[k];
		
		this.showMetadata();
		this.showLanes();
		this.showFavLanes();
		this.showFriends();
		
		this.$favLanes.delegate('.remove-fav',m.clickOrTouchEnd,$.proxy(this.removeFavLane,this));
	},	
	
	/*  methods to wire up the main structure  */
	
	showMetadata:function(){
		// show image
		//this.$profile.find('img:first').attr("src", m.dashUser.image_large);
		
		// show name
		this.$profile.find('#dashProfileInfo').find('h2.header span').text(m.dashUser.full_name);
		
		// show friend status/prompt
		if (!m.currentUser) this.$profile.find('#dashIsFriend').html( $.i18n.t('<a href=\"/login\">Log In</a> or <a href=\"/signup\">Sign Up</a> to explore Memolane.') );
		else if (!m.dashUser.self) {
			if (m.dashUser.friend == 'accepted') this.$profile.find('#dashIsFriend').html( $.i18n.t('You are friends!') );
			else if (m.dashUser.friend == 'pending') this.$profile.find('#dashIsFriend').html( $.i18n.t('Friend request pending.') );
			else if (m.dashUser.friend == 'requested') {
				var that = this;
				
				var friendBtn = this.$profile.find('#dashIsFriend');
				friendBtn.html( $.i18n.t(m.dashUser.first_name +' requested your friendship: <a href="#" class="confirmFriend">approve</a> or <a href="#" class="rejectFriend">deny</a>.') );
				friendBtn.find('.confirmFriend').bind(m.clickOrTouchEnd, function(e){
					$(this).parent().html( $.i18n.t('You are now friends!') );
					that.allFriendsByUN[ m.currentUser.username ] = m.currentUser;
					that.acceptIncomingFriendDialog( m.dashUser.username );
					
					e.preventDefault();
				});
				friendBtn.find('.rejectFriend').bind(m.clickOrTouchEnd, function(e){
					$(this).parent().html( $.i18n.t('Friendship ignored.') );
					that.rejectIncomingFriendDialog( m.dashUser.username );
					
					e.preventDefault();
				});
			}
			else {
				var that = this;
				var friendBtn = this.$profile.find('#dashIsFriend');
				friendBtn.html('<a href="#" class="sml-btn-orange">'+ $.i18n.t('Add friend') +'</a>');
				friendBtn.bind(m.clickOrTouchEnd, function(e){
					that.addFriendDialog( m.dashUser.username );
					e.preventDefault();
				});
			}
		}
		
		// show bio (with default message for logged-in dash owner who doesn't have one yet)
		if (m.dashUser.self && !m.dashUser.bio) m.dashUser.bio = '<div style="text-align:center;">'+ $.i18n.t('You haven\'t added a bio yet.<br /> Go to <a href=\"/settings/account\">My Settings</a> to add one.') +'</div>';
		this.$profile.find('#dashProfileInfo').find('p').html(m.dashUser.bio);
		
		// show services (with default message for logged-in dash owner who doesn't have any yet)
		if (m.dashUser.services.length) this.$profile.find('#dashProfileInfo ul').prepend( $.tmpl(this.templates.service, m.dashUser.services) );
		else if (m.dashUser.self) this.$profile.find('#dashProfileInfo li a').text( $.i18n.t("Add Services") );
	},
	
	showLanes:function(){
		this.$lanes.find('.lanesLoading').hide();
		this.$lanes.find('h3 span').text( m.dashUser.lanes.length );
		var tmpl;
		
		if(m.dashUser.self){
			tmpl = '<li style="padding:10px 10px 15px;"><strong>'+ $.i18n.t('You don\'t have any lanes!') +'</strong><br /><br /> '+ $.i18n.t('Start creating lanes by clicking on the \"new lane\" button above. Happy lane making!') +'</li>';
		}else{
			tmpl = '<li style="padding:10px 10px 15px;"><strong>'+ $.i18n.t('This user has not created any lanes.') +'</strong></li>';	
		}
		
		if (m.dashUser.lanes.length) {
			var that = this;
			tmpl = $.tmpl(this.templates.lane, m.dashUser.lanes);
			
			tmpl.find('.removeLane').bind(m.clickOrTouchEnd, function(e){
				that.removeLaneDialog( $(this).closest('li').attr('id') );
				e.preventDefault();
			});
			tmpl.find('.dashXContributor').bind(m.clickOrTouchEnd, function(e){
				that.removeContributorDialog( $(this).closest('li').attr('id') );
				e.preventDefault();
			});

		}
		
		this.$lanes.find('ul').html( tmpl );
	},
	
	showFavLanes:function(){
		this.$favLanes.find('.lanesLoading').hide();
		this.$favLanes.find('h3 span').text( m.dashUser.favorite_lanes.length );
		var tmpl;
		
		if(m.dashUser.self){
			tmpl = '<li style="padding:10px 10px 15px;"><strong>'+ $.i18n.t('You haven\'t followed any lanes!') +'</strong><br /><br />'+ $.i18n.t('Add lanes to this list by going to a lane and clicking \"Follow lane\". That way, you\'ll never lose track of your lanes.') +'</li>';
		}else{
			tmpl = '<li style="padding:10px 10px 15px;"><strong>'+ $.i18n.t('This user has not followed any lanes!') +'</strong></li>';	
		}
	
		if(m.dashUser.favorite_lanes.length){	
			tmpl = $.tmpl(this.templates.favLane, m.dashUser.favorite_lanes);
		}
		
		this.$favLanes.find('ul').html( tmpl );
	},
	
	showFriends:function(){
		// ditch loader
		var $loader = this.$friends.find('.friendsLoading');
		if ($loader.is(':visible')) $loader.hide();
		// update friend count
		this.$friendCount.text( m.dashUser.friends.length );
		
		var that = this;
		var tmpl = $.tmpl(this.templates.friends, m.dashUser);
		
		tmpl.find('.confirmFriend').bind(m.clickOrTouchEnd, function(e){
			that.acceptIncomingFriendDialog( $(this).closest('li').attr('id') );
			e.preventDefault();
		});
		tmpl.find('.rejectIncomingFriend').bind(m.clickOrTouchEnd, function(e){
			that.rejectIncomingFriendDialog( $(this).closest('li').attr('id') );
			e.preventDefault();
		});
		tmpl.find('.rejectOutgoingFriend').bind(m.clickOrTouchEnd, function(e){
			that.rejectOutgoingFriendDialog( $(this).closest('li').attr('id') );
			e.preventDefault();
		});
		tmpl.find('.removeFriend').bind(m.clickOrTouchEnd, function(e){
			that.removeFriendDialog( $(this).closest('li').attr('id') );
			e.preventDefault();
		});
		tmpl.find('.dashAddFriend').bind(m.clickOrTouchEnd, function(e){
			that.addFriendDialog( $(this).closest('li').attr('id') );
			e.preventDefault();
		});
		
		this.$body.find('.dashFriendGroups').slideUp('fast', function(){ $(this).html( tmpl ).slideDown('fast') });
	},
	
	
	
	
	/*  dialogs  */
	
	removeLaneDialog:function( id ){
		var that = this;
		var lane = this.lanesByID[ id ];
		var $dialog = $.tmpl(m.globalTemplates.dialogs.removeLane, lane);
		
		// user clicks to confirm removal
		$dialog.find('.removeConfirm').bind(m.clickOrTouchEnd, function(e){
			that.removeLane(id);
			e.preventDefault();
		});
		
		$dialog.lightbox_me({
			centered: true
		});
	},
	
	
	removeContributorDialog:function( id ){
		var that = this;
		var lane = this.lanesByID[ id ];
		var $dialog = $.tmpl(m.globalTemplates.dialogs.removeLaneContributor, lane);
		
		// user clicks to confirm removal
		$dialog.find('.removeConfirm').bind(m.clickOrTouchEnd, function(e){
			that.removeLaneContributor(id);
			e.preventDefault();
		});
		
		$dialog.lightbox_me({
			centered: true
		});
	},
	
	
	acceptIncomingFriendDialog:function( username ){
		if (!this.allFriendsByUN[username] && m.dashUser.username == username) this.allFriendsByUN[username] = m.dashUser;
		
		var $dialog = $.tmpl(m.globalTemplates.dialogs.acceptFriendRequest, this.allFriendsByUN[username]);
		$dialog.lightbox_me({
			centered: true
		});
		
		this.acceptFriend(username);
	},
	
	
	rejectIncomingFriendDialog:function( username ){
		if (!this.allFriendsByUN[username] && m.dashUser.username == username) this.allFriendsByUN[username] = m.dashUser;
		
		var $dialog = $.tmpl(m.globalTemplates.dialogs.rejectFriendRequest, this.allFriendsByUN[username]);
		$dialog.lightbox_me({
			centered: true
		});
		
		this.removeFriend(username);
	},
	
	
	rejectOutgoingFriendDialog:function( username ){
		var $dialog = $.tmpl(m.globalTemplates.dialogs.cancelFriendRequest, this.allFriendsByUN[username]);
		$dialog.lightbox_me({
			centered: true
		});
		
		this.removeFriend(username);
	},
	
	
	addFriendDialog:function( username ){
		// determine if the add was for someone in the friend list or for the dashboard owner
		var friend = this.allFriendsByUN[username] ? this.allFriendsByUN[username] : m.dashUser;
		
		var $dialog = $.tmpl(m.globalTemplates.dialogs.addFriend, friend);
		$dialog.lightbox_me({
			centered: true
		});
		
		this.addFriend(friend.username);
	},
	
	
	removeFriendDialog:function( username ){
		var that = this;
		var $dialog = $.tmpl(m.globalTemplates.dialogs.removeFriend, this.allFriendsByUN[username]);
		
		// user clicks to confirm removal
		$dialog.find('.removeConfirm').bind(m.clickOrTouchEnd, function(e){
			that.removeFriend(username);
			e.preventDefault();
		});
		
		$dialog.lightbox_me({
			centered: true
		});
	},
	
	
	
	
	/*  methods to do the data-type work: HTTP requests, etc.  */
	
	removeLane:function( id ){
		var that = this;
		
		$.ajax({
			type: 'delete',
			url: '/lanes/'+ id,
			success: function() {
				// nuke this lane in the pertinent objects
				delete that.lanesByID[id];
				m.dashUser.lanes = _.reject(m.dashUser.lanes, function(lane){ if (lane['id'] == id) return lane; });
				if($('.dashFaves #'+id).length){
					delete that.favLanesByID[id];
					m.dashUser.favorite_lanes = _.reject(m.dashUser.favorite_lanes, function(lane){ if (lane['id'] == id) return lane; });
				
					that.showFavLanes();
				}
				// re-render lanes
				that.showLanes();
			}
		});
	},
	
	removeFavLane:function(e){
		var that = this,
			id = $(e.target).closest('li').attr('id');
			
		$.ajax({
			url: '/lanes/favorite',
			type : 'DELETE',
			data: {
					lane_id:id
				}
			}).success(function() {
				delete that.favLanesByID[id];
				m.dashUser.favorite_lanes = _.reject(m.dashUser.favorite_lanes, function(lane){ if (lane['id'] == id) return lane; });
				
				that.showFavLanes();
			}
		);
		e.preventDefault();
	},
	
	
	removeLaneContributor:function( laneID, username ){
		var that = this;
		if (!username) username = m.dashUser.username; 
		
		$.ajax({
			type: 'delete',
			url: '/lanes/contributor',
			data: {
				"lane_id": laneID,
				"username": username
			},
			success: function() {
				// nuke this lane in the pertinent objects
				delete that.lanesByID[laneID];
				m.dashUser.lanes = _.reject(m.dashUser.lanes, function(lane){ if (lane['id'] == laneID) return lane; });
				
				// re-render lanes
				that.showLanes();
			}
		});
	},
	
	
	addFriend:function( username ){
		var that = this;
		
		$.ajax({
			type: 'post',
			url: '/friends/'+ username,
			success: function() {
				// update the correct button (either someone in the friend list or the dash user)
				if (that.allFriendsByUN[username]) that.$friends.find('#'+ username +' div').html('<em class="dashAddFriend">'+ $.i18n.t("Requested", "this informs the user that the owner of the current dashboard has already been requested as a friend") +'</em>');
				else that.$body.find('#dashIsFriend').html('<em>'+ $.i18n.t("Friendship requested.", "this informs the user that the owner of the current dashboard has already been requested as a friend") +'</em>');
			}
		});
	},
	
	
	acceptFriend:function( username ){
		var that = this;
		
		$.ajax({
			type: 'post',
			url: '/friends/'+ username +'/accept',
			success: function() {
				// update dashUser object, dependent upon if you're on your own dashboard or someone else's
				if (username != m.dashUser.username) m.dashUser.friends.unshift( that.allFriendsByUN[username] );
				else m.dashUser.friends.unshift( m.currentUser );
				
				m.dashUser.friend_requests = _.reject(m.dashUser.friend_requests, function(friend){ if (friend['username'] == username) return friend; });
				
				// re-render friends
				that.showFriends();
			}
		});
	},
	
	
	removeFriend:function( username ){
		var that = this;
		
		$.ajax({
			type: 'delete',
			url: '/friends/'+ username,
			success: function() {
				// nuke this friend in the pertinent objects
				delete that.allFriendsByUN[username];
				m.dashUser.friends = _.reject(m.dashUser.friends, function(friend){ if (friend['username'] == username) return friend; });;
				m.dashUser.friend_requests = _.reject(m.dashUser.friend_requests, function(friend){ if (friend['username'] == username) return friend; });;
				m.dashUser.friends_pending = _.reject(m.dashUser.friends_pending, function(friend){ if (friend['username'] == username) return friend; });;
				
				// re-render friends
				if (m.dashUser.self) that.showFriends();
			}
		});
	},
	
	
	
	
	/*  templates  */	
	templates:{
		service:
			'<li class="services-used-${service}" title="${service_name}">${service_name}</li>'
		,
		
		lane:
			'<li id="${id}">'
			+'	<a href="/${owner.username}/${title}" class="">'
			+'		<img src="${avatar_url}">'
			+'		<span class="dashItemTitle"><em>${title}</em>{{if role=="contributor"}} <em class="dashItemGray">('+ $.i18n.t("Contributor", "this status indicates that the current user is a contributor to the given lane") +')</em>{{/if}}</span>'
			+'		<span class="dashItemDescription">${description}</span>'
			+'	</a>'
			+'	{{if m.dashUser.self}}'
			+'		{{if role == "contributor"}}'
			+'			<a href="#" class="dashXContributor removeContributor" title="'+ $.i18n.t("Remove myself as a contributor to this lane") +'"></a>'
			+'		{{else}}'
			+'			<a href="/${owner.username}/${title}#drawer=edit" class="dashE editLane" title="'+ $.i18n.t("Edit Lane", "this action text informs the user that they can edit the given lane") +'">'+ $.i18n.t("Edit Lane", "this action text informs the user that they can edit the given lane") +'</a>'
			+'			<a href="#" class="dashX removeLane" title="'+ $.i18n.t("Delete Lane") +'">'+ $.i18n.t("Delete Lane") +'</a>'
			+'		{{/if}}'
			+'	{{/if}}'
			+'</li>'
		,
		
		favLane:
			'<li id="${id}">'
			+'	<a href="/${owner.username}/${title}" class="">'
			+'		<img src="${avatar_url}">'
			+'		<span class="dashItemTitle"><em>${title}</em> <em class="dashItemGray">'+$.i18n.t("by","this lane was created by X person")+'</em> {{if m.currentUser && m.dashUser.username === owner.username}} <span class="lane-fav-owner-me">'+ $.i18n.t("Me", "this label indicates that the current user is the owner of the given lane") +'</span> {{else}}<span class="lane-fav-owner" data-fav-owner="${owner.username}">${owner.full_name} (${owner.username})</span>{{/if}}</span>'
			+'		<span class="dashItemDescription">${description}</span>'
			+'	</a>'
			+'	{{if m.dashUser.self}}'
			+'			<a href="#" class="remove-fav" title="'+ $.i18n.t("Stop following lane") +'">'+ $.i18n.t("Stop following lane") +'</a>'
			+'	{{/if}}'
			+'</li>'
		,
		
		friends:
			'{{if self && !friend_requests.length && !friends_pending.length && !friends.length}}'
			+'	<p style="padding:12px 10px 15px; color:#ccc;"><strong>'+ $.i18n.t("Start adding friends by searching for people you know in the search bar, or by inviting your Gmail contacts and Facebook friends by clicking on the \"Add Friends\" button above.") +'</strong></p>'
			+'{{else}}'
			+'	{{if self && friend_requests.length}}'
			+'		<div>'
			+'			<h4>'+ $.i18n.t("Friend Requests: Received") +'</h4>'
			+'			<ul class="dashFriends_requested">'
			+'			{{each friend_requests}}'
			+'				<li id="${username}">'
			+'					<a href="/${username}" class="">'
			+'						<img src="${image}">'
			+'						<span class="dashFriendName">${full_name}</span>'
			+'						<span>(${username})</span>'
			+'					</a>'
			+'					<div>'
			+'						<a href="#" class="dashY confirmFriend"></a>'
			+'						<a href="#" class="dashX rejectIncomingFriend"></a>'
			+'					</div>'
			+'				</li>'
			+'			{{/each}}'
			+'			</ul>'
			+'		</div>'
			+'	{{/if}}'
			+'	{{if self && friends_pending.length}}'
			+'		<div>'
			+'			<h4>'+ $.i18n.t("Friend Requests: Sent") +'</h4>'
			+'			<ul class="dashFriends_pending">'
			+'			{{each friends_pending}}'
			+'				<li id="${username}">'
			+'					<a href="/${username}" class="">'
			+'						<img src="${image}">'
			+'						<span class="dashFriendName">${full_name}</span>'
			+'						<span>(${username})</span>'
			+'					</a>'
			+'					<div><a href="#" class="dashX rejectOutgoingFriend"></a></div>'
			+'				</li>'
			+'			{{/each}}'
			+'			</ul>'
			+'		</div>'
			+'	{{/if}}'
			+'	{{if friends.length}}'
			+'		<ul class="dashFriends_accepted"{{if !friends.length}} style="display:none;"{{/if}}>'
			+'		{{each friends}}'
			+'			<li id="${username}">'
			+'				<a href="/${username}" class="">'
			+'					<img src="${image}">'
			+'					<span class="dashFriendName">${full_name}</span>'
			+'					<span>(${username})</span>'
			+'				</a>'
			+'				<div>'
			+'					{{if m.dashUser.self}}'
			+'						<a href="#" class="dashX removeFriend"></a>'
			+'					{{else}}'
			+'						{{if m.currentUser && !friend && (m.currentUser.username != username)}}'
			+'							<a href="#" class="dashAddFriend sml-btn-grey"><span class="icon"></span>'+ $.i18n.t("Add", "this button text prompts the user to add the associated user as a friend") +'</a>'
			+'						{{/if}}'
			+'					{{/if}}'
			+'				</div>'
			+'			</li>'
			+'		{{/each}}'
			+'		</ul>'
			+'		{{else}}'
			+'	<p style="padding:12px 10px 15px; color:#ccc;"><strong>'+ $.i18n.t("Everyone needs a friend. Why not befriend this person?") +'</strong></p>'
			+'	{{/if}}'
			+'{{/if}}'
	}
	
};}(this,jQuery,this.undefined);

m.dashboard.initialize();