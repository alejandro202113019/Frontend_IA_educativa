import { useState } from 'react'
import './App.css'
import Header from './components/layout/Header'
import UploadScreen from './components/screens/UploadScreen'
import SummaryScreen from './components/screens/SummaryScreen'
import QuizScreen from './components/screens/QuizScreen'

function App() {
  const [activeScreen, setActiveScreen] = useState("upload");
  const [appData, setAppData] = useState(null);
  
  const handleDataLoaded = (data) => {
    setAppData(data);
  };

  const handleDataUpdate = (updatedData) => {
    setAppData(updatedData);
  };

  const resetApp = () => {
    setActiveScreen("upload");
    setAppData(null);
  };
  
  const renderScreen = () => {
    switch (activeScreen) {
      case "upload":
        return (
          <UploadScreen 
            onNext={() => setActiveScreen("summary")} 
            onDataLoaded={handleDataLoaded}
          />
        );
      case "summary":
        return (
          <SummaryScreen 
            data={appData}
            onNext={() => setActiveScreen("quiz")} 
            onDataUpdate={handleDataUpdate}
          />
        );
      case "quiz":
        return (
          <QuizScreen 
            data={appData}
            onNext={resetApp}
          />
        );
      default:
        return (
          <UploadScreen 
            onNext={() => setActiveScreen("summary")} 
            onDataLoaded={handleDataLoaded}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <Header activeScreen={activeScreen} />
        <main>
          {renderScreen()}
        </main>
        
        {/* Footer con info de conexión */}
        <footer className="mt-12 text-center">
          <div className="inline-flex items-center px-3 py-1 bg-white rounded-full shadow-sm text-xs text-gray-500">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
            Conectado al backend IA • {import.meta.env.VITE_API_URL || 'http://localhost:8000'}
          </div>
        </footer>
      </div>
    </div>
  )
}

export default App