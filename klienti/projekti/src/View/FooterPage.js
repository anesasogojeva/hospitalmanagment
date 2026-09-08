import React from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import '../CSS/Footer.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPhone, faFax, faMapMarkerAlt, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { faFacebook, faInstagram } from '@fortawesome/free-brands-svg-icons';

export class FooterPage extends React.Component {
    render() {
        return (
            <footer className="footer">
                <Container>
                    <Row>
                        <Col md="3">
                            <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRhYYuts7OIowNO0D3K3WVNx9S36WxX664As8fCDTQeXg&s" alt="HMS  Logo" className="footer-logo" />
                        </Col>
                        <Col md="3">
                            <h5 className="footer-title">Menu</h5>
                            <ul className="list-unstyled">
                                <li><a href="./Home" className='footer-link'>Home</a></li>
                                <li><a href="./about" className='footer-link'>About Us</a></li>
                                <li><a href="/RegisterForm" className='footer-link'>Refer a Patient</a></li>
                                <li><a href="./Reviews" className='footer-link'>Reviews </a></li>
                                <li><a href="./about#contactUs" className='footer-link'>Contact Us</a></li>
                            </ul>
                        </Col>
                        <Col md="3">
                            <h5 className="footer-title">Contact Us</h5>
                            <ul className="list-unstyled">
                                <li><FontAwesomeIcon icon={faPhone} /> (044) xxx-xxx</li>
                                <li><FontAwesomeIcon icon={faFax} /> (038) xxx-xxx</li>
                                <li><FontAwesomeIcon icon={faMapMarkerAlt} /> Dukagjini Prishtine</li>
                                <li><FontAwesomeIcon icon={faEnvelope} /> contact@uswound.com</li>
                            </ul>
                        </Col>
                        <Col md="3">
                            <h5 className="footer-title">Book an Appointment</h5>
                            <p>Reclaim your health and peace of mind.</p>
                            <a href="../ContactForm" className="btn btn-danger">Contact Us Today</a>
                        </Col>
                    </Row>
                    <Row className="social-icons">
                        <Col className="text-right">
                            <a href="https://www.facebook.com/" className="social-icon"><FontAwesomeIcon icon={faFacebook} /></a> 
                             <a href="https://www.instagram.com/" className="social-icon"><FontAwesomeIcon icon={faInstagram} /></a> 
                        </Col>
                    </Row>
                    <Row>
                        <Col className="text-center">
                            <p className="footer-copyright">&copy; {new Date().getFullYear()}  All rights reserved.</p>
                        </Col>
                    </Row>
                </Container>
            </footer>
        );
    }
}

export default FooterPage;
