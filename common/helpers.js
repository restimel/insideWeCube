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
			{id: 'back', text: $$('The rear side is at the top.')}
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

	buildSelect: function buildSelect(select, list, selectedList, clearOptions) {
		selectedList = selectedList || [];
		if (!(selectedList instanceof Array)) {
			selectedList = [selectedList];
		}

		if (clearOptions) {
			select.innerHTML=  '';
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

	buildStats: function(info) {
		var caracs = Helper.ratingCaracs;
		var pathLength = info.length + 1,
			nbAvailable = info.available,
			dEndLength = nbAvailable - pathLength,
			nbDEnd = Math.max(info.deadEnd, 0),
			nbChgLvl = info.chgLevel,
			nbChgDir = info.chgDirection,
			nbMvtRot = info.chgTop,
			nbMovement = info.nbMovement,
			rateRot = nbMvtRot / nbMovement,
			nbOut = info.nbMvtOutPath,
			nbDifficultCrs = info.nbDifficultCrossing,
			rateDir = nbChgDir / pathLength;

		var data = {
			pathLength: pathLength,
			nbAvailable: nbAvailable,
			dEndLength: dEndLength,
			nbDEnd: nbDEnd,
			nbChgLvl: nbChgLvl,
			nbChgDir: nbChgDir,
			nbMvtRot: nbMvtRot,
			nbMovement: nbMovement,
			rateRot: rateRot,
			nbOut: nbOut,
			nbDifficultCrs: nbDifficultCrs,
			rateDir: rateDir,
		};

		var difficulty = caracs.reduce(function (sum, carac) {
			var key = 'pnd_' + carac;
			return sum + data[carac] * Helper.config[key];
		}, 0);
		var maxDifficulty = caracs.reduce(function (sum, carac) {
			var max_key = 'max_' + carac;
			var pdn_key = 'pnd_' + carac;
			return sum + Helper.config[max_key] * Helper.config[pdn_key];
		}, 0);

		return {
			pathLength: pathLength,
			nbAvailable: nbAvailable,
			dEndLength: dEndLength,
			nbDEnd: nbDEnd,
			nbChgLvl: nbChgLvl,
			nbChgDir: nbChgDir,
			nbMvtRot: nbMvtRot,
			nbMovement: nbMovement,
			rateRot: rateRot,
			nbOut: nbOut,
			nbDifficultCrs: nbDifficultCrs,
			rateDir: rateDir,
			difficulty: difficulty,
			maxDifficulty: maxDifficulty,
		};
	},

	ratingCaracs: [
		'nbAvailable',
		'pathLength',
		'dEndLength',
		'nbChgDir',
		'nbChgLvl',
		'nbMovement',
		'nbMvtRot',
		'rateRot',
		'nbOut',
		'nbDifficultCrs',
		'nbDEnd',
		'rateDir'
	],

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

	function getNum(key, dfltValue) {
		var value, val;

		if (hasLocalStorage) {
			value = self.localStorage.getItem(key);
			if (value === null) {
				value = dfltValue;
			} else {
				value = parseFloat(value);
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
		advanced: get('advanced', false), /* if true it display advanced tools */
		stickerMaps: get('stickerMaps', false), /* if true, allow to display the sticker maps */
		phantomBalls: get('phantomBalls', true), /* if true, phantom area are considered as visible */

		pnd_nbAvailable: getNum('pnd_nbAvailable', 0),
		pnd_pathLength: getNum('pnd_pathLength', 0),
		pnd_dEndLength: getNum('pnd_dEndLength', 0.1),
		pnd_nbChgDir: getNum('pnd_nbChgDir', 0),
		pnd_nbChgLvl: getNum('pnd_nbChgLvl', 0.5),
		pnd_nbMovement: getNum('pnd_nbMovement', 0.5),
		pnd_nbMvtRot: getNum('pnd_nbMvtRot', 0),
		pnd_rateRot: getNum('pnd_rateRot', 10),
		pnd_nbOut: getNum('pnd_nbOut', 2),
		pnd_nbDifficultCrs: getNum('pnd_nbDifficultCrs', 11),
		pnd_nbDEnd: getNum('pnd_nbDEnd', 0.2),
		pnd_rateDir: getNum('pnd_rateDir', 0),

		max_nbAvailable: getNum('max_nbAvailable', 240),
		max_pathLength: getNum('max_pathLength', 240),
		max_dEndLength: getNum('max_dEndLength', 100),
		max_nbChgDir: getNum('max_nbChgDir', 100),
		max_nbChgLvl: getNum('max_nbChgLvl', 70),
		max_nbMovement: getNum('max_nbMovement', 110),
		max_nbMvtRot: getNum('max_nbMvtRot', 25),
		max_rateRot: getNum('max_rateRot', 0.75),
		max_nbOut: getNum('max_nbOut', 15),
		max_nbDifficultCrs: getNum('max_nbDifficultCrs', 5),
		max_nbDEnd: getNum('max_nbDEnd', 20),
		max_rateDir: getNum('max_rateDir', 1)
	}

	function buildGet(property) {
		return function() {
			return this._values[property];
		};
	}

	function buildSet(property, val) {
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
	}

	function buildBooleanSet(property) {
		return function(val) {
			val = !!val;
			buildSet.call(this, property, val);
		};
	}

	function buildNumberSet(property) {
		return function(val) {
			val = parseFloat(val);
			buildSet.call(this, property, val);
		};
	}

	['lid', 'pin', 'trsfmLvl', 'advanced', 'stickerMaps', 'phantomBalls']
		.forEach(function(key)
	{
		Object.defineProperty(Helper.config, key, {
			get: buildGet(key),
			set: buildBooleanSet(key)
		});
	});

	Helper.ratingCaracs.forEach(function(carac) {
		var key = 'pnd_' + carac;

		Object.defineProperty(Helper.config, key, {
			get: buildGet(key),
			set: buildNumberSet(key)
		});

		key = 'max_' + carac;

		Object.defineProperty(Helper.config, key, {
			get: buildGet(key),
			set: buildNumberSet(key)
		});
	});

	Helper.mainLoaded = function() {
		hasMainControl = typeof Control === 'function';

		/* send default config to worker*/
		if (hasMainControl) {
			main.control.action('config', Helper.config._values);
		}
	};
})();
