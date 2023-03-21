FROM node:latest

COPY . /app/

ENV MD_PATH=$MD_PATH
ENV NOTION_TOKEN=$NOTION_TOKEN
ENV NOTION_DATABASE_ID=$NOTION_DATABASE_ID

RUN cd /app && \
    yarn config set unsafe-perm true && \
    yarn install --force

RUN pwd && ls -l

CMD cd /app && yarn start
