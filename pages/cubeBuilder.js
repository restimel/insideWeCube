function CubeBuilder(cubePath) {
	this.cube = new Cube();
	this.cubePath = cubePath;
	this.cubeRemover = new CubeRemover();
	this.rating = new RatingOptions({
		callback: function() {
			this.render(this.container);
		}.bind(this)
	});
	this.advancedOptions = new AdvancedOptions({
		call_lid: function() {
			this.levels[this.levels.length-1].render();
		}.bind(this),
		call_pin: function() {
			this.cubePath.computePath();
			this.levels.forEach(function(lvl) {lvl.checkInfo();});
		}.bind(this),
		call_trsfmLvl: this.renderTransform.bind(this),
		call_phantomBalls: this.renderPhantoms.bind(this),
		call_adv: this.renderAdvTools.bind(this)
	});
	cubePath.setBuilder(this);
	this.init();
}

CubeBuilder.prototype.init = function() {
	var cubePath = this.cubePath;

	this.name = '';
	this.color = 'blue';
	this.displayingShortPath = false;

	var nbLevels = this.cube.size;
	var mapSize = this.cube.mapSize;

	var levels = [];
	for (var i=0, li = nbLevels; i < li; i++) {
		levels.push(i+1);
	}

	this.levels = levels.map(function(_, i) {
		return new LevelConstructor(i, cubePath, this, this.color, {
			lid: _ === nbLevels,
			lastLevel: _ === nbLevels,
			s: [
				[1,1,0,1], // start
				[mapSize - 2, mapSize - 2, nbLevels - 1,-1], // end
				[1,2,0,2], // pin on first level
				[mapSize - 2,mapSize - 3,nbLevels - 2,-2] // pin on previous last level
			]
		});
	}, this);

	this.startCell();
	this.endCell();
	this.cubePath.setColor(this.color);
};

