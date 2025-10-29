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
  const [image, setImage] = useState(''); // Holds the Cloudinary URL
  const [category, setCategory] = useState(STORE_CATEGORIES[0]);
  const [area, setArea] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingUpload, setLoadingUpload] = useState(false);

  const { state } = useStore();
  const { userInfo } = state;

  // Upload Image Handler - Automatically triggers on file selection
  const uploadFileHandler = async (e) => {
    const file = e.target.files[0];
    if (!file) return; 

    const formData = new FormData();
    formData.append('image', file);
    setLoadingUpload(true);
    setImage(''); // Clear previous image state during upload
    
    try {
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      
      const { data } = await axios.post('/api/upload', formData, config);
      
      setImage(data.image); // State is set with the Cloudinary URL
      
      toast.success('Image uploaded successfully! Ready to submit.');
    } catch (err) {
      toast.error('Image upload failed. Please try again.');
      // IMPORTANT: Clear the input file *only* on failure to encourage re-upload
      e.target.value = null; 
    } finally {
      setLoadingUpload(false);
    }
  };

  // Submit Request Handler
  const submitHandler = async (e) => {
    e.preventDefault();
    
    // Client-side validation: must have a non-empty image URL
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
          image,
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
      // Reset form on success
      setName('');
      setImage('');
      setArea('');
      setCity('');
      setDistrict('');
      setCategory(STORE_CATEGORIES[0]);
    } catch (err) {
      toast.error(
        err.response?.data?.message || err.message
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

        {/* Image Upload Field */}
        <Form.Group controlId="image-upload" className="mb-3">
          <Form.Label className="fw-bold">Store Image</Form.Label>
          <p className="text-muted small mb-1">
            {image ? 'Image ready to submit.' : 'Upload the main store image.'}
          </p>
          
          <Form.Control
            type="file"
            onChange={uploadFileHandler}
            disabled={loadingUpload} 
          />
          
          {/* User Feedback */}
          {loadingUpload && <p className="text-info mt-2">Uploading image... Please wait.</p>}
        </Form.Group>
        
        {/* Visual Confirmation of Successful Upload */}
        {image && !loadingUpload && (
          <p className="text-success small">
            <i className="fas fa-check-circle"></i> Upload Complete: Ready to submit request.
          </p>
        )}

        {/* Address Fields (Unchanged) */}
        <h5 className="mt-4 mb-3 text-secondary">Store Address</h5>
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
          // 🚨 Button is now disabled only when busy (loading or uploading)
          disabled={loading || loadingUpload} 
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
