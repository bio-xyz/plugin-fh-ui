import styles from "@/styles/components/Sidebar.module.scss";
import LoginButton from "./LoginButton";

const Sidebar: React.FC = () => {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.heading}>BioAgent</div>
      <button className={styles.newChatBtn}>+ New Chat</button>
      <div
        style={{
          marginTop: "auto",
          paddingTop: 20,
          borderTop: "1px solid rgba(255,255,255,0.1)",
          opacity: 0.6,
          fontSize: 12,
        }}
      >
        <p>Recent chats would appear here</p>
      </div>
      <div style={{ marginTop: 20 }}>
        <LoginButton />
      </div>
    </aside>
  );
};

export default Sidebar;
