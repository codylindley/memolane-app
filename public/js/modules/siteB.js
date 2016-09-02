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

m.siteB = function(win,$,undefined){return{

	/* static */
	carouselDuration: 7500,
	currentSlot: 0, // 0-based slot position
	slots: [
		{
			topImageURL: '/img/siteB/c1TopImage.png',
			bottomImageURL: '/img/siteB/c1BottomImage.png'
		},
		{
			topImageURL: 'http://fc08.deviantart.net/fs32/f/2008/231/1/a/Awesome_Smiley___Sniper_TF2_by_Sitic.png',
			bottomImageURL: 'http://cache.ohinternet.com/images/1/13/Awesome.png'
		},
		{
			topImageURL: 'http://www.cs.ucsb.edu/~nurmi/cs60/hw8/wut.bmp',
			bottomImageURL: 'http://www.myfacewhen.net/uploads/3125-hurr-wut.png'
		}
	],
	
	
	/*  initialize module  */
	initialize:function(){
		var that = this;
		
		// set the slot(s) width
		that.setSlotWidth();
		
		// set up carousel
		$('#site-slider-border').carousel({
			autoScroll: true,
			pause: 7000,
			pagination: false,
			itemsPerTransition: 1,
			nextPrevActions: false,
			continuous: true,
			loop: true
		});
		
		// re-render on window resize
		$(win).resize(function(){
			that.setSlotWidth();
			
			$('#site-slider-border').carousel('refresh');
		});
		
		// hide top/bottom images
		$('#site-slider-border').bind("carouselbefore", function(event, data) {
			// set the new slot globally
			that.currentSlot = $(this).carousel('getPage');
			
			that.topImageHide( that.currentSlot );
			$('#carouselBottomImage')
				.slideUp(200, function(){
					$(this).attr('src', that.slots[that.currentSlot-1].bottomImageURL);
				});
		});
		// show top/bottom images
		$('#site-slider-border').bind("carouselafter", function(event, data) {
			that.topImageShow();
			$('#carouselBottomImage').slideDown(400);
		});
		
		// wire up carousel navigation
		$('.carouselGoTo').bind( m.clickOrTouchEnd, function(e){
			$('#site-slider-border').carousel('goToItem', parseInt($(this).attr('href')), true);
			
			e.preventDefault();
		});
	},
	
	
	/*  methods  */
	
	setSlotWidth: function(){
		// set width on each carousel main
		$('.rs-carousel-item').width( $(win).width() );
	},
	
	
	topImageHide: function( newPositionNum ){
		var that = this;
		
		$('#carouselTopImage').animate({
			top: 197
		}, 200, function(){
			$(this).attr('src', that.slots[newPositionNum-1].topImageURL);
		});
	},
	
	
	topImageShow: function(){
		var that = this;
		
		$('#carouselTopImage').animate({
			top: 0
		}, 400);
	}
	
};}(this,jQuery,this.undefined);

m.siteB.initialize();