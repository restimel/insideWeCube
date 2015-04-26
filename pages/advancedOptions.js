function AdvancedOptions(option) {
	this.call_lid = option.call_lid;
	this.call_pin = option.call_pin;
	this.call_adv = option.call_adv;
	this.call_trsfmLvl = option.call_trsfmLvl;

	this.hideMoreTools = option.hideMoreTools;
}

AdvancedOptions.prototype.render = function(container) {
	var dialogBox = document.createElement('dialog'),
		header = document.createElement('header'),
		body = document.createElement('section'),
		footer = document.createElement('footer'),
		btnDelete = document.createElement('button'),
		btnClose = document.createElement('button');

	/* header */
	header.textContent = $$('Advanced options');

	/* footer */
	btnClose.textContent = $$('Close');
	btnClose.onclick = close;
	footer.appendChild(btnClose);

	/* body */
	body.className = 'body-cube-filter';
	this.optionSelector = document.createElement('div');
	this.optionSelector.className = 'filter-container';

	var optionList = [
		{
			id: 'lid',
			shortName: $$('lid only'),
			longName: $$('If not selected non-lid levels can be chosen at last level'),
			selected: Helper.config.lid,
			callback: this.call_lid
		},
		{
			id: 'pin',
			shortName: $$('through pin'),
			longName: $$('If selected the pins do not block ball inside levels'),
			selected: Helper.config.pin,
			callback: this.call_pin
		},
		{
			id: 'trsfmLvl',
			shortName: $$('rotate levels'),
			longName: $$('If selected, allow to rotate levels'),
			selected: Helper.config.trsfmLvl,
			callback: this.call_trsfmLvl
		},
		{
			id: 'advanced',
			shortName: $$('more tools'),
			longName: $$('If selected more tools are available to edit levels (like setting pin, start Cell, ...)'),
			selected: Helper.config.advanced,
			callback: this.call_adv
		}
	];

	if (this.hideMoreTools) {
		optionList.pop();
	}

	this.loadOption(optionList);
	body.appendChild(this.optionSelector);

	/* dialog box */
	prepareDialog();

	dialogBox.appendChild(header);
	dialogBox.appendChild(body);
	dialogBox.appendChild(footer);

	document.body.appendChild(dialogBox);
	dialogBox.showModal();

	function close() {
		document.body.removeChild(dialogBox);
	}

	function prepareDialog() {
		if (typeof dialogBox.showModal !== 'function') {
			/* Shim of HTML5 dialog */
			dialogBox.className = 'dialog-cube-filter fake-dialog';

			dialogBox.showModal = function() {
				this.open = true;
			};
			dialogBox.close = close;
			dialogBox.open = false;
		} else {
			dialogBox.className = 'dialog-cube-filter';
			dialogBox.addEventListener('close', close, false);
		}
	}
};

AdvancedOptions.prototype.loadOption = function(list) {
	this.optionSelector.innerHTML = '';
	this.state = [];

	list.forEach(function(option, index) {
		var shortName = option.shortName,
			longName = option.longName,
			selected = !!option.selected,
			disabled = !!option.disabled,
			callback = option.callback,
			oid = option.id,
			container = document.createElement('div'),
			input = disabled ? null : document.createElement('input'),
			label = document.createElement('label'),
			id = 'dialog_option_' + index;

		container.className = 'dialog-option';

		if (!disabled) {
			input.type = 'checkbox';
			input.checked = selected;
			input.id = id;
			input.onchange = function () {
				Helper.config[oid] = this.checked;
				if (typeof callback === 'function') {
					callback(this.checked, oid);
				}
			};
			container.appendChild(input);
		}

		label.htmlFor = id;
		label.textContent = shortName;
		label.title = longName;

		if (disabled) {
			label.className = 'disabled';
		}

		container.appendChild(label);

		this.optionSelector.appendChild(container);
	}, this);
};