CubeBuilder.prototype.render = function(container) {
	this.container = container;
	this.container.innerHTML = '';

	/* Section Header */
	var header = document.createElement('header');
	header.className = 'cube-header-section';

	/* Cube Properties */
	var cubeProperty = document.createElement('fieldset');
	cubeProperty.className = 'cube-header-field';

	var legend = document.createElement('legend');
	legend.textContent = $$('Cube properties');
	cubeProperty.appendChild(legend);

	var inputName = document.createElement('input');
	inputName.placeholder = $$('Cube name');
	inputName.value = this.name || '';
	inputName.onchange = this.changeName.bind(this);
	cubeProperty.appendChild(inputName);
	this.elemName = inputName;

	var select = document.createElement('select');
	var item = document.createElement('option');
	item.disabled = true;
	item.selected = true;
	item.textContent = $$('Cube color');
	select.appendChild(item);
	select.onchange = this.changeColor.bind(this);
	Helper.buildSelect(select, Cube3D.getColor(), this.color);
	cubeProperty.appendChild(select);
	this.elemColor = select;

	var btn = document.createElement('button');
	btn.className = 'font-awesome'
	btn.textContent = '\uf0c7'; //save
	btn.title = $$('Save cube');
	btn.onclick = this.save.bind(this);
	cubeProperty.appendChild(btn);

	header.appendChild(cubeProperty);

	/* Manager */
	var manager = document.createElement('fieldset');
	manager.className = 'cube-header-field';
	legend = document.createElement('legend');
	legend.textContent = $$('Manager');
	manager.appendChild(legend);

	select = document.createElement('select');
	select.onchange = this.changeCube.bind(this);
	item = document.createElement('option');
	item.disabled = true;
	item.selected = true;
	item.textContent = $$('Load a cube');
	select.appendChild(item);
	main.control.action('getCubes', null, function(data) {
		Helper.buildSelect(select, data);
	});
	manager.appendChild(select);

	btn = document.createElement('button');
	btn.className = 'font-awesome';
	btn.textContent = '\uf021'; // refresh
	btn.title = $$('Reset cube');
	btn.onclick = this.reset.bind(this);
	manager.appendChild(btn);

	btn = document.createElement('button');
	btn.className = 'font-awesome';
	btn.textContent = '\uf1b3\uf014'; // cubes trash
	btn.title = $$('Delete cubes');
	btn.onclick = this.removeCubes.bind(this);
	manager.appendChild(btn);

	btn = document.createElement('button');
	btn.className = 'font-awesome';
	btn.textContent = '\uf085'; // cogs
	btn.title = $$('Manage options');
	btn.onclick = this.renderAdvancedTool.bind(this);
	manager.appendChild(btn);

	btn = document.createElement('button');
	btn.className = 'font-awesome advanced-option' + (Helper.config.advanced ? '' : ' hidden');
	btn.textContent = '\uf1de'; // sliders
	btn.title = $$('Manage rating');
	btn.onclick = this.renderRating.bind(this);
	manager.appendChild(btn);

	header.appendChild(manager);

	/* Tools */
	this.action = 0;
	this.propagateAction();
	this.toolBox = document.createElement('fieldset');
	this.toolBox.className = 'cube-header-field' + (Helper.config.advanced ? '' : ' hidden');
	legend = document.createElement('legend');
	legend.textContent = $$('Tools');
	this.toolBox.appendChild(legend);

	btn = document.createElement('button');
	btn.className = 'selected font-awesome';
	btn.textContent = '\uf111';
	btn.title = $$('Set holes');
	btn.onclick = this.setAction.bind(this);
	btn.value = 0;
	this.toolBox.appendChild(btn);

	btn = document.createElement('button');
	btn.className = 'font-awesome';
	btn.textContent = $$('S');
	btn.title = $$('Start');
	btn.onclick = this.setAction.bind(this);
	btn.value = 1;
	this.toolBox.appendChild(btn);

	btn = document.createElement('button');
	btn.className = 'font-awesome';
	btn.textContent = $$('F');
	btn.title = $$('Finish');
	btn.onclick = this.setAction.bind(this);
	btn.value = -1;
	this.toolBox.appendChild(btn);

	btn = document.createElement('button');
	btn.className = 'font-awesome';
	btn.textContent = '\uf077'; // ^
	btn.title = $$('Pin inside maze');
	btn.onclick = this.setAction.bind(this);
	btn.value = 2;
	this.toolBox.appendChild(btn);

	btn = document.createElement('button');
	btn.className = 'font-awesome';
	btn.textContent = '\uf078'; // v
	btn.title = $$('Pin at the bottom of level');
	btn.onclick = this.setAction.bind(this);
	btn.value = -2;
	this.toolBox.appendChild(btn);

	btn = document.createElement('button');
	btn.className = 'font-awesome';
	btn.textContent = '\uf0a2'; // bell
	btn.title = $$('Phantom ball');
	btn.onclick = this.setAction.bind(this);
	btn.value = -255;
	this.toolBox.appendChild(btn);

	header.appendChild(this.toolBox);

	container.appendChild(header);

	var mainSection = document.createElement('section');
	mainSection.className = 'cube-main-section';

	/* Section Level builder */
	var cubeBuilder = document.createElement('section');
	cubeBuilder.className = 'cube-builder-section';

	mainSection.appendChild(cubeBuilder);

	/* Section Info */
	var info = document.createElement('section');
	info.className = 'cube-info-section';
	mainSection.appendChild(info);

	container.appendChild(mainSection);
	this.cubeContainer = cubeBuilder;
	this.cubeInfo = info;

	/* Section Minimap */
	var showHide = document.body.offsetWidth > 1100 ? 'show' : 'hide';
	var minimapSection = document.createElement('section');
	minimapSection.className = 'cube-minimap-section ' + showHide;

	var minimapTool = document.createElement('div');
	minimapTool.className = 'tool';

	minimapTool.appendChild(Helper.selectCubeOrientation(
		this.cubePath.changeMapOrientation.bind(this.cubePath), this.cubePath.mapOrientation));

	btn = document.createElement('button');
	btn.textContent = $$('Maps preview');
	btn.title = $$('Display maps in another tab');
	btn.onclick = this.renderMapStandalone.bind(this);
	minimapTool.appendChild(btn);

	var label = document.createElement('label');
	var input = document.createElement('input');
	input.type = 'checkbox';
	input.checked = !!Helper.config.stickerMaps;
	input.onchange = this.changeStickerMaps;
	label.appendChild(input);
	label.appendChild(document.createTextNode($$('display sticker maps')));
	label.title = $$('display the side maps in preview');
	minimapTool.appendChild(label);

	btn = document.createElement('button');
	btn.textContent = '\uf00D'; // X (with fontawesome)
	btn.className = 'reduce-btn';
	btn.title = $$('Reduce the maps preview');
	btn.onclick = main.changeClass.bind(this, minimapSection, 'show', 'hide');
	minimapTool.appendChild(btn);

	minimapSection.appendChild(minimapTool);

	var minimapContainer = document.createElement('div');
	minimapContainer.onclick = this.mapFocus.bind(this);
	minimapSection.appendChild(minimapContainer);

	container.appendChild(minimapSection);
	this.cubeMinimap = minimapContainer;

	btn = document.createElement('button');
	btn.textContent = '\uf009'; // 4 squares (with fontawesome)
	btn.className = 'cube-maximize-minimap-btn';
	btn.title = $$('Show the maps preview');
	btn.onclick = main.changeClass.bind(this, minimapSection, 'hide', 'show');
	container.appendChild(btn);

	/* render Levels */
	this.levels.forEach(this.renderLevel, this);
	this.cubePath.computePath();
};

