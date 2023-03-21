FROM node:latest

COPY . /app/

ENV MD_PATH=$MD_PATH
ENV NOTION_TOKEN=$NOTION_TOKEN
ENV NOTION_DATABASE_ID=$NOTION_DATABASE_ID

RUN cd /app && \
    yarn config set unsafe-perm true && \
    yarn install --force

CMD pwd && ls -l && \
    cd /app && \
    yarn start
