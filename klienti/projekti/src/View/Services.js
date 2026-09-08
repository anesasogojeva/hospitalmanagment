import React, { useState, useEffect, Fragment } from 'react';
import ServicesService from '../services/ServicesService';
import Navbar from '../components/Navbar';
import FooterPage from './FooterPage';
import '../CSS/Home.css';
import '../CSS/services.css';

const Services = () => {
  const [services, setServices] = useState([]);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchServices();
  }, []);

  const fetchServices = () => {
    ServicesService.getServices()
      .then((response) => {
        setServices(response.data);
      })
      .catch((error) => {
        console.error('Error fetching services:', error);
      });
  };

  return (
    <Fragment className="bodyHome">
      <Navbar />
      <div className="services-section">
        <h2 className="here">
          <span>Available Services</span>
        </h2>
        <div className="main-servicess">
          {services && services.length > 0 ? (
            services.map((service, index) => (
              <div key={index} className="main-inner-servicess">
                <div className="services-img">
                  <img src={service.stafi} alt={service.emri} />
                </div>
                <div className="servicess-content">
                  <h2>{service.emri}</h2>
                  <p>{service.pershkrimi}</p>
                </div>
              </div>
            ))
          ) : (
            <p>No services available at the moment.</p>
          )}
        </div>
      </div>

      <hr />

      <center>
        <h3>Where can you find us?</h3>
      </center>

      <iframe
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2856.812469825241!2d21.143523503176603!3d42.65200171275375!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x13549ef3f69baacb%3A0xf864a269cc75e908!2sDukagjini%20Residence!5e0!3m2!1sen!2s!4v1682282589650!5m2!1sen!2s"
        width="100%"
        height="450"
        style={{ border: '0' }}
        allowFullScreen=""
        loading="lazy"
      ></iframe>

      <FooterPage />
    </Fragment>
  );
};

export default Services;
