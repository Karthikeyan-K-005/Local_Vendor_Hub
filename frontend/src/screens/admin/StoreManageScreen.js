import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, ListGroup, Row, Col, Alert } from 'react-bootstrap';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';
import { useStore } from '../../store';
import Loader from '../../components/Loader';
import Message from '../../components/Message';
import { toast } from 'react-toastify';

const StoreManageScreen = () => {
    const { id: storeId } = useParams();
    const navigate = useNavigate();
    const { state } = useStore();
    const { userInfo } = state;

    const [store, setStore] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 1. Fetch Specific Store Details
    useEffect(() => {
        const fetchStore = async () => {
            setLoading(true);
            try {
                const { data } = await axios.get(`/api/admin/stores/${storeId}`, {
                    headers: { Authorization: `Bearer ${userInfo.token}` },
                });
                setStore(data);
            } catch (err) {
                setError(
                    err.response && err.response.data.message
                        ? err.response.data.message
                        : err.message
                );
            } finally {
                setLoading(false);
            }
        };
        
        if (userInfo && userInfo.token) {
            fetchStore();
        }
    }, [storeId, userInfo]); // Dependency array simplified

    // 2. Delete Store Handler
    const deleteStoreHandler = async () => {
        if (
            window.confirm(
                `Are you sure you want to permanently delete the store "${store.name}"? This action CANNOT be undone.`
            )
        ) {
            try {
                await axios.delete(`/api/admin/stores/${storeId}`, {
                    headers: { Authorization: `Bearer ${userInfo.token}` },
                });
                toast.success(`Store "${store.name}" deleted successfully. Vendor notified.`);
                navigate('/admin/dashboard', { replace: true }); // Redirect back using replace
            } catch (err) {
                toast.error('Error deleting store.');
            }
        }
    };

    return (
        <>
            <Helmet>
                <title>Manage Store: {store?.name || 'Loading...'}</title>
            </Helmet>
            <Button className="btn btn-light my-3 shadow-sm" onClick={() => navigate('/admin/dashboard', { replace: true })}>
                <i className="fas fa-arrow-left me-2"></i> Go to Admin Dashboard
            </Button>
            <h1 className="mb-4 text-primary fw-bold">Store Management: {store?.name}</h1>

            {loading ? (
                <Loader />
            ) : error ? (
                <Message variant="danger">{error}</Message>
            ) : store ? (
                <Card className="shadow-xl">
                    <Card.Header as="h3" className="d-flex justify-content-between align-items-center bg-light">
                        {store.name}
                        <span className={`badge bg-${store.status === 'approved' ? 'success' : store.status === 'pending' ? 'warning' : 'danger'} text-uppercase fs-6`}>
                            {store.status}
                        </span>
                    </Card.Header>
                    <Card.Body>
                        <Row>
                            <Col lg={6}>
                                <h5 className="text-primary mb-3">Store Details</h5>
                                <ListGroup variant="flush">
                                    <ListGroup.Item><strong>ID:</strong> {store._id}</ListGroup.Item>
                                    <ListGroup.Item><strong>Category:</strong> {store.category}</ListGroup.Item>
                                    <ListGroup.Item>
                                        <strong>Location:</strong> {store.address.area}, {store.address.city}
                                    </ListGroup.Item>
                                    <ListGroup.Item>
                                        <strong>Rating:</strong> <i style={{ color: '#f8e825' }} className="fas fa-star"></i> {store.rating?.toFixed(1) || 0} ({store.numReviews} reviews)
                                    </ListGroup.Item>
                                    <ListGroup.Item><strong>Products Listed:</strong> {store.products?.length || 0}</ListGroup.Item>
                                </ListGroup>
                            </Col>
                            <Col lg={6}>
                                <h5 className="text-primary mb-3">Vendor Information</h5>
                                <ListGroup variant="flush">
                                    <ListGroup.Item><strong>Vendor Name:</strong> {store.vendor.name}</ListGroup.Item>
                                    <ListGroup.Item><strong>Vendor Email:</strong> {store.vendor.email}</ListGroup.Item>
                                    
                                    <ListGroup.Item className="mt-4 pt-3 border-top border-primary">
                                        <Alert variant="danger" className="p-3">
                                            <i className="fas fa-exclamation-triangle me-2"></i> 
                                            <strong>Permanent Deletion Warning:</strong> Deleting this store will remove all associated products and reviews.
                                        </Alert>
                                        <Button
                                            variant="danger"
                                            className="w-100 shadow-lg"
                                            onClick={deleteStoreHandler}
                                        >
                                            <i className="fas fa-trash me-2"></i> Permanently Delete Store
                                        </Button>
                                    </ListGroup.Item>
                                </ListGroup>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>
            ) : null}
        </>
    );
};

export default StoreManageScreen;