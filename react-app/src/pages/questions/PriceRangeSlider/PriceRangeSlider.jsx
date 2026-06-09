import { usePriceRange } from './usePriceRange';
import styles from './PriceRangeSlider.module.css';

function RangeSlider({ absMin, absMax, min, max, pctMin, pctMax, setMin, setMax }) {
  return (
    <div className={styles.sliderWrapper}>
      <div
        className={styles.track}
        style={{
          background: `linear-gradient(to right,
            var(--color-border) ${pctMin}%,
            var(--color-primary) ${pctMin}%,
            var(--color-primary) ${pctMax}%,
            var(--color-border) ${pctMax}%)`,
        }}
      />
      <input
        type="range"
        min={absMin}
        max={absMax}
        value={min}
        aria-label="Minimum price"
        aria-valuenow={min}
        aria-valuemin={absMin}
        aria-valuemax={max}
        className={styles.thumb}
        style={{ zIndex: min > absMax - 20 ? 5 : 4 }}
        onChange={(e) => setMin(e.target.value)}
      />
      <input
        type="range"
        min={absMin}
        max={absMax}
        value={max}
        aria-label="Maximum price"
        aria-valuenow={max}
        aria-valuemin={min}
        aria-valuemax={absMax}
        className={styles.thumb}
        style={{ zIndex: 4 }}
        onChange={(e) => setMax(e.target.value)}
      />
    </div>
  );
}

export default function PriceRangeSlider() {
  const state = usePriceRange();

  return (
    <section className={styles.page}>
      <header className={styles.pageHeader}>
        <h1 className={styles.heading}>Price Range Slider</h1>
        <p className={styles.subheading}>
          Dual-thumb range with clamping, custom track fill, and keyboard support.
        </p>
      </header>

      <div className={styles.demo}>
        <div className={styles.priceDisplay}>
          <div className={styles.priceBox}>
            <span className={styles.priceLabel}>Min</span>
            <span className={styles.price}>${state.min.toLocaleString()}</span>
          </div>
          <div className={styles.priceDivider}>—</div>
          <div className={styles.priceBox}>
            <span className={styles.priceLabel}>Max</span>
            <span className={styles.price}>${state.max.toLocaleString()}</span>
          </div>
        </div>

        <RangeSlider {...state} />

        <div className={styles.bounds}>
          <span>${state.absMin}</span>
          <span>${state.absMax.toLocaleString()}</span>
        </div>

        <p className={styles.result}>
          Showing results for <strong>${state.min.toLocaleString()} – ${state.max.toLocaleString()}</strong>
        </p>
      </div>
    </section>
  );
}
