import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../api';
import { logoutUser } from './userSlice';



interface CartState {
    diet_id: number | null;
    count: number;
    loading: boolean;
    error: string | null
}

const initialState: CartState = {
    diet_id: null,
    count: 0,
    loading: false,
    error: null,
};

// Получение бейджика
export const fetchCartBadge = createAsyncThunk(
    'cart/fetchCartBadge',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.diet.productscartList();
            return response.data;
        } catch (error) {
            return rejectWithValue('Failed to fetch cart');
        }
    }
);

// Добавление продукта в черновик 
export const addProductToDraft = createAsyncThunk(
    'cart/addToDraft',
    async (productId: number, { dispatch, rejectWithValue }) => {
        try {
            await api.diet.draftProductsCreate(productId);
            dispatch(fetchCartBadge());
            return productId;
        } catch (error: any) {
            alert("Ошибка при добавлении: " + (error.response?.data?.description || "Неизвестная ошибка"));
            return rejectWithValue('Failed to add');
        }
    }
);

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchCartBadge.fulfilled, (state, action) => {
                state.diet_id = action.payload.diet_id || null;
                state.count = action.payload.count || 0;
            })
            .addCase(fetchCartBadge.rejected, (state) => {
                state.diet_id = null;
                state.count = 0;
            })
            .addCase(logoutUser.fulfilled, () => initialState);
    }
});

export default cartSlice.reducer;