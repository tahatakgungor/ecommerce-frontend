
export interface ICoupon {
  _id: string;
  title: string;
  logo: string;
  couponCode: string;
  endTime: string;
  discountPercentage: number;
  minimumAmount: number;
  productType: string | null;
  productScope?: "ALL_PRODUCTS" | "CATEGORY";
  startTime:string;
  createdAt: string;
  updatedAt: string;
  status:string;
  scope?: string;
  assignedUserEmail?: string | null;
  assignedUserId?: string | null;
}


export interface IAddCoupon {
  title: string;
  logo?: string;
  couponCode: string;
  endTime: string;
  discountPercentage: number;
  minimumAmount: number;
  productType?: string | null;
  productScope?: "ALL_PRODUCTS" | "CATEGORY";
  startTime?:string;
  status?:string;
  scope?: string;
  assignedUserEmail?: string;
}
