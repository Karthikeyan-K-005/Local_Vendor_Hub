import React from 'react';
import { Spinner } from 'react-bootstrap';

/**
 * @description Renders a centered loading spinner.
 */
const Loader = () => {
  return (
    <div className="d-flex justify-content-center align-items-center py-5">
        <Spinner
          animation="border"
          role="status"
          variant="primary"
          style={{
            width: '80px',
            height: '80px',
          }}
        >
          <span className="visually-hidden">Loading...</span>
        </Spinner>
    </div>
  );
};

export default Loader;