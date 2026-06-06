export type SessionUser = {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  zipCode: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export type ForgotPasswordPayload = {
  email: string;
};

export type ResetPasswordPayload = {
  token: string;
  password: string;
  confirmPassword: string;
};
