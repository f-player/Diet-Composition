// src/config.ts

// IP вашего Go бэкенда.
const BACKEND_IP = 'http://79.127.211.218:8080'; 
const MINIO_IP = 'http://79.127.211.218:9000';

// ЭКСПОРТИРУЕМ ФУНКЦИЮ
export const getApiBase = (): string => {
    // Проверяем наличие __TAURI__ прямо перед тем, как сделать запрос.
    // @ts-ignore: Игнорируем ошибку TypeScript, так как он не знает о __TAURI__
    const isTauri = !!window.__TAURI__;

    // Если мы в Tauri, возвращаем ПОЛНЫЙ ПУТЬ к бэкенду.
    // Если в браузере, возвращаем относительный путь для прокси.
    return isTauri ? `${BACKEND_IP}/api` : '/api';
};

// Аналогично для изображений
export const getImageBase = (): string => {
    // @ts-ignore
    const isTauri = !!window.__TAURI__;
    return isTauri ? `${MINIO_IP}/products` : '';
}