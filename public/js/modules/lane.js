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

m.lane = function(win,$,undefined){return{

	/*  static  */
	$laneViewport:$('#lane-viewport'),
	$lane:$('#lane'),
	$content:$('#content'),
	$screenLeftBtn:$('#screenLeftBtn'),
	$screenRightBtn:$('#screenRightBtn'),
	$laneViewportAndLanNav:$('#lane-viewport,.screenBtn'),
	currentlyCenteredLaneMemoTime:'',
	cancelLaneMovement:false,
	
	/*  initialize module  */
	initialize:function(){
	
		//setup events... mouse start, move, finish, and wheel to the lane
		this.$laneViewport
			.bind(m.mouseDownOrTouchStart,this.onMouseDownOrTouchStart)
			.bind(m.mouseUpOrTouchEnd ,this.onMouseUpOrTouchEnd)
			.bind(m.mouseMoveOrTouchMove,$.proxy(this.onMouseMoveOrTouchMove,this))
			.bind('mouseleave',this.onMouseUpOrTouchEnd)
			.mousewheel($.proxy(this.onMouseWheel,this));
		
		//setup lane fav func
		$('#follow-unfollow')
			.bind(m.clickOrTouchStart,this.followUnFollowLane)
			.hover(function(){
				if($(this).data('fav') === true){
				$(this).addClass('unfollowed').find('span').text($.i18n.t('Unfollow lane'));
				}
			},function(){
				if($(this).data('fav') === true){
				$(this).removeClass('unfollowed').find('span').text($.i18n.t('Following lane'));
				}
			});
			
		$('#lane-followers').bind(m.clickOrTouchStart,this.whoFollowedLane);
		
		//setup embed lane func
		
		$('#embed-lane a').bind(m.clickOrTouchStart,this.embedLane);
		
		
	},
	
	/*  methods  */
	
	//this is a method used to move the lane, params are {xpos: and animate[boolean]}
	moveLane:function(options){ 
		if(this.cancelLaneMovement === true){return false};
		var that = this;
		if(options.animate){//animate lane navigation
			this.cancelLaneMovement = true;
			this.$laneViewport.stop().animate({scrollLeft:options.xpos},1000,'easeOutCubic',function(){
				that.moveLaneComplete();
			});
		}else{//simply move to lane locaion with no animation
			this.$laneViewport.scrollLeft(options.xpos);
			this.moveLaneComplete();
		}
		this.updateCurrentlyCenteredLaneMemoTime();
		// update timeline indicator
		m.timeline.showFixedIndicatorByTimestamp();
	},
	
	moveLaneComplete:function(){
		m.memos.closeOpenedMemoWhenOffScreen();//close open memo if off screen
		this.loadMoreMemos();
		this.updateCurrentlyCenteredLaneMemoTime();
		// update timeline indicator
		m.timeline.showFixedIndicatorByTimestamp();
		this.onLaneEndRemoveNavBtn();
		this.cancelLaneMovement = false;
	},
	
	moveLaneToMemo:function(memoId){
	
		var $memo = $('#'+memoId);
		var memoOffSet = $memo.offset().left;
		
		if(memoOffSet<0){
			memoOffSet = this.$laneViewport.scrollLeft() - Math.abs(memoOffSet);
		}else{
			memoOffSet = this.$laneViewport.scrollLeft() + memoOffSet;
		}
		
		var memoXPositionCentered = Math.round(memoOffSet - (($('#lane-viewport').width()/2)-100));
		
		this.moveLane({xpos:memoXPositionCentered});

	},
	
	updateCurrentlyCenteredLaneMemoTime:function(){
		var that = this;
	
		$('.memo').each(function(){
			
			var memoOffSet = $(this).offset().left;
			
			if(memoOffSet<0){
				memoOffSet = that.$laneViewport.scrollLeft() - Math.abs(memoOffSet);
			}else{
				memoOffSet = that.$laneViewport.scrollLeft() + memoOffSet;
			}
			
			if(memoOffSet >= $('#lane-viewport').scrollLeft() + $('#lane-viewport').width()/2){
				that.currentlyCenteredLaneMemoTime = $(this).data('time');
				return false;
			}

		});
	
	},
	
	trimLaneLeft:function(){
	
		/*the amount of pixels away from the left or right edge of screen a slot has to be to start removing slots...this should be very large as we don't want to remove our preloaded slots*/
	var viewportWidth = $('#lane-viewport').width(),
		distance = viewportWidth*3,
		widthToRemoveLeft = 0;
		
		//remove slots from left side of lane
		$('#lane .lane-slot').each(function(){
			var $this = $(this);
			if($this.offset().left < 0){
				if(Math.abs($this.offset().left) > distance && $this.width() < (distance-viewportWidth)){
					$this.addClass('removeSlot');
					widthToRemoveLeft += $this.width();
				}
			}
		
		});
		
		if(widthToRemoveLeft > 0){//if a slot is far enough away remove it
		
			var laneWidthRightNow = this.$laneViewport.scrollLeft();
		
			$('.removeSlot').remove();

			this.$lane.width($('#lane').width()-widthToRemoveLeft);

			this.$laneViewport.scrollLeft(laneWidthRightNow-widthToRemoveLeft);
			
		}
		//console.log(widthToRemoveLeft);		
	},
	
	trimLaneRight:function(){
	
		/*the amount of pixels away from the left or right edge of screen a slot has to be to start removing slots...this should be very large as we don't want to remove our preloaded slots*/
	
		var viewportWidth = $('#lane-viewport').width(),
			distance = viewportWidth*3,
			widthToRemoveRight = 0;

		
		//remove slots from right side of lane
		$('#lane .lane-slot').each(function(){
			var $this = $(this);
			if($this.offset().left > distance && $this.width() < (distance-viewportWidth)){
				$this.addClass('removeSlot');
				widthToRemoveRight += $this.width();
			};
		
		});
		
		if(widthToRemoveRight > 0){//if a slot is far enough away remove it
			$('.removeSlot').remove();
			this.$lane.width($('#lane').width()-widthToRemoveRight);
		}	
		//console.log(widthToRemoveRight);		
	},
	
	loadMoreMemos:function(){
		var viewport = $('#lane-viewport');

		var firstMemo = parseInt($('#content .memo').first().data('time'));
		var lastMemo = parseInt($('#content .memo').last().data('time'));
		
		if(firstMemo != m.currentLane.first_memo){ // don't load more if we are at end
			/*how far away from the left should we start loading, if you change the *# you have to change it in the laneLoadMemos.js file as well because I remove interval if you go back the other way after kicking off a left loader*/
			if(viewport[0].scrollLeft < (viewport.width()*2)){
					//we are at the end (left)...so load more...
					m.laneLoadMemos.loadMemosLeft();
				
			}
		}

		if(lastMemo != m.currentLane.last_memo ){ //don't load more if we are at end
			/*how far away from the right should we start loading, if you change the *# you have to change it in the laneLoadMemos.js file as well because I remove interval if you go back the other way after kicking off a left loader*/
			if((viewport[0].scrollWidth - viewport[0].scrollLeft) < (viewport.width()*2)){
					//we are at the end (right)...so load more...
					m.laneLoadMemos.loadMemosRight();
				
			}
		}
		
	},
		
	onMouseDownOrTouchStart:function(e){
	
		//cancel if the user is dragging over an open memo
		if($(e.target).closest('.openMemo').length){return};
		//if touch device setup event object
		if(e.originalEvent.touches || e.originalEvent.changedTouches){
			var eTouch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
		}
		
		$(this)
			.data('down', true)
			.data('x', (e.pageX || eTouch.pageX))
			.data('scrollLeft', this.scrollLeft)
			.data('currentMouseX',e.pageX || eTouch.pageX)
			.data('currentMouseY',e.pageY || eTouch.pageX)
			.css('cursor','ew-resize');
		
		//don't let the browser kick off default drag stuff...
		e.preventDefault();
	},
	
	onMouseUpOrTouchEnd:function(e){
		$('#lane-viewport').data('down', false).css('cursor','default');
		$('.memo').css('cursor','pointer');
		win.setTimeout(function(){$('#lane-viewport').data('drag', false)},100);
		//don't let the browser kick off default drag stuff...
		
		//why the hell not
		e.stopPropagation();
	},
	
	onMouseMoveOrTouchMove:function(e){
		var $this = $(e.currentTarget);
		
		if(e.originalEvent.touches || e.originalEvent.changedTouches){
			var eTouch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
		}

		if(this.$laneViewport.data('down') === true){
		
			//make sure we move more than 5px before we assume user wants to drag
			var Xdiff = e.pageX - $this.data('currentMouseX');
			var Ydiff = e.pageY - $this.data('currentMouseY');
			var XYdiff = Math.abs(Xdiff) + Math.abs(Ydiff);
			if(XYdiff > 5){
				this.$laneViewport.data('drag',true);//dragging so cancel opening memo
				$('.memo').css('cursor','ew-resize');
			};
			
			//call moveLane func
			this.moveLane({
				xpos:$this.data('scrollLeft') + $this.data('x') - (e.pageX || eTouch.pageX)
			});
		}
		
		return false;
	},
	
	onMouseWheel:function(e,delta){
		if(this.cancelLaneMovement === true){return;}
		if($(e.target).closest('.openMemo').length === 1){
			return;
		}else{
			m.lane.moveLane({
				xpos:e.currentTarget.scrollLeft -= (delta * 30)
			});
		}
	},
	
	onLaneEndRemoveNavBtn:function(){
		this.$laneViewport.scrollLeft() === 0 
			? this.$screenLeftBtn.hide() 
			: this.$screenLeftBtn.show();
			
		(this.$laneViewport.scrollLeft()+this.$laneViewport.width()) === $('#lane').width() || $('#lane').width() < this.$laneViewport.width()
			? this.$screenRightBtn.hide() 
			: this.$screenRightBtn.show();		
	},
	
	stretchSlot:function(){
		var laneWidth = $('#lane').width();
		if(laneWidth <= this.$laneViewport.width()){
			$('#lane').width(this.$laneViewport.width());
			var $slot = $('#lane .lane-slot').filter(":last").find('.lane-slot-memos');
			$slot.width((this.$laneViewport.width()-laneWidth)+$slot.width());
		}		
	},
	
	hideLane:function(){
		this.$laneViewportAndLanNav.css('visibility','hidden');
	},
	
	showLane:function(){
		this.$laneViewportAndLanNav.css('visibility','visible');
	},
	
	hideLaneLoader:function(){
		this.$content.removeClass('lane-load');
	},
	
	showLaneLoader:function(){
		this.$content.addClass('lane-load');
	},
	
	followUnFollowLane:function(){
		var $this = $(this);
		var $currentFollowerCount = $this.next('a').find('span');
		if($this.data('fav') === false){

			$.ajax({
				url: '/lanes/favorite',
				type : 'POST',
				data: {
						lane_id:m.currentLane.id
					}
			}).success(function(data){
				$this.attr('title',$.i18n.t('Unfollow lane')).data('fav',true);
				$this.addClass('followed').find('span').text('Following lane');

				var count = Number($currentFollowerCount.text());

				if(count === 0){	
					$this.next('a').css('visibility','visible');
					//$this.next('a').show();
					$currentFollowerCount.text('1');
				}
				
				$currentFollowerCount.text(''+(++count));
				
				
				
			})
	
		}else{
		
			$.ajax({
				url: '/lanes/favorite',
				type : 'DELETE',
				data: {
						lane_id:m.currentLane.id
					}
			}).success(function(data){
				$this.attr('title',$.i18n.t('Follow Lane')).data('fav',false);
				$this.removeClass('followed unfollowed').find('span').text('Follow lane');
				
				var count = Number($currentFollowerCount.text());
				
				$currentFollowerCount.text(''+(--count));
				
				if(count === 0){
					$this.next('a').css('visibility','hidden');
					//$this.next('a').hide();
				}else{
					$this.next('a').css('visibility','visible');
				}
			
				
			})
		}
		return false;
	},
	
	whoFollowedLane:function(){
	
		$.ajax({
			url:'/lanes/favorited_by',
			cache:false,
			type:'GET',
			data: {'lane_id':m.currentLane.id}
		}).success(function(data){	
		
			var followed = {followed:data}
			// show dialog w/ loader
			var $dialog = $.tmpl( m.globalTemplates.dialogs.whoFollowedLanesDialog, followed,{dialogTitle:$.i18n.t('Users who followed this lane')} );
			
			// fire dialog
			
			$dialog.lightbox_me({
				destroyOnClose: true
			});
		});	
		return false;
	}
	
};}(this,jQuery,this.undefined);

m.lane.initialize();