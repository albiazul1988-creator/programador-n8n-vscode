import Link from 'next/link'
import {
  Building2, Megaphone, AlertCircle, Calendar, CreditCard,
  Vote, FileText, MessageSquare, Users, CheckCircle2,
  ArrowRight, Shield, Zap, Star, ChevronRight, Phone,
} from 'lucide-react'

// ─── NAVBAR ──────────────────────────────────────────────────────────────────
function Navbar() {
  return (
    <header className="fixed top-0 inset-x-0 z-50 border-b border-slate-200/60 bg-white/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center shadow-sm">
            <Building2 className="w-4.5 h-4.5 text-white" />
          </div>
          <span className="font-bold text-slate-900 text-lg tracking-tight">Comunify</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          <a href="#funciones" className="hover:text-slate-900 transition">Funciones</a>
          <a href="#como-funciona" className="hover:text-slate-900 transition">Cómo funciona</a>
          <a href="#precios" className="hover:text-slate-900 transition">Precios</a>
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition hidden sm:block">
            Iniciar sesión
          </Link>
          <Link href="/register"
            className="flex items-center gap-1.5 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition shadow-sm">
            Prueba gratis <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </header>
  )
}

// ─── HERO ─────────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section className="pt-32 pb-20 px-6 relative overflow-hidden">
      {/* Grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:48px_48px]" />
      {/* Gradient orb */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-blue-50 rounded-full blur-3xl opacity-60" />

      <div className="max-w-4xl mx-auto text-center relative">
        <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold px-4 py-2 rounded-full mb-8">
          <Zap className="w-3.5 h-3.5" />
          Gestión digital de comunidades · Hecho en España
        </div>

        <h1 className="text-5xl sm:text-6xl font-bold text-slate-900 tracking-tight leading-tight mb-6">
          El panel que tu{' '}
          <span className="text-blue-600 relative">
            comunidad
            <svg className="absolute -bottom-1 left-0 w-full" viewBox="0 0 300 8" fill="none">
              <path d="M1 5.5C60 2 120 1 180 3.5C240 6 270 7 299 5.5" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          </span>{' '}
          llevaba esperando
        </h1>

        <p className="text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed">
          Incidencias, cuotas, reservas, votaciones y documentos en un único lugar.
          Diseñado para administradores de fincas que quieren trabajar menos y dar mejor servicio.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-16">
          <Link href="/register"
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4 rounded-2xl transition shadow-lg shadow-blue-200 text-base">
            Empieza gratis — sin tarjeta
            <ArrowRight className="w-4 h-4" />
          </Link>
          <a href="#como-funciona"
            className="flex items-center justify-center gap-2 border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold px-8 py-4 rounded-2xl transition text-base">
            Ver cómo funciona
          </a>
        </div>

        {/* Panel mockup */}
        <div className="relative mx-auto max-w-5xl">
          <div className="absolute -inset-4 bg-gradient-to-b from-blue-100/50 to-transparent rounded-3xl blur-2xl" />
          <div className="relative bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden">
            {/* Fake browser chrome */}
            <div className="bg-slate-100 border-b border-slate-200 px-4 py-3 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-amber-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
              <div className="flex-1 mx-4 bg-white border border-slate-200 rounded-lg py-1 px-3 text-xs text-slate-400 text-center">
                app.comunify.es/admin
              </div>
            </div>
            {/* Dashboard preview */}
            <div className="flex h-80">
              {/* Sidebar */}
              <div className="w-48 bg-white border-r border-slate-100 p-3 shrink-0">
                <div className="flex items-center gap-2 px-3 py-2 mb-4">
                  <div className="w-6 h-6 bg-blue-600 rounded-lg" />
                  <span className="text-xs font-bold text-slate-900">Comunify</span>
                </div>
                {[
                  { label: 'Dashboard', active: true },
                  { label: 'Anuncios', active: false },
                  { label: 'Incidencias', active: false },
                  { label: 'Reservas', active: false },
                  { label: 'Cuotas', active: false },
                  { label: 'Votaciones', active: false },
                ].map(item => (
                  <div key={item.label} className={`flex items-center gap-2 px-3 py-2 rounded-lg mb-0.5 ${item.active ? 'bg-blue-50' : ''}`}>
                    <div className={`w-3 h-3 rounded ${item.active ? 'bg-blue-600' : 'bg-slate-200'}`} />
                    <span className={`text-xs font-medium ${item.active ? 'text-blue-700' : 'text-slate-500'}`}>{item.label}</span>
                  </div>
                ))}
              </div>
              {/* Content */}
              <div className="flex-1 bg-slate-50 p-5">
                <div className="grid grid-cols-4 gap-3 mb-4">
                  {[
                    { label: 'Vecinos', value: '48', color: 'bg-blue-500' },
                    { label: 'Incidencias', value: '3', color: 'bg-amber-500' },
                    { label: 'Cuotas pendientes', value: '7', color: 'bg-red-500' },
                    { label: 'Reservas hoy', value: '2', color: 'bg-green-500' },
                  ].map(s => (
                    <div key={s.label} className="bg-white rounded-xl border border-slate-100 p-3">
                      <div className={`w-6 h-1.5 ${s.color} rounded-full mb-2`} />
                      <p className="text-lg font-bold text-slate-900">{s.value}</p>
                      <p className="text-xs text-slate-400">{s.label}</p>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white rounded-xl border border-slate-100 p-3">
                    <p className="text-xs font-semibold text-slate-500 mb-2">ANUNCIOS RECIENTES</p>
                    {['Revisión ascensor 15 de mayo', 'Junta extraordinaria convocada', 'Limpieza piscina completada'].map(t => (
                      <div key={t} className="flex items-center gap-2 py-1.5">
                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full shrink-0" />
                        <span className="text-xs text-slate-600 truncate">{t}</span>
                      </div>
                    ))}
                  </div>
                  <div className="bg-white rounded-xl border border-slate-100 p-3">
                    <p className="text-xs font-semibold text-slate-500 mb-2">INCIDENCIAS ABIERTAS</p>
                    {[
                      { t: 'Fuga en escalera B', p: 'Alta' },
                      { t: 'Luz portal fundida', p: 'Media' },
                      { t: 'Portero automático', p: 'Baja' },
                    ].map(i => (
                      <div key={i.t} className="flex items-center justify-between py-1.5">
                        <span className="text-xs text-slate-600 truncate flex-1">{i.t}</span>
                        <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${i.p === 'Alta' ? 'bg-red-50 text-red-600' : i.p === 'Media' ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-500'}`}>{i.p}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── SOCIAL PROOF ─────────────────────────────────────────────────────────────
function SocialProof() {
  const stats = [
    { value: '500+', label: 'Vecinos gestionados' },
    { value: '12', label: 'Comunidades activas' },
    { value: '98%', label: 'Satisfacción media' },
    { value: '< 2 min', label: 'Para crear una incidencia' },
  ]

  return (
    <section className="border-y border-slate-100 bg-slate-50 py-12 px-6">
      <div className="max-w-5xl mx-auto">
        <p className="text-center text-xs font-semibold text-slate-400 uppercase tracking-widest mb-8">
          Números que hablan solos
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map(s => (
            <div key={s.label} className="text-center">
              <p className="text-3xl font-bold text-slate-900 mb-1">{s.value}</p>
              <p className="text-sm text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── FEATURES ─────────────────────────────────────────────────────────────────
function Features() {
  const features = [
    {
      icon: Megaphone,
      color: 'bg-blue-100 text-blue-600',
      title: 'Tablón de anuncios',
      desc: 'Publica avisos urgentes, convocatorias o novedades. Los vecinos los reciben al instante en su portal.',
    },
    {
      icon: AlertCircle,
      color: 'bg-amber-100 text-amber-600',
      title: 'Gestión de incidencias',
      desc: 'Del reporte a la resolución en un flujo estructurado. Con historial, prioridades y seguimiento en tiempo real.',
    },
    {
      icon: Calendar,
      color: 'bg-green-100 text-green-600',
      title: 'Reserva de zonas',
      desc: 'Piscina, pista de pádel, salón social... Cada vecino reserva desde su móvil sin llamadas ni conflictos.',
    },
    {
      icon: CreditCard,
      color: 'bg-purple-100 text-purple-600',
      title: 'Cuotas y pagos',
      desc: 'Genera recibos, registra pagos y detecta morosos automáticamente. Todo en una sola pantalla.',
    },
    {
      icon: Vote,
      color: 'bg-rose-100 text-rose-600',
      title: 'Votaciones digitales',
      desc: 'Organiza juntas virtuales con votaciones vinculantes. Resultados inmediatos y acta generada automáticamente.',
    },
    {
      icon: FileText,
      color: 'bg-teal-100 text-teal-600',
      title: 'Repositorio de documentos',
      desc: 'Estatutos, actas, presupuestos y contratos organizados y accesibles para quien tú decidas.',
    },
    {
      icon: MessageSquare,
      color: 'bg-indigo-100 text-indigo-600',
      title: 'Chat comunitario',
      desc: 'Canal de comunicación directo entre vecinos y administración. Sin grupos de WhatsApp caóticos.',
    },
    {
      icon: Users,
      color: 'bg-orange-100 text-orange-600',
      title: 'Portal del vecino',
      desc: 'Cada propietario o inquilino tiene su propio acceso para ver sus pagos, reportar y reservar.',
    },
  ]

  return (
    <section id="funciones" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-3">Funcionalidades</p>
          <h2 className="text-4xl font-bold text-slate-900 mb-4">
            Todo lo que una comunidad necesita
          </h2>
          <p className="text-lg text-slate-500 max-w-xl mx-auto">
            Ocho módulos completamente integrados. Sin apps de terceros, sin exportaciones manuales, sin fricciones.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map(f => (
            <div key={f.title}
              className="group bg-white border border-slate-100 rounded-2xl p-6 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-50 transition-all duration-300">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${f.color}`}>
                <f.icon className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">{f.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── HOW IT WORKS ─────────────────────────────────────────────────────────────
function HowItWorks() {
  const steps = [
    {
      num: '01',
      title: 'Registra tu comunidad',
      desc: 'Crea tu cuenta en 2 minutos. Introduce el nombre de la comunidad, dirección y número de unidades. Ya está operativo.',
      detail: 'Sin instalaciones. Sin configuraciones técnicas. Funciona desde el primer día.',
    },
    {
      num: '02',
      title: 'Invita a los vecinos',
      desc: 'Sube un CSV con todos los propietarios o añádelos uno a uno. Cada vecino recibe sus credenciales de acceso automáticamente.',
      detail: 'Plantilla CSV incluida. Importación masiva en segundos.',
    },
    {
      num: '03',
      title: 'Gestiona desde el panel',
      desc: 'Dashboard unificado donde controlas incidencias, pagos, reservas y comunicaciones sin cambiar de pantalla.',
      detail: 'Acceso desde cualquier dispositivo. Panel admin + portal vecino.',
    },
  ]

  return (
    <section id="como-funciona" className="py-24 px-6 bg-slate-50">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-3">Proceso</p>
          <h2 className="text-4xl font-bold text-slate-900 mb-4">
            De cero a funcionando en una tarde
          </h2>
          <p className="text-lg text-slate-500 max-w-xl mx-auto">
            Sin curvas de aprendizaje pronunciadas. Sin consultores de implementación.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {steps.map((s, i) => (
            <div key={s.num} className="relative">
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-8 left-[calc(100%+8px)] w-[calc(100%-16px)] h-px bg-blue-200 border-t-2 border-dashed border-blue-200 z-10" style={{ width: 'calc(100% - 32px)', left: 'calc(100% + 16px)' }} />
              )}
              <div className="bg-white border border-slate-100 rounded-2xl p-6 h-full">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl font-black text-blue-100">{s.num}</span>
                  <div className="h-px flex-1 bg-slate-100" />
                </div>
                <h3 className="font-bold text-slate-900 text-lg mb-2">{s.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-4">{s.desc}</p>
                <div className="flex items-start gap-2 bg-blue-50 rounded-xl p-3">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                  <p className="text-xs text-blue-700 font-medium">{s.detail}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── PRICING ──────────────────────────────────────────────────────────────────
function Pricing() {
  const plans = [
    {
      name: 'Básico',
      price: '39',
      units: 'Hasta 50 propietarios',
      desc: 'Perfecto para comunidades pequeñas o portales',
      highlight: false,
      features: [
        'Todos los módulos incluidos',
        'Portal para cada vecino',
        'Hasta 5 GB de documentos',
        'Soporte por email',
      ],
    },
    {
      name: 'Estándar',
      price: '69',
      units: 'Hasta 150 propietarios',
      desc: 'La elección más popular para comunidades medianas',
      highlight: true,
      features: [
        'Todo lo del plan Básico',
        'Hasta 20 GB de documentos',
        'Importación CSV de vecinos',
        'Soporte prioritario',
        'Historial de votaciones ilimitado',
      ],
    },
    {
      name: 'Premium',
      price: '109',
      units: 'Hasta 300 propietarios',
      desc: 'Para urbanizaciones y grandes comunidades',
      highlight: false,
      features: [
        'Todo lo del plan Estándar',
        'Hasta 50 GB de documentos',
        'Múltiples administradores',
        'Soporte telefónico',
        'Onboarding personalizado',
      ],
    },
  ]

  return (
    <section id="precios" className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-3">Precios</p>
          <h2 className="text-4xl font-bold text-slate-900 mb-4">
            Claro, sin sorpresas
          </h2>
          <p className="text-lg text-slate-500 max-w-xl mx-auto">
            Un precio mensual fijo según el tamaño de tu comunidad. Sin por-vecino, sin extras ocultos.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 items-center">
          {plans.map(p => (
            <div key={p.name} className={`rounded-2xl p-8 relative ${
              p.highlight
                ? 'bg-blue-600 text-white shadow-2xl shadow-blue-200 scale-105'
                : 'bg-white border border-slate-100 shadow-sm'
            }`}>
              {p.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-amber-400 text-amber-900 text-xs font-bold px-3 py-1 rounded-full">
                    Más popular
                  </span>
                </div>
              )}

              <div className="mb-6">
                <p className={`text-sm font-semibold mb-1 ${p.highlight ? 'text-blue-100' : 'text-slate-500'}`}>{p.name}</p>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className={`text-4xl font-black ${p.highlight ? 'text-white' : 'text-slate-900'}`}>{p.price}€</span>
                  <span className={`text-sm ${p.highlight ? 'text-blue-200' : 'text-slate-400'}`}>/mes</span>
                </div>
                <p className={`text-xs font-medium ${p.highlight ? 'text-blue-200' : 'text-blue-600'}`}>{p.units}</p>
                <p className={`text-sm mt-2 ${p.highlight ? 'text-blue-100' : 'text-slate-500'}`}>{p.desc}</p>
              </div>

              <ul className="space-y-3 mb-8">
                {p.features.map(f => (
                  <li key={f} className="flex items-start gap-2.5">
                    <CheckCircle2 className={`w-4 h-4 mt-0.5 shrink-0 ${p.highlight ? 'text-blue-200' : 'text-green-500'}`} />
                    <span className={`text-sm ${p.highlight ? 'text-blue-100' : 'text-slate-600'}`}>{f}</span>
                  </li>
                ))}
              </ul>

              <Link href="/register"
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition ${
                  p.highlight
                    ? 'bg-white text-blue-600 hover:bg-blue-50'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}>
                Empezar ahora
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <p className="text-slate-500 text-sm">
            ¿Más de 300 propietarios?{' '}
            <a href="mailto:hola@comunify.es" className="text-blue-600 font-medium hover:underline">
              Pide un presupuesto personalizado
            </a>
          </p>
        </div>
      </div>
    </section>
  )
}

// ─── TESTIMONIALS ─────────────────────────────────────────────────────────────
function Testimonials() {
  const items = [
    {
      quote: 'Antes tardaba dos horas en gestionar las incidencias del mes. Ahora lo hago en veinte minutos desde el móvil.',
      name: 'Manuel García',
      role: 'Administrador de fincas · Madrid',
      stars: 5,
    },
    {
      quote: 'Los vecinos por fin pueden ver sus cuotas sin llamarme. Y las votaciones de la junta se resuelven en un día.',
      name: 'Carmen Reyes',
      role: 'Presidenta de comunidad · Barcelona',
      stars: 5,
    },
    {
      quote: 'Gestiono doce comunidades y con Comunify tengo todo controlado desde un solo panel. Inmejorable.',
      name: 'Javier Molina',
      role: 'Administrador de fincas · Valencia',
      stars: 5,
    },
  ]

  return (
    <section className="py-24 px-6 bg-slate-50">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-3">Testimonios</p>
          <h2 className="text-4xl font-bold text-slate-900">
            Comunidades que ya lo usan
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {items.map(t => (
            <div key={t.name} className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: t.stars }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                ))}
              </div>
              <p className="text-slate-700 text-sm leading-relaxed mb-5 italic">"{t.quote}"</p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-bold">
                  {t.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{t.name}</p>
                  <p className="text-xs text-slate-500">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── TRUST SIGNALS ────────────────────────────────────────────────────────────
function TrustSignals() {
  const signals = [
    { icon: Shield, title: 'Datos en Europa', desc: 'Infraestructura en servidores europeos. Cumplimiento RGPD garantizado.' },
    { icon: Zap, title: 'Siempre disponible', desc: '99.9% de uptime. Actualizaciones sin interrupciones de servicio.' },
    { icon: Phone, title: 'Soporte real', desc: 'Un equipo humano te ayuda cuando lo necesitas. No bots, no respuestas genéricas.' },
  ]

  return (
    <section className="py-16 px-6 border-t border-slate-100">
      <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8">
        {signals.map(s => (
          <div key={s.title} className="flex gap-4">
            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center shrink-0">
              <s.icon className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <p className="font-semibold text-slate-900 mb-1">{s.title}</p>
              <p className="text-sm text-slate-500 leading-relaxed">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

// ─── CTA FINAL ────────────────────────────────────────────────────────────────
function CTASection() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="relative bg-blue-600 rounded-3xl p-12 text-center overflow-hidden">
          {/* Background pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:32px_32px]" />
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-500 rounded-full blur-3xl opacity-40" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-indigo-600 rounded-full blur-3xl opacity-40" />

          <div className="relative">
            <h2 className="text-4xl font-bold text-white mb-4">
              ¿Listo para modernizar tu comunidad?
            </h2>
            <p className="text-blue-100 text-lg mb-8 max-w-lg mx-auto">
              Empieza sin compromiso. Sin tarjeta de crédito. Si en 30 días no es lo que esperabas, te devolvemos el dinero.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/register"
                className="flex items-center justify-center gap-2 bg-white text-blue-600 hover:bg-blue-50 font-bold px-8 py-4 rounded-2xl transition text-base shadow-lg">
                Crear mi cuenta gratis
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a href="mailto:hola@comunify.es"
                className="flex items-center justify-center gap-2 border-2 border-white/30 text-white hover:bg-white/10 font-semibold px-8 py-4 rounded-2xl transition text-base">
                Hablar con el equipo
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── FOOTER ───────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="border-t border-slate-100 py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between gap-8 mb-10">
          <div className="max-w-xs">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-7 h-7 bg-blue-600 rounded-xl flex items-center justify-center">
                <Building2 className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-bold text-slate-900">Comunify</span>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed">
              Software de gestión para comunidades de propietarios. Hecho en España para el mercado español.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 text-sm">
            <div>
              <p className="font-semibold text-slate-900 mb-3">Producto</p>
              <ul className="space-y-2 text-slate-500">
                <li><a href="#funciones" className="hover:text-slate-900 transition">Funcionalidades</a></li>
                <li><a href="#precios" className="hover:text-slate-900 transition">Precios</a></li>
                <li><a href="#como-funciona" className="hover:text-slate-900 transition">Cómo funciona</a></li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-slate-900 mb-3">Empresa</p>
              <ul className="space-y-2 text-slate-500">
                <li><a href="mailto:hola@comunify.es" className="hover:text-slate-900 transition">Contacto</a></li>
                <li><a href="#" className="hover:text-slate-900 transition">Aviso legal</a></li>
                <li><a href="#" className="hover:text-slate-900 transition">Privacidad</a></li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-slate-900 mb-3">Acceso</p>
              <ul className="space-y-2 text-slate-500">
                <li><Link href="/login" className="hover:text-slate-900 transition">Iniciar sesión</Link></li>
                <li><Link href="/register" className="hover:text-slate-900 transition">Crear cuenta</Link></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs text-slate-400">© 2025 Comunify. Todos los derechos reservados.</p>
          <p className="text-xs text-slate-400">
            Cumplimiento RGPD · Datos alojados en la Unión Europea
          </p>
        </div>
      </div>
    </footer>
  )
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <>
      <Navbar />
      <Hero />
      <SocialProof />
      <Features />
      <HowItWorks />
      <Pricing />
      <Testimonials />
      <TrustSignals />
      <CTASection />
      <Footer />
    </>
  )
}
