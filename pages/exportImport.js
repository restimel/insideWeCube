function exportImport() {}

exportImport.prototype.render = function(container) {
	/* import */
	var box = document.createElement('div'),
		fieldset = document.createElement('fieldset'),
		legend = document.createElement('legend'),
		textarea = document.createElement('textarea'),
		button = document.createElement('button');

	box.className = 'field-import-export';

	legend.textContent = $$('import cubes');
	fieldset.appendChild(legend);

	textarea.id = 'importData';
	fieldset.appendChild(textarea);

	button.textContent = $$('import');
	button.onclick = this.import.bind(this);
	fieldset.appendChild(button);

	box.appendChild(fieldset);
	container.appendChild(box);

	/* export */
	box = document.createElement('div');
	fieldset = document.createElement('fieldset');
	legend = document.createElement('legend');
	textarea = document.createElement('textarea');
	button = document.createElement('button');

	box.className = 'field-import-export';

	legend.textContent = $$('export cubes');
	fieldset.appendChild(legend);

	textarea.id = 'exportData';
	this.export(textarea);
	fieldset.appendChild(textarea);

	box.appendChild(fieldset);
	container.appendChild(box);
};

exportImport.prototype.import = function() {
	var data = document.getElementById('importData').value;

	main.control.action('importCubes', data, function(message){
		var type = 'error';
		if (typeof message === 'number') {
			message = $$('%d cubes loaded', message);
			type = 'success';
		}

		main.message(message, type);
	}.bind(this));
};

exportImport.prototype.export = function(element) {
	main.control.action('exportCubes', null, function(data) {element.value = data;});
};
