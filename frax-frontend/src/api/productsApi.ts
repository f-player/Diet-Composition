import type { IPaginatedProducts, IProduct, ICartBadge} from '../types';
import { PRODUCTS_MOCK } from './mock';
import { getApiBase } from '../config';

const API_BASE = getApiBase();
// Получение списка факторов с фильтраией по названию
export const getProducts = async (title: string): Promise<IPaginatedProducts> => {
    const url = title 
        ? `${API_BASE}/products?title=${encodeURIComponent(title)}`
        : `${API_BASE}/products`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Backend is not available');
        }
    const data = await response.json();
    return {
        items: data.items || [],
        total: data.total || 0
    };
    } catch (error) {
        console.warn('Failed to fetch from backend, using mock data.', error);
        const filteredMockItems = PRODUCTS_MOCK.items.filter(product =>
            product.title.toLowerCase().includes(title.toLowerCase())
        );
        return { items: filteredMockItems, total: filteredMockItems.length };
    }
};

// Получение одного фактора по ID
export const getProductById = async (id: string): Promise<IProduct | null> => {
    try {
        const response = await fetch(`${API_BASE}/products/${id}`);
        if (!response.ok) {
            throw new Error('Backend is not available');
        }
        return await response.json();
    } catch (error) {
        console.warn(`Failed to fetch product ${id}, using mock data.`, error);
        const product = PRODUCTS_MOCK.items.find(f => f.id === parseInt(id));
        return product || null;
    }
};

// Получение корзины
export const getCartBadge = async (): Promise<ICartBadge> => {
    try {
        const token = localStorage.getItem('authToken'); 
        if (!token) {
            throw new Error('No auth token found');
        }

        const response = await fetch(`${API_BASE}/diet/productscart`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch cart data');
        }
        return await response.json();

    } catch (error) {
        console.warn('Could not fetch cart data, assuming cart is empty.', error);
        return { diet_id: null, count: 0 };
    }
};