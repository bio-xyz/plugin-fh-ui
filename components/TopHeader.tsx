import Image from "next/image";
import styles from "@/styles/components/TopHeader.module.scss";

const TopHeader: React.FC = () => {
  return (
    <header className={styles.topHeader}>
      <div className={styles.headerContent}></div>
      <div className={styles.headerNotch}>
        <div className={styles.notchBackground}>
          <svg viewBox="0 0 120 36" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M0,0 C6,0 10,4 10,10 L10,26 C10,32 14,36 20,36 L120,36 L120,0 Z"
              fill="rgb(35,40,40)"
            />
            <path
              d="M0,0 C6,0 10,4 10,10 L10,26 C10,32 14,36 20,36 L120,36 L120,0"
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        </div>
        <div className={styles.notchIcons}>
          <button className={styles.notchIcon} title="Settings">
            <Image src="/settings.svg" alt="Settings" height={16} width={16} />
          </button>
          <button className={styles.notchIcon} title="Profile">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </button>
          <button className={styles.notchIcon} title="More">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="1"></circle>
              <circle cx="19" cy="12" r="1"></circle>
              <circle cx="5" cy="12" r="1"></circle>
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};

export default TopHeader;
