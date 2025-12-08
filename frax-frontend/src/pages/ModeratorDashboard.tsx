import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const ModeratorDashboard: React.FC = () => {
  return (
    <Container className="pt-5 mt-5">
      <h2 className="mb-4">Панель модератора</h2>
      <p className="text-muted">Здесь находится обзор модераторских функций. Для управления услугами и просмотра заявок используйте соответствующие страницы в каталоге продуктов или меню.</p>
    </Container>
  );
};

export default ModeratorDashboard;
