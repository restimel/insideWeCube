var Helper = {

	selectCubeOrientation: function(callback, value) {
		var label = document.createElement('label'),
			select = document.createElement('select');

		label.textContent = $$('Map orientation: ');
		select.onchange = function() {
			callback(this.value);
		};

		[{id: 'top', text: $$('INSIDE³ side is at the top')},
		 {id: 'bottom', text: $$('INSIDE³ side is at the bottom')}
		].forEach(function(item) {
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

	/**
	 * Configuration (default values)
	 */

	cssPath: ['css/main.css', 'css/cube3D.css'],
	mainPath: ''
};
