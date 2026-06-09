import { useRef } from 'react';
import { useCarousel } from './useCarousel';
import styles from './Carousel.module.css';

const SLIDES = [
  { id: 1, title: 'Accessibility First',   body: 'Every component follows WCAG 2.1 guidelines — keyboard navigable, screen-reader friendly, with proper ARIA roles.', color: '#6c63ff' },
  { id: 2, title: 'Performance Optimized', body: 'Uses IntersectionObserver, requestAnimationFrame, and lazy evaluation to keep 60fps animations without layout thrashing.', color: '#4ade80' },
  { id: 3, title: 'Zero Dependencies',     body: 'The vanilla implementation uses only native browser APIs — no bundler, no framework, no polyfills needed.', color: '#facc15' },
  { id: 4, title: 'Lead FE Quality',       body: 'Clean separation of logic and presentation, meaningful ARIA labels, keyboard handlers, and thorough CSS custom properties.', color: '#f87171' },
  { id: 5, title: 'Interview Ready',       body: 'Each question is structured the way you would explain it in a live coding session — readable, step-by-step, no magic.', color: '#38bdf8' },
];

export default function Carousel() {
  const { activeIndex, isPlaying, next, prev, goTo, pause, resume } = useCarousel(SLIDES.length);
  const startXRef = useRef(null);

  function onPointerDown(e) { startXRef.current = e.clientX; }
  function onPointerUp(e) {
    if (startXRef.current === null) return;
    const delta = e.clientX - startXRef.current;
    if (delta < -50) next();
    else if (delta > 50) prev();
    startXRef.current = null;
  }

  function handleKeyDown(e) {
    if (e.key === 'ArrowLeft')  prev();
    if (e.key === 'ArrowRight') next();
  }

  return (
    <section className={styles.page}>
      <header className={styles.pageHeader}>
        <h1 className={styles.heading}>Carousel</h1>
        <p className={styles.subheading}>
          Autoplay, pause-on-hover, swipe, dot indicators, keyboard navigation.
        </p>
      </header>

      <div
        className={styles.carousel}
        aria-roledescription="carousel"
        aria-label="Feature highlights"
        onMouseEnter={pause}
        onMouseLeave={resume}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onKeyDown={handleKeyDown}
        tabIndex={0}
      >
        <div
          className={styles.track}
          style={{ transform: `translateX(-${activeIndex * 100}%)` }}
          aria-live="polite"
        >
          {SLIDES.map((slide, idx) => (
            <div
              key={slide.id}
              className={styles.slide}
              aria-roledescription="slide"
              aria-label={`Slide ${idx + 1} of ${SLIDES.length}: ${slide.title}`}
              aria-hidden={idx !== activeIndex}
            >
              <div className={styles.slideInner} style={{ borderTopColor: slide.color }}>
                <span className={styles.slideNum} style={{ color: slide.color }}>
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <h2 className={styles.slideTitle}>{slide.title}</h2>
                <p className={styles.slideBody}>{slide.body}</p>
              </div>
            </div>
          ))}
        </div>

        <button className={`${styles.navBtn} ${styles.prevBtn}`} onClick={prev} aria-label="Previous slide">‹</button>
        <button className={`${styles.navBtn} ${styles.nextBtn}`} onClick={next} aria-label="Next slide">›</button>
      </div>

      <div className={styles.controls}>
        <div className={styles.dots}>
          {SLIDES.map((_, idx) => (
            <button
              key={idx}
              className={`${styles.dot} ${idx === activeIndex ? styles.dotActive : ''}`}
              onClick={() => goTo(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              aria-current={idx === activeIndex}
            />
          ))}
        </div>
        <button
          className={styles.playBtn}
          onClick={isPlaying ? pause : resume}
          aria-label={isPlaying ? 'Pause autoplay' : 'Start autoplay'}
        >
          {isPlaying ? '⏸ Pause' : '▶ Play'}
        </button>
      </div>
    </section>
  );
}
