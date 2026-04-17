import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { 
  Activity, 
  BarChart3, 
  Clock, 
  RefreshCcw, 
  AlertTriangle, 
  CheckCircle2, 
  FileText,
  Play,
  ShieldCheck,
  Cpu,
  LayoutDashboard,
  Search,
  Filter,
  Calendar,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  ShieldAlert,
  Zap
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area
} from 'recharts';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://proxybackend-production.up.railway.app/api';

const App = () => {
  const [metrics, setMetrics] = useState([]);
  const [logs, setLogs] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [filters, setFilters] = useState({
    service: '',
    status: '',
    from: '',
    to: ''
  });

  const fetchData = useCallback(async () => {
    try {
      const [metricsRes, logsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/metrics/summary`),
        axios.get(`${API_BASE_URL}/metrics/logs`, { 
          params: { 
            service: filters.service || undefined,
            status: filters.status || undefined,
            from: filters.from ? `${filters.from}T00:00:00` : undefined,
            to: filters.to ? `${filters.to}T23:59:59` : undefined,
            page: currentPage,
            size: 10 
          } 
        })
      ]);
      setMetrics(metricsRes.data);
      setLogs(logsRes.data.content);
      setTotalPages(logsRes.data.totalPages);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, [filters, currentPage]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleSimulateLoad = async () => {
    setSimulating(true);
    try {
      await axios.post(`${API_BASE_URL}/metrics/simulate-load`);
      setTimeout(fetchData, 500);
    } catch (error) {
      console.error('Simulation failed:', error);
    } finally {
      setSimulating(false);
    }
  };

  const resetFilters = () => {
    setFilters({
      service: '',
      status: '',
      from: '',
      to: ''
    });
    setCurrentPage(0);
  };

  const getChartData = () => {
    return [...logs].reverse().map(log => ({
      time: new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      duration: log.durationMs,
      service: log.serviceId
    }));
  };

  const StatusBadge = ({ status }) => (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase ${
      status === 'SUCCESS' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
    }`}>
      {status === 'SUCCESS' ? 'Éxito' : 'Error'}
    </span>
  );

  return (
    <div className="min-h-screen bg-[#f1f5f9] font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-200">
                <ShieldCheck size={24} />
              </div>
              <span className="text-2xl font-black tracking-tight text-slate-800">
                PROXY<span className="text-indigo-600 underline decoration-indigo-200 decoration-wavy">BOOT</span>
              </span>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center px-3 py-1 bg-slate-100 rounded-full border border-slate-200 gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-semibold text-slate-600 uppercase tracking-widest">En Vivo</span>
              </div>
              <button 
                onClick={handleSimulateLoad}
                disabled={simulating}
                className="group relative flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-bold transition-all disabled:opacity-50 shadow-xl"
              >
                {simulating ? <RefreshCcw className="animate-spin w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
                <span className="relative">Simular Carga</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {metrics.map((m) => {
            const isUnhealthy = m.errorRate > 15;
            return (
              <div key={m.serviceId} className="relative group transition-all duration-300 transform hover:-translate-y-1">
                <div className={`absolute -inset-0.5 bg-gradient-to-r ${isUnhealthy ? 'from-rose-500 to-red-400' : 'from-indigo-500 to-blue-400'} rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000`}></div>
                <div className="relative bg-white p-6 rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-xs font-black uppercase text-slate-400 tracking-[0.2em] mb-1">Microservicio</h3>
                      <h2 className="text-xl font-bold text-slate-800 capitalize">{m.serviceId === 'payments' ? 'Pagos' : m.serviceId === 'orders' ? 'Pedidos' : 'Inventario'}</h2>
                    </div>
                    <div className={`p-3 rounded-xl ${isUnhealthy ? 'bg-rose-50 text-rose-500' : 'bg-indigo-50 text-indigo-500'}`}>
                      {m.serviceId === 'payments' ? <Cpu size={24} /> : m.serviceId === 'orders' ? <LayoutDashboard size={24} /> : <Activity size={24} />}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase font-bold text-slate-400">Peticiones</p>
                      <p className="text-lg font-black text-slate-700">{m.totalCalls}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase font-bold text-slate-400">Éxito</p>
                      <p className={`text-lg font-black ${isUnhealthy ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {(100 - m.errorRate).toFixed(1)}%
                      </p>
                    </div>
                    <div className="space-y-1 border-l border-slate-100 pl-4">
                      <p className="text-[10px] uppercase font-bold text-slate-400">Latencia</p>
                      <p className="text-lg font-black text-slate-700">{Math.round(m.avgResponseTime)}<span className="text-xs font-normal text-slate-400 ml-1">ms</span></p>
                    </div>
                  </div>
                  <div className="mt-6 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div className={`h-full transition-all duration-1000 ease-out ${isUnhealthy ? 'bg-rose-500' : 'bg-emerald-500'}`} style={{ width: `${100 - m.errorRate}%` }}></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between mb-8 relative">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <BarChart3 size={20} />
                  </div>
                  <h2 className="text-xl font-bold text-slate-800">Tendencias de Rendimiento</h2>
                </div>
              </div>
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={getChartData()}>
                    <defs>
                      <linearGradient id="colorDur" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} dy={10} />
                    <YAxis unit="ms" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                    <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px 16px', fontSize: '12px' }} />
                    <Area name="Latencia" type="monotone" dataKey="duration" stroke="#6366f1" strokeWidth={3} fill="url(#colorDur)" activeDot={{ r: 6, strokeWidth: 0 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-slate-50/50">
                <div className="flex items-center gap-2">
                   <FileText size={18} className="text-slate-400" />
                   <h3 className="font-bold text-slate-700 uppercase tracking-wider text-sm">Auditoría de Peticiones</h3>
                </div>
                <div className="flex flex-wrap gap-2 items-center">
                  <select className="px-3 py-1.5 bg-white border border-slate-200 text-xs font-bold rounded-xl outline-none shadow-sm" value={filters.service} onChange={e => { setFilters({...filters, service: e.target.value}); setCurrentPage(0); }}>
                    <option value="">Servicios</option>
                    <option value="inventory">Inventario</option>
                    <option value="orders">Pedidos</option>
                    <option value="payments">Pagos</option>
                  </select>
                  <select className="px-3 py-1.5 bg-white border border-slate-200 text-xs font-bold rounded-xl outline-none shadow-sm" value={filters.status} onChange={e => { setFilters({...filters, status: e.target.value}); setCurrentPage(0); }}>
                    <option value="">Estados</option>
                    <option value="SUCCESS">Éxito</option>
                    <option value="ERROR">Error</option>
                  </select>
                  <div className="flex items-center gap-2 bg-white px-2 py-1 rounded-xl border border-slate-200 shadow-sm">
                    <Calendar size={14} className="text-slate-400" />
                    <input type="date" className="text-[10px] font-bold outline-none" value={filters.from} onChange={e => { setFilters({...filters, from: e.target.value}); setCurrentPage(0); }} />
                    <span className="text-slate-300">-</span>
                    <input type="date" className="text-[10px] font-bold outline-none" value={filters.to} onChange={e => { setFilters({...filters, to: e.target.value}); setCurrentPage(0); }} />
                  </div>
                  <button onClick={resetFilters} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-all" title="Limpiar filtros">
                    <RotateCcw size={16} />
                  </button>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="text-[11px] font-black uppercase text-slate-400 tracking-widest bg-slate-50">
                    <tr>
                      <th className="px-6 py-4">Hora</th>
                      <th className="px-6 py-4">Servicio</th>
                      <th className="px-6 py-4">Estado</th>
                      <th className="px-6 py-4">Operación</th>
                      <th className="px-6 py-4 text-right">Duración</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {logs.map(log => (
                      <React.Fragment key={log.requestId}>
                        <tr onClick={() => setSelectedLog(selectedLog?.requestId === log.requestId ? null : log)} className={`hover:bg-slate-50 transition-colors cursor-pointer ${selectedLog?.requestId === log.requestId ? 'bg-indigo-50/30' : ''}`}>
                          <td className="px-6 py-4 font-mono text-[10px] text-indigo-600">
                             {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </td>
                          <td className="px-6 py-4 capitalize text-slate-700 text-sm">{log.serviceId}</td>
                          <td className="px-6 py-4"><StatusBadge status={log.status} /></td>
                          <td className="px-6 py-4 text-slate-600 italic text-sm">{log.operation}</td>
                          <td className="px-6 py-4 text-right font-bold text-slate-800">{log.durationMs}ms</td>
                        </tr>
                        {selectedLog?.requestId === log.requestId && (
                          <tr><td colSpan="5" className="px-8 py-6 bg-slate-50/80">
                            <div className="grid grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-2 duration-300 text-[11px]">
                              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm"><h4 className="font-black text-indigo-500 mb-2 uppercase tracking-widest leading-none">Entrada</h4><code className="text-slate-600 block">{log.inputParams}</code></div>
                              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm"><h4 className="font-black text-indigo-500 mb-2 uppercase tracking-widest leading-none">Respuesta</h4><code className="text-slate-600 block break-all">{log.status === 'SUCCESS' ? log.responseBody : log.errorMessage}</code></div>
                            </div>
                          </td></tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-4 border-t border-slate-100 bg-white flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Página {currentPage + 1} de {totalPages || 1}</span>
                <div className="flex gap-2">
                  <button onClick={() => setCurrentPage(Math.max(0, currentPage - 1))} disabled={currentPage === 0} className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-30 transition-colors"><ChevronLeft size={16}/></button>
                  <button onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))} disabled={currentPage >= totalPages - 1} className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-30 transition-colors"><ChevronRight size={16}/></button>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-slate-900 rounded-3xl p-6 text-white overflow-hidden relative shadow-2xl">
              <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-indigo-500 rounded-full blur-3xl opacity-20"></div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-indigo-400 mb-6">Estado del Sistema</h3>
              <div className="space-y-5">
                {metrics.map(m => (
                  <div key={m.serviceId + '_stat'} className="flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${m.errorRate > 15 ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`}></div>
                      <span className="text-sm font-medium text-slate-300 capitalize group-hover:text-white transition-colors">{m.serviceId}</span>
                    </div>
                    <span className={`text-xs font-black p-1 rounded ${m.errorRate > 15 ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {m.errorRate > 15 ? 'Crítico' : 'Normal'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-5 text-indigo-600">
                 <ShieldAlert size={60} />
               </div>
               <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-6 underline decoration-slate-100 underline-offset-8">Alertas Recientes</h3>
               
               <div className="space-y-4">
                 <div className="flex items-start gap-3 p-3 bg-emerald-50 rounded-2xl border border-emerald-100">
                    <CheckCircle2 size={16} className="text-emerald-500 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-emerald-800">Sincronización Exitosa</p>
                      <p className="text-[10px] text-emerald-600">Base de datos H2 operativa.</p>
                    </div>
                 </div>
                 
                 <div className="flex items-start gap-3 p-3 bg-indigo-50 rounded-2xl border border-indigo-100">
                    <Zap size={16} className="text-indigo-500 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-indigo-800">Carga Controlada</p>
                      <p className="text-[10px] text-indigo-600">Proxy auditando peticiones entrantes.</p>
                    </div>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
