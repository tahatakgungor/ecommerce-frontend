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
