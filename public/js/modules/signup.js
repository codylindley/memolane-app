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

m.signup = function(win,$,undefined){return{

	/* static */
	$passwordInput : $('#password'),
	$usernameInput : $('#username'),
	$firstNameInput : $('#first-name'),
	$lastNameInput : $('#last-name'),
	$emailInput : $('#email'),
	$signupForm : $('#signup'),
	$signupSubmitBtn : $('#signup-btn'),
	
	
	/*  initialize module  */
	initialize:function(){
		
		//update username in label with input value
		this.$usernameInput
		.bind('keyup',function(){
	  		$('#signup-username-txt').text($(this).val());
	  	})
		.bind('blur',function(){
	  		if($(this).val() === ''){
	  			$('#signup-username-txt').text($.i18n.t('username','dummy username in preview url on signup page'));
	  		}
	  	});

		//mask username input for spaces
		this.maskInputs();
		
		//setup validation	
		$.validity.setup({ outputMode:"modal" });
		
		//event for form submit
		this.$signupForm.submit($.proxy(function(){	this.loginIn(); return false;},this));
		
		//ugly, to get blur validation working should come back and DRY it up
		this.$usernameInput.bind('blur',this.validateUsername);
		this.$passwordInput.bind('blur',this.validatePassword);
		this.$emailInput.bind('blur',this.validateEmail);
		this.$firstNameInput.bind('blur',this.validateFirstName);
		this.$lastNameInput.bind('blur',this.validateLastName);
	},
	
	
	/*  methods  */
	
	loginIn:function(){
		var that = this;
		$('.form-message-error').remove();
		this.$signupSubmitBtn.prop({disabled: true}).addClass('inactive').val( $.i18n.t("Sending", "this is the temporary status that tells the user that their information is in the process of being submitted") );
		if(this.validateForm()){
			$('.form-message-error').remove();
			$.ajax({
				type: 'POST',
				url: '/users',
				data: {
					password:this.$passwordInput.val(),
					username:this.$usernameInput.val(),
					first_name:this.$firstNameInput.val(),
					last_name:this.$lastNameInput.val(),
					email:this.$emailInput.val()
				},
				error:function(jqXHR){
					var json = $.parseJSON(jqXHR.responseText);
					var errors = [];
					var htmlErrors = '';
					
					jQuery.map(json.errors,function(v,k){
						if(k==='error_username'){
							if(v==='taken'){
								errors.push($.i18n.t('That username has already been claimed, please try another') +'<br />')
							}
							if(v==='required'){
								errors.push($.i18n.t('Username required') +'<br />')
							}
							if(v==='invalid_chars'){
								errors.push($.i18n.t('Invalid characters in username') +'<br />')
							}
							if(v==='length'){
								errors.push( $.i18n.t('Username requires a min of 3 chars') +'<br />')
							}
						}
						if(k==='error_first_name'){
							errors.push($.i18n.t('First name required') +'<br />')
						}
						if(k==='error_last_name'){
							errors.push($.i18n.t('Last name required') +'<br />')
						}
						if(k==='error_pw'){
							if(v==='taken'){
								errors.push($.i18n.t('Password taken') +'<br />')
							}
							if(v==='required'){
								errors.push($.i18n.t('Password required') +'<br />')
							}
						}
						if(k==='error_mail'){
							if(v==='taken'){
								errors.push($.i18n.t('That email address is registered to another account &#151; please try an alternate email') +'<br />')
							}
							if(v==='required'){
								errors.push($.i18n.t('Password required') +'<br />')
							}
						}
					});
					
					$('.form-message-error').remove();
					
					$.each(errors,function(i,e){
						htmlErrors += '<div class="form-message-error display-block">'+e+'</div>';
					});

					that.$signupSubmitBtn
						.prop({disabled: false})
						.removeClass('inactive')
						.val( $.i18n.t("Sign Up", "this is button text that tells the user they can click it to signup for a Memolane account") )
						.after(htmlErrors);
				},
				success:function(){
					win.mpq.register({'facebook-connect-user': false}, "all");
					m.utilities.trackIt({category:'Activation',action:'Signup',label:'successful form signup',value:'',"type":"form","status":"success"},function(){window.location.href='/signup2'});					
				}
			});
		}else{
			this.$signupSubmitBtn.prop({disabled: false}).removeClass('inactive').val( $.i18n.t("Signup", "this is button text that tells the user they can click it to signup for a Memolane account") );
		}
	},
	
	validateForm:function(){
		$.validity.start();
		$('#first-name').require($.i18n.t('First name is required'));
		$('#last-name').require($.i18n.t('Last name is required'));
		$('#password')
			.require($.i18n.t('Password is required'))
			.minLength(8, $.i18n.t('A minimum of 8 characters is required'));
		$('#username')
			.require($.i18n.t('Username is required'))
			.minLength(3, $.i18n.t('A minimum of 3 characters is required'))
			.match(/^[a-zA-Z0-9_]*$/, $.i18n.t('Please use only A-z, 0-9, and underscore'));
		$('#email')
			.require($.i18n.t('Email is required'))
			.match('email',$.i18n.t('Please enter a valid email'));
		var results = $.validity.end();
		return results.valid;
	},
	
	validateUsername:function(){
		if($(this).val() === ''){$('.formError').remove(); return;}
		$.validity.start();
		$('#username')
			.minLength(3, $.i18n.t('A minimum of 3 characters is required'))
			.match(/^[a-zA-Z0-9_]*$/, $.i18n.t('Please use only A-z, 0-9, and underscore'));
		$.validity.end();
	},
	
	validatePassword:function(){
		if($(this).val() === ''){$('.formError').remove(); return;}
		$.validity.start();
		$('#password')
			.minLength(8, $.i18n.t('A minimum of 8 characters is required'));
		$.validity.end();
	},
	
	validateEmail:function(){
		if($(this).val() === ''){$('.formError').remove(); return;}
		$.validity.start();
		$('#email')
			.match('email',$.i18n.t('Please enter a valid email'));
		$.validity.end();
	},
	
	validateLastName:function(){
		if($(this).val() === ''){$('.formError').remove(); return;}
		$.validity.start();
		$('#last-name').require($.i18n.t('First name is required'));
		$.validity.end();
	},

	validateFirstName:function(){
		if($(this).val() === ''){$('.formError').remove(); return;}
		$.validity.start();
		$('#first-name').require($.i18n.t('Last name is required'));
		$.validity.end();
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

m.signup.initialize();