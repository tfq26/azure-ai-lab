import { Star, Map, Compass } from 'lucide-react'

export default function HomeTab() {
  const highlights = [
    { title: "Diverse Culture", desc: "From the cowboy heritage of Fort Worth to the tech-hub vibe of Austin.", icon: <Map className="text-red-500" /> },
    { title: "Epic Food Scence", desc: "Experience world-famous BBQ, authentic Tex-Mex, and coastal seafood.", icon: <Star className="text-red-500" /> },
    { title: "Natural Wonders", desc: "Explore 80+ state parks, from the Palo Duro Canyon to the Gulf Coast.", icon: <Compass className="text-red-500" /> }
  ]

  return (
    <div className="space-y-16 py-8">
      {/* Hero Section */}
      <section className="relative h-[600px] overflow-hidden shadow-2xl flex items-center justify-center bg-slate-800">
        <img src="/images/hero.png" alt="Texas Landscape" className="absolute inset-0 w-full h-full object-cover opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 to-transparent z-10" />
        <div className="relative z-20 text-center px-6 max-w-3xl">
          <h1 className="text-5xl sm:text-7xl font-extrabold text-white mb-6 leading-tight">
            The Spirit of the <span className="text-red-500">Lone Star</span> State
          </h1>
          <p className="text-xl text-slate-200 mb-8 leading-relaxed">
            Everything is bigger in Texas—the adventure, the flavor, and the opportunities. 
            Discover why millions visit every year.
          </p>
          <div className="flex justify-center gap-4">
            <button className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 font-bold transition-all transform hover:scale-105 shadow-lg">
              Start Planning
            </button>
            <button className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/30 px-8 py-4 font-bold transition-all">
              Watch Video
            </button>
          </div>
        </div>
      </section>

      {/* Highlights Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {highlights.map((h, i) => (
          <div key={i} className="p-8 bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            {i === 1 && <img src="/images/bbq.png" alt="Texas BBQ" className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-10 transition-opacity" />}
            <div className="mb-4 bg-red-50 w-12 h-12 flex items-center justify-center">
              {h.icon}
            </div>
            <h3 className="text-xl font-bold mb-2 text-slate-800">{h.title}</h3>
            <p className="text-slate-600 leading-relaxed">{h.desc}</p>
          </div>
        ))}
      </section>

      {/* Top Cities Promo */}
      <section className="bg-red-600 p-12 text-white overflow-hidden relative">
        <img src="/images/austin.png" alt="Austin Skyline" className="absolute inset-0 w-full h-full object-cover opacity-20" />
        <div className="absolute top-0 right-0 opacity-10 transform translate-x-1/4 -translate-y-1/4">
          <Map size={400} />
        </div>
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-4xl font-bold mb-4">50+ Major Cities to Explore</h2>
          <p className="text-xl opacity-90 mb-8">
            From the historic missions of San Antonio to the modern energy of Houston, 
            every city tells a unique Texas story.
          </p>
          <div className="flex flex-wrap gap-3">
            {['Austin', 'Houston', 'Dallas', 'San Antonio', 'El Paso', 'Fort Worth'].map(city => (
              <span key={city} className="bg-white/20 px-4 py-2 text-sm font-semibold border border-white/10">
                {city}
              </span>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
