FROM node:18-bullseye-slim

RUN apt-get update && apt-get upgrade -y && apt-get clean

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 3000

CMD ["npm", "start"]