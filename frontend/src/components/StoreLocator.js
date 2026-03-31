import React, { useEffect, useState } from "react";
import { API_BASE_URL } from "./config";
import "./Store.css";
import Header from "./Header";
import Footer from "./Footer";

const StoreLocator = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/stores`)
      .then((r) => r.json())
      .then((data) => {
        if (data && data.stores) setStores(data.stores);
      })
      .catch((err) => console.error("Failed to load stores", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <>
        <Header />
        <div className="stores-page container">Loading stores...</div>
        <Footer />
      </>
    );

  return (
    <>
      <Header />

      <div className="stores-page container">
        <h1>Our Stores</h1>

        <div className="stores-list">
          {stores.map((store, index) => {
            const isEven = index % 2 === 1; // 2nd,4th,6th...

            return (
              <div key={store.id} className="store-row">
                {/* LEFT SIDE */}
                <div className="store-col">
                  {isEven ? (
                    <div className="store-info">
                      <h3>{store.name}</h3>
                      <p className="address">{store.address}</p>
                      <p className="meta">
                        {store.city}, {store.state} {store.postal_code}
                      </p>
                      <p className="contact">
                        {store.phone} <br />
                        {store.email}
                      </p>
                      {store.open_hours && (
                        <p className="hours">Open Hours: {store.open_hours}</p>
                      )}
                    </div>
                  ) : (
                    <div className="store-image">
                      {store.image_url ? (
                        <img
                          src={`${API_BASE_URL}${store.image_url}`}
                          alt={store.name}
                        />
                      ) : (
                        <div className="no-image">No Image</div>
                      )}
                    </div>
                  )}
                </div>

                {/* RIGHT SIDE */}
                <div className="store-col">
                  {isEven ? (
                    <div className="store-image">
                      {store.image_url ? (
                        <img
                          src={`${API_BASE_URL}${store.image_url}`}
                          alt={store.name}
                        />
                      ) : (
                        <div className="no-image">No Image</div>
                      )}
                    </div>
                  ) : (
                    <div className="store-info">
                      <h3>{store.name}</h3>
                      <p className="address">{store.address}</p>
                      <p className="meta">
                        {store.city}, {store.state} {store.postal_code}
                      </p>
                      <p className="contact">
                        {store.phone} <br />
                        {store.email}
                      </p>
                      {store.open_hours && (
                        <p className="hours">Open Hours: {store.open_hours}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Footer />
    </>
  );
};

export default StoreLocator;
