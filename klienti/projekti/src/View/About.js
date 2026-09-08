import React, { useEffect, useRef } from 'react';
import '../CSS/AboutUs.css';
import Navbar from '../components/Navbar';
import FooterPage from './FooterPage';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStethoscope, faSyringe, faHospital } from '@fortawesome/free-solid-svg-icons';
import ContactForm from './ContactForm'; // Import the ContactForm component

const About = () => {
  const statRefs = useRef([]);

  useEffect(() => {
    // Full page navigations to /About#contactUs land here before React has rendered
    // the ContactForm, so the browser's native anchor scroll finds nothing. Scroll
    // to it manually once the section actually exists in the DOM.
    if (window.location.hash === '#contactUs') {
      const target = document.getElementById('contactUs');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, []);

  useEffect(() => {
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    };
  
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const element = entry.target;
          const targetNumber = parseInt(element.getAttribute('data-target'), 10);
          const speed = 200;
  
          const updateCount = () => {
            const currentNumber = parseInt(element.innerText, 10);
            const increment = targetNumber / speed;
            if (currentNumber < targetNumber) {
              element.innerText = Math.ceil(currentNumber + increment);
              setTimeout(updateCount, 10);
            } else {
              element.innerText = targetNumber;
            }
          };
  
          updateCount();
          observer.unobserve(entry.target);
        }
      });
    }, options);
  
    statRefs.current.forEach(stat => {
      if (stat) observer.observe(stat);
    });
  
    return () => {
      if (statRefs.current) {
        statRefs.current.forEach(stat => {
          if (stat) {
            observer.unobserve(stat);
          }
        });
      }
      observer.disconnect(); // Clear the observer
    };
  }, []);
  

  return (
    <div className="about-us-container">
      <div id="navi">
        <Navbar />
      </div>
      <br />

      <div className="sections-grid">
        <section className="section-item intro-section">
          <h1>About Our Hospital Management System</h1>
          <p>
            Our Hospital Management System is designed to streamline hospital operations, enhance patient care, and improve the overall healthcare experience. We provide comprehensive solutions that cater to the diverse needs of modern healthcare facilities.
          </p>
        </section>

        <section className="section-item mission-section">
          <h2>Our Mission</h2>
          <p>
            To empower healthcare providers with the tools and technology they need to deliver exceptional patient care and operate efficiently. We are committed to innovation, quality, and reliability in healthcare management.
          </p>
        </section>

        <section className="section-item vision-section">
          <h2>Our Vision</h2>
          <p>
            To be a global leader in healthcare management solutions, enabling hospitals to focus on what they do best: caring for patients. We envision a future where healthcare is accessible, efficient, and patient-centered.
          </p>
        </section>

        <section className="section-item history-section">
          <h2>Our History</h2>
          <p>
            Founded in 2010, our journey began with a simple goal: to make hospital management more efficient and effective. Over the years, we have grown into a trusted partner for healthcare institutions worldwide, continually evolving our platform to meet the changing needs of the industry.
          </p>
        </section>
      </div>

      <section className="stats-section">
        <div className="stats-container">
          <div className="main-stats">
            <div className="stat">
              <h2 ref={(el) => statRefs.current[0] = el} data-target="32654">0</h2>
              <p>INPATIENTS</p>
            </div>
            <div className="stat">
              <h2 ref={(el) => statRefs.current[1] = el} data-target="568865">0</h2>
              <p>OUTPATIENTS</p>
            </div>
          </div>
          <p className="subtitle">that choose HMS each year</p>
          <div className="detailed-stats">
            <div className="detail">
              <h3 ref={(el) => statRefs.current[2] = el} data-target="3">0</h3>
              <p>ACUTE-CARE HOSPITALS</p>
            </div>
            <div className="detail">
              <h3 ref={(el) => statRefs.current[3] = el} data-target="16">0</h3>
              <p>URGENT CARE CENTERS</p>
            </div>
            <div className="detail">
              <h3 ref={(el) => statRefs.current[4] = el} data-target="11">0</h3>
              <p>HEALTH & WELLNESS CENTERS</p>
            </div>
            <div className="detail">
              <h3 ref={(el) => statRefs.current[5] = el} data-target="1800">0</h3>
              <p>NETWORK OF PHYSICIANS</p>
            </div>
            <div className="detail">
              <h3 ref={(el) => statRefs.current[6] = el} data-target="100">0</h3>
              <p>ALLIED HEALTH MEMBERS</p>
            </div>
            <div className="detail">
              <h3 ref={(el) => statRefs.current[7] = el} data-target="8000">0</h3>
              <p>EMPLOYEES</p>
            </div>
            <div className="detail">
              <h3 ref={(el) => statRefs.current[8] = el} data-target="2000">0</h3>
              <p>VOLUNTEERS</p>
            </div>
          </div>
        </div>
      </section>

      <div className="services-container">
        <div className="service-box">
          <div className="icon">
            <FontAwesomeIcon icon={faStethoscope} size="3x" />
          </div>
          <h3>Appointment Guides</h3>
          <p>Take a short quiz to prepare for your appointment and build a list of important questions to ask your doctor.</p>
        </div>

        <div className="service-box">
          <div className="icon">
            <FontAwesomeIcon icon={faSyringe} size="3x" />
          </div>
          <h3>Video A-Z</h3>
          <p>Watch compelling stories from real patients and doctors about treating and living with conditions like cancer, diabetes, HIV, asthma, and more.</p>
        </div>

        <div className="service-box">
          <div className="icon">
            <FontAwesomeIcon icon={faHospital} size="3x" />
          </div>
          <h3>Editorial Collections</h3>
          <p>Find comprehensive information about chronic conditions from expert specialists and personal perspectives from real patients.</p>
        </div>
      </div>

      {/* Contact form section */}
      <div id="contactUs">  {/* Adding ID for anchor linking */}
  <ContactForm />  {/* Add the ContactForm component here */}  {/* Add the ContactForm component here */}
      
      
      
      <href></href>
      <center><h3>Where can you find us?</h3></center>
      <br />
      <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2856.812469825241!2d21.143523503176603!3d42.65200171275375!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x13549ef3f69baacb%3A0xf864a269cc75e908!2sDukagjini%20Residence!5e0!3m2!1sen!2s!4v1682282589650!5m2!1sen!2s"
        width="100%"
        height="450"
        style={{ border: "0" }}
        allowFullScreen=""
        loading="lazy">
      </iframe>
      <FooterPage />

</div>
    </div>
  );
};

export default About;
