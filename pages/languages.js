function Languages(refresh) {
	this.isOpen = false;
	this.callBack = refresh;

	this.close = function() {
		document.body.removeEventListener('click', this.close, true);
		this.renderClose();
	}.bind(this);
}

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
	var lng = $$.getCurrentLng();
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
		clng = $$.getCurrentLng();
	this.isOpen = true;
	section.classList.remove('menu-close');
	section.classList.add('menu-open');

	section.innerHTML = '';

	$$.getLng().forEach(function(lng){
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
	if ($$.getCurrentLng() !== lng) {
		$$.changeLng(lng);
		this.callBack();
	}
	this.close();
};
