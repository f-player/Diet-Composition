import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../api';
import { logoutUser } from './userSlice'; 
import type { DsDietDTO, DsDietUpdateRequest, DsProductToDietUpdateRequest } from '../../api/Api';



interface DietState {
    list: DsDietDTO[];           
    currentOrder: DsDietDTO | null; 
    loading: boolean;
    error: string | null;
    operationSuccess: boolean;  
}

const initialState: DietState = {
    list: [],
    currentOrder: null,
    loading: false,
    error: null,
    operationSuccess: false,
};

// --- 1. Получение списка заявок (с фильтрами) ---
export const fetchOrdersList = createAsyncThunk(
    'diet/fetchList',
    async (filters: { status?: string; from?: string; to?: string }, { rejectWithValue }) => {
        try {
            const queryArgs: any = {};
            if (filters.status && filters.status !== 'all') queryArgs.status = parseInt(filters.status);
            if (filters.from) queryArgs.from = filters.from;
            if (filters.to) queryArgs.to = filters.to;
            const response = await api.diet.dietList(queryArgs);
            return response.data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.description || 'Ошибка загрузки списка');
        }
    }
);

// --- 2. Получение одной заявки по ID ---
export const fetchOrderById = createAsyncThunk(
    'diet/fetchById',
    async (id: string, { rejectWithValue }) => {
        try {
            const response = await api.diet.dietDetail(parseInt(id));
            const data: any = response.data;
            const mappedProducts = (data.Products || data.products || []).map((f: any) => ({
                product_id: f.ProductID ?? f.product_id ?? 0,
                title: f.Title ?? f.title ?? 'Без названия',
                image: f.Image ?? f.image ?? '',
                description: f.Description ?? f.description ?? ''
            }));
            const mappedOrder: DsDietDTO = {
                id: data.ID ?? data.id,
                status: data.Status ?? data.status ?? 1, 
                c_pol: data.c_pol ?? data.C_pol ?? 0,
                n_pol: data.n_pol ?? data.N_pol ?? 0,
                PGP: data.PGP ?? data.pgp ?? 0,
                PRP: data.PRP ?? data.prp ?? 0,
                products: mappedProducts
            };
            
            console.log('Загруженная заявка (после маппинга):', mappedOrder); 
            return mappedOrder;
        } catch (err: any) {
            return rejectWithValue('Заявка не найдена');
        }
    }
);

// --- 3. Сохранение (Обновление полей) ---
export const updateOrderFields = createAsyncThunk(
    'diet/updateFields',
    async ({ id, data }: { id: number; data: DsDietUpdateRequest }, { rejectWithValue }) => {
        try {
            const payload = {
                c_pol: data.c_pol,
                n_pol: data.n_pol,
            };            
            // @ts-ignore
            await api.diet.dietUpdate(id, payload);
            return data;
        } catch (err: any) {
            return rejectWithValue('Ошибка сохранения');
        }
    }
);

// --- 4. Обновление описания продукта (М-М связь) ---
export const updateProductDescription = createAsyncThunk(
    'diet/updateProductDesc',
    async ({ orderId, productId, desc }: { orderId: number; productId: number; desc: string }, { rejectWithValue }) => {
        try {
            const data: DsProductToDietUpdateRequest = { description: desc };
            await api.diet.productsUpdate(orderId, productId, data);
            return { productId, desc };
        } catch (err) {
            return rejectWithValue('Не удалось обновить описание');
        }
    }
);

// --- 5. Удаление продукта из заявки ---
export const removeProductFromOrder = createAsyncThunk(
    'diet/removeProduct',
    async ({ orderId, productId }: { orderId: number; productId: number }, { rejectWithValue }) => {
        try {
            await api.diet.productsDelete(orderId, productId);
            return productId;
        } catch (err) {
            return rejectWithValue('Ошибка удаления продукта');
        }
    }
);

