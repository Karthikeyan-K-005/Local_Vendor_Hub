import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import {
    Row,
    Col,
    Image,
    ListGroup,
    Card,
    Button,
    Form,
    Alert,
    Container, // Added Container for centering
} from 'react-bootstrap';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Helmet } from 'react-helmet-async';
import { useStore } from '../store';
import Loader from '../components/Loader';
import Message from '../components/Message';
import Rating from '../components/Rating';

const StoreDetailScreen = () => {
    const { id: storeId } = useParams();
    const navigate = useNavigate();
    const { state, dispatch } = useStore();
    const { userInfo } = state;

    const [store, setStore] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [products, setProducts] = useState([]);

    // Review state
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [loadingReview, setLoadingReview] = useState(false);

    // Check against the userInfo state which is loaded from localStorage (and later replaced by SET_FULL_FAVORITES)
    const isFavorite = userInfo?.favorites?.some((fav) => fav._id === storeId); 
    const hasReviewed = store?.reviews?.find((r) => r.user.toString() === userInfo?._id);

    // 1. Fetch Store and Products
    useEffect(() => {
        const fetchStore = async () => {
            setLoading(true);
            try {
                const { data } = await axios.get(`/api/stores/${storeId}`);
                setStore(data);
                setProducts(data.products);
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
        fetchStore();
    }, [storeId]);

    // 2. Review Submission Handler
    const submitReviewHandler = async (e) => {
        e.preventDefault();
        if (!rating || !comment) {
            toast.error('Please select a rating and enter a comment.');
            return;
        }
        setLoadingReview(true);
        try {
            await axios.post(
                `/api/stores/${storeId}/reviews`,
                { rating, comment },
                {
                    headers: { Authorization: `Bearer ${userInfo.token}` },
                }
            );
            toast.success('Review Submitted Successfully!');
            // Simple reload for immediate data refresh
            // NOTE: navigate(0) forces a full page reload, which is quick way to refresh all data.
            // A more elegant solution would be to re-run fetchStore() here.
            navigate(0); 
        } catch (err) {
            toast.error(
                err.response && err.response.data.message
                    ? err.response.data.message
                    : err.message
            );
        } finally {
            setLoadingReview(false);
        }
    };

    // 3. Favorite Toggle Handler
    const toggleFavoriteHandler = async () => {
        if (!userInfo) {
            navigate('/login?redirect=/stores/' + storeId);
            return;
        }
        try {
            const { data: updatedUser } = await axios.put(
                `/api/users/profile/favorite/${storeId}`,
                {},
                {
                    headers: { Authorization: `Bearer ${userInfo.token}` },
                }
            );

            // Dispatch update with the new user info containing the updated favorites list
            dispatch({ type: 'USER_LOGIN', payload: updatedUser }); 
            
            toast.success(
                isFavorite
                    ? 'Store removed from favorites.'
                    : 'Store added to favorites!'
            );
        } catch (err) {
            toast.error('Error updating favorites.');
        }
    };

    return (
        <Container className="py-4">
            <Button className="btn btn-light my-3" onClick={() => navigate(-1)}>
                <i className="fas fa-arrow-left me-2"></i> Go Back
            </Button>
            {loading ? (
                <Loader />
            ) : error ? (
                <Message variant="danger">{error}</Message>
            ) : (
                <>
                    <Helmet>
                        <title>{store.name}</title>
                    </Helmet>
                    
                    {/* Store Header Section (Reduced size to focus on products) */}
                    <Row className="mb-4">
                        <Col md={12}>
                            <Card className="shadow-sm">
                                <Row className="g-0">
                                    <Col md={4}>
                                        <Image
                                            src={store.image}
                                            alt={store.name}
                                            fluid
                                            rounded
                                            style={{ height: '250px', objectFit: 'cover', width: '100%' }}
                                        />
                                    </Col>
                                    <Col md={8}>
                                        <Card.Body>
                                            <h1 className="mb-2 d-flex justify-content-between align-items-center">
                                                {store.name}
                                                <Button
                                                    variant={isFavorite ? 'danger' : 'outline-danger'}
                                                    onClick={toggleFavoriteHandler}
                                                    disabled={userInfo && userInfo.role !== 'customer'} 
                                                    title={userInfo?.role !== 'customer' && userInfo?.role ? 'Only customers can favorite stores' : ''}
                                                    className='ms-3'
                                                >
                                                    <i className={`fas fa-heart ${isFavorite ? 'text-white' : ''} me-1`}></i>{' '}
                                                    {isFavorite ? 'Favorite' : 'Add to Favorites'}
                                                </Button>
                                            </h1>
                                            <Rating
                                                value={store.rating}
                                                text={`${store.numReviews} reviews`}
                                                className='mb-2'
                                            />
                                            <p className="text-muted mb-1">
                                                <i className="fas fa-tag me-2"></i>
                                                Category: <strong className="text-primary">{store.category}</strong>
                                            </p>
                                            <p className="text-muted mb-0">
                                                <i className="fas fa-map-marker-alt me-2"></i>
                                                Address: {store.address.area}, {store.address.city}, {store.address.district}
                                            </p>
                                        </Card.Body>
                                    </Col>
                                </Row>
                            </Card>
                        </Col>
                    </Row>

                    {/* Available Products Section - Now takes full width for visibility */}
                    <Row className="mt-4">
                        <Col md={12}>
                            <h2 className="mb-3 text-dark">Available Products</h2>
                            
                            {products.length === 0 ? (
                                <Message variant="info">This store has no products listed yet.</Message>
                            ) : (
                                <Row xs={1} md={2} className="g-4">
                                    {products.map((product) => (
                                        <Col key={product._id}>
                                            <Card className="shadow-sm h-100">
                                                <Row className="g-0">
                                                    <Col md={4} className='d-flex align-items-center justify-content-center p-3'>
                                                        <Image
                                                            src={product.image || 'https://via.placeholder.com/150'}
                                                            alt={product.name}
                                                            fluid
                                                            rounded
                                                            style={{ height: '150px', width: '100%', objectFit: 'contain' }}
                                                        />
                                                    </Col>
                                                    <Col md={8}>
                                                        <Card.Body>
                                                            {/* Display Name and Price prominently */}
                                                            <div className="d-flex justify-content-between align-items-start mb-2">
                                                                <Card.Title className="mb-0 fw-bold">{product.name}</Card.Title>
                                                                <span className="fw-bolder fs-5 text-success">
                                                                    ₹{parseFloat(product.price).toFixed(2)}
                                                                </span>
                                                            </div>
                                                            {/* Display Full Description */}
                                                            <Card.Text className="text-muted small">
                                                                {product.description}
                                                            </Card.Text>
                                                            {/* Optionally add a 'View Details' button if products had separate pages */}
                                                            {/* <Button variant="outline-primary" size="sm">View Details</Button> */}
                                                        </Card.Body>
                                                    </Col>
                                                </Row>
                                            </Card>
                                        </Col>
                                    ))}
                                </Row>
                            )}
                        </Col>
                    </Row>

                    {/* Reviews Section - Now takes full width and is placed below products */}
                    <Row className="mt-5">
                        <Col md={12}>
                            <h2 className="mb-3">Customer Reviews</h2>
                            {store.reviews.length === 0 && (
                                <Message variant="info">No Reviews Yet</Message>
                            )}
                            <ListGroup variant="flush">
                                {store.reviews.map((review) => (
                                    <ListGroup.Item key={review._id} className="py-3">
                                        <strong>{review.name}</strong>
                                        <Rating value={review.rating} />
                                        <p className="small text-muted mb-1">{review.createdAt.substring(0, 10)}</p>
                                        <p className="mb-0">{review.comment}</p>
                                    </ListGroup.Item>
                                ))}
                            </ListGroup>

                            {/* Write Review Form */}
                            <Card className="p-3 mt-4">
                                <h5>Write a Customer Review</h5>
                                {hasReviewed ? (
                                    <Alert variant='warning'>You have already reviewed this store.</Alert>
                                ) : userInfo && userInfo.role === 'customer' ? (
                                    <Form onSubmit={submitReviewHandler}>
                                        <Form.Group className="mb-3" controlId="rating">
                                            <Form.Label>Rating</Form.Label>
                                            <Form.Control
                                                as="select"
                                                value={rating}
                                                onChange={(e) => setRating(e.target.value)}
                                                required
                                                disabled={loadingReview}
                                            >
                                                <option value="">Select...</option>
                                                <option value="1">1 - Poor</option>
                                                <option value="2">2 - Fair</option>
                                                <option value="3">3 - Good</option>
                                                <option value="4">4 - Very Good</option>
                                                <option value="5">5 - Excellent</option>
                                            </Form.Control>
                                        </Form.Group>
                                        <Form.Group className="mb-3" controlId="comment">
                                            <Form.Label>Comment</Form.Label>
                                            <Form.Control
                                                as="textarea"
                                                rows={3}
                                                value={comment}
                                                onChange={(e) => setComment(e.target.value)}
                                                required
                                                disabled={loadingReview}
                                            ></Form.Control>
                                        </Form.Group>
                                        <Button
                                            disabled={loadingReview || hasReviewed}
                                            type="submit"
                                            variant="primary"
                                        >
                                            {loadingReview ? 'Submitting...' : 'Submit'}
                                        </Button>
                                    </Form>
                                ) : (
                                    <Message variant="info">
                                        Please <Link to={`/login?redirect=/stores/${storeId}`}>sign in</Link> as a **Customer** to write a review.
                                    </Message>
                                )}
                            </Card>
                        </Col>
                    </Row>
                </>
            )}
        </Container>
    );
};

export default StoreDetailScreen;