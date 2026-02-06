FROM ghcr.io/dfinity/icp-dev-env-slim:latest AS icp_container
USER root:root
WORKDIR /
VOLUME /tetris
COPY --chmod=100 --chown=root:root ./init.sh ./init.sh
RUN dfxvm update && apt update -y 
CMD ["./init.sh"]