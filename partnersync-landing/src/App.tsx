import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Servicos from './pages/Servicos';
import Sobre from './pages/Sobre';
import Portfolio from './pages/Portfolio';
import Cases from './pages/Cases';
import Contato from './pages/Contato';
import FAQ from './pages/FAQ';
import { Privacidade, Termos, Cookies } from './pages/Legal';
import ScrollToTop from './components/ScrollToTop';

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="servicos" element={<Servicos />} />
          <Route path="sobre" element={<Sobre />} />
          <Route path="portfolio" element={<Portfolio />} />
          <Route path="cases" element={<Cases />} />
          <Route path="contato" element={<Contato />} />
          <Route path="faq" element={<FAQ />} />
          <Route path="privacidade" element={<Privacidade />} />
          <Route path="termos" element={<Termos />} />
          <Route path="cookies" element={<Cookies />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
