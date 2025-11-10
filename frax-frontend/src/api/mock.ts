import type {IPaginatedProducts} from "../types/index.ts";

export const PRODUCTS_MOCK: IPaginatedProducts = {
  total: 5,
  items: [
    {
      id: 101,
      title: "Terrestrial Herbivores",
      image: "mock_images/default.webp",
      c_pol: -20,
      n_pol: 5,
    },
    {
      id: 102,
      title: "C3 Cereals",
      image: "mock_images/default.webp",
      c_pol: -24,
      n_pol: -5,
    },
    {
      id: 103,
      title: "Marine Fish",
      image: "mock_images/default.webp",
      c_pol: -15,
      n_pol: 5,
    },
    {
      id: 104,
      title: "Pulses / Legumes",
      image: "mock_images/default.webp",
      c_pol: -30,
      n_pol: 2,
    },
    {
      id: 105,
      title: "Vegetables",
      image: "mock_images/default.webp",
      c_pol: -28,
      n_pol: 2,
    },
  ],
};