// Adding type declarations for styled-jsx, which seems to be used in AnimatedButton.tsx
// This will allow the 'jsx' prop on the <style> tag without TypeScript errors.
import 'react';

declare module 'react' {
  interface StyleHTMLAttributes<T> extends React.HTMLAttributes<T> {
    jsx?: boolean;
    global?: boolean;
  }
}
