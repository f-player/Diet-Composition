import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Spinner, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { getProductById } from '../api/productsApi';
import type { IProduct } from '../types';
import { DefaultImage } from '../components/ProductCard';
import {CustomBreadcrumbs} from '../components/Breadcrumbs'
import './styles/ProductDetailPage.css';

export const ProductDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const [product, setProduct] = useState<IProduct | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            setLoading(true);
            getProductById(id)
                .then(data => setProduct(data))
                .finally(() => setLoading(false));
        }
    }, [id]);

    const displayImage = product?.image || DefaultImage;

    if (loading) {
        return (
            <div className="product-detail-page">
                <Spinner animation="border" variant="danger" style={{ width: '3rem', height: '3rem' }} />
            </div>
        );
    }

    if (!product) {
        return (
            <Container className="mt-5 pt-5 text-center">
                <h2>Product not found</h2>
                <Link to="/products">
                    <Button variant="outline-danger" className="mt-3">Go back to the list</Button>
                </Link>
            </Container>
        );
    }

    const breadcrumbs = [
        { label: 'Products', path: '/products' },
        { label: product.title, active: true },
    ];

    return (
        <div className="product-detail-page">
           <div className="product-background" />
            <div className="product-content-card">
                 <div className="mb-4">
                    <CustomBreadcrumbs crumbs={breadcrumbs} />
                </div>
                <Row className="align-items-center g-5">
                    <Col lg={5}>
                        <div className="product-image-wrapper">
                            <img src={displayImage} alt={product.title} className="product-main-image" />
                        </div>
                    </Col>
                    <Col lg={7}>
                        <h1 className="display-5 product-title">{product.title}</h1>            
                        <Button className='all-btn mt-4 px-4 py-2' variant="danger" size="lg">
                            Add to the calculation
                        </Button>
                    </Col>
                </Row>
            </div>
        </div>
    );
};