var Helper = {

	selectCubeOrientation: function(callback, value) {
		var label = document.createElement('label'),
			select = document.createElement('select');

		label.textContent = $$('Map orientation: ');
		select.onchange = function() {
			callback(this.value);
		};

		var selectors = [
			{id: 'top', text: $$('The INSIDE³ side is at the top.')},
			{id: 'bottom', text: $$('The INSIDE³ side is at the bottom.')},
			{id: 'right', text: $$('The right side is at the top.')},
			{id: 'left', text: $$('The left side is at the top.')},
			{id: 'front', text: $$('The front side is at the top.')},
			{id: 'back', text: $$('The back side is at the top.')}
		];

		selectors.forEach(function(item) {
			var option = document.createElement('option');
			option.value = item.id;
			option.textContent = item.text;
			
			if (item.id === value) {
				option.selected = true;
			}

			select.add(option);
		}, this);
		label.appendChild(select);

		return label;
	},

	buildSelect: function buildSelect(select, list, selectedList) {
		selectedList = selectedList || [];
		if (!(selectedList instanceof Array)) {
			selectedList = [selectedList];
		}

		list.forEach(function(opt) {
			var option, value;

			if (opt.options instanceof Array) {
				option = document.createElement('optGroup');
				option.label = opt.name;
				buildSelect(option, opt.options, selectedList);
			} else {
				if (typeof opt === 'string') {
					opt = {name: opt};
				}

				option = document.createElement('option');
				option.textContent = opt.name;
				option.value = value = opt.id || opt.code || opt.name;
				if (selectedList.indexOf(value) !== -1) {
					option.selected = true;
				}
			}

			if (typeof select.add === 'function') {
				select.add(option);
			} else {
				select.appendChild(option);
			}
		});
	},

	/**
	 * Configuration (default values)
	 */

	cssPath: ['css/main.css', 'css/cube3D.css'],
	mainPath: '',

	config: {}
};

(function initConfig() {
	var hasLocalStorage = typeof self.localStorage !== 'undefined';
	var hasMainControl = false;

	function get(key, dfltValue) {
		var value, val;

		if (hasLocalStorage) {
			value = self.localStorage.getItem(key);
			if (value === null) {
				value = dfltValue;
			} else {
				value = value === 'true';
			}
		} else {
			value = dfltValue;
		}

		return value;
	}

	Helper.config._values = {
		lid: get('lid', true), /* if true, only lid levels can be sleected at last level */
		pin: get('pin', false), /* if true, the ball is not block by pin */
		trsfmLvl: get('trsfmLvl', false), /* if true, allow to transform level (rotation, ...) */
		advanced: get('advanced', false) /* if true it display advanced tools */
	}

	function buildGet(property) {
		return function() {
			return this._values[property];
		};
	}

	function buildBooleanSet(property) {
		return function(val) {
			val = !!val;
			var obj;

			if (hasLocalStorage) {
				self.localStorage.setItem(property, val);
			}
			if (hasMainControl) {
				obj = {};
				obj[property] = val;
				main.control.action('config', obj);
			}
			this._values[property] = val;
		};
	}

	Object.defineProperty(Helper.config, 'lid', {
		get: buildGet('lid'),
		set: buildBooleanSet('lid')
	});

	Object.defineProperty(Helper.config, 'pin', {
		get: buildGet('pin'),
		set: buildBooleanSet('pin')
	});

	Object.defineProperty(Helper.config, 'trsfmLvl', {
		get: buildGet('trsfmLvl'),
		set: buildBooleanSet('trsfmLvl')
	});

	Object.defineProperty(Helper.config, 'advanced', {
		get: buildGet('advanced'),
		set: buildBooleanSet('advanced')
	});

	Helper.mainLoaded = function() {
		hasMainControl = typeof Control === 'function';

		/* send default config to worker*/
		if (hasMainControl) {
			main.control.action('config', Helper.config._values);
		}
	};
})();
