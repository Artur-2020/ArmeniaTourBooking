# базовый образ
FROM node:20.15


RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app

WORKDIR /home/node/app

COPY package*.json ./

USER node

RUN npm install

COPY --chown=node:node . .

EXPOSE 3000

# запуск приложения
CMD ["npm", "run", "start:dev"]
