FROM node:20.15

RUN npm install -g @nestjs/cli

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3002

CMD ["npm", "run", "start:dev"]
