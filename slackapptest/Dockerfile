FROM node:18-alpine3.15

LABEL maintainer="konrness@gmail.com"
LABEL source="https://github.com/konrness/harness-account-notification-plugin"

WORKDIR /app

COPY package.json package.json
RUN npm install
#RUN npm install node-fetch @slack/web-api

ADD ./slackdebug.js /app/slackdebug.js
ADD ./app.js /app/app.js

#ENTRYPOINT ["/home/entrypoint.sh"]
CMD [ "node", "slackdebug.js" ]