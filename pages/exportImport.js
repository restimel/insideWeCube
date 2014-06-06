function exportImport() {}

exportImport.prototype.render = function(container) {
	/* import */
	var fieldset = document.createElement('fieldset'),
		legend = document.createElement('legend'),
		textarea = document.createElement('textarea'),
		button = document.createElement('button');

	legend.textContent = $$('import cubes');
	fieldset.appendChild(legend);

	textarea.id = 'importData';
	fieldset.appendChild(textarea);

	button.textContent = $$('import');
	button.onclick = this.import.bind(this);
	fieldset.appendChild(button);

	container.appendChild(fieldset);

	/* export */
	fieldset = document.createElement('fieldset');
	legend = document.createElement('legend');
	textarea = document.createElement('textarea');
	button = document.createElement('button');

	legend.textContent = $$('export cubes');
	fieldset.appendChild(legend);

	textarea.id = 'exportData';
	this.export(textarea);
	fieldset.appendChild(textarea);

	container.appendChild(fieldset);
};

exportImport.prototype.import = function() {
	var data = document.getElementById('importData').value;

	controller.action('loadCubes', data, function(message){
		if (typeof message === 'number') {
			message = $$('%d cubes loaded', message);
		}

		dspMessage(message);
	}.bind(this));
};

exportImport.prototype.export = function(element) {
	controller.action('getCubes', null, function(data) {element.value = data;});
};
