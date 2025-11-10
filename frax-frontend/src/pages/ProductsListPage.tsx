import { useState, useEffect } from 'react';
import { Container, Row, Col, Spinner, Form, Badge, Image, Button } from 'react-bootstrap'; // 1. Добавляем Button
import { ProductCard } from '../components/ProductCard';
import { getProducts, getCartBadge} from '../api/productsApi';
import type { IProduct, ICartBadge} from '../types';
import './styles/ProductsListPage.css';
import { useSelector, useDispatch } from 'react-redux';
import { setSearchTerm, selectSearchTerm } from '../store/slices/filterSlice';
import type { AppDispatch } from '../store';

const cartImage = `mock_images/cart.png`;

export const ProductsListPage = () => {
    const [products, setProducts] = useState<IProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [cartBadge, setCartBadge] = useState<ICartBadge>({ diet_id: null, count: 0 });
    const dispatch = useDispatch<AppDispatch>();
    const searchTerm = useSelector(selectSearchTerm);

    const fetchProducts = (filterTitle: string) => {
        setLoading(true);
        getProducts(filterTitle)
            .then(data => {
                if (Array.isArray(data.items)) {
                    setProducts(data.items);
                } else {
                    console.error("Получены неверные данные:", data);
                    setProducts([]);
                }
            })
            .finally(() => setLoading(false));
        };

    useEffect(() => {
        fetchProducts(searchTerm);

        getCartBadge().then(cartData => {
            setCartBadge(cartData);
        });
    }, []);

    const handleSearchSubmit = (event: React.FormEvent) => {
        event.preventDefault(); 
        fetchProducts(searchTerm);
    };

    const isCartActive = cartBadge.count > 0 && cartBadge.diet_id !== null;

    return (
        <Container fluid className="pt-5 mt-4"> 
            <h1 className="text-center fs-3 fw-bold">Products</h1>
            <hr className="products-header-line" />

            <Form onSubmit={handleSearchSubmit}>
                <Row className="justify-content-center mb-4">
                    <Col xs={12} md={10} lg={8}>
                        <div className="search-and-cart-wrapper">
                                <Form.Control
                                    type="search"
                                    placeholder="Enter the product name to search for..."
                                    value={searchTerm}
                                    onChange={(e) => dispatch(setSearchTerm(e.target.value))}
                                />
                            <Button variant="danger" type="submit" disabled={loading}>
                                {loading ? 'Search...' : 'Search'}
                            </Button>
                            <div className="cart-wrapper">
                                {isCartActive ? (                               
                                    <a 
                                        href="#" 
                                        onClick={(e) => {
                                            e.preventDefault();
                                            alert(`Go to the application page (ID: ${cartBadge.diet_id}) will be implemented.`);
                                        }}
                                        title="Go to the application"
                                    >
                                        <Image src={cartImage} alt="Basket" width={32} />
                                    </a>
                                ) : (                                  
                                    <div style={{ cursor: 'not-allowed' }}>
                                        <Image src={cartImage} alt="Basket" width={32} style={{ opacity: 0.5 }} />
                                    </div>
                                )}                               
                                {isCartActive && (
                                    <Badge pill bg="danger" className="cart-indicator">
                                        {cartBadge.count}
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