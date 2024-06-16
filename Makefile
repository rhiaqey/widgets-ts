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

.PHONY: copy
copy:
	npm run copy

.PHONY: prod
prod: pretty build copy
	npm pack

.PHONY: serve
serve:
	npm run serve

pretty:
	npx prettier src --write
