import { AppNavbar } from '../components/Navbar';
import { useState, useEffect } from 'react';
import './styles/DietHomePage.css';

export const HomePage = () => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    
    // Массив фоновых изображений
    const backgroundImages = [
        'background/one.webp',
        'background/two.webp', 
        'background/three.webp',
        'background/four.webp',
    ];

    // Автопереключение карусели
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex((prevIndex) => 
                prevIndex === backgroundImages.length - 1 ? 0 : prevIndex + 1
            );
        }, 5000); // Смена каждые 5 секунд

        return () => clearInterval(interval);
    }, [backgroundImages.length]);


    return (
        <div className="homepage-wrapper">
            <AppNavbar />

            <div className="home-page-container">
                {/* Карусель фоновых изображений */}
                <div className="carousel-background">
                    {backgroundImages.map((image, index) => (
                        <div
                            key={index}
                            className={`carousel-slide ${index === currentImageIndex ? 'active' : ''}`}
                            style={{ backgroundImage: `url(${image})` }}
                        />
                    ))}
                </div>

                {/* Контент поверх карусели */}
                <div className="home-page-content">
                    <h1>Добро пожаловать в Калькулятор Состава Диеты!</h1>
                    <p className="lead fs-4">Этот сервис предназначен для восстановления рациона питания человека на основе изотопного анализа.</p>
                </div>

            </div>
        </div>
    );
};