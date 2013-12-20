PATH := ./node_modules/.bin:${PATH}

init:
	npm install && bower install

build:
	grunt concat:js

test:
	npm test

.PHONY: init build
