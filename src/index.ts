import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
// import { auth as authRoutes } from './routes/auth';
import routes from './routes/router';
import prisma from './config/prismaClient';
import { errorHandler } from './middlewares/errorHandler';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));


app.use('/', routes);

app.use(errorHandler);

const startServer = async () => {
  try {


    await prisma.$connect();
    console.log('db connected');

    app.listen(PORT, () => {
      console.log(`server running on port: ${PORT}`);
      console.log(`ping at http://localhost:${PORT}/ping`);
    });
} catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Closing HTTP server and database connection...');
  await prisma.$disconnect();
  process.exit(0);
});

startServer();