CubeBuilder.prototype.renderLevel = function(level, i) {
	var sct = document.createElement('section');

	sct.className = 'level-editor';
	sct.id = 'section-editor-level-' + i;

	level.render(sct);
	this.cubeContainer.appendChild(sct);
};

CubeBuilder.prototype.renderInfo = function(info) {
	if (!this.cubeInfo) {
		return false;
	}
	this.cubeInfo.innerHTML = '';

	var caracs = Helper.ratingCaracs;

	var data = this.dataRating = {};
	var pathLength = data.pathLength = info.length + 1,
		nbAvailable = data.nbAvailable = info.available,
		dEndLength = data.dEndLength = nbAvailable - pathLength,
		nbDEnd = data.nbDEnd = Math.max(info.deadEnd, 0),
		nbChgLvl = data.nbChgLvl = info.chgLevel,
		nbChgDir = data.nbChgDir = info.chgDirection,
		nbMvtRot = data.nbMvtRot = info.chgTop,
		nbMovement = data.nbMovement = info.nbMovement,
		rateRot = data.rateRot = nbMvtRot / nbMovement,
		nbOut = data.nbOut = info.nbMvtOutPath,
		nbDifficultCrs = data.nbDifficultCrs = info.nbDifficultCrossing,
		rateDir = data.rateDir = nbChgDir / pathLength;
	
	var difficulty = caracs.reduce(function(sum, carac) {
		var key = 'pnd_' + carac;
		return sum + data[carac] * Helper.config[key];
	}, 0);
	var maxDifficulty = caracs.reduce(function(sum, carac) {
		var max_key = 'max_' + carac;
		var pdn_key = 'pnd_' + carac;
		return sum + Helper.config[max_key] * Helper.config[pdn_key];
	}, 0);
	// //pathLength * 1.13 / 24 + // 11
	// 				 (nbAvailable - pathLength) * 0.1 + // 7.7
	// 				 //nbChgDir * 0.3 + // 0
	// 				 nbChgLvl * 0.5 + // 37
	// 				 // nbMvtRot * 1.85 + // ~35 (current max 17)
	// 				 nbMovement * 0.5 + // 59
	// 				 nbMvtRot / nbMovement * 10 + // 3
	// 				 nbOut * 2 + //42
	// 				 nbDifficultCrs * 11, // 44
		// maxDifficulty = 150,
	var lowDifficulty = maxDifficulty / 3 - 1,
		highDifficulty = maxDifficulty * 2 / 3 - 2;

	var finish = document.createElement('section'),
		elPathLength = document.createElement('section'),
		availability = document.createElement('section'),
		elDeadEnd =  document.createElement('section'),
		elDifficulty = document.createElement('section'),
		elChgDirection = document.createElement('section'),
		elChgLevel = document.createElement('section'),
		elMovement = document.createElement('section'),
		elCbReverse = document.createElement('section'),
		elHardCells = document.createElement('section'),
		dspShortPath = document.createElement('button'),
		meter, label;

	var changeShortDisplay = function() {
		this.displayingShortPath = !this.displayingShortPath;
		this.displayShortPath();

		dspShortPath.title = this.displayingShortPath ? $$('hide the shortest path') : $$('show the shortest path');
		dspShortPath.textContent = this.displayingShortPath ? '\uf070' : '\uf06e';
	}.bind(this);

	availability.className = 'info';
	elDeadEnd.className = 'info';

	if (info.finish) {
		finish.className = 'finish-yes';
		finish.textContent = $$('Cube can be solved.');

		elPathLength.className = 'info';
		elPathLength.textContent = $$('%i cells must be crossed (%{.2}d%%).', pathLength, 100 * pathLength/nbAvailable);

		changeShortDisplay(); changeShortDisplay();
		dspShortPath.onclick = changeShortDisplay;
		dspShortPath.className = 'font-awesome';
		elPathLength.appendChild(dspShortPath);

		elDeadEnd.textContent = $$('%i dead-ends (%{.2}d%%)', nbDEnd, 100 * (nbAvailable - pathLength)/nbAvailable);

		elChgDirection.className = 'info';
		elChgDirection.textContent = $$('%i turns inside levels (%{.2}d%%)', nbChgDir, 100 * nbChgDir/pathLength);

		elChgLevel.className = 'info';
		elChgLevel.textContent = $$('%i movements through levels (%{.2}d%%)', nbChgLvl, 100 * nbChgLvl/pathLength);

		elMovement.className = 'info';
		elMovement.textContent = $$('%i cube rotations are needed (at least)', nbMovement);

		elCbReverse.className = 'info';
		elCbReverse.textContent = $$('%i upside-down cube flips are needed (at least)', nbMvtRot);

		elHardCells.className = 'info';
		elHardCells.textContent = $$('%i hardcore passages', nbDifficultCrs);

		elDifficulty.className = 'info';
		label = document.createElement('label');
		label.textContent = $$('Cube difficulty: ');

		meter = document.createElement('meter');
		meter.value = difficulty;
		meter.optimum = 0;
		meter.low = lowDifficulty;
		meter.high = highDifficulty;
		meter.max = maxDifficulty;
		meter.value = difficulty;
		meter.textContent = difficulty;
		meter.title = $$('%{.2}d%%', difficulty * 100 / maxDifficulty);
		label.appendChild(meter);

		elDifficulty.appendChild(label);
	} else {
		finish.className = 'finish-no';
		finish.textContent = $$('Cube is not solvable.');

		elPathLength.className = 'noInfo';

		elDeadEnd.textContent = $$('%i dead-ends', nbDEnd);

		elChgDirection.className = 'noInfo';
		elChgLevel.className = 'noInfo';
		elDifficulty.className = 'noInfo';
		elMovement.className = 'noInfo';
		elCbReverse.className = 'noInfo';
		elHardCells.className = 'noInfo';
	}

	availability.textContent = $$('%i cells are accessible (%{.2}d%%).', nbAvailable, 100 * nbAvailable / 252);

	this.cubeInfo.appendChild(finish);
	this.cubeInfo.appendChild(elDifficulty);
	this.cubeInfo.appendChild(availability);
	this.cubeInfo.appendChild(elPathLength);
	this.cubeInfo.appendChild(elDeadEnd);
	this.cubeInfo.appendChild(elChgLevel);
	this.cubeInfo.appendChild(elChgDirection);
	this.cubeInfo.appendChild(elMovement);
	this.cubeInfo.appendChild(elCbReverse);
	this.cubeInfo.appendChild(elHardCells);
};

