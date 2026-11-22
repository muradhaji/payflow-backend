import express from 'express';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import installmentRoutes from './routes/installment.routes';
import cors from 'cors';
import connectDB from './config/db';
import { setupSwagger } from './swagger';

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

setupSwagger(app);

app.get('/', (req, res) => {
  res.send('PayFlow API is running!');
});
app.use('/api/auth', authRoutes);
app.use('/api/installments', installmentRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
