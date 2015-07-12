InsideWeCube
============

A cube constructor and helper for I N S I D E ³.

InsideWeCube online: https://restimel.github.io/insideWeCube/index.html

InsideWeCube is a web application written in JavaScript. All you need is a browser where the application will be executed.
This is a front-end application and nothing is sent to server.
It can be embeded in any HTML5 web page.

### I N S I D E ³

I N S I D E ³ is a puzzle game. It is a 3D cube maze played without seeing the ball! You try to stear it to the other side. Maps engraved on the surface may help you.

Their web-site: http://www.insidezecube.com/

### InsideWeCube

InsideWeCube allows you to mix your levels in order to find new configuration to play.
Difficulty of your realisation is evaluated.

InsideWeCube also allows you to refind your ball in your cube and give you instructions to bring it back to the start.

Online access: https://restimel.github.io/insideWeCube/index.html

## Browser compatibility

As many HTML5/CSS3 features have been used in InsideWeCube application, it only runs correctly on modern browser.
It works on last version of Chrome, Opera, Safari and Firefox. It has not been tested on Internet Explorer but should work from version 10 (and does not work on version 9 and earlier).

## How to install

Clone all sources from github
```
	$ git clone https://github.com/restimel/insideWeCube.git
```

index.html in the root folder is the entry point.
Folders common, models, and pages contain the script files.
Folder worker contains script for the worker job.
Folder css contains the styling files.
Folder img contains image files.
Folder libs contains external library used bu this application.
All other folders are not mandatory to run InsideWeCube.

If you run it locally you need to create a local web server in order to run web-worker correctly.
To help, you can run the following command (nodeJS should be already installed on your computer):

```
	$ node utils/web-server.js
```

A local webserver will run at background. Port 8000 is used by this webserver.
Then you can access the application with url: http://localhost:8000/index.html

### Languages

Currently insideWeCube is available in English, French and Italian.

To update or complete sentences, you can edit the file libs/i18n/translations.json

To add a new language, you can add a new entry in translationss.json to each sentences. You'll need also to add the key language in libs/i18n/translate-i18n.js

## Contributing

All bugs reported are welcome. You can do it with the github interface.

Any contribution is greatly appreciated. Fork the github project, do your change and pull request your contribution.

Do not hesitate to contact to have more information.


## Thanks
Thanks for using InsideWeCube
