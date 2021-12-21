import styles from './header.module.scss';
import Link from 'next/link'

export function Header() {
  return (
    <header className={styles.headerContainer}>
      <Link href="/">
       
          <img src="/Logo.svg" alt="Logo" />
       
      </Link>
    </header>
  );
}
