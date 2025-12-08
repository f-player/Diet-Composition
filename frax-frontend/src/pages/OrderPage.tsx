import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Image } from 'react-bootstrap';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
    fetchOrderById, 
    updateOrderFields, 
    updateProductDescription, 
    removeProductFromOrder,
    submitOrder,
    deleteOrder,
    resolveOrder,
    resetOperationSuccess,
    clearCurrentOrder
} from '../store/slices/dietSlice';
import { Trash, CheckCircleFill, ExclamationCircle } from 'react-bootstrap-icons';
import { getImageUrl } from '../utils/imageUrl';
import type { AppDispatch, RootState } from '../store';



export const DefaultImage = '/mock_images/default.png';

const STATUS_DRAFT = 1;
const STATUS_FORMED = 3;
const STATUS_COMPLETED = 4;
const STATUS_REJECTED = 5;

export const OrderPage = () => {
    const { id } = useParams<{ id: string }>();
    const dispatch = useDispatch<AppDispatch>();
    const { currentOrder, loading, operationSuccess } = useSelector((state: RootState) => state.diet);
    const { user } = useSelector((state: RootState) => state.user);
    const [formData, setFormData] = useState({ 
        c_pol: 0, 
        n_pol: 0,
    });
const [descriptions, setDescriptions] = useState<{[key: number]: string}>({});

    useEffect(() => {
        if (id) {
            dispatch(fetchOrderById(id));
        }
        return () => { dispatch(clearCurrentOrder()); dispatch(resetOperationSuccess()); }
    }, [id, dispatch]);

    useEffect(() => {
        if (currentOrder) {
            setFormData({
                c_pol: currentOrder.c_pol || 0,
                n_pol: currentOrder.n_pol || 0
            });
            const descMap: {[key: number]: string} = {};
            currentOrder.products?.forEach(f => {
                if(f.product_id) descMap[f.product_id] = f.description || '';
            });
            setDescriptions(descMap);
        }
    }, [currentOrder]);

    if (operationSuccess) {
        return (
            <Container className="mt-5 pt-5 text-center">
                <Card className="p-5 shadow-sm border-0">
                    <h2 className="text-dark mb-3">Действие выполнено успешно!</h2>
                    <p className="text-muted">Заявка была сформирована/удалена.</p>
                    <div className="d-flex justify-content-center gap-3">
                        <Link to="/products"><Button variant="outline-danger">К продуктам</Button></Link>
                        <Link to="/orders"><Button variant="danger">К списку заявок</Button></Link>
                    </div>
                </Card>
            </Container>
        );
    }

    if (loading || !currentOrder) return <Container className="pt-5"><p>Загрузка...</p></Container>;

    const isDraft = currentOrder.status === STATUS_DRAFT;
    const isCompleted = currentOrder.status === STATUS_COMPLETED;
    const isRejected = currentOrder.status === STATUS_REJECTED;
    const isFormed = currentOrder.status === STATUS_FORMED;
    const isModerator = user?.moderator === true;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.type === 'number' ? parseFloat(e.target.value) : e.target.value;
        setFormData(prev => ({ ...prev, [e.target.name]: val }));
    };

    const handleSaveMain = () => {
        if(currentOrder?.id) {
            console.log("Отправка данных:", formData);
            
            // Создаем объект с обязательными полями c_pol и n_pol
            const updateData = {
                c_pol: formData.c_pol || 0,
                n_pol: formData.n_pol || 0,
            };
            
            dispatch(updateOrderFields({ 
                id: currentOrder.id, 
                data: updateData 
            }))
            .unwrap()
            .then(() => alert("Данные успешно сохранены в БД!"))
            .catch((err) => {
                console.error("Ошибка сохранения:", err);
                alert(`Ошибка при сохранении: ${err.message || 'Неизвестная ошибка'}`);
            });
        }
    };

    const handleDescBlur = (productId: number) => {
        if(currentOrder.id && descriptions[productId] !== undefined) {
            dispatch(updateProductDescription({
                orderId: currentOrder.id,
                productId,
                desc: descriptions[productId]
            }));
        }
    };

    return (
        <Container className="pt-5 mt-5 pb-5">
            <Card className="border-0 shadow-sm mb-4">
                <Card.Body className="text-center py-2">
                    <h4 className="fw-bold m-0">Составление заявки</h4>
                </Card.Body>
            </Card>

            <Row className="mb-4 g-4">
                <Col md={6}>
                    <Card className="h-100 border-0 shadow-sm" style={{ backgroundColor: '#f8f9fa' }}>
                        <Card.Body>
                            <h5 className="fw-bold mb-3">Введите данные в анкету</h5>
                            <Form>
                                <Form.Group as={Row} className="mb-2 align-items-center">
                                    <Form.Label column sm={4}>C_pol (δ¹³C)</Form.Label>
                                    <Col sm={8}>
                                        <Form.Control 
                                            type="number" 
                                            name="c_pol" 
                                            value={formData.c_pol} 
                                            onChange={handleInputChange} 
                                            disabled={!isDraft}
                                            step="0.01"
                                        />
                                    </Col>
                                </Form.Group>
                                <Form.Group as={Row} className="mb-2 align-items-center">
                                    <Form.Label column sm={4}>N_pol (δ¹⁵N)</Form.Label>
                                    <Col sm={8}>
                                        <Form.Control 
                                            type="number" 
                                            name="n_pol" 
                                            value={formData.n_pol} 
                                            onChange={handleInputChange} 
                                            disabled={!isDraft}
                                            step="0.01"
                                        />
                                    </Col>
                                </Form.Group>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>

                 {/* Правая колонка: Результат */}
                <Col md={6}>
                    <Card className="h-100 border-0 shadow-sm" style={{ backgroundColor: '#f8f9fa' }}>
                        <Card.Body>
                            <h5 className="fw-bold mb-3">Результат</h5>
                            
                            {/* Если ЗАВЕРШЕНА (4) */}
                            {isCompleted && (
                                <div>
                                    <div className="mb-3">
                                        <strong>Процентное соотношение животной пищи</strong>
                                        <div className="fs-4 text-success">{currentOrder.PGP?.toFixed(1)}%</div>
                                    </div>
                                    <div>
                                        <strong>Процентное соотношение растительной пищи</strong>
                                        <div className="fs-4 text-success">{currentOrder.PRP?.toFixed(1)}%</div>
                                    </div>
                                </div>
                            )}

                            {isRejected && (
                                <div className="text-center py-4">
                                    <ExclamationCircle size={48} className="text-danger mb-3" />
                                    <h5 className="text-danger fw-bold">Заявка отклонена</h5>
                                    <p className="text-muted">
                                        К сожалению, модератор отклонил вашу заявку. 
                                        <br />
                                        Возможно, данные были заполнены некорректно или нарушают правила сервиса.
                                        <br />
                                        Пожалуйста, создайте новую заявку или свяжитесь с поддержкой.
                                    </p>
                                </div>
                            )}

                            {!isCompleted && !isRejected && (
                                <div className="text-muted d-flex align-items-center h-75">
                                    <i>Результат будет доступен после обработки заявки модератором.</i>
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <div className="d-flex flex-column gap-3 mb-5">
                {currentOrder.products?.map((f) => (
                    <Card key={f.product_id} className="border-0 shadow-sm">
                        <Card.Body className="p-0">
                            <Row className="g-0">
                                <Col md={4} className="d-flex align-items-center p-3 border-end">
                                    <div className="me-3" style={{ width: 60 }}>
                                        <Image src={getImageUrl(f.image)} fluid rounded />
                                    </div>
                                    <div className="flex-grow-1">
                                        <h6 className="fw-bold mb-2">{f.title}</h6>
                                        <Link to={`/products/${f.product_id}`}>
                                            <Button size="sm" variant="danger">Подробнее</Button>
                                        </Link>
                                    </div>
                                    {isDraft && (
                                        <Button 
                                            variant="link" className="text-muted p-0 ms-2"
                                            onClick={() => dispatch(removeProductFromOrder({ orderId: currentOrder.id!, productId: f.product_id! }))}
                                        >
                                            <Trash size={20} />
                                        </Button>
                                    )}
                                </Col>

                                <Col md={8} className="p-3 bg-light">
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        placeholder="Дополнительная информация..."
                                        value={descriptions[f.product_id!] || ''}
                                        onChange={(e) => setDescriptions(prev => ({ ...prev, [f.product_id!]: e.target.value }))}
                                        onBlur={() => handleDescBlur(f.product_id!)}
                                        disabled={!isDraft}
                                        className="border-0 bg-white"
                                        style={{ resize: 'none' }}
                                    />
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                ))}
            </div>

            {isDraft && (
                <Row>
                    <Col className="d-flex gap-2">
                        <Button variant="outline-success" onClick={handleSaveMain}>Сохранить изменения</Button>
                        <Button variant="outline-danger" onClick={() => {
                            if(window.confirm('Удалить заявку?')) dispatch(deleteOrder(currentOrder.id!));
                        }}>Удалить заявку</Button>
                    </Col>
                    <Col className="text-end">
                         <Button variant="outline-success" size="lg" onClick={() => dispatch(submitOrder(currentOrder.id!))}>
                            Сформировать <CheckCircleFill className="ms-2"/>
                        </Button>
                    </Col>
                </Row>
            )}

            {isFormed && isModerator && (
                <Row>
                    <Col className="d-flex gap-2 justify-content-end">
                        <Button 
                            variant="success" 
                            size="lg"
                            onClick={() => {
                                if(window.confirm('Принять заявку?')) {
                                    dispatch(resolveOrder({ id: currentOrder.id!, action: 'complete' }))
                                        .unwrap()
                                        .catch((err) => alert(`Ошибка: ${err}`));
                                }
                            }}
                        >
                            Принять ✓
                        </Button>
                        <Button 
                            variant="danger" 
                            size="lg"
                            onClick={() => {
                                if(window.confirm('Отклонить заявку?')) {
                                    dispatch(resolveOrder({ id: currentOrder.id!, action: 'reject' }))
                                        .unwrap()
                                        .catch((err) => alert(`Ошибка: ${err}`));
                                }
                            }}
                        >
                            Отклонить ✗
                        </Button>
                    </Col>
                </Row>
            )}
        </Container>
    );
};