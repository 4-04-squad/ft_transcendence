# COLORS
GREEN		= \033[1;32m
RED 		= \033[1;31m
ORANGE		= \033[1;33m
CYAN		= \033[1;36m
RESET		= \033[0m

# FOLDER
SRCS_DIR	= ./
DOCKER_DIR	= ${SRCS_DIR}docker-compose.yml
NAME		= ft_transcendence


# VARIABLES
ENV_FILE	= ${SRCS_DIR}.env

# COMMANDS
DOCKER		=  docker compose -f ${DOCKER_DIR} --env-file ${ENV_FILE} -p ${NAME}

%:
	@:

all: up

up:
	@echo "${GREEN}Building containers...${RESET}"
	@${DOCKER} up -d

build:
	@echo "${GREEN}Building containers...${RESET}"
	@${DOCKER} up -d --build

down:
	@echo "${GREEN}Stopping containers...${RESET}"
	@${DOCKER} down

stop:
	@echo "${GREEN}Stopping containers...${RESET}"
	@${DOCKER} stop

start:
	@echo "${GREEN}Starting containers...${RESET}"
	@${DOCKER} start

restart:
	@echo "${GREEN}Restarting containers...${RESET}"
	@${DOCKER} restart

logs:
	@echo "${GREEN}Displaying logs...${RESET}"
	@${DOCKER} logs -f

rebuild: down delete
	@echo "${GREEN}Rebuilding containers...${RESET}"
	@${DOCKER} up -d --build --force-recreate

delete:
	@echo "${GREEN}Deleting containers...${RESET}"
	@${DOCKER} down --volumes --remove-orphans

prune: ## Prune all
	@docker system prune -a -f --volumes

exec-web:
	@echo "${GREEN}Executing web container...${RESET}"
	@${DOCKER} exec web sh

exec-backend:
	@echo "${GREEN}Executing backend container...${RESET}"
	@${DOCKER} exec backend sh

exec-database:
	@echo "${GREEN}Executing database container...${RESET}"
	@${DOCKER} exec database sh

exec-nginx:
	@echo "${GREEN}Executing nginx container...${RESET}"
	@${DOCKER} exec nginx sh

help:
	@echo "\n\033[1mUsage: make [target]${RESET}\n"
	@echo "\033[1mTargets:${RESET}"
	@echo "\033[1m  up${RESET}            - Build and start containers"
	@echo "\033[1m  down${RESET}          - Stop and remove containers"
	@echo "\033[1m  stop${RESET}          - Stop containers"
	@echo "\033[1m  start${RESET}         - Start containers"
	@echo "\033[1m  restart${RESET}       - Restart containers"
	@echo "\033[1m  logs${RESET}          - Display logs"
	@echo "\033[1m  rebuild${RESET}       - Rebuild containers"
	@echo "\033[1m  delete${RESET}        - Delete containers"
	@echo "\033[1m  prune${RESET}         - Prune all"
	@echo "\033[1m  help${RESET}          - Display this help"
	@echo "\033[1m  exec-web${RESET}      - Execute web container"
	@echo "\033[1m  exec-backend${RESET}  - Execute backend container"
	@echo "\033[1m  exec-database${RESET} - Execute database container\n"
	@echo "\033[1m  exec-nginx${RESET}    - Execute nginx container\n"

.PHONY: up down stop start restart logs rebuild delete