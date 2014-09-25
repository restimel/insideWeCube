(function() {
	var languages = ['en', 'fr'];
	var translation = {};
	var readyCallback = [];

	var lng = self.navigator.language;
	if ((lng || '').indexOf('-') !== -1) {
		lng = lng.split('-')[0];
	}

	if (languages.indexOf(lng) === -1) {
		lng = 'en';
	}

	/**
	 * replace token key by matching translation
	 * strings are replace by words depending of rplcW
	 */
	function matching(key) {
		var wo = translation[key],
			w,
			keys = Array.prototype.slice.call(arguments, 1).reverse();

		if (typeof wo === 'undefined') {
			console.warn('Translation missing', key);
			w = key;
		} else {

			w = wo[lng];

			if (typeof w === 'undefined') {
				console.warn('Translation in "' + lng + '" is missing',  key);
				w = wo['en'];

				if (typeof w === 'undefined') {
					w = key;
				}
			}
		}

		if (keys.length) {
			if (keys.length === 1 && keys[0] instanceof Array) {
				keys = keys[0];
			}

			w = w.replace(/%[^\s,;.!?:'"]/g, replaceKeys);
		}

		return w;

		function replaceKeys(flag) {
			if (flag === '%%') {
				return '%';
			}

			var k = keys.pop();
			if (typeof k === 'undefined') {
				console.warn('Flag replacement missing for "' + w + '".\n' + m + 'does not have any value');
				k = '';
			}

			switch(flag) {
				case '%r':
				case '%a':
				case '%s':
					return k.toString();
				case '%c':
					return k.toString()[0] || '';
				case '%f':
				case '%F':
				case '%g':
				case '%u':
				case '%d':
					return Number(k);
				case '%G':
					return Number(k).toString().toUpperCase();
				case '%i':
				case '%1':
					return parseInt(k, 10);
				case '%o':
					return Number(k).toString(8);
				case '%x':
					return Number(k).toString(16);
				case '%X':
					return Number(k).toString(16).toUpperCase();
				case '%e':
					return Number(k).toExponential();
				case '%E':
					return Number(k).toExponential().toUpperCase();
				case '%0':
				case '%2':
					return pad(k, 2);
				case '%3':
					return pad(k, 3);
				case '%4':
					return pad(k, 4);
				case '%5':
					return pad(k, 5);
				case '%6':
					return pad(k, 6);
				case '%7':
					return pad(k, 7);
				case '%8':
					return pad(k, 8);
				case '%9':
					return pad(k, 9);
				case '%+':
					return (Number(k) > 0 ? '+' : '') + Number(k);
				default:
					console.warn('unknown Flag (' + flag + ')');
					keys.push(k);
					return flag;
			}
		}
	};

	matching.changeLng = function(lg) {
		var l = languages.indexOf(lg);

		if (l === -1) {
			console.warn('language unknown', lg);
		} else {
			lng = languages[l];
		}
	};

	/**
	 * return list of available languages
	 */
	matching.getLng = function() {
		return languages;
	};

	/**
	 * return the current language
	 */
	matching.getCurrentLng = function() {
		return lng;
	};

	matching.onready = function(f) {
		if (typeof f === 'function') {
			readyCallback.push(f);
			return true;
		} else {
			return false;
		}
	};
	
	function pad(nb, digit) {
		var i = parseInt(nb, 10).toString(),
			str = nb.toString(),
			n = Number(nb);

		if (str.length === digit) {
			return str;
		}

		if (str.length < digit) {
			return pad('0' + str, digit);
		}

		if (i.length >= digit) {
			return i;
		}

		return n.toFixed(digit - i.length);
	}

	function loadTranslation(){
		var xhr = new XMLHttpRequest(),
			user = '',
			password = '';
		
		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4 && (xhr.status == 200 || xhr.status == 0)) {
				try {
					translation = JSON.parse(xhr.responseText);
				} catch(e) {
					console.error('translation not loaded', e);
				}

				readyCallback.forEach(function(f) {
					f(lng);
				});
			}
		};
		
		xhr.open("GET", "/libs/i18n/translations.json", true, user, password);
		xhr.send();
	}

	loadTranslation();

	self.$$ = matching;
})();