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

var currentLanguage = m.currentLanguage;

m.utilities = {
	
	//e.g. m.utilities.trackIt({category:'',action:'',label:'',value:''},function(){window.location.url='string'});
	trackIt: function(p,callback,evil){
	
		//mpg window.mpq.track(label,params{ });
		//gaq window._gaq.push('_trackEvent',category,action,label,value);
		var g = false, m = false;
		
		var yesCallback = arguments[1] !== undefined && typeof arguments[1] === 'function';
		
		//window._gaq.push('_trackEvent',p.category,p.action,p.label,p.value);
		window._gaq.push(['_trackEvent',p.category,p.action,p.label,p.value]);
		window._gaq.push(function(){ g = true; });

		p['href'] = window.location.href;
		p['app'] = 'web';
		p['mp_notes'] = p.label;
		
		window.mpq.track(p.action,p,function(){ m = true; });
		//only call... callback if its actually set
		if(yesCallback && arguments[2] === undefined){
		
			var check = setInterval (function(){
				if(g == true && m == true){
					clearInterval(check);          
					callback();        
				}
			},10);
		
			window.setTimeout(callback,1000);
			
		}else if(yesCallback && arguments[2] === 'evil'){
		
			var sleep = function(d){var s = new Date().getTime();while (new Date().getTime() < s + d);};
			sleep(1000);
			callback();
			
		}
	
	},
	
	//e.g. m.utilities.trackLink('#makeFirstLaneBtn',{category:'',action:'',label:'',value:''}, false);	
	trackLink: function(id,p,evil){
		$(id).click(function(event) {
			href = $(id).attr('href');
			//event.preventDefault();
			m.utilities.trackIt(p, function() { window.location = href; }, evil);
        	return false;
		});
	},

	breakURLCache: function(url){
		var now = new Date();
		return url+'?breakCache='+ now.getTime();
	},
	
	browser : {
		init: function () {
			this.browser = this.searchString(this.dataBrowser) || $.i18n.t("An unknown browser", "this message informs the user that we weren\'t able to identify the browser they\'re using");
			this.version = this.searchVersion(navigator.userAgent)
				|| this.searchVersion(navigator.appVersion)
				|| $.i18n.t("an unknown version", "this message informs the user that we weren\'t able to identify the version of the browser they\'re using");
			this.OS = this.searchString(this.dataOS) || $.i18n.t("an unknown OS", "this message informs the user that we weren\'t able to identify the operating system they\'re using");
		},
		searchString: function (data) {
			for (var i=0;i<data.length;i++)	{
				var dataString = data[i].string;
				var dataProp = data[i].prop;
				this.versionSearchString = data[i].versionSearch || data[i].identity;
				if (dataString) {
					if (dataString.indexOf(data[i].subString) != -1)
						return data[i].identity;
				}
				else if (dataProp)
					return data[i].identity;
			}
		},
		searchVersion: function (dataString) {
			var index = dataString.indexOf(this.versionSearchString);
			if (index == -1) return;
			return parseFloat(dataString.substring(index+this.versionSearchString.length+1));
		},
		dataBrowser: [
			{
				string: navigator.userAgent,
				subString: "Chrome",
				identity: "Chrome"
			},
			{ 	string: navigator.userAgent,
				subString: "OmniWeb",
				versionSearch: "OmniWeb/",
				identity: "OmniWeb"
			},
			{
				string: navigator.vendor,
				subString: "Apple",
				identity: "Safari",
				versionSearch: "Version"
			},
			{
				prop: window.opera,
				identity: "Opera"
			},
			{
				string: navigator.vendor,
				subString: "iCab",
				identity: "iCab"
			},
			{
				string: navigator.vendor,
				subString: "KDE",
				identity: "Konqueror"
			},
			{
				string: navigator.userAgent,
				subString: "Firefox",
				identity: "Firefox"
			},
			{
				string: navigator.vendor,
				subString: "Camino",
				identity: "Camino"
			},
			{		// for newer Netscapes (6+)
				string: navigator.userAgent,
				subString: "Netscape",
				identity: "Netscape"
			},
			{
				string: navigator.userAgent,
				subString: "MSIE",
				identity: "Explorer",
				versionSearch: "MSIE"
			},
			{
				string: navigator.userAgent,
				subString: "Gecko",
				identity: "Mozilla",
				versionSearch: "rv"
			},
			{ 		// for older Netscapes (4-)
				string: navigator.userAgent,
				subString: "Mozilla",
				identity: "Netscape",
				versionSearch: "Mozilla"
			}
		],
		dataOS : [
			{
				string: navigator.platform,
				subString: "Win",
				identity: "Windows"
			},
			{
				string: navigator.platform,
				subString: "Mac",
				identity: "Mac"
			},
			{
				   string: navigator.userAgent,
				   subString: "iPhone",
				   identity: "iPhone/iPod"
		    },
			{
				string: navigator.platform,
				subString: "Linux",
				identity: "Linux"
			}
		]
	
	},
	
	capitalizeString : function(myString) {
		return myString.charAt(0).toUpperCase() + myString.slice(1);
	},
	
	// grabbed from: http://intridea.com/2011/2/8/fun-with-jquery-deferred?blog=company
	wait : function(time) {
		return $.Deferred(function(dfd) {
			setTimeout(dfd.resolve, time);
		});
	},
	
	// used for topBar news feed items
	dateFormatRelative : function (timestamp) {
		// TODO: take time offset and adjust in date object below
		var then = new Date(timestamp * 1000),
			now = new Date(),
			ret = '',
			minutesSince = (now.getTime() - then.getTime()) / 60000,
			minutesToday = (now.getHours() * 60) + now.getMinutes();
		
		if (then.getYear() < now.getYear()) {
			// last calendar year
			ret = this.dateFormat(then, "mmm d, yyyy", false); 
		} else if (minutesSince - minutesToday > 1440) {
			// prior to "yesterday"
			ret = this.dateFormat(then, "mmm d", false); 
		} else if (minutesSince - minutesToday > 0) {
			// before today
			ret = $.i18n.t('yesterday');
		} else {
			// today's minutes are greater than event ----- hours or minutes ago
			if (Math.floor(minutesSince) <= 0) {
				ret =  $.i18n.t('seconds ago', "indicating that something happened within the last 60 seconds");
			}
			else if (minutesSince < 60) {
				ret =  $.i18n.t('%s min ago', "number of minutes since something", [Math.floor(minutesSince)]);
			}
			else {
				ret =  $.i18n.t('%s hrs ago', "number of hours since something", [Math.floor(minutesSince/60)]);
			}
		}
		return ret;
  	},
  	
  	cleanMemoId:function(id){
  		return id.replace(/[^\w\s]|_/g, "");
  	},
	
	dateFormat : function () {
		var	token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g,
			timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,
			timezoneClip = /[^-+\dA-Z]/g,
			pad = function (val, len) {
				val = String(val);
				len = len || 2;
				while (val.length < len) val = "0" + val;
				return val;
			};
	
		// Regexes and supporting functions are cached through closure
		return function (date, mask, utc) {
			var dF = {};
                        
                        if( date == 0 ) { date = 1 } 
			dF.masks = {
				"default":      "ddd mmm dd yyyy HH:MM:ss",
				utcDefault:      "UTC:dd mmm dd yyyy HH:MM:ss",
				shortDate:      "m/d/yy",
				utcShortDate:      "UTC:m/d/yy",
				shortDateWithZero:      "mm/dd/yyyy",
				mediumDate:     "mmm d, yyyy",
				utcMediumDate:     "UTC:mmm d, yyyy",
				longDate:       "mmmm d, yyyy",
				utcLongDate:    "UTC:mmmm d, yyyy",
				fullDate:       "dddd, mmmm d, yyyy",
				fullDatePlusTime:       "dddd, mmmm d - h:MM tt",
				fullDateAndTime:      "mm/dd/yyyy hh:MM:ss TT",
				dateTimeForMemoChangeDate:      "m-d-yyyy hh:MM:ss TT",
				shortTime:      "h:MM TT",
				mediumTime:     "h:MM:ss TT",
				longTime:       "h:MM:ss TT Z",
				isoDate:        "yyyy-mm-dd",
				isoTime:        "HH:MM:ss",
				isoDateTime:    "yyyy-mm-dd'T'HH:MM:ss",
				isoUtcDateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'"
			};

			dF.masksLocalized = {
				'ja': {
					"default":      "yyyy-mm-dd (ddd) HH:MM:ss",
			    	utcDefault:      "UTC:yyyy-mm-dd (ddd) HH:MM:ss",
					shortDate:      "yyyy-m-d",
					utcShortDate:      "UTC:yyyy-m-d",
					shortDateWithZero:  "yyyy-mm-dd",
					mediumDate:     "yyyy-mm-d",
				    utcMediumDate:     "UTC:yyyy mm d",					
					longDate:       "yyyy-mm-d",
					utcLongDate:    "UTC:yyyy-mm-dd",
					fullDate:       "yyyy年m月d日 dddd",
					fullDatePlusTime:       "mm月d日- dddd - h:MM tt",
					fullDateAndTime:      "yyyy年m月d日 hh:MM:ss TT",
					dateTimeForMemoChangeDate:      "yyyy-m-d hh:MM:ss TT"
				}
			};
			
			
			if (currentLanguage && dF.masksLocalized.hasOwnProperty(currentLanguage)) {
				dF.masks = $.extend(dF.masks,dF.masksLocalized[currentLanguage]);
				}
          
			dF.i18n = {
				dayNames: [
					$.i18n.t("Sun", "shorthand for Sunday"),
					$.i18n.t("Mon", "shorthand for Monday"),
					$.i18n.t("Tue", "shorthand for Tuesday"),
					$.i18n.t("Wed", "shorthand for Wednesday"),
					$.i18n.t("Thu", "shorthand for Thursday"),
					$.i18n.t("Fri", "shorthand for Friday"),
					$.i18n.t("Sat", "shorthand for Saturday"),
					$.i18n.t("Sunday"),
					$.i18n.t("Monday"),
					$.i18n.t("Tuesday"),
					$.i18n.t("Wednesday"),
					$.i18n.t("Thursday"),
					$.i18n.t("Friday"),
					$.i18n.t("Saturday")
				],
				monthNames: [
					$.i18n.t("Jan", "shorthand for January"),
					$.i18n.t("Feb", "shorthand for February"),
					$.i18n.t("Mar", "shorthand for March"),
					$.i18n.t("Apr", "shorthand for April"),
					$.i18n.t("May", "shorthand for May"),
					$.i18n.t("Jun", "shorthand for June"),
					$.i18n.t("Jul", "shorthand for July"),
					$.i18n.t("Aug", "shorthand for August"),
					$.i18n.t("Sep", "shorthand for September"),
					$.i18n.t("Oct", "shorthand for October"),
					$.i18n.t("Nov", "shorthand for November"),
					$.i18n.t("Dec", "shorthand for December"),
					$.i18n.t("January"),
					$.i18n.t("February"),
					$.i18n.t("March"),
					$.i18n.t("April"),
					$.i18n.t("May"),
					$.i18n.t("June"),
					$.i18n.t("July"),
					$.i18n.t("August"),
					$.i18n.t("September"),
					$.i18n.t("October"),
					$.i18n.t("November"),
					$.i18n.t("December")
				]
			};
	
			// You can't provide utc if you skip other args (use the "UTC:" mask prefix)
			if (arguments.length == 1 && Object.prototype.toString.call(date) == "[object String]" && !/\d/.test(date)) {
				mask = date;
				date = undefined;
			}
	
			// Passing date through Date applies Date.parse, if necessary
			date = date ? new Date(date) : new Date;
			if (isNaN(date)) throw SyntaxError("invalid date");
	
			mask = String(dF.masks[mask] || mask || dF.masks["default"]);
	
			// Allow setting the utc argument via the mask
			if (mask.slice(0, 4) == "UTC:") {
				mask = mask.slice(4);
				utc = true;
			}
	
			var	_ = utc ? "getUTC" : "get",
				d = date[_ + "Date"](),
				D = date[_ + "Day"](),
				m = date[_ + "Month"](),
				y = date[_ + "FullYear"](),
				H = date[_ + "Hours"](),
				M = date[_ + "Minutes"](),
				s = date[_ + "Seconds"](),
				L = date[_ + "Milliseconds"](),
				o = utc ? 0 : date.getTimezoneOffset(),
				flags = {
					d:    d,
					dd:   pad(d),
					ddd:  dF.i18n.dayNames[D],
					dddd: dF.i18n.dayNames[D + 7],
					m:    m + 1,
					mm:   pad(m + 1),
					mmm:  dF.i18n.monthNames[m],
					mmmm: dF.i18n.monthNames[m + 12],
					yy:   String(y).slice(2),
					yyyy: y,
					h:    H % 12 || 12,
					hh:   pad(H % 12 || 12),
					H:    H,
					HH:   pad(H),
					M:    M,
					MM:   pad(M),
					s:    s,
					ss:   pad(s),
					l:    pad(L, 3),
					L:    pad(L > 99 ? Math.round(L / 10) : L),
					t:    H < 12 ? "a"  : "p",
					tt:   H < 12 ? "am" : "pm",
					T:    H < 12 ? "A"  : "P",
					TT:   H < 12 ? "AM" : "PM",
					Z:    utc ? "UTC" : (String(date).match(timezone) || [""]).pop().replace(timezoneClip, ""),
					o:    (o > 0 ? "-" : "+") + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
					S:    ["th", "st", "nd", "rd"][d % 10 > 3 ? 0 : (d % 100 - d % 10 != 10) * d % 10]
				};
	
			return mask.replace(token, function ($0) {
				return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
			});
		};
	}(),
	
	
	// WARNING - THIS IS AN OLD VERSION - USE THE linkify or linkifyHtml methods, below when at all possible
	// WARNING! This method will currently "double link" an existing link
	//  e.g. '<a href="http://foo.com/">link</a>' will become broken HTML like this: '<a href="<a href="http://foo.com/">http://foo.com/</a>">link</a>'
	//  - the linkLookalike param is used for if you want to identify the link, but not make it actually one (as in small memos)
	convertURLstringsToAnchors : function ( str, linkLookalike ) {
		var replacement = '<a href="$1" target="_blank">$1</a>';
		if (linkLookalike) {
			replacement = '<span class="aStyle">$1</span>';
		}
		
		return str.replace(
			/((http|ftp|https):\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&amp;:\/~\+#]*[\w\-\@?^=%&amp;\/~\+#])?)/ig,
			replacement
		);
	},
	
	
	/* File:        linkify.js
	* Version:     20101010_1000
	* Copyright:   (c) 2010 Jeff Roberson - http://jmrware.com
	* MIT License: http://www.opensource.org/licenses/mit-license.php
	*
	* Summary: This script linkifys http URLs on a page.
	*
	* Usage:   See demonstration page: http://jmrware.com/articles/2010/linkifyurl/linkify.html
	*/
	linkify : function (text) {
		var url_pattern = /(\()((?:ht|f)tps?:\/\/[a-z0-9\-._~!$&'()*+,;=:\/?#[\]@%]+)(\))|(\[)((?:ht|f)tps?:\/\/[a-z0-9\-._~!$&'()*+,;=:\/?#[\]@%]+)(\])|(\{)((?:ht|f)tps?:\/\/[a-z0-9\-._~!$&'()*+,;=:\/?#[\]@%]+)(\})|(<|&(?:lt|#60|#x3c);)((?:ht|f)tps?:\/\/[a-z0-9\-._~!$&'()*+,;=:\/?#[\]@%]+)(>|&(?:gt|#62|#x3e);)|((?:^|[^=\s'"\]])\s*['"]?|[^=\s]\s+)(\b(?:ht|f)tps?:\/\/[a-z0-9\-._~!$'()*+,;=:\/?#[\]@%]+(?:(?!&(?:gt|#0*62|#x0*3e);|&(?:amp|apos|quot|#0*3[49]|#x0*2[27]);[.!&',:?;]?(?:[^a-z0-9\-._~!$&'()*+,;=:\/?#[\]@%]|$))&[a-z0-9\-._~!$'()*+,;=:\/?#[\]@%]*)*[a-z0-9\-_~$()*+=\/#[\]@%])/img;
		var url_replace = '$1$4$7$10$13<a href="$2$5$8$11$14">$2$5$8$11$14</a>$3$6$9$12';
		return text.replace(url_pattern, url_replace);
	},
	linkifyHtml : function (text) {
		text = text.replace(/&amp;apos;/g, '&#39;'); // IE does not handle &apos; entity!
		section_html_pattern = /([^<]+(?:(?!<a\b)<[^<]*)*|(?:(?!<a\b)<[^<]*)+)|(<a\b[^>]*>[^<]*(?:(?!<\/a\b)<[^<]*)*<\/a\s*>)/ig;
		return text.replace(section_html_pattern, _linkify_html_callback);
	},
	
	
	/**
	* URL Hash management tool
	* Example:
	*		Hash.set("a=b&c=d")
	*			or 
	*		Hash.set({a: "b", c: "d"})
				or
			Hash.get('a') -> "b"
				or 
			Hash.go(Hash.set({a:10}))
	*/
	urlHash : {
		set: function (s) {
			var arg = $.toQueryParams(s)
			var cur = $.toQueryParams(location.hash)
			for (var i in arg)
				cur[i] = arg[i]
			return $.toQueryString(cur);
		},
		
		remove: function (s) {
			var arg = $.toQueryParams(s);
			var cur = $.toQueryParams(location.hash)
			var res = {}
			for (var i in cur) {
				if (arg[i] != undefined)
					continue;
				res[i] = cur[i]
			}
			return $.toQueryString(res)
		},
		
		get: function(key) {
		    var hash;
		    if (m.embeddedParams && typeof m.embeddedParams.memo_hash != 'undefined' && m.embeddedParams.memo_hash != '') {
			hash = m.embeddedParams.memo_hash;
		    } else {
			hash = location.hash;
		    }

			if (typeof key == 'undefined')
				return $.toQueryParams(hash)
			return $.toQueryParams(hash)[key]
		},
		
		go: function(s) {
			location.hash = s.substr(0,1)=='#' ? s : '#'+s
			return false
		} 
	},
	
	getMessages : function() {
		// If our data is set, we unbind the message handler.
		$(window).bind('message', function(e) {
			// We only explicitly accept variable names for security reasons.
			for (name in e.originalEvent.data) {
				if (name.match(/custom_hostname/)) {
					m.embeddedParams.custom_hostname = e.originalEvent.data[name];
				}
				
				if (name.match(/custom_pathname/)) {
					m.embeddedParams.custom_pathname = e.originalEvent.data[name];
				}
			}
			
			// You only get one chance baby.
			$(window).unbind('message');
			
			return true;
		});
	},

	// WTF
	// http://javascript.about.com/od/problemsolving/a/modulobug.htm
	fixedModulus : function(n, m) {
		return ((n%m)+m)%m;
	}
};
