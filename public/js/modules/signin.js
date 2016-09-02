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

m.signin = function(win,$,undefined){return{

	/* static */
	$passwordInput : $('#password'),
	$usernameInput : $('#username'),
	$rememberOption : $('#remember'),
	$usernameInputAndpasswordInput : $('#username,#password'),
	$signinForm : $('#signin'),
	
	/*  initialize module  */
	initialize:function(){
		
		this.maskInputs();	
		$.validity.setup({ outputMode:"modal" });
		this.$signinForm.submit($.proxy(function(){this.loginIn(); return false;},this));

	},
	
	/*  methods  */
	
	loginIn:function(){
		var that = this;
		if(this.validateForm()){
			$('.form-message-error').hide();
			$.ajax({
				type: 'POST',
				url: '/login',
				data: {
					password:this.$passwordInput.val(),
					username:this.$usernameInput.val(),
					remember:this.$rememberOption.val()
				},
				error:function(){
					that.$signinForm
						.find('.form-message-error')
						.show()
						.end()
						.find('#password')
						.val('');
					// hide the error message once they start editing fields
					that.$signinForm.find('input[type=text]').keyup(function(){ that.$signinForm.find('.form-message-error').fadeOut(); });
				},
				success:function(){
					win.mpq.register({'facebook-connect-user': false}, "all");
					m.utilities.trackIt({category:'Retention',action:'Login',label:'login form successful',value:'',"type":"form",status:"success"},function() { window.location.href = '/explore'; });
				}
			});
		}
	},
	
	validateForm:function(){
		$.validity.start();
		$('#password').require($.i18n.t('Password is required'));
		$('#username')
			.require($.i18n.t('Username or Email is required'))
			.filter(function(index){return $(this).val().match(/@/g)})
			.match('email',$.i18n.t('Please enter a valid email!'));
		var results = $.validity.end();
		return results.valid;
	},
	
	maskInputs:function(){
		this.$usernameInput
			.keypress(function(e) {
     			if(e.which == 32) {
        			e.preventDefault();
     			}
			})	
	}

	
};}(this,jQuery,this.undefined);

m.signin.initialize();