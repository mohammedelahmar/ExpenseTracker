# Simple dev Dockerfile for the Express API
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copy rest of the app
COPY . .

EXPOSE 5000

CMD ["npm", "run", "dev"]
