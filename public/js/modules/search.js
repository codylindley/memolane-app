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

m.search = function(win,$,undefined){return{

	/*  static  */
	$searchInput : $('#search-input'),
	$closeSearchBtn : $('#close-search-btn'),
	$searchDD : $('#dd-search'),
	$tbSearch : $('#tb-search'),
	$searchTypesA : $('#search-types a'),
	$searchResults : $('.search-results'),
	searchDDOpen: false,
	searchContext: m.currentLane ? "search-memos" : "search-lanes",
	loaderClass:"small-loader-on-grey",
	jScrollGutter:5,
	maxDDContentHeight:320,
	searchLaneScope:"world",
	searchTimeout: undefined,
	
	
	/*  initialize module  */
	initialize:function(){
          
		//ensure that correct default search area is shown depending on whether memo search is allowed or not
		if( !m.currentLane ) {
			$('#search-memos').hide();
			$('#search-lanes').show();
			$('#search-lanes-filter-friends').show();
		}
		
		var that = this;
		//setup events on search input
		this.$searchInput
			.focus($.proxy(this.searchInputFocus,this))
			.blur($.proxy(this.searchInputBlur,this))
			.keyup($.proxy(this.searchInputkeyup,this));
		
		// close search button inside of input
		this.$closeSearchBtn.bind(m.clickOrTouchStart,$.proxy(function(){ this.closeSearchDD();},this));
		
		// close search when clicking off search UI
		$(document).bind(m.clickOrTouchStart,$.proxy(this.closeSearchDDFromClickOff,this));


		this.$searchTypesA.bind(m.clickOrTouchStart,$.proxy(function(e){
			
			this.toggleSearchContext(e);
			
		},this));
		
		
   		this.$searchResults.delegate('.request-friendship', m.clickOrTouchStart, function(e){ 
			that.addFriendDialog($(this));
			return false;	
  		});
  		
  		
  		$('#search-lanes-filter-friends input').bind(m.clickOrTouchStart, function(e){ 
			
			that.setLaneSearchFilter($(this));
			
  		});   		

	},
	
	
	/*  METHODS  */
	
	searchInputFocus: function(e){
		var $this = $(e.target),
			v = $this.val();

		$this
			.val( v === e.target.defaultValue ? '' : v )
			.addClass('search-focused')
	 		.data('hasFocus', true);

		this.$closeSearchBtn.show();
	},



	searchInputBlur: function(e){
		var $this = $(e.target);
		
		if(this.$searchDD.css('visibility') === 'visible'){return};
		
		$this
			.val(e.target.defaultValue)
			.removeClass('search-focused')
			.data('hasFocus', false);
		
		this.$closeSearchBtn.hide();
		this.$tbSearch.css('background-color', 'transparent');
	},
	
	
	
	closeSearchDD:function(){
		this.$searchDD.css('visibility', 'hidden');
		this.$searchInput.trigger('blur');
		this.searchDDOpen = false;
	},
	
	
	closeSearchDDFromClickOff:function(e){
		if($(e.target).closest('#dd-search, #tb-search, .memolaneDialog').length){
			return;
		}
		this.closeSearchDD();
	},
	

	searchInputkeyup: function(e){
		var $this = $(e.target),
			that = this,
			query = this.$searchInput.val();
			
		if(query.length != 0 && query.length >= 3 || this.searchDDOpen){
	
			if (this.searchDDOpen === false) {
				// TODO: use addClass
				this.$tbSearch.css('background-color', '#f1f1f1');
				// AT LEAST 3 CHARS :: DO SEARCH
				this.openSearchDD();
			} 
		
			// initiate the current or default context button
			that.doSearchDebounce(this.searchContext);
			
			foo = false;
		}
	},
	
	
	openSearchDD:function(){
		this.searchDDOpen = true;
		m.topBarDropDowns.closeAllDropdowns();
		// TODO: Use "removeClass" that is making dd visible
		this.$searchDD.css('visibility','visible');
	},
	
	
	toggleSearchContext:function(e) {
	
		var $button = $(e.target);
		// which of 3 buttons (memos|lanes|users) ?
		var context = ($button.attr("id")).replace("dd-", "");
		
		if(context === 'search-lanes'){
			$('#search-lanes-filter-friends').show();
		}else{
			$('#search-lanes-filter-friends').hide();
		}
		
		this.searchContext = context;
		this.$searchResults.hide();
		this.$searchTypesA.removeClass('smallButtonActive');
		$button.addClass('smallButtonActive');
		
		this.doSearchDebounce(context);

		e.preventDefault();
	},
	
	
	setLaneSearchFilter:function($cb) {
		
		var filter = $cb.attr("id"),
			checked = $cb.is(":checked");
		// only one checkbox to start
		
		if (checked === true) {
			// switch filter to just friends
			this.searchLaneScope = "friends";
		} else {
			// use (default) world setting for search
			this.searchLaneScope = "world";
		}
		
		this.doContextSearch(0, "search-lanes");
	},


	
	doSearchDebounce : _.debounce(function(context) { 
		// debounce is for initial search results
		// (infinite scroll is not debounced)
		this.doContextSearch(0, context); 

	}, 200), // eof debounce
	
	
	
	/*
	doContextSearch
		@param start {Number} database marker for index within results
		@param context {String} "search-memos"|"search-lanes"|"search-users"
		@param hits {Number} results total used in 2nd+ round of infinite scroll
					queries to prevent unnecessary ajax calls
		
		Called in doSearchDebounce from the toggles or the input, but
		done directly from the "bottom" of 11+ result sets, by listening 
		to a jScrollPane custom event
	*/
	doContextSearch:function(start, context, hitsReported) {
				
		var that=this,
			$contextDiv = $("#" + context).show(),
			$ddul = $contextDiv.find('ul'),
			query = this.$searchInput.val(),
			url = '',
			scope = '',
			sub = '',
			hits = hitsReported||10,
			$hitsSpan = $('#' + context + '-hits');
						
		// cache the button that we're on; memos by default
		that.searchContext = context;
						
		switch(context){
      
			case "search-memos": 
				url = "/search/memos",
				//url = "/js/json_tests/search-memos.json";
				sub = "memos";
				scope = "";
                                lane = m.currentLane.id;
			break;
			
			case "search-lanes": 
				url = "/search/lanes";
				// url = "/js/json_tests/search-lanes.json";
				sub = "lanes";
				scope = that.searchLaneScope;
                                lane = "";
			break;
			
			case "search-users": 
				url = "/search/users";
				// url = "/js/json_tests/search-users.json";
				sub = "users";
				scope = "world";
                                lane = "";
			break; 
  
		} // eof switch
				
		if (start == 0) {
			$ddul.html('');
			// if scrollbar is already set on the scrollable div, kill it
			if ($contextDiv.find(".search-results-scrollable").data('jsp')){
				$contextDiv.find(".search-results-scrollable").data('jsp').destroy();
			}
			
			$contextDiv.show();
		}
		
		$('#' + context + '-loader').show();
		
		if (hits > start) {

			$.ajax({ 	
				type: 'get',
				url:url,
				data: {"q":query, "start":start, "limit":10, "scope":scope, "lane":lane},
				
				success: function (data,status,jqXHR) { 
					$('#' + context + '-loader').hide();
					
					if (start == 0) {
						$contextDiv.removeClass(that.loaderClass);
					}
					
					if (parseInt(data.hits) == 0 || jqXHR.status == 204) {
						// NO RESULTS -- get "no results..." template
						if($ddul.find('.search-no-results').length === 0){
							$.tmpl(that.templates[context]['empty'], {}).appendTo($ddul);
							$hitsSpan.html('');
							$contextDiv.find(".search-results-scrollable").height(40);
						}
					} else {
						// SUCCESS ----- at least 1 result
						
						$.tmpl(that.templates[context]['results'], data[sub]).appendTo($ddul);
						
						if ($ddul.height() >= that.maxDDContentHeight) {
							$contextDiv
								.find(".search-results-scrollable")
								.height(that.maxDDContentHeight)
								.jScrollPane({verticalGutter:that.jScrollGutter});
						} else {
							$contextDiv
								.find(".search-results-scrollable")
								.height($ddul.height());
						}
						
						$contextDiv
							.find('.jspScrollable')
							.bind('jsp-scroll-y', function (event,b,isAtTop,isAtBottom) {
								if (isAtBottom === true){
									
									var startPlus = start + 10;
									
									if (data.hits > startPlus) {
										// there are more results
										that.doContextSearch(startPlus, context, data.hits);
									}
									// UNBIND to prevent recursive barf
									$(this).unbind('jsp-scroll-y');
								}
						});
	
						if (start == 0) {
							$hitsSpan.html(data.hits + " "+ $.i18n.t("total results", "this is preceded by the number of search results returned") );
						} else {
							$contextDiv.find(".search-results-scrollable").data('jsp').reinitialise();
						}
					
					}
		
				} // eof success
	
			}); // eof ajax
		
		} else {
			// that's all folks ----- all results have been DOM'd
			$('#' + context + '-loader').hide();
		}

	}, // eof doContextSearch
	
    linkToMemo:function(id, createdAt) {
            var link = m.utilities.breakURLCache( window.location.pathname ) + "#time=" + createdAt +"&memo=" + m.utilities.cleanMemoId( id );
            //console.log( link );
            return link;
    },
	
	addFriendDialog:function($a){
		
		var that = this,
			friend = {
			"username":$a.data("username"),
			"first_name":$a.data("first_name"),
			"last_name":$a.data("last_name")
			};
		
		var $dialog = $.tmpl(m.globalTemplates.dialogs.addFriend,friend);
		
		$dialog.lightbox_me({
			centered: true
		});
		
		if (m.dashboard){
			m.dashboard.addFriend(friend.username);
		} else {
			$.ajax({
				type: 'post',
				url: '/friends/'+ friend.username,
				success: function() {
					// anything here?
				}
			});
		
		}
	},
	
	templates:{

		"search-memos": {
			results: '<li class="clearfix">'
					+'<a href="${m.search.linkToMemo(id, created_at)}" title="'+$.i18n.t('view memo')+'">'
					+'<div class="search-service-icon ${service}-icon"></div>'
					+'<img src="/${user.username}/images" alt="lane" class="search-user-avatar" title="${title}" height="20" width="20" />'
					+'<div class="search-memos-txt">${title.substring(0, 75) + ( title.length > 75 ? "..." : "") }<span class="search-memos-date">${m.utilities.dateFormat((created_at*1000), "utcDefault")}</span></div>'
					+'</a>'
					+'</li>',
							
			empty: '<li class="clearfix search-no-results">'+ $.i18n.t('No memos match that search term') +'</li>'
		},
		
		"search-lanes": {
		
			results:'{{if user}}<li class="clearfix">'
					+'<a href="/${user.username}/${title}" title="'+$.i18n.t('view lane')+'">'
					+ '<img src="/lanes/${id}/avatar.small" class="search-result-icon search-lane-image" alt="topBarAvatar" title="${title}" height="20" width="20" />'
					+ '<span class="search-results-txt">${title}'
					+'{{if m.currentUser.userID != user_id}}'
					+ '<span class="search-lanes-rel">(${user.first_name} ${user.last_name})</span>'
					+'{{/if}}'
					+ '</span>'
					+ '</a></li>{{/if}}',
					
			empty: '<li class="clearfix search-no-results">'+$.i18n.t('No lanes match that search term')+'</li>'
		},

		"search-users": {
			results: '<li class="clearfix">'
					+ '<a href="/${username}" title="'+$.i18n.t('view user profile')+'">'
					+ '<img src="/${username}/images" height="20" width="20" class="search-result-icon search-user-avatar" alt="'+ $.i18n.t('top bar avatar', "this labels the lane avatar") +'"/>'
					+ '<span class="search-results-txt">'
					+ '${first_name} ${last_name}'
					+ '<span class="search-users-username">(${username})</span>'
					+ '</span> '
					// for now leaving pending/friend/self empty
					+'{{if friend=="pending" || friend=="self" || friend=="accepted" || m.currentUser === null}}'
					+''
					+'{{else}}'
					+'<a href="#" data-first_name="${first_name}" data-last_name="${last_name}" data-username="${username}" class="request-friendship" title="'+$.i18n.t('request friendship')+'">'+$.i18n.t('Request Friendship')+'</a>'
					+'{{/if}}'
					+ '</a></li>',
					
			empty: '<li class="clearfix search-no-results">'+$.i18n.t('No users match that search term')+'</li>'
		}
		
  }
	
		
};}(this,jQuery,this.undefined);

m.search.initialize();