FROM node:12

WORKDIR /home/node/app

COPY package*.json ./

RUN npm install

COPY . .

CMD [ "node", "index.js" ]