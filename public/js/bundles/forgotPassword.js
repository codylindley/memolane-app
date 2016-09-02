m.utilities={breakURLCache:function(a){return a+"?breakCache="+(new Date).getTime()},browser:{init:function(){this.browser=this.searchString(this.dataBrowser)||$.i18n.t("An unknown browser","this message informs the user that we weren't able to identify the browser they're using");this.version=this.searchVersion(navigator.userAgent)||this.searchVersion(navigator.appVersion)||$.i18n.t("an unknown version","this message informs the user that we weren't able to identify the version of the browser they're using");
this.OS=this.searchString(this.dataOS)||$.i18n.t("an unknown OS","this message informs the user that we weren't able to identify the operating system they're using")},searchString:function(a){for(var b=0;b<a.length;b++){var d=a[b].string,e=a[b].prop;this.versionSearchString=a[b].versionSearch||a[b].identity;if(d){if(d.indexOf(a[b].subString)!=-1)return a[b].identity}else if(e)return a[b].identity}},searchVersion:function(a){var b=a.indexOf(this.versionSearchString);return b==-1?void 0:parseFloat(a.substring(b+
this.versionSearchString.length+1))},dataBrowser:[{string:navigator.userAgent,subString:"Chrome",identity:"Chrome"},{string:navigator.userAgent,subString:"OmniWeb",versionSearch:"OmniWeb/",identity:"OmniWeb"},{string:navigator.vendor,subString:"Apple",identity:"Safari",versionSearch:"Version"},{prop:window.opera,identity:"Opera"},{string:navigator.vendor,subString:"iCab",identity:"iCab"},{string:navigator.vendor,subString:"KDE",identity:"Konqueror"},{string:navigator.userAgent,subString:"Firefox",
identity:"Firefox"},{string:navigator.vendor,subString:"Camino",identity:"Camino"},{string:navigator.userAgent,subString:"Netscape",identity:"Netscape"},{string:navigator.userAgent,subString:"MSIE",identity:"Explorer",versionSearch:"MSIE"},{string:navigator.userAgent,subString:"Gecko",identity:"Mozilla",versionSearch:"rv"},{string:navigator.userAgent,subString:"Mozilla",identity:"Netscape",versionSearch:"Mozilla"}],dataOS:[{string:navigator.platform,subString:"Win",identity:"Windows"},{string:navigator.platform,
subString:"Mac",identity:"Mac"},{string:navigator.userAgent,subString:"iPhone",identity:"iPhone/iPod"},{string:navigator.platform,subString:"Linux",identity:"Linux"}]},capitalizeString:function(a){return a.charAt(0).toUpperCase()+a.slice(1)},wait:function(a){return $.Deferred(function(b){setTimeout(b.resolve,a)})},dateFormatRelative:function(a){var a=new Date(a*1E3),b=new Date,d="",d=(b.getTime()-a.getTime())/6E4,e=b.getHours()*60+b.getMinutes();return d=a.getYear()<b.getYear()?this.dateFormat(a,
"mmm d, yyyy",false):d-e>1440?this.dateFormat(a,"mmm d",false):d-e>0?$.i18n.t("yesterday"):Math.floor(d)<=0?$.i18n.t("seconds ago","indicating that something happened within the last 60 seconds"):d<60?$.i18n.t("%s min ago","number of minutes since something",[Math.floor(d)]):$.i18n.t("%s hrs ago","number of hours since something",[Math.floor(d/60)])},cleanMemoId:function(a){return a.replace(/[:=-_@\.\/]/g,"")},dateFormat:function(){var a=/d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g,
b=/\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,d=/[^-+\dA-Z]/g,e=function(a,b){a=String(a);for(b=b||2;a.length<b;)a="0"+a;return a};return function(c,h,j){var l,n,g;c==0&&(c=1);g={"default":"ddd mmm dd yyyy HH:MM:ss",shortDate:"m/d/yy",shortDateWithZero:"mm/dd/yyyy",mediumDate:"mmm d, yyyy",longDate:"mmmm d, yyyy",fullDate:"dddd, mmmm d, yyyy",fullDatePlusTime:"dddd, mmmm d - h:MM tt",fullDateAndTime:"mm/dd/yyyy hh:MM:ss TT",
dateTimeForMemoChangeDate:"m-d-yyyy hh:MM:ss TT",shortTime:"h:MM TT",mediumTime:"h:MM:ss TT",longTime:"h:MM:ss TT Z",isoDate:"yyyy-mm-dd",isoTime:"HH:MM:ss",isoDateTime:"yyyy-mm-dd'T'HH:MM:ss",isoUtcDateTime:"UTC:yyyy-mm-dd'T'HH:MM:ss'Z'"};l=[$.i18n.t("Sun","shorthand for Sunday"),$.i18n.t("Mon","shorthand for Monday"),$.i18n.t("Tue","shorthand for Tuesday"),$.i18n.t("Wed","shorthand for Wednesday"),$.i18n.t("Thu","shorthand for Thursday"),$.i18n.t("Fri","shorthand for Friday"),$.i18n.t("Sat","shorthand for Saturday"),
$.i18n.t("Sunday"),$.i18n.t("Monday"),$.i18n.t("Tuesday"),$.i18n.t("Wednesday"),$.i18n.t("Thursday"),$.i18n.t("Friday"),$.i18n.t("Saturday")];n=[$.i18n.t("Jan","shorthand for January"),$.i18n.t("Feb","shorthand for February"),$.i18n.t("Mar","shorthand for March"),$.i18n.t("Apr","shorthand for April"),$.i18n.t("May","shorthand for May"),$.i18n.t("Jun","shorthand for June"),$.i18n.t("Jul","shorthand for July"),$.i18n.t("Aug","shorthand for August"),$.i18n.t("Sep","shorthand for September"),$.i18n.t("Oct",
"shorthand for October"),$.i18n.t("Nov","shorthand for November"),$.i18n.t("Dec","shorthand for December"),$.i18n.t("January"),$.i18n.t("February"),$.i18n.t("March"),$.i18n.t("April"),$.i18n.t("May"),$.i18n.t("June"),$.i18n.t("July"),$.i18n.t("August"),$.i18n.t("September"),$.i18n.t("October"),$.i18n.t("November"),$.i18n.t("December")];arguments.length==1&&Object.prototype.toString.call(c)=="[object String]"&&!/\d/.test(c)&&(h=c,c=void 0);c=c?new Date(c):new Date;if(isNaN(c))throw SyntaxError("invalid date");
h=String(g[h]||h||g["default"]);h.slice(0,4)=="UTC:"&&(h=h.slice(4),j=true);var f=j?"getUTC":"get";g=c[f+"Date"]();var p=c[f+"Day"](),k=c[f+"Month"](),q=c[f+"FullYear"](),i=c[f+"Hours"](),r=c[f+"Minutes"](),s=c[f+"Seconds"](),f=c[f+"Milliseconds"](),o=j?0:c.getTimezoneOffset(),t={d:g,dd:e(g),ddd:l[p],dddd:l[p+7],m:k+1,mm:e(k+1),mmm:n[k],mmmm:n[k+12],yy:String(q).slice(2),yyyy:q,h:i%12||12,hh:e(i%12||12),H:i,HH:e(i),M:r,MM:e(r),s:s,ss:e(s),l:e(f,3),L:e(f>99?Math.round(f/10):f),t:i<12?"a":"p",tt:i<
12?"am":"pm",T:i<12?"A":"P",TT:i<12?"AM":"PM",Z:j?"UTC":(String(c).match(b)||[""]).pop().replace(d,""),o:(o>0?"-":"+")+e(Math.floor(Math.abs(o)/60)*100+Math.abs(o)%60,4),S:["th","st","nd","rd"][g%10>3?0:(g%100-g%10!=10)*g%10]};return h.replace(a,function(a){return a in t?t[a]:a.slice(1,a.length-1)})}}(),convertURLstringsToAnchors:function(a,b){var d='<a href="$1" target="_blank">$1</a>';b&&(d='<span class="aStyle">$1</span>');return a.replace(/((http|ftp|https):\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&amp;:\/~\+#]*[\w\-\@?^=%&amp;\/~\+#])?)/ig,
d)},linkify:function(a){return a.replace(/(\()((?:ht|f)tps?:\/\/[a-z0-9\-._~!$&'()*+,;=:\/?#[\]@%]+)(\))|(\[)((?:ht|f)tps?:\/\/[a-z0-9\-._~!$&'()*+,;=:\/?#[\]@%]+)(\])|(\{)((?:ht|f)tps?:\/\/[a-z0-9\-._~!$&'()*+,;=:\/?#[\]@%]+)(\})|(<|&(?:lt|#60|#x3c);)((?:ht|f)tps?:\/\/[a-z0-9\-._~!$&'()*+,;=:\/?#[\]@%]+)(>|&(?:gt|#62|#x3e);)|((?:^|[^=\s'"\]])\s*['"]?|[^=\s]\s+)(\b(?:ht|f)tps?:\/\/[a-z0-9\-._~!$'()*+,;=:\/?#[\]@%]+(?:(?!&(?:gt|#0*62|#x0*3e);|&(?:amp|apos|quot|#0*3[49]|#x0*2[27]);[.!&',:?;]?(?:[^a-z0-9\-._~!$&'()*+,;=:\/?#[\]@%]|$))&[a-z0-9\-._~!$'()*+,;=:\/?#[\]@%]*)*[a-z0-9\-_~$()*+=\/#[\]@%])/img,
'$1$4$7$10$13<a href="$2$5$8$11$14">$2$5$8$11$14</a>$3$6$9$12')},linkifyHtml:function(a){a=a.replace(/&amp;apos;/g,"&#39;");section_html_pattern=/([^<]+(?:(?!<a\b)<[^<]*)*|(?:(?!<a\b)<[^<]*)+)|(<a\b[^>]*>[^<]*(?:(?!<\/a\b)<[^<]*)*<\/a\s*>)/ig;return a.replace(section_html_pattern,_linkify_html_callback)},urlHash:{set:function(a){var a=$.toQueryParams(a),b=$.toQueryParams(location.hash),d;for(d in a)b[d]=a[d];return $.toQueryString(b)},remove:function(a){var a=$.toQueryParams(a),b=$.toQueryParams(location.hash),
d={},e;for(e in b)a[e]==void 0&&(d[e]=b[e]);return $.toQueryString(d)},get:function(a){var b;b=m.embeddedParams&&typeof m.embeddedParams.memo_hash!="undefined"&&m.embeddedParams.memo_hash!=""?m.embeddedParams.memo_hash:location.hash;return typeof a=="undefined"?$.toQueryParams(b):$.toQueryParams(b)[a]},go:function(a){location.hash=a.substr(0,1)=="#"?a:"#"+a;return false}},getMessages:function(){$(window).bind("message",function(a){for(name in a.originalEvent.data){if(name.match(/custom_hostname/))m.embeddedParams.custom_hostname=
a.originalEvent.data[name];if(name.match(/custom_pathname/))m.embeddedParams.custom_pathname=a.originalEvent.data[name]}$(window).unbind("message");return true})},fixedModulus:function(a,b){return(a%b+b)%b}};
m.globalTemplates={dialogs:{removeLane:'<div id="" class="memolaneDialog">\t<div class="dialogTopBar">\t\t<div class="dialogTitle">'+$.i18n.t("Remove Lane")+'</div>\t\t<div class="close closeMemolaneDialog cancelAddingBtn">'+$.i18n.t("cancel","close remove lane dialog")+'</div>\t\t<div class="clearFloatNoHeight"></div>\t</div>\t<div class="dialogContent">\t\t<p><strong>'+$.i18n.t("Are you sure you want to remove")+' "${title}" '+$.i18n.t("from Memolane?")+"</strong></p>\t\t<p>"+$.i18n.t("All settings will be lost, and any work you've put into curating this lane will be permanently gone!")+
'</p>\t\t<p><a href="#" class="btn-red float-left removeConfirm close">'+$.i18n.t("Yes, REMOVE the lane")+'</a> <a href="#" class="secondaryAction float-left close">'+$.i18n.t("No, I don't want that")+"</a></p>\t</div></div>",removeLaneContributor:'<div id="" class="memolaneDialog">\t<div class="dialogTopBar">\t\t<div class="dialogTitle">'+$.i18n.t("Stop Contributing?")+'</div>\t\t<div class="close closeMemolaneDialog cancelAddingBtn">'+$.i18n.t("cancel","close remove lane contributor dialog")+'</div>\t\t<div class="clearFloatNoHeight"></div>\t</div>\t<div class="dialogContent">\t\t<p><strong>'+
$.i18n.t("Are you sure you wish to stop contributing to this lane:")+' ${lane_title}</strong></p>\t\t<p><a href="#" class="btn-red float-left removeConfirm close">'+$.i18n.t("Remove me as a contributor from this lane")+'</a> <a href="#" class="secondaryAction float-left close">'+$.i18n.t("No, I don't want that")+"</a></p>\t</div></div>",addFriend:'<div id="" class="memolaneDialog">\t<div class="dialogTopBar">\t\t<div class="dialogTitle">'+$.i18n.t("Friend Request Sent")+'</div>\t\t<div class="close closeMemolaneDialog cancelAddingBtn">'+
$.i18n.t("close","close dialog")+'</div>\t\t<div class="clearFloatNoHeight"></div>\t</div>\t<div class="dialogContent">\t\t<p><strong>'+$.i18n.t("Cross your fingers!")+"</strong></p>\t\t<p>"+$.i18n.t("You just sent a friend request to")+' ${first_name} ${last_name}.</p>\t\t<p><a href="#" class="btn-green float-left close">'+$.i18n.t("OK","ok button for dialog")+"</a></p>\t</div></div>",acceptFriendRequest:'<div id="" class="memolaneDialog">\t<div class="dialogTopBar">\t\t<div class="dialogTitle">Accepted Friend Request</div>\t\t<div class="close closeMemolaneDialog cancelAddingBtn">'+
$.i18n.t("close","close dialog")+'</div>\t\t<div class="clearFloatNoHeight"></div>\t</div>\t<div class="dialogContent">\t\t<p><strong>'+$.i18n.t("We're friends!</strong>")+"</p>\t\t<p>"+$.i18n.t("You just accepted <strong>${full_name}'s</strong> friend request!")+"</p>\t\t<p>"+$.i18n.t('You can now see each other\'s "Friends Only" memos.')+'</p>\t\t<p><a href="#" class="btn-green float-left close">'+$.i18n.t("OK","ok button for dialog")+"</a></p>\t</div></div>",rejectFriendRequest:'<div id="" class="memolaneDialog">\t<div class="dialogTopBar">\t\t<div class="dialogTitle">'+
$.i18n.t("Ignored Friend Request")+'</div>\t\t<div class="close closeMemolaneDialog cancelAddingBtn">'+$.i18n.t("close","close dialog")+'</div>\t\t<div class="clearFloatNoHeight"></div>\t</div>\t<div class="dialogContent">\t\t<p><strong>'+$.i18n.t("It's not you, it's me")+"</strong></p>\t\t<p>"+$.i18n.t("You just ignored <strong>${full_name}'s</strong> friend request.")+"</p>\t\t<p>"+$.i18n.t("At this point, you can only see each other's public memos.")+"</p>\t</div></div>",cancelFriendRequest:'<div id="" class="memolaneDialog">\t<div class="dialogTopBar">\t\t<div class="dialogTitle">'+
$.i18n.t("Cancelled Friend Request")+'</div>\t\t<div class="close closeMemolaneDialog cancelAddingBtn">'+$.i18n.t("close","close dialog")+'</div>\t\t<div class="clearFloatNoHeight"></div>\t</div>\t<div class="dialogContent">\t\t<p><strong>'+$.i18n.t("It's not you, it's me")+"</strong></p>\t\t<p>"+$.i18n.t("You just cancelled your request for <strong>${full_name}'s</strong> friendship.")+"</p>\t\t<p>"+$.i18n.t("At this point, you can only see each other's public memos.")+"</p>\t</div></div>",removeFriend:'<div id="" class="memolaneDialog">\t<div class="dialogTopBar">\t\t<div class="dialogTitle">'+
$.i18n.t("Remove Friend?")+'</div>\t\t<div class="close closeMemolaneDialog cancelAddingBtn">'+$.i18n.t("cancel","close remove friend dialog")+'</div>\t\t<div class="clearFloatNoHeight"></div>\t</div>\t<div class="dialogContent">\t\t<p><strong>'+$.i18n.t("Are you sure you want to cancel your Memolane friendship with")+" ${full_name}</strong>?</p>\t\t<p>"+$.i18n.t("You and")+" ${full_name} "+$.i18n.t("will lose the ability to see each other's \"Friends Only\" memos and contribute to each other's lanes.")+
'</p>\t\t<p><a href="#" class="btn-red float-left removeConfirm close">'+$.i18n.t("Yes, REMOVE the friend")+'</a> <a href="#" class="secondaryAction float-left close">'+$.i18n.t("No, I don't want that")+"</a></p>\t</div></div>",genericListOfUsersDialog:'<div id="list-users" class="memolaneDialog">\t<div class="dialogTopBar">\t\t<div class="dialogTitle">${$item.dialogTitle}</div>\t\t<div class="close closeMemolaneDialog cancelAddingBtn">'+$.i18n.t("close","close dialog")+'</div>\t\t<div class="clearFloatNoHeight"></div>\t</div>\t<div class="dialogContent"><ul>\t{{each liked_by}}\t\t<li class="clearfix">\t\t<a href="/${user.username}" title="'+
$.i18n.t("view user profile")+'">\t\t<img src="/${user.username}/images" height="20" width="20" class="search-result-icon search-user-avatar" alt="'+$.i18n.t("top bar avatar","this labels the lane avatar")+'"/>\t\t<span class="list-user-fullname-username">\t\t${user.full_name}\t\t<span class="list-users-username">(${user.username})</span>\t\t<span class="list-users-date">'+$.i18n.t("Liked ")+" ${m.utilities.dateFormatRelative(timestamp)}</span>\t\t</span> </a></li>\t{{/each}}</ul>\t</div></div>"}};
m.deviceIsIpad=navigator.userAgent.match(/iPad/i)!=null;m.deviceIsIphone=navigator.userAgent.match(/iPhone/i)!=null;m.deviceIsAndroid=navigator.userAgent.toLowerCase().indexOf("android")>-1;m.isIE9=$.browser.version==="9.0"?true:false;m.isIE8=$.browser.version==="8.0"?true:false;m.clickOrTouchStart=Modernizr.touch?"touchstart":"click";m.clickOrTouchEnd=Modernizr.touch?"touchend":"click";m.mouseEnterOrTouchStart=Modernizr.touch?"touchstart":"mouseenter";
m.mouseLeaveOrTouchEnd=Modernizr.touch?"touchend":"mouseleave";m.mouseDownOrTouchStart=Modernizr.touch?"touchstart":"mousedown";m.mouseMoveOrTouchMove=Modernizr.touch?"touchmove":"mousemove";m.mouseUpOrTouchEnd=Modernizr.touch?"touchend":"mouseup";m.mouseOutOrTouchEnd=Modernizr.touch?"touchend":"mouseout";m.mouseOverOrTouchStart=Modernizr.touch?"touchstart":"mouseover";
m.topBar=function(a,b){return{initialize:function(){b(a).bind("resize",function(){m.topBar.runLayout()});this.runLayout()},runLayout:function(){var a=b("body"),e=b("#header"),c=b("#tb-search input");a.width()<1E3&&(e.removeClass("more1024").addClass("less1024"),c.attr("value",b.i18n.t("Search","term used to label search box")));a.width()>=1E3&&(e.removeClass("less1024").addClass("more1024"),m.currentLane?c.attr("value",b.i18n.t("Search memos, lanes & users")):c.attr("value",b.i18n.t("Search lanes & users")))}}}(this,
jQuery,this.undefined);m.topBar.initialize();
m.resetpassword=function(a,b){return{$usernameOrEmail:b("#username-or-email"),$resetForm:b("#reset-form"),$formMessageError:b(".form-message-error"),$submitBtn:b("input.btn-green"),initialize:function(){this.maskInputs();b.validity.setup({outputMode:"modal"});this.$resetForm.submit(b.proxy(function(){this.reset();return false},this))},reset:function(){var a=this;this.$formMessageError.hide();this.$submitBtn.prop({disabled:true}).addClass("inactive").val(b.i18n.t("Sending","Sending password in progress"));
this.validateForm()?b.ajax({type:"POST",url:"/reset",data:{email:this.$usernameOrEmail.val()},error:function(){a.$submitBtn.prop({disabled:false}).removeClass("inactive").val(b.i18n.t("Send it","confirmation of resending password"));a.$formMessageError.show()},success:function(){b(".form-message-success").show();a.$usernameOrEmail.attr("disabled","disabled");a.$submitBtn.prop({disabled:true}).hide();b(".goSignIn span").remove()}}):this.$submitBtn.prop({disabled:false}).removeClass("inactive").val("Send it",
"confirmation of resending password")},validateForm:function(){b.validity.start();b("#username-or-email").require(b.i18n.t("Username or Email is required"));return b.validity.end().valid},maskInputs:function(){this.$usernameOrEmail.alphanumeric({allow:"_@.- "}).keypress(function(a){a.which==32&&a.preventDefault()})}}}(this,jQuery,this.undefined);m.resetpassword.initialize();$.fn.lightbox_me.defaults.destroyOnClose=true;$.fn.lightbox_me.defaults.centered=true;m.utilities.browser.init();
var currentBrowser=m.utilities.browser;
(currentBrowser.browser==="Firefox"&&parseInt($.browser.version,10)<6||currentBrowser.browser==="Opera"&&parseInt($.browser.version,10)<11||currentBrowser.browser==="Explorer"&&parseInt($.browser.version,10)<9)&&$('<div class="notifications badnews-notice"><div class="notice-text">'+$.i18n.t("You appear to be using an older browser. Did it come with a free toaster? Memolane and the internet in general looks better with Explorer 9, Opera 11+, Chrome 12+, Firefox 6+, and Safari 5+, so please consider upgrading and come back to visit. P.S. The irony that we don't support viewing on mobile phones is not lost on us.")+' <a href="#" class="close-notice">X</a></div></div>').notify({expires:false});
(m.deviceIsIphone||Modernizr.touch&&!m.deviceIsIpad&&!m.deviceIsAndroid||m.deviceIsAndroid&&!navigator.userAgent.toLowerCase().match(/android 3/i))&&$('<div class="notifications badnews-notice"><div class="notice-text">'+$.i18n.t("We're working on shrinking Memolane for mobile phones, in the meantime please check out Memolane on a larger screen. We suggest an iPad, Android tablet, or the desktop or laptop of your choice.")+' <a href="#" class="close-notice">X</a></div></div>').notify({expires:false});
$.ajaxSetup({data:{_csrf:m.csrf}});$.ajaxPrefilter(function(a){a.type.toLowerCase()==="delete"&&(a.data+="&_method=DELETE")});
