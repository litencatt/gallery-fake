FROM node:latest

WORKDIR /app
COPY ./ /app/

ENV MD_PATH=$MD_PATH
ENV NOTION_TOKEN=$NOTION_TOKEN
ENV NOTION_DATABASE_ID=$NOTION_DATABASE_ID

RUN yarn config set unsafe-perm true
RUN yarn install --force

USER node
CMD cd /app && yarn start
