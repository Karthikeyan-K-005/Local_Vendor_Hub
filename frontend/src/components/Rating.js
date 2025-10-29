import React from 'react';

/**
 * @description Renders a star rating component.
 * @param {number} value - The rating value (0 to 5).
 * @param {string} text - Optional text to display next to the stars (e.g., number of reviews).
 */
const Rating = ({ value, text }) => {
  // Define a constant for the star color for professional consistency
  const starColor = '#ffc107'; // Bootstrap's default yellow/warning color

  return (
    <div className="rating d-flex align-items-center">
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i}>
          <i
            style={{ color: starColor }}
            className={
              value >= i
                ? 'fas fa-star'
                : value >= i - 0.5
                ? 'fas fa-star-half-alt'
                : 'far fa-star'
            }
          ></i>
        </span>
      ))}
      <span className="ms-2 text-muted small">{text && text}</span>
    </div>
  );
};

export default Rating;