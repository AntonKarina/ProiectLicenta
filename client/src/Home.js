import React from 'react';
import { Carousel } from 'react-bootstrap';
import dance1 from './images/dance1.jpeg';
import dance2 from './images/dance2.jpeg';
import dance3 from './images/dance3.jpg';

const carouselContainerStyle = {
  maxWidth: '1200px', // Set a maximum width for the carousel container
  margin: '0 auto', // Center the carousel
  padding: '20px', // Add some padding around the carousel
};

const carouselImageStyle = {
  width: '100%',
  height: '450px', // Adjust the height to a smaller size
  objectFit: 'cover',
  objectPosition: 'center',
  zIndex: 1, // Set a lower z-index to ensure it stays behind the dropdown
};

const sectionStyle = {
  padding: '50px',
  textAlign: 'center',
  backgroundColor: '#f9f9f9',
  zIndex: 1, // Ensure section stays behind the navbar and dropdown
};

const sectionTitleStyle = {
  fontSize: '2em', // Standardize for better visual appeal
  marginBottom: '20px',
  color: '#e91e63', // Match with other pink elements for consistency
};

const sectionTextStyle = {
  fontSize: '1.2em',
  color: '#666',
  lineHeight: '1.5',
  maxWidth: '800px',
  margin: '0 auto'
};

const Home = () => (
  <div className ={carouselContainerStyle}>
    <Carousel>
      <Carousel.Item>
        <img className='d-block w-100' src={dance1} alt='First slide' style={carouselImageStyle} />
      </Carousel.Item>
      <Carousel.Item>
        <img className='d-block w-100' src={dance2} alt='Second slide' style={carouselImageStyle} />
      </Carousel.Item>
      <Carousel.Item>
        <img className='d-block w-100' src={dance3} alt='Third slide' style={carouselImageStyle} />
      </Carousel.Item>
    </Carousel>
    <div style={sectionStyle}>
      <h2 style={sectionTitleStyle}>How it works</h2>
      <p style={sectionTextStyle}>
        Welcome to our Dance Competition Management site! Here, you can manage all aspects of dance competitions seamlessly.
        <br /><br />
        <strong>1. Create an Account:</strong> Start by creating an account and logging in to access all features.
        <br /><br />
        <strong>2. Browse Competitions:</strong> Explore various dance competitions listed on our platform.
        <br /><br />
        <strong>3. Register for Competitions:</strong> Register your team for any competition that you find interesting.
        <br /><br />
        <strong>4. Manage Entries:</strong> Keep track of your registrations, update details, and manage your entries with ease.
        <br /><br />
        <strong>5. Stay Updated:</strong> Receive news and updates about upcoming competitions and results.
        <br /><br />
        Join our community of passionate dancers and take your dance journey to the next level!
      </p>
    </div>
  </div>
);

export default Home;
