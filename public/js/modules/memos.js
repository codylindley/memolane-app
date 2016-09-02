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

m.memos = function(win,$,undefined){return{

	/*  statics  */
	$memo:$('.memo'),
	$laneViewport:$('#lane-viewport'),
	openMemoCommentsOnPageLoad:m.utilities.urlHash.get('showcomments'),
	memoStore:{},
	
	
	/*  initialize module  */
	initialize:function(){
		// setup events for memos
		this.$laneViewport.delegate('.memo', m.clickOrTouchEnd, $.proxy(this.openMemo, this));
		this.$laneViewport.delegate('.closeOpenMemo', m.clickOrTouchEnd, $.proxy(this.closeMemo, this));
		this.$laneViewport.delegate('.memoAvatar', m.clickOrTouchEnd, $.proxy(this.goToMemoOwnersDashboard, this));
		
		// setup events for specific types of memos or memo actions
		this.$laneViewport.delegate('.music-play-btn', m.clickOrTouchEnd, $.proxy(this.handleMusicClick, this));
	},
	
	
	/*  methods  */
	goToMemoOwnersDashboard:function(e){
		e.stopPropagation();
	},
	
	
	openMemo:function(e){
		var that = this;
		
		// if the viewport is being dragged more than 5px, cancel openMemo
		if (this.$laneViewport.data('drag')) {
			this.$laneViewport.data('drag',false);
			return false;
		}

		var $oldOpenMemo = $('.openMemo');

		// if a memo is open, tag it with new class and animate it closed
		if ($oldOpenMemo.length) {
			
			$('.largeMemoDialog .close').click();
			
			var dataFromOpenMemo = $oldOpenMemo.data('memoOpenInfo');
			
			$oldOpenMemo.add('.memoGhost').addClass('memoClosing');
			
			if (_.size(dataFromOpenMemo)) {
				$('.memoClosing')
					.animate({
						height:dataFromOpenMemo.memoH,
						width:dataFromOpenMemo.memoW,
						top:dataFromOpenMemo.memoY,
						left:dataFromOpenMemo.memoX
					}, 400,'easeInExpo',function(){
						dataFromOpenMemo.memo.css('visibility','visible');
						$(this).remove();
					});
			}
			else {
				$('.memoClosing').remove();
				// in case a memo is still hidden
				$('.memo').css('visibility','visible');
			}
		}
		
		
		// setup and run open memo code
		
		var elementEvented = e.currentTarget;
		var $elementEvented = $(elementEvented);
		
		var memoData = this.memoStore[ $elementEvented.attr('id') ];
		
		var templateToUse = this.templates.largeMemos[memoData.service] ? this.templates.largeMemos[memoData.service] : this.templates.largeMemos['default'];
		var $laneWithNewOpenMemo = this.$laneViewport.append( $.tmpl( templateToUse, memoData ) );
		var $newOpenMemo = $laneWithNewOpenMemo.find('.openMemo').filter(':last');
		
		
		// wire up memo actions
		var $footer = $('.openMemo:not(.memoClosing) .largeMemoFooterBar');
		
		$footer.find('.memo_privacy').bind( m.clickOrTouchEnd, function(e){
			that.setMemoPrivacyDialog( memoData );
			return false;
		});
		
		$footer.find('.memo_laneAdd').bind( m.clickOrTouchEnd, function(){
			that.addMemoToLaneDialog( memoData );
			return false;
		});
		
		$footer.find('.memo_laneRemove').bind( m.clickOrTouchEnd, function(){
			that.removeMemoFromLaneDialog( memoData );
			return false;
		});
		
		$footer.find('a.memo_like').bind( m.clickOrTouchEnd, function(e){
			that.likeOrUnlikeMemo( e, memoData );
			return false;
		}); 
		
		$footer.find('.memo_like_text').bind( m.clickOrTouchEnd, function(e){
			that.whoLikedIt(e,memoData);
			return false;
		});
		
		$footer.find('#changeMemoDate').bind( m.clickOrTouchEnd, function(e){
			that.changeMemoDate(e,memoData);
			return false;
		});	
		
		
		var availableH = $('#lane-viewport').height() - 20; // 20 is 10px on top & bottom, so open memo isn't touching timeline & shows a bit of the date bar
		var availableW = $('#lane-viewport').width(); // STILL NEED TO SUBTRACT OPENED DRAWER FROM THIS
		
		var openMemoWidth = $('.openMemo:not(.memoClosing)').outerWidth(true);
		var openMemoHeight = $('.openMemo:not(.memoClosing)').outerHeight(true);
		
		// make sure memo isn't wider than viewport
		if (openMemoWidth > availableW) {
			openMemoWidth = availableW;
			$('.openMemo:not(.memoClosing)').width( availableW ).css('max-width', availableW);
		}
		
		
		// render map memo specifics
		if ($newOpenMemo.find('.memoMapContainer').length) {
			this.handleMapMemos();
		}
		
		
		// render the different types of memos
		if ($('.openMemo:not(.memoClosing) .largeMemoContent img').length) {
			// wait for the image to load, so we can get the dimensions of it
			$('.largeMemoContent img').imagesLoaded( function() {
				if ($('.openMemo:not(.memoClosing) .lrgMemoImg').length) {
					that.renderMemoWithFittedImgDimensions( $elementEvented, availableH );
				}
				else {
					that.renderMemoDimensions( $elementEvented, availableH );
				}
			});
		}
		else {
			this.renderMemoDimensions( $elementEvented, availableH );
		}
	},
	
	whoLikedIt:function(e,memoData){
		$.ajax({
			url:'/memos/liked_by',
			cache:false,
            data: {'memo': memoData.id},
			type:'GET'
		}).success(function(data){		
			// show dialog w/ loader
			var $dialog = $.tmpl( m.globalTemplates.dialogs.genericListOfUsersDialog, data,{dialogTitle:$.i18n.t('Users who like this memo')} );
			
			// fire dialog
			
			$dialog.lightbox_me({
				destroyOnClose: true
			});
		});	
		return false;
	},
	
	changeMemoDate:function(e,memoData){
		win._gaq.push(['_trackEvent','date picker','open']);
		$('<div id="changeDateAndTimeDialog" class="memolaneDialog">'
			+'	<div class="dialogTopBar">'
			+'		<div class="dialogTitle">'+ $.i18n.t("Change memo date and time") +'</div>'
			+'		<div class="closeMemolaneDialog">'+ $.i18n.t("close", "clicking on this button closes the dialog window") +'</div>'
			+'		<div class="clearFloatNoHeight"></div>'
			+'	</div>'
			+'	<div class="dialogContent">'
			+'	<input type="text" id="memoDateInput" value="12-12-2011 11:23:01 PM" class="visibility-hidden" />'
			+'	<a href="#" id="saveMemoDateChange" class="btn-green">save</a>'
			+'  <p class="float-right display-none" id="changeMemoDateReload">'+ $.i18n.t('Actual changes to the lane occur when lane is <a href=\"#\">reloaded</a>')+'</p>'
			+'	</div>'
			+'</div>')
		.find('.closeMemolaneDialog').bind(m.clickOrTouchEnd,function(){
			$('#memoDateInput').AnyTime_noPicker().remove();
			$('#changeDateAndTimeDialog').trigger('close');
		})
		.end()
		.find('#saveMemoDateChange').bind(m.clickOrTouchEnd,function(){
				var $this = $(this);
				var converter = new AnyTime.Converter({format:'%m-%d-%Y %h:%i:%s %p'});
				var jsDateObject = converter.parse($('#memoDateInput').val());
				$this.text('saving').addClass('inactive');
				$.ajax({
					url:'/memos/move',
					type:'POST',
					data: {
                                        'memo': memoData.id,
					timestamp:jsDateObject.getTime()/1000
					}
				}).success(function(data){		
					$this.text('saved');
					win._gaq.push(['_trackEvent','date picker','change saved']);
					$('#changeMemoDateReload:hidden').fadeIn();
					setTimeout(function() {
					    $this.text('save').removeClass('inactive');
					}, 2000);
				});
				
				return false;		
		})
		.end()
		.find('#changeMemoDateReload a').bind(m.clickOrTouchEnd,function(){
			win._gaq.push(['_trackEvent','date picker','reload']);
			win.location.reload()
			return false;
		})
		.end()
		.find('#memoDateInput')
			.val(m.utilities.dateFormat((memoData.created_at*1000), "dateTimeForMemoChangeDate" ))
		.end()
		.lightbox_me({
			onLoad:function(){
				$('#memoDateInput').AnyTime_picker({hideInput: true,placement: "inline", labelDayOfMonth:'Day', labelTitle:'',format:'%m-%d-%Y %h:%i:%s %p',labelDismiss:'close'} );	
			},
			onClose:function(){
				$('#memoDateInput').AnyTime_noPicker().remove();
			}
		});
		
		return false;
	},
	
	renderMemoDimensions:function( $elementEvented, availableH ) {
		var that = this;
		
		// clean up unneeded whitespace
		this.shrinkLargeMemoWhitespace();
		
		var openMemoWidth = $('.openMemo:not(.memoClosing)').outerWidth(true);
		var openMemoHeight = $('.openMemo:not(.memoClosing)').outerHeight(true);
		
		var $memo = $('.openMemo:not(.memoClosing)');
		
		// if the memo is taller than the lane
		if ( $memo.height() > availableH ) {
			var memoChromeH = $memo.find('.largeMemoTitleBar').outerHeight(true) + $memo.find('.largeMemoFooterBar').outerHeight(true);
			
			$memo.find('.largeMemoContent').css('height', Math.floor(availableH - memoChromeH));
			openMemoHeight = availableH;
		}
		
		// get info to position large memo
		var scrollLeft = that.$laneViewport.scrollLeft();
		var openMemoX = (that.$laneViewport.width()/2) - openMemoWidth/2;
		var openMemoY = (that.$laneViewport.height()/2) - (openMemoHeight/2);
		var addForDrawer = (m.drawer.drawerIsOpen ? $('#lane-drawer').width() : 0)/2;
		
		// hide small memo
		$elementEvented.css('visibility','hidden');
		
		$('.openMemo:not(.memoClosing), .memoGhost')//25 is size of date bar, 10 is minus the margin of the memo
			.css({'left':$elementEvented.offset().left+scrollLeft - 10, 'top':$elementEvented.position().top + 25})
			.height($elementEvented.height())
			.width($elementEvented.width())
			.show()
			.filter('.openMemo')
			.css('visibility', 'visible')
			.data('memoOpenInfo',{//add data so we can animate it back into place
				memoX:$elementEvented.offset().left+scrollLeft - 10, // 10 is the margin of the memo
				memoY:$elementEvented.position().top + 25, // 25 is size of date bar
				memoH:$elementEvented.height(),
				memoW:$elementEvented.width(),
				memo:$elementEvented
			})
			.animate({
				height:openMemoHeight,
				width:openMemoWidth,
				top:openMemoY,
				left:(openMemoX+scrollLeft+addForDrawer)-12 
			}, 500,'easeOutExpo',function(){
				if(that.openMemoCommentsOnPageLoad === 'true'){
					$('.openMemo .memo_comments').trigger('click');
					return false;
				}
			});
	},
	
	
	// this method sizes the first image in .lrgMemoImg AND its associated content to FULLY FIT in the viewport (without a scroll)
	renderMemoWithFittedImgDimensions:function( $elementEvented, availableH ) {
		var that = this;
		
		var $memo = $('.openMemo:not(.memoClosing)');
		var memoW = $memo.width();
		var memoH = $memo.height();
		var memoChromeH = $memo.find('.largeMemoTitleBar').outerHeight(true) + $memo.find('.largeMemoFooterBar').outerHeight(true);
		var memoContentNoImgH = $memo.find('.largeMemoContent').outerHeight(true) - $memo.find('.largeMemoContent img').outerHeight(true);
		
		var $renderedImg = $memo.find('.lrgMemoImg img:first');
		var imgW = $renderedImg.width();
		var imgH = $renderedImg.height();
		
		// if the memo is taller than the lane
		if ( memoH > availableH ) {
			
			var newImgH = Math.floor(availableH - memoChromeH - memoContentNoImgH);
			
			// give images a minimum height of 50
			if (newImgH < 50) {
				newImgH = 50;
			}
			
			// reset image height
			$memo.find('.largeMemoContent img').attr('height', newImgH);
		}
		
		// make sure memo isn't taller than viewport
		if ($('.openMemo:not(.memoClosing)').outerHeight(true) > availableH) {
			openMemoHeight = availableH;
			$('.openMemo:not(.memoClosing)').height( availableH ).css('max-height', availableH);
		}
		
		// clean up unneeded whitespace
		that.shrinkLargeMemoWhitespace();
		
		var openMemoWidth = $('.openMemo:not(.memoClosing)').outerWidth(true);
		var openMemoHeight = $('.openMemo:not(.memoClosing)').outerHeight(true);
		
		// get info to position large memo
		var scrollLeft = that.$laneViewport.scrollLeft();	
		var openMemoX = (that.$laneViewport.width()/2)-openMemoWidth/2;
		var openMemoY = (that.$laneViewport.height()/2) - (openMemoHeight/2);
		var addForDrawer = (m.drawer.drawerIsOpen ? $('#lane-drawer').width() : 0)/2;	
		
		// hide small memo
		$elementEvented.css('visibility','hidden');
		
		$('.openMemo:not(.memoClosing), .memoGhost')//25 is size of date bar, 10 is minus the margin of the memo
			.css({'left':$elementEvented.offset().left+scrollLeft - 10, 'top':$elementEvented.position().top + 25})
			.height($elementEvented.height())
			.width($elementEvented.width())
			.show()
			.filter('.openMemo')
			.css('visibility', 'visible')
			.data('memoOpenInfo',{//add data so we can animate it back into place
				memoX:$elementEvented.offset().left+scrollLeft - 10, // 10 is the margin of the memo
				memoY:$elementEvented.position().top + 25, // 25 is size of date bar
				memoH:$elementEvented.height(),
				memoW:$elementEvented.width(),
				memo:$elementEvented
			})
			.animate({
				height:openMemoHeight,
				width:openMemoWidth,
				top:openMemoY,
				left:(openMemoX+scrollLeft+addForDrawer)-12 
			}, 500,'easeOutExpo',function(){
				if(that.openMemoCommentsOnPageLoad === 'true'){
					$('.openMemo .memo_comments').trigger('click');
					return false;
				}
			});
	},
	
	
	// takes optional param of the height of the CONTENT part of the memo (.largeMemoContent)
	shrinkLargeMemoWhitespace:function( contentHeightNow ){
		
		// THIS IS A PERFORMANCE KILLER!
		// COMMENTED OUT FOR NOW UNTIL I CAN FIX THAT
		
		/*var $openMemo = $('.openMemo:not(.memoClosing)');
		
		// get current memo width
		if ( !contentHeightNow ) contentHeightNow = $openMemo.find('.largeMemoContent').height();
		
		// try resizing it down a pixel
		$openMemo.width( $openMemo.width()-1 );
		
		// get the new height (which may have changed due to the resize)
		var newHeight = $('.openMemo:not(.memoClosing) .largeMemoContent').height();
		
		// keep trying to size the memo down, or return if we can't any more
		if ( contentHeightNow == newHeight ) this.shrinkLargeMemoWhitespace( newHeight );
		else {
			$('.openMemo:not(.memoClosing)').width( $('.openMemo:not(.memoClosing)').width()+1 );
			return;
		}*/
	},
	
	
	closeMemo:function(){
		// close any dialogs associated w/ this memo
		$('.largeMemoDialog .close').click();
		
		// animate open memo closed
		var dataFromOpenMemo = $('.openMemo:first').data('memoOpenInfo');
		
		if (_.size(dataFromOpenMemo)) {
			$('.openMemo:first')
				.animate({
					height:dataFromOpenMemo.memoH,
					width:dataFromOpenMemo.memoW,
					top:dataFromOpenMemo.memoY,
					left:dataFromOpenMemo.memoX
			}, 400,'easeInExpo',function(){
				dataFromOpenMemo.memo.css('visibility','visible');
				$('.openMemo, .memoGhost').remove();
			});
		}
		else {
			$('.openMemo:first').remove();
			// in case a memo is still hidden, show all
			$('.memo').css('visibility','visible');
		}
	},
	
	closeOpenedMemoWhenOffScreen:function(){
		var $openMemo = $('.openMemo:first');
		if(!$openMemo.length){return;}
		var $viewport = this.$laneViewport;	
		var viewportWidthPx = $viewport.width();
		var openMemoXPositionPx = $('.openMemo:first').offset().left;
		
		if(openMemoXPositionPx < 0){
			if(Math.abs(openMemoXPositionPx) > viewportWidthPx){
				this.closeMemo();
			}
		}else{
			if(openMemoXPositionPx > viewportWidthPx*2){
				this.closeMemo();
			}
		}
		
	},	
	
	rePositionOpenedMemo:function(){
		var $openMemo = $('.openMemo');
		var addForDrawer = (m.drawer.drawerIsOpen ? $('#lane-drawer').width() : 0)/2;
		var openMemoWidth = $openMemo.width();
		var openMemoHeight = $openMemo.height();
		var openMemoX = (this.$laneViewport.width()/2)-openMemoWidth/2;
		var openMemoY = (((this.$laneViewport.height()+25)/2)-openMemoHeight/2);
		
		$openMemo.css({'top':openMemoY,'left':(openMemoX+this.$laneViewport.scrollLeft()+addForDrawer)-12});
	},
	
	
	setMemoPrivacyDialog:function( memoObj ){
		var $dialog = $.tmpl( this.templates.dialogs.setPrivacy, memoObj );
		
		$dialog.find('#'+ memoObj.privacy).addClass('smallButtonActive');
		$dialog.find('#'+ memoObj.privacy +'TabDescription').css('display', 'block');
		
		// show/hide privacy descriptions
		$dialog.find('.smallButtonBar li a').bind('mouseenter mouseleave ', function(e){ 
			var $this = $(this);
			var thisID = $this.attr('id');
			
			// show description on mouseenter
			if (e.type == 'mouseenter') {
				$('.privacyTabDescription div').hide();
				$('#'+ thisID +'TabDescription').show();
			}
			// hide hover description and show active description if it's a mouseleave (and one is active)
			else if ( $dialog.find('.smallButtonActive').length ) {
				$('.privacyTabDescription div').hide();
				var activePrivacy = $dialog.find('.smallButtonActive').attr('id');
				$('#'+ activePrivacy +'TabDescription').show();
			}
			// hide the description if there's no active button and it's a mouseleave
			else {
				$('.privacyTabDescription div').hide();
			}
		});
		
		// handle privacy selection
		$dialog.find('.smallButtonBar li a').bind(m.clickOrTouchEnd, function(e){ 
			var that = this;
			$.ajax({
				type: 'post',
				url: '/memos/privacy',
				data: { 'memo': memoObj['id'], 'privacy': $(that).attr('id') }, // public, private, or friends
				success: function(data) {
					var prevPrivacy = $dialog.find('.smallButtonActive').attr('id');
					var newPrivacy = $(that).attr('id');
					
					// hide old privacy
					$dialog.find('#'+ prevPrivacy).removeClass('smallButtonActive');
					$dialog.find('#'+ prevPrivacy +'TabDescription').hide();
					
					// show new privacy
					$dialog.find('#'+ newPrivacy).addClass('smallButtonActive');
					$dialog.find('#'+ newPrivacy +'TabDescription').show();
					
					// change privacy on the memo itself (and in the local JS memo store)
					$('.openMemo').find('.memo_'+ prevPrivacy).removeClass('memo_'+ prevPrivacy).addClass('memo_'+ newPrivacy);
					$('#openMemoShareLink').data('privacy', newPrivacy);
					var memoID = m.utilities.cleanMemoId( memoObj.id );
					$('#'+ memoID ).find('.memo_privacy').removeClass('memo_'+ prevPrivacy).addClass('memo_'+ newPrivacy);
					m.memos.memoStore[ memoID ].privacy = newPrivacy;
				}
			});
		});
		
		// fire dialog
		$dialog.lightbox_me({
			destroyOnClose: true
		});
	},
	
	
	addMemoToLaneDialog:function( memoObj ){
		var that = this;
		
		// show dialog w/ loader
		var $dialog = $.tmpl( this.templates.dialogs.addMemoToLane.loading, memoObj );
		$dialog.lightbox_me({
			destroyOnClose: true
		});
		
		// make AJAX request for lanes to add to, send that to dialogs template
		$.ajax({
			type: 'get',
			url:'/memos/can_be_added_to',
                        data:{'memo': memoObj.id },
			success: function(data){
				// created named array, for easier use in the template
				var lanes = {};
				lanes.lanes = data;
				
				// render HTML
				var newHTML = $.tmpl( that.templates.dialogs.addMemoToLane.loaded, lanes ).html();
				
				// replace dialog content
				$dialog.find('.dialogContent').html( newHTML );
				
				// re-position dialog
				$dialog.trigger('reposition');
				
				// wire up the click to add this memo to a lane...
				$dialog.find('.addMemoToLane').bind(m.clickOrTouchEnd, function(e){
					var $status = $(this).parent();
					
					// show loader
					$status.html( $.i18n.t("Adding...", "this is a temporary status that tells the user that the system is in the process of associating the memo to the lane") );
					
					// make AJAX request
					$.ajax({
						type: 'post',
						url: '/lanes/include_memo',
						data: { 'lane_id': $(this).attr('id'), 'memo_id': memoObj['id'] },
						success: function(data) {
							$status.html( $.i18n.t("Added!", "this is a status that tells the user that the memo has been associated to the lane") );
						}
					});
					
					e.preventDefault();
				});
			}
		});
	},
	
	
	removeMemoFromLaneDialog:function( memoObj ){
		var that = this;
		var $dialog = $.tmpl( this.templates.dialogs.removeMemoFromLane, memoObj );
		
		// if they confirm memo removal...
		$dialog.find('.removeMemoConfirm').bind(m.clickOrTouchEnd, function(e){ 
			$.ajax({
				type: 'delete',
				url: '/lanes/include_memo',
				data: { 'lane_id': m.currentLane['id'], 'memo_id': memoObj['id'] },
				success: function(data) {
					// close this dialog and the open memo
					that.closeMemo();
					
					// remove small memo from DOM
					var memoID = m.utilities.cleanMemoId( memoObj.id );
					$('#'+ memoID ).remove();
					
					// remove memo from the local JS memo store
					delete m.memos.memoStore[ memoID ];
				}
			});
			e.preventDefault();
		});
		
		// fire dialog
		$dialog.lightbox_me({
			destroyOnClose: true
		});
	},
	
	
	likeOrUnlikeMemo : function(e, memoData) {
		$link = $(e.currentTarget);
		
		// cancel out clicks that occur while a previous one is being processed
		if ( !$link.is('.liking') ) {
			
			var cleanMemoID = m.utilities.cleanMemoId(memoData['id']);
			var $smallMemoLikes = $('#'+ cleanMemoID +' .memo_like');
			
			// unlike it
			if ( $link.is('.liked') ) {
				$link.removeClass('liked').addClass('liking');
				
				$.ajax({
					type: 'post',
					url: '/memos/un_like',
					data: { 'lane': m.currentLane['id'],
                                                'memo': memoData['id']
                                        },
					success: function(data) {
						// update local memo store
						m.memos.memoStore[ cleanMemoID ].liked_by_current_user = false;
						m.memos.memoStore[ cleanMemoID ].like_count--;
						
						// update button interaction
						$link.removeClass('liking');
						
						// update small & large memos, dependent upon if this memo has any likes left
						if ( m.memos.memoStore[ cleanMemoID ].like_count == 0 ) {
							m.memos.memoStore[ cleanMemoID ].like_count = 0;
							$link.siblings('.textWithIcon').text("");
							$smallMemoLikes.removeClass('memo_like_show');
						}
						else {
							$link.siblings('.textWithIcon').text( m.memos.memoStore[ cleanMemoID ].like_count );
							$smallMemoLikes.removeClass('memo_liked_by_current_user').text( m.memos.memoStore[ cleanMemoID ].like_count );
						}
					},
					error: function() {
						// remove animation and set back to liked, to show unsuccessful unlike request
						$link.removeClass('liking').addClass('liked');
					}
				});
			}
			// like it
			else {
				$link.addClass('liking');
				
				$.ajax({
					type: 'post',
					url: '/memos/like',
					data: { 'lane': m.currentLane['id'],
                                                'memo': memoData['id']
                                        },
					success: function(data) {
						// update local memo store
						m.memos.memoStore[ cleanMemoID ].liked_by_current_user = true;
						m.memos.memoStore[ cleanMemoID ].like_count++;
						
						// update button interaction
						$link.removeClass('liking').addClass('liked');
						
						// update large memo
						$link.siblings('.textWithIcon').text( m.memos.memoStore[ cleanMemoID ].like_count );
						
						// update small memo
						$smallMemoLikes.addClass('memo_liked_by_current_user memo_like_show').text( m.memos.memoStore[ cleanMemoID ].like_count );
					},
					error: function() {
						// stop the animation
						$link.removeClass('liking');
					}
				});
			}
		}
		
		e.preventDefault();
	},
	
	
	handleMapMemos : function(){
		var $newOpenMemo = $('.openMemo').filter(':last');
		var $map = $newOpenMemo.find('.memoMapContainer');
		
		if ($map.length) {
			var geo = m.memos.memoStore[$newOpenMemo.data('memo-id')].doc.geo;
			var points = geo.poi;
			var lines = geo.polyline;
			// only set bounds if there is more than one point, or a polyline on the map
			var trackBounds = (lines || (_.size(points) > 1)) ? true : false;
			
			// setup some bounds starting points
			if (trackBounds) {
				var southest = ( lines ? Number(lines[0].lat) : Number(points[0].lat) );
				var northest = southest;
				var westest = ( lines ? Number(lines[0].lon) : Number(points[0].lon) );
				var eastest = westest;
			}
			
			// setup map
			var firstLatLng = new google.maps.LatLng( points[0].lat, points[0].lon );
			var mapOptions = {
				zoom : 14,
				center : firstLatLng,
				disableDefaultUI : true,
				mapTypeControl : false,
				draggable : true,
				scrollwheel : false,
				mapTypeId : google.maps.MapTypeId.ROADMAP
			};
			var map = new google.maps.Map( $map.get(0), mapOptions );
			
			// set points
			if (points) {
				// setup info window function, to be used later
				var addInfoWindow = function(map, marker, markerPosition, point) {
					google.maps.event.addListener(marker, 'click', function() {
						var infoWindow = new google.maps.InfoWindow();
						
						var infoWindowHTML = '<div style="line-height:16px;">';
						infoWindowHTML += '<strong style="font-size:15px; line-height:18px;">'+ point.name +'</strong>';
						if (point.description) {
							infoWindowHTML += '<br style="line-height:24px;" />'+ point.description;
						}
						infoWindowHTML += '</div>';
						
						infoWindow.setContent(infoWindowHTML);
						infoWindow.setPosition(markerPosition);
						infoWindow.open(map, marker);
					});
				}
				
				for (i in points) {
					var point = points[i];
					
					if (trackBounds) {
						// get lat bounds
						if (point.lat < southest) { southest = Number(point.lat); }
						else if (point.lat > northest) { northest = Number(point.lat); }
						// get lon bounds
						if ( point.lon < westest ) { westest = Number(point.lon); }
						else if (point.lon > eastest) { eastest = Number(point.lon); }
					}
					
					var markerPosition = new google.maps.LatLng( point.lat, point.lon );
					var marker = new google.maps.Marker({
						position: markerPosition
					});
					
					// add info window
					addInfoWindow(map, marker, markerPosition, point);
					
					// update map
					marker.setMap(map);
				}
			}
			
			// set polylines
			if (lines) {
				var lineCoordinates = [];
				for (j in lines) {
					if (trackBounds) {
						// get lat bounds
						if (lines[j].lat < southest) { southest = Number(lines[j].lat); }
						else if (lines[j].lat > northest) { northest = Number(lines[j].lat); }
						// get long bounds
						if ( lines[j].lon < westest ) { westest = Number(lines[j].lon); }
						else if (lines[j].lon > eastest) { eastest = Number(lines[j].lon); }
					}
					
					lineCoordinates.push( new google.maps.LatLng( lines[j].lat, lines[j].lon ) );
				}
				var flightPath = new google.maps.Polyline({
					path: lineCoordinates,
					strokeColor: "#FD7768",
					strokeOpacity: 1.0,
					strokeWeight: 4
				});
				flightPath.setMap(map);
			}
			
			// set map bounds
			if (trackBounds) {
				var southwest = new google.maps.LatLng( southest, westest );
				var northeast = new google.maps.LatLng( northest, eastest );
				var bounds = new google.maps.LatLngBounds( southwest, northeast );
				map.fitBounds(bounds);
			}
		}
	},
	
	
	// this is used within memos to reset size placeholders (e.g. to resize YouTube videos)
	// - optional: width, height, width:height ratio
	setWidthAndHeightInMemoContent : function( code, itemW, itemH, WHRatio ) {

		// default sizes
		var initialW = ( itemW ? itemW : 585 ); // the 585 is a hack for 600 that allows us to circumvent the whole "is there a scrollbar" thing
		var initialH = ( itemH ? itemH : 390 );
		
		// default ratios
		if (!WHRatio) { WHRatio = 1.5; }
		var HWRatio = WHRatio / 1;
		
		var newItemW = initialW;
		var newItemH = initialH;

		var availableW = $('#lane-viewport').width(); // STILL NEED TO SUBTRACT OPENED DRAWER FROM THIS
		var availableH = $('#lane-viewport').height() - 20 - 61; // 20 is 10px on top & bottom, 61 is memo chrome
		
		// resize if there's not enough room
		if (availableW < newItemW) {
			newItemW = availableW;
		}
		if (availableH < newItemH) {
			newItemH = availableH;
		}
		
		// adjust proportions as needed
		if (newItemW < initialW || newItemH < initialH) {
			if ( (newItemH * WHRatio) >= newItemW ) {
				newItemH = newItemW * HWRatio;
			}
			else {
				newItemW = newItemH * WHRatio;
			}
		}
		
		code = code.replace(/__WIDTH__/gi, newItemW);
		code = code.replace(/__HEIGHT__/gi, newItemH);
		
		// fix bug where opened memo dialogs won't appear over embedded Flash
		/* HAVE HAVE HAVE to run this code after the replace because the variable strings used break IE and jQuery*/
		code = this.setWmodeInVideoMemos( code );
		
		return code;
	},
	
	
	setWmodeInVideoMemos : function( code ) {
		return $('<div>').append(code).find('object, embed').attr('wmode', 'transparent').end().html();
	},
	
	
	// if the user clicks to play the music on Amazon or Spotify...
	handleMusicClick : function(e) {
		var $link = $(e.currentTarget);
		var originalText = $link.text();
		
		var track = $link.data("track-name");
		var artist = $link.data("artist-name");
		
		var provider = 'amazon';
		var apiURL = "/utils/amazon_url";
		if ( m.currentUser && m.currentUser.music_provider == "spotify" ) {
			provider = 'spotify';
			apiURL = "/utils/spotify_url";
		}
		
		// if the request doesn't go through
		var inCaseOfFailure = function(){
			$link.replaceWith('<span style="color:red; font-weight:bold;">'+ $.i18n.t("There was an error setting your music provider.", "this error denotes that there was a problem when the user tried to set which music provider they would use in the application") +'</span>');
		}
		
		$link.text( $.i18n.t("Loading...", "this temporary status message tells the user that their requested action is being processed") );
		
		$.ajax({
			url: apiURL,
			data: {
				"artist" : artist,
				"track" : track
			},
			dataType: "text", // this is one of the only AJAX requests we have that isn't JSON
			error: function() {
				inCaseOfFailure();
			},
			success: function(data) {
				if (data != '""') {
					// set text back (from "Loading...")
					$link.text(originalText);
					
					if ( provider == "spotify" ) {     
						window.location.href = data;
					}
					else {
						window.open( data, "amazon" );
					}
				}
				else {
					inCaseOfFailure();
				}
			}
		});
		
		e.preventDefault();
	},
	
	
	templates: {
		largeMemos: {
			"default":
				'<div class="memoGhost"></div>'
				+'<div class="openMemo ${service}">'
				+'	<div class="largeMemoTitleBar">'
				+'		{{if (doc && doc.source_url)}}'
				+'			<a href="${doc.source_url}" target="_blank" class="memoServiceIcon" title="'+ $.i18n.t("Go back to source", "this tells the user that if they click on this button they will be taken to the source of the memo on the service that it was created on") +'{{if doc && doc.author && doc.author.name}} ('+ $.i18n.t("by ${doc.author.name}" , "this tells the viewer the identity of the original author of the memo - the ${doc.author.name} is a variable placeholder that will include the name/identity") +'){{/if}}" target="_blank"></a>'
				+'		{{else}}'
				+'			<div class="memoServiceIcon" {{if doc && doc.author && doc.author.name}}title="'+ $.i18n.t("by ${doc.author.name}" , "this tells the viewer the identity of the original author of the memo - the ${doc.author.name} is a variable placeholder that will include the name/identity") +'"{{/if}}></div>'
				+'		{{/if}}'
				+'		{{if (doc && doc.title && doc.title.thumbnail) && (!m.currentUser || user_id != m.currentUser.userID)}}'
				+'			<div class="ownerThumbnail"><div class="thumbText">'+ $.i18n.t("From", "this label precedes a small image of the user who posted the memo and signifies memo ownership and origin") +' </div><img src="/${user_id}/image" /></div>'
				+'		{{/if}}'
				+'		{{if doc.author}}<div class="thumbText"> ('+ $.i18n.t("originally by", "this label precedes the linked name of the author of the memo and signifies memo ownership and origin") +' <a href="${doc.author.url}">${doc.author.name}</a>)</div>{{/if}}'
				+'		<a class="closeOpenMemo">'+ $.i18n.t("close", "clicking on this button closes the dialog window") +'</a>'
				+'	</div>'
				+'	<div class="largeMemoContent">'
				+'		{{if doc && doc.title && doc.title.text}}'
				+'			<p>${doc.title.text}</p>'
				+'		{{/if}}'
				+'		{{if doc && doc.image && doc.image.url}}'
				+'			<div class="lrgMemoImg"><img src="${doc.image.url}" /></div>'
				+'		{{/if}}'
				+'	</div>'
				+'{{tmpl m.memos.templates.memoFragments.largeMemoFooter}}'
				+'</div>'
			,
			facebook:
				'<div class="memoGhost"></div>'
				+'<div class="openMemo facebook">'
				+'	<div class="largeMemoTitleBar">'
				+'		{{if (doc.source_url)}}'
				+'			<a href="${doc.source_url}" target="_blank" class="memoServiceIcon" title="'+ $.i18n.t("Go back to source", "this tells the user that if they click on this button they will be taken to the source of the memo on the service that it was created on") +'{{if doc.author && doc.author.name}} ('+ $.i18n.t("by ${doc.author.name}" , "this tells the viewer the identity of the original author of the memo - the ${doc.author.name} is a variable placeholder that will include the name/identity") +'){{/if}}" target="_blank"></a>'
				+'		{{else}}'
				+'			<div class="memoServiceIcon" {{if doc.author && doc.author.name}}title="'+ $.i18n.t("by ${doc.author.name}" , "this tells the viewer the identity of the original author of the memo - the ${doc.author.name} is a variable placeholder that will include the name/identity") +'"{{/if}}></div>'
				+'		{{/if}}'
				+'		{{if (doc.title && doc.title.thumbnail) && (!m.currentUser || user_id != m.currentUser.userID)}}'
				+'			<div class="ownerThumbnail"><div class="thumbText">'+ $.i18n.t("From", "this label precedes a small image of the user who posted the memo and signifies memo ownership and origin") +' </div><img src="${doc.title.thumbnail}" /></div>'
				+'		{{/if}}'
				+'		{{if doc.author}}<div class="thumbText"> ('+ $.i18n.t("originally by", "this label precedes the linked name of the author of the memo and signifies memo ownership and origin") +' <a href="${doc.author.url}">${doc.author.name}</a>)</div>{{/if}}'
				+'		<a class="closeOpenMemo">'+ $.i18n.t("close", "clicking on this button closes the dialog window") +'</a>'
				+'	</div>'
				+'	<div class="largeMemoContent">'
				// status
				+'		{{if doc.sub_type == "status"}}'
				+'			<h3>${doc.title.text}</h3>'
				+'		{{/if}}'
				// event
				+'		{{if doc.sub_type == "event"}}'
				+'			<h3>${doc.title.text}</h3>'
				+'			<div class="memo-event">'
				+'			{{if created_at}}'
				+'				<div class="memo-event-data"><h4>'+ $.i18n.t("Time", "this tells the viewer the time of the Facebook event") +'</h4><div><p>${m.utilities.dateFormat( created_at * 1000, "fullDatePlusTime" ).replace("-", "&middot;")}</p></div></div>'
				+'			{{/if}}'
				+'			{{if doc.event && doc.event.location}}'
				+'				<div class="memo-event-data"><h4>'+ $.i18n.t("Location", "this tells the viewer the location of the Facebook event") +'</h4><div><p>${doc.event.location}</p></div></div>'
				+'			{{/if}}'
				+'			{{if doc.author && doc.author.name}}'
				+'				<div class="memo-event-data"><h4>'+ $.i18n.t("Created by", "attribution for the author of the memo") +'</h4><div><p>${doc.author.name}</p></div></div>'
				+'			{{/if}}'
				+'			{{if doc.text && doc.text.text}}'
				+'				<div class="memo-event-data"><h4>'+ $.i18n.t("More info", "tells the user that additional info is located below") +'</h4><div><p>${doc.text.text}</p></div></div>'
				+'			{{/if}}'
				+'			</div>'
				+'		{{/if}}'
				// photo
				+'		{{if doc.sub_type == "photo"}}'
				+'			<div class="lrgMemoImg"><img src="${doc.image.url}" /></div>'
				+'			{{if doc.title && doc.title.text}}'
				+'				<p>${doc.title.text}</p>'
				+'			{{/if}}'
				+'		{{/if}}'
				// note
				+'		{{if doc.sub_type == "note"}}'
				+'			{{if doc.title && doc.title.text}}'
				+'				<h3>${doc.title.text}</h3>'
				+'			{{/if}}'
				+'			{{if doc.text && doc.text.text}}'
				+'				<div class="memoIncomingHTML">{{html doc.text.text}}</div>'
				+'			{{/if}}'
				+'		{{/if}}'
				// link
				+'		{{if doc.sub_type == "link"}}'
				+'			{{if doc.title && doc.title.text}}'
				+'				<h3 style="padding:0; padding-bottom:20px; margin:25px; margin-bottom:0; border-bottom:1px solid #ddd;">${doc.title.text}</h3>'
				+'			{{/if}}'
				+'			<div style="padding:5px 20px 10px;">'
				+'				<p><a href="${doc.link.url}" target="_blank">${doc.link.name}</a></p>'
				+'				{{if doc.link.url != doc.link.name}}<p style="padding-top:0; margin-top:-12px; color:#999;">${doc.link.url}</p>{{/if}}'
				+'				{{if doc.link.description}}<p style="color:#999; padding-top:0;">${doc.link.description}</p>{{/if}}'
				+'			</div>'
				+'		{{/if}}'
				// video
				+'		{{if doc.sub_type == "video"}}'
				+'			<div class="memoVideoContainer">{{html m.memos.setWmodeInVideoMemos( doc.video.video_player )}}</div>'
				+'			{{if doc.title && doc.title.text}}'
				+'				<h3>${doc.title.text}</h3>'
				+'			{{/if}}'
				+'			{{if doc.description && doc.description.text.length}}'
				+'				<p>${doc.description.text}</p>'
				+'			{{/if}}'
				+'		{{/if}}'
				+'	</div>'
				+'{{tmpl m.memos.templates.memoFragments.largeMemoFooter}}'
				+'</div>'
			,
			'facebook-pages':
				'<div class="memoGhost"></div>'
				+'<div class="openMemo facebook-pages">'
				+'	<div class="largeMemoTitleBar">'
				+'		{{if (doc.source_url)}}'
				+'			<a href="${doc.source_url}" target="_blank" class="memoServiceIcon" title="'+ $.i18n.t("Go back to source", "this tells the user that if they click on this button they will be taken to the source of the memo on the service that it was created on") +'{{if doc.author && doc.author.name}} ('+ $.i18n.t("by ${doc.author.name}" , "this tells the viewer the identity of the original author of the memo - the ${doc.author.name} is a variable placeholder that will include the name/identity") +'){{/if}}" target="_blank"></a>'
				+'		{{else}}'
				+'			<div class="memoServiceIcon" {{if doc.author && doc.author.name}}title="'+ $.i18n.t("by ${doc.author.name}" , "this tells the viewer the identity of the original author of the memo - the ${doc.author.name} is a variable placeholder that will include the name/identity") +'"{{/if}}></div>'
				+'		{{/if}}'
				+'		{{if (doc.title && doc.title.thumbnail) && (!m.currentUser || user_id != m.currentUser.userID)}}'
				+'			<div class="ownerThumbnail"><div class="thumbText">'+ $.i18n.t("From", "this label precedes a small image of the user who posted the memo and signifies memo ownership and origin") +' </div><img src="${doc.title.thumbnail}" /></div>'
				+'		{{/if}}'
				/*
				+'		{{if doc.author}}<div class="thumbText"> ('+ $.i18n.t("originally by", "this label precedes the linked name of the author of the memo and signifies memo ownership and origin") +' <a href="${doc.author.url}">${doc.author.name}</a>)</div>{{/if}}'
				*/ 
				+'		<a class="closeOpenMemo">'+ $.i18n.t("close", "clicking on this button closes the dialog window") +'</a>'
				+'	</div>'
				+'	<div class="largeMemoContent">'
				// status
				+'		{{if doc.sub_type == "status"}}'
				+'			<h3>${doc.title.text}</h3>'
				+'		{{/if}}'
				// event
				+'		{{if doc.sub_type == "event"}}'
				+'			<h3>${doc.title.text}</h3>'
				+'			<div class="memo-event">'
				+'			{{if created_at}}'
				+'				<div class="memo-event-data"><h4>'+ $.i18n.t("Time", "this tells the viewer the time of the Facebook event") +'</h4><div><p>${m.utilities.dateFormat( created_at * 1000, "fullDatePlusTime" ).replace("-", "&middot;")}</p></div></div>'
				+'			{{/if}}'
				+'			{{if doc.event && doc.event.location}}'
				+'				<div class="memo-event-data"><h4>'+ $.i18n.t("Location", "this tells the viewer the location of the Facebook event") +'</h4><div><p>${doc.event.location}</p></div></div>'
				+'			{{/if}}'
				+'			{{if doc.author && doc.author.name}}'
				+'				<div class="memo-event-data"><h4>'+ $.i18n.t("Created by", "attribution for the author of the memo") +'</h4><div><p>${doc.author.name}</p></div></div>'
				+'			{{/if}}'
				+'			{{if doc.text && doc.text.text}}'
				+'				<div class="memo-event-data"><h4>'+ $.i18n.t("More info", "tells the user that additional info is located below") +'</h4><div><p>${doc.text.text}</p></div></div>'
				+'			{{/if}}'
				+'			</div>'
				+'		{{/if}}'
				// photo
				+'		{{if doc.sub_type == "photo"}}'
				+'			<div class="lrgMemoImg"><img src="${doc.image.url}" /></div>'
				+'			{{if doc.title && doc.title.text}}'
				+'				<p>${doc.title.text}</p>'
				+'			{{/if}}'
				+'		{{/if}}'
				// note
				+'		{{if doc.sub_type == "note"}}'
				+'			{{if doc.title && doc.title.text}}'
				+'				<h3>${doc.title.text}</h3>'
				+'			{{/if}}'
				+'			{{if doc.text && doc.text.text}}'
				+'				<div class="memoIncomingHTML">{{html doc.text.text}}</div>'
				+'			{{/if}}'
				+'		{{/if}}'
				// link
				+'		{{if doc.sub_type == "link"}}'
				+'			{{if doc.title && doc.title.text}}'
				+'				<h3 style="padding:0; padding-bottom:20px; margin:25px; margin-bottom:0; border-bottom:1px solid #ddd;">${doc.title.text}</h3>'
				+'			{{/if}}'
				+'			<div style="padding:5px 20px 10px;">'
				+'				<p><a href="${doc.link.url}" target="_blank">${doc.link.name}</a></p>'
				+'				{{if doc.link.url != doc.link.name}}<p style="padding-top:0; margin-top:-12px; color:#999;">${doc.link.url}</p>{{/if}}'
				+'				{{if doc.link.description}}<p style="color:#999; padding-top:0;">${doc.link.description}</p>{{/if}}'
				+'			</div>'
				+'		{{/if}}'
				// video
				+'		{{if doc.sub_type == "video"}}'
				+'			<div class="memoVideoContainer">{{html m.memos.setWmodeInVideoMemos( doc.video.video_player )}}</div>'
				+'			{{if doc.title && doc.title.text}}'
				+'				<h3>${doc.title.text}</h3>'
				+'			{{/if}}'
				+'			{{if doc.description && doc.description.text.length}}'
				+'				<p>${doc.description.text}</p>'
				+'			{{/if}}'
				+'		{{/if}}'
				+'	</div>'
				+'{{tmpl m.memos.templates.memoFragments.largeMemoFooter}}'
				+'</div>'
			,
			feed:
				'<div class="memoGhost"></div>'
				+'<div class="openMemo feed">'
				+'	<div class="largeMemoTitleBar">'
				+'		{{if (doc && doc.source_url)}}'
				+'			<a href="${doc.source_url}" class="memoServiceIcon" title="'+ $.i18n.t("Go back to source", "this tells the user that if they click on this button they will be taken to the source of the memo on the service that it was created on") +'{{if doc && doc.author && doc.author.name}} ('+ $.i18n.t("by ${doc.author.name}" , "this tells the viewer the identity of the original author of the memo - the ${doc.author.name} is a variable placeholder that will include the name/identity") +'){{/if}}" target="_blank"></a>'
				+'		{{else}}'
				+'			<div class="memoServiceIcon" {{if doc && doc.author && doc.author.name}}title="'+ $.i18n.t("by ${doc.author.name}" , "this tells the viewer the identity of the original author of the memo - the ${doc.author.name} is a variable placeholder that will include the name/identity") +'"{{/if}}></div>'
				+'		{{/if}}'
				+'		{{if doc.author && doc.author.name && doc.author.name.length}}<div class="thumbText"> '+ $.i18n.t("by ${doc.author.name}" , "this tells the viewer the identity of the original author of the memo - the ${doc.author.name} is a variable placeholder that will include the name/identity") +'</div>{{/if}}'
				+'		<a class="closeOpenMemo">'+ $.i18n.t("close", "clicking on this button closes the dialog window") +'</a>'
				+'	</div>'
				+'	<div class="largeMemoContent">'
				+'		{{if doc && doc.category && doc.category.text}}'
				+'			<div class="memoHeaderHTML">'
				+'				${doc.category.text}{{if doc.title && doc.title.text}}<br />${doc.title.text}{{/if}}'
				+'			</div>'
				+'		{{/if}}'
				+'		{{if doc && doc.text && doc.text.text}}'
				+'			<div class="memoIncomingHTML">{{html m.memos.setWmodeInVideoMemos( doc.text.text )}}</div>'
				+'		{{/if}}'
				+'	</div>'
				+'{{tmpl m.memos.templates.memoFragments.largeMemoFooter}}'
				+'</div>'
			,
			flickr:
				'<div class="memoGhost"></div>'
				+'<div class="openMemo flickr">'
				+'	<div class="largeMemoTitleBar">'
				+'		{{if (doc.source_url)}}'
				+'			<a href="${doc.source_url}" target="_blank" class="memoServiceIcon" title="'+ $.i18n.t("Go back to source", "this tells the user that if they click on this button they will be taken to the source of the memo on the service that it was created on") +'{{if doc.author && doc.author.name}} ('+ $.i18n.t("by ${doc.author.name}" , "this tells the viewer the identity of the original author of the memo - the ${doc.author.name} is a variable placeholder that will include the name/identity") +'){{/if}}" target="_blank"></a>'
				+'		{{else}}'
				+'			<div class="memoServiceIcon" {{if doc.author && doc.author.name}}title="'+ $.i18n.t("by ${doc.author.name}" , "this tells the viewer the identity of the original author of the memo - the ${doc.author.name} is a variable placeholder that will include the name/identity") +'"{{/if}}></div>'
				+'		{{/if}}'
				+'		{{if (doc.title && doc.title.thumbnail) && (!m.currentUser || user_id != m.currentUser.userID)}}'
				+'			<div class="ownerThumbnail"><div class="thumbText">'+ $.i18n.t("From", "this label precedes a small image of the user who posted the memo and signifies memo ownership and origin") +' </div><img src="${doc.title.thumbnail}" /></div>'
				+'		{{/if}}'
				+'		{{if doc.author}}<div class="thumbText"> ('+ $.i18n.t("originally by", "this label precedes the linked name of the author of the memo and signifies memo ownership and origin") +' <a href="${doc.author.url}">${doc.author.name}</a>)</div>{{/if}}'
				+'		<a class="closeOpenMemo">'+ $.i18n.t("close", "clicking on this button closes the dialog window") +'</a>'
				+'	</div>'
				+'	<div class="largeMemoContent">'
				// image
				+'		{{if doc.sub_type == "image"}}'
				+'			<div class="lrgMemoImg"><img src="${doc.image.url}" /></div>'
				// video
				+'		{{else}}'
				+'			<div class="memoVideoContainer">{{html m.memos.setWidthAndHeightInMemoContent( doc.video.video_player )}}</div>'
				+'		{{/if}}'
				+'		{{if doc.title && doc.title.text}}'
				+'			<h3>${doc.title.text}</h3>'
				+'		{{/if}}'
				+'		{{if doc.description && doc.description.text}}'
				+'			<p>${doc.description.text}</p>'
				+'		{{/if}}'
				+'	</div>'
				+'{{tmpl m.memos.templates.memoFragments.largeMemoFooter}}'
				+'</div>'
			,
			foursquare:
				'<div class="memoGhost"></div>'
				+'<div class="openMemo foursquare" data-memo-id="${m.utilities.cleanMemoId(id)}">'
				+'	<div class="largeMemoTitleBar">'
				+'		{{if (doc.source_url)}}'
				+'			<a href="${doc.source_url}" target="_blank" class="memoServiceIcon" title="'+ $.i18n.t("Go back to source", "this tells the user that if they click on this button they will be taken to the source of the memo on the service that it was created on") +'{{if doc.author && doc.author.name}} ('+ $.i18n.t("by ${doc.author.name}" , "this tells the viewer the identity of the original author of the memo - the ${doc.author.name} is a variable placeholder that will include the name/identity") +'){{/if}}" target="_blank"></a>'
				+'		{{else}}'
				+'			<div class="memoServiceIcon" {{if doc.author && doc.author.name}}title="'+ $.i18n.t("by ${doc.author.name}" , "this tells the viewer the identity of the original author of the memo - the ${doc.author.name} is a variable placeholder that will include the name/identity") +'"{{/if}}></div>'
				+'		{{/if}}'
				+'		{{if (doc.title && doc.title.thumbnail) && (!m.currentUser || user_id != m.currentUser.userID)}}'
				+'			<div class="ownerThumbnail"><div class="thumbText">'+ $.i18n.t("From", "this label precedes a small image of the user who posted the memo and signifies memo ownership and origin") +' </div><img src="${doc.title.thumbnail}" /></div>'
				+'		{{/if}}'
				+'		{{if doc.author}}<div class="thumbText"> ('+ $.i18n.t("originally by", "this label precedes the linked name of the author of the memo and signifies memo ownership and origin") +' <a href="${doc.author.url}">${doc.author.name}</a>)</div>{{/if}}'
				+'		<a class="closeOpenMemo">'+ $.i18n.t("close", "clicking on this button closes the dialog window") +'</a>'
				+'	</div>'
				+'	<div class="largeMemoContent">'
				// map
				+'		{{html m.memos.setWidthAndHeightInMemoContent( "<div class=\'memoMapContainer\' width=\'__WIDTH__\' height=\'__HEIGHT__\' style=\'width:__WIDTH__px; height:__HEIGHT__px;\'></div>" )}}'
				// title
				+'		{{if doc.title && doc.title.text}}'
				+'			<h3>At ${doc.title.text} <span>(${m.utilities.dateFormat( (created_at*1000), "shortTime" )})</span></h3>'
				+'		{{/if}}'
				// note
				+'		{{if doc.geo.poi[0].description}}'
				+'			<p style="padding-bottom:20px;">${doc.geo.poi[0].description}</p>'
				+'		{{/if}}'
				// image
				+'		{{if doc.image && doc.image.url}}'
				+'			<div style="text-align:center; margin-top:5px;"><img src="${doc.image.url}" /></div>'
				+'		{{/if}}'
				+'	</div>'
				+'{{tmpl m.memos.templates.memoFragments.largeMemoFooter}}'
				+'</div>'
			,
			'google-plus':
				'<div class="memoGhost"></div>'
				+'<div class="openMemo google-plus">'
				+'	<div class="largeMemoTitleBar">'
				+'		{{if (doc.source_url)}}'
				+'			<a href="${doc.source_url}" target="_blank" class="memoServiceIcon" title="'+ $.i18n.t("Go back to source", "this tells the user that if they click on this button they will be taken to the source of the memo on the service that it was created on") +'{{if doc.author && doc.author.name}} ('+ $.i18n.t("by ${doc.author.name}" , "this tells the viewer the identity of the orignal author of the memo - the ${doc.author.name} is a variable placeholder that will include the name/identity") +'){{/if}}" target="_blank"></a>'
				+'		{{else}}'
				+'			<div class="memoServiceIcon" {{if doc.author && doc.author.name}}title="'+ $.i18n.t("by ${doc.author.name}" , "this tells the viewer the identity of the orignal author of the memo - the ${doc.author.name} is a variable placeholder that will include the name/identity") +'"{{/if}}></div>'
				+'		{{/if}}'
				+'		{{if (doc.title && doc.title.thumbnail) && (!m.currentUser || user_id != m.currentUser.userID)}}'
				+'			<div class="ownerThumbnail"><div class="thumbText">'+ $.i18n.t("From", "this label precedes a small image of the user who posted the memo and signifies memo ownership and origin") +' </div><img src="${doc.title.thumbnail}" /></div>'
				+'		{{/if}}'
				+'		{{if doc.author}}<div class="thumbText"> ('+ $.i18n.t("originally by", "this label precedes the linked name of the author of the memo and signifies memo ownership and origin") +' <a href="${doc.author.url}">${doc.author.name}</a>)</div>{{/if}}'
				+'		<a class="closeOpenMemo">'+ $.i18n.t("close", "clicking on this button closes the dialog window") +'</a>'
				+'	</div>'
				+'	<div class="largeMemoContent">'
				// message
				+'		{{if doc.description && doc.description.text}}'
				+'			<p{{if !doc.attachment}} class="statusAlone"{{/if}}>${doc.description.text}</p>'
				+'		{{/if}}'
				// geo, if it exists
				+'		{{if doc.geo && doc.geo.poi[0]}}'
				+'			<p style="padding-top:0;"><a href="http://maps.google.com/?q=${doc.geo.poi[0].lat},${doc.geo.poi[0].long}" class="mapLink" target="_blank">'
				+'			{{if doc.geo.poi[0].name}}'
				+'				${doc.geo.poi[0].name}'
				+'			{{else doc.geo.poi[0].address && doc.geo.poi[0].address.address}}'
				+'				${doc.geo.poi[0].address.address}'
				+'			{{else}}'
				+'				${doc.geo.poi[0].lat}, ${doc.geo.poi[0].long}'
				+'			{{/if}}'
				+'			</a></p>'
				+'		{{/if}}'
				// posts with attachments (not just "status" type posts)
				+'		{{if doc.attachment}}'
					// link
				+'			{{if doc.attachment[0].sub_type == "article"}}'
				+'				<div class="article">'
				+'					{{if doc.attachment[1] && doc.attachment[1].sub_type == "photo" && doc.attachment[1].image && doc.attachment[1].image.url}}'
				+'						<a href="${doc.attachment[0].article.url}" target="_blank" class="openMemoLinkImage"><img src="${doc.attachment[1].image.url}" style="float:left;" /></a>'
				+'					{{/if}}'
				+'					<div style="float:left;">'
				+'						<div class="article-title"><a href="${doc.attachment[0].article.url}" target="_blank">${doc.attachment[0].article.title}</a></div>'
				+'						<div class="article-content">${doc.attachment[0].article.content}</div>'
				+'					</div>'
				+'				</div>'
					// photo album or photo(s)
				+'			{{else doc.attachment[0].sub_type == "photo-album" || doc.attachment[0].sub_type == "photo"}}'
				+'				<div class="openMemoPhotoAlbum">'
				+'				{{each doc.attachment}}'
				+'					{{if (typeof image !== "undefined") && (typeof image.url !== "undefined")}}<img src="${image.url}" />{{/if}}'
				+'				{{/each}}'
				+'				</div>'
				+'			{{/if}}'
				+'		{{/if}}'
				+'	</div>'
				+'{{tmpl m.memos.templates.memoFragments.largeMemoFooter}}'
				+'</div>'
			,
			instagram:
				'<div class="memoGhost"></div>'
				+'<div class="openMemo instagram">'
				+'	<div class="largeMemoTitleBar">'
				+'		{{if (doc.source_url)}}'
				+'			<a href="${doc.source_url}" target="_blank" class="memoServiceIcon" title="'+ $.i18n.t("Go back to source", "this tells the user that if they click on this button they will be taken to the source of the memo on the service that it was created on") +'{{if doc.author && doc.author.name}} ('+ $.i18n.t("by ${doc.author.name}" , "this tells the viewer the identity of the original author of the memo - the ${doc.author.name} is a variable placeholder that will include the name/identity") +'){{/if}}" target="_blank"></a>'
				+'		{{else}}'
				+'			<div class="memoServiceIcon" {{if doc.author && doc.author.name}}title="'+ $.i18n.t("by ${doc.author.name}" , "this tells the viewer the identity of the original author of the memo - the ${doc.author.name} is a variable placeholder that will include the name/identity") +'"{{/if}}></div>'
				+'		{{/if}}'
				+'		{{if (doc.title && doc.title.thumbnail) && (!m.currentUser || user_id != m.currentUser.userID)}}'
				+'			<div class="ownerThumbnail"><div class="thumbText">'+ $.i18n.t("From", "this label precedes a small image of the user who posted the memo and signifies memo ownership and origin") +' </div><img src="${doc.title.thumbnail}" /></div>'
				+'		{{/if}}'
				+'		{{if doc.author}}<div class="thumbText"> ('+ $.i18n.t("originally by", "this label precedes the linked name of the author of the memo and signifies memo ownership and origin") +' <a href="${doc.author.url}">${doc.author.name}</a>)</div>{{/if}}'
				+'		<a class="closeOpenMemo">'+ $.i18n.t("close", "clicking on this button closes the dialog window") +'</a>'
				+'	</div>'
				+'	<div class="largeMemoContent">'
				+'		<div class="lrgMemoImg"><img src="${doc.image.url}" alt="Instagram photo" /></div>'
				+'		{{if doc.title && doc.title.text}}'
				+'			<p>${doc.title.text}</p>'
				+'		{{/if}}'
				+'	</div>'
				+'{{tmpl m.memos.templates.memoFragments.largeMemoFooter}}'
				+'</div>'
			,
			lastfm:
				'<div class="memoGhost"></div>'
				+'<div class="openMemo lastfm">'
				+'	<div class="largeMemoTitleBar">'
				+'		{{if (doc.track && doc.track.url)}}'
				+'			<a href="http://${doc.track.url}" target="_blank" class="memoServiceIcon" title="'+ $.i18n.t("Go to Last.fm page for this track", "this link text tells the user that they can go to Last.fm to listen to this memo's track") +'" target="_blank"></a>'
				+'		{{else}}'
				+'			<div class="memoServiceIcon" title="Last.fm"></div>'
				+'		{{/if}}'
				+'		{{if !m.currentUser || user_id != m.currentUser.userID}}'
				+'			<div class="ownerThumbnail"><div class="thumbText">'+ $.i18n.t("From", "this label precedes a small image of the user who posted the memo and signifies memo ownership and origin") +' </div><a href="/users/${user_id}"><img src="/users/${user_id}/image.small" /></a></div>' // additionally, we can compare the userID to the contributor object to get the username
				+'		{{/if}}'
				+'		<a class="closeOpenMemo">'+ $.i18n.t("close", "clicking on this button closes the dialog window") +'</a>'
				+'	</div>'
				+'	<div class="largeMemoContent">'
				+'		<div>'
				+'			{{if (doc.track && doc.track.artist && doc.track.artist.thumbnail)}}'
				+'				<img src="${doc.track.artist.thumbnail}" alt="'+ $.i18n.t("By ${doc.track.artist.name}", "this phrase indicates that the associated track was performed by the given artist") +'" />'
				+'			{{/if}}'
				+'			<h3>${doc.track.artist.name}</h3>'
				+'			<h4>${doc.track.name}</h4>'
				+'			<p>${doc.track.playcount} {{if doc.track.playcount > 1}}'+ $.i18n.t("plays", "this label follows the track play count and indicates that the given track has been played some number of times") +'{{else}}'+ $.i18n.t("play", "this label follows the track play count of 1 and indicates that the given track has been played one time") +'{{/if}}</p>'
				+'			<p><a href="#" class="music-play-btn" data-track-name="${doc.track.name.replace(/"/g, "&quot;")}" data-artist-name="${doc.track.artist.name.replace(/"/g, "&quot;")}">'
				+'				{{if m.currentUser && m.currentUser.music_provider && (m.currentUser.music_provider == "spotify")}}'+ $.i18n.t("Listen with Spotify", "this link text informs the user that they can listen to the given track on the Spotify music service") +'{{else}}'+ $.i18n.t("Listen with Amazon", "this link text informs the user that they can listen to the given track on the Amazon music service") +'{{/if}}'
				+'			</a></p>'
				+'		</div>'
				+'	</div>'
				+'{{tmpl m.memos.templates.memoFragments.largeMemoFooter}}'
				+'</div>'
			,
			mixi:
				'<div class="memoGhost"></div>'
				+'<div class="openMemo mixi">'
				+'	<div class="largeMemoTitleBar">'
				+'		{{if (doc.source_url)}}'
				+'			<a href="${doc.source_url}" target="_blank" class="memoServiceIcon" title="'+ $.i18n.t("Go back to source", "this tells the user that if they click on this button they will be taken to the source of the memo on the service that it was created on") +'{{if doc.author && doc.author.name}} ('+ $.i18n.t("by ${doc.author.name}" , "this tells the viewer the identity of the orignal author of the memo - the ${doc.author.name} is a variable placeholder that will include the name/identity") +'){{/if}}" target="_blank"></a>'
				+'		{{else}}'
				+'			<div class="memoServiceIcon" {{if doc.author && doc.author.name}}title="'+ $.i18n.t("by ${doc.author.name}" , "this tells the viewer the identity of the orignal author of the memo - the ${doc.author.name} is a variable placeholder that will include the name/identity") +'"{{/if}}></div>'
				+'		{{/if}}'
				+'		{{if (doc.title && doc.title.thumbnail) && (!m.currentUser || user_id != m.currentUser.userID)}}'
				+'			<div class="ownerThumbnail"><div class="thumbText">'+ $.i18n.t("From", "this label precedes a small image of the user who posted the memo and signifies memo ownership and origin") +' </div><img src="${doc.title.thumbnail}" /></div>'
				+'		{{/if}}'
				+'		{{if (doc.author)}}<div class="thumbText"> ('+ $.i18n.t("originally by", "this label precedes the linked name of the author of the memo and signifies memo ownership and origin") +' <a href="${doc.author.url}">${doc.author.name}</a>)</div>{{/if}}'
				+'		<a class="closeOpenMemo">'+ $.i18n.t("close", "clicking on this button closes the dialog window") +'</a>'
				+'	</div>'
				+'	<div class="largeMemoContent">'
				// voice or status only
				+'		{{if (doc && doc.title && doc.title.text)}}'
				+'			<p{{if doc.sub_type != "photo"}} class="noPhoto"{{/if}}>{{html m.utilities.convertURLstringsToAnchors( doc.title.text )}}</p>'
				+'		{{/if}}'
				// photo(s)
				+'		{{if (doc.sub_type == "photo" && doc.attachment)}}'
				+'			<div class="openMemoPhotoAlbum">'
				+'			{{each doc.attachment}}'
				+'				<img src="${largeImageUrl}" />'
				+'			{{/each}}'
				+'			</div>'
				+'		{{/if}}'
				+'	</div>'
				+'{{tmpl m.memos.templates.memoFragments.largeMemoFooter}}'
				+'</div>'
			,
			myspace:
				'<div class="memoGhost"></div>'
				+'<div class="openMemo myspace">'
				+'	<div class="largeMemoTitleBar">'
				+'		{{if (doc.source_url)}}'
				+'			<a href="{{if doc.source_url.substr(0,4) != "http"}}http://www.myspace.com{{/if}}${doc.source_url}" target="_blank" class="memoServiceIcon" title="'+ $.i18n.t("Go back to source", "this tells the user that if they click on this button they will be taken to the source of the memo on the service that it was created on") +'{{if doc.author && doc.author.name}} ('+ $.i18n.t("by ${doc.author.name}" , "this tells the viewer the identity of the original author of the memo - the ${doc.author.name} is a variable placeholder that will include the name/identity") +'){{/if}}" target="_blank"></a>'
				+'		{{else}}'
				+'			<div class="memoServiceIcon" {{if doc.author && doc.author.name}}title="'+ $.i18n.t("by ${doc.author.name}" , "this tells the viewer the identity of the original author of the memo - the ${doc.author.name} is a variable placeholder that will include the name/identity") +'"{{/if}}></div>'
				+'		{{/if}}'
				+'		{{if (doc.title && doc.title.thumbnail) && (!m.currentUser || user_id != m.currentUser.userID)}}'
				+'			<div class="ownerThumbnail"><div class="thumbText">'+ $.i18n.t("From", "this label precedes a small image of the user who posted the memo and signifies memo ownership and origin") +' </div><img src="${doc.title.thumbnail}" /></div>'
				+'		{{/if}}'
				+'		{{if doc.author}}<div class="thumbText"> ('+ $.i18n.t("originally by", "this label precedes the linked name of the author of the memo and signifies memo ownership and origin") +' <a href="${doc.author.url}">${doc.author.name}</a>)</div>{{/if}}'
				+'		<a class="closeOpenMemo">'+ $.i18n.t("close", "clicking on this button closes the dialog window") +'</a>'
				+'	</div>'
				+'	<div class="largeMemoContent">'
				// image
				+'		{{if doc.sub_type == "photo"}}'
				+'			<div class="lrgMemoImg"><img src="${doc.image.url}" /></div>'
				+'		{{/if}}'
				// video
				+'		{{if doc.sub_type == "video"}}'
				+'			<div class="memoVideoContainer">{{html m.memos.setWidthAndHeightInMemoContent( doc.video.video_player )}}</div>'
				+'		{{/if}}'
				// all types, including mood thumbnail
				+'		{{if doc.title && doc.title.text}}'
				+'			<h3>{{if doc.sub_type == "mood" && doc.title && doc.title.thumbnail}}<img src="${doc.title.thumbnail}" alt="'+ $.i18n.t("mood image", "this tells the user that this type of image is a MySpace mood image") +'" style="padding-right:10px;" />{{/if}}${doc.title.text}</h3>'
				+'		{{/if}}'
				+'	</div>'
				+'{{tmpl m.memos.templates.memoFragments.largeMemoFooter}}'
				+'</div>'
			,
			picasa:
				'<div class="memoGhost"></div>'
				+'<div class="openMemo picasa">'
				+'	<div class="largeMemoTitleBar">'
				+'		{{if (doc.source_url)}}'
				+'			<a href="${doc.source_url}" target="_blank" class="memoServiceIcon" title="'+ $.i18n.t("Go back to source", "this tells the user that if they click on this button they will be taken to the source of the memo on the service that it was created on") +'{{if doc.author && doc.author.name}} ('+ $.i18n.t("by ${doc.author.name}" , "this tells the viewer the identity of the original author of the memo - the ${doc.author.name} is a variable placeholder that will include the name/identity") +'){{/if}}" target="_blank"></a>'
				+'		{{else}}'
				+'			<div class="memoServiceIcon" {{if doc.author && doc.author.name}}title="'+ $.i18n.t("by ${doc.author.name}" , "this tells the viewer the identity of the original author of the memo - the ${doc.author.name} is a variable placeholder that will include the name/identity") +'"{{/if}}></div>'
				+'		{{/if}}'
				+'		{{if (doc.title && doc.title.thumbnail) && (!m.currentUser || user_id != m.currentUser.userID)}}'
				+'			<div class="ownerThumbnail"><div class="thumbText">'+ $.i18n.t("From", "this label precedes a small image of the user who posted the memo and signifies memo ownership and origin") +' </div><img src="${doc.title.thumbnail}" /></div>'
				+'		{{/if}}'
				+'		{{if doc.author}}<div class="thumbText"> ('+ $.i18n.t("originally by", "this label precedes the linked name of the author of the memo and signifies memo ownership and origin") +' <a href="${doc.author.url}">${doc.author.name}</a>)</div>{{/if}}'
				+'		<a class="closeOpenMemo">'+ $.i18n.t("close", "clicking on this button closes the dialog window") +'</a>'
				+'	</div>'
				+'	<div class="largeMemoContent">'
				+'			<div class="lrgMemoImg"><img src="${doc.image.url}" /></div>'
				+'		{{if doc.title && doc.title.text}}'
				+'			<h3>${doc.title.text}</h3>'
				+'		{{/if}}'
				+'		{{if doc.description && doc.description.text}}'
				+'			<p>${doc.description.text}</p>'
				+'		{{/if}}'
				+'	</div>'
				+'{{tmpl m.memos.templates.memoFragments.largeMemoFooter}}'
				+'</div>'
			,
			soundcloud:
				'<div class="memoGhost"></div>'
				+'<div class="openMemo soundcloud">'
				+'	<div class="largeMemoTitleBar">'
				+'		{{if (doc.source_url)}}'
				+'			<a href="${doc.source_url}" target="_blank" class="memoServiceIcon" title="'+ $.i18n.t("Go back to source", "this tells the user that if they click on this button they will be taken to the source of the memo on the service that it was created on") +'{{if doc.author && doc.author.name}} ('+ $.i18n.t("by ${doc.author.name}" , "this tells the viewer the identity of the original author of the memo - the ${doc.author.name} is a variable placeholder that will include the name/identity") +'){{/if}}"></a>'
				+'		{{else}}'
				+'			<div class="memoServiceIcon" {{if doc.author && doc.author.name}}title="'+ $.i18n.t("by ${doc.author.name}" , "this tells the viewer the identity of the original author of the memo - the ${doc.author.name} is a variable placeholder that will include the name/identity") +'"{{/if}}></div>'
				+'		{{/if}}'
				+'		{{if (doc.title && doc.title.thumbnail) && (!m.currentUser || user_id != m.currentUser.userID)}}'
				+'			<div class="ownerThumbnail"><div class="thumbText">'+ $.i18n.t("From", "this label precedes a small image of the user who posted the memo and signifies memo ownership and origin") +' </div><img src="${doc.title.thumbnail}" /></div>'
				+'		{{/if}}'
				+'		{{if doc.author}}<div class="thumbText"> ('+ $.i18n.t("originally by", "this label precedes the linked name of the author of the memo and signifies memo ownership and origin") +' <a href="${doc.author.url}">${doc.author.name}</a>)</div>{{/if}}'
				+'		<a class="closeOpenMemo">'+ $.i18n.t("close", "clicking on this button closes the dialog window") +'</a>'
				+'	</div>'
				+'	<div class="largeMemoContent">'
				+'		<h3>{{if doc.artwork.url}}<img src="${doc.artwork.url}" alt="'+ $.i18n.t("album artwork", "this is a label that tells the user that the given image is album artwork") +'" />{{/if}}${doc.title.text}</h3>'
				+'		<div class="memoVideoContainer" style="margin:5px 25px 20px;">'
				+'			<object height="81" width="100%" wmode="transparent">'
				+'				<param name="movie" value="http://player.soundcloud.com/player.swf?show_artwork=false&url=${doc.play_url.resource}%3Fsecret_token%3D${doc.play_url.secret_token}%26client_id%3D${doc.play_url.client_id}"></param>'
				+'				<param name="allowscriptaccess" value="always"></param>'
				+'				<embed src="http://player.soundcloud.com/player.swf?show_artwork=false&url=${doc.play_url.resource}%3Fsecret_token%3D${doc.play_url.secret_token}%26client_id%3D${doc.play_url.client_id}" allowscriptaccess="always" height="81"  type="application/x-shockwave-flash" width="100%"  wmode="transparent"></embed>'
				+'			</object>'
				+'		</div>'
				+'	</div>'
				+'{{tmpl m.memos.templates.memoFragments.largeMemoFooter}}'
				+'</div>'
			,
			tripit:
				'<div class="memoGhost"></div>'
				+'<div class="openMemo tripit" data-memo-id="${m.utilities.cleanMemoId(id)}">'
				+'	<div class="largeMemoTitleBar">'
				+'		{{if (doc.source_url)}}'
				+'			<a href="${doc.source_url}" target="_blank" class="memoServiceIcon" title="'+ $.i18n.t("Go back to source", "this tells the user that if they click on this button they will be taken to the source of the memo on the service that it was created on") +'{{if doc.author && doc.author.name}} ('+ $.i18n.t("by ${doc.author.name}" , "this tells the viewer the identity of the original author of the memo - the ${doc.author.name} is a variable placeholder that will include the name/identity") +'){{/if}}" target="_blank"></a>'
				+'		{{else}}'
				+'			<div class="memoServiceIcon" {{if doc.author && doc.author.name}}title="'+ $.i18n.t("by ${doc.author.name}" , "this tells the viewer the identity of the original author of the memo - the ${doc.author.name} is a variable placeholder that will include the name/identity") +'"{{/if}}></div>'
				+'		{{/if}}'
				+'		{{if (doc.title && doc.title.thumbnail) && (!m.currentUser || user_id != m.currentUser.userID)}}'
				+'			<div class="ownerThumbnail"><div class="thumbText">'+ $.i18n.t("From", "this label precedes a small image of the user who posted the memo and signifies memo ownership and origin") +' </div><img src="${doc.title.thumbnail}" /></div>'
				+'		{{/if}}'
				+'		{{if doc.author}}<div class="thumbText"> ('+ $.i18n.t("originally by", "this label precedes the linked name of the author of the memo and signifies memo ownership and origin") +' <a href="${doc.author.url}">${doc.author.name}</a>)</div>{{/if}}'
				+'		<a class="closeOpenMemo">'+ $.i18n.t("close", "clicking on this button closes the dialog window") +'</a>'
				+'	</div>'
				+'	<div class="largeMemoContent">'
				+'		{{html m.memos.setWidthAndHeightInMemoContent( "<div class=\'memoMapContainer\' width=\'__WIDTH__\' height=\'__HEIGHT__\' style=\'width:__WIDTH__px; height:__HEIGHT__px;\'></div>" )}}'
				+'		{{each doc.geo.poi}}'
				+'			{{if $index < (doc.geo.poi.length - 1)}}'
				+'				<div class="tripitLeg">'
				+'					<div class="tripitFlightDatum tripitAirports">${$value.name.substr(-3)} <span style="color:#80bbe2;">&rsaquo;</span> ${doc.geo.poi[$index+1].name.substr(-3)}</div>'
				+'					<div class="tripitFlightDatum">${m.utilities.dateFormat( ($value.time*1000), "shortTime" )} - ${m.utilities.dateFormat( (doc.geo.poi[$index+1].time*1000), "shortTime" )}</div>'
				+'					<div class="tripitFlightDatum">${$value.description.replace("Arrival (", "").replace("Departure (", "").replace(")", "")}</div>'
				+'				</div>'
				+'			{{/if}}'
				+'		{{/each}}'
				+'	</div>'
				+'{{tmpl m.memos.templates.memoFragments.largeMemoFooter}}'
				+'</div>'
			,
			twitter:
				'<div class="memoGhost"></div>'
				+'<div class="openMemo twitter">'
				+'	<div class="largeMemoTitleBar">'
				+'		{{if doc.source_url}}'
				+'			<a href="${doc.source_url}" target="_blank" class="memoServiceIcon" title="'+ $.i18n.t("Go back to source", "this tells the user that if they click on this button they will be taken to the source of the memo on the service that it was created on") +'{{if doc.author && doc.author.name}} ('+ $.i18n.t("by ${doc.author.name}" , "this tells the viewer the identity of the original author of the memo - the ${doc.author.name} is a variable placeholder that will include the name/identity") +'){{/if}}" target="_blank"></a>'
				+'		{{else}}'
				+'			<div class="memoServiceIcon" {{if doc.author && doc.author.name}}title="'+ $.i18n.t("by ${doc.author.name}" , "this tells the viewer the identity of the original author of the memo - the ${doc.author.name} is a variable placeholder that will include the name/identity") +'"{{/if}}></div>'
				+'		{{/if}}'
				+'		{{if (doc.title && doc.title.thumbnail) && (!m.currentUser || user_id != m.currentUser.userID)}}'
				+'			<div class="ownerThumbnail"><div class="thumbText">'+ $.i18n.t("From", "this label precedes a small image of the user who posted the memo and signifies memo ownership and origin") +' </div><img src="${doc.title.thumbnail}" /></div>'
				+'		{{/if}}'
				+'		{{if doc.author}}<div class="thumbText"> ('+ $.i18n.t("originally by", "this label precedes the linked name of the author of the memo and signifies memo ownership and origin") +' <a href="${doc.author.url}">${doc.author.name}</a>)</div>{{/if}}'
				+'		<a class="closeOpenMemo">'+ $.i18n.t("close", "clicking on this button closes the dialog window") +'</a>'
				+'	</div>'
				+'	<div class="largeMemoContent">'
				+'		<p>{{html m.utilities.convertURLstringsToAnchors( doc.title.text )}}</p>'
				+'		{{if doc.image}}'
				+'			<div class="lrgMemoImg"><img src="${doc.image.url}" /></div>'
				+'		{{/if}}'
				+'	</div>'
				+'{{tmpl m.memos.templates.memoFragments.largeMemoFooter}}'
				+'</div>'
			,
			vimeo:
				'<div class="memoGhost"></div>'
				+'<div class="openMemo vimeo">'
				+'	<div class="largeMemoTitleBar">'
				+'		{{if (doc.source_url)}}'
				+'			<a href="${doc.source_url}" class="memoServiceIcon" title="'+ $.i18n.t("Go back to source", "this tells the user that if they click on this button they will be taken to the source of the memo on the service that it was created on") +'{{if doc.author && doc.author.name}} ('+ $.i18n.t("by ${doc.author.name}" , "this tells the viewer the identity of the original author of the memo - the ${doc.author.name} is a variable placeholder that will include the name/identity") +'){{/if}}" target="_blank"></a>'
				+'		{{else}}'
				+'			<div class="memoServiceIcon" {{if doc.author && doc.author.name}}title="'+ $.i18n.t("by ${doc.author.name}" , "this tells the viewer the identity of the original author of the memo - the ${doc.author.name} is a variable placeholder that will include the name/identity") +'"{{/if}}></div>'
				+'		{{/if}}'
				+'		{{if (doc.title && doc.title.thumbnail) && (!m.currentUser || user_id != m.currentUser.userID)}}'
				+'			<div class="ownerThumbnail"><div class="thumbText">'+ $.i18n.t("From", "this label precedes a small image of the user who posted the memo and signifies memo ownership and origin") +' </div><img src="${doc.title.thumbnail}" /></div>'
				+'		{{/if}}'
				+'		{{if doc.author}}<div class="thumbText"> ('+ $.i18n.t("originally by", "this label precedes the linked name of the author of the memo and signifies memo ownership and origin") +' <a href="${doc.author.url}">${doc.author.name}</a>)</div>{{/if}}'
				+'		<a class="closeOpenMemo">'+ $.i18n.t("close", "clicking on this button closes the dialog window") +'</a>'
				+'	</div>'
				+'	<div class="largeMemoContent">'
				+'		<div class="memoVideoContainer">{{html m.memos.setWidthAndHeightInMemoContent( doc.video.video_player )}}</div>'
				+'		{{if doc.title}}'
				+'			<h3>${doc.title.text}</h3>'
				+'		{{/if}}'
				+'		{{if doc.description && doc.description.text.length}}'
				+'			<p>${doc.description.text}</p>'
				+'		{{/if}}'
				+'	</div>'
				+'{{tmpl m.memos.templates.memoFragments.largeMemoFooter}}'
				+'</div>'
			,
			wordpress:
				'<div class="memoGhost"></div>'
				+'<div class="openMemo wordpress">'
				+'	<div class="largeMemoTitleBar">'
				+'		{{if (doc && doc.source_url)}}'
				+'			<a href="${doc.source_url}" class="memoServiceIcon" title="'+ $.i18n.t("Go back to source", "this tells the user that if they click on this button they will be taken to the source of the memo on the service that it was created on") +'{{if doc && doc.author && doc.author.name}} ('+ $.i18n.t("by ${doc.author.name}" , "this tells the viewer the identity of the original author of the memo - the ${doc.author.name} is a variable placeholder that will include the name/identity") +'){{/if}}" target="_blank"></a>'
				+'		{{else}}'
				+'			<div class="memoServiceIcon" {{if doc && doc.author && doc.author.name}}title="'+ $.i18n.t("by ${doc.author.name}" , "this tells the viewer the identity of the original author of the memo - the ${doc.author.name} is a variable placeholder that will include the name/identity") +'"{{/if}}></div>'
				+'		{{/if}}'
				+'		{{if doc.author && doc.author.name && doc.author.name.length}}<div class="thumbText"> '+ $.i18n.t("by ${doc.author.name}" , "this tells the viewer the identity of the original author of the memo - the ${doc.author.name} is a variable placeholder that will include the name/identity") +'</div>{{/if}}'
				+'		<a class="closeOpenMemo">'+ $.i18n.t("close", "clicking on this button closes the dialog window") +'</a>'
				+'	</div>'
				+'	<div class="largeMemoContent">'
				+'		{{if (doc && doc.category && doc.category.text) || (doc.title && doc.title.text)}}'
				+'			<div class="memoHeaderHTML">'
				+'				{{if doc && doc.category && doc.category.text}}${doc.category.text}{{/if}}'
				+'				{{if doc.title && doc.title.text}}<div>${doc.title.text}</div>{{/if}}'
				+'			</div>'
				+'		{{/if}}'
				+'		{{if doc && doc.text && doc.text.text}}'
				+'			<div class="memoIncomingHTML">{{html m.memos.setWmodeInVideoMemos( doc.text.text )}}</div>'
				+'		{{/if}}'
				+'	</div>'
				+'{{tmpl m.memos.templates.memoFragments.largeMemoFooter}}'
				+'</div>'
			,
			youtube:
				'<div class="memoGhost"></div>'
				+'<div class="openMemo youtube">'
				+'	<div class="largeMemoTitleBar">'
				+'		{{if (doc.source_url)}}'
				+'			<a href="${doc.source_url}" target="_blank" class="memoServiceIcon" title="'+ $.i18n.t("Go back to source", "this tells the user that if they click on this button they will be taken to the source of the memo on the service that it was created on") +'{{if doc.author && doc.author.name}} ('+ $.i18n.t("by ${doc.author.name}" , "this tells the viewer the identity of the original author of the memo - the ${doc.author.name} is a variable placeholder that will include the name/identity") +'){{/if}}"></a>'
				+'		{{else}}'
				+'			<div class="memoServiceIcon" {{if doc.author && doc.author.name}}title="'+ $.i18n.t("by ${doc.author.name}" , "this tells the viewer the identity of the original author of the memo - the ${doc.author.name} is a variable placeholder that will include the name/identity") +'"{{/if}}></div>'
				+'		{{/if}}'
				+'		{{if (doc.title && doc.title.thumbnail) && (!m.currentUser || user_id != m.currentUser.userID)}}'
				+'			<div class="ownerThumbnail"><div class="thumbText">'+ $.i18n.t("From", "this label precedes a small image of the user who posted the memo and signifies memo ownership and origin") +' </div><img src="${doc.title.thumbnail}" /></div>'
				+'		{{/if}}'
				+'		{{if doc.author}}<div class="thumbText"> ('+ $.i18n.t("originally by", "this label precedes the linked name of the author of the memo and signifies memo ownership and origin") +' <a href="${doc.author.url}">${doc.author.name}</a>)</div>{{/if}}'
				+'		<a class="closeOpenMemo">'+ $.i18n.t("close", "clicking on this button closes the dialog window") +'</a>'
				+'	</div>'
				+'	<div class="largeMemoContent">'
				+'		<div class="memoVideoContainer">{{html m.memos.setWidthAndHeightInMemoContent( doc.video.video_player )}}</div>'
				+'		{{if doc.title}}'
				+'			<h3>${doc.title.text}</h3>'
				+'		{{/if}}'
				+'		{{if doc.description && doc.description.text.length}}'
				+'			<p>${doc.description.text}</p>'
				+'		{{/if}}'
				+'	</div>'
				+'{{tmpl m.memos.templates.memoFragments.largeMemoFooter}}'
				+'</div>'
		},
		
		memoFragments:{
			largeMemoFooter:
				'	<div class="largeMemoFooterBar">'
				+'		<div class="leftFade"></div>'
				+'		<div class="rightFade"></div>'
				// IMPORTANT NOTE: all the whitespace in .memoOwnerActions HAS TO BE NUKED (b/c we're using the :empty psuedo-selector in the CSS)
				+'		<ul class="memoOwnerActions">'
				// TO DO: this privacy setting should be either always shown or shown to those who have this memo's owner as a contributor on at least one of his/her lanes
				+'{{if m.currentUser && m.currentUser.userID == user_id}}'
				+'<li><a href="#" title="'+ $.i18n.t("Privacy Settings", "this is a label that indicates that the associated icon deals with privacy settings") +'" class="memo_action memo_privacy memo_${privacy}">${privacy}</a></li>'
				+'{{/if}}'
				// memo owner & memo owner's friends can add memos to lanes (but if the friend isn't a contributor to any lanes, the resulting dialog will be devoid of lanes)
				+'{{if (m.currentUser && m.currentUser.userID == user_id) || ( m.currentUser && m.currentUser.friend_ids.indexOf( user_id ) != -1 )}}'
				+'<li><a href="#" class="memo_action memo_laneAdd" title="'+ $.i18n.t("Add to Lane", "clicking on this button allows the user to add this memo to an individual lane") +'">'+ $.i18n.t("Add to Lane", "clicking on this button allows the user to add this memo to an individual lane") +'</a></li>'
				+'{{/if}}'
				// lane owner can remove all memos & lane contributor can remove his/her own memos
				+'{{if (m.currentUser && m.currentUser.userID == m.currentLane.user_id) || (m.currentUser && m.currentUser.userID == user_id)}}'
				+'<li><a href="#" class="memo_action memo_laneRemove" title="'+ $.i18n.t("Remove from Lane", "clicking on this button allows the user to add this memo to an individual lane") +'">'+ $.i18n.t("Remove from Lane", "clicking on this button allows the user to add this memo to an individual lane") +'</a></li>'
				+'{{/if}}'
				+'</ul>'
					// TO DO: this .memo_dateAdded should have the left border and padding removed if there's an <li> in the above <ul>...
				+'{{if m.currentUser && m.currentUser.userID == user_id}}'
				+'		<div class="memo_dateAdded"><a href="#" id="changeMemoDate">${ m.utilities.dateFormat( (created_at*1000), "fullDateAndTime" ) }</a></div>'	
				+'{{else}}'
				+'		<div class="memo_dateAdded"><a href="/users/${user_id}" class="largeMemoUserAvatar"><img align="middle" src="/users/${user_id}/image.small" height="16" width="16" /></a>{{if m.currentUser && m.currentUser.userID == user_id}}<a href="#" id="changeMemoDate">${ m.utilities.dateFormat( (created_at*1000), "fullDateAndTime")}</a> {{else}}${ m.utilities.dateFormat( (created_at*1000), "fullDateAndTime")}{{/if}} '+ $.i18n.t("by", "X memo date by X user") +'</div>'			
				+'{{/if}}'
				+'		<ul class="memoActions">'
				+'			<li><a href="#" id="openMemoShareLink" title="'+ $.i18n.t("Share this memo", "this is the call to action that appears when a memo is shared") +'" data-privacy="${privacy}" data-share-text="'+ $.i18n.t("Check out this memo on Memolane", "this is the call to action that appears when memolane is shared via Twitter or Facebook") +'" data-share-dialog-text="'+ $.i18n.t("Share memo on", "this is the phrase that precedes either Twitter or Facebook and serves as a label for memo sharing") +'" data-share-link="'+ m.utilities.breakURLCache( window.location.pathname ) +'#time=${created_at}&memo=${m.utilities.cleanMemoId( id )}" class="memo_action memo_share shareURL">'+ $.i18n.t("Share", "a user clicks on this button to complete the process of sharing a memo on Twitter or Facebook") +'</a></li>'
				+'			{{if m.currentUser}}'
				+'				<li><a href="#" title="'+ $.i18n.t("Comment on memo", "call to action for user to comment on a memo") +'" class="memo_action memo_comments" data-id="${id}">Comment on memo</a><span class="textWithIcon"><span class="commentCount">{{if comment_count}}${comment_count}{{/if}}</span></span></li>'
				+'				<li><a href="#" title="'+ $.i18n.t("Like/Unlike memo", "call to action for user to like OR unlike memo") +'" class="memo_action memo_like{{if liked_by_current_user}} liked{{/if}}">'+ $.i18n.t("Like/Unlike memo", "call to action for user to like OR unlike memo") +'</a><a href="#" title="'+ $.i18n.t("click to view who liked this memo")+'"class="memo_like_text textWithIcon">{{if like_count}}${like_count}{{/if}}</a></li>'
				+'			{{else}}'
				+'				<li><div title="'+ $.i18n.t("Comments on memo", "tooltip for memo comment icon") +'" class="memo_action memo_comments" data-id="${id}">Comments on memo</div><span class="memo_like_text textWithIcon">{{if comment_count > 0}}${comment_count}{{/if}}</span></li>'
				+'				{{if like_count > 0}}'
				+'					<li><div class="memo_action memo_like{{if liked_by_current_user}} liked{{/if}}"></div><a href="#" title="'+ $.i18n.t("click to view who liked this memo")+'" class="memo_like_text textWithIcon">{{if like_count}}${like_count}{{/if}}</a></li>'
				+'				{{/if}}'
				+'			{{/if}}'
				+'		</ul>'
				+'	</div>'
		},
		
		dialogs:{
			setPrivacy:
				'<div id="privacyDialog" class="memolaneDialog largeMemoDialog">'
				+'	<div class="dialogTopBar">'
				+'		<div class="dialogTitle">'+ $.i18n.t("Set Privacy", "this is the button the user clicks on to change the privacy of a memo") +'</div>'
				+'		<div class="close closeMemolaneDialog">'+ $.i18n.t("close", "this is where the user clicks to close the dialog window") +'</div>'
				+'		<div class="clearFloatNoHeight"></div>'
				+'	</div>'
				+'	<div class="dialogContent">'
				+'		<h2 class="${service}"></h2>'
				+'		<a href="#" class="close" id="setPrivacyDone" style="display:none;">'+ $.i18n.t("Close", "the text link to close the dialog window") +'</a>'
				+'		<p>'+ $.i18n.t("The privacy setting you select for this memo will be uniformly applied to all lanes on which it exists. Your choice here will override your service-level setting.", "this tells the user that the privacy they select for individual memos changes the privacy setting for the memo only, and not the entire service") +'</p>'
				+'		<p>'+ $.i18n.t("Please choose a setting to continue:", "this asks the user to choose a privacy setting") +'</p>'
				+'		<ul class="privacyTabs smallButtonBar">'
				+'			<li><a href="#" id="public">'+ $.i18n.t("Public", "this is the public button, clicking on this button makes the memo public") +'</a></li>'
				+'			<li><a href="#" id="friends">'+ $.i18n.t("Friends Only", "this is the friends only button, clicking on this button makes the memo friends only") +'</a></li>'
				+'			<li><a href="#" id="private">'+ $.i18n.t("Private", "this is the private button, clicking on this button makes the memo private") +'</a></li>'
				+'		</ul>'
				+'		<div class="privacyTabDescription">'
				+'			<div id="publicTabDescription"><h3>'+ $.i18n.t("Public", "this is the title of the public privacy setting") +'</h3><p>'+ $.i18n.t("This memo will be visible to anyone viewing the lanes where it appears, and it can be contributed to lanes created by your Memolane friends. We will notify you by email whenever any of your memos are contributed to a lane created by one of your Memolane friends so you can remove it if you choose.", "this lets users know that public memos can be viewed by anyone who views their lanes and pulled into the lanes of their Memolane friends") +'</p></div>'
				+'			<div id="friendsTabDescription"><h3>'+ $.i18n.t("Friends Only", "this is the title of the friends only privacy setting") +'</h3><p>'+ $.i18n.t("This memo will only be visible to you and your Memolane friends on all lanes where it appears. We will notify you by email whenever any of your memos are contributed to a lane created by one of your Memolane friends so you can remove it if you choose.", "this lets users know that friends only memos can be viewed by their Memolane friends when viewing their lanes, and they can be pulled into lanes created by their Memolane friends") +'</p></div>'
				+'			<div id="privateTabDescription"><h3>'+ $.i18n.t("Private", "this is the title of the private privacy setting") +'</h3><p>'+ $.i18n.t("This memo will only be visible to you on all lanes where it appears. Your Memolane friends can contribute the service where this memo was created to their lanes, but it will still only be visible to you.", "this tells the user that private memos will only be able to be viewed by them.") +'</p></div>'
				+'		</div>'
				+'	</div>'
				+'</div>'
			,
			addMemoToLane: {
				loading:
					'<div id="removeMemoDialog" class="memolaneDialog largeMemoDialog">'
					+'	<div class="dialogTopBar">'
					+'		<div class="dialogTitle">'+ $.i18n.t("Add this memo to a lane", "this prompts the user to add the memo they are viewing to a lane") +'</div>'
					+'		<div class="close closeMemolaneDialog">'+ $.i18n.t("close" , "clicking on this button closes the dialog window") +'</div>'
					+'		<div class="clearFloatNoHeight"></div>'
					+'	</div>'
					+'	<div class="dialogContent">'
					+'		<h2 class="header typeJ" style="text-align:center; margin-bottom:0;"><img src="/img/common/smallLoaderOnWhite.gif" alt="'+ $.i18n.t("loading lanes...", "tells the user the lanes they are trying to view are loading") +'" /></h2>'
					+'	</div>'
					+'</div>'
				,
				loaded:
					'<div>'
					+'<p>'+ $.i18n.t("Adding a memo to a lane keeps it on the lane even if the service it is streamed from is removed - service streaming is controlled in the <a href=\"#\" class=\"openDrawerEditViewOnClick\">lane drawer edit view</a>. You can add an individual memo to any lane shown below, including the lane where you are viewing this memo:") +'</p>'
					+'<div id="laneListScroller">'
					+'<ul class="lane-list">'
					+'	{{each lanes}}'
					+'		<li>'
					+'			<img src="{{if avatar_url}}${avatar_url}{{else}}/lanes/${id}/avatar{{/if}}" class="float-left" alt="'+ $.i18n.t("lane avatar", "designates the avatar associated with the lane") +'" />'
					+'			${title}'
					+'			<div class="float-right addMemoStatus">'
					+'				{{if already_included}}'
					+'					'+ $.i18n.t("Added", "this informs the user that the memo has already been added to the given lane")
					+'				{{else}}'
					+'					<a href="#" id="${id}" class="btn-green addMemoToLane">'+ $.i18n.t("Add", "this button allows the user to add the memo at hand to the given lane") +'</a>'
					+'				{{/if}}'
					+'			</div>'
					+'		</li>'
					+'	{{/each}}'
					+'</ul>'
					+'</div>'
					+'</div>'
			},
			removeMemoFromLane:
				'<div id="removeMemoDialog" class="memolaneDialog largeMemoDialog">'
				+'	<div class="dialogTopBar">'
				+'		<div class="dialogTitle">'+ $.i18n.t("Remove memo from lane", "tells the user that they can remove this memo from a lane") +'</div>'
				+'		<div class="close closeMemolaneDialog">'+ $.i18n.t("cancel", "the cancel button to close the dialog window") +'</div>'
				+'		<div class="clearFloatNoHeight"></div>'
				+'	</div>'
				+'	<div class="dialogContent">'
				+'		<h2 class="header typeJ">'+ $.i18n.t("Whoa, are you sure?", "this prompts the user to make sure that they are sure they want to remove the memo from the lane") +'</h2>'
				+'		<p>'+ $.i18n.t("This will NOT remove this memo from any other lane(s) on which it appears.", "this tells the user that they are only removing the memo from the lane they are currently viewing") +'</p>'
				+'		<p><a href="#" class="btn-red float-left removeMemoConfirm close">'+ $.i18n.t("Yes, remove this memo from this lane", "this is a confirmation prompt for the removal of the memo") +'</a> <a href="#" class="secondaryAction float-left close">'+ $.i18n.t("No, I don\'t want that", "clicking on this button allows the user to leave the dialog without making changes") +'</a></p>'
				+'	</div>'
				+'</div>'
		}
	}
	
};}(this,jQuery,this.undefined);

m.memos.initialize();