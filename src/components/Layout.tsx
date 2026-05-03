import type { ReactNode } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { useIsMobile } from '@/lib/useResponsive';

interface Props {
  children: ReactNode;
}

export function Layout({ children }: Props) {
  const mobile = useIsMobile();
  return (
    <>
      <Header mobile={mobile} />
      <main>{children}</main>
      <Footer mobile={mobile} />
    </>
  );
}
