import { configureStore } from '@reduxjs/toolkit';
import filterReducer from './slices/filterSlice';
import productsReducer from './slices/productsSlice'; 
import cartReducer from './slices/cartSlice';     
import userReducer from './slices/userSlice';
import dietReducer from './slices/dietSlice';

export const store = configureStore({
    reducer: {
        filter: filterReducer,
        products: productsReducer, 
        cart: cartReducer, 
        user: userReducer,
        diet: dietReducer,    
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;