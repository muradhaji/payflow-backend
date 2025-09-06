export const REGEX = {
  AUTH: {
    USERNAME: /^[a-z0-9]+$/,
    PASSWORD: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d\S]{8,20}$/,
  },
  INSTALLMENT: {
    START_DATE: /^\d{4}-\d{2}-\d{2}$/,
    MONTHLY_PAYMENT_DATE: /^\d{4}-\d{2}-\d{2}$/,
  },
};
