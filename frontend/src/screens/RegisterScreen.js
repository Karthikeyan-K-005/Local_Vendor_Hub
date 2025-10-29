import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Form, Button, Row, Col } from 'react-bootstrap';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useStore } from '../store';
import FormContainer from '../components/FormContainer';
import { Helmet } from 'react-helmet-async';

const RegisterScreen = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [phone, setPhone] = useState(''); // NEW STATE FOR PHONE
    const [role, setRole] = useState('customer'); // Default role
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const { search } = useLocation();
    const redirectInUrl = new URLSearchParams(search).get('redirect');
    const redirect = redirectInUrl ? redirectInUrl : '/';

    const { state, dispatch } = useStore();
    const { userInfo } = state;

    useEffect(() => {
        if (userInfo) {
            navigate(redirect);
        }
    }, [navigate, redirect, userInfo]);

    const submitHandler = async (e) => {
        e.preventDefault();
        
        // --- Validation Checks ---
        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }
        
        // India Phone Number Validation (10 digits only)
        const phoneRegex = /^[6-9]\d{9}$/; // Starts with 6, 7, 8, or 9, followed by 9 digits
        if (role === 'vendor' && !phoneRegex.test(phone)) {
            toast.error('Invalid Phone Number. Please enter a valid 10-digit Indian mobile number (starting with 6, 7, 8, or 9).');
            return;
        }
        // --- End Validation Checks ---

        setLoading(true);
        try {
            const { data } = await axios.post('/api/users/register', {
                name,
                email,
                password,
                role,
                phone, // Include phone in payload
            });
            dispatch({ type: 'USER_REGISTER', payload: data });
            toast.success(`Account created successfully! Hello ${data.name}`);
            navigate(redirect);
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
                <title>Register</title>
            </Helmet>
            <h1 className="text-center mb-4">Create Account</h1>
            <Form onSubmit={submitHandler}>
                <Form.Group className="mb-3" controlId="name">
                    <Form.Label>Name</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Enter name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    ></Form.Control>
                </Form.Group>

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

                <Form.Group className="mb-3" controlId="confirmPassword">
                    <Form.Label>Confirm Password</Form.Label>
                    <Form.Control
                        type="password"
                        placeholder="Confirm password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    ></Form.Control>
                </Form.Group>

                {/* NEW: Phone Number Field */}
                <Form.Group className="mb-3" controlId="phone">
                    <Form.Label>Phone Number (For Vendors)</Form.Label>
                    <Form.Control
                        type="tel"
                        placeholder="Enter 10-digit phone number"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        // Required for vendors, optional otherwise to avoid breaking customer registration flow easily
                        required={role === 'vendor'} 
                        pattern="[0-9]*" // Basic numeric input helper
                    ></Form.Control>
                    {role === 'vendor' && (
                        <Form.Text className="text-muted">
                            Must be a 10-digit Indian number for verification.
                        </Form.Text>
                    )}
                </Form.Group>
                {/* END NEW */}

                <Form.Group className="mb-3" controlId="role">
                    <Form.Label>Are you a Vendor or a Customer?</Form.Label>
                    <Form.Select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        required
                    >
                        <option value="customer">Customer</option>
                        <option value="vendor">Vendor</option>
                    </Form.Select>
                </Form.Group>

                <Button disabled={loading} type="submit" variant="primary" className="w-100">
                    {loading ? 'Registering...' : 'Register'}
                </Button>
            </Form>

            <Row className="py-3">
                <Col className="text-center">
                    Have an Account? <Link to="/login">Login</Link>
                </Col>
            </Row>
        </FormContainer>
    );
};

export default RegisterScreen;
