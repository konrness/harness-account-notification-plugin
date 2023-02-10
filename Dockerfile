FROM node:18-alpine3.15

LABEL maintainer="konrness@gmail.com"
LABEL source="https://github.com/konrness/harness-account-notification-plugin"

WORKDIR /home

ADD ./package.json /home/package.json
RUN npm install
RUN npm install node-fetch

ADD ./entrypoint.sh /home
RUN chmod +x /home/entrypoint.sh

ADD ./run.js /home/run.js

ENTRYPOINT ["/home/entrypoint.sh"]
