all :
	@docker compose -f ./docker-compose.yml up -d

no_cache :
	@docker compose -f ./docker-compose.yml build --no-cache
	@docker compose -f ./docker-compose.yml up -d

clean :
	@docker compose -f ./docker-compose.yml down -t 1

fclean :
	@docker compose -f ./docker-compose.yml down -v -t 1
	@docker system prune -af --volumes

re : fclean no_cache

.PHONY : all no_cache clean fclean re
