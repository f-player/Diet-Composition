import type { IPaginatedProducts, IProduct } from '../types';
import { PRODUCTS_MOCK } from './mock';

const API_PREFIX = '/api';

const fixEncoding = (str: string): string => {
    if (!str) return str;
    
    // Исправляем кодировку из Windows-1251 в UTF-8
    try {
        return decodeURIComponent(escape(str));
    } catch (error) {
        console.warn('Failed to fix encoding for string:', str);
        return str;
    }
};
// Получение списка факторов с фильтраией по названию
export const getProducts = async (title: string): Promise<IPaginatedProducts> => {
    const url = title 
        ? `${API_PREFIX}/products?title=${encodeURIComponent(title)}`
        : `${API_PREFIX}/products`;

    try {
        console.log('Making request to:', url);
        const response = await fetch(url);
        console.log('Response status:', response.status);
        
        const data = await response.json();
        console.log('Raw backend response:', data);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Исправляем кодировку и преобразуем данные
        const fixedItems = data.items?.map((product: any) => ({
            id: product.id,
            title: fixEncoding(product.title),
            image: fixEncoding(product.image),
            c_pol: product.c_pol,  // Добавляем c_pol
            n_pol: product.n_pol   // Добавляем n_pol
        })) || [];

        console.log('Fixed items:', fixedItems);

        return {
            items: fixedItems,
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
        const response = await fetch(`${API_PREFIX}/products/${id}`);
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