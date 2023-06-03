FROM node:18.15.0

RUN mkdir app
WORKDIR app
COPY package.json package-lock.json .
RUN npm i
COPY lib ./lib
COPY services ./services
COPY .env* gulpfile.js knexfile.js Makefile tsconfig.json webpack.config.js .
RUN make build-wss

EXPOSE 3001
ENV NODE_ENV=production

CMD ["make", "start-prod-ws-server"]
