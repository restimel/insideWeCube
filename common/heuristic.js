function Heuristic() {
	this.cube = new Cube();

	this.cube.init();
	this.possible = [];

	this.path = new Path();
}

Heuristic.prototype.router = function(args, token) {
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

Heuristic.prototype.getPossible = function(available, pst) {
	var possible = [];

	available.forEach(function(cell){
		if (!this.cube.couldMove(cell, pst)) {
			possible.push(cell);
		}
	}, this);

	return possible;
};

Heuristic.prototype.computePossible = function(direction, possible, pst, parent) {
	var noMove = [],
		simpleMove = [],
		complexMove = [],
		position = {
			r: pst.r,
			d: pst.d,
			b: pst.b
		},
		mvt = '?',
		node = {};

	switch(direction) {
		case -1: position.r = 0; mvt = '-r'; break;
		case 1: position.r = 1; mvt = 'r'; break;
		case -2: position.d = 1; mvt = 'd'; break;
		case 2: position.d = 0; mvt = '-d'; break;
		case -3: position.b = 1; mvt = 'b'; break;
		case 3: position.b = 0; mvt = '-b'; break;
	}

	possible.forEach(function(p) {
		var path = this.cube.getMovement(p, position, direction);
		if (path.length === 1) {
			noMove.push(p);
		} else {
			simpleMove.push(path[path.length -1]);
			//todo analyze complex movement
		}
	}.bind(this));

	node = {
		parent: parent,
		possible: possible,
		position: position,
		noMove: {possible: noMove},
		move: {possible: simpleMove},
		score: 100 * Math.min(noMove.length, simpleMove.length) / Math.max(noMove.length, simpleMove.length),
		mvt: mvt
	}

	return node;
};

Heuristic.prototype.preparation = function(node, max) {
	max = max || 0;
	if (max > 5) {
		node.noMove.score = 0;
		node.move.score = 0;
		return;
	}

	if (!node.noMove.mvt) {
		node.noMove = this.getInstruction(node.noMove.possible, node.position, node, max);
	}
	if (!node.move.mvt) {
		node.move = this.getInstruction(node.move.possible, node.position, node, max);
	}
};

Heuristic.prototype.hasSameParent = function(node) {
	var parent = node.parent;

	while(parent && parent.possible.length === node.possible.length) {
		if (parent.position.r === node.position.r
		&&  parent.position.d === node.position.d
		&&  parent.position.b === node.position.b
		&&  node.possible.length
		&&  Cube.comparePosition(parent.possible[0], node.possible[0])) {
			return true;
		}

		parent = parent.parent;
	}

	return false;
};

Heuristic.prototype.getInstruction = function(possible, pst, parent, max) {
	if (possible.length === 0) {
		return {
			parent: parent,
			possible: possible,
			score: 0
		};
	} else if (possible.length === 1) {
		return {
			parent: parent,
			possible: possible,
			score: 100
		};
	}

	/* compute next possibilites */
	var n1 = this.computePossible(pst.r ? -1 : 1, possible, pst, parent),
		n2 = this.computePossible(pst.d ? 2 : -2, possible, pst, parent),
		n3 = this.computePossible(pst.b ? 3 : -3, possible, pst, parent);

	/* iterate if no one are good */
	if (n1.score === 0 && n2.score === 0 && n3.score === 0) {
		if (!this.hasSameParent(n1)) {
			this.preparation(n1, max+1);
			n1.score = (n1.move.score + n1.noMove.score) / 2;
		} else {
			n1.score = -1;
		}

		if (!this.hasSameParent(n2)) {
			this.preparation(n2, max+1);
			n2.score = (n2.move.score + n2.noMove.score) / 2;
		} else {
			n2.score = -1;
		}

		if (!this.hasSameParent(n3)) {
			this.preparation(n3, max+1);
			n3.score = (n3.move.score + n3.noMove.score) / 2;
		} else {
			n3.score = -1;
		}
	}

	/* avoid cube rotation is fpossible */
	n3.score *= 0.5;

	/* keep the best one */
	if (n3.score > n2.score && n3.score > n1.score) {
		return n3;
	} else if (n2.score > n1.score) {
		return n2;
	} else {
		return n1;
	}

};

Heuristic.prototype.manageAnswer = function(code, i) {
	var log = this.log[i];

	if (!log) {
		console.error('log not found', i , this.log);
		return;
	}

	log.choice = code;

	var node;
	switch(code) {
		case 0: node = log.noMove; break;
		case 1: node = log.move; break;
		default:
			node = {
				possible: [],
				mvt: '?',
				score: -1
			};
	}

	if (node.score === 0) {
		self.postMessage({data: {action: 'impossible', data: {
			possible: node.possible
		}}, token: this.token});
		return;
	}

	if (node.possible.length === 0) {
		/* should not be possible.... */
		self.postMessage({data: {action: 'impossible', data: {
			possible: []
		}}, token: this.token});
	} else if (node.possible.length === 1) {
		self.postMessage({data: {action: 'found', data: {
			cell: node.possible[0],
			position: log.position
		}}, token: this.token});
	} else {
		self.postMessage({data: {action: 'instruction', data: {
			mvt: node.mvt,
			iRow: i+1,
			position: node.position
		}}, token: this.token});

		this.log = this.log.slice(0, i+1);
		this.log.push(node);

		this.preparation(node);
	}
};

Heuristic.prototype.start = function() {
	/* set default position */
	var position = this.originPosition;

	/* reset log instructions */
	this.log = [];

	/* get list of probable position */
	var possible = this.getPossible(this.accessible, position);

	/* analyze which move is the best */
	this.log.push(this.getInstruction(possible, position, null, 0));

	var node = this.log[0];

	/* send instruction */
	self.postMessage({data: {action: 'instruction', data: {
		mvt: node.mvt,
		iRow: 0,
		position: node.position
	}}, token: this.token});

	/* prepare next possibilities */
	this.preparation(node);
};

/* Route */

Heuristic.prototype.reset = function(cubeName) {
	//load cube with cubeName
	this.cube = store.getCube(cubeName).clone();

	this.path.result = function(rslt) {
		this.accessible = rslt.accessible;
		this.originPosition = {
			r: 0,
			d: 1,
			b: 1
		};

		this.start();
	}.bind(this);

	this.path.loadCube(cubeName);
};

Heuristic.prototype.answer = function(rsp) {
	var code = rsp.code,
		iRow = rsp.iRow;

	this.manageAnswer(code, iRow);
};

Heuristic.prototype.wayBack = function(rsp) {
	var cell = rsp.cell,
		target = rsp.target ? {x:4, y:4, z:6} : {x:1, y:1, z:0},
		startPosition = rsp.position,
		path = this.path.getPathMvt(cell, target, startPosition, this.accessible);

	path = path.map(function(mvt) {
		return {
			mvt: mvt,
			position: {}, //TODO
			result: 3 // TODO
		};
	});

	self.postMessage({data: {action: 'wayBack', data: {
		path: path
	}}, token: this.token});
};
