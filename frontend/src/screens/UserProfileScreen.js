import React from 'react';
import { Row, Col, Alert, Card, ListGroup } from 'react-bootstrap';
import { Helmet } from 'react-helmet-async';
import { useStore } from '../store';
import StoreCard from '../components/StoreCard';
import Message from '../components/Message';

const UserProfileScreen = () => {
  const { state } = useStore();
  const { userInfo } = state;

  if (userInfo?.role !== 'customer') {
    return (
      <Alert variant="danger" className="text-center">
        Access Denied. Only Customer profiles can view this page.
      </Alert>
    );
  }

  return (
    <>
      <Helmet>
        <title>Customer Profile</title>
      </Helmet>
      <h1 className="mb-4">Hello {userInfo.name}</h1>

      <Row>
        <Col md={4} className="mb-4">
          <Card className="shadow-sm">
            <Card.Header as="h5">My Details</Card.Header>
            <ListGroup variant="flush">
              <ListGroup.Item>Name: {userInfo.name}</ListGroup.Item>
              <ListGroup.Item>Email: {userInfo.email}</ListGroup.Item>
              <ListGroup.Item>Role: <span className="text-primary fw-bold">{userInfo.role.toUpperCase()}</span></ListGroup.Item>
            </ListGroup>
          </Card>
        </Col>

        <Col md={8}>
          <h2 className="mb-3">My Favorite Stores</h2>
          {userInfo.favorites?.length === 0 ? (
            <Message variant="info">You haven't added any favorite stores yet.</Message>
          ) : (
            <Row>
              {userInfo.favorites?.map((store) => (
                <Col key={store._id} sm={12} md={6} lg={6}>
                  <StoreCard store={store} />
                </Col>
              ))}
            </Row>
          )}
        </Col>
      </Row>
    </>
  );
};

export default UserProfileScreen;