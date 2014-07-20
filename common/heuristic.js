function Heuristic() {
	this.cube = new Cube();

	this.cube.init();
	this.possible = [];
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
	var x, y , z;

	var possible = [];

	for (z = 0; z < 7; z++) {
		for (x = 0; x < 6; x++) {
			for (y = 0; y < 6; y++) {
				if (!this.cube.couldMove({x: x, y: y, z: z}, pst)) {
					//TODO do this only on available cell
					possible.push({x: x, y: y, z: z});
				}
			}
		}
	}

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

	console.log('computePossible, position:', position, 'direction: '+direction, 'simpleMove', simpleMove.length, 'possible:', possible)

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

Heuristic.prototype.preparation = function(inst) {
	if (!inst.noMove.mvt) {
		inst.noMove = this.getInstruction(inst.noMove.possible, inst.position, inst);
	}
	if (!inst.move.mvt) {
		inst.move = this.getInstruction(inst.move.possible, inst.position, inst);
	}
};

Heuristic.prototype.getInstruction = function(possible, pst, parent) {
	/* compute next possibilites */
	var i1 = this.computePossible(pst.r ? -1 : 1, possible, pst, parent),
		i2 = this.computePossible(pst.d ? 2 : -2, possible, pst, parent),
		i3 = this.computePossible(pst.b ? 3 : -3, possible, pst, parent);

	/* keep the best one */
	if (i3.score > i2.score && i3.score > i1.score) {
		return i3;
	} else if (i2.score > i1.score) {
		return i2;
	} else {
		return i1;
	}

};

Heuristic.prototype.changePosition = function(direction) {
	switch(direction) {
		case -1: this.position.r = 0; break;
		case 1: this.position.r = 1; break;
		case -2: this.position.d = 1; break;
		case 2: this.position.d = 0; break;
		case -3: this.position.b = 1; break;
		case 3: this.position.b = 0; break;
	}
};

Heuristic.prototype.manageAnswer = function(code, i) {
	var log = this.log[i];

	if (!log) {
		console.error('log not found', i , this.log);
		return;
	}

	log.choice = code;

	var mvt;
	switch(code) {
		case 0: mvt = log.noMove; break;
		case 1: mvt = log.move; break;
		default:
			mvt = {
				possible: [],
				mvt: '?'
			};
	}
	if (mvt.possible.length === 0) {
		// self.postMessage({data: {action: 'instruction', data: this.instruction.mvt}, token: this.token});
		console.log('TODO should not be possible....');
	} else if (mvt.possible.length === 1) {
		console.log('TODO finish you are in ', mvt.possible[0]);
	} else {
		self.postMessage({data: {action: 'instruction', data: {
			mvt: mvt.mvt,
			iRow: i+1
		}}, token: this.token});

		this.log = this.log.slice(0, i+1);
		this.log.push(mvt);

		this.preparation(mvt);
	}
};

/* Route */

Heuristic.prototype.reset = function(cubeName) {
	//load cube with cubeName
	this.cube = store.getCube(cubeName).clone();

	//set default position
	var position = {
		r: 0,
		d: 1,
		b: 1
	};

	//reset log instructions
	this.log = [];

	var possible = [];

	//get list of probable position
	possible = this.getPossible(possible, position);

	//analyze which move is the best
	this.log.push(this.getInstruction(possible, position, null));

	//send instruction
	self.postMessage({data: {action: 'instruction', data: {
		mvt: this.log[0].mvt,
		iRow: 0
	}}, token: this.token});

	//prepare next possibilities
	this.preparation(this.log[0]);
};

Heuristic.prototype.answer = function(rsp) {
	var code = rsp.code,
		iRow = rsp.iRow;

	this.manageAnswer(code, iRow);
};
