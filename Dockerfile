FROM node:20-slim

# Working Directory of Docker Container
WORKDIR /app

# Install app dependencies
COPY package*.json ./

RUN npm install 

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]