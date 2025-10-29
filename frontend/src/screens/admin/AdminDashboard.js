import React, { useState, useEffect } from 'react';
import { Tabs, Tab, Card, ListGroup, Button, Row, Col, Form, FormControl } from 'react-bootstrap';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';
import { useStore } from '../../store';
import Loader from '../../components/Loader';
import Message from '../../components/Message';
import { toast } from 'react-toastify';

// --- MODIFICATION: Define API Base URL from environment variable ---
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || ''; 
// If REACT_APP_API_BASE_URL is set (e.g., in a cloud environment), it will be used. 
// Otherwise, it defaults to an empty string, allowing relative paths (e.g., during local dev with a proxy).

const AdminDashboard = () => {
    const { state } = useStore();
    const { userInfo } = state;

    const [requests, setRequests] = useState([]);
    const [vendors, setVendors] = useState([]);
    const [stores, setStores] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [hasLoaded, setHasLoaded] = useState(false); // State to manage initial load

    const [activeTab, setActiveTab] = useState('requests');

    // Search State
    const [vendorSearch, setVendorSearch] = useState('');
    const [storeSearch, setStoreSearch] = useState('');

    // --- Helper Functions ---

    // Helper function to format address object into a string
    const formatAddress = (addressObject) => {
        if (!addressObject) return 'N/A';
        // Use an array to filter out any undefined/null properties and join the rest
        const parts = [
            addressObject.area, 
            addressObject.city, 
            addressObject.district
        ].filter(Boolean); 
        
        return parts.length > 0 ? parts.join(', ') : 'N/A';
    };

    // --- Data Fetching ---
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const config = {
                    headers: { Authorization: `Bearer ${userInfo.token}` },
                };

                if (activeTab === 'requests') {
                    // --- MODIFICATION: Use API_BASE_URL ---
                    const { data } = await axios.get(`${API_BASE_URL}/api/admin/requests`, config);
                    setRequests(data);
                } else if (activeTab === 'vendors') {
                    // --- MODIFICATION: Use API_BASE_URL ---
                    const { data } = await axios.get(`${API_BASE_URL}/api/admin/vendors`, config);
                    setVendors(data);
                } else if (activeTab === 'manage-stores') {
                    // --- MODIFICATION: Use API_BASE_URL ---
                    const { data } = await axios.get(`${API_BASE_URL}/api/admin/stores`, config);
                    
                    // Filter stores to only show 'approved' ones
                    const approvedStores = data.filter(
                        (store) => store.status === 'approved'
                    );
                    setStores(approvedStores);
                }
            } catch (err) {
                setError(
                    err.response && err.response.data.message
                        ? err.response.data.message
                        : err.message
                );
            } finally {
                setLoading(false);
                setHasLoaded(true); // Mark load as complete
            }
        };

        if (userInfo && userInfo.role === 'admin') {
            fetchData();
        }
    }, [userInfo, activeTab]); 

    // --- Action Handlers ---

    // Request Management Handler
    const handleRequest = async (storeId, action, storeName, vendorEmail) => {
        if (!window.confirm(`Are you sure you want to ${action} the request for ${storeName}?`)) {
            return;
        }
        try {
            // --- MODIFICATION: Use API_BASE_URL ---
            await axios.put(
                `${API_BASE_URL}/api/admin/requests/${storeId}`,
                { status: action === 'accept' ? 'approved' : 'rejected' },
                { headers: { Authorization: `Bearer ${userInfo.token}` } }
            );

            toast.success(`Store request for ${storeName} has been ${action}ed. Email sent to ${vendorEmail}.`);
            
            // Remove the processed request from the 'requests' list
            setRequests(requests.filter((r) => r._id !== storeId)); 
            
            // If the request was approved, we need to refresh the 'manage-stores' list 
            if (action === 'accept') {
                setActiveTab('manage-stores'); // Re-trigger fetch for the stores tab
            }
        } catch (err) {
            toast.error('Error processing request.');
        }
    };

    // Delete Vendor Handler (CRITICAL: Cascading Delete Implementation)
    const deleteVendorHandler = async (vendorId, vendorName) => {
        // This aligns with the stored instruction: "If the admin deletes a vendor, the stores associated with that vendor should also be deleted."
        if (
            window.confirm(
                `DANGER: Are you sure you want to delete the vendor "${vendorName}"? This will permanently delete the vendor, ALL their stores, and ALL associated data.`
            )
        ) {
            try {
                // --- MODIFICATION: Use API_BASE_URL ---
                await axios.delete(`${API_BASE_URL}/api/admin/vendors/${vendorId}`, {
                    headers: { Authorization: `Bearer ${userInfo.token}` },
                });
                toast.success(`Vendor "${vendorName}" and all associated stores/data deleted.`);
                
                // Refresh vendors list
                setVendors(vendors.filter((v) => v._id !== vendorId)); 
                
                // Force a re-fetch of the stores list to reflect deletions from other vendors too
                setActiveTab('manage-stores'); 
            } catch (err) {
                toast.error('Error deleting vendor.');
            }
        }
    };

    // Delete Store Handler
    const deleteStoreHandler = async (storeId, storeName) => {
        if (
            window.confirm(
                `Are you sure you want to delete the store "${storeName}"? This action CANNOT be undone.`
            )
        ) {
            try {
                // --- MODIFICATION: Use API_BASE_URL ---
                await axios.delete(`${API_BASE_URL}/api/admin/stores/${storeId}`, {
                    headers: { Authorization: `Bearer ${userInfo.token}` },
                });
                toast.success(`Store "${storeName}" deleted.`);
                setStores(stores.filter((s) => s._id !== storeId)); // Refresh list locally
            } catch (err) {
                toast.error('Error deleting store.');
            }
        }
    };

    // --- Derived State & Rendering Logic ---

    const isTabLoading = (tabKey) => loading && activeTab === tabKey && !hasLoaded;

    // Filter Vendors based on search term
    const filteredVendors = vendors.filter(vendor => 
        vendor.name.toLowerCase().includes(vendorSearch.toLowerCase()) ||
        vendor.email.toLowerCase().includes(vendorSearch.toLowerCase())
    );

    // Filter Stores based on search term (store name or vendor name)
    const filteredStores = stores.filter(store => 
        store.name.toLowerCase().includes(storeSearch.toLowerCase()) ||
        (store.vendor && store.vendor.name.toLowerCase().includes(storeSearch.toLowerCase()))
    );

    return (
        <>
            <Helmet>
                <title>Admin Dashboard</title>
            </Helmet>
            <h1 className="mb-4 text-primary fw-bold">Admin Control Panel</h1>

            <Card className="shadow-xl">
                <Tabs
                    activeKey={activeTab}
                    onSelect={(k) => setActiveTab(k)}
                    className="mb-3"
                    fill
                >
                    {/* TAB 1: VENDOR REQUESTS */}
                    <Tab eventKey="requests" title="Vendor Requests">
                        <Card.Body>
                            <h5 className="mb-3">Pending Store Creation Requests ({requests.length})</h5>
                            {isTabLoading('requests') ? (
                                <Loader />
                            ) : error && activeTab === 'requests' ? (
                                <Message variant="danger">{error}</Message>
                            ) : requests.length === 0 ? (
                                <Message variant="success">No pending store requests at this time. ✨</Message>
                            ) : (
                                <ListGroup variant="flush">
                                    {requests.map((request) => (
                                        <ListGroup.Item key={request._id} variant="light">
                                            <Row className="align-items-center">
                                                {/* Store Info */}
                                                <Col md={4}>
                                                    <strong className="text-primary">{request.name}</strong> ({request.category})
                                                </Col>
                                                
                                                {/* Vendor Details */}
                                                <Col md={5}>
                                                    <p className="mb-1 small">
                                                        <strong>Vendor:</strong> {request.vendor.name}
                                                    </p>
                                                    <p className="mb-1 small">
                                                        <strong>Email:</strong> {request.vendor.email}
                                                    </p>
                                                    <p className="mb-0 small text-muted">
                                                        <strong>Address:</strong> {formatAddress(request.address)} 
                                                    </p>
                                                </Col>
                                                
                                                {/* Actions */}
                                                <Col md={3} className="text-end">
                                                    <Button
                                                        variant="success"
                                                        size="sm"
                                                        className="me-2"
                                                        onClick={() =>
                                                            handleRequest(
                                                                request._id,
                                                                'accept',
                                                                request.name,
                                                                request.vendor.email
                                                            )
                                                        }
                                                    >
                                                        <i className="fas fa-check"></i> Accept
                                                    </Button>
                                                    <Button
                                                        variant="danger"
                                                        size="sm"
                                                        onClick={() =>
                                                            handleRequest(
                                                                request._id,
                                                                'reject',
                                                                request.name,
                                                                request.vendor.email
                                                            )
                                                        }
                                                    >
                                                        <i className="fas fa-times"></i> Reject
                                                    </Button>
                                                </Col>
                                            </Row>
                                        </ListGroup.Item>
                                    ))}
                                </ListGroup>
                            )}
                        </Card.Body>
                    </Tab>

                    {/* TAB 2: MANAGE VENDORS */}
                    <Tab eventKey="vendors" title="Manage Vendors">
                        <Card.Body>
                            <h5 className="mb-3">Registered Vendors ({filteredVendors.length} / {vendors.length})</h5>
                            
                            {/* Vendor Search Bar */}
                            <Form className="mb-4">
                                <FormControl
                                    type="text"
                                    placeholder="Search vendors by name or email..."
                                    className="me-2 shadow-sm"
                                    aria-label="Search vendors"
                                    value={vendorSearch}
                                    onChange={(e) => setVendorSearch(e.target.value)}
                                />
                            </Form>

                            {isTabLoading('vendors') ? (
                                <Loader />
                            ) : error && activeTab === 'vendors' ? (
                                <Message variant="danger">{error}</Message>
                            ) : filteredVendors.length === 0 ? ( 
                                <Message variant="info">
                                    {vendorSearch ? `No vendors found matching "${vendorSearch}".` : 'No vendors currently registered.'}
                                </Message>
                            ) : (
                                <ListGroup variant="flush">
                                    {filteredVendors.map((vendor) => (
                                        <ListGroup.Item key={vendor._id} variant="warning" className="p-3">
                                            <Row className="align-items-center">
                                                <Col md={4} className="fw-bold text-dark">{vendor.name}</Col>
                                                <Col md={5} className="small">{vendor.email}</Col>
                                                <Col md={3} className="text-end">
                                                    <Button
                                                        variant="danger"
                                                        size="sm"
                                                        onClick={() =>
                                                            deleteVendorHandler(vendor._id, vendor.name)
                                                        }
                                                    >
                                                        <i className="fas fa-user-times me-1"></i> Delete Vendor & Stores
                                                    </Button>
                                                </Col>
                                            </Row>
                                        </ListGroup.Item>
                                    ))}
                                </ListGroup>
                            )}
                        </Card.Body>
                    </Tab>

                    {/* TAB 3: MANAGE STORES */}
                    <Tab eventKey="manage-stores" title="Manage Stores">
                        <Card.Body>
                            <h5 className="mb-3">Approved Stores ({filteredStores.length} / {stores.length})</h5>

                            {/* Store Search Bar */}
                            <Form className="mb-4">
                                <FormControl
                                    type="text"
                                    placeholder="Search stores by store name or vendor name..."
                                    className="me-2 shadow-sm"
                                    aria-label="Search stores"
                                    value={storeSearch}
                                    onChange={(e) => setStoreSearch(e.target.value)}
                                />
                            </Form>

                            {isTabLoading('manage-stores') ? (
                                <Loader />
                            ) : error && activeTab === 'manage-stores' ? (
                                <Message variant="danger">{error}</Message>
                            ) : filteredStores.length === 0 ? (
                                <Message variant="info">
                                    {storeSearch ? `No stores found matching "${storeSearch}".` : 'No approved stores available to manage.'}
                                </Message>
                            ) : (
                                <ListGroup variant="flush">
                                    {filteredStores.map((store) => (
                                        <ListGroup.Item key={store._id} variant={'success'} className="p-3">
                                            <Row className="align-items-center">
                                                <Col md={4}>
                                                    <strong className="text-dark">{store.name}</strong> 
                                                    <span className='ms-2 text-info'>({store.category})</span>
                                                </Col>
                                                <Col md={3} className="small">
                                                    Vendor: {store.vendor.name}
                                                </Col>
                                                <Col md={2} className="small">
                                                    <span className="badge bg-primary text-uppercase">APPROVED</span>
                                                </Col>
                                                <Col md={3} className="text-end">
                                                    <Button
                                                        variant="danger"
                                                        size="sm"
                                                        onClick={() =>
                                                            deleteStoreHandler(store._id, store.name)
                                                        }
                                                    >
                                                        <i className="fas fa-trash me-1"></i> Delete Store
                                                    </Button>
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

export default AdminDashboard;