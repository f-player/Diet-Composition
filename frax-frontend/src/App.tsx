import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AppNavbar } from './components/Navbar';
import { HomePage } from './pages/DietHomePage';
import { ProductsListPage } from './pages/ProductsListPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ProfilePage } from './pages/ProfilePage';
import { OrdersListPage } from './pages/OrdersListPage';
import { OrderPage } from './pages/OrderPage';
import ModeratorDashboard from './pages/ModeratorDashboard';
import ServicesEditor from './pages/ServicesEditor';
import RequestsModeratorPage from './pages/RequestsModeratorPage';
import Error403 from './pages/Error403';
import Error404 from './pages/Error404';
import RequireModerator from './components/RequireModerator';



const MainLayout = () => (
    <>
        <AppNavbar />
        <main>
            <Outlet />
        </main>
    </>
);

function App() {
    return (
        <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />      
        <Route path="/register" element={<RegisterPage />} />  
        <Route element={<MainLayout />}>
            <Route path="/products" element={<ProductsListPage />} />
            <Route path="/products/:id" element={<ProductDetailPage />} />
            <Route path="/profile" element={<ProfilePage />} /> 
            <Route path="/orders" element={<OrdersListPage />} />
            <Route path="/orders/:id" element={<OrderPage />} />
            {/* Moderator routes inside MainLayout so navbar is visible */}
            <Route path="/moderator" element={<RequireModerator><ModeratorDashboard /></RequireModerator>} />
            <Route path="/moderator/services" element={<RequireModerator><ServicesEditor /></RequireModerator>} />
            <Route path="/moderator/requests" element={<RequireModerator><RequestsModeratorPage /></RequireModerator>} />
        </Route>

                <Route path="/403" element={<Error403 />} />
                <Route path="*" element={<Error404 />} />
      </Routes>
      <ToastContainer position="bottom-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="light" />
    </BrowserRouter>
    );
}

export default App;