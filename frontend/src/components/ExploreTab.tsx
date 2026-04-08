import { useState, useEffect } from 'react'
import { Search, Briefcase, Info, ArrowRight, ArrowLeft, Star, MapPin, ChevronUp, ChevronDown } from 'lucide-react'

export default function ExploreTab() {
  const [category, setCategory] = useState('restaurants')
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [connected, setConnected] = useState(null)
  const [selectedItem, setSelectedItem] = useState(null)
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })
  
  // Custom Flight State
  const [flightOrigin, setFlightOrigin] = useState('')
  const [flightDestination, setFlightDestination] = useState('')
  const [flightOrigins, setFlightOrigins] = useState<string[]>([])
  const [flightDestinations, setFlightDestinations] = useState<string[]>([])

  const categories = [
    { id: 'restaurants', label: 'Restaurants' },
    { id: 'hotels', label: 'Hotels' },
    { id: 'attractions', label: 'Attractions' },
    { id: 'flights', label: 'Flights' }
  ]

  // Fetch dynamic locations from the flights dataset whenever the Flights tab is opened
  useEffect(() => {
    if (category === 'flights') {
      fetch('/api/flights/locations')
        .then(r => r.json())
        .then(({ origins, destinations }) => {
          setFlightOrigins(origins || []);
          setFlightDestinations(destinations || []);
          if (origins?.length && !flightOrigin) setFlightOrigin(origins[0]);
          if (destinations?.length && !flightDestination) setFlightDestination(destinations[0]);
        })
        .catch(() => {});
    }
  }, [category]);

  const fetchData = async (queryOverride) => {
    setLoading(true)
    setSelectedItem(null)
    
    const activeQuery = queryOverride !== undefined ? queryOverride : search;
    
    try {
      const res = await fetch(`/api/explore/${category}?q=${activeQuery}`)
      if (res.ok) {
        setConnected(true)
      } else {
        setConnected(false)
      }
      const json = await res.json()
      setData(json.data || [])
    } catch (e) {
      console.error(e)
      setConnected(false)
    } finally {
      setLoading(false)
    }
  }

  // Google Maps Style Detail Header Parser
  const renderMetaLine = (item) => {
    const rating = item.Rating || item.rating || item.Stars;
    const price = item.Price || item.Rate || item.price || item.rate;
    const catLabel = item.Category || item.category || item.Type;
    const city = item.City || item.city || item.Location || item.Destination;

    return (
      <div className="flex flex-col gap-2 mt-2">
        <div className="flex items-center text-slate-600 text-sm font-medium gap-2 flex-wrap">
          {rating && (
            <div className="flex items-center text-amber-500">
              {rating} <Star size={16} className="ml-1 fill-amber-500 hover:scale-110 transition-transform" />
            </div>
          )}
          {rating && (price || catLabel) && <span className="text-slate-300">•</span>}
          
          {price && <span className="text-emerald-600 font-bold">{price}</span>}
          {price && catLabel && <span className="text-slate-300">•</span>}
          
          {catLabel && <span className="text-slate-500">{catLabel}</span>}
        </div>
        
        {city && (
          <div className="flex items-center text-slate-500 text-sm">
            <MapPin size={16} className="mr-1 text-slate-400" /> {city}
          </div>
        )}
      </div>
    );
  };

  if (selectedItem) {
    const entries = Object.entries(selectedItem).filter(([k]) => 
      !['chunk_id', 'id', 'Rating', 'rating', 'Price', 'price', 'Rate', 'rate', 'City', 'city', 'Category', 'category', 'Name', 'name', 'title', 'Destination'].includes(k) && !k.includes('vector') && !k.startsWith('@search')
    );
    
    return (
      <div className="space-y-8 py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <button 
          onClick={() => setSelectedItem(null)} 
          className="flex items-center text-slate-500 hover:text-red-600 font-semibold transition-colors"
        >
          <ArrowLeft size={18} className="mr-2" /> Back to Search Results
        </button>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
          <div className="bg-white border-b border-slate-100 p-8 sm:p-12">
             <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-4 capitalize">
               {selectedItem.Name || selectedItem.name || selectedItem.title || selectedItem.Airline || selectedItem.Destination || "Details"}
             </h2>
             
             {/* Google Maps Styled Header */}
             <div className="scale-110 origin-left">
                {renderMetaLine(selectedItem)}
             </div>
          </div>
          
          {entries.length > 0 && (
            <div className="p-8 sm:p-12 bg-slate-50">
              <h3 className="text-lg font-bold text-slate-800 mb-6">Additional Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {entries.map(([k, v], idx) => {
                  const isLong = typeof v === 'string' && String(v).length > 50;
                  return (
                    <div key={idx} className={`bg-white rounded-xl p-6 border border-slate-200 shadow-sm ${isLong ? "md:col-span-2" : ""}`}>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">{k}</p>
                      <p className={`text-slate-700 ${isLong ? "text-base leading-relaxed" : "text-lg font-medium"}`}>
                         {String(v)}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-3xl font-bold text-slate-800">Texas Data Explorer</h2>
            {connected && <ArrowRight className="text-emerald-500 mt-1" size={24} />}
          </div>
          <p className="text-slate-500">Search through the Texas workshop data from the backend dataset layer.</p>
        </div>
        
        <div className="flex bg-slate-100 p-1 shadow-inner overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => { setCategory(cat.id); setSelectedItem(null); setSortConfig({ key: null, direction: 'asc' }); }}
              className={`px-4 py-2 text-sm font-semibold transition-all whitespace-nowrap
                ${category === cat.id ? 'bg-white text-red-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Dynamic Search Bar UI */}
      {category === 'flights' ? (
        <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Flying From (Origin)</label>
            <select 
              className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500/20 outline-none bg-white cursor-pointer" 
              value={flightOrigin} 
              onChange={e => setFlightOrigin(e.target.value)}
            >
              {flightOrigins.map(origin => (
                 <option key={origin} value={origin}>{origin}</option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Destination</label>
            <select 
              className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500/20 outline-none bg-white cursor-pointer" 
              value={flightDestination} 
              onChange={e => setFlightDestination(e.target.value)}
            >
              {flightDestinations.map(city => (
                 <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button 
              onClick={() => { 
                const q = `${flightOrigin} ${flightDestination}`.trim(); 
                setSearch(q); 
                fetchData(q); 
              }} 
              className="h-[50px] px-8 bg-slate-900 border border-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 transition-colors w-full md:w-auto"
            >
              Find Flights
            </button>
          </div>
        </div>
      ) : (
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder={`Search ${category}...`}
            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 shadow-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchData(search)}
          />
          <button 
            onClick={() => fetchData(search)}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-slate-900 text-white px-6 py-2 text-sm font-bold hover:bg-slate-800 transition-colors"
          >
            Search
          </button>
        </div>
      )}

      {/* Data Results Table */}
      {data.length > 0 ? (() => {
        // Phase 1: Standardize Data Extraction for Sorting
        const mappedData = data.map((item, i) => {
          const getVal = (labels) => {
            for (const l of labels) {
              const foundKey = Object.keys(item).find(k => k.toLowerCase() === l.toLowerCase());
              if (foundKey && item[foundKey] !== undefined && item[foundKey] !== null) return item[foundKey];
            }
            for (const l of labels) {
              const partialKey = Object.keys(item).find(k => k.toLowerCase().includes(l.toLowerCase()) && !k.startsWith('@'));
              if (partialKey && item[partialKey] !== undefined && item[partialKey] !== null) return item[partialKey];
            }
            return null;
          };

          const origin = getVal(['Origin', 'From']);
          const destination = getVal(['Destination', 'To', 'City']);
          const airline = getVal(['Airline', 'Company', 'Carrier']);
          const flightNo = getVal(['Flight_No', 'FlightNo', 'Number']);
          const price = getVal(['Price', 'Rate', 'Admission', 'Cost', 'Fee']);
          const duration = getVal(['Duration', 'Time', 'Length']);
          const name = getVal(['Name', 'Title', 'Label', 'Subject']);
          const categoryVal = getVal(['Category', 'Type', 'Kind', 'Status']);

          const isMetadata = (val) => typeof val === 'string' && (val.toLowerCase().includes('.csv') || val.toLowerCase().includes('.json') || val.toLowerCase().includes('texas_'));

          let mainLabel = (origin && destination) ? `${origin} ➔ ${destination}` : (!isMetadata(name) ? name : null);
          
          if (!mainLabel || isMetadata(mainLabel)) {
            const fallbackKey = Object.keys(item).find(k => !k.startsWith('@') && typeof item[k] === 'string' && item[k].length > 2 && !isMetadata(item[k]));
            mainLabel = fallbackKey ? item[fallbackKey] : 'Search Match';
          }

          if (mainLabel === 'Search Match' && destination) mainLabel = destination;

          const secondaryType = airline || categoryVal || (category === 'flights' ? 'Direct' : 'Texas');

          // Numeric and Symbol parsing (so $100 comes after $20, and $$$ comes after $)
          let sortPrice = 0;
          if (typeof price === 'string') {
            const trimmedMatch = price.trim();
            if (/^\$+$/.test(trimmedMatch)) {
               // Handles Restaurant tier pricing (e.g. "$", "$$")
               sortPrice = trimmedMatch.length;
            } else {
               // Handles Standard monetary pricing (e.g. "$120.00", "45")
               sortPrice = parseFloat(price.replace(/[^0-9.]/g, '')) || 0;
            }
          } else if (typeof price === 'number') {
            sortPrice = price;
          }

          return {
            _rawItem: item,
            _mainLabel: mainLabel,
            _secondaryType: secondaryType,
            _airline: airline,
            _flightNo: flightNo,
            _price: price,
            _priceValue: sortPrice,
            _duration: duration,
            _city: getVal(['City', 'Location', 'Venue']) || 'Texas',
            _originalIndex: i
          };
        });

        // Phase 2: Apply Sorting Rules
        const sortedData = [...mappedData].sort((a, b) => {
          if (!sortConfig.key) return 0;
          
          let aVal = a[sortConfig.key];
          let bVal = b[sortConfig.key];
          
          if (typeof aVal === 'string') aVal = aVal.toLowerCase();
          if (typeof bVal === 'string') bVal = bVal.toLowerCase();

          if (aVal == null) return sortConfig.direction === 'asc' ? 1 : -1;
          if (bVal == null) return sortConfig.direction === 'asc' ? -1 : 1;

          if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
          if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
          return 0;
        });

        const handleSort = (key) => {
          let direction = 'asc';
          if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
          }
          setSortConfig({ key, direction });
        };

        const SortIcon = ({ colKey }) => {
          if (sortConfig.key !== colKey) return null;
          return sortConfig.direction === 'asc' ? <ChevronUp size={14} className="inline ml-1 mb-0.5 text-red-500" /> : <ChevronDown size={14} className="inline ml-1 mb-0.5 text-red-500" />;
        };

        return (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th 
                      onClick={() => handleSort('_mainLabel')}
                      className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest cursor-pointer hover:bg-slate-200 transition-colors select-none"
                    >
                      {category === 'flights' ? 'Route' : 'Name / Entity'} <SortIcon colKey="_mainLabel" />
                    </th>
                    <th 
                      onClick={() => handleSort(category === 'flights' ? '_airline' : '_priceValue')}
                      className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-center cursor-pointer hover:bg-slate-200 transition-colors select-none"
                    >
                      {category === 'flights' ? 'Flight / Airline' : category === 'hotels' ? 'Rate/Night' : category === 'attractions' ? 'Admission' : 'Cost'}
                      <SortIcon colKey={category === 'flights' ? '_airline' : '_priceValue'} />
                    </th>
                    <th 
                      onClick={() => handleSort(category === 'flights' ? '_priceValue' : '_secondaryType')}
                      className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-center cursor-pointer hover:bg-slate-200 transition-colors select-none"
                    >
                      {category === 'flights' ? 'Price' : 'Type'}
                      <SortIcon colKey={category === 'flights' ? '_priceValue' : '_secondaryType'} />
                    </th>
                    <th 
                      onClick={() => handleSort(category === 'flights' ? '_duration' : '_city')}
                      className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest lg:table-cell hidden text-center cursor-pointer hover:bg-slate-200 transition-colors select-none"
                    >
                      {category === 'flights' ? 'Duration' : 'Location'}
                      <SortIcon colKey={category === 'flights' ? '_duration' : '_city'} />
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sortedData.map((item) => {
                    // Render UI from Standardized Model
                    const col2 = category === 'flights' ? (
                      <div className="text-center font-bold text-slate-700">
                        <div>{item._airline || 'Unknown Arrival'}</div>
                        <div className="text-[10px] text-slate-400 font-normal uppercase tracking-tighter">{item._flightNo || 'N/A'}</div>
                      </div>
                    ) : (
                      <span className="text-emerald-600 font-extrabold text-sm">{item._price || 'Free / N/A'}</span>
                    );

                    const col3 = category === 'flights' ? (
                       <span className="text-emerald-600 font-extrabold text-sm">{item._price || 'N/A'}</span>
                    ) : (
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{item._secondaryType}</span>
                    );

                    return (
                      <tr 
                        key={item._originalIndex} 
                        onClick={() => setSelectedItem(item._rawItem)}
                        className="group hover:bg-red-50/30 transition-colors cursor-pointer"
                      >
                        <td className="px-6 py-5">
                          <div className="font-bold text-slate-800 group-hover:text-red-700 transition-colors capitalize">
                            {item._mainLabel}
                          </div>
                          <div className="text-xs text-slate-400 mt-0.5">
                            {category === 'flights' ? 'Direct Flight' : item._secondaryType}
                          </div>
                        </td>
                        <td className="px-6 py-5 text-center">
                          {col2}
                        </td>
                        <td className="px-6 py-5 text-center">
                          {col3}
                        </td>
                        <td className="px-6 py-5 lg:table-cell hidden text-center">
                          <div className="flex items-center justify-center text-slate-500 text-sm">
                            {category === 'flights' ? (
                              <div className="font-mono text-xs">{item._duration || '--'}</div>
                            ) : (
                              <>
                                <MapPin size={14} className="mr-1.5 text-slate-300" />
                                {item._city}
                              </>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <button className="text-slate-400 group-hover:text-red-600 transition-colors transform group-hover:scale-110">
                            <ArrowRight size={20} />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );
      })() : (
        <div className="min-h-[400px] bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400">
          <div className="bg-white rounded-full p-6 shadow-sm mb-4">
            <Briefcase size={40} className="text-slate-300" />
          </div>
          <p className="text-lg font-bold text-slate-600">
            {loading ? "Searching Deep Azure..." : "No results loaded yet"}
          </p>
          <p className="text-sm mt-1">Search above to load {category} results directly from Azure AI Search.</p>
        </div>
      )}
    </div>
  )
}
