function Dbstore() {
	if (typeof self.indexedDB === 'undefined') {
		this.db = false;
		this.loadData();
	} else {
		var request = self.indexedDB.open('iwcDB', 1);
		request.onerror = this.onOpenError.bind(this);
		request.onupgradeneeded = this.onupgradeneeded.bind(this);
		request.onsuccess  = this.onConnection.bind(this);
		/* TODO: */
		request.onblocked  = this.onupgradeneeded.bind(this);
	}
}

/*
	To remove Db from browser:
	indexedDB.deleteDatabase('iwcDB')
*/

Dbstore.prototype.onBlocked = function(event) {
	sendMessage($$('insideWeCube is running in another tab. Its version is deprecated and must be refresh.'), 'info', {
		time: 7000,
		html: false
	});
};

Dbstore.prototype.onOpenError = function(event) {
	Dbstore.error('error while opening DB');
	this.db = false;
	this.loadData();
};

Dbstore.prototype.onupgradeneeded = function(event) {
	this.db = event.target.result;

	var objectStore;

	switch(event.oldVersion) {
		case 0:
			objectStore = this.db.createObjectStore('cubes');
			objectStore.createIndex('name', 'name', {unique: false});

			objectStore = this.db.createObjectStore('draft', {keyPath: 'history', autoIncrement: true});
	}
};

Dbstore.prototype.onVersionChange = function(event) {
	console.warn('indexedDB version has change in a newer tab. This page should be reloaded.');
	sendMessage($$('A newer version of insideWeCube is running in another tab. You can\'t save anymore your change.<br>Please refresh the page.'), 'error', {
		time: false,
		html: true
	});
	this.db.close();
	this.db = false;
};

Dbstore.prototype.onConnection = function(event) {
	if (this.db) {
		this.loadData();
	} else {
		this.db = event.target.result;
	}

	this.db.onversionchange = this.onVersionChange.bind(this);

	this.loadToStore();
};

/** Load data from file and send them to store */
Dbstore.prototype.loadData = function() {
	var xhr = new XMLHttpRequest(),
		user = '',
		password = '';
	
	xhr.onreadystatechange = function() {
		if (xhr.readyState === 4 && (xhr.status === 200 || xhr.status === 0)) {
			self.saveCubes(xhr.responseText, {original: true});
		}
	};
	
	xhr.open("GET", "../common/cubes.json", true, user, password);
	xhr.send();
};

/** Load existing data to store */
Dbstore.prototype.loadToStore = function() {
	this.getCubes(storeSaves.bind(this));

	function storeSaves(cubes) {
		if (cubes) {
			if (cubes.length) {
				cubes.forEach(function(cube) {
					self.saveCube(JSON.stringify(cube), {fromDB: true});
				});
			} else {
				this.loadData();
			}
		}
	}
};

Dbstore.prototype.getCube = function(name, callback) {
	var cubes = [];

	if (this.db) {
		var request = this.db
			.transaction(['cubes'], 'readonly')
			.objectStore('cubes')
			.index('name')
			.get(name);

		request.onsuccess = function(event) {
			callback(event.target.result);
		};
	} else {
		callback(null);
	}
};

Dbstore.prototype.getCubes = function(callback) {
	var cubes = [];

	if (this.db) {
		var request = this.db
			.transaction(['cubes'], 'readonly')
			.objectStore('cubes')
			.index('name')
			.openCursor();

		request.onsuccess = readCursor;
	} else {
		callback(null);
	}

	function readCursor(event) {
		var cursor = event.target.result;

		if (cursor) {
			cubes.push(cursor.value);
			cursor.continue();
		} else {
			callback(cubes);
		}
	}
};

Dbstore.prototype.setCube = function(cube, option) {
	if (this.db) {
		option = option || {};
		var name = cube.name;
		var isOriginal;

		if (typeof option.original !== 'undefined') {
			isOriginal = !!option.original;
		} else if (option.keepOriginal) {
			isOriginal = !!cube.original;
		} else {
			isOriginal = false;
		}

		var key = name + isOriginal;

		cube.original = isOriginal;
		var transaction = this.db.transaction(['cubes'], 'readwrite');
		var request = transaction.objectStore('cubes').put(cube, key);
	}
};

Dbstore.prototype.removeCube = function(cubeName, callback) {
	if (this.db) {
		var key = cubeName + false;

		var transaction = this.db.transaction(['cubes'], 'readwrite');
		var request = transaction.objectStore('cubes').delete(key);
		request.onsuccess = callback;
		request.onerror = callback;
	} else {
		callback(null);
	}
};

/* Static methods */

Dbstore.error = function(message) {
	return function(event) {
		console.error(message, event);
	};
};
