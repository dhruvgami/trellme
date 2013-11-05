PATH := ./node_modules/.bin:${PATH}

.PHONY : init clean-docs clean build test dist publish

init:
	npm install

docs:
	docco src/*.coffee

clean-docs:
	rm -rf docs/

clean: clean-docs
	rm -rf lib/ test/*.js

build:
	./node_modules/coffee-script/bin/coffee -o lib/ -c src/

test:

server:
	make build && node ./lib/app.js

dist: clean init docs build test

publish: dist
	npm publish
