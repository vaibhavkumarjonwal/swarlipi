# 1. Install dependencies and build
FROM node:18 AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# 2. Serve production build
FROM node:18

WORKDIR /app

COPY --from=builder /app ./

EXPOSE 3000

ENV NODE_ENV production

CMD ["npm", "run", "dev"]
