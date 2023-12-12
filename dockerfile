# build stage
FROM node:18.19.0-alpine3.19 as build-stage

WORKDIR /app

COPY package.json .

RUN npm config set registry https://registry.npmmirror.com/

RUN npm install

COPY . .

RUN npm run build

# production stage
FROM node:18.19.0-alpine3.19 as production-stage

ARG db_host
ARG db_pass
ARG db_user

COPY --from=build-stage /app/dist /app
COPY --from=build-stage /app/package.json /app/package.json

WORKDIR /app

ENV db_host=${db_host} \
    db_pass=${db_pass} \
    db_user=${db_user} 

RUN npm install --omit=dev

Run npm install pm2 -g

EXPOSE 3000

CMD ["pm2-runtime", "/app/main.js"]
