import { useState, useEffect, type ReactNode } from 'react';
import { Copy, Check, ShoppingCart, Shield, Zap, Crown, Server, Users, Activity } from 'lucide-react';

// --- Interfaces ---
interface Kit {
  id: string;
  name: string;
  icon: ReactNode;
  description: string;
  perks: string[];
  color: string;
  shadowColor: string;
}

interface ServerInfo {
  id: string;
  name: string;
  description: string;
  command: string;
  battlemetricsId?: string;
  isHighlighted?: boolean;
  gradient: string;
}

// --- Data ---
const SERVERS: ServerInfo[] = [
  {
    id: "main-x3",
    name: "Plomo | 3x | Loot+",
    description: "Servidor principal x3 con loot mejorado y eventos activos.",
    command: import.meta.env.VITE_SERVER_COMMAND || "client.connect localhost:28015",
    battlemetricsId: import.meta.env.VITE_BATTLEMETRICS_SERVER_ID || "25178659", // ID de prueba (Rustafied o similar)
    isHighlighted: true,
    gradient: "from-orange-500 to-red-600"
  },
  // {
  //   id: "vanilla-x1",
  //   name: "Plomo | Vanilla",
  //   description: "Para los puristas. Experiencia Vanilla 100%.",
  //   command: "client.connect vanilla.tuserver.com:28015",
  //   battlemetricsId: "12345678",
  //   isHighlighted: false,
  //   gradient: "from-blue-500 to-cyan-500"
  // }
];

const KITS: Kit[] = [
  {
    id: 'vip',
    name: 'VIP',
    icon: <Shield className="w-8 h-8" />,
    description: 'Ideal para empezar con ventaja sin romper la economía.',
    perks: ['Kit de inicio mejorado', 'Skip queue (Fila prioritaria)', 'Tag VIP en el chat'],
    color: 'from-blue-500 to-cyan-400',
    shadowColor: 'hover:shadow-cyan-500/20 hover:border-cyan-500/50',
  },
  {
    id: 'vip-plus',
    name: 'VIP+',
    icon: <Zap className="w-8 h-8" />,
    description: 'Para los que buscan un farmeo más agresivo y comodidades.',
    perks: ['Todo lo del VIP', '/skin box (Skins gratis)', 'Reciclaje un 50% más rápido', 'Cooldown de TP reducido'],
    color: 'from-purple-500 to-pink-500',
    shadowColor: 'hover:shadow-purple-500/20 hover:border-purple-500/50',
  },
  {
    id: 'vip-plus-plus',
    name: 'VIP++',
    icon: <Crown className="w-8 h-8" />,
    description: 'La experiencia definitiva para dominar el wipe.',
    perks: ['Todo lo del VIP+', 'Wipe de BPs ignorado', '/bgrade automático', 'Llamar 1 airdrop personal al día'],
    color: 'from-amber-400 to-orange-600',
    shadowColor: 'hover:shadow-orange-500/20 hover:border-orange-500/50',
  },
];

