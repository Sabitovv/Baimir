
FROM node:alpine as build

WORKDIR /app

COPY package.json package.json

RUN npm install
COPY . . 
RUN npm run build

FROM node:alpine

WORKDIR /app
COPY --from=build /app/dist /app/dist
COPY --from=build /app/server.mjs /app/server.mjs
ENV PORT=3000
EXPOSE 3000

CMD [ "node", "/app/server.mjs" ]
