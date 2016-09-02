/*
EMBED GENERATOR
///////////////

There are a few things to point out.  The actual embed has the formating as illustrated in these examples:

<script src="http://memolane.com/memolane_blog.js"></script>
<script src="http://memolane.com/memolane_blog.js?background=none&height=500&width=700"></script>

However, instead of appending JS files to the DOM (which I couldn't do) I'm just taking the formating that the JS calls.  So essentially it is just an iframe, however it has different formatting:

<iframe id="embed-memolane" src="http://memolane.com/memolane_blog" width="500" height="500"></iframe>
<iframe id="embed-memolane" src="http://memolane.com/memolane_blog?embedded_background=none&embedded_border=none" width="500" height="500"></iframe>

If there are any doubts, just drop the first examples src into a browser and see how it formats in the iframe code provided. 


Wordpress shortcode example:
[memolane lane="mylanename" width="450" height="600" background="#000044" border="1px solid #9AF"]
*/


$(document).ready(function()
{	
	//default variables for customization
	var memolane_name = 'memolane';
	var src_features = '';
	var embed_features = '';
	var frame_width = 500;
	var frame_height = 500;
	var border = false;
	var border_color = 'ffffff';
	var border_thickness = 1;
	var border_type = 'solid';
	var background = 0;   //0 = default, 1 = transparent, 2 = custom color
	var background_color = '123456';
	var size_changed = false;
	var embed_type = 0;  // 0 = html (default), 1 = wordpress 

	//standard elements of the embed code
	var embed_beginning_html = '&lt;script src="http://memolane.com/';
	var embed_middle_html	= '.js?';
	var embed_end_html 		= '"&gt;&lt;/script&gt;';
	var wp_feature
	
	
	//FOR COLOR WHEELS
	//required for the color selectors
	$('#picker_background').farbtastic('#color_background');
	$('#picker_border').farbtastic('#color_border');


		
	//SUBMITS
	//on the initial input of the user's name
	$('#get_name').submit(function(){
		memolane_name = $('#memolane_name').val();
		//if()
		generateEmbed();		
		
		$("#embed-memolane").show("blind");
		$("#embed_code").show("blind");
		$("#customize").show("blind");
		return false;
	});
	
	//Background styling
	$('#picker_background').mouseup(function(){ 
		var temp = $('#color_background').val();
		temp = temp.substr(1);
		if(background_color != temp){
			background_color = temp;
			generateEmbed();
		}
    });
    
	//Border styling
	$('#picker_border').mouseup(function(){
		var temp = $('#color_border').val();
		temp = temp.substr(1);
		if(border_color != temp){
			border_color = temp;
			generateEmbed()
		}
	});
	$('#border_type').change(function() {
		border_type = $('#border_type').val();
		generateEmbed();
	});
	$('#thickness_border').change(function(){
		var temp = $('#thickness_border').val()
		temp = parseInt(temp);
		if(temp == "NaN"){
			$('#thickness_border').attr('value', 'Enter a number');
		}else{
			border_thickness = temp;
			generateEmbed()
		}
	})
	
	//height and width
	$('#frame_height').change(function(){
		var temp = $('#frame_height').val()
		temp = parseInt(temp);
		if(temp == "NaN"){
			$('#frame_height').attr('value', 'Enter a number');
		}else{
			frame_height = temp;
			size_changed = true;
			generateEmbed()
		}
	});
	$('#frame_width').change(function(){
		var temp = $('#frame_width').val()
		temp = parseInt(temp);
		if(temp == "NaN"){
			$('#frame_width').attr('value', 'Enter a number');
		}else{
			frame_width = temp;
			size_changed = true;
			generateEmbed()
		}
	});

	//on the selection of a radio button
	$('input:radio').click(function(){
		if($('#html_embed').is(':checked')){
			embed_type = 0;
		}else{
			embed_type = 1;
		}
		
		
		//background radio buttons
		if($("#def_back").is(':checked')){
			if(background == 2){
				$('#background_widget').hide("blind");
			}		
			background = 0;
		}
		if($("#none_back").is(':checked')){
			if(background == 2){
				$('#background_widget').hide("blind");
			}			
			background = 1;
		}
		if($("#cust_back").is(':checked')){
			if(background != 2){
				$('#background_widget').show("blind");
			}
			background = 2;
		}

	
		//border radio buttons
		if($("#no_border").is(':checked')){
			if(border == true){
				$('#border_widget').hide("blind");
			}
			border = false;
		}
		if($("#border").is(':checked')){
			if(border == false){
				$('#border_widget').show("blind");
			}
			border = true;
		}
		generateEmbed();
	});
	
	
	//EMBED CODE
	//generates the embed code and the displayed code
	var count = 0; 
	function generateEmbed(){
		$("#embed_code").empty();
	    var feature_added = false;
	    
	    src_features = '';
	    embed_features = '';
	    wp_feature = '';
	    
	    //for html format format
		if(border){
			embed_features = 'border='+border_thickness+'px '+border_type+' %23'+border_color;
			src_features += 'embedded_border='+border_thickness+'px%20'+border_type+'%20%23'+border_color;
			wp_feature = ' border="'+border_thickness+'px '+border_type+' #'+border_color+'"';
			feature_added = true;	
		}
	    
	    switch(background){
	    case 0:
	    	break;
	    case 1:
	    	if(feature_added){src_features+='&';embed_features+='&';}
	    	embed_features += 'background=none';
	    	src_features += 'embedded_background=none';
	    	wp_feature += ' background="none"';
	    	feature_added = true;
	    	break;
	    case 2:	
	    	if(feature_added){src_features+='&';embed_features+='&';}
	    	embed_features += 'background=%23'+background_color;
	    	src_features += 'embedded_background=%23'+background_color;
	    	wp_feature += ' background="#'+background_color+'"';
	    	feature_added = true;
	    	break;
	    }
	    
	   	if(size_changed){
	    	if(feature_added){src_features+='&';embed_features+='&';}
	    	embed_features += 'height='+frame_height+'&width='+frame_width;
	    	wp_feature += ' height="'+frame_height+'" width="'+frame_width+'"';
	    	feature_added = true;
	    }
	    
/*
	    if(count <1){
	    
	    	$('head').append('<link rel="stylesheet" href="http://memolane.com/embedded/stylesheet/embed-'+memolane_name+'.css"/>'
);
	   		$("#sample_lane").append('<iframe id="embed-memolane" src="http://memolane.com/'+memolane_name+'" width="'+frame_width+'" height="'+frame_height+'"></iframe>');
	   		
	    }else{
	    	if(feature_added == false){
	    		$('#embed-memolane').attr({src: 'http://memolane.com/'+memolane_name});
	    	}else{
	    		$('#embed-memolane').attr({src: 'http://memolane.com/'+memolane_name+'?'+src_features, width: frame_width, height: frame_height });
	    		console.info($('#embed-memolane'));
	    	}
	    }
*/

	   	$('head').append('<link rel="stylesheet" href="http://memolane.com/embedded/stylesheet/embed-'+memolane_name+'.css"/>');
	   	
   		if(feature_added == false){
    		$('#embed-memolane').attr({src: 'http://memolane.com/'+memolane_name});
    	}else{
    		$('#embed-memolane').attr({src: 'http://memolane.com/'+memolane_name+'?'+src_features, width: frame_width, height: frame_height });
    		console.info($('#embed-memolane'));
    	}
    	
	   	$("#sample_lane").append('<iframe id="embed-memolane" src="http://memolane.com/'+memolane_name+'" width="'+frame_width+'" height="'+frame_height+'"></iframe>');
	    
	   	//write the embed code 
	    if(embed_type == 0){
	    	//for html
			$("#embed_code").append(embed_beginning_html + memolane_name + embed_middle_html + embed_features + embed_end_html);
			
		}else if(embed_type == 1){
			//for wordpress
			if(feature_added == false){
				$("#embed_code").append('[memolane lane="'+memolane_name+'"]');
			}else if(feature_added){
				console.log(wp_feature);
				//$("#embed_code").append('[memolane lane="'+memolane_name+'"]');
				$("#embed_code").append('[memolane lane="'+memolane_name+'"'+wp_feature+']');
			}
		}
		count++;
	}
});

