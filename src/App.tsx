import { Route, Routes } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Home } from '@/pages/Home';
import { Bestall } from '@/pages/Bestall';
import { SaFunkar } from '@/pages/SaFunkar';
import { Kollektioner } from '@/pages/Kollektioner';
import { Berattelser } from '@/pages/Berattelser';
import { Faq } from '@/pages/Faq';
import { Salj } from '@/pages/Salj';
import { Admin } from '@/pages/Admin';
import { NotFound } from '@/pages/NotFound';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/bestall" element={<Bestall />} />
        <Route path="/sa-funkar-det" element={<SaFunkar />} />
        <Route path="/kollektioner" element={<Kollektioner />} />
        <Route path="/kollektioner/:slug" element={<Kollektioner />} />
        <Route path="/berattelser" element={<Berattelser />} />
        <Route path="/faq" element={<Faq />} />
        <Route path="/salj" element={<Salj />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  );
}
