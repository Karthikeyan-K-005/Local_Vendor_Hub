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

  // Upload Image Handler
  const uploadFileHandler = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);
    
    // 1. Clear previous URL to show new upload started
    setImage(''); 
    setLoadingUpload(true);
    
    try {
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      const { data } = await axios.post('/api/upload', formData, config);
        
      setImage(data.image); // Success: Set the URL
      toast.success('Image uploaded successfully! Ready to submit.');
    } catch (err) {
      toast.error('Image upload failed. Please try again.');
      e.target.value = null; // Clear file input on failure
    } finally {
      setLoadingUpload(false);
    }
  };

  // Submit Request Handler 
  const submitHandler = async (e) => {
    e.preventDefault();
    
    // This client-side check ensures they provided required non-image fields.
    // Image is sent as an empty string if not uploaded (since it's optional).
    
    setLoading(true);
    try {
      await axios.post(
        '/api/stores/request',
        {
          name,
          image, // Will be empty string or Cloudinary URL
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
        {/* Store Name */}
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

        {/* Category */}
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

        {/* Streamlined Image Upload Field for clean alignment */}
        <Form.Group controlId="image-upload" className="mb-3">
          <Form.Label className="fw-bold">Store Image (Optional)</Form.Label>
          
          <Form.Control
            type="file"
            onChange={uploadFileHandler}
            disabled={loadingUpload} 
          />
          
          {/* Conditional User Feedback */}
          {loadingUpload && <p className="text-info small mt-2">Uploading image... Please wait.</p>}
          {/* Show confirmation that the URL state is set */}
          {image && !loadingUpload && (
            <p className="text-success small mt-2">
              <i className="fas fa-check-circle"></i> Image URL set successfully.
            </p>
          )}
        </Form.Group>
        
        {/* Store Address Fields (Unchanged, using Row/Col for good alignment) */}
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
          // Disabled if form is submitting OR image is actively uploading
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
