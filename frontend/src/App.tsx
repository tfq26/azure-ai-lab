import { useState } from 'react'
import HomeTab from './components/HomeTab'
import ExploreTab from './components/ExploreTab'
import TripTab from './components/TripTab'
import { MapPin, Search, Plane, Navigation } from 'lucide-react'

function App() {
  const [activeTab, setActiveTab] = useState('home')

  const tabs = [
    { id: 'home', label: 'Home', icon: <Navigation size={20} /> },
    { id: 'explore', label: 'Explore', icon: <Search size={20} /> },
    { id: 'trip', label: 'Trip Planner', icon: <Plane size={20} /> },
  ]

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <MapPin className="text-red-600" size={32} />
              <span className="text-2xl font-bold tracking-tight text-slate-800">
                Explore <span className="text-red-600">Texas</span>
              </span>
            </div>
            
            <nav className="flex space-x-1 sm:space-x-4">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center px-4 py-2 text-sm font-medium transition-all duration-200
                    ${activeTab === tab.id 
                      ? 'bg-red-50 text-red-600 shadow-sm' 
                      : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}
                  `}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          {activeTab === 'home' && <HomeTab />}
          {activeTab === 'explore' && <ExploreTab />}
          {activeTab === 'trip' && <TripTab />}
        </div>
      </main>

      {/* Simple Footer */}
      <footer className="bg-slate-900 text-slate-400 py-8 text-center text-sm">
        <p>&copy; 2026 Explore Texas AI Lab. Built with Azure AI Foundry.</p>
      </footer>
    </div>
  )
}

export default App
