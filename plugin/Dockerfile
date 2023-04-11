FROM node:18-alpine3.15

LABEL maintainer="konrness@gmail.com"
LABEL source="https://github.com/konrness/harness-account-notification-plugin"

WORKDIR /app

COPY package.json package.json
RUN npm install

ADD ./entrypoint.sh /app
RUN chmod +x /app/entrypoint.sh

ADD ./run.js /app/run.js

ENTRYPOINT ["/app/entrypoint.sh"]