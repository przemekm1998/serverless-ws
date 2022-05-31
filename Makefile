export COMPOSE_DOCKER_CLI_BUILD=1
export DOCKER_BUILDKIT=1
export PROJECT_ROOT_DIR := $(dir $(abspath $(lastword $(MAKEFILE_LIST))))
export ENV_STAGE=dev
export PROJECT_NAME=ws

synth:
	cd infra && cdk synth;

bootstrap:
	cd infra && cdk bootstrap;

deploy-main-stack:
	cd infra && cdk deploy *MainStack;

deploy-components-stack:
	cd infra && cdk deploy *ComponentsStack;

deploy: deploy-main-stack deploy-components-stack

destroy:
	cd infra && cdk destroy --all;
