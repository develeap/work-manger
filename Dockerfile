FROM node:8.14.0-alpine

WORKDIR /usr/src/app

COPY app/package*.json ./

RUN npm install
# If you are building your code for production
# RUN npm install --only=production

# Bundle app source
#COPY app/* ./

EXPOSE 8080

CMD [ "npm", "start" ]