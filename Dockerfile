FROM node:18.15.0

RUN mkdir app
WORKDIR app
COPY package.json package-lock.json /app/
RUN npm i

COPY client ./client
COPY lib ./lib
COPY models ./models
COPY pages ./pages
COPY public ./public
COPY .env* gulpfile.js knexfile.js Makefile middleware.ts next.config.js \
  tailwind.config.cjs tsconfig.json .
RUN make build
COPY migrations ./migrations
COPY seeds ./seeds
COPY __tests__ ./__tests__

EXPOSE 3000
ENV NODE_ENV=production

CMD ["make", "start-prod-server"]
