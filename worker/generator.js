function Generator() {
	this.cube = new Cube();
	this.gLevels = [];
	this.path = new Path();
	this.path.result = this.pathResult.bind(this);
	this.status = 'not ready';
	this.deepest = this.size -1;

	this.cube.init();
}

Generator.prototype.size = 7;
Generator.prototype.sid = 0; /*single id */
Generator.prototype.timer = 0;

Generator.prototype.router = function(args, token) {
	var route = args.action,
		data = args.data,
		f = this[route];

	this.token = token;

	if (typeof f === 'function') {
		f.call(this, data);
	} else {
		console.warn('Route not found', route);
	}
};

/* Communication with back worker */

Generator.prototype.createWorker = function(forceNew) {
	if (!forceNew && this.worker && this.worker.status === 'waiting') {
		return;
	}

	if (this.worker && this.worker.status !== 'waiting') {
		this.worker.terminate();
	}

	this.worker = createWorker();
	this.worker.onmessage = this.backWorkerMessage.bind(this);
	this.worker.status = 'waiting';
};

Generator.prototype.backWorkerMessage = function(e) {
	var action = e.data.data.action;
	var data = e.data.data.data;

	switch(action) {
		case 'finished':
			console.info($$('Spent time to find out solutions: %{u:s}t', (performance.now() - this.timer)/1000))
			this.worker.status = 'waiting';
		case 'runningState':
		case 'result':
			this.result(action, data);
			break;
		case 'computeInformations':
		case 'newWorker':
			/* Ignore these requests */
			return;
		default:
			console.warn('unknown action', action);
	}
};

Generator.prototype.sendToWorker = function(route, data) {
	this.worker.postMessage({action: 'generator', args: {action: route, data: data}});
};

/* Action */

Generator.prototype.result = function(action, data) {
	if (!data) {
		data = action;
		action = 'result';
	}

	self.postMessage({data: {action: action, data: data}, token: this.token});
};

Generator.prototype.runningCompute = function() {
	var timeBeforeRefresh = 700;
	this.running = true;
	this.timer = performance.now();
	
	// var t = performance.now();
	// var count = 0;
	// var t1, t2;
	// var measure = {t1:0, t2:0};
	while (this.running) {
		// count++;
		// t1 = performance.now();
		// this.path.loadLevels(this.lastGLevel.getLevels().map(LevelGenerator._getLvlId));
		this.path.loadLevels(this.lastGLevel.getLevels());

		// measure.t1 += performance.now() - t1;

		if (performance.now() - this.timer > timeBeforeRefresh) {
			this.result('runningState', this.lastGLevel.getIndexStatus());
			this.timer = performance.now();
		}

		// t2 = performance.now();
		// if (this.lastGLevel.inc() === -1) {
		// 	this.running = false;
		// }
		if (this.gLevels[this.deepest].inc(true) === -1) {
			this.running = false;
		}
		// measure.t2 += performance.now() - t2;
	}
	// console.log('nb loop', count);
	// t = performance.now() -t;
	// this.result('debug',{name:'total', time: t, mean: t/count});
	// this.result('debug',{name:'path', time: measure.t1, mean: measure.t1/count});
	// this.result('debug',{name:'next', time: measure.t2, mean: measure.t2/count});
};

Generator.prototype.pathResult = function(rslt) {
	if (rslt.info.finish) {
		rslt.levels = this.lastGLevel.getLevels().map(LevelGenerator._getLvlId);
		this.result(rslt);
	}
	this.deepest = rslt.info.deepest;
};

Generator.prototype.finish = function() {
	this.result('runningState', this.lastGLevel.getIndexStatus());
	this.result('finished', {});
	this.running = false;
};

Generator.prototype.prepareLevels = function(levels, sid) {
	var lidOnly = Helper.config.lid;
	var good = true;

	if (!sid) {
		this.sid++;
	} else
	if (this.sid > sid) {
		return; /*deprecated call */
	}

	/* define configuration */
	this.lidLevels = [];
	this.levels = []

	levels.forEach(function(level) {
		var lvl = store.getLevel(level);
		if (!lvl) {
			good = false;
			return;
		}
		lvl.id = level;

		if (lvl.lid) {
			this.lidLevels.push(lvl);
		} else {
			this.levels.push(lvl);
			if (!lidOnly) {
				this.lidLevels.push(lvl);
			}
		}
	}, this);

	if (!good) {
		if (this.status === 'waiting levels') {
			console.warn('some levels can not be loaded :(');
			this.status = 'not ready';
			return;
		}
		this.status = 'waiting levels';
		setTimeout(this.prepareLevels.bind(this, levels, this.sid), 1000);
		return;
	}

	this.levels.forEach(function(lvl) {
		lvl.pins = lvl.getOutSidePins();
	});

	/* prepare the levels */
	var p = null;
	var nb = this.size - 1;
	var i = this.size;
	this.gLevels = [];
	while(--i) {
		p = new LevelGenerator(this.levels, nb - i, p, this.finish.bind(this));
		this.gLevels.push(p);
	}
	p = new LevelGenerator(this.lidLevels, nb, p, this.finish.bind(this));
	this.gLevels.push(p);
	this.lastGLevel = p;

	this.status = 'ready';
};

