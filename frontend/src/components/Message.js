import React from 'react';
import { Alert } from 'react-bootstrap';

/**
 * @description Renders a Bootstrap Alert message.
 * @param {string} variant - Alert color variant (e.g., 'danger', 'success').
 */
const Message = ({ variant = 'info', children }) => {
  return <Alert variant={variant}>{children}</Alert>;
};

export default Message;