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
  const [image, setImage] = useState('');
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
    if (!file) return; // Added check for safety
    
    const formData = new FormData();
    formData.append('image', file);
    
    setImage(''); // Clear URL field before starting upload
    setLoadingUpload(true);
    
    try {
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      const { data } = await axios.post('/api/upload', formData, config);
      
      // 🚀 FIX: This call now successfully updates the 'value={image}' in the Form.Control
      setImage(data.image); 
      toast.success('Image uploaded and URL filled successfully!');
    } catch (err) {
      toast.error('Image upload failed.');
    } finally {
      setLoadingUpload(false);
    }
  };

  // Submit Request Handler (Unchanged)
  const submitHandler = async (e) => {
    e.preventDefault();
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
      // Reset form
      setName('');
      setImage('');
      setArea('');
      setCity('');
      setDistrict('');
      setCategory(STORE_CATEGORIES[0]); // Reset category to default
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

        {/* Image Upload */}
        <Form.Group controlId="image" className="mb-3">
          <Form.Label className="fw-bold">Store Image URL</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter image URL"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            // 🛑 FIX: Removed 'required' attribute to allow auto-filling from upload handler
          ></Form.Control>
          <Form.Label className="mt-2 text-muted small">Or Upload Image</Form.Label>
          <Form.Control
            type="file"
            onChange={uploadFileHandler}
            disabled={loadingUpload}
          />
          {loadingUpload && <p className="text-muted mt-2">Uploading image...</p>}
        </Form.Group>
        {image && <p className="text-success small">Image Path: **{image}**</p>}

        {/* Address Fields */}
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

        <Button disabled={loading || loadingUpload} type="submit" variant="primary" className="w-100 mt-4">
          {loading ? 'Submitting Request...' : 'Submit Store Request'}
        </Button>
      </Form>
    </FormContainer>
  );
};

export default StoreRequestScreen;
