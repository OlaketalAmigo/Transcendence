FROM ghcr.io/dfinity/icp-dev-env-slim:latest AS icp_container
USER root:root
WORKDIR /
COPY --chmod=100 --chown=root:root ./init.sh ./init.sh
COPY --chmod=100 --chown=root:root ./index.html ./index.html
COPY --chmod=100 --chown=root:root ./tetris.js ./tetris.js
RUN dfxvm update && apt update -y 
CMD ["./init.sh"]