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
		allMove = [],
		mvt = this.computeMvt(direction),
		position = this.computePosition(pst, mvt),
		node = {};

	possible.forEach(function(p) {
		var path = this.cube.getMovement(p, position, direction);
		if (path.length === 1) {
			add(noMove, p);
		} else {
			add(simpleMove, path[path.length -1]);
		}
		add(allMove, path[path.length -1]);
	}.bind(this));

	node = {
		parent: parent,
		possible: possible,
		position: position,
		noMove: {possible: noMove},
		move: {possible: simpleMove},
		allMove: {possible: allMove},
		score: 100 * Math.min(noMove.length, simpleMove.length) / Math.max(noMove.length, simpleMove.length),
		mvt: mvt
	}

	return node;

	function add(arr, val) {
		if (!arr.some(Cube.comparePosition.bind(null,val))) {
			arr.push(val);
		}
	}
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
	if (!node.allMove.mvt) {
		node.allMove = this.getInstruction(node.allMove.possible, node.position, node, max);
		node.allMove.score++;
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
		case -1: node = log.allMove; break;
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

Heuristic.prototype.renderCube = function(rsp, count) {
	count = count || 0;
	var cubeName = rsp.cubeName,
		orientation = rsp.orientation;

	if (count > 5) {
		console.error('cube name doesn\'t match (%s → %s)', cubeName, this.cube.name);
		return;
	}

	if (this.cube.name !== cubeName || !(this.accessible instanceof Array)) {
		setTimeout(this.renderCube.bind(this, rsp, count+1), 40);
		return;
	}

	self.postMessage({data: {action: 'renderCube', data: {
		cube: this.cube.renderMap(orientation, this.accessible),
		orientation: orientation
	}}, token: this.token});
};

Heuristic.prototype.wayBack = function(rsp) {
	var cell = rsp.cell,
		target = rsp.target ? {x:4, y:4, z:6} : {x:1, y:1, z:0},
		startPosition = this.computeBestPosition(cell, rsp.position),
		path = this.path.getPathMvt(cell, target, startPosition, this.accessible, true),
		position = startPosition,
		rsltMvt = [cell];

	/* give information about movement (if ball has move...) */
	path = path.map(function(mvt) {
		position = this.computePosition(position, mvt);
		rsltMvt = this.cube.getMovement(rsltMvt[rsltMvt.length -1], position, -1);

		var result = rsltMvt.length === 1 ? 0 : 1;
		if (mvt === '?') {
			result = -1;
		}
		return {
			mvt: mvt,
			position: position,
			result: result
		};
	}, this);

	path.unshift({
		mvt: '',
		position: startPosition,
		result: 0
	});

	self.postMessage({data: {action: 'wayBack', data: {
		path: path
	}}, token: this.token});
};

/* Helper */

/**
 * Compute the new position when a movement occurs
 */
Heuristic.prototype.computePosition = function(position, mvt) {
	var pst = {
		r: position.r,
		d: position.d,
		b: position.b
	};

	switch (mvt) {
		case '-r': pst.r = 0; break;
		case 'r': pst.r = 1; break;
		case '-d': pst.d = 0; break;
		case 'd': pst.d = 1; break;
		case '-b': pst.b = 0; break;
		case 'b': pst.b = 1; break;
	}

	return pst;
};

Heuristic.prototype.computeMvt = function(direction) {
	var code = Cube.fromDirection(direction);

	if (typeof code === 'undefined') {
		return '?';
	} else {
		return (code.value ? '' : '-') + code.key;
	}
};

/**
 * Compute the best position for the given cell, where the ball shouldn't move at start
 */
Heuristic.prototype.computeBestPosition = function(cell, position) {
	var pst = position,
		dCell;

	if (this.cube.couldMove(cell, pst)) {
		dCell = this.cube.get(cell.x, cell.y, cell.z);

		if (pst.r && dCell.r) {
			pst = this.computePosition(pst, '-r');
		}
		if (!pst.r && this.cube.get(cell.x, cell.y - 1, cell.z).r) {
			pst = this.computePosition(pst, 'r');
		}

		if (pst.d && dCell.d) {
			pst = this.computePosition(pst, '-d');
		}
		if (!pst.d && this.cube.get(cell.x - 1, cell.y, cell.z).d) {
			pst = this.computePosition(pst, 'd');
		}

		if (pst.b && dCell.b) {
			pst = this.computePosition(pst, '-b');
		}
		if (!pst.b && this.cube.get(cell.x, cell.y, cell.z - 1).b) {
			pst = this.computePosition(pst, 'b');
		}

		/* we should be in a room */
		if (this.cube.couldMove(cell, pst)) {
			dCell = this.cube.getMovement(cell, position, 0);
			dCell = dCell[dCell.length - 1];
			cell.x = dCell.x;
			cell.y = dCell.y;
			cell.z = dCell.z;

			pst = position;
		}
	}

	return pst;
};