.PHONY: run
run:
	npm start

.PHONY: story
story: build
	npm run storybook

.PHONY: watch
watch:
	node run.js

.PHONY: build
build:
	npm run build

.PHONY: test
test:
	npm run test

.PHONY: prod
prod: build
	npm run copy

.PHONY: serve
serve:
	npm run serve
