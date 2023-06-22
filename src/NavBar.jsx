import React, { useState, useEffect } from 'react';
import { Navbar, NavbarBrand, Nav, NavItem, NavLink, Container, Row, Col } from 'react-bootstrap';

import navlogo from './figures/RedactorText.png';


function NavBar() {
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleResize = () => {
    setIsMobile(window.innerWidth <= 768);
  };

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <>
      {isMobile ? (
        /* Mobile View */
        <>
          <Navbar bg="light" variant="light" style={{border: '1px'}} expand="lg" collapseOnSelect expanded={showMobileMenu}>
            <Container fluid fixed="top">
              <NavbarBrand href="/" className="ml-3 mr-auto">
                <img alt="Redactor logo" src={navlogo} height="40" />
              </NavbarBrand>
              <Navbar.Toggle aria-controls="mobile-navbar" onClick={toggleMobileMenu} className="mr-3" />
              <Navbar.Collapse id="mobile-navbar">
                <Nav className="text-center dropdown-options">
                  <NavItem>
                    <NavLink href="/">Home</NavLink>
                    <NavLink href="/about">About</NavLink>
                  </NavItem>
                </Nav>
              </Navbar.Collapse>
            </Container>
          </Navbar>
        </>
      ) : (
        /* Desktop View */
        <Navbar variant="light" bg="light">
          <Container>
            <Col className="text-center">
              <Row>
                <NavbarBrand href="/">
                  <img
                    alt="double bogey logo"
                    src={navlogo}
                    height="75"
                    style={{ marginTop: '15px', marginBottom: '5px' }}
                  />
                </NavbarBrand>
              </Row>
              <Row>
                <Nav className="justify-content-center fs-4">
                  <NavLink className="nav-link-spacing" href="/">Home</NavLink>
                  <NavLink className="nav-link-spacing" href="/about">About</NavLink>
                </Nav>
              </Row>
            </Col>
          </Container>
        </Navbar>
      )}
    </>
  );
}


export default NavBar;