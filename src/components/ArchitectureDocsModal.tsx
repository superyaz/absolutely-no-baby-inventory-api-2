import React, { useState } from 'react';
import {
  X,
  Shield,
  Server,
  GitBranch,
  Activity,
  CheckCircle,
  Database,
  Lock,
  Layers,
  Terminal,
  Cpu,
  Globe,
  Radio,
  FileCode
} from 'lucide-react';

interface ArchitectureDocsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ArchitectureDocsModal: React.FC<ArchitectureDocsModalProps> = ({
  isOpen,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'milestones' | 'database' | 'security' | 'cicd' | 'monitoring'>('milestones');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-600/10 border border-red-500/20 flex items-center justify-center text-red-500">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-100 flex items-center gap-2">
                Arquitectura Técnica, CI/CD & Seguridad en Nube
              </h2>
              <p className="text-xs text-neutral-400">
                Especificación de ingeniería para Absolutely No Baby · Valle de Aburrá
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub-tabs */}
        <div className="flex border-b border-neutral-800 px-4 bg-neutral-950/40 text-xs font-semibold text-neutral-400 overflow-x-auto">
          <button
            onClick={() => setActiveTab('milestones')}
            className={`py-3 px-3.5 border-b-2 transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'milestones' ? 'border-red-500 text-white' : 'border-transparent hover:text-neutral-200'
            }`}
          >
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>Hitos & Tareas Técnicas</span>
          </button>

          <button
            onClick={() => setActiveTab('database')}
            className={`py-3 px-3.5 border-b-2 transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'database' ? 'border-red-500 text-white' : 'border-transparent hover:text-neutral-200'
            }`}
          >
            <Database className="w-3.5 h-3.5 text-cyan-400" />
            <span>Base de Datos Distribuida</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`py-3 px-3.5 border-b-2 transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'security' ? 'border-red-500 text-white' : 'border-transparent hover:text-neutral-200'
            }`}
          >
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span>Seguridad & Nube Pública</span>
          </button>

          <button
            onClick={() => setActiveTab('cicd')}
            className={`py-3 px-3.5 border-b-2 transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'cicd' ? 'border-red-500 text-white' : 'border-transparent hover:text-neutral-200'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5 text-purple-400" />
            <span>Pipeline CI/CD</span>
          </button>

          <button
            onClick={() => setActiveTab('monitoring')}
            className={`py-3 px-3.5 border-b-2 transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'monitoring' ? 'border-red-500 text-white' : 'border-transparent hover:text-neutral-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-red-400" />
            <span>Monitoreo & SRE</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto flex-1 text-xs space-y-4 text-neutral-300">
          {/* TAB 1: MILESTONES & TASKS */}
          {activeTab === 'milestones' && (
            <div className="space-y-4">
              <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-xl space-y-2">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-red-500" />
                  Hitos Técnicos Clave de Implementación
                </h3>
                <p className="text-neutral-400 text-xs leading-relaxed">
                  Plan estructurado de ingeniería para garantizar alta disponibilidad, tolerancia a fallos offline y trazabilidad inmutable en las tiendas de Medellín, Bello, Sabaneta, Envigado e Itagüí.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3.5 bg-neutral-950/70 border border-neutral-800 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs">Hito 1: Motor de Codificación 7D</span>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">100% Completado</span>
                  </div>
                  <p className="text-[11px] text-neutral-400">
                    Estructuración estricta de código único GG·TT·MM·C (Grupos 31-52, Tipos 01-12, Modelo y Consecutivo) con prevención proactiva de duplicados y validación cruzada antes de registro.
                  </p>
                </div>

                <div className="p-3.5 bg-neutral-950/70 border border-neutral-800 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs">Hito 2: Lector Óptico & Térmica</span>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">100% Completado</span>
                  </div>
                  <p className="text-[11px] text-neutral-400">
                    Lector asistido por cámara nativa web/móvil y compatibilidad con pistolas láser HID vía keyboard wedge, sumado a motor de impresión de etiquetas en rollos 58mm/80mm y pliegos A4.
                  </p>
                </div>

                <div className="p-3.5 bg-neutral-950/70 border border-neutral-800 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs">Hito 3: Matriz Multi-Tienda & Sizing</span>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">100% Completado</span>
                  </div>
                  <p className="text-[11px] text-neutral-400">
                    Independencia de inventario por tienda, producto, talla y color. Visualización en tiempo real de saldos en El Tesoro, Fabricato Bello, Mayorca, Viva Laureles, Arkadia y Bodega Central.
                  </p>
                </div>

                <div className="p-3.5 bg-neutral-950/70 border border-neutral-800 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs">Hito 4: Flujo Formal de Traslados</span>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">100% Completado</span>
                  </div>
                  <p className="text-[11px] text-neutral-400">
                    Ciclo con solicitud, aprobación por tienda origen, despacho automático, estado en tránsito y recepción conforme en destino. Caso de prueba Bello ➔ Tesoro 100% implementado.
                  </p>
                </div>

                <div className="p-3.5 bg-neutral-950/70 border border-neutral-800 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs">Hito 5: Conteos Físicos & Ajustes</span>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">100% Completado</span>
                  </div>
                  <p className="text-[11px] text-neutral-400">
                    Cálculo automatizado de diferencias (+/-), valoración de descuadre y aprobación restringida por rol directivo con justificación inmutable y firma digital de auditoría.
                  </p>
                </div>

                <div className="p-3.5 bg-neutral-950/70 border border-neutral-800 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs">Hito 6: RBAC & Modo Offline PWA</span>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">100% Completado</span>
                  </div>
                  <p className="text-[11px] text-neutral-400">
                    Perfiles definidos (Admin General, Admin Tienda, Empleado Operativo), service worker con soporte offline y broadcast sync en tiempo real entre múltiples dispositivos.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DISTRIBUTED DATABASE */}
          {activeTab === 'database' && (
            <div className="space-y-4">
              <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-xl space-y-2">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Database className="w-4 h-4 text-cyan-400" />
                  Topología de Base de Datos Distribuida
                </h3>
                <p className="text-neutral-400 leading-relaxed text-xs">
                  Para soportar múltiples puntos de venta físicos que operan concurrentemente (y con posible conectividad intermitente), se implementa un modelo híbrido de <strong>Consistencia Eventual Optimizada (CRDT / Event Sourcing)</strong> con sincronización bidireccional.
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 bg-neutral-950/60 border border-neutral-800 rounded-xl">
                  <h4 className="font-bold text-white text-xs mb-1">1. Particionamiento & Sharding por Sucursal (`storeId`)</h4>
                  <p className="text-neutral-400 text-[11px] leading-relaxed">
                    Las transacciones de mostrador (ventas, entradas locales, lecturas de código de barras) se procesan con latencia cero en la réplica local de la tienda. Los registros de stock tienen como clave primaria compuesta: <code className="text-red-400">storeId + sku</code>.
                  </p>
                </div>

                <div className="p-3.5 bg-neutral-950/60 border border-neutral-800 rounded-xl">
                  <h4 className="font-bold text-white text-xs mb-1">2. Modelo de Consistencia Fuerte para Transferencias Inter-Tienda</h4>
                  <p className="text-neutral-400 text-[11px] leading-relaxed">
                    A diferencia de las ventas locales, las transferencias entre tiendas (ej. Bello a El Tesoro) utilizan un protocolo de bloqueo de dos fases (2PC) o saga transaccional, asegurando que las unidades nunca se dupliquen ni desaparezcan durante el estado de despacho.
                  </p>
                </div>

                <div className="p-3.5 bg-neutral-950/60 border border-neutral-800 rounded-xl">
                  <h4 className="font-bold text-white text-xs mb-1">3. Ledger Inmutable de Movimientos (Event Sourcing)</h4>
                  <p className="text-neutral-400 text-[11px] leading-relaxed">
                    Los saldos no se sobreescriben ciegamente; cada variación emite un evento inmutable con ID único, timestamp de alta precisión, ID de usuario, firma de rol y referencia documental. El stock actual es la suma de los deltas históricos verificados.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PUBLIC CLOUD SECURITY & RBAC */}
          {activeTab === 'security' && (
            <div className="space-y-4">
              <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-xl space-y-2">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Lock className="w-4 h-4 text-amber-400" />
                  Lineamientos de Seguridad para Nube Pública (GCP / AWS)
                </h3>
                <p className="text-neutral-400 leading-relaxed text-xs">
                  Cumplimiento de estándares OWASP Top 10, Zero Trust y el Principio de Menor Privilegio (PoLP) para proteger datos sensibles de facturación, costos y catálogo.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3.5 bg-neutral-950/60 border border-neutral-800 rounded-xl space-y-1.5">
                  <span className="font-bold text-white text-xs">Cifrado de Extremo a Extremo</span>
                  <p className="text-[11px] text-neutral-400">
                    Cifrado en tránsito forzado vía <strong>TLS 1.3 con HSTS</strong>. Cifrado en reposo mediante <strong>AES-256 (KMS gestionado por cliente)</strong> para bases de datos y backups automáticos.
                  </p>
                </div>

                <div className="p-3.5 bg-neutral-950/60 border border-neutral-800 rounded-xl space-y-1.5">
                  <span className="font-bold text-white text-xs">Control de Acceso Basado en Roles (RBAC)</span>
                  <p className="text-[11px] text-neutral-400">
                    - <strong>Admin General:</strong> Control de catálogo, costos y auditoría global.<br/>
                    - <strong>Admin Tienda:</strong> Operaciones de su sucursal y traslados.<br/>
                    - <strong>Operativo POS:</strong> Solo lectura de barras, ventas y conteo (bloqueado para ajustes directos de stock).
                  </p>
                </div>

                <div className="p-3.5 bg-neutral-950/60 border border-neutral-800 rounded-xl space-y-1.5">
                  <span className="font-bold text-white text-xs">Protección de Perímetro & WAF</span>
                  <p className="text-[11px] text-neutral-400">
                    Cloud Armor / AWS WAF para filtrado de inyecciones SQL/XSS, limitación de tasa (Rate Limiting) en endpoints de lectura masiva y protección contra bots en consultas de código de barras.
                  </p>
                </div>

                <div className="p-3.5 bg-neutral-950/60 border border-neutral-800 rounded-xl space-y-1.5">
                  <span className="font-bold text-white text-xs">Gestión de Secretos & Sanitización</span>
                  <p className="text-[11px] text-neutral-400">
                    Prohibición absoluta de credenciales en código fuente. Inyección de variables seguras en tiempo de ejecución vía Google Secret Manager o HashiCorp Vault.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: CI/CD PIPELINE */}
          {activeTab === 'cicd' && (
            <div className="space-y-4">
              <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-xl space-y-2">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <GitBranch className="w-4 h-4 text-purple-400" />
                  Pipeline de Integración y Despliegue Continuo (CI/CD)
                </h3>
                <p className="text-neutral-400 leading-relaxed text-xs">
                  Flujo automatizado configurado en GitHub Actions para compilar, auditar código estático y desplegar sin tiempo de inactividad (Zero-Downtime Blue/Green Deployments).
                </p>
              </div>

              <div className="space-y-3 font-mono text-[11px]">
                <div className="p-3.5 bg-black border border-neutral-800 rounded-xl space-y-2">
                  <div className="text-neutral-400 flex items-center gap-2 font-sans font-bold text-xs">
                    <Terminal className="w-3.5 h-3.5 text-red-500" />
                    Etapas del Pipeline (.github/workflows/ci-cd.yml)
                  </div>
                  <div className="space-y-1 text-neutral-300">
                    <p><span className="text-purple-400">1. Lint & Format:</span> Ejecución de TypeScript compiler (`tsc --noEmit`) y ESLint.</p>
                    <p><span className="text-purple-400">2. Security Audit:</span> Escaneo de vulnerabilidades npm (`npm audit --audit-level=high`) y SAST con Trivy.</p>
                    <p><span className="text-purple-400">3. Test Suite:</span> Pruebas unitarias sobre la regla del código de 7 dígitos y validaciones de stock.</p>
                    <p><span className="text-purple-400">4. Container Build:</span> Empaquetado en imagen Docker optimizada multi-stage con Alpine Linux.</p>
                    <p><span className="text-purple-400">5. Continuous Deployment:</span> Despliegue automatizado a Google Cloud Run con Traffic Splitting gradual.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: MONITORING & SRE */}
          {activeTab === 'monitoring' && (
            <div className="space-y-4">
              <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-xl space-y-2">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-red-400" />
                  Monitoreo Continuo & Observabilidad (SRE)
                </h3>
                <p className="text-neutral-400 leading-relaxed text-xs">
                  Métricas de salud operativa para garantizar que los puntos de venta en Medellín y municipios aledaños tengan una experiencia ultra fluida.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 bg-neutral-950/60 border border-neutral-800 rounded-xl space-y-1">
                  <span className="text-[10px] text-neutral-500 uppercase font-bold block">
                    Latencia p99 Escaneo
                  </span>
                  <div className="text-lg font-black text-emerald-400 font-mono">&lt; 65 ms</div>
                  <p className="text-[10px] text-neutral-400">
                    Búsqueda instantánea en caché indexada local.
                  </p>
                </div>

                <div className="p-3.5 bg-neutral-950/60 border border-neutral-800 rounded-xl space-y-1">
                  <span className="text-[10px] text-neutral-500 uppercase font-bold block">
                    Disponibilidad SLA
                  </span>
                  <div className="text-lg font-black text-emerald-400 font-mono">99.95%</div>
                  <p className="text-[10px] text-neutral-400">
                    Cloud Run multi-zona con scale-to-zero y auto-recuperación.
                  </p>
                </div>

                <div className="p-3.5 bg-neutral-950/60 border border-neutral-800 rounded-xl space-y-1">
                  <span className="text-[10px] text-neutral-500 uppercase font-bold block">
                    Health Check Endpoint
                  </span>
                  <div className="text-xs font-bold text-cyan-400 font-mono">GET /healthz</div>
                  <p className="text-[10px] text-neutral-400">
                    Sondeo periódico de estado cada 10 segundos.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-800 bg-neutral-950/80 flex items-center justify-between text-xs text-neutral-400">
          <span>Sistema: Absolutely No Baby Inventory Core v1.0.0</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white font-semibold rounded-lg transition"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
