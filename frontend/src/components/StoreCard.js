import React from 'react';
import { Card, Button, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import Rating from './Rating';

/**
 * @description Displays a single store item card for the homepage/search results.
 */
const StoreCard = ({ store }) => {
  return (
    <Card className="my-3 rounded h-100 shadow-lg border-0 hover-lift">
      <Link to={`/stores/${store._id}`}>
        <Card.Img
          src={store.image}
          variant="top"
          // Professional, consistent image size
          style={{ height: '180px', objectFit: 'cover' }} 
          alt={store.name}
        />
      </Link>

      <Card.Body className="d-flex flex-column">
        <div className="d-flex justify-content-between align-items-start mb-2">
            <Link to={`/stores/${store._id}`} className="text-decoration-none">
              <Card.Title as="h5" className="text-dark fw-bold text-truncate" title={store.name}>
                {store.name}
              </Card.Title>
            </Link>
            {/* Added a stylish badge for category */}
            <Badge bg="info" className="text-uppercase ms-2 py-1 px-2">
                {store.category}
            </Badge>
        </div>

        <Card.Text as="div" className="mb-2">
          <Rating value={store.rating} text={`${store.numReviews} Reviews`} />
        </Card.Text>

        <Card.Text as="p" className="text-muted small mb-3">
          <i className="fas fa-map-marker-alt me-1"></i> {store.address.area}, {store.address.city}
        </Card.Text>

        <Link to={`/stores/${store._id}`} className="mt-auto">
          <Button variant="primary" className="w-100 fw-medium">
            View Store
          </Button>
        </Link>
      </Card.Body>
    </Card>
  );
};

export default StoreCard;