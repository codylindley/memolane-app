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

// TO DO:
//	- test/tweak for tablet
//	- tie date ratio to timeline width ratio to produce a valid date
//	- tooltip on hover indicator (with valid date)
//	- fix bug where hover indicator disappears sometimes when it, itself is hovered

m.timeline = function(win,$,undefined){return{

	/* statics */
	$timeline : $('#timeline'),
	$fixedIndicator : $('#timelineCurrent'),
	$hoverIndicator : $('#timelineHover'),
	$hoverIndicatorTooltip : $('#timeline-tooltip'),
	timelineWidth : null,
	timelineInnerWidth : 0, // timeline width, less the buttons
	beginDateWidth : 0,
	endDateWidth : 0,
	fixedIndicatorWidth : 0,
	fixedIndicatorXRatio : 0,
	
	
	/*  initialize module  */
	initialize:function(){
		
		// set begin & end times
		$('#timelineBeginDate').text( m.utilities.dateFormat(m.currentLane.first_memo*1000, "utcShortDate" ) );
		$('#timelineEndDate').text( m.utilities.dateFormat(m.currentLane.last_memo*1000, "utcShortDate" ) );
		
		// setup events
		this.$timeline
			.bind(m.clickOrTouchEnd, $.proxy(this.handleClick,this));
		
		if(!Modernizr.touch){
			this.$timeline
				.bind('mousemove', $.proxy(this.showHoverIndicator,this))
				.bind('mouseleave', $.proxy(this.hideHoverIndicator,this))
		}
		
		this.resetSizeValues();
	},
	
	
	/*  methods  */
	
	resetSizeValues:function(){
		this.timelineWidth = this.$timeline.width();
		this.beginDateWidth = $('#timelineBeginDate').outerWidth();
		this.endDateWidth = $('#timelineEndDate').outerWidth();
		this.timelineInnerWidth = this.timelineWidth - this.beginDateWidth - this.endDateWidth;
		this.fixedIndicatorWidth = this.$fixedIndicator.outerWidth();
	},
	
	
	// place current indicator on  a ratio/percentage in the form of a number between 0 and 1
	//	- default: no parameter, indicator placed on far right of timeline
	// 	- xRatio parameter (optional): ratio (0-1) of where to place indicator on timeline
	// 		- example: showFixedIndicator(.5); // centers indicator on timeline
	//	- xTimestamp parameter (optional): Unix timestamp, to be represented in text below indicator
	// 		- example: showFixedIndicator(.5, 1256018524);
	showFixedIndicator:function(xRatio, xTimestamp){
		var setGlobalRatio = true;
		
		if (xRatio == undefined && this.fixedIndicatorXRatio != undefined) xRatio = this.fixedIndicatorXRatio;
		// if we're setting it by default, don't save that setting
		else if (xRatio == undefined) xRatio = 1, setGlobalRatio = false;
		
		if (xRatio <= 0) xRatio = 0;
		else if (xRatio >= 1) xRatio = 1;
		
		// save the ratio of the current fixed indicator, in case of window resize
		if (setGlobalRatio) { this.fixedIndicatorXRatio = xRatio; }
		
		// set the date text in the indicator
		if (!xTimestamp) {
			xTimestamp = Math.round( m.currentLane.first_memo + ((m.currentLane.last_memo - m.currentLane.first_memo) * xRatio) );
		}
		$('#timelineDate').text( m.utilities.dateFormat(xTimestamp*1000, 'mediumDate') );
		
		// due to the indicator date text change, update the size value globally
		this.fixedIndicatorWidth = this.$fixedIndicator.outerWidth();
		
		// set the pixel position of the indicator
		var xPos = xRatio * this.timelineInnerWidth + this.beginDateWidth;
		
		// make sure the indicator isn't too far right
		if (xPos > (this.timelineWidth - this.endDateWidth)) xPos = this.timelineWidth - this.endDateWidth;
		
		// if indicator date is too far right, left align it
		if ((xPos + this.fixedIndicatorWidth) >= (this.timelineWidth - this.endDateWidth)) {
			xPos = xPos - this.fixedIndicatorWidth;
			this.$fixedIndicator.css('left', Math.round(xPos) +'px').addClass('indicatorRight');
		}
		else this.$fixedIndicator.css('left', Math.round(xPos) +'px').removeClass('indicatorRight');
		
		if(this.$fixedIndicator.is(':hidden')){this.$fixedIndicator.show();}
	},
	
	
	// same as showFixedIndicator(), but use when the window has changed sizes
	onResize:function(xRatio){
		this.resetSizeValues();
		this.showFixedIndicator(xRatio);
	},
	
	
	// place current indicator based on timestamp
	//	- default: no parameter, indicator placed based on m.lane.currentlyCenteredLaneMemoTime
	// 	- parameter (optional): Unix timestamp of where to place indicator on timeline
	// 		- example: showFixedIndicator(1312852462);
	showFixedIndicatorByTimestamp:function(xVal){
		
		if (!xVal) xVal = m.lane.currentlyCenteredLaneMemoTime;
		
		xRatio = ( xVal - m.currentLane.first_memo) / (m.currentLane.last_memo - m.currentLane.first_memo);
		
		this.showFixedIndicator(xRatio, xVal);
	},
	
	
	showHoverIndicator:function(e){
	
		var clickRatio = null;
		var thisTimestamp = null;
		
		clickRatio = (e.pageX - this.beginDateWidth) / this.timelineInnerWidth;
		thisTimestamp = Math.round( m.currentLane.first_memo + ((m.currentLane.last_memo - m.currentLane.first_memo) * clickRatio) );
		
		var xPos = e.pageX-3; // the 3 centers the indicator on the mouse
		
		this.$hoverIndicator.css('left', xPos +'px');
		this.$hoverIndicatorTooltip.css('left',(xPos - 47) +'px');
		if (m.isEmbedded && $('#embedded-branding').is(':visible')) {
			this.$hoverIndicatorTooltip.css('bottom', 83 +'px');
		}
		
		if ((xPos > (this.timelineWidth - this.endDateWidth) || xPos <= this.beginDateWidth)){ 
			this.$hoverIndicator.hide();
			this.$hoverIndicatorTooltip.hide();
		}else{
			this.$hoverIndicator.show();
			this.$hoverIndicatorTooltip.text(m.utilities.dateFormat(thisTimestamp*1000, "utcMediumDate" )).show();
		}
	},
	
	
	hideHoverIndicator:function(){
		
		this.$hoverIndicator.hide();
		this.$hoverIndicatorTooltip.hide();
		
	},
	
	
	// fired when the timeline is clicked
	handleClick:function(e){
		var clickRatio = null;
		var thisTimestamp = null;
		
		if(e.originalEvent.touches || e.originalEvent.changedTouches){
			var eTouch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
		}
		
		// calculate ratio and timestamp of click
		if ( e.target.id == 'timelineBeginDate' ) {
			clickRatio = 0;
			thisTimestamp = m.currentLane.first_memo;
		}
		else if ( e.target.id == 'timelineEndDate' ) {
			clickRatio = 1;
			thisTimestamp = m.currentLane.last_memo;
		}
		else {
			clickRatio = ((e.pageX || eTouch.pageX) - this.beginDateWidth) / this.timelineInnerWidth;
			thisTimestamp = Math.round( m.currentLane.first_memo + ((m.currentLane.last_memo - m.currentLane.first_memo) * clickRatio) );
		}
		
		// show updated indicator immediately (even though a reload is about to happen)
		this.showFixedIndicator(clickRatio);
		
		// reload window with newly requested timestamp
		// - it'd be nice to not force page reload unless needed - and to reevaluate this approach to doing so
                
        // needed to keep embedded styles when clicking timeline. Remove if reload is no longer required
        var embedExtras = '';
        if( m.isEmbedded )
			embedExtras += ( '&embedded=true');
		if( m.embeddedParams.background != "" )
			embedExtras += ( '&embedded_background=' + m.embeddedParams.background );
		if( m.embeddedParams.border != "" )
			embedExtras += ( '&embedded_border=' + m.embeddedParams.border );
                
		win.location.href = m.utilities.breakURLCache('/'+ m.currentLane.owner.username +'/'+ m.currentLane.title) + embedExtras + '#time='+ thisTimestamp;
	}
	
};}(this,jQuery,this.undefined);

m.timeline.initialize();