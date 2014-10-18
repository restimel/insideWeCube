
(function() {
	var errors = [],
		warnings = [];

	if (typeof Worker === 'undefined') {
		errors.push('Worker are not supported by your browser.');
	}

	if (typeof localStorage === 'undefined') {
		warnings.push('localStorage are not supported by your browser.');
	}

	if (typeof Array.prototype.forEach !== 'function') {
		errors.push('forEach is not usable on Array with your browser.');
	}

	if (typeof document.head.classList !== 'object') {
		errors.push('classList is not supported by your browser.');	
	}

	if (typeof document.head.querySelectorAll !== 'function') {
		errors.push('querySelectorAll is not supported by your browser.');	
	}

	if (errors.length) {
		alert('Your browser is not compatible with insideWeCube :(\nUse a newer version or change to a more powerful browser.\n\nKnown issue:\n\t'+errors.join('\n\t'))
	}

	if (warnings.length) {
		console.warn('Some features may not work with your browser.\n\t' + warnings.join('\n\t'));
	}
})();