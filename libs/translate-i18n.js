var $$ = (function() {
	var languages = ['en', 'fr'];
	var translation = {

	};

	var lng = 'en';

	/**
	 * replace token key by matching translation
	 * strings are replace by words depending of rplcW
	 */
	function matching(key, rplcW) {
		var w = translation[key];

		if (typeof w === 'undefined') {
			console.warn('Translation missing', key);
			return key;
		}

		w = w[lng];

		if (rplcW) {
			w = w.replace(/%s/g, rplcW['%s']);
		}

		return w;
	};

	matching.changeLng = function(lg) {
		var l = languages.indexOf(lg);

		if (l === -1) {
			console.warn('language unknown', lg);
		} else {
			lng = l;
		}
	};

	return  matching;
})();