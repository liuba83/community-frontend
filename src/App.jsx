import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { HomePage } from './pages/HomePage';
import { PrivacyPage } from './pages/PrivacyPage';

function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
        </Routes>
      </LanguageProvider>
    </BrowserRouter>
  );
}

export default App;
