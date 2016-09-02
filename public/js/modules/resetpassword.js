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

m.resetpassword = function(win,$,undefined){return{

	/* static */
	$usernameOrEmail : $('#username-or-email'),
	$resetForm : $('#reset-form'),
	$formMessageError : $('.form-message-error'),
	$submitBtn : $('input.btn-green'),
	
	/*  initialize module  */
	initialize:function(){
		
		this.maskInputs();	
		$.validity.setup({ outputMode:"modal" });
    	this.$resetForm.submit($.proxy(function(){	this.reset(); return false;},this));

	},
	
	/*  methods  */
	
	reset:function(){
		var that = this;
		this.$formMessageError.hide();
		this.$submitBtn.prop({disabled: true}).addClass('inactive').val($.i18n.t('Sending','Sending password in progress'));
		if(this.validateForm()){
			$.ajax({
				type: "POST",
				url: "/reset",
				data: {
					email:this.$usernameOrEmail.val()
				},
				error:function(){
					that.$submitBtn.prop({disabled: false}).removeClass('inactive').val($.i18n.t('Send it','confirmation of resending password'));
					that.$formMessageError.show();
				},
				success:function(x,y){
					$('.form-message-success').show();
					that.$usernameOrEmail.attr('disabled','disabled');
					that.$submitBtn.prop({disabled: true}).hide();
					$('.goSignIn span').remove();			
				}
			});
		}else{
			this.$submitBtn.prop({disabled: false}).removeClass('inactive').val('Send it','confirmation of resending password');
		}
	},
	
	validateForm:function(){
		$.validity.start();
		$('#username-or-email').require($.i18n.t('Username or Email is required'));
		var results = $.validity.end();
		return results.valid;
	},
	
	maskInputs:function(){
		this.$usernameOrEmail
			.alphanumeric({allow:'_@.- '})
			.keypress(function(e) {
     			if(e.which == 32) {
        			e.preventDefault();
     			}
			})	
	}

	
};}(this,jQuery,this.undefined);

m.resetpassword.initialize();