import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Form, Button, Row, Col } from 'react-bootstrap';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useStore } from '../store';
import FormContainer from '../components/FormContainer';
import { Helmet } from 'react-helmet-async';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { search } = useLocation();
  const redirectInUrl = new URLSearchParams(search).get('redirect');
  const redirect = redirectInUrl ? redirectInUrl : '/';

  const { state, dispatch } = useStore();
  const { userInfo } = state;

  useEffect(() => {
    if (userInfo) {
      // Redirect based on role if logged in
      if (userInfo.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (userInfo.role === 'vendor') {
        navigate('/vendor');
      } else {
        navigate(redirect);
      }
    }
  }, [navigate, redirect, userInfo]);

  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axios.post('/api/users/login', { email, password });
      dispatch({ type: 'USER_LOGIN', payload: data });
      toast.success(`Welcome back, ${data.name}!`);
      // Redirection logic handled in useEffect
    } catch (err) {
      toast.error(
        err.response && err.response.data.message
          ? err.response.data.message
          : err.message
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormContainer>
      <Helmet>
        <title>Sign In</title>
      </Helmet>
      <h1 className="text-center mb-4">Sign In</h1>
      <Form onSubmit={submitHandler}>
        <Form.Group className="mb-3" controlId="email">
          <Form.Label>Email Address</Form.Label>
          <Form.Control
            type="email"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          ></Form.Control>
        </Form.Group>

        <Form.Group className="mb-3" controlId="password">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          ></Form.Control>
        </Form.Group>

        <Button disabled={loading} type="submit" variant="primary" className="w-100">
          {loading ? 'Signing In...' : 'Sign In'}
        </Button>
      </Form>

      <Row className="py-3">
        <Col className="text-center">
          New User?{' '}
          <Link to={redirect ? `/register?redirect=${redirect}` : '/register'}>
            Register Now
          </Link>
        </Col>
      </Row>
    </FormContainer>
  );
};

export default LoginScreen;
