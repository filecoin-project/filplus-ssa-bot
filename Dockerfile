FROM node:16-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

RUN npm link

CMD [ "node", "./dist/index.js" ]