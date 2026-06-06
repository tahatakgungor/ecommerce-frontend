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
  savedAddresses: string;
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

export type SavedAddress = {
  id: string;
  label: string;
  address: string;
  city: string;
  country: string;
  zipCode: string;
  isDefault: boolean;
};

export type UpdateProfilePayload = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  savedAddresses: SavedAddress[];
};

export type ChangePasswordRequestPayload = {
  currentPassword: string;
  newPassword: string;
};

export type ChangePasswordConfirmPayload = {
  code: string;
};

export type ConfirmEmailResult = {
  token: string;
  user: SessionUser;
  message: string;
};
