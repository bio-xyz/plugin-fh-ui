import { usePrivy } from "@privy-io/react-auth";
import styles from "@/styles/components/LoginButton.module.scss";

const LoginButton: React.FC = () => {
  const { ready, authenticated, login, logout } = usePrivy();

  if (!ready) return null;

  return authenticated ? (
    <button className={styles.loginBtn} onClick={logout}>
      Logout
    </button>
  ) : (
    <button className={styles.loginBtn} onClick={login}>
      Login
    </button>
  );
};

export default LoginButton;