CubeBuilder.prototype.renderMiniMap = function(mapElements) {
	if (this.cubeMinimap) {
		this.cubeMinimap.innerHTML = mapElements.join(' ');
		this.displayShortPath();
	}
};

CubeBuilder.prototype.renderMapStandalone = function() {
	var cssLink = Helper.cssPath.map(function(css) {
		return '<link rel="stylesheet" type="text/css" href="'+ Helper.mainPath + '/' + css +'">';
	}).join('');
	var preview = window.open(null,"map_preview");
	preview.document.write('<!DOCTYPE html><html><head><meta charset="utf-8"></head></body></html>')
	preview.document.head.innerHTML = '<meta charset="utf-8">' +
									  '<title>' + $$('Maps preview: %s', this.name) + '</title>' +
									  cssLink;
	preview.document.body.innerHTML = '<h1>' + this.name + '</h1><section id="maps-preview"></section>';

	this.cubePath.getMaps(function(maps) {
		var html = maps.map(function(mapObject) {
			return '<h2>' + mapObject.orientation + '</h2><figure>'+mapObject.html.join(' ')+'</figure>';
		});

		preview.document.getElementById('maps-preview').innerHTML = html.join('<br>');
		preview.document.close();
	});
};

CubeBuilder.prototype.renderAdvancedTool = function() {
	this.advancedOptions.render();
};

