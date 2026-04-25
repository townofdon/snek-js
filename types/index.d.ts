// We need to tell TypeScript that when we write "import styles from './styles.scss' we mean to load a module (to look for a './styles.scss.d.ts'). 
declare module '*.css';
declare module '*.scss';

declare namespace nw {
  class Window {
    public static get();
  }
  class App {
    public static quit();
  }
}
