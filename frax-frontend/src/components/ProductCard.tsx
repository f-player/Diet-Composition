import { Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import type { IProduct } from '../types';
import './styles/ProductCard.css'

export const DefaultImage = `mock_images/default.webp`;

interface ProductCardProps {
    product: IProduct;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
    const imageSrc = product.image || DefaultImage;
    return (
        <div className="p-4 border rounded shadow-sm h-100 bg-light product-card">
            <Row className="align-items-center">
                <Col xs={4} md={3}>
                    <img
                        src={imageSrc}
                        alt={product.title}
                        className="img-fluid"
                    />
                </Col>
                <Col xs={8} md={9}>
                    <div className="d-flex flex-column justify-content-between h-100">
                        <h5 className="fw-bold mb-3">{product.title}</h5>
                        <div className="d-flex gap-2 flex-wrap">
                            <Link to={`/products/${product.id}`} className="text-decoration-none flex-fill">
                                <Button className='btn btn-danger w-100 text-center' variant="danger">
                                    Подробнее
                                </Button>
                            </Link>
                            <Button className='btn btn-danger flex-fill text-center' variant="danger">
                                Добавить
                            </Button>
                        </div>
                    </div>
                </Col>
            </Row>
        </div>
    );
};