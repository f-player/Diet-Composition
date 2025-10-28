import type {IPaginatedProducts} from "../types/index.ts";

export const PRODUCTS_MOCK: IPaginatedProducts = {
  total: 3,
  items: [
    {
      id: 101,
      title: "Наземные травоядные",
      image: "http://127.0.0.1:9000/imagegroup/i1.webp",
      C_pol: -20,
      N_pol: 5,
    },
    {
      id: 102,
      title: "C3-злаки",
      image:"http://127.0.0.1:9000/imagegroup/i2.webp",
      C_pol: -24,
      N_pol: -5,
    },
    {
      id: 103,
      title: "Морская рыба",
      image:"http://127.0.0.1:9000/imagegroup/i3.webp",
      C_pol: -15,
      N_pol: 5,
    },
        {
      id: 104,
      title: "Пульсы / бобовые",
      image:"http://127.0.0.1:9000/imagegroup/i5.jpg",
      C_pol: -30,
      N_pol: 2,
    },
    {
      id: 105,
      title: "Овощи",
      image:"http://127.0.0.1:9000/imagegroup/i4.webp",
      C_pol: -28,
      N_pol: 2,
    },
  ],
};