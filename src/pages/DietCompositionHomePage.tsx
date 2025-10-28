import { AppNavbar } from '../components/Navbar';
import './styles/DietCompositionHomePage.css';

export const HomePage = () => {
    return (
        <div className="homepage-wrapper">
            <AppNavbar />

            <div className="home-page-container">
                <img 
                    src="/orig.webp" 
                    alt="Background" 
                    className="home-image-background"
                />

                <div className="home-page-content">
                    <h1>Добро пожаловать в DietComposition!</h1>
                    <p className="lead fs-4">Этот сервис предназначен для расчета реконструкции диеты по изотопному анализу (δ¹⁵N, δ¹³C).</p>
                </div>
            </div>
        </div>
    );
};