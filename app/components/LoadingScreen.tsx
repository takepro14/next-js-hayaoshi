import styles from '../page.module.css';

export default function LoadingScreen() {
  return (
    <div className={styles.container}>
      <div className={styles.card}>問題を読み込み中...</div>
    </div>
  );
}
