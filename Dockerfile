FROM node:16.15.1-alpine
# Create app directory
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
RUN ln -s /environment/in-holac.env .env
COPY . .
RUN npm run build
EXPOSE 3000
CMD [ "node", "dist/main.js" ]