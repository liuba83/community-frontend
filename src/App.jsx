import { LanguageProvider } from './context/LanguageContext';
import { HomePage } from './pages/HomePage';

function App() {
  return (
    <LanguageProvider>
      <HomePage />
    </LanguageProvider>
  );
}

export default App;
