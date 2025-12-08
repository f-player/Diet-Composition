import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Spinner, Row, Col, Button } from 'react-bootstrap';
import { DefaultImage } from '../components/ProductCard';
import { CustomBreadcrumbs } from '../components/Breadcrumbs';
import { useSelector, useDispatch } from 'react-redux';
import { fetchProductById, clearCurrentProduct } from '../store/slices/productsSlice';
import { getImageUrl } from '../utils/imageUrl';
import type { RootState, AppDispatch } from '../store';
import './styles/ProductDetailPage.css';



export const ProductDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const dispatch = useDispatch<AppDispatch>();
    const { currentProduct: product, loading } = useSelector((state: RootState) => state.products);
    const displayImage = getImageUrl(product?.image);

    useEffect(() => {
        if (id) {
            dispatch(fetchProductById(id));
        }
        return () => {
            dispatch(clearCurrentProduct());
        };
    }, [id, dispatch]);

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
                <h2>Продукт не найден</h2>
                <Link to="/products">
                    <Button variant="outline-danger" className="mt-3">Вернуться к списку</Button>
                </Link>
            </Container>
        );
    }

    const breadcrumbs = [
        { label: 'Продукты', path: '/products' },
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
                        <div className="product-text">
                            <p>{product.text}</p>
                        </div>                
                    </Col>
                </Row>
            </div>
        </div>
    );
};