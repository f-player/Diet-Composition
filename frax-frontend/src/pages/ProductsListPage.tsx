import { useEffect } from 'react';
import { Container, Row, Col, Spinner, Form, Badge, Image, Button } from 'react-bootstrap';
import { ProductCard } from '../components/ProductCard';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom'; 
import { fetchProducts } from '../store/slices/productsSlice';
import { fetchCartBadge } from '../store/slices/cartSlice';
import { setSearchTerm } from '../store/slices/filterSlice';
import type { RootState, AppDispatch } from '../store';
import './styles/ProductsListPage.css';



export const ProductsListPage = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { items: products, loading } = useSelector((state: RootState) => state.products);
    const searchTerm = useSelector((state: RootState) => state.filter.searchTerm);
    const cartState = useSelector((state: RootState) => state.cart);
    const isCartActive = cartState.count > 0 && cartState.diet_id !== null;

    useEffect(() => {
        dispatch(fetchProducts(searchTerm));
        dispatch(fetchCartBadge());
    }, [dispatch]);

    const handleSearchSubmit = (event: React.FormEvent) => {
        event.preventDefault(); 
        dispatch(fetchProducts(searchTerm));
    };

    const handleCartClick = (e: React.MouseEvent) => {
        e.preventDefault();
        if (cartState.diet_id) {
            navigate(`/orders/${cartState.diet_id}`);
        }
    };

    return (
        <Container fluid className="pt-5 mt-5"> 
            <div className="mt-5 mb-4">
                <h1 className="text-center fs-2 fw-bold mb-4">Каталог продуктов</h1>
                <hr className="products-header-line mx-auto" />
            </div>

            <Form onSubmit={handleSearchSubmit}>
                <Row className="justify-content-center mb-4">
                    <Col xs={12} md={10} lg={8}>
                        <div className="search-and-cart-wrapper">
                            <Form.Control
                                type="search"
                                placeholder="Введите название продукта для поиска..."
                                value={searchTerm}
                                onChange={(e) => dispatch(setSearchTerm(e.target.value))}
                            />
                            <Button variant="danger" type="submit" disabled={loading}>
                                {loading ? 'Поиск...' : 'Искать'}
                            </Button>
                            
                            <div className="cart-wrapper">
                                {isCartActive ? (                               
                                    <a 
                                        href="#" 
                                        onClick={handleCartClick}
                                        title="Перейти к заявке"
                                    >
                                        <Image src="/mock_images/cart.png" alt="Корзина" width={32} />
                                    </a>
                                ) : (                                  
                                    <div style={{ cursor: 'not-allowed' }}>
                                        <Image src="/mock_images/cart.png" alt="Корзина" width={32} style={{ opacity: 0.5 }} />
                                    </div>
                                )}                               
                                {isCartActive && (
                                    <Badge pill bg="danger" className="cart-indicator">
                                        {cartState.count}
                                    </Badge>
                                )}
                            </div>                          
                        </div>
                    </Col>
                </Row>
            </Form>

            {loading ? (
                <div className="text-center"><Spinner animation="border" variant="danger" /></div>
            ) : (
                <Row className="justify-content-center">
                    <Col xs={12} lg={10}>
                        <Row xs={1} md={2} lg={3} className="g-4">
                            {products.map(product => (
                                <Col key={product.id}>
                                    <ProductCard product={product} />
                                </Col>
                            ))}
                        </Row>
                    </Col>
                </Row>
            )}
        </Container>
    );
};