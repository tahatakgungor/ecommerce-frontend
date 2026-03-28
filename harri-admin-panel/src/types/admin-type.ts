// --- REQUEST TYPES ---

// admin register
export interface IAdminRegisterAdd {
  name: string;
  email: string;
  password: string;
}

// admin login
export interface IAdminLoginAdd {
  email: string;
  password: string;
}

// admin update
export interface IAdminUpdate {
  name?: string;
  image?: string;
  email?: string;
  phone?: string;
  role?: string;
  joiningData?: string;
}

// manual staff add
export interface IAddStuff {
  name: string;
  email: string;
  password?: string;
  image?: string;
  role?: string;
  phone?: string;
  joiningDate?: string;
}

// --- RESPONSE TYPES ---

// Önemli Not: Java Backend veriyi { success: true, data: { ... } } şeklinde döner.
// Bu yüzden interface'lerimizi bu "data" sarmalamasına uygun hale getirdik.

export interface IAdminLoginRes {
  success: boolean;
  message: string;
  data: {
    _id: string;
    token: string;
    name: string;
    image?: string;
    email: string;
    phone?: string;
    role?: string;
  };
}

export interface IAdminRegisterRes {
  success: boolean;
  message: string;
  data: {
    token: string;
    _id: string;
    name: string;
    email: string;
    role: string;
    joiningData: string;
  };
}

export interface IAdminUpdateRes {
  success: boolean;
  message: string;
  data: {
    token: string;
    _id: string;
    name: string;
    image: string;
    email: string;
    phone: string;
    role: string;
  };
}

// Single stuff object (Tablolarda ve detaylarda kullanılan ana tip)
export interface IStuff {
  _id: string;
  name: string;
  image?: string;
  address?: string;
  country?: string;
  city?: string;
  email: string;
  phone?: string;
  status?: "Active" | "Inactive";
  password?: string;
  role: "Admin" | "Super Admin" | "Manager" | "CEO" | "STAFF"; // STAFF eklendi
  joiningDate?: string;
  createdAt: string;
  updatedAt: string;
}

// Tüm personelleri getiren yanıt tipi
export interface IAdminGetRes {
  success: boolean; // status yerine success (Java standardı için daha güvenli)
  message: string;
  data: IStuff[];
}