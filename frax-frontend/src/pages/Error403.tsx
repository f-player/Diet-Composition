import React from 'react';
import { Container, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

export const Error403 = () => (
  <Container className="pt-5 mt-5 text-center">
    <Card className="p-5 shadow-sm">
      <h1 className="display-4">403</h1>
      <h4>Доступ запрещён</h4>
      <p className="text-muted">У вас нет прав для просмотра этой страницы.</p>
      <Link to="/"><Button variant="danger">На главную</Button></Link>
    </Card>
  </Container>
);

export default Error403;
