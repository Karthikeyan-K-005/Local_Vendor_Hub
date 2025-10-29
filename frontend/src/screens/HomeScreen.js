import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Row, Col } from 'react-bootstrap';
import axios from 'axios';
import StoreCard from '../components/StoreCard';
import Loader from '../components/Loader';
import Message from '../components/Message';
import { Helmet } from 'react-helmet-async';

const HomeScreen = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { search } = useLocation();
  const keyword = new URLSearchParams(search).get('keyword') || '';

  useEffect(() => {
    const fetchStores = async () => {
      setLoading(true);
      setError(null);
      try {
        // Send keyword to backend API
        const { data } = await axios.get(`/api/stores?keyword=${keyword}`);
        setStores(data);
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
    fetchStores();
  }, [keyword]);

  return (
    <>
      <Helmet>
        <title>{keyword ? `Search Results for "${keyword}"` : 'Welcome to Local Store Hub'}</title>
      </Helmet>
      <h1 className="mb-4">
        {keyword ? (
          <>
            Search Results <small className="text-muted fs-5">({stores.length} found, sorted by top rating)</small>
          </>
        ) : (
          'Nearby Approved Stores'
        )}
      </h1>
      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">{error}</Message>
      ) : stores.length === 0 ? (
        <Message variant="info">
          No stores found {keyword && `matching "${keyword}"`}. Try a different search!
        </Message>
      ) : (
        <Row>
          {stores.map((store) => (
            <Col key={store._id} sm={12} md={6} lg={4} xl={3}>
              <StoreCard store={store} />
            </Col>
          ))}
        </Row>
      )}
    </>
  );
};

export default HomeScreen;
