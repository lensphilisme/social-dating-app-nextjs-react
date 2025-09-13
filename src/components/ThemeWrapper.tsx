import { getActiveTheme } from '@/app/actions/adminSystemActions';
import ThemeProvider from './ThemeProvider';

export default async function ThemeWrapper({ children }: { children: React.ReactNode }) {
  const activeTheme = await getActiveTheme();

  return (
    <ThemeProvider initialTheme={activeTheme}>
      {children}
    </ThemeProvider>
  );
}
