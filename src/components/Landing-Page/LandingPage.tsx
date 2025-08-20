import React from 'react';
import styles from './LandingPage.module.css';

export const LandingPage: React.FC = () => {
  return (
    <div className={styles.container}>
      {/* Top Header */}
      <div className={styles.header}>
        <h1 className={styles.headerText}>
          Global B2B market is forecast to add USD20 trillion in value by 2030
        </h1>
      </div>

      {/* Demo Button */}
      <div style={{ textAlign: 'center' }}>
        <button className={styles.demoButton}>
          Request a demo
        </button>
      </div>

      {/* Main Content */}
      <div className={styles.mainContent}>
        {/* Left Image */}
        <div className={styles.sideImage}>
          <img 
            src="/images/Left-1.png" 
            alt="Market Analysis Left"
          />
        </div>

        {/* Center Content */}
        <div className={styles.centerContent}>
          <h2 className={styles.title}>Industrial</h2>
          <h3 className={styles.subtitle}>
            Market analysis for a competitive edge-Abhinav
          </h3>
          <p className={styles.description}>
            Thank you for visiting this page in Passport and for your interest in exploring the valuable insights on Industrial.
            While we understand your wish to access these insights, please note that you currently do not have a subscription
            to this content.
          </p>
          <div>
            <h4 className={styles.snapshotTitle}>Snapshot of coverage</h4>
            <ul className={styles.snapshotList}>
              <li>177 industrial sectors - entire economy from agriculture to wholesale</li>
              <li>Total production value by industry and forecasts to 2030</li>
              <li>Buyers/Suppliers data - demand and costs structure</li>
              <li>Profitability metrics</li>
              <li>Number of companies and employees</li>
              <li>Imports/exports data</li>
              <li>90 countries researched</li>
            </ul>
          </div>
        </div>

        {/* Right Image */}
        <div className={styles.sideImage}>
          <img 
            src="/images/Right-1.png" 
            alt="Market Analysis Right"
          />
        </div>
      </div>
    </div>
  );
};
