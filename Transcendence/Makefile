all : up

up :
	@docker compose -f ./docker-compose.yml up -d

clean :
	@docker compose -f ./docker-compose.yml down -t 1

fclean :
	@docker compose -f ./docker-compose.yml down -v -t 1
	@docker system prune -af --volumes

re : fclean up

