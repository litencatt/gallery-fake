FROM node:latest

COPY . /app/

RUN cd /app && \
    yarn config set unsafe-perm true && \
    yarn install --force

CMD cd /app && yarn start