// --- Components ---
function ServerCard({ server }: { server: ServerInfo }) {
  const [copied, setCopied] = useState(false);
  const [players, setPlayers] = useState<number | null>(null);
  const [maxPlayers, setMaxPlayers] = useState<number | null>(null);
  const [status, setStatus] = useState<string>('loading');

  useEffect(() => {
    if (!server.battlemetricsId) {
      setStatus('unknown');
      return;
    }
    
    // Fetch real-time data from BattleMetrics
    fetch(`https://api.battlemetrics.com/servers/${server.battlemetricsId}`)
      .then(res => res.json())
      .then(data => {
        if (data?.data?.attributes) {
          setPlayers(data.data.attributes.players);
          setMaxPlayers(data.data.attributes.maxPlayers);
          setStatus(data.data.attributes.status); // usually "online" or "offline"
        }
      })
      .catch(() => setStatus('error'));
  }, [server.battlemetricsId]);

  const handleCopy = () => {
    navigator.clipboard.writeText(server.command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isOnline = status === 'online';

  return (
    <div className={`relative flex flex-col bg-black/60 backdrop-blur-xl border rounded-[2rem] p-6 sm:p-8 transition-all duration-300 transform hover:-translate-y-1 shadow-2xl ${
      server.isHighlighted 
        ? 'border-orange-500/50 shadow-orange-500/20 hover:shadow-orange-500/40 hover:border-orange-500' 
        : 'border-white/10 hover:border-white/30'
    }`}>
      {server.isHighlighted && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-black uppercase tracking-widest py-1 px-4 rounded-full shadow-lg">
          Servidor Principal
        </div>
      )}

      <h3 className="text-2xl font-black text-white mb-2 tracking-tight flex items-center justify-between">
        {server.name}
        {status !== 'loading' && status !== 'unknown' && (
          <span className="relative flex h-3 w-3 ml-3 shrink-0">
            {isOnline && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>}
            <span className={`relative inline-flex rounded-full h-3 w-3 ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></span>
          </span>
        )}
      </h3>
      
      <p className="text-neutral-400 text-sm mb-6 flex-1">{server.description}</p>

      {/* Population & Status */}
      <div className="flex items-center gap-4 mb-6 bg-white/5 p-4 rounded-2xl border border-white/5">
        <div className="flex items-center gap-2 text-neutral-300">
          <Users className="w-4 h-4 text-orange-400" />
          <span className="font-medium text-sm">
            {status === 'loading' ? 'Cargando...' : 
             status === 'error' ? 'Error API' : 
             players !== null ? `${players} / ${maxPlayers}` : 'Desconocido'}
          </span>
        </div>
        <div className="flex items-center gap-2 text-neutral-300">
          <Activity className="w-4 h-4 text-orange-400" />
          <span className="font-medium text-sm capitalize">{status === 'loading' ? '...' : status}</span>
        </div>
      </div>

      {/* Copy Command */}
      <div className="bg-black/50 border border-white/10 p-2 rounded-2xl flex flex-col xl:flex-row items-center transition-all hover:bg-black/70">
        <code className="px-4 py-2 text-orange-400 font-mono text-sm w-full text-center xl:text-left overflow-x-auto whitespace-nowrap scrollbar-hide">
          {server.command}
        </code>
        <button
          onClick={handleCopy}
          className={`mt-2 xl:mt-0 xl:ml-2 flex items-center justify-center gap-2 text-white px-6 py-3 rounded-xl font-bold transition-all active:scale-95 w-full xl:w-auto shrink-0 ${
            server.isHighlighted 
              ? 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 shadow-lg shadow-orange-600/30' 
              : 'bg-white/10 hover:bg-white/20'
          }`}
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? 'Copiado!' : 'Copiar IP'}
        </button>
      </div>
    </div>
  );
}

// --- Main App ---
export default function App() {
  const tebexUrl = import.meta.env.VITE_TEBEX_URL || "#";
  const serverName = import.meta.env.VITE_SERVER_NAME || "Rust Server";

  return (
    <div className="min-h-screen bg-black text-slate-200 font-sans selection:bg-orange-500 selection:text-white relative">
      
      <div className="fixed inset-0 z-0 bg-[url('/rust_bg.png')] bg-cover bg-center bg-no-repeat" />
      <div className="fixed inset-0 z-0 bg-gradient-to-b from-black/80 via-black/70 to-black/95 backdrop-blur-[2px]" />

      <div className="relative z-10">
        {/* Hero Section */}
        <header className="relative flex flex-col items-center justify-center pt-32 pb-24 px-4 overflow-hidden min-h-[65vh]">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-orange-600/30 blur-[150px] rounded-full pointer-events-none" />

          <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-red-500 to-orange-600 mb-6 text-center z-10 tracking-tight drop-shadow-lg">
            {serverName}
          </h1>

          <p className="text-xl md:text-2xl text-neutral-300 mb-16 max-w-3xl text-center z-10 font-light drop-shadow-md">
            Únete a la mejor experiencia x3 de la comunidad latina. Servidor optimizado, sin lag y con eventos activos.
          </p>

          {/* Servers Grid */}
          <div className="z-10 w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 justify-center">
            {SERVERS.map(server => (
              <ServerCard key={server.id} server={server} />
            ))}
          </div>
        </header>

        {/* Kits Section */}
        <section className="py-24 px-4 max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black mb-4 flex items-center justify-center gap-4 text-white drop-shadow-md">
              <Server className="text-orange-500 w-10 h-10" /> Rangos y Beneficios
            </h2>
            <p className="text-lg text-neutral-400 font-light">Apoya al servidor y obtén ventajas exclusivas para tu wipe.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
            {KITS.map((kit) => (
              <div
                key={kit.id}
                className={`bg-white/5 backdrop-blur-lg border border-white/10 rounded-[2rem] p-8 md:p-10 transition-all duration-300 transform hover:-translate-y-2 hover:bg-white/10 shadow-2xl ${kit.shadowColor} flex flex-col group`}
              >
                <div className={`inline-flex p-5 rounded-2xl bg-gradient-to-br ${kit.color} text-white mb-8 shadow-lg shadow-${kit.color.split('-')[1]}/30 w-max group-hover:scale-110 transition-transform duration-300`}>
                  {kit.icon}
                </div>
                
                <h3 className="text-3xl font-black mb-4 text-white tracking-tight">{kit.name}</h3>
                <p className="text-neutral-400 mb-8 text-base leading-relaxed">{kit.description}</p>

                <ul className="space-y-4 mb-10 flex-1">
                  {kit.perks.map((perk, index) => (
                    <li key={index} className="flex items-start gap-3 text-base font-medium text-neutral-200">
                      <Check className="w-6 h-6 text-orange-500 shrink-0 mt-0.5" />
                      <span>{perk}</span>
                    </li>
                  ))}
                </ul>

                <a
                  href={tebexUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-5 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center gap-3 font-bold transition-all mt-auto text-white border border-white/10 hover:border-white/30 backdrop-blur-sm"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Ver en la Tienda
                </a>
              </div>
            ))}
          </div>
        </section>

        <footer className="border-t border-white/10 bg-black/40 backdrop-blur-md py-10 mt-20 text-center text-neutral-500 text-sm font-medium">
          <p>© {new Date().getFullYear()} {serverName}. Todos los derechos reservados.</p>
        </footer>
      </div>
    </div>
  );
}