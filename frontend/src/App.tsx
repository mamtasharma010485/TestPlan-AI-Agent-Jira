import { useState } from 'react'
import { Settings as SettingsIcon, History as HistoryIcon, Play } from 'lucide-react'
import { cn } from './lib/utils'
import { Dashboard } from './pages/Dashboard'
import { Settings } from './pages/Settings'
import { History } from './pages/History'

type Page = 'generate' | 'settings' | 'history'

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('generate')

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen">
        <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h1 className="text-xl font-bold text-blue-600">Test Plan AI</h1>
            <p className="text-xs text-gray-500">Intelligent Generator</p>
          </div>
          
          <nav className="flex-1 p-4 space-y-2">
            <NavButton
              icon={<Play className="w-5 h-5" />}
              label="Generate"
              active={currentPage === 'generate'}
              onClick={() => setCurrentPage('generate')}
            />
            <NavButton
              icon={<SettingsIcon className="w-5 h-5" />}
              label="Settings"
              active={currentPage === 'settings'}
              onClick={() => setCurrentPage('settings')}
            />
            <NavButton
              icon={<HistoryIcon className="w-5 h-5" />}
              label="History"
              active={currentPage === 'history'}
              onClick={() => setCurrentPage('history')}
            />
          </nav>

          <div className="p-4 border-t border-gray-200">
            <p className="text-xs text-gray-400">v1.0.0</p>
          </div>
        </aside>

        <main className="flex-1 overflow-auto bg-gray-50">
          {currentPage === 'generate' && <Dashboard />}
          {currentPage === 'settings' && <Settings />}
          {currentPage === 'history' && <History />}
        </main>
      </div>
    </div>
  )
}

function NavButton({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 w-full px-4 py-3 rounded-lg text-left transition-colors",
        active ? "bg-blue-600 text-white" : "hover:bg-gray-100 text-gray-700"
      )}
    >
      {icon}
      <span className="font-medium">{label}</span>
    </button>
  )
}

export default App
