'use client';

import { FaChevronDown } from 'react-icons/fa'; // Importamos el nuevo ícono de flecha
import styles from '../ui/contactModal.module.css';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ContactModal({ isOpen, onClose }: ContactModalProps) {
  return (
    <div className={`${styles.contactModal} ${isOpen ? styles.modalOpen : ''}`}>
      <div className={styles.modalHeader}>
        <button className={styles.modalCloseButton} onClick={onClose}>
          <FaChevronDown size={36} />
        </button>
        <h2 className={styles.contactHeading}>Contact</h2>
      </div>
      <div className={styles.contactDetails}>
        <div className={styles.contactSection}>
          <h2 className={styles.contactTitle}>MAPS</h2>
          <p className={styles.contactInfo}>
            C/ Aldapa, 2 Local 4, Esquina, C/ Matilde Hernández, 28025, Madrid
          </p>
        </div>
        <div className={styles.contactSection}>
          <h2 className={styles.contactTitle}>E-MAIL</h2>
          <p className={styles.contactInfo}>hi@whatif-arch.com</p>
        </div>
        <div className={styles.contactSection}>
          <h2 className={styles.contactTitle}>PHONE</h2>
          <p className={styles.contactInfo}>+34 697 266 914</p>
        </div>
        <div className={styles.contactSection}>
          <h2 className={styles.contactTitle}>INSTAGRAM</h2>
          <p className={styles.contactInfo}>@whatif_architecture</p>
        </div>
      </div>
    </div>
  );
}