import React, { useEffect, useState, useRef } from 'react';
import { Container, Table, Button, Form, Row, Col, Badge, Spinner } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrdersList, resolveOrder, updateDietPGP } from '../store/slices/dietSlice';
import type { AppDispatch, RootState } from '../store';
import { toast } from 'react-toastify';

export const RequestsModeratorPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { list } = useSelector((state: RootState) => state.diet);

  const [filters, setFilters] = useState({ status: 'all', from: '', to: '' });
  const [creatorFilter, setCreatorFilter] = useState('');
  const [loadingCalcId, setLoadingCalcId] = useState<number | null>(null);
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

  const handleStartAsyncCalculation = async (dietId?: number) => {
    if (!dietId) return;
    
    setLoadingCalcId(dietId);
    try {
      const response = await fetch('http://localhost:8001/calculate/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ diet_id: dietId })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      toast.info(`⏳ Расчет запущен для заявки ${dietId}. Ожидание 5-7 сек...`);
      
      // After 8 seconds, force refresh the entire list
      setTimeout(() => {
        console.log(`[Timer] 8 sec elapsed, refreshing data for diet ${dietId}`);
        
        // Also try to fetch directly to verify data was updated
        const token = localStorage.getItem('authToken');
        fetch(`http://localhost:8090/api/diet/${dietId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
          .then(r => r.json())
          .then(data => {
            console.log(`[Direct fetch] Diet ${dietId}:`, data);
            // Try both pgp and PGP (case-insensitive)
            const pgpValue = data.pgp ?? data.PGP;
            console.log(`[Direct fetch] pgpValue = ${pgpValue}, type = ${typeof pgpValue}`);
            if (pgpValue !== undefined && pgpValue !== null) {
              // Update Redux store directly with the PGP value
              console.log(`[Before dispatch] Dispatching updateDietPGP with dietId=${dietId}, pgpValue=${pgpValue}`);
              dispatch(updateDietPGP({ dietId, pgpValue }));
              console.log(`[After dispatch] updateDietPGP dispatched`);
              toast.success(`✅ Расчет завершен! PGP = ${pgpValue.toFixed(2)}`);
            } else {
              console.log(`[Direct fetch] PGP is falsy: ${pgpValue}`);
            }
          })
          .catch(err => {
            console.error('Direct fetch error:', err);
            // Fallback: refresh the entire list
            dispatch(fetchOrdersList(filters));
          })
          .finally(() => {
            setLoadingCalcId(null);
          });
      }, 8000);
      
    } catch (error) {
      console.error('Error starting async calculation:', error);
      toast.error(`❌ Ошибка при запуске расчета: ${error}`);
      setLoadingCalcId(null);
    }
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
              <th>PGP</th>
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
                  {o.pgp !== null && o.pgp !== undefined ? (
                    <Badge bg="success">{o.pgp.toFixed(2)}</Badge>
                  ) : (
                    <Badge bg="secondary">—</Badge>
                  )}
                </td>
                <td>
                  <div className="d-flex gap-1 flex-wrap">
                    <Button 
                      size="sm" 
                      variant="info" 
                      onClick={() => handleStartAsyncCalculation(o.id)}
                      disabled={loadingCalcId === o.id}
                    >
                      {loadingCalcId === o.id ? (
                        <>
                          <Spinner size="sm" className="me-2" /> Расчет...
                        </>
                      ) : (
                        '🧮 Расчет'
                      )}
                    </Button>
                    <Button size="sm" variant="success" onClick={() => handleResolve(o.id)}>Завершить</Button>{' '}
                    <Button size="sm" variant="danger" onClick={() => handleReject(o.id)}>Отклонить</Button>
                  </div>
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
