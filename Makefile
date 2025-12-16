install-deps:
	brew install --cask google-cloud-sdk
	brew install tfenv

auth:
	gcloud auth login --update-adc

build:
	npm install
	npm run build

install: build
	mkdir -p ~/Obsidian/Default/.obsidian/plugins/obsidian-gcal-sync
	cp main.js manifest.json styles.css ~/Obsidian/Default/.obsidian/plugins/obsidian-gcal-sync/
