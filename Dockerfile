FROM node:boron

WORKDIR /usr/src/app

COPY package.json package-lock.json

RUN npm install

COPY . .

EXPOSE 80

RUN npm run build

CMD [ "npm", "build" ]
