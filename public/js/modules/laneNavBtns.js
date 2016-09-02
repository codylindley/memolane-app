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

m.laneNavBtns = function(win,$,undefined){return{

	/*  statics  */
	$screenLeftBtn:$('#screenLeftBtn'),
	$screenRightBtn:$('#screenRightBtn'),
	$screenBtn:$('#screenLeftBtn,#screenRightBtn'),
	
	/*  initialize module  */
	initialize:function(){
		
		//setup events
		this.$screenBtn
			.bind(m.mouseOverOrTouchStart,this.onMouseOverOrTouchStart)
			.bind(m.mouseOutOrTouchEnd,this.onMouseOutOrTouchEnd);
			
		//if(!Modernizr.touch){
			this.$screenLeftBtn.bind(m.clickOrTouchStart,this.onClickLeftBtn);
			this.$screenRightBtn.bind(m.clickOrTouchStart,this.onClickRightBtn);
		//}
		
		
		// keyboard navigation
		$(document).keyup(function(e){
			if($('input:focus,textarea:focus,select:focus').length){return false};
			switch(e.which){
				// user pressed left arrow key
				case 37: (function(){
					$('#screenLeftBtn').trigger('click');
				})();
				break;
				// user pressed right arrow key
				case 39: (function(){
					$('#screenRightBtn').trigger('click');
				})();
				break;
			}				
		});

	},
	
	/*  methods  */
	onMouseOverOrTouchStart:function(){
		$(this)
			.stop()
			.animate({width:'50px',opacity:0.9},100,'swing');
		return false;
	},
	
	onMouseOutOrTouchEnd:function(){
		/*if(!Modernizr.touch && $(this).is(':animated')){
			$(this).width('30px').fadeTo(0,0.2);	
			return false;
		};*/
		if($('#slot-loader-left').is(':visible') || $('#slot-loader-right').is(':visible')){return false;}
		$(this)
			.stop()
			.animate({width:'25px',opacity:0.6},100,'swing');
		return false;
	},
	
	onClickLeftBtn:function(e){
		if($(this).is(':hidden') || m.lane.cancelLaneMovement === true){return false;}
		var $laneViewport = $('#lane-viewport');
		var currentScrollLeft = $laneViewport.scrollLeft();
		var widthOfDrawer = m.drawer.drawerIsOpen ? $('#lane-drawer').width() : 0;
		if(currentScrollLeft <= 0){return false;}
		m.lane.moveLane({
			xpos:currentScrollLeft-($laneViewport.width()-widthOfDrawer),
			animate:true
		});
		return false;
	},
	
	onClickRightBtn:function(e){
		if($(this).is(':hidden') || m.lane.cancelLaneMovement === true){return false};
		var $laneViewport = $('#lane-viewport');
		var currentScrollLeft = $laneViewport.scrollLeft();
		var widthOfDrawer = m.drawer.drawerIsOpen ? $('#lane-drawer').width() : 0;
		if(currentScrollLeft >= $('#lane').width()){return false;}
		m.lane.moveLane({
			xpos:currentScrollLeft+($laneViewport.width()-widthOfDrawer),
			animate:true
		});
		return false;
	}
	
};}(this,jQuery,this.undefined);

m.laneNavBtns.initialize();