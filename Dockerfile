FROM node:23-alpine

# Working Directory of Docker Container
WORKDIR /app

# Install app dependencies
COPY package*.json ./

RUN npm install 

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]