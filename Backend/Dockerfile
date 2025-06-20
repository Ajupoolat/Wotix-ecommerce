FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
COPY .env .env

ENV NODE_ENV=production

EXPOSE 5000

CMD ["npm", "start"]
