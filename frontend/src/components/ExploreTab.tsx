import { useState, useEffect } from 'react'
import { Search, MapPin, DollarSign, Star, Briefcase, Info } from 'lucide-react'

export default function ExploreTab() {
  const [category, setCategory] = useState('restaurants')
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')

  const categories = [
    { id: 'restaurants', label: 'Restaurants' },
    { id: 'hotels', label: 'Hotels' },
    { id: 'attractions', label: 'Attractions' },
    { id: 'flights', label: 'Flights' }
  ]

  const fetchData = async () => {
    setLoading(true)
    try {
      // Students will implement the actual search proxy
      // For now, this is a placeholder call
      const res = await fetch(`/api/explore/${category}?q=${search}`)
      const json = await res.json()
      setData(json.data || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Texas Data Explorer</h2>
          <p className="text-slate-500">Search through 40,000+ data points in real-time from Azure AI Search.</p>
        </div>
        
        <div className="flex bg-slate-100 p-1 shadow-inner overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`px-4 py-2 text-sm font-semibold transition-all whitespace-nowrap
                ${category === cat.id ? 'bg-white text-red-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input
          type="text"
          placeholder={`Search ${category}... (e.g. Austin, BBQ, Luxury)`}
          className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 shadow-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && fetchData()}
        />
        <button 
          onClick={fetchData}
          className="absolute right-3 top-1/2 -translate-y-1/2 bg-slate-900 text-white px-6 py-2 text-sm font-bold hover:bg-slate-800 transition-colors"
        >
          Search
        </button>
      </div>

      {/* Challenge Note for Students */}
      <div className="bg-amber-50 border border-amber-200 p-6 flex gap-4 items-start shadow-sm">
        <Info className="text-amber-600 shrink-0" size={24} />
        <div>
          <h4 className="font-bold text-amber-900 text-lg">Student Challenge: The Index Bridge</h4>
          <p className="text-amber-800 leading-relaxed mb-4">
            The "Explore" tab is ready, but it needs an active connection to your <b>Azure AI Search</b> indexes. 
            Update the backend <code>main.py</code> to proxy these requests to the cloud.
          </p>
          <div className="bg-white/50 p-3 border border-amber-200 font-mono text-sm inline-block">
            GET /api/explore/{category}?q={search}
          </div>
        </div>
      </div>

      {/* Data Results Placeholder */}
      <div className="min-h-[400px] bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400">
        <div className="bg-slate-100 p-4 mb-4">
          <Briefcase size={40} />
        </div>
        <p className="text-lg font-medium">No results loaded yet</p>
        <p className="text-sm">Connect your Azure environment to see the 10,000 {category}.</p>
      </div>
    </div>
  )
}
