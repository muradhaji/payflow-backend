import { IInstallment } from '../models/installment.model';
import { IUser } from '../models/user.model';

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
      installment?: IInstallment;
    }
  }
}
