FROM node:23

# Working Directory of Docker Container
WORKDIR /app

# Install app dependencies
COPY package*.json ./

RUN npm install 

COPY . .

RUN npm run build

EXPOSE 8000

CMD ["npm", "run", "dev"]