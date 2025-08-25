import React from 'react';
import styles from './PopupDialog.module.css';
import { useSelections } from '@/context/SelectionsContext';

interface PopupDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const PopupDialog: React.FC<PopupDialogProps> = ({ isOpen, onClose }) => {
  const { selections } = useSelections();

  if (!isOpen) return null;

  const hasSelections = selections.categories.length > 0 || selections.geographies.length > 0;

  return (
    <div className={styles.popupOverlay} onClick={onClose}>
      <div className={styles.popupContent} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>Your Selections</h2>
          <button className={styles.closeButton} onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
        
        <div className={styles.selectionsContainer}>
          {!hasSelections && (
            <div className={styles.noSelections}>
              No selections made yet. Please select categories or geographies.
            </div>
          )}

          {selections.categories.length > 0 && (
            <div className={styles.selectionSection}>
              <h3 className={styles.sectionTitle}>
                Categories ({selections.categories.length})
              </h3>
              {selections.categories.map((category, index) => (
                <div key={`category-${index}`} className={styles.selectionItem}>
                  {category}
                </div>
              ))}
            </div>
          )}

          {selections.geographies.length > 0 && (
            <div className={styles.selectionSection}>
              <h3 className={styles.sectionTitle}>
                Geographies ({selections.geographies.length})
              </h3>
              {selections.geographies.map((geography, index) => (
                <div key={`geography-${index}`} className={styles.selectionItem}>
                  {geography}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PopupDialog;
