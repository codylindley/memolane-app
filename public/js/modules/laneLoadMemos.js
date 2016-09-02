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

m.laneLoadMemos = function(win,$,undefined){return{

	/*  static  */
	
	$laneViewport:$('#lane-viewport'),
	$lane:$('#lane'),
	$laneSlot : $('.lane-slot'),
	urlHashObjectOnPageLoad: m.utilities.urlHash.get(), //get has object from url
	preloadingLeft : false,
	preloadingRight : false,
	numberOfMemosToLoad : Math.round(($('body').width()/250) * ($('#lane-viewport').height()/250))*4,
	
	/*  initialize module  */
	
	initialize:function(){
		
		//setup loadLaneOnThistime value on page load...load from hash or load right now.
		this.loadLaneOnThisTime = this.urlHashObjectOnPageLoad.time ? this.urlHashObjectOnPageLoad.time : Math.round((new Date()).getTime() / 1000)
		
		//run load memos for initial view
		if(m.currentLane.mode === 'new'){
			//This is a new lane so don't try and load memos
		}else if(m.currentLane.total_memos === 0 || m.currentLane.visible_memos === 0){
			//This is not a new lane, but the lane had no memos
			$('#lane-drawer').css('visibility','visible');
			m.drawer.openDrawer();
			
			//lane message
			$('#empty-lane-message').position({
			   my: "center",
			   at: "center",
			   of: window
			}).show();
				
		}else{
			//the lane more than likely has memos so lets try and load them
			m.lane.showLaneLoader();
			this.initialLoadMemos();
		}

	},
	
	/*  methods  */
	
	initialLoadMemos:function(){
	
		var that = this;
		
		//get memos based on centered date
		$.ajax({
			url: '/lanes/'+ m.currentLane.id +'/memos',
			data: {
				timestamp:this.loadLaneOnThisTime,
				left:that.numberOfMemosToLoad,
				right:that.numberOfMemosToLoad,
                public_only:m.isEmbedded
			}
		}).success(function(data){
			
			var numberOfMemos = data.length;
			var secondsInDay = 86400;

			// startDay is the date represented by the first memo normalized to the beginning of the day, in unix time
			// endDay is the date represented by the last memo normalized to the end of the day, in unix time
			var startDay = data[0].created_at - (m.utilities.fixedModulus(data[0].created_at, secondsInDay));
			var endDay = (data[data.length - 1].created_at - (m.utilities.fixedModulus(data[data.length - 1].created_at, secondsInDay))+86400);

			//if the lane only contains memos from the exact same 24 hour period manually add 24hours
			if(startDay === endDay){
				endDay += 86399;
			}
			
			//create/get html for initial lane view
			var slotsAndMemosHtml = that.createSlotsAndMemos(startDay,endDay,data,secondsInDay);			
			
			//add html to the DOM
			that.$lane.empty().append(slotsAndMemosHtml);
			
			//search the DOM for all images, make sure the ones without h are loaded before showing
			$('.lane-slot-memos').find('img:not([height])').imagesLoaded(function(){	
			
				//run layout so isotope is ran only after the height of each slot is set
				m.laneLayout.runLayout();
				
				//remove loader and show lane
				m.lane.hideLaneLoader();
				m.lane.showLane();
	
				//move lane to correct postion based on time that was sent to lane, 
				m.lane.moveLaneToMemo(that.getMemoIdClosesToTime(data,that.loadLaneOnThisTime));		
				
				//update the data we store for opening a memo...
				that.updateMemoStore(data);
				
				//open a memo if deeplinked
				if(that.urlHashObjectOnPageLoad.memo){
					that.deepLinkToMemo();
				}
			
			});
			
			
		});
	},
	
	deepLinkToMemo:function(){
		var that = this;
		var $memo = $('#'+this.urlHashObjectOnPageLoad.memo)
		if($memo.length){
			win.setTimeout(function(){$memo.trigger('click');},500);
		}else{
				$('<div class="notifications badnews-notice"><div class="notice-text">'+$.i18n.t('Sorry about that. You are trying to view a memo that you either don\'t have permission to see or is no longer on this lane.')+' <a href="#" class="close-notice">X</a></div></div>').notify({expires: false});
		}
	},
	
	getMemoIdClosesToTime:function(arrayOfMemos,time){
		/*figure out which memo in data set is closes to the time the lane is centered on (i.e. now or date on hash) so that we can focus that memo in the lane*/
		var i = 0;
		var cleanMemoId = m.utilities.cleanMemoId;
		var closestMemoToTime; //will be the id of the memo that is closes to that.loadLaneOnThisTime
		var lengthOfMemos = arrayOfMemos.length;
		
		//if last memo in data set is less that the time stamp centered on
		if(arrayOfMemos[lengthOfMemos-1].created_at <= time){
			
			closestMemoToTime = cleanMemoId(arrayOfMemos[lengthOfMemos-1].id);
		
		}else{ //else loop over the data set to find the memo closes to right now or time from hash
		
			while(i<lengthOfMemos){
				//grab first memo that is equal or greater than right now or time from hash
				if(arrayOfMemos[i].created_at >= time){ 
					//dumb luck occurs, and its exact, center on this memo
					if(arrayOfMemos[i].created_at == time){//type coercion
						closestMemoToTime = cleanMemoId(arrayOfMemos[i].id);
					}else{
						//get current memo, & previous, figure out which is closer to that.loadLaneOnThisTime	
						var big = Math.abs(arrayOfMemos[i].created_at - time);
						var small = Math.abs(arrayOfMemos[i === 0 ? 0 : i-1].created_at - time);
						
						if(big > small){
							closestMemoToTime = cleanMemoId(arrayOfMemos[i-1].id);
						}else{
							closestMemoToTime = cleanMemoId(arrayOfMemos[i].id);
						}
					}	
														
					break;//break out of loop when we find memo
				}
				i++
			}
			
		}
		//return memo id cleaned for DOM use
		return closestMemoToTime
	},
	
	createSlotsAndMemos:function(start,end,arrayOfMemos,zoom){
          	
		var slotsAndMemosHtml = '';
		var templates = this.templates.smallMemos;
		
		while(start < end){
			
			var memosHtml = '';
			
			//select memos from data set that are contained in our first 24 hour date range
			var memos = _.select(arrayOfMemos,function(memo){ 	
				return memo.created_at >= start && memo.created_at < (start+zoom);
			});
			
			//loop over each memo, creating correct memo and add it to a html string that we then add to slot
			if(memos.length){//if memos is empty for this loop skip adding it to html and dom
				
				_.each(memos,function(memo){
					if(templates[memo.service]){
						memosHtml += $.tmpl(templates[memo.service], memo).html();
					}else{
						memosHtml += $.tmpl(templates['default'], memo).html();
					}
				});
				
				slotsAndMemosHtml +=
					'<div class="lane-slot" id="'+ start +'">'
					+'	<div class="lane-circle"></div>'
				       	+'	<div class="lane-slot-title">'+ m.utilities.dateFormat(start*1000,'utcLongDate') +'</div>' 
					+'	<div class="lane-slot-memos">'+ memosHtml +'</div>'
					+'</div>';
			}
			
			start += zoom;
		}
	
		return slotsAndMemosHtml;
		
	},
	
	//this function produces an html string containing new memos and new slots
	getHTMLForNewMemos:function(arrayOfMemos){
		//return empty string if no memos are in array
		if(arrayOfMemos.length === 0){return ''};
		
		var secondsInDay = 86400;
		var startDay = arrayOfMemos[0].created_at - (m.utilities.fixedModulus(arrayOfMemos[0].created_at, secondsInDay));
		var endDay = arrayOfMemos[arrayOfMemos.length  - 1].created_at - (m.utilities.fixedModulus(arrayOfMemos[arrayOfMemos.length - 1].created_at, secondsInDay));
		
		if(startDay === endDay){
			endDay += 86399;
		}
		
		//get new html, from templates for new slots and memos
		var slotsAndMemosHtml = this.createSlotsAndMemos(startDay,endDay,arrayOfMemos,secondsInDay);
		
		return slotsAndMemosHtml;
				
	},
	
	//this function copies a current slot, adds new memos, and returns the update slot
	getUpdatedHTMLforNewMemos:function(arrayOfMemos,whichEnd,pend){
	
			//return empty string if no memos are in array
			if(arrayOfMemos.length === 0){return ''};
			
			var templates = m.laneLoadMemos.templates.smallMemos;
			var memosToAddHtml = '';
			
			//create html from templates
			_.each(arrayOfMemos,function(memo){
			
				var memosHtmlOnly = '';
			
				if(templates[memo.service]){
					memosHtmlOnly += $.tmpl(templates[memo.service], memo).html();
				}else{
					memosHtmlOnly += $.tmpl(templates['default'], memo).html();
				}
				
				memosToAddHtml +=  memosHtmlOnly;
				
			});
			
			/*copy the first slot, find the memo slot, add new memos, clone entire slot
			!!! have to have the whichEnd and pend sent so we know if we are dealing with the first slot (ie left/start) or last slot (ie right/end)
			*/
			
			return $('#lane .lane-slot')[whichEnd]() //use braket notation to get a jquery method
						.clone()
						.find('.lane-slot-memos')[pend](memosToAddHtml)
						.end()
						.clone();	

	},
	
	loadMemosRight:function(){
	
		//if the loader is running...then we are loading a set...so cancel		
		if(this.preloadingRight){return false};
		
		var that = this;

		//start preloadingLeft
		this.preloadingRight = true;
		
		//value to change once all images are loaded
		var rightContentLoaded = false;
		
		$.ajax({
			url: '/lanes/'+ m.currentLane.id +'/memos',
			data: {
				timestamp:$('.memo').last().data('time') + 1,
				right:that.numberOfMemosToLoad,
                public_only:m.isEmbedded
			}
		}).success(function(data){
			
			//for now...return if there is no data
			if(data.length === 0){return false};
			
			if(data.length != 1){
				data.shift();//duplicate, not sure if this is always needed? Maybe check ID...
			}
			
			var $laneSlot = $('.lane-slot'), //slots that isotope runs on
				$laneSlotLast = $('.lane-slot').last(),
				$lane = $('#lane'); //this is the scrollable element width is all of slots
				lastSlotTime = parseInt($laneSlot.last().attr('id')),
				secondsInDay = 86400,
				$laneViewport = $('#lane-viewport'),
				$preMemoRight = $('#preMemoRight'),
				$screenRightBtn = $('#screenRightBtn'),
				$slotLoaderRight = $('#slot-loader-right'),
			
			//array of memos to add to slot already in lane
				memosForSlot = _.select(data,function(memo){ 	
					return memo.created_at > lastSlotTime && memo.created_at < (lastSlotTime+secondsInDay);
				}),
			
			//array of memos that are not in a slot yet
				memosNoSlotYet = _.select(data,function(memo){ 	
					return memo.created_at > (lastSlotTime+secondsInDay);
				}),
			
				memosForSlotHtml = that.getUpdatedHTMLforNewMemos(memosForSlot,'last','append'),
				oldWidthBeforeUpdate = $('#lane .lane-slot-memos').last().width(),
			
				memoNoSlotYetHtml = that.getHTMLForNewMemos(memosNoSlotYet);
			
			//place all our new html in preMemoRight, set height of slot, run isotope when images are loaded
			$preMemoRight
				.append(memosForSlotHtml)
				.append(memoNoSlotYetHtml)
				.find('.lane-slot-memos')
				.height($lane.find('.lane-slot-memos').height())
				.end()
				.find('.lane-slot-memos').isotope({ 
					layoutMode : 'fitColumns',
					animationEngine: 'jquery',
					animationOptions: {
						duration: 0,
						queue: false
					}
				});				
				
				//flag to tell interval we are loaded
				that.rightContentLoaded = true;	

			
			//start listening for the user to scroll all the way to the left or 0
			var listenForRightEnd = win.setInterval(function(){
				//console.log($laneViewport[0].scrollLeft);
				if($laneViewport[0].scrollLeft+$laneViewport.width() >= $laneViewport[0].scrollWidth){
				
					clearInterval(listenForRightEnd);
				
					//show slot loader first, then hide left button so you can't click it
					$slotLoaderRight.show();
					$screenRightBtn.hide();
					
					//stop lane, stop drag, stop all movement
					$laneViewport.stop().trigger(m.mouseUpOrTouchEnd);
					m.lane.cancelLaneMovement = true;
				
					
					//setup another interval that waits for images to be loaded
					var listForLoadedMemos = win.setInterval(function(){
					
						if(that.rightContentLoaded){
							
							clearInterval(listForLoadedMemos);
							
							var $openMemo = $('.openMemo');
							var lengthofNew = 0;
							$preMemoRight.find('.lane-slot').each(function(i,e){
								lengthofNew += $(this).width();
							});

							var finalHTML = $preMemoRight.html();
							
							if(memosForSlot.length){

								$lane.width(($lane.width()+lengthofNew)-(oldWidthBeforeUpdate+40));
								$laneSlotLast.remove();
								$lane.append(finalHTML);
								if($openMemo.length){
									$openMemo.css('left',$openMemo[0].offsetLeft+(lengthofNew-(oldWidthBeforeUpdate+40)));
								}		

							}else{
							
								$lane.width(($lane.width()+lengthofNew));
								$lane.append(finalHTML);
								if($openMemo.length){
									$openMemo.css('left',$openMemo[0].offsetLeft+lengthofNew);
								}
							
							}
							
							$preMemoRight.children().remove();
							$slotLoaderRight.hide(); 
							m.lane.cancelLaneMovement = false; //stop lane from moving
							$laneViewport.stop(); // stop animation lane move 
							$screenRightBtn.show();
							that.updateMemoStore(memosForSlot);
							that.updateMemoStore(memosNoSlotYet);
							m.lane.trimLaneLeft();
							that.preloadingRight = false;
						}
					
					},500);	
					
				
				}else if($laneViewport[0].scrollLeft < $laneViewport[0].scrollWidth-($laneViewport.width()*3)){					clearInterval(listenForRightEnd);
					that.preloadingRight = false;
					$preMemoRight.empty();
					
				}
				
			},500);	
		
		});
	
	},
	
	loadMemosLeft:function(){

		//if the loader is running...then we are loading a set...so cancel		
		if(this.preloadingLeft){return false};
		
		var that = this;
		
		//start preloadingLeft
		this.preloadingLeft = true;
		
		//value to change once all images are loaded
		var leftContentLoaded = false;
		
		$.ajax({
			url: '/lanes/'+ m.currentLane.id +'/memos',
			data: {
				timestamp:$('.memo').first().data('time') - 1,
				left:that.numberOfMemosToLoad,
                public_only:m.isEmbedded
			}
		}).success(function(data){
			
			//for now...return if there is no data
			if(data.length === 0){return false};
			
			if(data.length != 1){
				data.pop();//duplicate, not sure if this is always needed? Maybe check ID...
			}
			
			var $laneSlot = $('.lane-slot'), //slots that isotope runs on
				$laneSlotFirst = $('.lane-slot').first(),
				$lane = $('#lane'), //this is the scrollable element width is all of slots
				lastSlotTime = parseInt($laneSlot.eq(0).attr('id')),
				secondsInDay = 86400,
				$laneViewport = $('#lane-viewport'),
				$preMemoLeft = $('#preMemoLeft'),
				$screenLeftBtn = $('#screenLeftBtn'),
				$slotLoaderLeft = $('#slot-loader-left'),
			
			//array of memos to add to slot already in lane
				memosForSlot = _.select(data,function(memo){ 	
					return memo.created_at > lastSlotTime && memo.created_at < (lastSlotTime+secondsInDay);
				}),
			
			//array of memos that are not in a slot yet
				memosNoSlotYet = _.select(data,function(memo){ 	
					return memo.created_at < lastSlotTime;
				}),
			
			
				memosForSlotHtml = that.getUpdatedHTMLforNewMemos(memosForSlot,'first','prepend'),
				oldWidthBeforeUpdate = $('#lane .lane-slot-memos').first().width(),
			
				memoNoSlotYetHtml = that.getHTMLForNewMemos(memosNoSlotYet);
			
			//place all our new html in preMemo, set height of slot, run isotope when images are loaded
			$('#preMemoLeft')
				.append(memosForSlotHtml)
				.prepend(memoNoSlotYetHtml)
				.find('.lane-slot-memos')
				.height($lane.find('.lane-slot-memos').height())
				.end()
				.find('.lane-slot-memos').isotope({ 
						layoutMode : 'fitColumns',
						animationEngine: 'jquery',
						animationOptions: {
							duration: 0,
							queue: false
						}

					});
					
				//flag to tell interval we are loaded
				that.leftContentLoaded = true;

			
			//start listening for the user to scroll all the way to the left or 0
			var listenForLeftEnd = win.setInterval(function(){
				//console.log($laneViewport.scrollLeft());
				if($laneViewport.scrollLeft() <= 0){
				
					clearInterval(listenForLeftEnd);
					
					//show slot loader first, then hide left button so you can't click it
					$slotLoaderLeft.show();
					$screenLeftBtn.hide();
					
					
					
					//stop lane, stop drag, stop all movement
					$laneViewport.stop().trigger(m.mouseUpOrTouchEnd);;
					m.lane.cancelLaneMovement = true;
					
					
					//setup another interval that waits for images to be loaded
					var listForLoadedMemos = win.setInterval(function(){
					
						if(that.leftContentLoaded){
							
							clearInterval(listForLoadedMemos);
							
							var $openMemo = $('.openMemo');
							var lengthofNew = 0;
							$preMemoLeft.find('.lane-slot').each(function(i,e){
								lengthofNew += $(this).width();
							});

							var finalHTML = $preMemoLeft.html();
							if(memosForSlot.length){

								$lane.width(($lane.width()+lengthofNew)-(oldWidthBeforeUpdate+40));
								$laneSlotFirst.remove();
								$lane.prepend(finalHTML);
								$laneViewport.scrollLeft(lengthofNew - (oldWidthBeforeUpdate+40));
								
								if($openMemo.length){
									$openMemo.css('left',$openMemo[0].offsetLeft+(lengthofNew-(oldWidthBeforeUpdate+40)));
								}

							}else{	
							
								$lane.width(($lane.width()+lengthofNew));
								$lane.prepend(finalHTML);
								$laneViewport.scrollLeft(lengthofNew);
								if($openMemo.length){
									$openMemo.css('left',$openMemo[0].offsetLeft+lengthofNew);	
								}
							}
								
							$preMemoLeft.children().remove();
							$slotLoaderLeft.hide(); 
							m.lane.cancelLaneMovement = false; //stop lane from moving
							$laneViewport.stop(); // stop animation lane move 
							$screenLeftBtn.show();
							that.updateMemoStore(memosForSlot);
							that.updateMemoStore(memosNoSlotYet);
							m.lane.trimLaneRight();
							that.preloadingLeft = false;

						}
					
					},500);
				
				}else if($laneViewport[0].scrollLeft >= $laneViewport.width()*3){
					clearInterval(listenForLeftEnd);
					that.preloadingLeft = false;
					$preMemoLeft.empty();
				}
				
			},500);	
			
		});
		
	},
	
	updateMemoStore : function(dataSet){
		var dataSetLength = dataSet.length;
		if(dataSetLength === 0 ){return false};
		var memoStore = m.memos.memoStore;
		var cleanId = m.utilities.cleanMemoId
		var i = 0;
		
		while(i<dataSetLength){
			memoStore[cleanId(dataSet[i].id)] = dataSet[i];
			i++
		}
	},
	
	// if there's an image in the HTML, grab it - otherwise, grab up to 200 chars of text
	// - used for RSS feeds; can be used for others
	pullImageFromHTML:function( html ){
		var $html = $("<span>" + html + "</span>");
		var $img = $html.find("img:first").removeAttr('style').removeAttr('height');
		var toReturn = '';
		
		if ( $img.length ) {
			toReturn = '<div class="fixed-photo-height">'+ $("<div></div>").append( $img ).html() +'</div>';
		}
		else {
			toReturn = '<p>'+ $html.text().substr(0, 200) +"...</p>"
		}
		
		return toReturn;
	},
	
	// for Google Maps
	googleMapImageURL : function( geo ) {
		var poiCount = 0;
		var polyCount = 0;
		
		// handle markers
		var markerList = "&markers=color:0x1587C8|size:small|";
		$.each(geo.poi, function(i, point) {
			markerList += (point.lat + "," + point.lon + "|");
			poiCount++;
		});
		markerList = markerList.slice(0, -1);
		
		//handle polylines
		var polyLineList = "";
		if (geo.polyline) {
			polyLineList = "&path=color:0xE5831A|weight:3|";
			$.each(geo.polyline, function(i, point) {
				polyLineList += (point.lat + "," + point.lon + "|");
				polyCount++;
			});
			polyLineList = polyLineList.slice(0, -1);
		}
		
		// if we have multiple points, Google Maps will automatically specify a sane zoom level
		// but if we only have a single point, we need to specify it manually
		var zoom = "";
		if ( polyCount == 0 && poiCount == 1 ) {
			zoom = "&zoom=14";
		}
		
		return "http://maps.google.com/maps/api/staticmap?size=" + 200 + "x" + 150 + zoom + "&sensor=false" + markerList + "&maptype=roadmap" + polyLineList;
	},
	
	// for MapQuest
	mapquestMapImageURL : function( geo ) {
		var appKey = "Fmjtd%7Cluu2nu0tn5%2C8x%3Do5-h01x9";
		
		var poiCount = 0;
		var polyCount = 0;
		
		// handle markers
		var markerList = "&pois=";
		$.each(geo.poi, function(i, point) {
			markerList += "blue,"+ point.lat +","+ point.lon +"|";
			poiCount++;
		});
		markerList = markerList.slice(0, -1);
		
		//handle polylines
		var polyLineList = "";
		if (geo.polyline) {
			polyLineList = "&polyline=color:0xE5831A|width:3|";
			$.each(geo.polyline, function(i, point) {
				polyLineList += (point.lat + "," + point.lon + ",");
				polyCount++;
			});
			polyLineList = polyLineList.slice(0, -1);
		}
		
		// if we have multiple points, MapQuest will automatically specify a sane zoom level
		// but if we only have a single point, we need to specify it manually
		var zoom = "&bestfit=";
		if ( polyCount == 0 && poiCount == 1 ) {
			zoom = "&zoom=7&center="+ geo.poi[0].lat +","+ geo.poi[0].lon;
		}
		
		return "http://www.mapquestapi.com/staticmap/v3/getmap?key="+ appKey + zoom +"&size=200,150&type=map&imagetype=jpeg&scalebar=false"+ markerList + polyLineList;
	},
	
	
	/*  templates  */
	
	// note: use http://image8.memolane.com/max/200x400/<full_url_of_image> (for resizing images)
	
	templates:{
		smallMemos:{
			'default':
				'<div>'
				+'<div id="${m.utilities.cleanMemoId( id )}" class="memo ${service}" data-time="${created_at}">'
				+'	<div class="memoTitleBar">'
				+'		{{if (source_url)}}'
				+'			<a href="${source_url}" class="memoServiceIcon" title="'+$.i18n.t('Go back to source')+'{{if doc && doc.author && doc.author.name}} ('+$.i18n.t('by','this lane was created by X person')+' ${doc.author.name}){{/if}}"></a>'
				+'		{{else}}'
				+'			<div class="memoServiceIcon" {{if doc && doc.author && doc.author.name}}title="'+$.i18n.t('By','this lane was created by X person')+' ${doc.author.name}"{{/if}}></div>'
				+'		{{/if}}'
				+'		{{if (!m.currentUser || user_id != m.currentUser.userID)}}'
				+'			<a href="/users/${user_id}" class="memoAvatar killEvent" title="'+$.i18n.t('Go to Dashboard')+'">'
				+'				<img src="/users/${user_id}/image.small" height="20" width="20" />'
				+'			</a>'
				+'		{{/if}}'
				+'	</div>'
				+'	<div class="memoContent">'
				+'		{{if doc && doc.image && doc.image.thumbnail}}'
				+'			<img src="${doc.image.thumbnail}" />'
				+'		{{else}}'
				+'			{{if doc && doc.title && doc.title.text}}'
				+'				<p>${doc.title.text}</p>'
				+'			{{/if}}'
				+'		{{/if}}'
				+'	</div>'
				+'	<div class="memoFooterBar">'
				+'		{{if (m.currentUser && m.currentUser.userID == user_id)}}'
				+'			<ul class="memoOwnerActions">'
				+'				<li><div class="memo_icon memo_privacy memo_${privacy}">${privacy}</div></li>'
				+'			</ul>'
				+'		{{/if}}'
				+'		<ul class="memoActions">'
				+'			<li><div class="memo_icon memo_comments{{if (comment_count)}} memo_comments_show{{/if}}">${comment_count}</div></li>'
				+'			<li><div class="memo_icon memo_like{{if (liked_by_current_user)}} memo_liked_by_current_user{{/if}}{{if (like_count)}} memo_like_show{{/if}}">${like_count}</div></li>'
				+'		</ul>'
				+'	</div>'
				+'</div>'
				+'</div>'
			,
			facebook:
				'<div>'
				+'<div id="${m.utilities.cleanMemoId( id )}" class="memo facebook" data-time="${created_at}">'
				+'	<div class="memoTitleBar">'
				+'		{{if (source_url)}}'
				+'			<a href="${source_url}" class="memoServiceIcon" title="'+$.i18n.t('Go back to source')+'"></a>'
				+'		{{else}}'
				+'			<div class="memoServiceIcon"></div>'
				+'		{{/if}}'
				+'		{{if (!m.currentUser || user_id != m.currentUser.userID)}}'
				+'			<a href="/users/${user_id}" class="memoAvatar killEvent" title="'+$.i18n.t('Go to Dashboard')+'">'
				+'				<img src="/users/${user_id}/image.small" height="20" width="20" />'
				+'			</a>'
				+'		{{/if}}'
				+'	</div>'
				// photo
				+'	{{if doc.sub_type == "photo"}}'
				+'		{{if doc.image.sizes && doc.image.sizes.url}}'
				+'			{{if doc.image.sizes.url.width <= 200}}'
				+'				<div class="memoContent" style="height:${doc.image.sizes.url.height}px;">'
				+'					<img src="${doc.image.url}"{{if doc.title}} title="${doc.title.text}"{{else}}{{if doc.description}} title="${doc.description.text}"{{/if}}{{/if}} />'
				+'				</div>'
				+'			{{else}}'
				+'				<div class="memoContent" style="height:${Math.round((doc.image.sizes.url.height/doc.image.sizes.url.width)*200)}px;">'
				+'					<img style="width:200px;" src="${doc.image.url}"{{if doc.title}} title="${doc.title.text}"{{else}}{{if doc.description}} title="${doc.description.text}"{{/if}}{{/if}} />'
				+'				</div>'
				+'			{{/if}}'
				+'		{{else}}'
				+'			<div class="memoContent fixed-photo-height">'
				+'				<img src="${doc.image.url}"{{if doc.title}} title="${doc.title.text}"{{else}}{{if doc.description}} title="${doc.description.text}"{{/if}}{{/if}} />'
				+'			</div>'
				+'		{{/if}}'
				// (anything other than photo)
				+'	{{else}}'
				+'		<div class="memoContent {{if doc.sub_type == "photo"}}memo-fixed-photo-height{{/if}}">'
				// status
				+'			{{if doc.sub_type == "status"}}'
				+'				<p>${doc.title.text}</p>'
				+'			{{/if}}'
				// event
				+'			{{if doc.sub_type == "event"}}'
				+'				<h3>${doc.title.text}</h3>'
				+'				<p>${m.utilities.dateFormat( created_at * 1000, "fullDatePlusTime" ).replace("-", "&middot;")}</p>'
				+'			{{/if}}'
				// note
				+'			{{if doc.sub_type == "note"}}'
				+'				<h3>${doc.title.text}</h3>'
				+'				<p>${jQuery(doc.text.text).text().substr(0, 200) +"..."}</p>'
				+'			{{/if}}'
				// link
				+'			{{if doc.sub_type == "link"}}'
				+'				{{if doc.title && doc.title.text}}<p class="linkTypeText">${doc.title.text}</p>{{/if}}'
				+'				<p class="linkTypeLink aStyle">${doc.link.name}</p>'
				+'			{{/if}}'
				// video
				+'			{{if doc.sub_type == "video" && doc.video.thumbnail}}'
				+'				<img src="${doc.video.thumbnail}" style="height:150px;" />'
				+'				<img src="/img/lane/icon-video.png" class="small-memo-video" alt="video link" />'
				+'			{{/if}}'
				+'		</div>'
				+'	{{/if}}'
				+'	<div class="memoFooterBar">'
				+'		{{if (m.currentUser && m.currentUser.userID == user_id)}}'
				+'			<ul class="memoOwnerActions">'
				+'				<li><div class="memo_icon memo_privacy memo_${privacy}">${privacy}</div></li>'
				+'			</ul>'
				+'		{{/if}}'
				+'		<ul class="memoActions">'
				+'			<li><div class="memo_icon memo_comments{{if (comment_count)}} memo_comments_show{{/if}}">${comment_count}</div></li>'
				+'			<li><div class="memo_icon memo_like{{if (liked_by_current_user)}} memo_liked_by_current_user{{/if}}{{if (like_count)}} memo_like_show{{/if}}">${like_count}</div></li>'
				+'		</ul>'
				+'	</div>'
				+'</div>'
				+'</div>'
			,
			'facebook-pages':
				'<div>'
				+'<div id="${m.utilities.cleanMemoId( id )}" class="memo facebook-pages" data-time="${created_at}">'
				+'	<div class="memoTitleBar">'
				+'		{{if (source_url)}}'
				+'			<a href="${source_url}" class="memoServiceIcon" title="'+$.i18n.t('Go back to source')+'"></a>'
				+'		{{else}}'
				+'			<div class="memoServiceIcon"></div>'
				+'		{{/if}}'
				+'		{{if (!m.currentUser || user_id != m.currentUser.userID)}}'
				+'			<a href="/users/${user_id}" class="memoAvatar killEvent" title="'+$.i18n.t('Go to Dashboard')+'">'
				+'				<img src="/users/${user_id}/image.small" height="20" width="20" />'
				+'			</a>'
				+'		{{/if}}'
				+'	</div>'
				// photo
				+'	{{if doc.sub_type == "photo"}}'
				+'		{{if doc.image.sizes && doc.image.sizes.url}}'
				+'			{{if doc.image.sizes.url.width <= 200}}'
				+'				<div class="memoContent" style="height:${doc.image.sizes.url.height}px;">'
				+'					<img src="${doc.image.url}"{{if doc.title}} title="${doc.title.text}"{{else}}{{if doc.description}} title="${doc.description.text}"{{/if}}{{/if}} />'
				+'				</div>'
				+'			{{else}}'
				+'				<div class="memoContent" style="height:${Math.round((doc.image.sizes.url.height/doc.image.sizes.url.width)*200)}px;">'
				+'					<img style="width:200px;" src="${doc.image.url}"{{if doc.title}} title="${doc.title.text}"{{else}}{{if doc.description}} title="${doc.description.text}"{{/if}}{{/if}} />'
				+'				</div>'
				+'			{{/if}}'
				+'		{{else}}'
				+'			<div class="memoContent fixed-photo-height">'
				+'				<img src="${doc.image.url}"{{if doc.title}} title="${doc.title.text}"{{else}}{{if doc.description}} title="${doc.description.text}"{{/if}}{{/if}} />'
				+'			</div>'
				+'		{{/if}}'
				// (anything other than photo)
				+'	{{else}}'
				+'		<div class="memoContent {{if doc.sub_type == "photo"}}memo-fixed-photo-height{{/if}}">'
				// status
				+'			{{if doc.sub_type == "status"}}'
				+'				<p>${doc.title.text}</p>'
				+'			{{/if}}'
				// event
				+'			{{if doc.sub_type == "event"}}'
				+'				<h3>${doc.title.text}</h3>'
				+'				<p>${m.utilities.dateFormat( created_at * 1000, "fullDatePlusTime" ).replace("-", "&middot;")}</p>'
				+'			{{/if}}'
				// note
				+'			{{if doc.sub_type == "note"}}'
				+'				<h3>${doc.title.text}</h3>'
				+'				<p>${jQuery(doc.text.text).text().substr(0, 200) +"..."}</p>'
				+'			{{/if}}'
				// link
				+'			{{if doc.sub_type == "link"}}'
				+'				{{if doc.title && doc.title.text}}<p class="linkTypeText">${doc.title.text}</p>{{/if}}'
				+'				<p class="linkTypeLink aStyle">${doc.link.name}</p>'
				+'			{{/if}}'
				// video
				+'			{{if doc.sub_type == "video" && doc.video.thumbnail}}'
				+'				<img src="${doc.video.thumbnail}" style="height:150px;" />'
				+'				<img src="/img/lane/icon-video.png" class="small-memo-video" alt="video link" />'
				+'			{{/if}}'
				+'		</div>'
				+'	{{/if}}'
				+'	<div class="memoFooterBar">'
				+'		{{if (m.currentUser && m.currentUser.userID == user_id)}}'
				+'			<ul class="memoOwnerActions">'
				+'				<li><div class="memo_icon memo_privacy memo_${privacy}">${privacy}</div></li>'
				+'			</ul>'
				+'		{{/if}}'
				+'		<ul class="memoActions">'
				+'			<li><div class="memo_icon memo_comments{{if (comment_count)}} memo_comments_show{{/if}}">${comment_count}</div></li>'
				+'			<li><div class="memo_icon memo_like{{if (liked_by_current_user)}} memo_liked_by_current_user{{/if}}{{if (like_count)}} memo_like_show{{/if}}">${like_count}</div></li>'
				+'		</ul>'
				+'	</div>'
				+'</div>'
				+'</div>'
			,
			feed:
				'<div>'
				+'<div id="${m.utilities.cleanMemoId( id )}" class="memo feed" data-time="${created_at}">'
				+'	<div class="memoTitleBar">'
				+'		{{if (source_url)}}'
				+'			<a href="${source_url}" class="memoServiceIcon" title="'+$.i18n.t('Go back to source')+'"></a>'
				+'		{{else}}'
				+'			<div class="memoServiceIcon"></div>'
				+'		{{/if}}'
				+'		{{if (!m.currentUser || user_id != m.currentUser.userID)}}'
				+'			<a href="/users/${user_id}" class="memoAvatar killEvent" title="'+$.i18n.t('Go to Dashboard')+'">'
				+'				<img src="/users/${user_id}/image.small" height="20" width="20" />'
				+'			</a>'
				+'		{{/if}}'
				+'	</div>'
				+'	<div class="memoContent">'
				+'		{{if doc && doc.category && doc.category.text}}'
				+'			<div class="memoHeaderHTML">'
				+'				${doc.category.text}'
				+'				{{if doc.title && doc.title.text}}'
				+'					<br />${doc.title.text}'
				+'				{{/if}}'
				+'			</div>'
				+'		{{/if}}'
				+'		{{if doc.custom_preview}}'
				+'			<span id="custom_preview">{{html doc.custom_preview}}</span>'
				+'		{{else doc && doc.text && doc.text.text}}'
				+'			{{html m.laneLoadMemos.pullImageFromHTML( doc.text.text )}}'
				+'		{{/if}}'
				+'	</div>'
				+'	<div class="memoFooterBar">'
				+'		{{if (m.currentUser && m.currentUser.userID == user_id)}}'
				+'			<ul class="memoOwnerActions">'
				+'				<li><div class="memo_icon memo_privacy memo_${privacy}">${privacy}</div></li>'
				+'			</ul>'
				+'		{{/if}}'
				+'		<ul class="memoActions">'
				+'			<li><div class="memo_icon memo_comments{{if (comment_count)}} memo_comments_show{{/if}}">${comment_count}</div></li>'
				+'			<li><div class="memo_icon memo_like{{if (liked_by_current_user)}} memo_liked_by_current_user{{/if}}{{if (like_count)}} memo_like_show{{/if}}">${like_count}</div></li>'
				+'		</ul>'
				+'	</div>'
				+'</div>'
				+'</div>'
			,
			flickr:
				'<div>'
				+'<div id="${m.utilities.cleanMemoId( id )}" class="memo flickr" data-time="${created_at}">'
				+'	<div class="memoTitleBar">'
				+'		{{if (source_url)}}'
				+'			<a href="${source_url}" class="memoServiceIcon" title="'+$.i18n.t('Go back to source')+'"></a>'
				+'		{{else}}'
				+'			<div class="memoServiceIcon"></div>'
				+'		{{/if}}'
				+'		{{if (!m.currentUser || user_id != m.currentUser.userID)}}'
				+'			<a href="/users/${user_id}" class="memoAvatar killEvent" title="'+$.i18n.t('Go to Dashboard')+'">'
				+'				<img src="/users/${user_id}/image.small" height="20" width="20" />'
				+'			</a>'
				+'		{{/if}}'
				+'	</div>'
				// image
				+'	{{if doc.sub_type == "image"}}'
				+'		{{if doc.image.sizes && doc.image.sizes.thumbnail}}'
				+'			{{if doc.image.sizes.thumbnail.width <= 200}}'
				+'				<div class="memoContent" style="height:${doc.image.sizes.thumbnail.height}px;">'
				+'					<img src="${doc.image.thumbnail}"{{if doc.title}} title="${doc.title.text}"{{else}}{{if doc.description}} title="${doc.description.text}"{{/if}}{{/if}} />'
				+'				</div>'
				+'			{{else}}'
				+'				<div class="memoContent" style="height:${Math.round((doc.image.sizes.thumbnail.height/doc.image.sizes.thumbnail.width)*200)}px;">'
				+'					<img style="width:200px;" src="${doc.image.thumbnail}"{{if doc.title}} title="${doc.title.text}"{{else}}{{if doc.description}} title="${doc.description.text}"{{/if}}{{/if}} />'
				+'				</div>'
				+'			{{/if}}'
				+'		{{else}}'
				+'			<div class="memoContent fixed-photo-height">'
				+'				<img src="${doc.image.thumbnail}"{{if doc.title}} title="${doc.title.text}"{{else}}{{if doc.description}} title="${doc.description.text}"{{/if}}{{/if}} />'
				+'			</div>'
				+'		{{/if}}'
				// video
				+'	{{else}}'
				+'		<div class="memoContent">'
				+'			<img style="height:150px;" src="${doc.video.thumbnail}"{{if doc.title}} title="${doc.title.text}"{{else}}{{if doc.description}} title="${doc.description.text}"{{/if}}{{/if}} />'
				+'			<img src="/img/lane/icon-video.png" class="small-memo-video" alt="video link" />'
				+'		</div>'
				+'	{{/if}}'
				+'	<div class="memoFooterBar">'
				+'		{{if (m.currentUser && m.currentUser.userID == user_id)}}'
				+'			<ul class="memoOwnerActions">'
				+'				<li><div class="memo_icon memo_privacy memo_${privacy}">${privacy}</div></li>'
				+'			</ul>'
				+'		{{/if}}'
				+'		<ul class="memoActions">'
				+'			<li><div class="memo_icon memo_comments{{if (comment_count)}} memo_comments_show{{/if}}">${comment_count}</div></li>'
				+'			<li><div class="memo_icon memo_like{{if (liked_by_current_user)}} memo_liked_by_current_user{{/if}}{{if (like_count)}} memo_like_show{{/if}}">${like_count}</div></li>'
				+'		</ul>'
				+'	</div>'
				+'</div>'
				+'</div>'
			,
			foursquare:
				'<div>'
				+'<div id="${m.utilities.cleanMemoId( id )}" class="memo foursquare" data-time="${created_at}">'
				+'	<div class="memoTitleBar">'
				+'		{{if (source_url)}}'
				+'			<a href="${source_url}" class="memoServiceIcon" title="'+$.i18n.t('Go back to source')+'"></a>'
				+'		{{else}}'
				+'			<div class="memoServiceIcon"></div>'
				+'		{{/if}}'
				+'		{{if (!m.currentUser || user_id != m.currentUser.userID)}}'
				+'			<a href="/users/${user_id}" class="memoAvatar killEvent" title="'+$.i18n.t('Go to Dashboard')+'">'
				+'				<img src="/users/${user_id}/image.small" height="20" width="20" />'
				+'			</a>'
				+'		{{/if}}'
				+'	</div>'
				+'	<div class="memoContent">'
				+'		{{if doc.title && doc.title.text}}<p>At ${doc.title.text}</p>{{/if}}'
				+'		<img src="${m.laneLoadMemos.mapquestMapImageURL( doc.geo )}" width="200" height="150"{{if doc.title}} title="${doc.title.text}"{{else}}{{if doc.description}} title="${doc.description.text}"{{/if}}{{/if}} />'
				+'		{{if doc.image && doc.image.thumbnail}}<img src="${doc.image.thumbnail}" class="smallInsetImage" />{{/if}}'
				+'	</div>'
				+'	<div class="memoFooterBar">'
				+'		{{if (m.currentUser && m.currentUser.userID == user_id)}}'
				+'			<ul class="memoOwnerActions">'
				+'				<li><div class="memo_icon memo_privacy memo_${privacy}">${privacy}</div></li>'
				+'			</ul>'
				+'		{{/if}}'
				+'		<ul class="memoActions">'
				+'			<li><div class="memo_icon memo_comments{{if (comment_count)}} memo_comments_show{{/if}}">${comment_count}</div></li>'
				+'			<li><div class="memo_icon memo_like{{if (liked_by_current_user)}} memo_liked_by_current_user{{/if}}{{if (like_count)}} memo_like_show{{/if}}">${like_count}</div></li>'
				+'		</ul>'
				+'	</div>'
				+'</div>'
				+'</div>'
			,
			'google-plus':
				'<div>'
				+'<div id="${m.utilities.cleanMemoId( id )}" class="memo ${service}" data-time="${created_at}">'
				+'	<div class="memoTitleBar">'
				+'		{{if (source_url)}}'
				+'			<a href="${source_url}" class="memoServiceIcon" title="'+$.i18n.t('Go back to source')+'{{if doc && doc.author && doc.author.name}} ('+$.i18n.t('by','this lane was created by X person')+' ${doc.author.name}){{/if}}"></a>'
				+'		{{else}}'
				+'			<div class="memoServiceIcon" {{if doc && doc.author && doc.author.name}}title="'+$.i18n.t('By','this lane was created by X person')+' ${doc.author.name}"{{/if}}></div>'
				+'		{{/if}}'
				+'		{{if (!m.currentUser || user_id != m.currentUser.userID)}}'
				+'			<a href="/users/${user_id}" class="memoAvatar killEvent" title="'+$.i18n.t('Go to Dashboard')+'">'
				+'				<img src="/users/${user_id}/image.small" height="20" width="20" />'
				+'			</a>'
				+'		{{/if}}'
				+'	</div>'
				+'	<div class="memoContent">'
				+'	{{if doc && doc.attachment}}'
				// video
				//	- this does not yet account for the image ratios sent to us by G+ - this feature should be added (and is already done for other services)
				//+'		{{if (doc.attachment[0].sub_type == "video") && doc.attachment[0].image && doc.attachment[0].image.thumbnail}}'
				//+'			<div class="memoContent fixed-photo-height">'
				//+'				<img src="${doc.attachment[0].image.thumbnail}" style="width:200px;" />'
				//+'				<img src="/img/lane/icon-video.png" class="small-memo-video" alt="video link" />'
				//+'			</div>'
				//+'		{{/if}}'
				// photo album
				//	- this does not yet account for the image ratios sent to us by G+ - this feature should be added (and is already done for other services)
				+'		{{if (doc.attachment[0].sub_type == "photo-album")}}'
				+'			{{if doc.attachment[1] && doc.attachment[1].sub_type == "photo"}}'
				+'				<div class="memoContent fixed-photo-height">'
				+'					<img src="${doc.attachment[1].image.thumbnail}" />'
				+'					{{if doc.attachment[2] && doc.attachment[2].sub_type == "photo"}}'
				+'						<img src="/img/lane/icon-album.png" class="small-memo-album" alt="album link" />'
				+'					{{/if}}'
				+'				</div>'
				+'			{{else doc.attachment[0].group && doc.attachment[0].group.name && doc.attachment[0].group.name.length > 0}}'
				+'				<p>${doc.attachment[0].group.name}</p>'
				+'			{{else}}'
				+'				<p>${doc.title.text}</p>'
				+'			{{/if}}'
				+'		{{/if}}'
				// photo
				//	- this does not yet account for the image ratios sent to us by G+ - this feature should be added (and is already done for other services)
				+'		{{if (doc.attachment[0].sub_type == "photo") && doc.attachment[0].image && doc.attachment[0].image.thumbnail}}'
				+'			<div class="memoContent fixed-photo-height">'
				+'				<img src="${doc.attachment[0].image.thumbnail}" />'
				+'				{{if doc.attachment[1] && doc.attachment[1].sub_type == "photo"}}'
				+'					<img src="/img/lane/icon-album.png" class="small-memo-album" alt="album link" />'
				+'				{{/if}}'
				+'			</div>'
				+'		{{/if}}'
				// link
				+'		{{if doc && doc.attachment[0].article && doc.attachment[0].article.title}}'
				+'			{{if doc.title.text && doc.title.text.length>0}}<p class="linkTypeText">${doc.title.text}</p>{{/if}}'
				+'			<p class="linkTypeLink aStyle">${doc.attachment[0].article.title}</p>'
				+'		{{/if}}'
				+'	{{else}}'
				// status only
				+'		<p>${doc.title.text}</p>'
				+'	{{/if}}'
				+'	</div>'
				+'	<div class="memoFooterBar">'
				+'		{{if (m.currentUser && m.currentUser.userID == user_id)}}'
				+'			<ul class="memoOwnerActions">'
				+'				<li><div class="memo_icon memo_privacy memo_${privacy}">${privacy}</div></li>'
				+'			</ul>'
				+'		{{/if}}'
				+'		<ul class="memoActions">'
				+'			<li><div class="memo_icon memo_comments{{if (comment_count)}} memo_comments_show{{/if}}">${comment_count}</div></li>'
				+'			<li><div class="memo_icon memo_like{{if (liked_by_current_user)}} memo_liked_by_current_user{{/if}}{{if (like_count)}} memo_like_show{{/if}}">${like_count}</div></li>'
				+'		</ul>'
				+'	</div>'
				+'</div>'
				+'</div>'
			,
			instagram:
				'<div>'
				+'<div id="${m.utilities.cleanMemoId( id )}" class="memo instagram" data-time="${created_at}">'
				+'	<div class="memoTitleBar">'
				+'		{{if (source_url)}}'
				+'			<a href="${source_url}" class="memoServiceIcon" title="'+$.i18n.t('Go back to source')+'"></a>'
				+'		{{else}}'
				+'			<div class="memoServiceIcon"></div>'
				+'		{{/if}}'
				+'		{{if (!m.currentUser || user_id != m.currentUser.userID)}}'
				+'			<a href="/users/${user_id}" class="memoAvatar killEvent" title="'+$.i18n.t('Go to Dashboard')+'">'
				+'				<img src="/users/${user_id}/image.small" height="20" width="20" />'
				+'			</a>'
				+'		{{/if}}'
				+'	</div>'
				+'	<div class="memoContent">'
				+'		<img src="${doc.image.thumbnail}"{{if doc.title && doc.title.text}} title="${doc.title.text}"{{else}} title="Instagram photo"{{/if}} height="150" width="150" />'
				+'	</div>'
				+'	<div class="memoFooterBar">'
				+'		{{if (m.currentUser && m.currentUser.userID == user_id)}}'
				+'			<ul class="memoOwnerActions">'
				+'				<li><div class="memo_icon memo_privacy memo_${privacy}">${privacy}</div></li>'
				+'			</ul>'
				+'		{{/if}}'
				+'		<ul class="memoActions">'
				+'			<li><div class="memo_icon memo_comments{{if (comment_count)}} memo_comments_show{{/if}}">${comment_count}</div></li>'
				+'			<li><div class="memo_icon memo_like{{if (liked_by_current_user)}} memo_liked_by_current_user{{/if}}{{if (like_count)}} memo_like_show{{/if}}">${like_count}</div></li>'
				+'		</ul>'
				+'	</div>'
				+'</div>'
				+'</div>'
			,
			lastfm:
				'<div>'
				+'<div id="${m.utilities.cleanMemoId( id )}" class="memo lastfm" data-time="${created_at}">'
				+'	<div class="memoTitleBar">'
				+'		{{if (source_url)}}'
				+'			<a href="${source_url}" class="memoServiceIcon" title="'+$.i18n.t('Go back to source')+'"></a>'
				+'		{{else}}'
				+'			<div class="memoServiceIcon"></div>'
				+'		{{/if}}'
				+'		{{if (!m.currentUser || user_id != m.currentUser.userID)}}'
				+'			<a href="/users/${user_id}" class="memoAvatar killEvent" title="'+$.i18n.t('Go to Dashboard')+'">'
				+'				<img src="/users/${user_id}/image.small" height="20" width="20" />'
				+'			</a>'
				+'		{{/if}}'
				+'	</div>'
				+'	<div class="memoContent">'
				+'		{{if (doc.track && doc.track.artist && doc.track.artist.thumbnail)}}'
				+'			<div class="lastfmImgMask">'
				+'				<img src="${doc.track.artist.thumbnail}" alt="'+$.i18n.t('By')+' ${doc.track.artist.name}" />'
				+'				<h3>${doc.track.artist.name}</h3>'
				+'				<p>${doc.track.name}</p>'
				+'			</div>'
				+'		{{else}}'
				+'			<div style="margin:10px;">'
				+'				<h3>${doc.track.artist.name}</h3>'
				+'				<p>${doc.track.name}</p>'
				+'			</div>'
				+'		{{/if}}'
				+'	</div>'
				+'	<div class="memoFooterBar">'
				+'		{{if (m.currentUser && m.currentUser.userID == user_id)}}'
				+'			<ul class="memoOwnerActions">'
				+'				<li><div class="memo_icon memo_privacy memo_${privacy}">${privacy}</div></li>'
				+'			</ul>'
				+'		{{/if}}'
				+'		<ul class="memoActions">'
				+'			<li><div class="memo_icon memo_comments{{if (comment_count)}} memo_comments_show{{/if}}">${comment_count}</div></li>'
				+'			<li><div class="memo_icon memo_like{{if (liked_by_current_user)}} memo_liked_by_current_user{{/if}}{{if (like_count)}} memo_like_show{{/if}}">${like_count}</div></li>'
				+'		</ul>'
				+'	</div>'
				+'</div>'
				+'</div>'
			,
			mixi:
				'<div>'
				+'<div id="${m.utilities.cleanMemoId( id )}" class="memo ${service}" data-time="${created_at}">'
				+'	<div class="memoTitleBar">'
				+'		{{if (source_url)}}'
				+'			<a href="${source_url}" class="memoServiceIcon" title="'+$.i18n.t('Go back to source')+'{{if doc && doc.author && doc.author.name}} ('+$.i18n.t('by','this lane was created by X person')+' ${doc.author.name}){{/if}}"></a>'
				+'		{{else}}'
				+'			<div class="memoServiceIcon" {{if doc && doc.author && doc.author.name}}title="'+$.i18n.t('By','this lane was created by X person')+' ${doc.author.name}"{{/if}}></div>'
				+'		{{/if}}'
				+'		{{if (!m.currentUser || user_id != m.currentUser.userID)}}'
				+'			<a href="/users/${user_id}" class="memoAvatar killEvent" title="'+$.i18n.t('Go to Dashboard')+'">'
				+'				<img src="/users/${user_id}/image.small" height="20" width="20" />'
				+'			</a>'
				+'		{{/if}}'
				+'	</div>'
				+'	<div class="memoContent">'
				// photo(s)
				+'		{{if doc && doc.sub_type == "photo"}}'
				+'			<div class="memoContent fixed-photo-height">'
				+'				<img src="${doc.attachment[0].thumbnailUrl}" />'
				+'				{{if doc.attachment[1]}}'
				+'					<img src="/img/lane/icon-album.png" class="small-memo-album" alt="album link" />'
				+'				{{/if}}'
				+'			</div>'
				// voice or status only
				+'		{{else}}'
				+'			<p>{{html m.utilities.convertURLstringsToAnchors( doc.title.text, true )}}</p>'
				+'		{{/if}}'
				+'	</div>'
				+'	<div class="memoFooterBar">'
				+'		{{if (m.currentUser && m.currentUser.userID == user_id)}}'
				+'			<ul class="memoOwnerActions">'
				+'				<li><div class="memo_icon memo_privacy memo_${privacy}">${privacy}</div></li>'
				+'			</ul>'
				+'		{{/if}}'
				+'		<ul class="memoActions">'
				+'			<li><div class="memo_icon memo_comments{{if (comment_count)}} memo_comments_show{{/if}}">${comment_count}</div></li>'
				+'			<li><div class="memo_icon memo_like{{if (liked_by_current_user)}} memo_liked_by_current_user{{/if}}{{if (like_count)}} memo_like_show{{/if}}">${like_count}</div></li>'
				+'		</ul>'
				+'	</div>'
				+'</div>'
				+'</div>'
			,
			myspace:
				'<div>'
				+'<div id="${m.utilities.cleanMemoId( id )}" class="memo myspace" data-time="${created_at}">'
				+'	<div class="memoTitleBar">'
				+'		{{if (source_url)}}'
				+'			<a href="${source_url}" class="memoServiceIcon" title="'+$.i18n.t('Go back to source')+'"></a>'
				+'		{{else}}'
				+'			<div class="memoServiceIcon"></div>'
				+'		{{/if}}'
				+'		{{if (!m.currentUser || user_id != m.currentUser.userID)}}'
				+'			<a href="/users/${user_id}" class="memoAvatar killEvent" title="'+$.i18n.t('Go to Dashboard')+'">'
				+'				<img src="/users/${user_id}/image.small" height="20" width="20" />'
				+'			</a>'
				+'		{{/if}}'
				+'	</div>'
				+'	<div class="memoContent">'
				// mood
				+'		{{if doc.sub_type == "mood"}}'
				+'			<p>{{if doc.title && doc.title.thumbnail}}<img src="${doc.title.thumbnail}" alt="mood image" style="padding-right:5px; float:left;" />{{/if}}${doc.title.text}</p>'
				+'		{{/if}}'
				// photo
				+'		{{if doc.sub_type == "photo"}}'
				+'			<img class="memo-mainPhoto" src="${doc.image.url}"{{if doc.title}} title="${doc.title.text}"{{else}}{{if doc.description}} title="${doc.description.text}"{{/if}}{{/if}} />'
				+'		{{/if}}'
				// video
				+'		{{if doc.sub_type == "video"}}'
				+'			<img style="height:150px;" src="${doc.video.thumbnail}"{{if doc.title}} title="${doc.title.text}"{{else}}{{if doc.description}} title="${doc.description.text}"{{/if}}{{/if}} />'
				+'			<img src="/img/lane/icon-video.png" class="small-memo-video" alt="video link" />'
				+'		{{/if}}'
				+'	</div>'
				+'	<div class="memoFooterBar">'
				+'		{{if (m.currentUser && m.currentUser.userID == user_id)}}'
				+'			<ul class="memoOwnerActions">'
				+'				<li><div class="memo_icon memo_privacy memo_${privacy}">${privacy}</div></li>'
				+'			</ul>'
				+'		{{/if}}'
				+'		<ul class="memoActions">'
				+'			<li><div class="memo_icon memo_comments{{if (comment_count)}} memo_comments_show{{/if}}">${comment_count}</div></li>'
				+'			<li><div class="memo_icon memo_like{{if (liked_by_current_user)}} memo_liked_by_current_user{{/if}}{{if (like_count)}} memo_like_show{{/if}}">${like_count}</div></li>'
				+'		</ul>'
				+'	</div>'
				+'</div>'
				+'</div>'
			,
			picasa:
				'<div>'
				+'<div id="${m.utilities.cleanMemoId( id )}" class="memo picasa" data-time="${created_at}">'
				+'	<div class="memoTitleBar">'
				+'		{{if (source_url)}}'
				+'			<a href="${source_url}" class="memoServiceIcon" title="'+$.i18n.t('Go back to source')+'"></a>'
				+'		{{else}}'
				+'			<div class="memoServiceIcon"></div>'
				+'		{{/if}}'
				+'		{{if (!m.currentUser || user_id != m.currentUser.userID)}}'
				+'			<a href="/users/${user_id}" class="memoAvatar killEvent" title="'+$.i18n.t('Go to Dashboard')+'">'
				+'				<img src="/users/${user_id}/image.small" height="20" width="20" />'
				+'			</a>'
				+'		{{/if}}'
				+'	</div>'
				+'	{{if doc.image.sizes && doc.image.sizes.thumbnail}}'
				+'		{{if doc.image.sizes.thumbnail.width <= 200}}'
				+'			<div class="memoContent" style="height:${doc.image.sizes.thumbnail.height}px;">'
				+'				<img src="${doc.image.thumbnail}"{{if doc.title}} title="${doc.title.text}"{{else}}{{if doc.description}} title="${doc.description.text}"{{/if}}{{/if}} />'
				+'			</div>'
				+'		{{else}}'
				+'			<div class="memoContent" style="height:${Math.round((doc.image.sizes.thumbnail.height/doc.image.sizes.thumbnail.width)*200)}px;">'
				+'				<img style="width:200px;" src="${doc.image.thumbnail}"{{if doc.title}} title="${doc.title.text}"{{else}}{{if doc.description}} title="${doc.description.text}"{{/if}}{{/if}} />'
				+'			</div>'
				+'		{{/if}}'
				+'	{{else}}'
				+'		<div class="memoContent fixed-photo-height">'
				+'			<img src="{{if doc.image.thumbnail}}${doc.image.thumbnail}{{else}}${doc.image.url}{{/if}}"{{if doc.title}} title="${doc.title.text}"{{else}}{{if doc.description}} title="${doc.description.text}"{{/if}}{{/if}} />'
				+'		</div>'
				+'	{{/if}}'
				+'	<div class="memoFooterBar">'
				+'		{{if (m.currentUser && m.currentUser.userID == user_id)}}'
				+'			<ul class="memoOwnerActions">'
				+'				<li><div class="memo_icon memo_privacy memo_${privacy}">${privacy}</div></li>'
				+'			</ul>'
				+'		{{/if}}'
				+'		<ul class="memoActions">'
				+'			<li><div class="memo_icon memo_comments{{if (comment_count)}} memo_comments_show{{/if}}">${comment_count}</div></li>'
				+'			<li><div class="memo_icon memo_like{{if (liked_by_current_user)}} memo_liked_by_current_user{{/if}}{{if (like_count)}} memo_like_show{{/if}}">${like_count}</div></li>'
				+'		</ul>'
				+'	</div>'
				+'</div>'
				+'</div>'
			,
			soundcloud:
				'<div>'
				+'<div id="${m.utilities.cleanMemoId( id )}" class="memo soundcloud" data-time="${created_at}">'
				+'	<div class="memoTitleBar">'
				+'		{{if (source_url)}}'
				+'			<a href="${source_url}" class="memoServiceIcon" title="'+$.i18n.t('Go back to source')+'"></a>'
				+'		{{else}}'
				+'			<div class="memoServiceIcon"></div>'
				+'		{{/if}}'
				+'		{{if (!m.currentUser || user_id != m.currentUser.userID)}}'
				+'			<a href="/users/${user_id}" class="memoAvatar killEvent" title="'+$.i18n.t('Go to Dashboard')+'">'
				+'				<img src="/users/${user_id}/image.small" height="20" width="20" />'
				+'			</a>'
				+'		{{/if}}'
				+'	</div>'
				+'	<div class="memoContent">'
				+'		<p>${doc.title.text}</p>'
				+'		{{if doc.waveform && doc.waveform.url}}<img src="${doc.waveform.url}" class="soundcloud-waveform" width="200" height="31" title="waveform for this track" />{{/if}}'
				+'	</div>'
				+'	<div class="memoFooterBar">'
				+'		{{if (m.currentUser && m.currentUser.userID == user_id)}}'
				+'			<ul class="memoOwnerActions">'
				+'				<li><div class="memo_icon memo_privacy memo_${privacy}">${privacy}</div></li>'
				+'			</ul>'
				+'		{{/if}}'
				+'		<ul class="memoActions">'
				+'			<li><div class="memo_icon memo_comments{{if (comment_count)}} memo_comments_show{{/if}}">${comment_count}</div></li>'
				+'			<li><div class="memo_icon memo_like{{if (liked_by_current_user)}} memo_liked_by_current_user{{/if}}{{if (like_count)}} memo_like_show{{/if}}">${like_count}</div></li>'
				+'		</ul>'
				+'	</div>'
				+'</div>'
				+'</div>'
			,
			tripit:
				'<div>'
				+'<div id="${m.utilities.cleanMemoId( id )}" class="memo tripit" data-time="${created_at}">'
				+'	<div class="memoTitleBar">'
				+'		{{if (source_url)}}'
				+'			<a href="${source_url}" class="memoServiceIcon" title="'+$.i18n.t('Go back to source')+'"></a>'
				+'		{{else}}'
				+'			<div class="memoServiceIcon"></div>'
				+'		{{/if}}'
				+'		{{if (!m.currentUser || user_id != m.currentUser.userID)}}'
				+'			<a href="/users/${user_id}" class="memoAvatar killEvent" title="'+$.i18n.t('Go to Dashboard')+'">'
				+'				<img src="/users/${user_id}/image.small" height="20" width="20" />'
				+'			</a>'
				+'		{{/if}}'
				+'	</div>'
				+'	<div class="memoContent">'
				+'		<p style="text-align:center;">'
				+'		{{each doc.geo.poi}}'
				+'			${$value.name.substr(-3)}'
				+'			{{if $index < (doc.geo.poi.length - 1)}}<strong class="tripArrow">&rarr;</strong>{{/if}}'
				+'		{{/each}}'
				+'		</p>'
				+'		<img src="${m.laneLoadMemos.mapquestMapImageURL( doc.geo )}" width="200" height="150"{{if doc.title}} title="${doc.title.text}"{{else}}{{if doc.description}} title="${doc.description.text}"{{/if}}{{/if}} />'
				+'	</div>'
				+'	<div class="memoFooterBar">'
				+'		{{if (m.currentUser && m.currentUser.userID == user_id)}}'
				+'			<ul class="memoOwnerActions">'
				+'				<li><div class="memo_icon memo_privacy memo_${privacy}">${privacy}</div></li>'
				+'			</ul>'
				+'		{{/if}}'
				+'		<ul class="memoActions">'
				+'			<li><div class="memo_icon memo_comments{{if (comment_count)}} memo_comments_show{{/if}}">${comment_count}</div></li>'
				+'			<li><div class="memo_icon memo_like{{if (liked_by_current_user)}} memo_liked_by_current_user{{/if}}{{if (like_count)}} memo_like_show{{/if}}">${like_count}</div></li>'
				+'		</ul>'
				+'	</div>'
				+'</div>'
				+'</div>'
			,
			twitter:
				'<div>'
				+'<div id="${m.utilities.cleanMemoId( id )}" class="memo twitter" data-time="${created_at}">'
				+'	<div class="memoTitleBar">'
				+'		{{if (source_url)}}'
				+'			<a href="${source_url}" class="memoServiceIcon" title="Go back to source{{if doc.author && doc.author.name}} (by ${doc.author.name}){{/if}}"></a>'
				+'		{{else}}'
				+'			<div class="memoServiceIcon" {{if doc.author && doc.author.name}}title="'+$.i18n.t('By')+' ${doc.author.name}"{{/if}}></div>'
				+'		{{/if}}'
				+'		{{if (!m.currentUser || user_id != m.currentUser.userID)}}'
				+'			<a href="/users/${user_id}" class="memoAvatar killEvent" title="'+$.i18n.t('Go to Dashboard')+'">'
				+'				<img src="/users/${user_id}/image.small" height="20" width="20" />'
				+'			</a>'
				+'		{{/if}}'
				+'	</div>'
				+'	{{if doc.image}}'
				+'		{{if doc.image.sizes && doc.image.sizes.thumbnail}}'
				+'			{{if doc.image.sizes.thumbnail.width <= 200}}'
				+'				<div class="memoContent" style="height:${doc.image.sizes.thumbnail.height}px;">'
				+'					<img src="${doc.image.thumbnail}"{{if doc.title}} title="${doc.title.text}"{{else}}{{if doc.description}} title="${doc.description.text}"{{/if}}{{/if}} />'
				+'				</div>'
				+'			{{else}}'
				+'				<div class="memoContent" style="height:${Math.round((doc.image.sizes.thumbnail.height/doc.image.sizes.thumbnail.width)*200)}px;">'
				+'					<img style="width:200px;" src="${doc.image.thumbnail}"{{if doc.title}} title="${doc.title.text}"{{else}}{{if doc.description}} title="${doc.description.text}"{{/if}}{{/if}} />'
				+'				</div>'
				+'			{{/if}}'
				+'		{{else}}'
				+'			<div class="memoContent fixed-photo-height">'
				+'				<img src="{{if doc.image.thumbnail}}${doc.image.thumbnail}{{else}}${doc.image.url}{{/if}}"{{if doc.title}} title="${doc.title.text}"{{else}}{{if doc.description}} title="${doc.description.text}"{{/if}}{{/if}} />'
				+'			</div>'
				+'		{{/if}}'
				+'	{{else}}'
				+'		<div class="memoContent">'
				+'			<p>{{html m.utilities.convertURLstringsToAnchors( doc.title.text, true )}}</p>'
				+'		</div>'
				+'	{{/if}}'
				+'	<div class="memoFooterBar">'
				+'		{{if (m.currentUser && m.currentUser.userID == user_id)}}'
				+'			<ul class="memoOwnerActions">'
				+'				<li><div class="memo_icon memo_privacy memo_${privacy}">${privacy}</div></li>'
				+'			</ul>'
				+'		{{/if}}'
				+'		<ul class="memoActions">'
				+'			<li><div class="memo_icon memo_comments{{if (comment_count)}} memo_comments_show{{/if}}">${comment_count}</div></li>'
				+'			<li><div class="memo_icon memo_like{{if (liked_by_current_user)}} memo_liked_by_current_user{{/if}}{{if (like_count)}} memo_like_show{{/if}}">${like_count}</div></li>'
				+'		</ul>'
				+'	</div>'
				+'</div>'
				+'</div>'
			,
			vimeo:
				'<div>'
				+'<div id="${m.utilities.cleanMemoId( id )}" class="memo vimeo" data-time="${created_at}">'
				+'	<div class="memoTitleBar">'
				+'		{{if (source_url)}}'
				+'			<a href="${source_url}" class="memoServiceIcon" title="'+$.i18n.t('Go back to source')+'"></a>'
				+'		{{else}}'
				+'			<div class="memoServiceIcon"></div>'
				+'		{{/if}}'
				+'		{{if (!m.currentUser || user_id != m.currentUser.userID)}}'
				+'			<a href="/users/${user_id}" class="memoAvatar killEvent" title="'+$.i18n.t('Go to Dashboard')+'">'
				+'				<img src="/users/${user_id}/image.small" height="20" width="20" />'
				+'			</a>'
				+'		{{/if}}'
				+'	</div>'
				+'	<div class="memoContent">'
				+'		{{if doc.video && doc.video.thumbnail}}'
				+'			<img style="height:150px;" src="${doc.video.thumbnail}"{{if doc.title}} title="${doc.title.text}"{{else}}{{if doc.description}} title="${doc.description.text}"{{/if}}{{/if}} />'
				+'			<img src="/img/lane/icon-video.png" class="small-memo-video" alt="video link" />'
				+'		{{/if}}'
				+'	</div>'
				+'	<div class="memoFooterBar">'
				+'		{{if (m.currentUser && m.currentUser.userID == user_id)}}'
				+'			<ul class="memoOwnerActions">'
				+'				<li><div class="memo_icon memo_privacy memo_${privacy}">${privacy}</div></li>'
				+'			</ul>'
				+'		{{/if}}'
				+'		<ul class="memoActions">'
				+'			<li><div class="memo_icon memo_comments{{if (comment_count)}} memo_comments_show{{/if}}">${comment_count}</div></li>'
				+'			<li><div class="memo_icon memo_like{{if (liked_by_current_user)}} memo_liked_by_current_user{{/if}}{{if (like_count)}} memo_like_show{{/if}}">${like_count}</div></li>'
				+'		</ul>'
				+'	</div>'
				+'</div>'
				+'</div>'
			,
			wordpress:
				'<div>'
				+'<div id="${m.utilities.cleanMemoId( id )}" class="memo wordpress" data-time="${created_at}">'
				+'	<div class="memoTitleBar">'
				+'		{{if (source_url)}}'
				+'			<a href="${source_url}" class="memoServiceIcon" title="'+$.i18n.t('Go back to source')+'"></a>'
				+'		{{else}}'
				+'			<div class="memoServiceIcon"></div>'
				+'		{{/if}}'
				+'		{{if (!m.currentUser || user_id != m.currentUser.userID)}}'
				+'			<a href="/users/${user_id}" class="memoAvatar killEvent" title="'+$.i18n.t('Go to Dashboard')+'">'
				+'				<img src="/users/${user_id}/image.small" height="20" width="20" />'
				+'			</a>'
				+'		{{/if}}'
				+'	</div>'
				+'	<div class="memoContent">'
				+'		{{if doc}}'
				+'			{{if doc.category && doc.category.text}}'
				+'				<div class="memoHeaderHTML">'
				+'					${doc.category.text}'
				+'					{{if doc.title && doc.title.text}}'
				+'						<br />${doc.title.text}'
				+'					{{/if}}'
				+'				</div>'
				+'			{{/if}}'
				+'			{{if doc.text && doc.text.text}}'
				+'				{{html m.laneLoadMemos.pullImageFromHTML( doc.text.text )}}'
				+'			{{/if}}'
				+'		{{/if}}'
				+'	</div>'
				+'	<div class="memoFooterBar">'
				+'		{{if (m.currentUser && m.currentUser.userID == user_id)}}'
				+'			<ul class="memoOwnerActions">'
				+'				<li><div class="memo_icon memo_privacy memo_${privacy}">${privacy}</div></li>'
				+'			</ul>'
				+'		{{/if}}'
				+'		<ul class="memoActions">'
				+'			<li><div class="memo_icon memo_comments{{if (comment_count)}} memo_comments_show{{/if}}">${comment_count}</div></li>'
				+'			<li><div class="memo_icon memo_like{{if (liked_by_current_user)}} memo_liked_by_current_user{{/if}}{{if (like_count)}} memo_like_show{{/if}}">${like_count}</div></li>'
				+'		</ul>'
				+'	</div>'
				+'</div>'
				+'</div>'
			,
			youtube:
				'<div>'
				+'<div id="${m.utilities.cleanMemoId( id )}" class="memo youtube" data-time="${created_at}">'
				+'	<div class="memoTitleBar">'
				+'		{{if (source_url)}}'
				+'			<a href="${source_url}" class="memoServiceIcon" title="'+$.i18n.t('Go back to source')+'"></a>'
				+'		{{else}}'
				+'			<div class="memoServiceIcon"></div>'
				+'		{{/if}}'
				+'		{{if (!m.currentUser || user_id != m.currentUser.userID)}}'
				+'			<a href="/users/${user_id}" class="memoAvatar killEvent" title="'+$.i18n.t('Go to Dashboard')+'">'
				+'				<img src="/users/${user_id}/image.small" height="20" width="20" />'
				+'			</a>'
				+'		{{/if}}'
				+'	</div>'
				+'	<div class="memoContent">'
				+'		{{if doc.video && doc.video.thumbnail}}'
				+'			<img src="${doc.video.thumbnail}"{{if doc.title}} title="${doc.title.text}"{{else}}{{if doc.description}} title="${doc.description.text}"{{/if}}{{/if}} />'
				+'			<img src="/img/lane/icon-video.png" class="small-memo-video" alt="video link" />'
				+'		{{/if}}'
				+'	</div>'
				+'	<div class="memoFooterBar">'
				+'		{{if (m.currentUser && m.currentUser.userID == user_id)}}'
				+'			<ul class="memoOwnerActions">'
				+'				<li><div class="memo_icon memo_privacy memo_${privacy}">${privacy}</div></li>'
				+'			</ul>'
				+'		{{/if}}'
				+'		<ul class="memoActions">'
				+'			<li><div class="memo_icon memo_comments{{if (comment_count)}} memo_comments_show{{/if}}">${comment_count}</div></li>'
				+'			<li><div class="memo_icon memo_like{{if (liked_by_current_user)}} memo_liked_by_current_user{{/if}}{{if (like_count)}} memo_like_show{{/if}}">${like_count}</div></li>'
				+'		</ul>'
				+'	</div>'
				+'</div>'
				+'</div>'
		}
	}
	
};}(this,jQuery,this.undefined);

m.laneLoadMemos.initialize();
