import { useTheme } from '@/hooks';  
  
export function ThemeToggle() {  
  const { resolvedTheme, toggleTheme } = useTheme();  
    
  return (  
    <button onClick={toggleTheme}>  
      Current: {resolvedTheme}  
    </button>  
  );  
}
