import { Navbar, Container, Nav } from 'react-bootstrap';
import { Link } from 'react-router-dom';

export const AppNavbar = () => {
    return (
        <Navbar bg="danger" variant="dark" fixed="top" className="shadow-sm">
            <Container fluid className='px-7'>
                <Navbar.Brand as={Link} to="/">
                    <img 
                        src="mock_images/image.png" 
                        alt="Diet Composition Calculator"
                        height="40"
                        className="d-inline-block align-top"
                    />
                </Navbar.Brand>
                <Nav className="ms-auto">
                    <Nav.Link className='fs-5 text-dark' as={Link} to="/products">Products</Nav.Link>
                </Nav>
            </Container>
        </Navbar>
    );
};