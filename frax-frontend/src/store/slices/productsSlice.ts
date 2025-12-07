import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../api';
import { PRODUCTS_MOCK } from '../../api/mock'; 
import type { IProduct } from '../../types';



interface ProductsState {
    items: IProduct[];
    total: number;
    currentProduct: IProduct | null;
    loading: boolean;
    error: string | null;
}

const initialState: ProductsState = {
    items: [],
    total: 0,
    currentProduct: null,
    loading: false,
    error: null,
};

// --- Thunk: Получение списка продуктов ---
export const fetchProducts = createAsyncThunk(
    'products/fetchProducts',
    async (title: string, { rejectWithValue }) => {
        try {
            const response = await api.products.productsList({ title });
            
            const rawItems = response.data.items || [];
            
            const mappedItems: IProduct[] = Array.isArray(rawItems) 
                ? rawItems.map((item: any) => ({
                    id: item.id ?? 0,
                    title: item.title ?? 'Без названия',
                    text: item.text ?? '',
                    image: item.image ?? '',
                    argument: item.argument ?? 0,
                    status: item.status ?? false,
                }))
                : [];

            return {
                items: mappedItems,
                total: response.data.total || 0
            };
        } catch (err) {
            return rejectWithValue('Backend unavailable');
        }
    }
);

// --- Thunk: Получение одного продукта ---
export const fetchProductById = createAsyncThunk(
    'products/fetchProductById',
    async (id: string, { rejectWithValue }) => {
        try {
            const productId = parseInt(id);
            const response = await api.products.productsDetail(productId);
            
            const data = response.data;
            const mappedProduct: IProduct = {
                id: data.id ?? productId,
                title: data.title ?? 'Без названия',
                text: data.text ?? '',
                image: data.image ?? '',
                argument: data.argument ?? 0,
                status: data.status ?? false
            };

            return mappedProduct;
        } catch (err) {
            return rejectWithValue(id);
        }
    }
);

const productsSlice = createSlice({
    name: 'products',
    initialState,
    reducers: {
        clearCurrentProduct: (state) => {
            state.currentProduct = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchProducts.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchProducts.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload.items; 
                state.total = action.payload.total;
            })
            .addCase(fetchProducts.rejected, (state, action) => {
                state.loading = false;
                state.error = 'Backend unavailable';
                console.warn('[Redux] Ошибка загрузки списка. Используем моки.');
                const filterTitle = (action.meta.arg as string) || '';
                const filteredMockItems = PRODUCTS_MOCK.items.filter(product =>
                    product.title.toLowerCase().includes(filterTitle.toLowerCase())
                );
                state.items = filteredMockItems;
                state.total = filteredMockItems.length;
            })
            .addCase(fetchProductById.pending, (state) => {
                state.loading = true;
                state.currentProduct = null; 
            })
            .addCase(fetchProductById.fulfilled, (state, action) => {
                state.loading = false;
                state.currentProduct = action.payload;
            })
            .addCase(fetchProductById.rejected, (state, action) => {
                state.loading = false;
                
                const idStr = action.meta.arg;
                const id = parseInt(idStr);
                console.log(`[Redux] Ошибка загрузки продукта ID: ${id}. Ищем в моках...`);

                const product = PRODUCTS_MOCK.items.find(f => f.id === id);
                state.currentProduct = product || null;
            });
    },
});

export const { clearCurrentProduct } = productsSlice.actions;
export default productsSlice.reducer;