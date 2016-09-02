var Memolane = {
    embedConfig : {},

    // Adaptation of:
    // http://jquery-howto.blogspot.com/2009/09/get-url-parameters-values-with-jquery.html
    getGETVars : function () {
	if (!self.location.href.match(/\?.+/)) {
	    return {};
	}

	var vars = {};
	var hashes = self.location.href.slice(self.location.href.indexOf('?') + 1).split('&');

	for (var i = 0; i < hashes.length; i++) {
            hash = hashes[i].split('=');

            // 'cause of Memolane's memo hash format.
            if (hash[0] == 'breakCache') {
		vars[hash[0]] = hash[1] + '=' + hash[2];
            } else {
		vars[hash[0]] = hash[1];
	    }
	}

	return vars;
    },

    config : function(config) {
	for (name in config) {
	    this.embedConfig[name] = config[name];
	}
    },

    url : function() {
	var GETstring = this.getMemoHash();
	for (n in this.embedConfig) {
	    GETstring += '&' + n + '=' + encodeURIComponent(this.embedConfig[n]);
	}
	return this.embedConfig['url'] + '?' + GETstring;
    },

    getMemoHash : function() {
	var vars = this.getGETVars();
	if (typeof vars['breakCache'] != 'undefined' && typeof vars['memo'] != 'undefined') {
	    var memo_hash = 'breakCache=' + vars['breakCache'] + '&memo=' + vars['memo'];
	    return 'memo_hash=' + encodeURIComponent(memo_hash.replace(/^&/, ''));
	} else {
	    return '';
	}
    },

    writeScript : function() {
	document.write("<script src='" + this.url() + "'></script>");
    }
};
