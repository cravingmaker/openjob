# OpenJob

Final submission for [Belajar Fundamental Back-End dengan JavaScript](https://www.dicoding.com/academies/271-belajar-fundamental-back-end-dengan-javascript) on Dicoding.

## Projects

- **openjob-api** — RESTful API built with Express, PostgreSQL, Redis, and RabbitMQ
- **openjob-consumer** — Queue consumer that listens to RabbitMQ and sends email notifications via Nodemailer

## Requirements

- Node.js >= 24
- PostgreSQL
- Redis
- RabbitMQ

## Getting Started

### openjob-api

```bash
cd openjob-api
npm install
cp .env.example .env   # fill in your values
npm run migrate:up
npm run start:dev
```

### openjob-consumer

```bash
cd openjob-consumer
npm install
cp .env.example .env   # fill in your values
npm start
```
