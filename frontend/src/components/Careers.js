import { useEffect, useState } from "react";
import axios from "axios";
import Header from "./Header";
import Footer from "./Footer";
import { API_BASE_URL } from "./config";
import "./Careers.css";

const Careers = () => {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/api/careers`)
      .then((res) => {
        setContent(res.data?.content || "");
      })
      .catch(() => setContent(""))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Header />

      <div className="careers-container">
        <h1 className="careers-title">Careers</h1>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <pre className="careers-text">
            {content}
          </pre>
        )}
      </div>

      <Footer />
    </>
  );
};

export default Careers;
