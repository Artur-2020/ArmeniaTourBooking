FROM node:20.15

WORKDIR /app

# Install Nest CLI globally
RUN npm install -g @nestjs/cli

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "run", "start:dev"]
