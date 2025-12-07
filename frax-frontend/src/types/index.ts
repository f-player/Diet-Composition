export interface IProduct {
  id: number;
  title: string;
  text: string;
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

export interface ICartBadge {
    diet_id: number | null;
    count: number;
}

export interface BreadcrumbsProps {
  crumbs: ICrumb[];
}

export interface ProductCardProps {
    product: IProduct;
}

export interface FilterState {
    searchTerm: string;
}
