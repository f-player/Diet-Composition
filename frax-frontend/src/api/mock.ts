import type {IPaginatedProducts} from "../types/index.ts";

export const PRODUCTS_MOCK: IPaginatedProducts = {
  total: 5,
  items: [
    {
      id: 101,
      title: "Наземные травоядные",
      image: "mock_images/default.webp",
      c_pol: -20,
      n_pol: 5,
    },
    {
      id: 102,
      title: "C3 злаки",
      image: "mock_images/default.webp",
      c_pol: -24,
      n_pol: -5,
    },
    {
      id: 103,
      title: "Морская рыба",
      image: "mock_images/default.webp",
      c_pol: -15,
      n_pol: 5,
    },
    {
      id: 104,
      title: "Бобовые культуры",
      image: "mock_images/default.webp",
      c_pol: -30,
      n_pol: 2,
    },
    {
      id: 105,
      title: "Овощи",
      image: "mock_images/default.webp",
      c_pol: -28,
      n_pol: 2,
    },
  ],
};