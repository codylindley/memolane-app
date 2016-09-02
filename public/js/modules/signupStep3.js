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

m.signupStep3 = function(win,$,undefined){return{

	/* static */
	that: this,
	progressBarDuration: 45000,
	
	
	/*  initialize module  */
	initialize:function(){
		var that = this;
		
		// create the initial lane
		$.ajax({
			type: 'post',
			data: {'_csrf' : m.csrf},
			url: '/lanes/create_initial'
		});
		
		// start the progress bar animation
		$('.progressBar div').animate(
			{
				width: '100%'
			},
			{
				duration: that.progressBarDuration,
				easing: 'linear',
				complete: function(){
					that.progressCompleted();
				}
			}
		);
		
		// start polling for jobs remaining
		this.pollForJobs();
	},
	
	
	/*  methods  */
	
	// poll for remaining jobs and end progress when it reaches 0
	pollForJobs: function(){
		var that = this;
		
		$.ajax({
			type:'get',
			url:'/jobs',
			success: function(data){
				if (data.jobs === 0) {
					that.endAnimation();
				}
				else {
					setTimeout(that.pollForJobs, 1000);
				}
			}
		});
	},
	
	// we can wrap up the animation, as our preconditions have been met (in the current case, 0 remaining jobs)
	endAnimation: function(){
		var that = this;
		
		$('.progressBar div')
			.stop()
			.animate(
				{
					width: '100%'
				},
				{
					duration: 2000,
					easing: 'linear',
					complete: function(){
						that.progressCompleted();
					}
				}
		);
	},
	
	// this should only be called after the animation is completed
	progressCompleted: function() {
		$('#progressBarContainer').hide();
		$('#progressBarFinished').fadeIn('slow');
	}
	
};}(this,jQuery,this.undefined);

m.signupStep3.initialize();