FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install && npm install -g ts-node typescript

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
