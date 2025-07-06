import React from 'react';
import { Nav, Navbar, Container } from 'react-bootstrap';
import { CheckSquare, Home, Info } from 'lucide-react';

export default function Header() {
  return (
    <Navbar bg="primary" variant="dark" expand="lg" className="shadow-sm">
      <Container>
        <Navbar.Brand href="#home" className="d-flex align-items-center">
          <CheckSquare size={24} className="me-2" />
          <span className="fw-bold">TODO APP</span>
        </Navbar.Brand>
        
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link href="#home" className="d-flex align-items-center">
              <Home size={16} className="me-1" />
              Home
            </Nav.Link>
            <Nav.Link href="#about" className="d-flex align-items-center">
              <Info size={16} className="me-1" />
              About
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}