/* Routing */

Generator.prototype.stop = function(data) {
	if (this.worker && this.worker.status === 'running') {
		this.worker.terminate();
		this.createWorker(true);
		this.sendToWorker('loadLevels', {levels: this.rawLevels, backWorker: true});
	} else {
		console.log('issue with worker status', this.worker && this.worker.status);
	}
};

Generator.prototype.startCompute = function(data, attempts) {
	if (this.status !== 'ready') {
		attempts = typeof attempts === 'number' ? attempts : 1;
		if (!attempts) {
			this.result('issueBeforeRun', [$$('Some levels have failed to load. Try again, but if it persists check that your list is up-to-date.')]);
			return;
		}

		this.loadLevels(data);
		if (this.status !== 'ready') {
			setTimeout(this.startCompute.bind(this, data, --attempts), 1500);
			return;
		}
	}

	/* compute the number of possibility */
	this.result('runningState', this.lastGLevel.getIndexStatus());

	/* run the computation */
	this.runningCompute();
};

Generator.prototype.loadLevels = function(data) {
	var levels = data.levels;
	var backWorker = data.backWorker;
	this.prepareLevels(levels);

	this.backWorker = backWorker;

	if (!backWorker) {
		this.createWorker(false);
		this.sendToWorker('loadLevels', {levels: levels, backWorker: true});

		this.rawLevels = levels;

		/* compute the number of possibility */
		this.result('computeInformations', {
			nbPossibilities: this.lastGLevel.getIndexStatus(),
			nbLvl: this.levels.length,
			nbLid: this.lidLevels.length
		});
	}
};

Generator.prototype.compute = function(data, attempts) {
	var issue = [];
	attempts = typeof attempts === 'number' ? attempts : 1;

	if (this.status !== 'ready') {
		if (!attempts) {
			this.result('issueBeforeRun', [$$('Some levels have failed to load. Try again, but if it persists check that your list is up-to-date.')]);
			return;
		}

		this.loadLevels(data);
		if (this.status !== 'ready') {
			setTimeout(this.compute.bind(this, data, --attempts), 1500);
			return;
		}
	}

	/* check configuration */
	if (!this.lidLevels.length) {
		issue.push($$('Please select at least 1 lid level'));
	}

	if (this.levels.length < this.size - 1) {
		issue.push($$('Please select at least %d non-lid levels', this.size - 1));
	}

	if (issue.length) {
		this.result('issueBeforeRun', issue);
		return;
	}

	this.sendToWorker('startCompute', data);
	this.worker.status = 'running';
	this.timer = performance.now();
};

/********************************************************
 * LevelGenerator
 ********************************************************/

function LevelGenerator(list, index, previousLevel, callback) {
	this.list = list;
	this.offset = 0
	this.previous = previousLevel;
	this.next = null;
	this.index = index;
	this.total = list.length - index;
	this.callback = callback;
	this.current = this.getCurrent();

	if (this.previous) {
		this.previous.setNext(this);
		if (this.previous.list !== list && Helper.config.lid) {
			this.total += index;
		}
	}
};

LevelGenerator.prototype.setNext = function(nextLevel) {
	this.next = nextLevel;
};

LevelGenerator.prototype.getLevels = function() {
	var levels = this.previous ? this.previous.getLevels() : [];

	levels.push(this.current);
	return levels;
};

LevelGenerator.prototype.getCurrent = function() {
	var levels = this.previous ? this.previous.getLevels() : [];
	var index = 0;
	var i = 0;
	var lvl;

	while (index <= this.offset) {
		lvl = this.list[i++];
		if (levels.indexOf(lvl) === -1) {
			index++;
		}
	}

	this.current = lvl || null;
	return this.current;
};

LevelGenerator.prototype.inc = function(updateNext) {
	this.offset++;
	if (!this.getCurrent()) {
		/* the current level is not available */
		if (this.previous) {
			if (this.previous.inc() === -1) {
				return -1;
			}
			this.offset = -1;
		} else if (typeof this.callback === 'function') {
			this.callback('finish');
			return -1;
		}
		return this.inc(updateNext);
	} else if (this.previous && this.current.hasPinConflict(this.previous.current.pins)) {
		/* the current level can not been put under previous level */
		return this.inc(updateNext);
	}

	if (updateNext && this.next) {
		this.next.resetIndex();
	}

	return this.offset;
};

LevelGenerator.prototype.resetIndex = function() {
	this.offset = -1;
	this.inc(true);
};

LevelGenerator.prototype.getIndexStatus = function() {
	var indexes = this.previous ? this.previous.getIndexStatus() : {
		index: 0,
		total: 1
	};

	indexes.index *= this.total;
	indexes.index += this.offset;
	indexes.total *= this.total;

	return indexes;
};

/**
 * Statics method
 **/

LevelGenerator._getLvlId = function(lvl) {
	return lvl.id;
};

if (!self.performance) {
	self.performance = {};
}

if (!self.performance.now) {
	self.performance.now = (function() {
		var initialNow = Date.now();
		return function() {
			Date.now() - initialNow;
		};
	})();
}
