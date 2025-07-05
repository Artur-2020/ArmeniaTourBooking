FROM node:20.15

RUN npm install -g @nestjs/cli

WORKDIR /app

COPY package*.json ./

COPY . .

EXPOSE 3004

CMD ["npm", "run", "start:dev"] 