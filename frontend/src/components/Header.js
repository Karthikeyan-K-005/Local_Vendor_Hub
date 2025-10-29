import React, { useState } from 'react';
import { Navbar, Nav, Container, Form, Button, NavDropdown } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '../store';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { state, dispatch } = useStore();
  const { userInfo } = state;

  const [keyword, setKeyword] = useState('');

  const logoutHandler = () => {
    dispatch({ type: 'USER_LOGOUT' });
    navigate('/login');
  };

  const submitHandler = (e) => {
    e.preventDefault();
    if (keyword.trim()) {
      navigate(`/search?keyword=${keyword}`);
      // Clear keyword after search
      setKeyword('');
    } else if (location.pathname.startsWith('/search')) {
      // If already on a search page but search is empty, go home
      navigate('/');
    }
  };

  return (
    <header>
      <Navbar bg="primary" variant="dark" expand="lg" collapseOnSelect className="shadow-sm">
        <Container>
          <LinkContainer to="/">
            <Navbar.Brand className="fw-bold fs-4">Local Store Hub</Navbar.Brand>
          </LinkContainer>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">

            {/* Search Bar - Responsive positioning with media query effect */}
            <Form onSubmit={submitHandler} className="d-flex w-100 my-2 my-lg-0 mx-lg-auto" style={{ maxWidth: '600px' }}>
              <Form.Control
                type="search"
                name="q"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Search Stores (Name, Category, Area...)"
                className="rounded-end-0 border-end-0"
              />
              <Button type="submit" variant="light" className="p-2 rounded-start-0">
                <i className="fas fa-search"></i>
              </Button>
            </Form>

            {/* Navigation Links */}
            <Nav className="ms-lg-auto">
              {userInfo ? (
                <NavDropdown 
                    title={<span className="text-white fw-medium">Hello {userInfo.name}</span>} 
                    id="username"
                    align={{ lg: 'end' }} // Align dropdown to the right on large screens
                >
                  {/* Customer Links */}
                  {userInfo.role === 'customer' && (
                    <LinkContainer to="/profile">
                      <NavDropdown.Item>
                        <i className="fas fa-user-circle me-2"></i>My Profile & Favorites
                      </NavDropdown.Item>
                    </LinkContainer>
                  )}

                  {/* Vendor Links */}
                  {userInfo.role === 'vendor' && (
                    <LinkContainer to="/vendor">
                      <NavDropdown.Item>
                        <i className="fas fa-store-alt me-2"></i>Vendor Panel
                      </NavDropdown.Item>
                    </LinkContainer>
                  )}

                  {/* Admin Links */}
                  {userInfo.role === 'admin' && (
                    <LinkContainer to="/admin/dashboard">
                      <NavDropdown.Item>
                        <i className="fas fa-user-shield me-2"></i>Admin Panel
                      </NavDropdown.Item>
                    </LinkContainer>
                  )}

                  <NavDropdown.Divider />
                  
                  <NavDropdown.Item onClick={logoutHandler} className="text-danger">
                    <i className="fas fa-sign-out-alt me-2"></i>Logout
                  </NavDropdown.Item>
                </NavDropdown>
              ) : (
                <LinkContainer to="/login">
                  <Nav.Link className="text-white">
                    <i className="fas fa-sign-in-alt me-1"></i> Sign In
                  </Nav.Link>
                </LinkContainer>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </header>
  );
};

export default Header;