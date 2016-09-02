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

m.drawer = function(win,$,undefined){return{

	/* static */
	$drawer:$('#lane-drawer'),
	$drawerContent : $('#lane-drawer-content'),
	$drawerActions : $('#drawer-actions'),
	$laneDrawerEdit : $('#lane-drawer-edit'),
	$laneDrawerView : $('#lane-drawer-view'),
	$content:$('#content'),
	$slotLoaderLeft : $('#slot-loader-left'),
	$headerLaneTitle:$('h2.lane-title'),
	$drawerHandler:$('#lane-drawer-tab'),
	$screenLeftBtn:$('#screenLeftBtn'),
	$drawerHandlerIcon:$('#lane-drawer-tab').find('span'),
	drawerIsOpen:true,
	currentUserIsOwner : m.currentLane.user_is_owner,
	currentUserIsContributor : m.currentLane.user_is_contributor,
	urlHashObject : m.utilities.urlHash.get(),
	
	/*  initialize module  */
	initialize:function(){
	
		var that = this;
		var mode = m.currentLane.mode;
	
		//setup event attached to drawer tab to close and open drawer
		this.$drawerHandler
			.bind(m.clickOrTouchStart,$.proxy(this.onClickOrTouchStart,this));
			
		//show drawer for a sec, then close once per session
		if(Modernizr.sessionstorage && !sessionStorage.getItem("drawerAware") && mode !== 'new' && this.urlHashObject.drawer !== 'open' && this.urlHashObject.drawer !== 'edit' && m.isEmbedded !== true){
				sessionStorage.setItem("drawerAware", true);
				this.$screenLeftBtn.stop().animate({left:this.$drawer.outerWidth()},400,'easeOutCubic');
				this.$drawer.css('visibility','visible');		
				setTimeout(function(){that.closeDrawer(1000);},9000);
		}else if(mode === 'new' || this.urlHashObject.drawer === 'open' || this.urlHashObject.drawer === 'edit' || m.currentLane.total_memos === 0 || m.currentLane.visible_memos === 0){
			this.$screenLeftBtn.stop().animate({left:this.$drawer.outerWidth()},400,'easeOutCubic');
			this.$drawer.css('visibility','visible');
			this.$headerLaneTitle.hide();
		}else{
			this.closeDrawer(0,function(){that.$drawer.css('visibility','visible');});
		}
				
		//setup custom scroller for drawer
		$('#lane-drawer-content').jScrollPane({verticalGutter:0});		
		
		// keyboard navigation
		$(document).keyup(function(e){
			if($('input:focus,textarea:focus,select:focus').length){return false};
			switch(e.which){
				// user presses the "d" toggle the drawer
				case 68: (function(){
					m.drawer.drawerIsOpen ? m.drawer.closeDrawer() : m.drawer.openDrawer();
				})();
				break;
			}				
		});
		
		//determine lane mode and load the correct drawer
		if(mode === 'new'){
				this.addNewView();
				/*$('<div class="notifications warningnews-notice"><div class="notice-text"><p class="zeroMarginBottom">'+$.i18n.t('Don\'t forget to turn on the services you want to stream on this lane.')+'</p><a href="#" class="close-notice">X</a></div></div>').notify({expires: 7500});*/
		}else{
			if(this.urlHashObject.drawer === 'edit'){
				this.addEditView();
			}else{
				this.addLaneView();
			}
		}
		
		if(this.urlHashObject.firstLane === 'yes'){
			if(sessionStorage.getItem("drawerAware")){
				setTimeout(function(){that.closeDrawer(1000);},9000);
			}
			/*$('<div class="notifications warningnews-notice"><div class="notice-text"><p>'+$.i18n.t('Welcome to Memolane!')+'</p><p class="zeroMarginBottom">'+$.i18n.t('dummy text not shown')+'</p><a href="#" class="close-notice">X</a></div></div>').notify({expires: false});*/
		}
		
		//attach live even to body can be called from any event in the DOM
		$('.openDrawerOnClick').live('click',function(){
			m.drawer.openDrawer();
			return false;
		});
		
		//attach live even to body can be called from any event in the DOM
		$('.openDrawerEditViewOnClick').live('click',function(){
			$('#drawer-edit-lane-link').trigger('click');
			m.drawer.openDrawer();
			return false;
		});
		
	},
	
	/*  methods  */
	
	addNewView:function(){
	
		var that = this;
	
		//show loader open drawer
		this.showDrawerLoader();
		_.delay($.proxy(this.openDrawer,this), 1000);
	
		var getSerAval = function(){return $.ajax({url: '/lanes/'+m.currentLane.id+'/available_services'});};
		var getContrAval = function(){return $.ajax({url: '/lanes/'+m.currentLane.id+'/available_contributors'});};
		
		$.when(getSerAval(),getContrAval())
			.done(function(ser,contr){

				var html = $.tmpl(that.templates.drawerNew,{
					ser:ser[0],
					contr:_.sortBy(contr[0],function(prop){return prop.first_name ? prop.first_name.toLowerCase():null}),
					currentUser:m.currentUser,
					avatar:m.currentLane.avatar
				}).html();
						
				that.hideDrawerLoader();
				
				that.$drawerContent
					.after(that.templates.createLaneAction)
						.find('.jspPane')
						.append(html)
					.end()
					.height(that.$drawerContent.height() - 43)
					.data('jsp').reinitialise();	
				
				//setup jquery calendar widget & check all/uncheck all
				that.setupEditViewAndNewViewEvents();
				that.setupAllDrawerViews();
				
				//setup events for drawer new
				
				that.$drawer.delegate('#streaming-services input','click',function(e,elm){
					that.serviceCheckboxToggle(this);
					//if we passed in elm its not a direct checkbox click
					if(elm){return false;}
				});
				
				$('#lane-contrib-list li').bind('click',function(e){
					if($(e.target).is('input')){
						that.contributorToggle(e.target);
					}else{
						$checkbox = $(this).find('input');
						$checkbox.prop('checked') ? $checkbox.prop('checked',false) : $checkbox.prop('checked',true);			
						that.contributorToggle($checkbox);
					}
				});
				
				$('#cancel-lane-creation a').bind(m.clickOrTouchStart,function(){
					that.hideDrawerContent();
					that.showDrawerLoader();
					$.ajax({
						type: 'delete',
						url: '/lanes/'+ m.currentLane.id,
						success:function(){win.history.back()}
					});
					return false;
				});		
				
				$('#create-new-lane-btn').bind(m.clickOrTouchStart,function(e){
					that.saveLane();
				});		
				
				$('#laneKeywordFilters').alphanumeric({ichars:"'!#¤%&@£()\"|&$,"}).textext({
					plugins : 'tags prompt',
					prompt : $.i18n.t('Add keyword, hit enter')
				});
				
			
			});
		
	},
	
	contributorToggle:function(inputClicked){
	
		var that = this;
		var $checkbox = $(inputClicked);
		if($checkbox.prop('checked')){
			
			$.ajax({
				url:'/lanes/contributor',
				type:'POST',
				data:{
					lane_id:m.currentLane.id,
					username:$checkbox.data('username')
					}
			}).success(function(){
			
				$.ajax({url: '/lanes/'+m.currentLane.id+'/available_services',cache:false}).success(function(data){
				
					var html = $.tmpl(that.templates.drawerNewServList,{ser:data}).html();
					
					$('#streaming-services').html(html);
					that.$drawerContent.data('jsp').reinitialise();
				});	
			
			});
			
		}else{
		
			$.ajax({
				url:'/lanes/contributor',
				type:'DELETE',
				data:{
					lane_id:m.currentLane.id,
					username:$checkbox.data('username')
					}
			}).success(function(){
			
				$.ajax({url: '/lanes/'+m.currentLane.id+'/available_services',cache:false}).success(function(data){

					var html = $.tmpl(that.templates.drawerNewServList,{ser:data}).html();	
								
					$('#streaming-services').html(html);
					that.$drawerContent.data('jsp').reinitialise();			
				});	
			
			});
		
		}
	},
	
	serviceCheckboxToggle:function(inputClicked,type){
		if($(inputClicked).is(':checked')){
			
			$.ajax({
				url:'/lanes/service',
				type:'POST',
				data:{
					lane_id:m.currentLane.id,
					service:$(inputClicked).data('service-name')
					}
			});
			
		}else{
		
			$.ajax({
				url:'/lanes/service',
				type:'DELETE',
				data:{
					lane_id:m.currentLane.id,
					service:$(inputClicked).data('service-name')
					}
			});
		
		}
	},
	
	saveLane:function(){
	
		var that = this;
		
		this.hideDrawerContent();
		this.showDrawerLoader();

		$('#drawer-actions').addClass('visibility-hidden');
		
		var $titleInput = $('#lane-title-input');
		var $titleInputPlaceHolderText = $titleInput.attr('placeholder');
		var $titleInputVal = $titleInput.val();
		
		var $descripInput = $('#lane-descrip-input');
		var $descripInputPlaceHolderText = $descripInput.attr('placeholder');
		var $descripInputVal = $descripInput.val();
		
		var $startStreamInput = $('#lane-input-start-date');
		var $startStreamInputVal = $startStreamInput.val();
		var $startStreamInputData = $startStreamInput.data('date') || '';
		var $endStreamInput = $('#lane-input-end-date');
		var $endStreamInputVal = $endStreamInput.val();
		var $endStreamInputData = $endStreamInput.data('date') || '';
		
		var $keywords = $('.text-tags');
		var $keywordsTextarea = $('#laneKeywordFilters');
		var keywordsCommaSeperatedString = JSON.parse($keywordsTextarea.textext()[0].hiddenInput().val()).join(',');
		
		var updateKeywords = function(){
			if($keywordsTextarea.data('keywords') !== keywordsCommaSeperatedString){
				return $.ajax({
					url: '/lanes/keywords',
					type:'POST',
					data:{
							keywords:keywordsCommaSeperatedString,
							lane_id:m.currentLane.id
						}
				});	
			}else{
				return false;
			}
		}
		
		var updateTitle = function(){
			if($titleInputVal !== '' && $titleInputVal !== $titleInputPlaceHolderText && m.currentLane.title !== $titleInputVal){		
				return $.ajax({
					url: '/lanes/title',
					type:'POST',
					data:{
							lane_id:m.currentLane.id,
							title:$titleInputVal
						}
				});	
			}else{
				return false;
			}
		};
		
		var updateDescrip = function(){
			if($descripInputVal !== $descripInputPlaceHolderText){		
				return $.ajax({
					url: '/lanes/description',
					type:'POST',
					data:{
							lane_id:m.currentLane.id,
							description:$descripInputVal
						}
				});	
			}else{
				return false;
			}
		};
		
		var updateBounds = function(){
		
			if($startStreamInputVal === $startStreamInputData && $endStreamInputVal === $endStreamInputData){
				return false;
			}
				
			
			var fromValue = $startStreamInputVal === '' ? -1 : Math.round(new Date($startStreamInputVal).getTime()/1000.0);
			
			var toValue = $endStreamInputVal  === '' ? -1 : Math.round(new Date($endStreamInputVal ).getTime()/1000.0);
		
			return $.ajax({
				url: '/lanes/bounds',
				type:'POST',
				data:{
						lane_id:m.currentLane.id,
						from:fromValue,
						to:toValue
					}
			});
					
		};	
		
		/*
		var updateToBounds = function(){
		
			if($('#lane-input-end-date').val() === $endStreamInputData){
				return false;
			}	
				
			var fromValue = $('#lane-input-end-date').val() === '' ? -1 : Math.round(new Date($('#lane-input-end-date').val()).getTime()/1000.0);
			
			return $.ajax({
				url: '/lanes/bounds',
				type:'POST',
				data:{
						lane_id:m.currentLane.id,
						to:fromValue
					}
			});	
			
		};
		*/
		
		$.when(updateTitle(),updateDescrip(),updateBounds(),updateKeywords()).done(function(updatedTitle){
			if(updatedTitle){			
				win.location.href = '/'+m.currentUser.username+'/'+$titleInputVal+'#drawer=open';
			}else{
				win.location.href = '/'+m.currentUser.username+'/'+m.currentLane.title+'#drawer=open';
				if(m.currentLane.mode !== "new"){
					win.location.reload();
				}
			}
		}).fail(function(e){
			
			//right now we assume the only fail is giving the same title as another lane
			that.showDrawerContent();
			that.hideDrawerLoader();
			$('#drawer-actions').removeClass('visibility-hidden');
			
			$('#lane-title-input')
				.focus()
				.tipsy({trigger:'manual',gravity:'w',fallback:$.i18n.t('You already have a lane with this name. We can\'t create another lane with the same exact name.')})
				.tipsy('show')
				.blur(function(){
					$('#lane-title-input').tipsy('hide');
				});
		
		});
		
	},
	
	setupAllDrawerViews:function(){
	
		var that = this;
		
		$('#laneContribCopy').tipsy({trigger:'hover', offset:5, html:true, gravity:'w',fallback:'<p style="margin-bottom:0;">'+$.i18n.t('The owner of a lane, and their Memolane friends are the sources for a lane. Memos can be added to a lane from any of the owner\'s services, and any of the services that their Memolane friends have shared with them.')+'</p>'});
		
		$('#showContribsToggle').toggle(
			function(){
			$('#memos-from,#lane-contrib-list').removeClass('hideContribList');
			$(this).find('#contribsClosed').hide().end().find('#contribsOpen').show();
			that.$drawerContent.data('jsp').reinitialise();
			return false;
			},
			function(){
			$('#memos-from,#lane-contrib-list').addClass('hideContribList');
			$(this).find('#contribsOpen').hide().end().find('#contribsClosed').show();
			that.$drawerContent.data('jsp').reinitialise();
			return false;
			}
		);
	
	},
	
	setupEditViewAndNewViewEvents:function(){
	
		//calendar
		$( ".lane-input-date" ).datepicker({
			dateFormat: 'mm/dd/yy',
			constrainInput: true,
			changeYear: true,
			prevText: '<',
			nextText: '>',
			closeText: 'Close',
			onClose: function(dateText, inst) { 
				if($(inst.input).val() === 'mm/dd/yyyy'){
				  $(inst.input).val('');
				}
			},
			beforeShow: function(input, inst) { 
				if($(input).val() === ''){ 
				  $(input).val('mm/dd/yyyy');
				}
			}
		});		
				
		$('.calendar-icon').click(function(){$(this).next('input').focus()});
		
		//check/uncheck services
		$('.uncheck-all-checkbox').bind('click',function(e){
			var cache = $('#streaming-services input:checked');
			$('#streaming-services input').prop('checked',false);
			cache.trigger('click',[e.target]);
			return false;
		});
		
		$('.check-all-checkbox').bind('click',function(e){
			var cache = $('#streaming-services input:not(:checked)');
			$('#streaming-services input').prop('checked',true);
			cache.trigger('click',[e.target]);
			return false;
		});
		
		$('.lane-upload-input-file').ajaxfileupload({
		    'action': '/lanes/'+m.currentLane.id+'/avatar.upload',
		    'params': {
		        '_csrf':m.csrf
		    },
		    'onComplete': function(response){	
		        $('.lane-drawer-avatar')
		        	.load(function(){$('#avatar-loader').removeClass('avatar-loader');})
		        	.attr('src',$('.lane-drawer-avatar').attr('src')+'?time=' + new Date());
		    },
		    'onStart': function() {
				$('#avatar-loader').addClass('avatar-loader');
		    }
		});
		
	
		
		$('#lane-title-input')
			.alphanumeric({ichars:'#/?%\+:!'})
			.keypress(function(e){
				var $this = $(this);

				if(e.which == 58||e.which == 43||e.which == 35||e.which == 63||e.which == 47||e.which == 37||e.which == 92||e.which == 33){
					$('#lane-title-input').tipsy({trigger:'manual',gravity:'w',fallback:$.i18n.t('Lane titles cannot contain the following characters # % ? / \ + ! :')}).tipsy('show');
				}
			})
			.blur(function(){
				$('#lane-title-input').tipsy('hide');
			});
		
	},
	
	addEditView:function(){
	
		var that = this;
		
		//show loader open drawer
		this.showDrawerLoader();
		_.delay($.proxy(this.openDrawer,this), 1000);
		
		var getfriendList = function(){return $.ajax({url: '/friends/all'});};

		$.when(getfriendList())
			.done(function(friends){	
				
				var currentLane = m.currentLane;
				var avaContribsSorted = _.sortBy(
					currentLane.available_contributors,function(prop){return prop.first_name ? prop.first_name.toLowerCase():null}
				);
				currentLane.available_contributors = avaContribsSorted;
					
				var html = $.tmpl(that.templates.drawerEdit,{
					laneInfo:currentLane,
					ser:m.currentLane.available_services,
					keywords:m.currentLane.keywords
				}).html();
						
				that.hideDrawerLoader();
				that.showDrawerContent();
				
				that.$drawerContent
					.after(that.templates.saveLaneAction)
						.find('.jspPane')
						.append(html)
					.end()
					.height(that.$drawerContent.height() - 43)
					.data('jsp').reinitialise();
		
			//setup events for edit view
						
			$('#cancel-lane-edit').bind(m.clickOrTouchStart,function(){
				that.saveLane();
				return false;
			});
			
					
			$('#lane-edit-delete').bind(m.clickOrTouchStart,function(){
				that.removeLaneDialog();
				return false;
			});
			
			//setup jquery calendar widget & check all/uncheck all
			that.setupEditViewAndNewViewEvents();
			that.setupAllDrawerViews();
			
			$('#lane-contrib-list li').bind('click',function(e){
				if($(e.target).is('input')){
					that.contributorToggle(e.target);
				}else{
					$checkbox = $(this).find('input');
					$checkbox.prop('checked') ? $checkbox.prop('checked',false) : $checkbox.prop('checked',true);	
					that.contributorToggle($checkbox);
				}
			});
			
			that.$drawer.delegate('#streaming-services input','click',function(e,elm){
					that.serviceCheckboxToggle(this);
					//if we passed in elm its not a direct checkbox click
					if(elm){return false;}
			});
			
			$('#laneKeywordFilters').alphanumeric({ichars:"'!#¤%&@£()\":|&$,"}).textext({
				plugins : 'tags prompt',
				tagsItems : m.currentLane.keywords,
				prompt : 'Add keyword, hit enter'
			});
		
		});
			
	
	},
	
	removeLaneDialog:function(){
		var $dialog = $.tmpl(m.globalTemplates.dialogs.removeLane, {title:m.currentLane.title});
		
		// user clicks to confirm removal
		$dialog.find('.removeConfirm').bind(m.clickOrTouchEnd, function(e){
			$.ajax({
			type: 'delete',
			url: '/lanes/'+ m.currentLane.id,
			success: function() {
				win.location.href = '/'+m.currentUser.username
			}
			});
			return false;
		});
		
		$dialog.lightbox_me({
			centered: true
		});
	},
	
	removeMyContribDialog:function(){
		var $dialog = $.tmpl(this.templates.removeLaneContrib, {title:m.currentLane.title});
		
		// user clicks to confirm removal
		$dialog.find('.removeConfirm').bind(m.clickOrTouchEnd, function(e){
			$.ajax({
			type: 'delete',
			url: '/lanes/contributor',
			data : {lane_id:m.currentLane.id,username:m.currentUser.username},
			success: function() {
				win.location.reload();
			}
			});
			return false;
		});
		
		$dialog.lightbox_me({
			centered: true
		});
	},
	
	addLaneView:function(){
	
		var that = this;
			
		this.showDrawerLoader();
		
		if(this.urlHashObject.drawer === 'open'){
			_.delay($.proxy(this.openDrawer,this), 1000);
		}
		
		var currentLane = m.currentLane;
		var avaContribsSorted = _.sortBy(
			currentLane.available_contributors,function(prop){return prop.first_name ? prop.first_name.toLowerCase():null}
		);
		currentLane.available_contributors = avaContribsSorted;
							
		var html = $.tmpl(this.templates.drawerView,m.currentLane).html();
				
		//if you are the owner, add edit button
		if(this.currentUserIsOwner){
			this.$drawerContent.height(this.$drawerContent.height() - 43);
			this.$drawerContent.after(this.templates.editLaneAction);	
		}
			
		//if you are not owner but a contributor add button to remove yourself	
		if(!this.currentUserIsOwner && this.currentUserIsContributor){ //if you are just contributor
			this.$drawerContent.height(this.$drawerContent.height() - 43);
			this.$drawerContent.after(this.templates.removeContribAction);
		}
		
		this.hideDrawerLoader();
		this.showDrawerContent();
		
		this.$drawerContent
			.find('.jspPane')
			.append(html)
			.end()
			.data('jsp').reinitialise();
			
		//setup events for lane view
		
		$('#drawer-edit-lane-link').bind(m.clickOrTouchStart,function(e){
			that.hideDrawerContent();
			that.$drawerContent.height(that.$drawerContent.height() + 43).find('.jspPane').empty();
			$('#drawer-actions').remove();
			that.addEditView();
			m.utilities.urlHash.go(m.utilities.urlHash.set('drawer=edit'));
			return false;
		});	
		
				
		$('#remove-my-memos-link').bind(m.clickOrTouchStart,function(){
			that.removeMyContribDialog();
			return false;
		});	
		
		that.setupAllDrawerViews();
		
	},
	
	showDrawerLoader:function(){
		this.$drawer.addClass('small-loader-on-grey');
	},
	
	hideDrawerLoader:function(){
		this.$drawer.removeClass('small-loader-on-grey');
	},
	
	hideDrawerContent:function(){
		this.$drawerContent.addClass('visibility-hidden');
	},
	
	showDrawerContent:function(){
		this.$drawerContent.removeClass('visibility-hidden');
	},
	
	openDrawer:function(){
		if(this.drawerIsOpen){return;}
		this.drawerIsOpen = true;
		this.$headerLaneTitle.hide();
		$('#screenLeftBtn,#screenRightBtn').trigger('mouseout');
		this.$screenLeftBtn.stop().animate({left:this.$drawer.outerWidth()},400,'easeOutCubic');
		this.$drawer.stop().animate({left:'0'},400,'easeOutCubic');
		this.$slotLoaderLeft.stop().animate({left:this.$drawer.outerWidth()},400,'easeOutCubic');
		$('#openMemo').length ? m.memos.rePositionOpenedMemo() : 0;
		this.$drawerHandlerIcon.animate({rotate: '+=180deg'}, 500);
	},

	closeDrawer:function(closeSpeed,hollerBack,elemClicked){
		var closeSpeed = closeSpeed || 200;
		var arrowRotateSpeed = Modernizr.sessionstorage ? sessionStorage.getItem("drawerAware")?0:500 : 0;
		this.drawerIsOpen = false;
		this.$headerLaneTitle.show();
		this.$screenLeftBtn.stop().animate({left:'0px'},200,'easeOutCubic');
		this.$slotLoaderLeft.stop().animate({left:0},200,'easeOutCubic');
		this.$drawer
			.stop()
			.animate({left:-this.$drawer.outerWidth()},closeSpeed,'easeOutCubic',hollerBack||jQuery.noop());
		$('#openMemo').length ? m.memos.rePositionOpenedMemo() : 0;
		this.$drawerHandlerIcon.animate({rotate: '-=180deg'}, arrowRotateSpeed);
		if($(elemClicked).is('#lane-drawer-tab') || $(elemClicked).closest('#lane-drawer-tab').length === 1){
			win.location.hash = '';
		}
	},
	
	onClickOrTouchStart:function(e){
		this.drawerIsOpen ? this.closeDrawer(200,null,e.target) : this.openDrawer();
		return false;
	},
	
	templates : {
	
		drawerView : 
			 '<div>'
			+'<div class="lane-drawer-spacing">'
			+'<img src="${avatar}" alt="laneDrawerAvatar" width="37" height="37" class="lane-drawer-avatar" />'
			+'<h2 class="header lane-drawer-title">${title}</h2>'
			+'<p class="lane-drawer-description clearfix">${description}</p>'
			+'</div>'
			+'<div class="lane-drawer-section">'
			+'	<div class="lane-drawer-section-title">'+$.i18n.t('Memo sources:')+' <a href="#" id="laneContribCopy" class="more-info-icon">more info</a></div>'
			+'</div>'
			+'{{if _.any(available_contributors, function(prop){return prop.selected === true})}}'
			+'<ul id="memos-from" class="{{if _.filter(available_contributors,function(o){return o.selected}).length > 2}}hideContribList{{/if}}">'
			+'  {{each available_contributors}}'
			+'  {{if $value.selected}}'
			+'	<li>'
			+'		<a href="/${username}" title="view dashboard">'
			+'      {{if role === "owner"}}'
			+'			<div class="lane-owner-icon">owner</div>'
			+'		{{else}}'
			+'      	{{if m.currentUser && m.currentUser.username === username}}'
			+'				<div class="lane-you-icon">you</div>'
			+'      	{{/if}}'				
			+'      {{/if}}'
			+'		<img src="/${username}/image" alt="topBarAvatar" width="20" height="20" /><span class="memos-from-name">${full_name}<span class="memos-from-username">(${username})</span></span>'		
			+'		</a>'
			+'	</li>'
			+'	{{/if}}'
			+'  {{/each}}'
			+'</ul>'
			+'{{if _.filter(available_contributors,function(o){return o.selected}).length > 2}}'
			+	'<a href="#" id="showContribsToggle"><span id="contribsClosed">'+$.i18n.t('… Show more')+'</span><span id="contribsOpen" class="display-none">'+$.i18n.t('Hide')+'</span></a>'
			+'{{/if}}'
			+'{{else}}'
			+'<div class="lane-drawer-spacing">'
			+'<div class="drawer-add-txt"><strong>'+$.i18n.t('This lane has no contributors.</strong> If you are the owner of this lane click \"Edit this lane\" below to add contributors.')+'</div>'
			+'</div>'
			+'{{/if}}'
			
			+'<div class="lane-drawer-section">'
			+'	<div class="lane-drawer-section-title">'+$.i18n.t('Memo filters:')+'</div>'
			+'</div>'
			+'<div class="lane-drawer-spacing">'
			
			+'{{if keywords.length !== 0 &&  visible_memos !== 0}}'
			+'<div class="lane-drawer-section-label">'+$.i18n.t('Keyword filters:')+'</div>'
			+'<ul class="keywordFilterList">'
			+'  {{each keywords}}'
			+'		<li>'
			+'			${$value}'
			+'		</li>'
			+'  {{/each}}'
			+'</ul>'
			+'{{/if}}'
			
			+'{{if visible_memos !== 0 }}'
			+'	{{if _.any(available_services,function(i){return i.selected}) }}'
			+'	<div class="lane-drawer-section-label">'+$.i18n.t('Services on this lane:')+'</div>'
			+'	<ul class="services-used" style="margin:7px 0 5px 0;">'
			+'  {{each available_services}}'
			+'  {{if $value.selected}}'
			+'		<li title="${$value.service}" class="services-used-${$value.service}">'
			+'			${$value.service}'
			+'		</li>'
			+'	{{/if}}'
			+'  {{/each}}'
			+'	</ul>'
			+'	{{/if}}'
			
			+'<div class="lane-drawer-section-label">'
			+	$.i18n.t('Date range:') 
			+'</div>'
			
			+'<div class="lane-drawer-date-range clearfix">'
			+'	<div class="lane-drawer-date-range-txt"><strong>${m.utilities.dateFormat(first_memo*1000,"UTC:mmmm d, yyyy")}</strong> to <strong>${m.utilities.dateFormat(last_memo*1000,"UTC:mmmm d, yyyy")}</strong></div>'
			+'</div>'
			+'{{else}}'
			+'<div class="drawer-add-txt"><strong>'+$.i18n.t('This lane contains no memos.</strong> If you are the owner of this lane try adjusting the streaming services (click \"Edit this lane\" below ) or add memos individually. If you are a contributor try adding memos individually by opening a memo and click the [+] button.')+'</div>'
			+'{{/if}}'
			
			+'</div>'
			+'</div>',
			
		drawerEdit :
			 '<div>'
			+'<div class="lane-drawer-spacing">'
			+'<img src="${m.utilities.breakURLCache(laneInfo.avatar)}" alt="laneDrawerAvatar" width="37" height="37" class="lane-drawer-avatar" />'
			+'<div id="avatar-loader"></div>'
			+'<div id="avatar-button">'
			+'<a href="#" id="add-edit-lane-avatar">'+$.i18n.t('change','change lane avatar lane')+'</a>'
			+'<input type="file" name="img_raw" class="lane-upload-input-file" width:"5px" />'
			+'</div>'
			+'<input type="text" class="display-block float-right" id="lane-title-input" style="width:187px;margin-bottom:5px;" value="${laneInfo.title}" placeholder="'+$.i18n.t('Enter name of lane')+'" />'
			+'<textarea class="display-block float-right" id="lane-descrip-input" rows="5" placeholder="'+$.i18n.t('Enter lane description')+'" style="width:187px">${laneInfo.description}</textarea>'
			+'</div>'
			+'<div class="lane-drawer-section">'
			+'	<div class="lane-drawer-section-title">'+$.i18n.t('Memo sources:')+' <a href="#" id="laneContribCopy" class="more-info-icon">more info</a><a href="#" class="float-right lane-drawer-add-frends addFriends" >Add Friends</a></div>'
			+'</div>'
			+'<ul id="lane-contrib-list" class="{{if laneInfo.available_contributors.length > 2}}hideContribList{{/if}}">'
			+'{{each laneInfo.available_contributors}}'
			+'	<li>'	
			+'		<img src="/${username}/image" width="20" height="20" /><input type="checkbox" {{if $value.selected }}checked="checked"{{/if}} data-username="${$value.username}" /><span class="lane-contrib-list-name">${full_name} <span class="lane-contrib-list-username">(${username})</span></span>'
			+'	</li>'
			+'{{/each}}'
			+'</ul>'
			+'{{if laneInfo.available_contributors.length > 2}}'
			+	'<a href="#" id="showContribsToggle"><span id="contribsClosed">'+$.i18n.t('… Show more')+'</span><span id="contribsOpen" class="display-none">'+$.i18n.t('Hide')+'</span></a>'
			+'{{/if}}'
			+'<div class="lane-drawer-section">'
			+'	<div class="lane-drawer-section-title">'+$.i18n.t('Memo filters:')+'</div>'
			+'</div>'
			+'<div class="lane-drawer-spacing">'	
			+'<div class="lane-drawer-section-label">'+	$.i18n.t('Only show memos with these keywords:')+'</div>'
			+'<div style="width:255px"><textarea data-keywords="${keywords.join(",")}" id="laneKeywordFilters" style="width:255px" rows="1"></textarea></div>'		
			+'<div class="lane-drawer-section-label">'
			+$.i18n.t('Services to stream:')+' <span class="all-none-checkbox"> <a href="#" class="check-all-checkbox">'+$.i18n.t('all','select all')+'</a> | <a href="#" class="uncheck-all-checkbox">'+$.i18n.t('none','select none')+'</a></span>'
			+'</div>'
			+'{{tmpl m.drawer.templates.drawerNewServList}}'	
			+'<div class="lane-drawer-section-label">'
			+$.i18n.t('Start streaming date:')
			+'</div>'
			+'<div class="streaming-date-range">'
			+'	<div id="stream-start-date">'
			+'	<div class="calendar-icon"></div>'
			+'		<input type="text" id="lane-input-start-date" value="{{if laneInfo.bounds.from}}${m.utilities.dateFormat(laneInfo.bounds.from*1000,"shortDateWithZero")}{{/if}}" data-date="{{if laneInfo.bounds.from}}${m.utilities.dateFormat(laneInfo.bounds.from*1000,"shortDateWithZero")}{{/if}}" class="lane-input-date" /><div class="stream-date-txt">'+$.i18n.t('Leave empty to stream as far back as the content goes.')+'</div>'
			+'	</div>'
			+'</div>'			
			+'<div class="lane-drawer-section-label">'
			+$.i18n.t('End streaming date:')
			+'</div>'		
			+'<div class="streaming-date-range">'
			+'	<div id="stream-end-date">'
			+'		<div class="calendar-icon"></div>'
			+'		<input type="text" id="lane-input-end-date" class="lane-input-date" value="{{if laneInfo.bounds.to}}${m.utilities.dateFormat(laneInfo.bounds.to*1000,"shortDateWithZero")}{{/if}}" data-date="{{if laneInfo.bounds.to}}${m.utilities.dateFormat(laneInfo.bounds.to*1000,"shortDateWithZero")}{{/if}}" /> <div class="stream-date-txt">'+$.i18n.t('Leave empty to stream continuously forever and ever.')+'</div>'
					+'<div style="clear:both;height:1px;"></div>'
			+'	</div>'
			+'</div>'	
			+'</div>'
			+'</div>',
			
		drawerNew :
			 '<div>'
			+'<div class="lane-drawer-spacing">'
			+'<img src="${m.utilities.breakURLCache(avatar)}" alt="laneDrawerAvatar" width="37" height="37" class="lane-drawer-avatar" />'
			+'<div id="avatar-loader"></div>'
			+'<div id="avatar-button">'
			+'<a href="#" id="add-edit-lane-avatar">'+$.i18n.t('change','change lane avatar lane')+'</a>'
			+'<input type="file" name="img_raw" class="lane-upload-input-file" />'
			+'</div>'
			+'<input type="text" class="display-block float-right" id="lane-title-input" style="width:187px;margin-bottom:5px;" placeholder="'+$.i18n.t('Enter name of lane')+'" />'
			+'<textarea class="display-block float-right" id="lane-descrip-input" rows="5" style="width:187px" placeholder="'+$.i18n.t('Enter lane description')+'"></textarea>'
			+'</div>'
			+'<div class="lane-drawer-section">'
			+'	<div class="lane-drawer-section-title">'+$.i18n.t('Memo sources:')+' <a href="#" id="laneContribCopy" class="more-info-icon">more info</a><a href="#" class="float-right lane-drawer-add-frends addFriends" >Add Friends</a></div>'
			+'</div>'
			+'<ul id="lane-contrib-list" class="{{if contr.length > 2}}hideContribList{{/if}}">'
			+'  {{each contr}}'
			+'	<li>'	
			+'		<img src="/${$value.username}/image" width="20" height="20" /><input type="checkbox" {{if $value.selected }}checked="checked"{{/if}} data-username="${$value.username}" /><span class="lane-contrib-list-name">${$value.full_name} <span class="lane-contrib-list-username">(${$value.username})</span></span>'
			+'	</li>'
			+'  {{/each}}'
			+'</ul>'
			+'{{if contr.length > 2}}'
			+	'<a href="#" id="showContribsToggle"><span id="contribsClosed">'+$.i18n.t('… Show more')+'</span><span id="contribsOpen" class="display-none">'+$.i18n.t('hide')+'</span></a>'
			+'{{/if}}'
			+'<div class="lane-drawer-section">'
			+'	<div class="lane-drawer-section-title">'+$.i18n.t('Memo filters:')+'</div>'
			+'</div>'
			+'<div class="lane-drawer-spacing">'
			+'<div class="lane-drawer-section-label">'+	$.i18n.t('Only show memos with these keywords:')+'</div>'
			+'<div style="width:255px"><textarea id="laneKeywordFilters" style="width:255px" rows="1"></textarea></div>'			
			+'<div class="lane-drawer-section-label">'
			+$.i18n.t('Services to stream:')+' <span class="all-none-checkbox"> <a href="#" class="check-all-checkbox">'+$.i18n.t('all','select all')+'</a> | <a href="#" class="uncheck-all-checkbox">'+$.i18n.t('none','select none')+'</a></span>'
			+'</div>'
			+'{{tmpl m.drawer.templates.drawerNewServList}}'		
			+'<div class="lane-drawer-section-label">'
			+$.i18n.t('Start streaming date:')
			+'</div>'
			+'<div class="streaming-date-range">'
			+'	<div id="stream-start-date">'
			+'	<div class="calendar-icon"></div>'
			+'		<input type="text" id="lane-input-start-date" value="" data-date="" class="lane-input-date" /><div class="stream-date-txt">'+$.i18n.t('Leave empty to stream as far back as there is content.')+'</div>'
			+'	</div>'
			+'</div>'
			+'<div class="lane-drawer-section-label">'
			+$.i18n.t('End Streaming date:')
			+'</div>'
			+'<div class="streaming-date-range">'
			+'	<div id="stream-end-date">'
			+'		<div class="calendar-icon"></div>'
			+'		<input type="text" id="lane-input-end-date" class="lane-input-date" value="" date-date="" /> <div class="stream-date-txt">'+$.i18n.t('Leave empty to stream continuously forever and ever.')+'</div>'
			+'	</div>'
			+	'<div style="clear:both;height:1px;"></div>'
			+'</div>'
			+'</div>',
			
		drawerNewServList :
			 '<ul id="streaming-services" class="clearfix">'
			+'{{if ser.length}}'
			+'  {{each ser}}'
			+'	<li>'
			+'		<label title="${$value.service}"><input data-service-name="${$value.service}" type="checkbox" {{if $value.selected }}checked="checked"{{/if}} /><div class="${$value.service}-icon service-icon">${$value.service}</div></label>'
			+'  {{/each}}'
			+'{{else}}'
			+'		<li id="streaming-services-nonselected">'+$.i18n.t('Choose (above) at least one contributor.')+'</li>'
			+'{{/if}}'
			+'</ul>',
			
		removeLaneContrib:
			'<div id="" class="memolaneDialog">'
			+'	<div class="dialogTopBar">'
			+'		<div class="dialogTitle">'+$.i18n.t('Remove Lane Contributions')+'</div>'
			+'		<div class="close closeMemolaneDialog cancelAddingBtn">'+$.i18n.t('cancel','close dialog')+'</div>'
			+'		<div class="clearFloatNoHeight"></div>'
			+'	</div>'
			+'	<div class="dialogContent">'
			+'		<p><strong>'+$.i18n.t('Are you sure you want to remove your contributions to')+' ${title}</strong>?</p>'
			+'		<p>'+$.i18n.t('All memo contributions will be lost, and any work you\'ve put into curating this lane will be permanently erased!')+'</p>'
			+'		<p><a href="#" class="btn-red float-left removeConfirm close">'+$.i18n.t('Yes, REMOVE')+'</a> <a href="#" class="secondaryAction float-left close">'+$.i18n.t('No, I don\'t want that')+'</a></p>'
			+'	</div>'
			+'</div>',
			
		editLaneAction:'<div id="drawer-actions"><div class="gear-icon float-left"></div><a href="#" id="drawer-edit-lane-link">'+$.i18n.t('Edit this lane')+'</a></div>',
		
		removeContribAction:'<div id="drawer-actions"><div class="delete-icon float-left"></div><a href="#" id="remove-my-memos-link">'+$.i18n.t('Remove myself and my memos from this lane')+'</a></div>',
		
		saveLaneAction:'<div id="drawer-actions"><a href="#" class="btn-green" id="cancel-lane-edit">'+$.i18n.t('Done editing')+'</a><a href="#" id="lane-edit-delete">'+$.i18n.t('Delete Lane')+'</a></div>',
		
		createLaneAction: '<div id="drawer-actions"><button class="btn-green float-left" id="create-new-lane-btn">'+$.i18n.t('Done','done editing lane from drawer')+'</button><div id="cancel-lane-creation">'+$.i18n.t('or never mind <a href=\"#\">delete</a> this lane</div></div>')
		
	}
	
};}(this,jQuery,this.undefined);

m.drawer.initialize();
