function Languages(refresh) {
	this.isOpen = false;
	this.callBack = refresh;
	this.lastLng = 'lng-en';

	this.close = function() {
		document.body.removeEventListener('click', this.close, true);
		this.renderClose();
	}.bind(this);
	this.setLng();
}

Languages.prototype.setLng = function(container) {
	var lng = 'lng-' + $$.getLocale();
	main.changeClass(main.container, this.lastLng, lng);
	this.lastLng = lng;
};

Languages.prototype.render = function(container) {
	this.section = document.createElement('section');
	this.section.className = 'set-languages';

	if (this.isOpen) {
		this.renderOpen();
	} else {
		this.renderClose();
	}

	container.appendChild(this.section);
};


Languages.prototype.renderClose = function() {
	var lng = $$.getLocale();
	this.isOpen = false;

	this.section.classList.remove('menu-open');
	this.section.classList.add('menu-close');

	this.section.innerHTML = '';

	var img = document.createElement('img');
	img.src = './img/' + lng + '.png';
	img.alt = lng;
	img.onclick = this.renderOpen.bind(this);

	this.section.appendChild(img);
};

Languages.prototype.renderOpen = function() {
	var section = this.section,
		clng = $$.getLocale();
	this.isOpen = true;
	section.classList.remove('menu-close');
	section.classList.add('menu-open');

	section.innerHTML = '';

	$$.getLocales().forEach(function(lng){
		var div = document.createElement('div'),
			img = document.createElement('img');
		img.src = './img/' + lng + '.png';
		img.alt = lng;
		div.appendChild(img);
		/* TODO add language name */

		div.onclick = this.changeLng.bind(this, lng);
		div.className = 'item';

		section.appendChild(div);
	}, this);

	document.body.addEventListener('click', this.close, true);
};

Languages.prototype.changeLng = function(lng) {
	if ($$.getLocale() !== lng) {
		$$.setLocale(lng);
		main.control.action('changeLng', lng);
		this.setLng();
		this.callBack();
	}
	this.close();
};
