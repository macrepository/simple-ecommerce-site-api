include .env

build:
	rm docker-compose.yml
	cp docker-compose.yml.sample docker-compose.yml
	sed -i'' -e "s/custom_network/${PROJECT}/" docker-compose.yml
	docker compose up -d
down:
	sudo rm -rf mysql/*
	docker compose down -v
start:
	docker compose start
restart:
	docker compose restart
stop:
	docker compose stop