(function() {
	var languages = ['en', 'fr', 'it'];
	var translation = {};
	var readyCallback = [];
	var path = './';
	var isReady = false;

	var localTranslation = {
		time_day: {
			en: 'd',
			fr: 'j',
			it: 'g'
		},
		time_hour: {
			en: 'h',
			fr: 'h',
			it: 'o'
		},
		time_min: {
			en: 'min',
			fr: 'min',
			it: 'min'
		},
		time_sec: {
			en: 's',
			fr: 's',
			it: 's'
		},
		time_msec: {
			en: 'ms',
			fr: 'ms',
			it: 'ms'
		}
	};

	var lng = self.navigator.language;

	if (typeof self.localStorage !== 'undefined') {
		lng = self.localStorage.getItem('language') || lng;
	}

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

			if (typeof w === 'undefined' || !w) {
				console.warn('Translation in "' + lng + '" is missing',  key);
				w = wo['en'];

				if (typeof w === 'undefined' || !w) {
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
				case '%D':
					return prettyNb(k);
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
				case '%T':
					return delayFormat(k);
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

			if (typeof self.localStorage !== 'undefined') {
				self.localStorage.setItem('language', lng);
			}
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
			if (isReady) {
				f(lng, true);
			}
			return true;
		} else {
			return false;
		}
	};

	/**
	 * Set Configuration
	 *  - path {String} path of the application
	 */
	matching.configuration = function(option) {
		if (typeof option.path === 'string') {
			path = option.path;
			if (path.lastIndexOf('/') !== path.length - 1) {
				path += '/';
			}
		}
	}
	
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

	function prettyNb(nb) {
		var i = parseInt(nb, 10),
			suffix = 0,
			list = ['','k', 'M', 'G', 'T', 'P', 'Z'];

		while (i/1000 > 1) {
			suffix++;
			i /= 1000;
		}

		return (suffix ? i.toFixed(2) : i) + list[suffix];
	}

	function delayFormat(nb) {
		var d = Math.floor(nb / 86400);
		var h = Math.floor((nb % 86400) / 3600);
		var min = Math.floor((nb % 3600) / 60);
		var s = Math.floor(nb % 60);
		var ms = Math.floor((nb%1) * 1000);
		var str = [];

		if (d) {
			str.push(d + localTranslation.time_day[lng]);
		}

		if (h) {
			str.push(h + localTranslation.time_hour[lng]);
		}

		if (min) {
			str.push(min + localTranslation.time_min[lng]);
		}

		if (s) {
			str.push(s + localTranslation.time_sec[lng]);
		}

		if (ms) {
			str.push(ms + localTranslation.time_msec[lng]);
		}

		return str.join(' ');
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

				loaded(true);
				isReady = true;
			}
		};
		
		xhr.open('GET', path + 'libs/i18n/translations.json', true, user, password);
		xhr.send();

		var timer = setTimeout(loaded, 2000, false);

		function loaded(value) {
			clearTimeout(timer);

			readyCallback.forEach(function(f) {
				f(lng, value);
			});
		}
	}

	if (typeof self.$$configuration === 'object') {
		matching.configuration(self.$$configuration);
	}

	loadTranslation();

	self.$$ = matching;
})();