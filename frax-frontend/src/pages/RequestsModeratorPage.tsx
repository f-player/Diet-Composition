import React, { useEffect, useState, useRef } from 'react';
import { Container, Table, Button, Form, Row, Col, Badge } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrdersList, resolveOrder } from '../store/slices/dietSlice';
import type { AppDispatch, RootState } from '../store';

export const RequestsModeratorPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { list } = useSelector((state: RootState) => state.diet);

  const [filters, setFilters] = useState({ status: 'all', from: '', to: '' });
  const [creatorFilter, setCreatorFilter] = useState('');
  const intervalRef = useRef<any>(null);

  useEffect(() => {
    // initial load
    dispatch(fetchOrdersList(filters));
    // short polling every 5 seconds
    intervalRef.current = setInterval(() => {
      dispatch(fetchOrdersList(filters));
    }, 5000);
    return () => { clearInterval(intervalRef.current); };
  }, [dispatch, filters]);

  const handleResolve = async (id?: number) => {
    if (!id) return;
    if (!confirm('Завершить заявку?')) return;
    await dispatch(resolveOrder({ id, action: 'complete' }));
    dispatch(fetchOrdersList(filters));
  };

  const handleReject = async (id?: number) => {
    if (!id) return;
    if (!confirm('Отклонить заявку?')) return;
    await dispatch(resolveOrder({ id, action: 'reject' }));
    dispatch(fetchOrdersList(filters));
  };

  const handleFilterChange = (e: any) => setFilters({ ...filters, [e.target.name]: e.target.value });

  const statusBadge = (s?: number) => {
    switch (s) {
      case 1: return <Badge bg="secondary">Черновик</Badge>;
      case 3: return <Badge bg="primary">В работе</Badge>;
      case 4: return <Badge bg="success">Завершена</Badge>;
      case 5: return <Badge bg="danger">Отклонена</Badge>;
      default: return <Badge bg="light" text="dark">Неизвестно</Badge>;
    }
  };

  return (
    <Container className="pt-5 mt-5">
      <h3 className="mb-3">Список заявок (модератор)</h3>
      <Form className="mb-3">
        <Row>
          <Col md={2}>
            <Form.Select name="status" value={filters.status} onChange={handleFilterChange}>
              <option value="all">Любой статус</option>
              <option value="3">В работе</option>
              <option value="4">Завершена</option>
              <option value="5">Отклонена</option>
            </Form.Select>
          </Col>
          <Col md={2}><Form.Control type="date" name="from" value={filters.from} onChange={handleFilterChange} /></Col>
          <Col md={2}><Form.Control type="date" name="to" value={filters.to} onChange={handleFilterChange} /></Col>
          <Col md={3}><Form.Control placeholder="Фильтр по создателю (id или логин)" value={creatorFilter} onChange={(e) => setCreatorFilter(e.target.value)} /></Col>
          <Col md={1}><Button onClick={() => dispatch(fetchOrdersList(filters))}>Применить</Button></Col>
        </Row>
      </Form>

      <div className="table-responsive">
        <Table hover>
          <thead>
            <tr>
              <th>#</th>
              <th>Статус</th>
              <th>Создана</th>
              <th>Оформлена</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {(list || []).filter(o => {
              if (!creatorFilter) return true;
              try {
                const c = (o.creator_login || '').toString();
                return c.includes(creatorFilter);
              } catch (e) {
                return true;
              }
            }).map(o => (
              <tr key={o.id}>
                <td>{o.id}</td>
                <td>{statusBadge(o.status)}</td>
                <td>{o.creation_date ? new Date(o.creation_date).toLocaleString() : '—'}</td>
                <td>{o.forming_date ? new Date(o.forming_date).toLocaleString() : '—'}</td>
                <td>
                  <Button size="sm" variant="success" onClick={() => handleResolve(o.id)}>Завершить</Button>{' '}
                  <Button size="sm" variant="danger" onClick={() => handleReject(o.id)}>Отклонить</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </Container>
  );
};

export default RequestsModeratorPage;
