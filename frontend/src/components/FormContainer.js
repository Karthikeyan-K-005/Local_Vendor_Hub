import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

/**
 * @description Wraps forms for consistent layout (centered, limited width).
 */
const FormContainer = ({ children }) => {
  return (
    <Container className="py-3">
      <Row className="justify-content-md-center">
        {/* Limits width to 100% on small screens, 50% on medium and up */}
        <Col xs={12} md={6}> 
          <div className="p-4 border rounded shadow-lg bg-white">
            {children}
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default FormContainer;