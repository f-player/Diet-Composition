import { Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import type { IProduct } from '../types';
import './styles/ProductCard.css'

export const DefaultImage = 'http://localhost:9000/products/Images/default.png'

interface ProductCardProps {
    product: IProduct;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
    return (
        <div className="p-4 border rounded shadow-sm h-100 product-card">
            <Row className="align-items-center">
                <Col xs={4} md={3}>
                    <img
                        src={product.image || DefaultImage}
                        alt={product.title}
                        className="img-fluid"
                    />
                </Col>
                <Col xs={8} md={9}>
                    <div className="d-flex flex-column justify-content-between h-100">
                        <h5 className="fw-bold mb-3">{product.title}</h5>
                        <div className="d-flex gap-2">
                            <Link to={`/products/${product.id}`} className="text-decoration-none">
                                <Button className='all-btn' variant="danger">
                                    Подробнее
                                </Button>
                            </Link>
                            {/* <Button className='all-btn' variant="danger">
                                Добавить
                            </Button> */}
                        </div>
                    </div>
                </Col>
            </Row>
        </div>
    );
};