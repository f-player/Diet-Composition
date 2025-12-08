/**
 * Функция для преобразования URL картинок на HTTPS через nginx.
 * Картинки загружаются через nginx на HTTPS (порт 443) с того же хоста,
 * где загружается фронтенд.
 */
export const getImageUrl = (imageUrl?: string | null): string => {
    // Если нет URL, возвращаем дефолтное изображение
    if (!imageUrl) {
        return '/mock_images/default.png';
    }

    // Если это локальный путь (начинается с /), возвращаем как есть
    if (imageUrl.startsWith('/')) {
        return imageUrl;
    }

    // Если это уже полный URL (http:// или https://), возвращаем как есть
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
        return imageUrl;
    }

    // Для всех остальных случаев (относительные пути) строим URL через nginx
    // nginx слушает на портах 80 (HTTP redirect) и 443 (HTTPS)
    const currentProtocol = window.location.protocol; // https: или http:
    const currentHostname = window.location.hostname;
    
    // Если текущая страница по HTTPS — используем HTTPS и порт 443 (стандартный)
    // Если текущая страница по HTTP — используем HTTP и порт 80 (стандартный)
    let url = `${currentProtocol}//${currentHostname}`;
    
    // Добавляем явный порт только если он НЕ стандартный для протокола
    const currentPort = window.location.port;
    const isStandardHttpsPort = currentProtocol === 'https:' && !currentPort;
    const isStandardHttpPort = currentProtocol === 'http:' && !currentPort;
    
    if (!isStandardHttpsPort && !isStandardHttpPort && currentPort) {
        // Нестандартный порт (например, 3000 для dev) — добавляем его
        url += `:${currentPort}`;
    }

    // Добавляем путь к картинке
    url += `/${imageUrl}`;

    return url;
};
