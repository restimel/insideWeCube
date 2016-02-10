#!/bin/bash

if [ -d "utils/i18n-js-parser" ]; then
	cd utils/i18n-js-parser
else
	if [ -d "i18n-js-parser" ]; then
		cd i18n-js-parser
	else
		echo ""
		echo "i18n-js-parser directory has not been found."
		echo "Please check that you have download it correctly."
		echo "The following git command should download it:"
		echo "		git submodule update -i"
		echo ""
		exit 1
	fi
fi

if ! type "node" >& /dev/null; then
  echo ""
  echo "node is not installed yet or is not named like this."
  echo "Type 'node main.js ../../i18n-configuration.json"
  echo "in i18n-js-parser directory in order to run the translation helper."
  echo ""
  cd -
  exit 1
fi

node main.js ../../i18n-configuration.json

cd -
