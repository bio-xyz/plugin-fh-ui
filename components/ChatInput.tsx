import Image from "next/image";
import styles from "@/styles/components/ChatInput.module.scss";

const ChatInput: React.FC = () => {
  return (
    <main className={styles.main}>
      <div className={styles.mainContent}>
        <h1>Welcome to BioAgent</h1>
        <p>A better way to do BioMedical Research</p>
      </div>
      <div className={styles.chatInputContainer}>
        <input
          className={styles.chatInput}
          type="text"
          placeholder="Send a message..."
        />
        <Image src="/send.svg" alt="send" height={20} width={20} />
      </div>
    </main>
  );
};

export default ChatInput;
