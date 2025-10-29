// frontend/src/screens/StoreRequestScreen.js

import React, { useState } from 'react';
import { Form, Button, Row, Col } from 'react-bootstrap';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useStore } from '../../store';
import FormContainer from '../../components/FormContainer';
import { Helmet } from 'react-helmet-async';
import { STORE_CATEGORIES } from '../../constants/storeConstants';

const StoreRequestScreen = () => {
  const [name, setName] = useState('');
  const [image, setImage] = useState(''); // This holds the Cloudinary URL after successful upload
  const [category, setCategory] = useState(STORE_CATEGORIES[0]);
  const [area, setArea] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingUpload, setLoadingUpload] = useState(false);

  const { state } = useStore();
  const { userInfo } = state;

  // Upload Image Handler
  const uploadFileHandler = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('image', file);
    setLoadingUpload(true);
    try {
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      const { data } = await axios.post('/api/upload', formData, config);
      
      // ✅ FIX: This line AUTO-FILLS the 'image' state with the URL returned from the backend
      // Ensure your backend returns the URL as data.image
      setImage(data.image); 
      
      toast.success('Image uploaded successfully!');
    } catch (err) {
      toast.error('Image upload failed.');
    } finally {
      setLoadingUpload(false);
    }
  };

  // Submit Request Handler
  const submitHandler = async (e) => {
    e.preventDefault();
    
    // ✅ FIX: Client-side validation to ensure an image was uploaded
    if (!image) {
      toast.error('Please upload a store image before submitting the request.');
      return;
    }
    
    setLoading(true);
    try {
      await axios.post(
        '/api/stores/request',
        {
          name,
          image, // Sent from state, which was set by the successful upload
          category,
          address: { area, city, district },
        },
        {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        }
      );
      toast.success(
        'Store creation request sent to Admin successfully! Please wait for approval.'
      );
      // Reset form
      setName('');
      setImage('');
      setArea('');
      setCity('');
      setDistrict('');
      setCategory(STORE_CATEGORIES[0]);
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
        <title>Request New Store</title>
      </Helmet>
      <h1 className="text-center mb-4 text-primary">Request New Store</h1>
      <Form onSubmit={submitHandler} className="p-3 border rounded shadow-sm bg-white">
        
        {/* Store Name Field (Unchanged) */}
        <Form.Group className="mb-3" controlId="name">
          <Form.Label className="fw-bold">Store Name</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter store name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          ></Form.Control>
        </Form.Group>

        {/* Category Field (Unchanged) */}
        <Form.Group className="mb-3" controlId="category">
          <Form.Label className="fw-bold">Category</Form.Label>
          <Form.Select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            {STORE_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </Form.Select>
        </Form.Group>

        {/* 🚨 MODIFIED: Image Upload Field (No manual URL input) */}
        <Form.Group controlId="image-upload" className="mb-3">
          <Form.Label className="fw-bold">Store Image</Form.Label>
          <Form.Control
            type="file"
            onChange={uploadFileHandler}
            disabled={loadingUpload}
          />
          {loadingUpload && <p className="text-muted mt-2">Uploading image...</p>}
        </Form.Group>
        
        {/* Visual Confirmation of Successful Upload */}
        {image && (
          <p className="text-success small">
            <i className="fas fa-check-circle"></i> Image uploaded and URL set successfully.
          </p>
        )}

        {/* Address Fields (Unchanged) */}
        <h5 className="mt-4 mb-3 text-secondary">Store Address</h5>
        {/* ... (Address fields JSX remain here) ... */}
        <Row>
          <Col md={4}>
            <Form.Group className="mb-3" controlId="area">
              <Form.Label>Area</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter area"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                required
              ></Form.Control>
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group className="mb-3" controlId="city">
              <Form.Label>City</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
              ></Form.Control>
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group className="mb-3" controlId="district">
              <Form.Label>District</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter district"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                required
              ></Form.Control>
            </Form.Group>
          </Col>
        </Row>

        <Button 
          disabled={loading || loadingUpload || !image} // Button disabled if no image is uploaded
          type="submit" 
          variant="primary" 
          className="w-100 mt-4"
        >
          {loading ? 'Submitting Request...' : 'Submit Store Request'}
        </Button>
      </Form>
    </FormContainer>
  );
};

export default StoreRequestScreen;
