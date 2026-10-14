
FROM node:alpine as build

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci
COPY . . 
RUN npm run build

FROM node:alpine

WORKDIR /app
COPY --from=build /app/dist /app/dist
COPY --from=build /app/server.mjs /app/server.mjs
COPY --from=build /app/seo.mjs /app/seo.mjs
ENV PORT=3000
EXPOSE 3000

CMD [ "node", "/app/server.mjs" ]
