import React, { useState, useEffect, useMemo } from 'react';
import './CardCarousel.css';

const CardCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(2);
  const [isHovered, setIsHovered] = useState(false);

  // 🔹 Load all images from folder
  const sliderImages = useMemo(() => {
    const context = require.context(
      '../assets/slider-images',   // adjust path if needed
      false,
      /\.(png|jpe?g|svg)$/
    );

    return context.keys().map(context);
  }, []);

  // 🔹 Create slides dynamically
  const slides = useMemo(() => {
    return sliderImages.map((image, index) => ({
      id: index,
      image: image,
      title: `Punjab Police ${index + 1}`,
      icon: '🏢'
    }));
  }, [sliderImages]);

  const totalSlides = slides.length;

  useEffect(() => {
    if (totalSlides === 0 || isHovered) return;
  
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % totalSlides);
    }, 2000);
  
    return () => clearInterval(interval);
  }, [totalSlides, isHovered]);
  

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  return (
    <div className="carousel-wrapper">

      {slides.length === 0 ? (
        <p style={{ textAlign: 'center' }}>
          No images found in slider-images folder
        </p>
      ) : (

        <>
          <div
            className="carousel-container"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <div
              className="carousel-track"
              style={{
                transform: `translateX(calc(-${currentIndex * 320}px + 50% - 150px))`
              }}
            >
              {slides.map((slide) => (
                <div key={slide.id} className="carousel-card">
                  <img src={slide.image} alt={slide.title} />
                  <div className="card-overlay">
                    {/* <div className="card-icon">{slide.icon}</div> */}
                    {/* <div className="card-title">{slide.title}</div> */}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="carousel-controls">
            <button
              className="carousel-button"
              onClick={prevSlide}
              aria-label="Previous slide"
            >
              ‹
            </button>

            <div className="carousel-dots">
              {slides.map((slide, index) => (
                <button
                  key={slide.id}
                  className={`carousel-dot ${index === currentIndex ? 'active' : ''}`}
                  onClick={() => goToSlide(index)}
                />
              ))}
            </div>

            <button
              className="carousel-button"
              onClick={nextSlide}
              aria-label="Next slide"
            >
              ›
            </button>
          </div>
        </>
      )}

    </div>
  );
};

export default CardCarousel;
