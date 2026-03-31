

import { useEffect, useState } from "react";
import axios from "axios";
import Header from "./Header";
import Footer from "./Footer";
import { API_BASE_URL } from "./config";
import "./About.css";

const About = () => {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/api/about`)
      .then((res) => {
        setContent(res.data?.content || "");
      })
      .catch(() => setContent(""))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Header />

      <div className="about-container">
        <h1 className="about-title">About Us</h1>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <pre className="about-text">
            {content}
          </pre>
        )}
      </div>

      <Footer />
    </>
  );
};

export default About;
