InsideWeCube
============

A cube constructor and helper for insidezecube (http://www.insidezecube.com/)

Online example: https://restimel.github.com/insideWeCube/index.html

InsideWeCube is a web application written in JavaScript. All you need is a browser where the application will be executed.
All activity is front-end only and nothing is sent to server.
The application can be embeded in any HTML5 web page.

## How to install

Clone all sources from github
```
	$ git clone https://github.com/restimel/insideWeCube.git
```

index.html in the root folder is the entry point.
Folders common, models, and pages contain the script files.
Folder css contains the styling files.
Folder img contains image files.
Folder libs contains external library used bu this application.
All other folders are not mandatory to run InsideWeCube.

If you run it locally you need to create a local web server in order to run web-worker correctly.
To help, you can run the following comand (node should be already installed on your computer):
```
	$ node utils/web-server.js
```

A local webserver will run at background from your folder. Port 8000 is used by this webserver.
Then you can access the application with url: http://localhost:8000/index.html

## Browser compatibility

As many HTML5/CSS3 features have been used in InsideWeCube application, it only runs correctly on modern browser.
It works on last version of Chrome, Opera, Safari and Firefox. It has not been tested on Internet Explorer but should work from version 10 (and does not work on version 9).

## Contribution

All bugs reported are welcome. Do it with the github interface.

Any contribution is greatly appreciated. Fork the github project, do your change and propose your contribution.


## Thanks
Thanks for using InsideWeCube
