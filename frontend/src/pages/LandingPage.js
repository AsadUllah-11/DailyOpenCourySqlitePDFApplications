import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Shield, Scale, Users, Award, TrendingUp, Phone } from 'lucide-react';
import './LandingPage.css';
// ⭐ Import images from assets folder
import { sliderImages } from '../assets/slider-images';
import CasesCounter from '../components/CasesCounter';
import ImageSlider from '../components/ImageSlider';
import CardCarousel from '../components/CardCarousel';



const LandingPage = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  // Images are imported directly - no URL needed!  
  useEffect(() => {
    console.log('🖼️ Images loaded:', sliderImages. length);
    console.log('First image:', sliderImages[0]);
  }, []);

  // Auto-slide every 5 seconds
  useEffect(() => {
    if (sliderImages.length === 0) return;
    
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sliderImages.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % sliderImages.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + sliderImages.length) % sliderImages.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const features = [
    {
      icon: Shield,
      title: 'Secure & Reliable',
      description: 'Advanced security measures to protect sensitive data'
    },
    {
      icon: Scale,
      title: 'Justice Management',
      description: 'Streamlined case handling and tracking system'
    },
    {
      icon: Users,
      title: 'User-Friendly',
      description:  'Intuitive interface for all stakeholders'
    },
    {
      icon: Award,
      title: 'Excellence',
      description: 'Committed to delivering quality service'
    },
    {
      icon: TrendingUp,
      title: 'Analytics',
      description: 'Comprehensive data insights and reporting'
    },
    {
      icon: Phone,
      title: '24/7 Support',
      description: 'Round-the-clock assistance available'
    }
  ];

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-overlay"></div>
        
        {/* Navigation Bar */}
        <nav className="landing-nav">
          <div className="nav-content">
            <div className="logo-section">
              <img 
                src="/punjab-police-logo.png" 
                alt="Punjab Police" 
                className="nav-logo"
                onError={(e) => e.target.style.display = 'none'}
              />
              <h1 className="nav-title">Daily Open Court</h1>
            </div>
            <button onClick={() => navigate('/login')} className="login-btn-nav">
              Login
            </button>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="hero-content">
          

           {/* Hero Text - NOW BELOW SLIDER */}
           <div className="hero-text">
            {/* Title with Logo Inline */}
            <div className="hero-title-section">
              {/* <img 
                src="/punjab-police-logo.png" 
                alt="Punjab Police" 
                className="hero-title-logo"
                onError={(e) => e.target.style.display = 'none'}
              /> */}
              <h1 className="hero-title">Daily Open Court — DIG Operations, Faisal Kamran</h1>
            </div>
            {/* <p className="hero-subtitle">DIG Operations Faisal Kamran</p> */}
            <p className="hero-description">
              A comprehensive digital solution for managing open court hearings, 
              applications, and justice delivery across Punjab Police stations.
            </p>
            <div className="hero-buttons">
              <button onClick={() => navigate('/login')} className="btn-primary-hero">
                Get Started
              </button>
              <button onClick={() => navigate('/login')} className="btn-secondary-hero">
                Learn More
              </button>
            </div>
          </div>
         

          {/* <div className="slider-container-fullwidth">
            {sliderImages.length === 0 ? (
              <div className="slider-loading">
                <Shield size={64} />
                <p>No images loaded</p>
                <p style={{fontSize: '0.8rem', marginTop: '1rem'}}>
                  Check:  frontend/src/assets/slider-images/
                </p>
              </div>
            ) : (
              <div className="slider-wrapper">  
                {sliderImages.map((image, index) => (
                  <div
                    key={index}
                    className={`slide ${index === currentSlide ? 'active' : ''}`}
                  >
                    <img 
                      src={image} 
                      alt={`Punjab Police Open Court ${index + 1}`}
                      className="slide-image"
                      onLoad={() => console.log(`Image ${index + 1} loaded successfully`)}
                      onError={(e) => {
                        console.error(` Failed to load image ${index + 1}`);
                        e.target. style.display = 'none';
                        e.target.parentElement.classList.add('slide-error');
                      }}
                    />
                    
                    <div className="slide-fallback">
                      <Shield size={64} />
                      <p>Punjab Police</p>
                    </div>
                  </div>
                ))}

                <button className="slider-btn prev" onClick={prevSlide} aria-label="Previous slide">
                  <ChevronLeft size={24} />
                </button>
                <button className="slider-btn next" onClick={nextSlide} aria-label="Next slide">
                  <ChevronRight size={24} />
                </button>

                <div className="slider-dots">
                  {sliderImages.map((_, index) => (
                    <button
                      key={index}
                      className={`dot ${index === currentSlide ? 'active' : ''}`}
                      onClick={() => goToSlide(index)}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>

              </div>
            )}
          </div> */}
      {/* <section className="image-slider-section">
        <ImageSlider />
      </section> */}
         
       
      <section >
        <CardCarousel />
      </section>
      
      <section>   
          <CasesCounter />

         </section>
        </div>
      </section>  

      {/* Features Section */}
      <section className="features-section">
        <div className="section-container">
          <h2 className="section-title">Key Features</h2>
          <p className="section-subtitle">
            Empowering law enforcement with modern technology
          </p>
          
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">
                  <feature.icon size={32} />
                </div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature. description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="section-container">
          <div className="stats-grid">
            <div className="stat-item">
              <h3 className="stat-number stat-cases">1000+</h3>
              <p className="stat-label stat-cases-text">Applications Processed</p>
            </div>
            <div className="stat-item ">
              <h3 className="stat-number stat-stations">50+</h3>
              <p className="stat-label stat-stations-text">Police Stations</p>
            </div>
            <div className="stat-item ">
              <h3 className="stat-number stat-availability">24/7</h3>
              <p className="stat-label stat-availability-text" >System Availability</p>
            </div>
            <div className="stat-item ">
              <h3 className="stat-number stat-security">100%</h3>
              <p className="stat-label stat-security-text">Data Security</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2 className="cta-title">Ready to Get Started?</h2>
          <p className="cta-description">
            Join the Punjab Police digital transformation initiative today
          </p>
          <button onClick={() => navigate('/login')} className="cta-button">
            Access System
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-section">
            <img 
              src="/punjab-police-logo.png" 
              alt="Punjab Police" 
              className="footer-logo"
              onError={(e) => e.target.style.display = 'none'}
            />
            <h3>Daily Open Court</h3>
            <p>Punjab Police Management System</p>
          </div>
          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li><a href="#features">Features</a></li>
              <li><a href="#about">About</a></li>
              <li><a href="#contact">Contact</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Contact</h4>
            <p>Punjab Police Headquarters</p>
            <p>Lahore, Punjab, Pakistan</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 Daily Open Court. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;