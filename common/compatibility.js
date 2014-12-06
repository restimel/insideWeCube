
(function() {
	var errors = [],
		warnings = [],
		features = [];

	if (typeof Worker === 'undefined') {
		errors.push('Worker');
	}

	if (typeof localStorage === 'undefined') {
		warnings.push('localStorage');
		features.push('Save of the chosen language for next connection'); // $$('Save of the chosen language for next connection')
	}

	if (typeof Array.prototype.forEach !== 'function') {
		errors.push('[].forEach');
	}

	if (typeof document.head.classList !== 'object') {
		errors.push('classList');
	}

	if (typeof document.head.querySelectorAll !== 'function') {
		errors.push('querySelectorAll');
	}

	if (typeof Function.prototype.bind !== 'function') {
		errors.push('bind on function');
	}

	/* Manage issues */

	if (errors.length) {
		alert('Your browser is not compatible with insideWeCube :(\nUse a newer version or change to a more powerful browser.\n\nKnown issue:\n\t'+errors.join('\n\t'));
	}

	if (warnings.length) {
		console.warn('Some features may not work with your browser.\n\t' + warnings.join('\n\t'));
	}

	self.compatibility = {
		errors: errors,
		warnings: warnings,
		features: features
	};
})();
