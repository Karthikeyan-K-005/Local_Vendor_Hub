import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Form,
    Button,
    Row,
    Col,
    Card,
    Image,
    ListGroup,
    InputGroup,
    Container, // Added Container for centering
} from 'react-bootstrap';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useStore } from '../../store';
import { Helmet } from 'react-helmet-async';
import Loader from '../../components/Loader';
import Message from '../../components/Message';

const ProductAddScreen = () => {
    const { id: storeId } = useParams();
    const navigate = useNavigate();
    const { state } = useStore();
    const { userInfo } = state;

    const [storeName, setStoreName] = useState('');
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentSearchKeyword, setCurrentSearchKeyword] = useState('');

    // New Product Form State
    const [newProductName, setNewProductName] = useState('');
    const [newProductImage, setNewProductImage] = useState('');
    const [newProductDescription, setNewProductDescription] = useState('');
    const [newProductPrice, setNewProductPrice] = useState(0);
    const [loadingAddProduct, setLoadingAddProduct] = useState(false);
    const [loadingUpload, setLoadingUpload] = useState(false);

    // Search State
    const [searchKeyword, setSearchKeyword] = useState('');

    // 1. Fetch Products and Store Name (Wrapped in useCallback)
    const fetchProducts = useCallback(async (keyword = '') => {
        setLoading(true);
        try {
            const config = {
                headers: { Authorization: `Bearer ${userInfo.token}` },
            };
            
            // Fetch store name
            const storeRes = await axios.get(`/api/stores/${storeId}`);
            setStoreName(storeRes.data.name);

            // Fetch products with keyword
            const productsConfig = {
                headers: { Authorization: `Bearer ${userInfo.token}` },
                params: { keyword },
            };
            const { data } = await axios.get(
                `/api/stores/${storeId}/products`,
                productsConfig
            );
            setProducts(data);
            setCurrentSearchKeyword(keyword);
            setError(null);
        } catch (err) {
            setError(
                err.response && err.response.data.message
                    ? err.response.data.message
                    : err.message
            );
            setProducts([]);
        } finally {
            setLoading(false);
        }
    }, [userInfo, storeId]);

    useEffect(() => {
        if (!userInfo || userInfo.role !== 'vendor') {
            navigate('/login');
        } else {
            fetchProducts();
        }
    }, [userInfo, storeId, navigate, fetchProducts]); // Dependency array is now complete

    // 2. Search Handler
    const searchHandler = (e) => {
        e.preventDefault();
        fetchProducts(searchKeyword);
    };

    // 3. Upload Image Handler (Uses the new image logic you had)
    const uploadFileHandler = async (e) => {
        const file = e.target.files[0];
        const formData = new FormData();
        formData.append('image', file);
        setLoadingUpload(true);
        try {
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${userInfo.token}`, // Should include auth token for /api/upload
                },
            };
            const { data } = await axios.post('/api/upload', formData, config);
            setNewProductImage(data.image); // Assuming response data has an 'image' field with the URL
            toast.success('Image uploaded successfully!');
        } catch (err) {
            toast.error('Image upload failed.');
        } finally {
            setLoadingUpload(false);
        }
    };

    // 4. Add Product Handler
    const addProductHandler = async (e) => {
        e.preventDefault();
        setLoadingAddProduct(true);
        try {
            await axios.post(
                `/api/stores/${storeId}/products`,
                {
                    name: newProductName,
                    image: newProductImage,
                    description: newProductDescription,
                    price: newProductPrice,
                },
                {
                    headers: { Authorization: `Bearer ${userInfo.token}` },
                }
            );
            toast.success('Product added successfully!');
            // Reset form and refresh list
            setNewProductName('');
            setNewProductImage('');
            setNewProductDescription('');
            setNewProductPrice(0);
            fetchProducts();
        } catch (err) {
            toast.error(
                err.response && err.response.data.message
                    ? err.response.data.message
                    : err.message
            );
        } finally {
            setLoadingAddProduct(false);
        }
    };

    // 5. Delete Product Handler
    const deleteProductHandler = async (productId, productName) => {
        if (window.confirm(`Are you sure you want to delete product: ${productName}?`)) {
            try {
                await axios.delete(`/api/stores/${storeId}/products/${productId}`, {
                    headers: { Authorization: `Bearer ${userInfo.token}` },
                });
                toast.success('Product deleted successfully!');
                fetchProducts(); // Refresh list
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
        <Container className="py-4">
            <Helmet>
                <title>{storeName} - Manage Products</title>
            </Helmet>
            
            {/* 🔥 FIX: Corrected navigation path to /vendor/dashboard */}
            <Button variant="outline-secondary" className="mb-4" onClick={() => navigate('/vendor')}>
                <i className="fas fa-arrow-left me-2"></i> Go to Vendor Panel
            </Button>
            
            <h2 className="mb-4">Manage Products for: <span className="text-primary fw-bold">{storeName}</span></h2>

            <Row>
                {/* ADD PRODUCT FORM */}
                <Col md={4} className="mb-4">
                    <Card className="shadow-lg border-0 h-100">
                        <Card.Header as="h5" className="bg-dark text-white">
                            <i className="fas fa-plus-circle me-2"></i> Add New Product
                        </Card.Header>
                        <Card.Body>
                            <Form onSubmit={addProductHandler}>
                                <Form.Group className="mb-3" controlId="name">
                                    <Form.Label>Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={newProductName}
                                        onChange={(e) => setNewProductName(e.target.value)}
                                        required
                                    ></Form.Control>
                                </Form.Group>
                                <Form.Group className="mb-3" controlId="description">
                                    <Form.Label>Description</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={2}
                                        value={newProductDescription}
                                        onChange={(e) => setNewProductDescription(e.target.value)}
                                        required
                                    ></Form.Control>
                                </Form.Group>
                                <Form.Group className="mb-3" controlId="price">
                                    <Form.Label>Price (₹)</Form.Label>
                                    <Form.Control
                                        type="number"
                                        step="0.01"
                                        min="0.01"
                                        value={newProductPrice}
                                        onChange={(e) => setNewProductPrice(e.target.value)}
                                        required
                                    ></Form.Control>
                                </Form.Group>
                                <Form.Group controlId="image" className="mb-3">
                                    <Form.Label>Product Image URL (Optional)</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Paste image URL or upload below"
                                        value={newProductImage}
                                        onChange={(e) => setNewProductImage(e.target.value)}
                                    ></Form.Control>
                                    <Form.Label className="mt-3">Or Upload File</Form.Label>
                                    <Form.Control
                                        type="file"
                                        onChange={uploadFileHandler}
                                        disabled={loadingUpload}
                                    />
                                    {loadingUpload && <p className="text-muted mt-2">Uploading...</p>}
                                    {newProductImage && (
                                        <div className="mt-2 d-flex align-items-center">
                                            <Image src={newProductImage} fluid rounded style={{ width: '40px', height: '40px', objectFit: 'cover' }} className="me-2" />
                                            <p className="text-success small mb-0">
                                                Image set: **{newProductImage.substring(0, 20)}...**
                                            </p>
                                        </div>
                                    )}
                                </Form.Group>

                                <Button
                                    disabled={loadingAddProduct || loadingUpload || !newProductName || newProductPrice <= 0 || !newProductImage}
                                    type="submit"
                                    variant="success"
                                    className="w-100 mt-3"
                                >
                                    {loadingAddProduct ? 'Adding...' : 'Add Product'}
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>

                {/* PRODUCT LIST - VISUAL FIX APPLIED */}
                <Col md={8}>
                    <Card className="shadow-lg border-0 h-100">
                        <Card.Header as="h5" className="bg-primary text-white">
                            <i className="fas fa-list-alt me-2"></i> Existing Products
                        </Card.Header>
                        <Card.Body>
                            {/* Product Search Bar */}
                            <Form onSubmit={searchHandler} className="mb-4">
                                <InputGroup>
                                    <Form.Control
                                        type="text"
                                        placeholder="Search products by name..."
                                        value={searchKeyword}
                                        onChange={(e) => setSearchKeyword(e.target.value)}
                                    />
                                    <Button type="submit" variant="primary">
                                        <i className="fas fa-search"></i> Search
                                    </Button>
                                </InputGroup>
                            </Form>

                            {loading ? (
                                <Loader />
                            ) : error ? (
                                <Message variant="danger">{error}</Message>
                            ) : products.length === 0 ? (
                                <Message variant="info">
                                    {currentSearchKeyword ? `No products found matching "${currentSearchKeyword}".` : 'No products found. Add one on the left!'}
                                </Message>
                            ) : (
                                <ListGroup variant="flush">
                                    {products.map((product) => (
                                        <ListGroup.Item key={product._id} className="py-3">
                                            <Row className="align-items-center">
                                                
                                                {/* Image and Name/Description Column (Wide) */}
                                                <Col xs={12} md={7} className="d-flex align-items-center">
                                                    <Image
                                                        src={product.image || 'https://via.placeholder.com/40'}
                                                        alt={product.name}
                                                        fluid
                                                        rounded
                                                        style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                                                        className="me-3 border"
                                                    />
                                                    <div>
                                                        {/* 🔥 FIX: Display product name prominently */}
                                                        <strong className="d-block">{product.name}</strong>
                                                        <small className="text-muted d-block text-truncate" style={{ maxWidth: '250px' }}>
                                                            {product.description.substring(0, 50)}...
                                                        </small>
                                                    </div>
                                                </Col>

                                                {/* Price Column */}
                                                <Col xs={6} md={2} className="text-md-end text-start mt-2 mt-md-0">
                                                    <span className="fw-bold text-success">
                                                        ₹{parseFloat(product.price).toFixed(2)}
                                                    </span>
                                                </Col>
                                                
                                                {/* Action Column */}
                                                <Col xs={6} md={3} className="text-end mt-2 mt-md-0">
                                                    <Button
                                                        variant="danger"
                                                        size="sm"
                                                        // Pass product name for better confirmation prompt
                                                        onClick={() => deleteProductHandler(product._id, product.name)} 
                                                    >
                                                        <i className="fas fa-trash me-1"></i> Delete
                                                    </Button>
                                                </Col>
                                            </Row>
                                        </ListGroup.Item>
                                    ))}
                                </ListGroup>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default ProductAddScreen;