import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { AppNavbar } from './components/Navbar';
import { HomePage } from './pages/DietHomePage';
import { ProductsListPage } from './pages/ProductsListPage';
import { ProductDetailPage } from './pages/ProductDetailPage';

const MainLayout = () => (
    <>
        <AppNavbar />
        <main className="main-content">
            <Outlet />
        </main>
    </>
);
const appBaseName = import.meta.env.BASE_URL === '/' ? '' : import.meta.env.BASE_URL;
function App() {
    return (
       <BrowserRouter basename={appBaseName}> 
            <Routes>
                <Route element={<MainLayout />}>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/products" element={<ProductsListPage />} />
                    <Route path="/products/:id" element={<ProductDetailPage />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;