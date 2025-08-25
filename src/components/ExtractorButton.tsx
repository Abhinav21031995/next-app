import React, { useState } from 'react';
import PopupDialog from './PopupDialog';
import styles from './ExtractorButton.module.css';

const ExtractorButton = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const handleOpenPopup = () => {
    setIsPopupOpen(true);
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
  };

  return (
    <>
      <button className={styles.button} onClick={handleOpenPopup}>
        Show Extractor Data
      </button>
      <PopupDialog 
        isOpen={isPopupOpen} 
        onClose={handleClosePopup} 
      />
    </>
  );
};

export default ExtractorButton;
