import React, { useEffect, useState } from 'react';
import { Container, Table, Button, Form, Row, Col, Image, Modal, Toast, ToastContainer } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../store/slices/productsSlice';
import { api } from '../api';
import type { RootState, AppDispatch } from '../store';

export const ServicesEditor = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { items: products, loading } = useSelector((state: RootState) => state.products);

  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState<any>(null);
  const [file, setFile] = useState<File | null>(null);
  const [toast, setToast] = useState<{ show: boolean; message: string; variant?: string }>({ show: false, message: '', variant: 'success' });

  useEffect(() => {
    dispatch(fetchProducts(''));
  }, [dispatch]);

  const handleDelete = async (id?: number) => {
    if (!id) return;
    if (!confirm('Удалить продукт?')) return;
    try {
      await api.products.productsDelete(id);
      dispatch(fetchProducts(''));
    } catch (err) {
      alert('Ошибка удаления');
    }
  };

  const openCreate = () => {
    setEditProduct({ title: '', text: '', c_pol: 0, n_pol: 0 });
    setShowModal(true);
  };

  const openEdit = (p: any) => {
    setEditProduct({ ...p });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!editProduct) return;
    // simple validation
    if (!editProduct.title || editProduct.title.trim() === '') {
      setToast({ show: true, message: 'Название обязательно', variant: 'danger' });
      return;
    }
    try {
      if (editProduct.id) {
        await api.products.productsUpdate(editProduct.id, {
          title: editProduct.title,
          text: editProduct.text,
          c_pol: editProduct.c_pol,
          n_pol: editProduct.n_pol
        });
      } else {
        const resp = await api.products.productsCreate({
          title: editProduct.title,
          text: editProduct.text,
          c_pol: editProduct.c_pol,
          n_pol: editProduct.n_pol
        });
        // if created, set id for subsequent image upload
        if (resp && resp.data && resp.data.id) {
          editProduct.id = resp.data.id;
        }
      }

      if (file && editProduct.id) {
        // api.imageCreate expects { file: File }
        await api.products.imageCreate(editProduct.id, { file });
      }

      setShowModal(false);
      setEditProduct(null);
      setFile(null);
      dispatch(fetchProducts(''));
      setToast({ show: true, message: 'Услуга успешно сохранена', variant: 'success' });
    } catch (err) {
      setToast({ show: true, message: 'Ошибка сохранения', variant: 'danger' });
    }
  };

  return (
    <Container className="pt-5 mt-5">
      <Row className="mb-3 align-items-center">
        <Col><h3>Редактор услуг</h3></Col>
        <Col className="text-end"><Button variant="danger" onClick={openCreate}>Добавить услугу</Button></Col>
      </Row>

      <Table hover>
        <thead>
          <tr>
            <th>ID</th>
            <th>Название</th>
            <th>Изображение</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {products.map(p => (
            <tr key={p.id}>
              <td>{p.id}</td>
              <td>{p.title}</td>
              <td>{p.image ? <Image src={p.image} width={80} thumbnail /> : <span className="text-muted">нет</span>}</td>
              <td>
                <Button size="sm" variant="outline-primary" onClick={() => openEdit(p)}>Ред.</Button>{' '}
                <Button size="sm" variant="outline-danger" onClick={() => handleDelete(p.id)}>Удал.</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton><Modal.Title>Услуга</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-2">
              <Form.Label>Название</Form.Label>
              <Form.Control value={editProduct?.title || ''} onChange={(e) => setEditProduct({...editProduct, title: e.target.value})} />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Описание</Form.Label>
              <Form.Control as="textarea" rows={3} value={editProduct?.text || ''} onChange={(e) => setEditProduct({...editProduct, text: e.target.value})} />
            </Form.Group>
            <Row>
              <Col>
                <Form.Group className="mb-2">
                  <Form.Label>C_pol</Form.Label>
                  <Form.Control type="number" value={editProduct?.c_pol || 0} onChange={(e) => setEditProduct({...editProduct, c_pol: parseFloat(e.target.value)})} />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group className="mb-2">
                  <Form.Label>N_pol</Form.Label>
                  <Form.Control type="number" value={editProduct?.n_pol || 0} onChange={(e) => setEditProduct({...editProduct, n_pol: parseFloat(e.target.value)})} />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-2">
              <Form.Label>Изображение (заменит старое)</Form.Label>
              <Form.Control type="file" onChange={(e: any) => setFile(e.target.files?.[0] || null)} />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Отмена</Button>
          <Button variant="danger" onClick={handleSave}>Сохранить</Button>
        </Modal.Footer>
      </Modal>
      <ToastContainer position="top-end" className="p-3">
        <Toast onClose={() => setToast({ ...toast, show: false })} show={toast.show} bg={toast.variant} delay={3000} autohide>
          <Toast.Body className={toast.variant === 'danger' ? 'text-white' : ''}>{toast.message}</Toast.Body>
        </Toast>
      </ToastContainer>
    </Container>
  );
};

export default ServicesEditor;
