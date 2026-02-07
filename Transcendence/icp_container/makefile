build_image:
	docker image build --tag icp_image .

create_container: 
	docker container create --publish 4943:4943 --name icp_container icp_image

start_container:
	docker container start icp_container

stop_container:
	docker container stop icp_container

prune_image:
	docker image prune -af

prune_container:
	docker container prune -f

prune_all: prune_image prune_container
	@echo "all pruned"

super_start: build_image create_container start_container
	@echo "all started"
	
re: stop_container prune_all super_start