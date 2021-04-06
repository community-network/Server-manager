
# Makefile config for local manager build & testing
## I attached this makefile to my tasks in VS

# Production build auto-made by GH Actions
# This defenition should apply only for local building

build:
	# Build is defined in package.json
	# Rebuild cleaning made by react-scripts
	npm run build

test:
	npm run test

# Start is useful to run local server
# And host frontend

start:
	npm run start