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

m.explore = function(win,$,undefined){return{

	/*  initialize module  */
	initialize:function(){
		// only show the welcome paragraph for non-logged-in users
		if (!m.currentUser) {
			$('#welcomeText').fadeIn('slow');
		}
		
		this.renderCarousel( m.featuredLanes, '#explore_featured' );
		this.renderCarousel( m.mostFollowedLanes, '#explore_followed' );
		this.renderCarousel( m.recommendedLanes, '#explore_recommended' );
		
		$(window).resize(function () {
			$('.exploreSet > div').carousel('refresh');
		});
		
		$('.exploreSet .tooltipped').tipsy({
			gravity: 's',
			offset: 5
		});
	},
	
	
	
	/*  methods  */
	renderCarousel : function( data, selector){
		if (data && data.length) {
			// create named array, for easier use in the template
			var lanes = {};
			lanes.lanes = data;
			$(selector)
				.html( $.tmpl( this.templates.lane, lanes ).html() )
				.carousel({
					pagination: false,
					itemsPerTransition: 1,
					loop: false,
					continuous: false
				});
		}
		else {
			$(selector).parents('.exploreSet:first').fadeOut(function(){ $(this).remove(); });
		}
	},
	
	
	makeSafeHTMLAttr: function(val){
		return val
			.replace(/\"/g, '&quot;')
			.replace(/\>/g, '&gt;')
			.replace(/\</g, '&lt;');
	},
	
	
	
	/*  templates  */
        
        //For the avatar image, use the m.imageServer for requesting the correct size. When we are dealing with many images (which we 
        //are on the explore and site pages where these carrusels are shown) this is _much_ faster than first requesting this URL from the 
        //back end and then actually fetching the image. Also, this puts much less load on our servers.
        //Default lanes (lane.png) are not run through the image server as this breaks default images on localdev and there is really no reason
        //for it on the servers as it is statically served anyway.
	templates: {
		lane:
			'<div>'
			+'<ul class="rs-carousel-runner">'
			+'{{each lanes}}'
			+'	<li class="rs-carousel-item">'
			+'		<a href="/${user.username}/${lane.title}" class="tooltipped" original-title="${m.explore.makeSafeHTMLAttr( lane.description )}">'
			+'              {{if lane.avatar_url.match(/lane.png/)}}'
			+'                      <img src="${lane.avatar_url}" alt="'+ $.i18n.t('lane avatar', 'indicates that the given image is the lane avatar') +'" />'
			+'              {{else}}'
                        +'			<img src="http://' + m.imageServer + '/crop/100x100/' +  '${lane.avatar_url}" alt="'+ $.i18n.t('lane avatar', 'indicates that the given image is the lane avatar') +'" />'
			+'              {{/if}}'
                        +'			<span>${lane.title}</span>'
			+'		</a>'
			+'		<a href="/${user.username}" class="laneOwner">'+ $.i18n.t('by ${user.full_name}', 'indicates that the given user owns the associated lane') +'</a>'
			+'	</li>'
			+'{{/each}}'
			+'</ul>'
			+'</div>'
	}
	
};}(this,jQuery,this.undefined);

m.explore.initialize();