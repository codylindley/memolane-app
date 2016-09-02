/*
 * quick and dirty from cody lindley
 *
*/

(function($) {

    $.fn.notify = function(options) {

        var settings = $.extend({}, $.fn.notify.defaults, options);
        
        var pnBottom = 10, pnRight = 10;
        
        if($('#timeline').length){
        	pnBottom = 52, pnRight = 10;
        }

        if (!$('#position-notifications').length) {
        
        	if(settings.mobile){   	
        		$('body').append('<div id="position-notifications" class="mobile" style="top:'+pnBottom+'px; left:'+pnRight+'px;"></div>');
        	
        	}else{
        		$('body').append('<div id="position-notifications" style="bottom:'+pnBottom+'px; right:'+pnRight+'px;"></div>');
        	}

            $('#position-notifications').delegate('a.close-notice', 'click', function() {
                $(this).closest('.notifications').remove();
                return false;
            });
        }

        return this.each(function() {

            var $this = $(this);

            $this.css({
                display: "none",
                opacity: ""
            })[settings.stack === 'above' ? 'prependTo' : 'appendTo']('#position-notifications').fadeIn(settings.speed);
            if (settings.expires !== false) {
                window.setTimeout(function() {
                    $this.slideUp(settings.speed, function() {
                        $(this).remove();
                    });
                }, settings.expires);
            }

        });

    };


})(jQuery);

$.fn.notify.defaults = {
    speed: 500,
    mobile: false,
    expires: 5000,
    stack: 'above'
};