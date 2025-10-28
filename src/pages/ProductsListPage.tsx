import { useState, useEffect } from 'react';
import { Container, Row, Col, Spinner, Form, Badge, Image, Button } from 'react-bootstrap'; // 1. Добавляем Button
import { ProductCard } from '../components/ProductCard';
import { getProducts } from '../api/productsApi';
import type { IProduct } from '../types';
import './styles/ProductsListPage.css'; 

export const ProductsListPage = () => {
    const [products, setProducts] = useState<IProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [cartCount, setCartCount] = useState(1);

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
        fetchProducts('');
    }, []);

    const handleSearchSubmit = (event: React.FormEvent) => {
        event.preventDefault(); 
        fetchProducts(searchTerm);
    };

    return (
        <Container fluid className="pt-5 mt-4"> 
            <h1 className="text-center fs-3 fw-bold">Продукты</h1>
            <hr className="products-header-line" />

            <Form onSubmit={handleSearchSubmit}>
                <Row className="justify-content-center mb-4">
                    <Col xs={12} md={10} lg={8}>
                        <div className="search-and-cart-wrapper">
                            <Form.Control
                                type="search"
                                placeholder="Введите название продукта для поиска..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <Button variant="danger" type="submit" disabled={loading}>
                                {loading ? 'Поиск...' : 'Искать'}
                            </Button>
                            <div className="cart-wrapper">
                                <Image src="http://127.0.0.1:9000/imagegroup/cart.png" alt="Корзина" width={32} />
                                {/* {cartCount > 0 && (
                                    <Badge pill bg="danger" className="cart-indicator">
                                        {cartCount}
                                    </Badge>
                                )} */}
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