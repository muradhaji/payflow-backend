import mongoose, { Schema, Document } from 'mongoose';

export interface IMonthlyPayment {
  _id?: mongoose.Types.ObjectId;
  date: Date;
  amount: number;
  paid: boolean;
  paidDate: Date | null;
}

export interface IInstallment extends Document {
  user: mongoose.Types.ObjectId;
  title: string;
  amount: number;
  monthCount: number;
  startDate: Date;
  monthlyPayments: IMonthlyPayment[];
  createdAt: Date;
  updatedAt: Date;
}

const monthlyPaymentSchema = new Schema<IMonthlyPayment>({
  date: { type: Date, required: true },
  amount: { type: Number, required: true },
  paid: { type: Boolean, default: false },
  paidDate: { type: Date, default: null },
});

const installmentSchema = new Schema<IInstallment>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    amount: { type: Number, required: true },
    monthCount: { type: Number, required: true },
    startDate: { type: Date, required: true },
    monthlyPayments: [monthlyPaymentSchema],
  },
  { timestamps: true }
);

export const Installment = mongoose.model<IInstallment>(
  'Installment',
  installmentSchema
);