CubeBuilder.prototype.renderRating = function() {
	this.rating.render(this.dataRating);
};

CubeBuilder.prototype.renderAdvTools = function(val) {
	var list = [this.toolBox, document.querySelector('.advanced-option')];

	list.forEach(function(el) {
		if (val) {
			el.classList.remove('hidden');
		} else {
			el.classList.add('hidden');
		}
	});
	this.levels[this.levels.length-1].render();
};

CubeBuilder.prototype.renderTransform = function(val) {
	this.levels.forEach(function(lvl) {
		lvl.renderTransform(val);
	});
};

CubeBuilder.prototype.renderPhantoms = function(val) {
	this.cubePath.computePath();
};

CubeBuilder.prototype.propagateAction = function() {
	var value = this.action;
	this.levels.forEach(function(level) {
		level.setAction(value);
	});
};

CubeBuilder.prototype.setAction = function(event) {
	var btn = event.target;
	var value = parseInt(btn.value, 10);

	if (this.action !== value) {
		this.action = value;
		this.propagateAction();

		main.removeClass('selected', this.toolBox);
		btn.classList.add('selected');
	}
};

CubeBuilder.prototype.managePath = function(data) {
	var cells = data.accessible;
	var info = data.info;
	var c;

	/* accessibles */
	main.removeClass('accessible-path');
	cells.forEach(function(cell) {
		var el = document.getElementById('main-' + cell.x + '-' + cell.y + '-' + cell.z);
		if (el) {
			el.classList.add('accessible-path');
		} else {
			console.warn('element not found: ', cell, cells)
		}
	});

	this.shortPath = [];
	c = info.finish;

	while(c) {
		this.shortPath.push({
			x: c.x,
			y: c.y,
			z: c.z
		});
		c = c.parent;
	}
};

CubeBuilder.prototype.displayShortPath = function(event) {
	main.removeClass('short-path');
	if (this.displayingShortPath) {
		this.shortPath.forEach(function(cell) {
		var el = document.getElementById('main-' + cell.x + '-' + cell.y + '-' + cell.z);
			if (el) {
				el.classList.add('short-path');
			} else {
				console.warn('element not found: ', cell, this.shortPath)
			}
		});
	}
};

CubeBuilder.prototype.mapFocus = function(event) {
	var el = this.lookForLevelElement(event.target),
		lvlId = el ? el.id.split('-')[1] : '',
		elLevel = document.getElementById('section-editor-level-' + lvlId);

	if (elLevel) {
		if (elLevel.scrollIntoViewIfNeeded) {
			elLevel.scrollIntoViewIfNeeded(true);
		} else {
			elLevel.scrollIntoView();
		}
	}
};

CubeBuilder.prototype.lookForLevelElement = function(element) {
	while (element) {
		if (!element.id || element.id.indexOf('mapLevel') !== 0) {
			element = element.parentNode;
		} else {
			break;
		}
	}
	return element;
};

CubeBuilder.prototype.startCell = function(id) {
	var init = false;

	if (id && id instanceof Array) {
		this.startCL = {
			x: id[0],
			y: id[1],
			z: id[2]
		};
	} else {
		init = !!this.cubeInfo;
		if (id) {
			this.startCL = {
				x: id.x,
				y: id.y,
				z: id.z
			};
		} else if (!this.startCL) {
			this.startCL = {
				x: 1,
				y: 1,
				z: 0
			};
		}
		id = [this.startCL.x, this.startCL.y, this.startCL.z];
	}

	this.levels.forEach(function(lvl) {
		lvl.startCell(id);
	});

	if (init) {
		this.cubePath.setCell(id[0], id[1], id[2], 's', 1);
	}
};

