import React, { useState, useEffect, useCallback, useMemo } from 'react';
import './ImageSlider.css';

const ImageSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [direction, setDirection] = useState('next');

  // 🔹 Dynamically load all images from folder
  const sliderImages = useMemo(() => {
    const context = require.context(
      '../assets/slider-images',
      false,
      /\.(png|jpe?g|svg)$/
    );

    return context.keys().map(context);
  }, []);

  // 🔹 Create slides dynamically from images
  const slides = useMemo(() => {
    return sliderImages.map((image, index) => ({
      id: index,
      image: image,
      logo: image,
      title: `Punjab Police Open Court ${index + 1}`,
      description:
        '"The Daily Open Court platform has improved transparency and efficiency across all stations."',
      author: 'Punjab Police',
      role: 'Law Enforcement',
      link: '#'
    }));
  }, [sliderImages]);

  const totalSlides = slides.length;

  // Auto slide
  useEffect(() => {
    if (isHovered || totalSlides === 0) return;

    const interval = setInterval(() => {
      setDirection('next');
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, 3000);

    return () => clearInterval(interval);
  }, [isHovered, totalSlides]);

  const goToSlide = useCallback((index) => {
    if (index === currentSlide) return;
    setDirection(index > currentSlide ? 'next' : 'prev');
    setCurrentSlide(index);
  }, [currentSlide]);

  const nextSlide = useCallback(() => {
    setDirection('next');
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    setDirection('prev');
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  return (
    <div className="slider-container">

      {slides.length === 0 ? (
        <div className="slider-loading">
          <p>No images found in slider-images folder</p>
        </div>
      ) : (

        <div 
          className="slider-wrapper"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="slider-track">
            {slides.map((slide, index) => (
              <div
                key={slide.id}
                className={`slide ${index === currentSlide ? 'active' : ''}`}
              >
                <div className="slide-content">
                  <div className="slide-image-wrapper">
                    <img 
                      src={slide.image} 
                      alt={slide.title}
                      className="slide-image"
                    />
                    <div className="slide-image-overlay"></div>
                  </div>

                  <div className="slide-text">
                    <img 
                      src={slide.logo} 
                      alt="Logo"
                      className="slide-logo"
                    />

                    <h2 className="slide-heading">{slide.title}</h2>

                    <blockquote className="slide-description">
                      {slide.description}
                    </blockquote>

                    <div className="slide-author">
                      <div className="author-name">{slide.author}</div>
                      <div className="author-role">{slide.role}</div>
                    </div>

                    <a href={slide.link} className="slide-cta">
                      Read more
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="slider-controls">
            <button className="slider-button" onClick={prevSlide}>
              Prev
            </button>

            <button className="slider-button" onClick={nextSlide}>
              Next
            </button>
          </div>
        </div>
      )}

      <div className="slider-dots">
        {slides.map((slide, index) => (
          <button
            key={slide.id}
            className={`dot ${index === currentSlide ? 'active' : ''}`}
            onClick={() => goToSlide(index)}
          />
        ))}
      </div>

    </div>
  );
};

export default ImageSlider;
