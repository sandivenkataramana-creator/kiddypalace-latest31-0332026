import React from 'react';
import './AddressCard.css';

const AddressCard = ({ address, onEdit, onDelete, onSetDefault, isDefault }) => {
  return (
    <div className={`address-card ${isDefault ? 'default' : ''}`}>
      {isDefault && <div className="default-badge">Default Address</div>}
      
      <div className="address-content">
        <h3 className="address-name">
          {address.first_name} {address.last_name}
        </h3>
        
        <div className="address-info">
          <p className="address-line">{address.street_address}</p>
          <p className="address-line">
            {address.city}, {address.state} {address.zip_code}
          </p>
          <p className="address-line">{address.country}</p>
        </div>

        <div className="address-contact">
          <p><strong>Phone:</strong> {address.phone}</p>
          <p><strong>Email:</strong> {address.email}</p>
        </div>
      </div>

      <div className="address-actions">
        {!isDefault && (
          <button 
            className="btn-action btn-default"
            onClick={onSetDefault}
            title="Set as default address"
          >
            Set Default
          </button>
        )}
        <button 
          className="btn-action btn-edit"
          onClick={onEdit}
          title="Edit this address"
        >
          Edit
        </button>
        <button 
          className="btn-action btn-delete"
          onClick={onDelete}
          title="Delete this address"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default AddressCard;