CubeBuilder.prototype.endCell = function(id) {
	var init = false;

	if (id && id instanceof Array) {
		this.finishCL = {
			x: id[0],
			y: id[1],
			z: id[2]
		};
	} else {
		init = !!this.cubeInfo;
		if (id) {
			this.finishCL = {
				x: id.x,
				y: id.y,
				z: id.z
			};
		} else if (!this.finishCL) {
			this.finishCL = {
				x: this.cube.mapSize - 2,
				y: this.cube.mapSize - 2,
				z: this.cube.size - 1
			};
		}
		id = [this.finishCL.x, this.finishCL.y, this.finishCL.z];
	}

	this.levels.forEach(function(lvl) {
		lvl.endCell(id);
	});

	if (init) {
		this.cubePath.setCell(id[0], id[1], id[2], 's', -1);
	}
};

CubeBuilder.prototype.reset = function() {
	this.cubePath.reset();
	this.cube.size = 7;
	this.cube.mapSize = 6;
	this.init();
	this.render(this.container);
};

CubeBuilder.prototype.changeColor = function(e) {
	var color;

	if (typeof e === 'string') {
		color = e;
		this.elemColor.value = color;
	} else {
		color = e.target.value;
	}

	if (this.color != color && typeof color === 'string') {
		this.color = color;
		this.cubePath.setColor(color);
		this.levels.forEach(function(lvl) {
			lvl.changeColor(color);
		});
	}
};

CubeBuilder.prototype.changeName = function(e) {
	if (typeof e === 'string') {
		this.name = e;
		this.elemName.value = e;
	} else {
		this.name = e.target.value;
	}
};

CubeBuilder.prototype.removeCubes = function(e) {
	this.cubeRemover.render();
};

CubeBuilder.prototype.changeCube = function(e) {
	var name;

	if (typeof e === 'string') {
		name = e;
	} else {
		name = e.currentTarget.value;
	}

	if (name === '') {
		return false;
	}

	this.changeName(name);

	main.control.action('getCubeInfo', {name: name}, function(data) {
		this.cube.size = data.info.size;
		this.cube.mapSize = data.info.mapSize;
		this.cube.phantomBalls = data.info.phantomBalls;
		this.changeColor(data.info.color);
		this.startCell(data.info.start);
		this.endCell(data.info.end);
	}.bind(this))

	this.levels.forEach(function(lvl, i) {
		lvl.changeLevel(name + '-' + (i + 1));
	});
};

CubeBuilder.prototype.changeStickerMaps = function(e) {
	Helper.config.stickerMaps = !!e.target.checked;
};

CubeBuilder.prototype.save = function() {
	var name = this.name;
	if (name === '') {
		main.message($$('Please enter a name for the cube.'), 'error', {timeout: 15000});
		return false;
	}

	main.control.action('saveCube', JSON.stringify(this), function(data) {
		if (data === 1) {
			main.message($$('cube "%s" saved.', name), 'success', {timeout: 7000});
		} else {
			main.message($$('cube "%s" has not been saved.', name), 'error', {timeout: 7000});
		}
	});
};

CubeBuilder.prototype.toJSON = function() {
	return {
		name: this.name,
		color: this.color,
		levels: this.levels.map(function(l) {return l.toJSON();}),
		start: this.startCL,
		end: this.finishCL,
		visible: true
	};
};

CubeBuilder.prototype.parse = function(json) {
	if (typeof json === 'string') {
		json = JSON.parse(json);
	}
	this.cube.parse(json);
	this.name = json.name;
	this.startCL = json.start || {x: 1, y: 1, z: 0};
	this.finishCL = json.end || {x: this.cube.mapSize - 2, y:this.cube.mapSize - 2, z: this.cube.size - 1};
	this.levels.map(function(l, i) {return l.parse(json.levels[i]);});
};