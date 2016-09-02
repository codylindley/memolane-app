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

m.laneLayout = function(win,$,undefined){return{
  
	/*  static  */
	timelineHeight:42,
	heightOfHeader: m.isEmbedded ? 0 : 120,
	heightOfDateBar:25,
    heightOfBranding: m.isEmbedded ? 38 : 0,
	
	/*  initialize module  */
	initialize:function(){
	
		$(win).bind('resize',function(e){m.laneLayout.runLayout(e);});
		
		this.runLayout(false);
	},
	
	/*  methods  */
	runLayout:function(e){	
	
		var $laneViewport = $('#lane-viewport');
		var $lane = $('#lane');
		var $laneSlot = $('.lane-slot');
		var $laneSlotMemos = $('.lane-slot-memos');
		var $content = $('#content');
		var $body = $('body');
		var $drawerContent = $('#lane-drawer-content');
		var $drawer = $('#lane-drawer');
		var $drawerTab = $('#lane-drawer-tab');
		var $header = $('#header');
		var $screenBtn = $('.screenBtn');
		var $slotLoader = $('.slot-loader');
		var $drawerActions = $('#drawer-actions');
		var $embeddedBranding = $('#embedded-branding');
		var $shadow = $('#shadow');
		var $leftBtn = $('#screenLeftBtn');
		var sizeOfDrawerActions = $drawerActions.length ? 43 : 0;
              
		if (m.isEmbedded) {
			$header.hide();
			$drawerTab.hide();
			$drawer.hide();
			//$drawer.css('top', 22);  //hide for now...
			$screenBtn.css('top', 28);
			$slotLoader.css('top', 28);
			
			//this should likely go somewhere else, but I'll make it work now and then move it to the correct location together 
			//with the frontend people
			
			if( !m.embeddedParams.background || m.embeddedParams.background == '' || m.embeddedParams.background == 'default' ) {
				m.embeddedParams.background = 'black';
			}
			
			if( m.embeddedParams.background != 'memolane' ) {
				$body.css('background', m.embeddedParams.background );
			}
			
			if( !m.embeddedParams.border || m.embeddedParams.border == '' || m.embeddedParams.border == 'default' ) {
				m.embeddedParams.border = '1px solid #FFF';
			}

			$content.css('border', m.embeddedParams.border);
			$content.data('custom-hostname', m.embeddedParams.custom_hostname);
			$content.data('custom-pathname', m.embeddedParams.custom_pathname);

			if( m.embeddedParams.hide_branding &&  m.embeddedParams.hide_branding == 1 ) {
				this.heightOfBranding = 0;
			} else {
				$shadow.css('bottom', 41 + this.heightOfBranding );
				$embeddedBranding.show();
			}

			$leftBtn.css( 'left', 0 );
		}
		
		$content.css('visibility','hidden');
		
		//adjust height of drawer, exclude any padding added to the drawer for content container
		$drawerContent.height(((($body.height()-this.timelineHeight)-$drawer.position().top)-22)-sizeOfDrawerActions+'px');

		//adjust height for lane-viewport
		$laneViewport.height(($body.height()-this.heightOfHeader-this.timelineHeight-this.heightOfBranding)+'px');
	
		//adjust height for lane
		$lane.height($laneViewport.height()+'px');
		
		//adjust height for of screen left and right buttons
		$screenBtn.add('.slot-loader').height(($laneViewport.height()-this.heightOfDateBar)-20+'px');
		
		//setHeight for lane slots which is laneviewport - 25 (25 + 25 for padding)
		$laneSlotMemos.height(($laneViewport.height()-(this.heightOfDateBar + 20))+'px');

		//ugh call it again for everything just to make sure I can call reLayout
		$('#content .lane-slot-memos').isotope({ 
			layoutMode : 'fitColumns',
			animationEngine: 'jquery',
			animationOptions: {
				duration: 0,
				queue: false
			}
		});
	
		var totalSlots = 0;
		$('#content .lane-slot').each(function(i,e){
			totalSlots += $(this).outerWidth();
		});
		$lane.width(totalSlots+'px');

		//show all lane content
		if($content.css('visibility') === 'hidden') {
			$content.css('visibility','visible');
		}
		
		//if the drawer scoll is not yet configured skip this
		if($drawerContent.data('jsp')){
			$drawerContent.data('jsp').reinitialise();
		}
		
		// close open memo
		$('.openMemo').length ? m.memos.closeMemo() : 0;
		
		//reposition dropdown if need be, and its visible
		if($('.dd-container').filter(function(){return $(this).css('visibility') == 'visible';}).length){
			m.topBarDropDowns.positionDropdown();
		}
		
		setTimeout(function(){m.lane.stretchSlot();},1000);
		
		if(e != false){// don't run this the first time, run it on resize only after first load
			// reset timeline
			// 	- this should probably never take a parameter (even though it can) because then every resize will reset the indicator to this value
			m.timeline.onResize();
			m.laneLoadMemos.numberOfMemosToLoad = Math.round(($('body').width()/250) * ($('#lane-viewport').height()/250))*4;
			
			m.lane.onLaneEndRemoveNavBtn();
		}

	}
		
};}(this,jQuery,this.undefined);

m.laneLayout.initialize();