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

OBSIDIAN_VAULT_PATH ?= ~/Obsidian/Default

install: build
	mkdir -p $(OBSIDIAN_VAULT_PATH)/.obsidian/plugins/obsidian-gcal-sync
	cp main.js manifest.json styles.css src/calendar/credentials.json $(OBSIDIAN_VAULT_PATH)/.obsidian/plugins/obsidian-gcal-sync/
