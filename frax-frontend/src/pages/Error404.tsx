import React from 'react';
import { Container, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

export const Error404 = () => (
  <Container className="pt-5 mt-5 text-center">
    <Card className="p-5 shadow-sm">
      <h1 className="display-4">404</h1>
      <h4>Страница не найдена</h4>
      <p className="text-muted">Проверьте URL или вернитесь на главную страницу.</p>
      <Link to="/"><Button variant="danger">На главную</Button></Link>
    </Card>
  </Container>
);

export default Error404;
