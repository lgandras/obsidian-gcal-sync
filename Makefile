install-deps:
	brew install --cask google-cloud-sdk
	brew install tfenv
	tfenv use latest

auth:
	gcloud auth application-default print-access-token 2>&1 >/dev/null && \
	gcloud auth print-access-token 2>&1 >/dev/null || \
	gcloud auth login --update-adc

gcp-project:
	cd terraform && terraform init && terraform apply

generate-credentials:
	./scripts/generate_credentials.sh

build:
	npm install
	npm run build

install: build
	mkdir -p ~/Obsidian/Default/.obsidian/plugins/obsidian-gcal-sync
	cp main.js manifest.json styles.css ~/Obsidian/Default/.obsidian/plugins/obsidian-gcal-sync/