// --- 6. Сформировать заявку (Отправить) ---
export const submitOrder = createAsyncThunk(
    'diet/submit',
    async (id: number, { getState, rejectWithValue }) => {
        try {
            // Получаем текущую заявку из состояния
            const state = getState() as { diet: DietState };
            const currentOrder = state.diet.currentOrder;
            
            if (!currentOrder) {
                return rejectWithValue('Заявка не найдена');
            }
            
            // Проверяем, что обязательные поля заполнены
            if (currentOrder.c_pol === undefined || currentOrder.n_pol === undefined) {
                return rejectWithValue('Заполните поля C_pol и N_pol');
            }
            
            // 1. Сначала обновляем заявку с текущими значениями
            const updateData: DsDietUpdateRequest = {
                c_pol: currentOrder.c_pol || 0,
                n_pol: currentOrder.n_pol || 0,
            };
            
            console.log('Обновление заявки перед формированием:', updateData);
            await api.diet.dietUpdate(id, updateData);
            
            // 2. Затем формируем заявку
            console.log('Формирование заявки...');
            await api.diet.formUpdate(id);
            
            return id;
        } catch (err: any) {
            console.error('Ошибка при формировании заявки:', err);
            
            // Анализируем ошибку
            const errorMsg = err.response?.data?.description || err.message || 'Неизвестная ошибка';
            
            if (errorMsg.includes('pgp and prp are required')) {
                // Если сервер все еще требует pgp и prp, это ошибка бэкенда
                // Пробуем временное решение: обновить с нулевыми pgp/prp
                try {
                    console.log('Попытка временного решения...');
                    
                    const state = getState() as { diet: DietState };
                    const currentOrder = state.diet.currentOrder;
                    
                    if (currentOrder) {
                        // Временное решение: используем any чтобы обойти проверку типов
                        const tempPayload: any = {
                            c_pol: currentOrder.c_pol || 0,
                            n_pol: currentOrder.n_pol || 0,
                            pgp: 0,    // временное значение
                            prp: 0     // временное значение
                        };
                        
                        await api.diet.dietUpdate(id, tempPayload);
                        await api.diet.formUpdate(id);
                        return id;
                    }
                } catch (tempErr) {
                    // Если временное решение не сработало
                    return rejectWithValue('Ошибка: сервер требует PGP и PRP. Обратитесь к администратору.');
                }
            }
            
            return rejectWithValue(errorMsg);
        }
    }
);

// --- 7. Удалить заявку ---
export const deleteOrder = createAsyncThunk(
    'diet/delete',
    async (id: number, { rejectWithValue }) => {
        try {
            await api.diet.dietDelete(id);
            return id;
        } catch (err) {
            return rejectWithValue('Ошибка удаления');
        }
    }
);

// --- 8. Решение заявки (модератор: принять/отклонить) ---
export const resolveOrder = createAsyncThunk(
    'diet/resolve',
    async ({ id, action }: { id: number; action: 'complete' | 'reject' }, { rejectWithValue }) => {
        try {
            await api.diet.resolveUpdate(id, { action });
            return { id, action };
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.description || 'Ошибка при обработке заявки');
        }
    }
);

const dietSlice = createSlice({
    name: 'diet',
    initialState,
    reducers: {
        resetOperationSuccess: (state) => {
            state.operationSuccess = false;
        },
        clearCurrentOrder: (state) => {
            state.currentOrder = null;
        },
        updateDietPGP: (state, action) => {
            // Update PGP in the list
            const { dietId, pgpValue } = action.payload;
            console.log(`[Redux] updateDietPGP: dietId=${dietId}, pgpValue=${pgpValue}, list.length=${state.list.length}`);
            const diet = state.list.find(d => d.id === dietId);
            if (diet) {
                console.log(`[Redux] Found diet ${dietId}, updating PGP to ${pgpValue}`);
                diet.pgp = pgpValue;
            } else {
                console.log(`[Redux] Diet ${dietId} not found in list. Available IDs:`, state.list.map(d => d.id));
            }
            // Also update current order if it matches
            if (state.currentOrder && state.currentOrder.id === dietId) {
                state.currentOrder.pgp = pgpValue;
            }
        }
    },
    extraReducers: (builder) => {
        builder
            // Список
            .addCase(fetchOrdersList.pending, (state) => { state.loading = true; })
            .addCase(fetchOrdersList.fulfilled, (state, action) => {
                state.loading = false;
                state.list = action.payload || []; 
})
            // Детали
            .addCase(fetchOrderById.pending, (state) => { state.loading = true; state.currentOrder = null; })
            .addCase(fetchOrderById.fulfilled, (state, action) => {
                state.loading = false;
                state.currentOrder = action.payload;
            })
            // Обновление полей (локально обновляем стейт)
            .addCase(updateOrderFields.fulfilled, (state, action) => {
                if (state.currentOrder) {
                    state.currentOrder = { ...state.currentOrder, ...action.payload };
                }
            })
            // Обновление описания продукта
            .addCase(updateProductDescription.fulfilled, (state, action) => {
                if (state.currentOrder && state.currentOrder.products) {
                    const product = state.currentOrder.products.find(f => f.product_id === action.payload.productId);
                    if (product) product.description = action.payload.desc;
                }
            })
            // Удаление продукта
            .addCase(removeProductFromOrder.fulfilled, (state, action) => {
                if (state.currentOrder && state.currentOrder.products) {
                    state.currentOrder.products = state.currentOrder.products.filter(f => f.product_id !== action.payload);
                }
            })
            // Сформировать / Удалить / Решить (успех)
            .addCase(submitOrder.fulfilled, (state) => { state.operationSuccess = true; })
            .addCase(deleteOrder.fulfilled, (state) => { state.operationSuccess = true; })
            .addCase(resolveOrder.fulfilled, (state) => { state.operationSuccess = true; })
            // Сброс
            .addCase(logoutUser.fulfilled, () => initialState);
    }
});

export const { resetOperationSuccess, clearCurrentOrder, updateDietPGP } = dietSlice.actions;
export default dietSlice.reducer;