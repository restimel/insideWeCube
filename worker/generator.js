function Generator() {
	this.cube = new Cube();
	this.size = 7;
	this.gLevels = [];
	this.path = new Path();
	this.path.result = this.pathResult.bind(this);
	this.timer = 0;

	this.cube.init();
}

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
	
	var t = performance.now();
	var count = 0;
	var t1, t2;
	var measure = {t1:0, t2:0};
	while (this.running) {
		count++;
		t1 = performance.now();
		this.path.loadLevels(this.lastGLevel.getLevels().map(LevelGenerator._getLvlId));
		measure.t1 += performance.now() - t1;

		if (performance.now() - this.timer > timeBeforeRefresh) {
			this.result('runningState', this.lastGLevel.getIndexStatus());
			this.timer = performance.now();
		}

		t2 = performance.now();
		if (this.lastGLevel.inc() === -1) {
			this.running = false;
		}
		measure.t2 += performance.now() - t2;
	}
	t = performance.now() -t;
	this.result('debug',{name:'total', time: t, mean: t/count});
	this.result('debug',{name:'path', time: measure.t1, mean: measure.t1/count});
	this.result('debug',{name:'next', time: measure.t2, mean: measure.t2/count});
};

Generator.prototype.pathResult = function(rslt) {
	if (rslt.info.finish) {
		rslt.levels = this.lastGLevel.getLevels().map(LevelGenerator._getLvlId);
		this.result(rslt);
	}
};

Generator.prototype.finish = function() {
	this.result('runningState', this.lastGLevel.getIndexStatus());
	this.result('finished', {});
	this.running = false;
};

/* Routing */

Generator.prototype.compute = function(data) {
	var levels = data.levels;
	var lidOnly = Helper.config.lid;
	var issue = [];

	/* define configuration */
	this.lidLevels = [];
	this.levels = []

	levels.forEach(function(level) {
		var lvl = store.getLevel(level);
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

	/* compute the number of possibility */
	this.result('runningState', p.getIndexStatus());

	/* run the computation */
	this.runningCompute();
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

	this.current = lvl;
	return lvl;
};

LevelGenerator.prototype.inc = function() {
	this.offset++;
	if (!this.getCurrent()) {
		if (this.previous) {
			if (this.previous.inc() === -1) {
				return -1;
			}
			this.offset = -1;
		} else if (typeof this.callback === 'function') {
			this.callback('finish');
			return -1;
		}
		return this.inc();
	}

	return this.offset;
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
