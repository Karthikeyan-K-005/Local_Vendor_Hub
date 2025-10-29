import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Tabs,
    Tab,
    Card,
    ListGroup,
    Button,
    Row,
    Col,
    InputGroup,
    Form,
} from 'react-bootstrap';
import { useStore } from '../../store';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';
import Loader from '../../components/Loader';
import Message from '../../components/Message';
import { toast } from 'react-toastify';

const VendorDashboard = () => {
    const navigate = useNavigate();
    const { state } = useStore();
    const { userInfo } = state;

    const [stores, setStores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [currentKeyword, setCurrentKeyword] = useState('');
    const [hasLoaded, setHasLoaded] = useState(false); // Track if initial data load completed

    const [activeTab, setActiveTab] = useState('available');

    const approvedStores = stores.filter((store) => store.status === 'approved');
    const pendingStores = stores.filter((store) => store.status === 'pending');

    // Fetch Vendor's Stores - WRAPPED IN USECALLBACK
    const fetchMyStores = useCallback(async (keyword = '') => {
        setLoading(true);
        try {
            const config = {
                headers: { Authorization: `Bearer ${userInfo.token}` },
                params: { keyword },
            };
            const { data } = await axios.get('/api/stores/my-stores', config);
            
            setStores(data);
            setCurrentKeyword(keyword);
            setError(null);
            
        } catch (err) {
            setError(
                err.response && err.response.data.message
                    ? err.response.data.message
                    : err.message
            );
            setStores([]);
        } finally {
            setLoading(false);
            setHasLoaded(true); // CRUCIAL: Set true after data is fetched/failed
        }
    }, [userInfo]);

    // EFFECT for INITIAL LOAD and USER INFO CHANGES
    useEffect(() => {
        if (userInfo && userInfo.role === 'vendor') {
            fetchMyStores(currentKeyword);
        }
    }, [userInfo, fetchMyStores, currentKeyword]);

    // Search Handler
    const searchHandler = (e) => {
        e.preventDefault();
        fetchMyStores(searchKeyword);
    };

    // Delete Store Handler
    const deleteStoreHandler = async (storeId, storeName) => {
        if (
            window.confirm(
                `Are you sure you want to delete the store "${storeName}"? This action is irreversible and will delete all associated products and remove it from customer favorites.`
            )
        ) {
            try {
                // The backend is expected to handle the cascading delete of associated products (per user instruction)
                await axios.delete(`/api/stores/${storeId}`, {
                    headers: { Authorization: `Bearer ${userInfo.token}` },
                });
                toast.success(`Store "${storeName}" deleted successfully!`);
                
                // UX IMPROVEMENT: Clear search context and refresh the full list after deletion
                setSearchKeyword(''); 
                fetchMyStores(''); 
            } catch (err) {
                toast.error(
                    err.response && err.response.data.message
                        ? err.response.data.message
                        : err.message
                );
            }
        }
    };

    return (
        <>
            <Helmet>
                <title>Vendor Dashboard</title>
            </Helmet>
            <h1 className="mb-4 text-primary">Vendor Panel</h1>
            <Card className="shadow-lg border-0">
                <Tabs
                    activeKey={activeTab}
                    onSelect={(k) => setActiveTab(k)}
                    className="mb-3"
                    fill
                >
                    {/* TAB 1: AVAILABLE STORES */}
                    <Tab eventKey="available" title={`Available Stores (${approvedStores.length})`}>
                        <Card.Body>
                            <h5 className="mb-3">
                                Manage Your Approved Stores
                            </h5>

                            {/* Store Search Bar */}
                            <Form onSubmit={searchHandler} className="mb-4">
                                <InputGroup>
                                    <Form.Control
                                        type="text"
                                        placeholder="Search your stores by name..."
                                        value={searchKeyword}
                                        onChange={(e) => setSearchKeyword(e.target.value)}
                                    />
                                    <Button type="submit" variant="primary">
                                        <i className="fas fa-search"></i> Search
                                    </Button>
                                </InputGroup>
                            </Form>

                            {/* CONDITIONAL RENDERING FOR AVAILABLE TAB */}
                            {loading && !hasLoaded ? ( 
                                <Loader />
                            ) : error ? (
                                <Message variant="danger">{error}</Message>
                            ) : approvedStores.length === 0 ? (
                                <Message variant="info">
                                    {currentKeyword 
                                        ? `No approved stores match the search term "${currentKeyword}".` 
                                        : 'No approved stores found. Request one in the next tab!'}
                                </Message>
                            ) : (
                                <ListGroup variant="flush">
                                    {approvedStores.map((store) => (
                                        <ListGroup.Item key={store._id} className="py-3">
                                            <Row className="align-items-center">
                                                <Col md={3} className="fw-bold">
                                                    {store.name}
                                                </Col>
                                                <Col md={3}>
                                                    {store.category}
                                                </Col>
                                                <Col md={3} className="text-muted small">
                                                 {store.address?.area}, {store.address?.city}
                                                </Col>
                                                <Col md={3} className="text-end">
                                                    <Button
                                                        variant="info"
                                                        size="sm"
                                                        className="me-2"
                                                        onClick={() =>
                                                            navigate(`/vendor/store/${store._id}/products`)
                                                        }
                                                    >
                                                        <i className="fas fa-box-open"></i> Products
                                                    </Button>
                                                    <Button
                                                        variant="danger"
                                                        size="sm"
                                                        onClick={() =>
                                                            deleteStoreHandler(store._id, store.name)
                                                        }
                                                    >
                                                        <i className="fas fa-trash"></i> Delete
                                                    </Button>
                                                </Col>
                                            </Row>
                                        </ListGroup.Item>
                                    ))}
                                </ListGroup>
                            )}
                        </Card.Body>
                    </Tab>

                    {/* TAB 2: STORE REQUESTS */}
                    <Tab eventKey="requests" title={`Store Requests (${pendingStores.length})`}>
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <h5 className="mb-0 text-warning">
                                    Pending Requests
                                </h5>
                                <Button
                                    variant="primary"
                                    onClick={() => navigate('/vendor/request-store')}
                                >
                                    <i className="fas fa-plus"></i> Add New Store Request
                                </Button>
                            </div>

                            {/* CONDITIONAL RENDERING FOR PENDING TAB */}
                            {loading && !hasLoaded && activeTab === 'requests' ? ( 
                                <Loader />
                            ) : error && activeTab === 'requests' ? (
                                <Message variant="danger">{error}</Message>
                            ) : pendingStores.length === 0 ? (
                                <Message variant="success">
                                    No new stores are requested or all previous requests have been
                                    managed.
                                </Message>
                            ) : (
                                <ListGroup variant="flush">
                                    {pendingStores.map((store) => (
                                        <ListGroup.Item key={store._id} variant="warning" className="py-3">
                                            <Row className="align-items-center">
                                                <Col md={6} className="fw-bold">
                                                    {store.name}
                                                    <div className="text-dark small fw-normal mt-1">{store.category} in {store.address?.city}</div>
                                                </Col>
                                                <Col md={6} className="text-end">
                                                    Status: <span className="text-danger fw-bold"><i className="fas fa-hourglass-half me-1"></i> PENDING</span>
                                                </Col>
                                            </Row>
                                        </ListGroup.Item>
                                    ))}
                                </ListGroup>
                            )}
                        </Card.Body>
                    </Tab>
                </Tabs>
            </Card>
        </>
    );
};

export default VendorDashboard;
