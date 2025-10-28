export interface IProduct {
  id: number;
  title: string;
  image?: string;
  c_pol?: number;
  n_pol?: number;
}

export interface IPaginatedProducts {
  items: IProduct[];
  total: number;
}

export interface ICrumb {
  label: string;
  path?: string;
  active?: boolean;
}