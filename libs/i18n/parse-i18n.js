#!/usr/bin/env node

var fs = require('fs'),
	events = require('events'),
	eventEmitter = new events.EventEmitter();

function main(argv) {
  if (argv.some(function(v) {return /^-[^\s]*h|^--help$/i.test(v);})) {
  	console.log('\nusage:\n' + argv[0] + ' ' + argv[1].split('/').pop() +
  		' path [filter]\n\n' +
  		'path: directory location where to search files. default: ./\n' +
  		'filter: filter to apply on files. Only files which match filter will be analyzed. default = "*"\n' +
  		'\nOption\n' +
  		'--help: (or -h) give commands');
  } else {
  	var path = argv[2],
  		filter = argv[3];

  	eventEmitter.on('analyzed', function(){
  		var list = analyzer.i18n;

  		readTranslatedFile(list);
  		console.log('%d strings must be translated', list.length);
  	});
  	var analyzer = new FileAnalyzer(path, filter);
  }
}

function readTranslatedFile(codes) {
	var translationFile = __dirname + '/translations.json';

	fs.readFile(translationFile, 'utf8', function (err, data) {
		var count = 0,
			languages = ['en', 'fr'];

		if (err) {
			console.error('Error: could not open the file %s. %s', translationFile, err);
			return;
		}

		data = JSON.parse(data);

		codes.forEach(function(code) {
			var tag = data[code];
			if (!tag) {
				tag = {};
				count++;
			}

			languages.forEach(function(lang) {
				if (!tag[lang]) {
					tag[lang] = '';
				}
			});
			data[code] = tag;
		});

		console.log('%d new entries', count);
		var stream = JSON.stringify(data, null, '\t');

		/* write */
		setTimeout(writeFile, 5, translationFile, stream);

	});
}

function writeFile(file, stream) {
	fs.writeFile(file, stream, function (err) {
		if (err) {
			console.error('Error: could not write the file %s. %s', file, err);
		} else {
			console.log('Parsing done. %s has been updated.', file);
		}
	});
}


function FileAnalyzer(path, filter) {
	this.files = [];
	this.i18n = [];
	this.convertFilter(filter || '');
	path = (path || '').replace(/\/$/,'') || '.';

	console.log('- parse file: %s', path);
	this.readDirectory(path);
}

/**
 * Convert a filter string with joker into a regexp
 * @param {String} filter the filter in string format
 */
FileAnalyzer.prototype.convertFilter = function(filter) {
	filter = filter.replace(/[.]/g, '\\$&').replace(/[?*]/g, '.$&') + '$';
	this.filter = new RegExp(filter);
};

/**
 * search name in source list that are not in the target list
 * @param {Array[String]} origin is the list containing source name
 * @param {Array[String]} target is the list where names must be present
 * @return {Array[String]} a list of names that are in origin list but not in target list
 */
FileAnalyzer.prototype.isNotIn = function(origin, target) {
	var arr = [];

	origin.forEach(function(v) {
		if (!~target.indexOf(v) && !~arr.indexOf(v)) {
			arr.push(v);
		}
	});

	return arr;
};

/**
 * Manage a file to store it and analyze it
 * @param {String} path is the file location
 */
FileAnalyzer.prototype.fileManager = function(path) {
	var fileObject = {
			name: path,
			content: '',
			ready: false
		};

	this.files.push(fileObject);

	this.readFile(fileObject.name, function (content) {
		fileObject.content = content;
		this.extractVar(fileObject);
	}.bind(this));
};

/**
 * check if all files have been analyzed
 * return {Boolean} true if all files have been analyzed
 */
FileAnalyzer.prototype.isReady = function() {
	var ready = this.files.every(function(o) {return o.ready});
	if (ready) {
		eventEmitter.emit('analyzed');
	}
	return ready;
};

/**
 * look for all i18n-key string in file. They are stored in the object i18n
 * 
 * @param {Object} fileObject is the object containing all information about file
 */
FileAnalyzer.prototype.extractVar = function(fileObject) {
	var i18n = this.i18n;

	fileObject.content.replace(/\$\$\((["'])((?:\\.|[^\1])+?)\1/gm, function(m, s, str) {
		if (i18n.indexOf(str) === -1) {
			i18n.push(str);
		}
	});

	// if (/\$\$\(/.test(fileObject.content)) {
	// 	console.log('tst %s → 1: %s 2: %s 3: %s', fileObject.name,
	// 		!!fileObject.content.match(/\$\$\((["'])((?:\\\1|[^\1])+)\1/m),
	// 		!!fileObject.content.match(/\$\$\((["'])([^\1]+)\1/m),
	// 		!!fileObject.content.match(/\$\$\((["'])([^'"]+)['"]/m)
	// 	)
	// 	if (!!fileObject.content.match(/\$\$\((["'])((?:\\\1|[^\1])+)\1/m)) {
	// 		toto = fileObject.content.match(/\$\$\((["'])((?:\\.|[^\1])+?)\1/m);
	// 		console.log(' → %s %d %s', typeof toto, toto.length, toto[2]);
	// 	}
	// }

	fileObject.ready = true;
	this.isReady();
};

/**
 * Read a file
 * @param {String} path is the location of the file
 * @param {function} f is a callback function which is called when file is read
 */
FileAnalyzer.prototype.readFile = function(path, f) {
	var file = fs.createReadStream(path);

	file.on('data', function(stream) {
		f(stream.utf8Slice());
	});
    file.on('close', function() {});
    file.on('error', sendError);
};

/**
 * read a directory. It read also its subdirectories and its files.
 * @param {String} path is the location of the file
 */
FileAnalyzer.prototype.readDirectory = function(path) {
	fs.readdir(path, function(err, files) {
		if (err) {
			return sendError('directory ' + path + ' could not been open', err);
		}

		if (!files.length) {
			return;
		}

		files.forEach(function(fileName, index) {
			var pathFileName = path + '/' + fileName;
			fs.stat(pathFileName, (function(err, stat) {
				if (err) {
					return sendError(pathFileName + ' could not been open', err);
				}
				if (stat.isDirectory()) {
					this.readDirectory(pathFileName);
				} else {
					if (this.filter.test(pathFileName)) {
						this.fileManager(pathFileName);
					}
				}
			}).bind(this));
		}, this);
	}.bind(this));
};

/**
 * Manage error
 * @param {String} msg a title message
 * @param {String} err the error message
 */
function sendError(msg, err){
	if (typeof err === 'undefined') {
		err = '';
	}

	console.error(msg, err);
}

main(process.argv);
