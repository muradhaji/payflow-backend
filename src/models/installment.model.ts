import mongoose, { Schema, Document } from 'mongoose';

export interface IMonthlyPayment {
  date: Date;
  amount: number;
  paid: boolean;
  paidDate: Date;
}

export interface IInstallment extends Document {
  user: mongoose.Types.ObjectId;
  title: string;
  amount: number;
  monthCount: number;
  startMonth: number;
  monthlyPayments: IMonthlyPayment[];
  createdAt: Date;
  updatedAt: Date;
}

const monthlyPaymentSchema = new Schema<IMonthlyPayment>(
  {
    date: { type: Date, required: true },
    amount: { type: Number, required: true },
    paid: { type: Boolean, default: false },
    paidDate: { type: Date, default: null },
  },
  { _id: false }
);

const installmentSchema = new Schema<IInstallment>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    amount: { type: Number, required: true },
    monthCount: { type: Number, required: true },
    startMonth: { type: Number, required: true },
    monthlyPayments: [monthlyPaymentSchema],
  },
  { timestamps: true }
);

export const Installment = mongoose.model<IInstallment>(
  'Installment',
  installmentSchema
);
