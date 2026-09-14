import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { OnboardingPage } from '@/pages/OnboardingPage'
import { EvalPage } from '@/pages/EvalPage'
import { ResultsPage } from '@/pages/ResultsPage'
import { InstallPrompt } from '@/components/pwa/InstallPrompt'
import { OfflineBanner } from '@/components/pwa/OfflineBanner'

function App() {
  return (
    <BrowserRouter>
      <OfflineBanner />
      <Routes>
        <Route path="/" element={<OnboardingPage />} />
        <Route path="/eval" element={<EvalPage />} />
        <Route path="/results" element={<ResultsPage />} />
      </Routes>
      <InstallPrompt />
    </BrowserRouter>
  )
}

export default App
