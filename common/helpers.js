var Helper = {

	selectCubeOrientation: function(callback, value) {
		var label = document.createElement('label'),
			select = document.createElement('select');

		label.textContent = $$('Map orientation: ');
		select.onchange = function() {
			callback(this.value);
		};

		[{id: 'top', text: $$('INSIDE³ side is at the top')},
		 {id: 'bottom', text: $$('INSIDE³ side is at the bottom')}
		].forEach(function(item) {
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
		var value = hasLocalStorage ? self.localStorage.getItem(key) === 'true' : null;
		return value === null ? dfltValue : value;
	}

	Helper.config._values = {
		lid: get('lid', false), /* if true, allow to put other levels at last level */
		pin: get('pin', false), /* if true, the ball is not block by pin */
		advanced: get('advanced', false) /* if true it display advanced tools */
	}

	Object.defineProperty(Helper.config, 'lid', {
		get: function() {
			return this._values.lid;
		},
		set: function(val) {
			val = !!val;
			if (hasLocalStorage) {
				self.localStorage.setItem('lid', val);
			}
			if (hasMainControl) {
				main.control.action('config', {lid: val});
			}
			this._values.lid = val;
		}
	});

	Object.defineProperty(Helper.config, 'pin', {
		get: function() {
			return this._values.pin;
		},
		set: function(val) {
			val = !!val;
			if (hasLocalStorage) {
				self.localStorage.setItem('pin', val);
			}
			if (hasMainControl) {
				main.control.action('config', {pin: val});
			}
			this._values.pin = val;
		}
	});

	Object.defineProperty(Helper.config, 'advanced', {
		get: function() {
			return this._values.advanced;
		},
		set: function(val) {
			val = !!val;
			if (hasLocalStorage) {
				self.localStorage.setItem('advanced', val);
			}
			if (hasMainControl) {
				main.control.action('config', {advanced: val});
			}
			this._values.advanced = val;
		}
	});

	Helper.mainLoaded = function() {
		hasMainControl = typeof Control === 'function';

		/* send default config to worker*/
		if (hasMainControl) {
			main.control.action('config', Helper.config._values);
		}
	};
})();
