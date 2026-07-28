import React from 'react';
import { Spinner as BootstrapSpinner } from 'react-bootstrap';

function Spinner() {
  return (
    <div className="d-flex justify-content-center align-items-center p-5">
      <BootstrapSpinner animation="border" variant="primary" />
    </div>
  );
}

export default Spinner;
