
import React from "react";
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaFacebookF, FaTwitter, FaInstagram, FaCreditCard, FaGooglePay } from "react-icons/fa";
import "./Footer.css";
import { useNavigate } from "react-router-dom";

const Footer = () => {
  const navigate = useNavigate(); 


  return (
  <footer className="footer">
    <div className="footer-container">
      <div className="footer-content">
        {/* Info Section */}
        <div className="footer-section">
          <h3>Info</h3>
          <ul>
            <li><a onClick={() => navigate("/about")} style={{ cursor: "pointer" }}>About Us</a></li>
            <li><a onClick={() => navigate("/careers")} style={{ cursor: "pointer" }}>Careers</a></li> 
            <li><a href="/stores">Stores</a></li>
           </ul>
        </div> 

        {/* Quick Links Section */}
        <div className="footer-section">
          <h3>Quick Links</h3>
          <ul>
            {/* <li><a href="https://99wholesale.com" target="_blank" rel="noopener noreferrer">FAQs </a></li> */}
            <li><a href="#new-arrivals">FAQs</a></li>
            <li>
  <a 
  style={{ cursor: "pointer" }}
    onClick={() => navigate("/products?new=true")}
  >
    New Arrivals
  </a>
</li>

            {/* <li><a href="#trending">Trending Products  </a></li> */}
<li>
  <a
    style={{ cursor: "pointer" }}
    onClick={() => navigate('/products?discount=high')}
  >
    Trending Products
  </a>
</li>


            <li><a href="#corporate">Corporate & Bulk Purchasing</a></li>
          </ul>
        </div>

        {/* Policies Section */}
        <div className="footer-section">
          <h3>Policies</h3>
          <ul>
              <li><a href="#disclaimer">Disclaimer</a></li>
               <li><a href="#privacy">Privacy Policy</a></li>
               <li><a href="#shipping">Shipping Policy</a></li>
            <li><a href="#terms">Terms & Conditions</a></li>
            <li><a href="#refund">Refund & Cancellation Policy</a></li>  
          </ul>
        </div>

        {/* Contact Us Section */}
        <div className="footer-section">
          <h3>Contact Us</h3>
          <ul className="contact-list">
            <li><FaPhoneAlt /> <a href="tel:+91 7075 004 435">+91 7075 004 435</a></li>
            <li><FaEnvelope /> <a href="mailto:kiddypalace@ecommerce.com">kiddypalace.ind@gmail.com </a></li>
       <ul className="contact-locations">
  <li>
    <a
      href="https://www.google.com/maps/place/Kiddy+Palace/@17.3978487,78.3547602,16.5z/data=!4m6!3m5!1s0x3bcb95c3dbdd0f51:0x42383722cfa45db3!8m2!3d17.3952293!4d78.3536138!16s%2Fg%2F11yn2l60y2"
      target="_blank"
      rel="noopener noreferrer"
    >
      <FaMapMarkerAlt />
     Narsingi - 70750 04435 
    </a>
  </li>

  <li>
    <a
      href="https://maps.app.goo.gl/GhHuPQJrWw1n2XF98"
      target="_blank"
      rel="noopener noreferrer"
    >
      <FaMapMarkerAlt />
     Nanakramguda - 92912 55974
    </a>
  </li>

  <li>
    <a
      href="https://maps.app.goo.gl/F2n5Bmf44XNTkgTG9"
      target="_blank"
      rel="noopener noreferrer"
    >
      <FaMapMarkerAlt />
      Nallagandla - 70758 84435
    </a>
  </li>
</ul>
</ul>
          {/* Social Media Links */}
          {/* <div className="social-links">
            <a href="#facebook" aria-label="Facebook"><FaFacebookF /></a>
            <a href="#twitter" aria-label="Twitter"><FaTwitter /></a>
            <a href="#instagram" aria-label="Instagram"><FaInstagram /></a>
            
          </div> */}
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} kiddypalace. All rights reserved.</p>
        
      </div>
    </div>
  </footer>
  );
};

export default Footer;
