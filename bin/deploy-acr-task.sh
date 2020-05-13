#!/bin/bash
set -e

GIT_PAT=$(az keyvault secret show --vault-name infra-vault-prod --name hmcts-github-apikey --query value -o tsv)

az acr task create \
    --registry hmctspublic \
    --name task-incident-response-frontend \
    --file acr-build-task.yaml \
    --context https://github.com/hmcts/incident-response-frontend.git \
    --branch master \
    --git-access-token $GIT_PAT \
    --subscription DCD-CNP-PROD
