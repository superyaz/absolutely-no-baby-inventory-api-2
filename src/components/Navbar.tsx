import React, { useState } from 'react';
import {
  Camera,
  Printer,
  Store as StoreIcon,
  Shield,
  Layers,
  ChevronDown,
  Wifi,
  WifiOff,
  BookOpen,
  Menu,
  X,
  Plus
} from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { Store, User, UserRole } from '../types/inventory';

interface NavbarProps {
  currentStore: Store;
  allStores: Store[];
  onSelectStore: (store: Store) => void;
  currentUser: User;
  allUsers: User[];
  onSelectUser: (user: User) => void;
  onOpenScanner: () => void;
  onOpenLabelPrinter: () => void;
  onOpenNewProduct: () => void;
  onOpenArchitectureDocs: () => void;
  activeView: string;
  onSelectView: (view: string) => void;
  pendingTransfersCount: number;
  lowStockAlertsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentStore,
  allStores,
  onSelectStore,
  currentUser,
  allUsers,
  onSelectUser,
  onOpenScanner,
  onOpenLabelPrinter,
  onOpenNewProduct,
  onOpenArchitectureDocs,
  activeView,
  onSelectView,
  pendingTransfersCount,
  lowStockAlertsCount
}) => {
  const [storeMenuOpen, setStoreMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isOnline] = useState(true);

  const roleLabels: Record<UserRole, { label: string; color: string }> = {
    admin_general: { label: 'Admin General', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
    admin_tienda: { label: 'Admin Tienda', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
    empleado_operativo: { label: 'Operativo / POS', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'inventory', label: 'Inventario & Tallas' },
    { id: 'movements', label: 'Entradas & Salidas' },
    {
      id: 'transfers',
      label: 'Transferencias',
      badge: pendingTransfersCount > 0 ? pendingTransfersCount : undefined
    },
    { id: 'counts', label: 'Conteo Físico' },
    {
      id: 'alerts',
      label: 'Alertas Stock',
      badge: lowStockAlertsCount > 0 ? lowStockAlertsCount : undefined,
      badgeColor: 'bg-red-600'
    }
  ];

  return (
    <header className="sticky top-0 z-40 bg-neutral-950/95 backdrop-blur-md border-b border-neutral-800 text-neutral-100 no-print select-none">
      {/* Top utility row */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/* Brand Logo & Slogan */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => onSelectView('dashboard')}
            className="flex items-center gap-2 group text-left"
          >
            <BrandLogo size="md" showText={true} />
          </button>

          {/* Quick Network Status */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-[11px] text-neutral-400">
            {isOnline ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <Wifi className="w-3 h-3 text-emerald-400" />
                <span>Sync Aburrá En Vivo</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3 h-3 text-amber-500" />
                <span>Modo Offline PWA</span>
              </>
            )}
          </div>
        </div>

        {/* Global Action Tools */}
        <div className="flex items-center gap-2">
          {/* Scanner Button */}
          <button
            onClick={onOpenScanner}
            className="flex items-center gap-1.5 px-3 py-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-100 border border-neutral-700 rounded-xl text-xs font-bold transition shadow-sm active:scale-95"
            title="Abrir lector de código de barras con cámara o pistola USB"
          >
            <Camera className="w-4 h-4 text-red-500" />
            <span className="hidden sm:inline">Lector Barcode</span>
          </button>

          {/* Label Printer Button */}
          <button
            onClick={onOpenLabelPrinter}
            className="flex items-center gap-1.5 px-3 py-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-100 border border-neutral-700 rounded-xl text-xs font-bold transition shadow-sm active:scale-95"
            title="Impresión de etiquetas térmicas y hojas adhesivas"
          >
            <Printer className="w-4 h-4 text-neutral-300" />
            <span className="hidden sm:inline">Etiquetas</span>
          </button>

          {/* New Product (Admin only) */}
          {currentUser.role === 'admin_general' && (
            <button
              onClick={onOpenNewProduct}
              className="flex items-center gap-1.5 px-3 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-red-600/20 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden md:inline">Nueva Prenda (7D)</span>
            </button>
          )}

          {/* Store Switcher */}
          <div className="relative">
            <button
              onClick={() => {
                setStoreMenuOpen(!storeMenuOpen);
                setUserMenuOpen(false);
              }}
              className="flex items-center gap-2 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-xl text-xs font-semibold transition"
            >
              <StoreIcon className="w-3.5 h-3.5 text-neutral-400" />
              <div className="text-left hidden md:block">
                <span className="block text-[10px] text-neutral-500 uppercase leading-none">Punto de Venta</span>
                <span className="block text-xs font-bold text-white leading-tight truncate max-w-[120px]">
                  {currentStore.name}
                </span>
              </div>
              <ChevronDown className="w-3 h-3 text-neutral-400" />
            </button>

            {storeMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in">
                <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-neutral-500 border-b border-neutral-800">
                  Puntos de Venta (Valle de Aburrá)
                </div>
                {allStores.map((store) => (
                  <button
                    key={store.id}
                    onClick={() => {
                      onSelectStore(store);
                      setStoreMenuOpen(false);
                    }}
                    className={`w-full px-3 py-2.5 text-left text-xs flex items-center justify-between hover:bg-neutral-800 transition ${
                      currentStore.id === store.id ? 'bg-red-950/40 text-red-400 font-bold' : 'text-neutral-200'
                    }`}
                  >
                    <div>
                      <div className="font-semibold">{store.name}</div>
                      <div className="text-[10px] text-neutral-500">{store.municipality}</div>
                    </div>
                    {store.isWarehouse && (
                      <span className="text-[9px] bg-neutral-800 text-neutral-400 px-1.5 py-0.5 rounded border border-neutral-700">
                        CEDI
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* User & Role Switcher */}
          <div className="relative">
            <button
              onClick={() => {
                setUserMenuOpen(!userMenuOpen);
                setStoreMenuOpen(false);
              }}
              className="flex items-center gap-2 p-1.5 md:px-2.5 md:py-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-xl text-xs transition"
            >
              <div className="w-7 h-7 rounded-lg bg-red-600/20 border border-red-500/30 flex items-center justify-center font-bold text-red-500 text-xs">
                {currentUser.name.charAt(0)}
              </div>
              <div className="text-left hidden lg:block">
                <div className="text-xs font-bold text-white truncate max-w-[110px] leading-tight">
                  {currentUser.name}
                </div>
                <div className="text-[10px] text-neutral-400">
                  {roleLabels[currentUser.role]?.label}
                </div>
              </div>
              <ChevronDown className="w-3 h-3 text-neutral-400" />
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in">
                <div className="px-3 py-2 border-b border-neutral-800">
                  <div className="text-xs font-bold text-white">{currentUser.name}</div>
                  <div className="text-[11px] text-neutral-400">{currentUser.email}</div>
                  <span
                    className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded border ${
                      roleLabels[currentUser.role]?.color
                    }`}
                  >
                    {roleLabels[currentUser.role]?.label}
                  </span>
                </div>

                <div className="px-3 pt-2 pb-1 text-[10px] uppercase font-bold text-neutral-500">
                  Cambiar Perfil (Demostración RBAC)
                </div>

                {allUsers.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => {
                      onSelectUser(user);
                      setUserMenuOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-neutral-800 transition ${
                      currentUser.id === user.id ? 'bg-red-950/40 text-red-400 font-bold' : 'text-neutral-200'
                    }`}
                  >
                    <div>
                      <div className="font-semibold">{user.name}</div>
                      <div className="text-[10px] text-neutral-500">
                        {roleLabels[user.role]?.label} · {user.storeName || 'Global'}
                      </div>
                    </div>
                  </button>
                ))}

                <div className="pt-2 mt-1 border-t border-neutral-800 px-2">
                  <button
                    onClick={() => {
                      onOpenArchitectureDocs();
                      setUserMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-neutral-300 hover:text-white hover:bg-neutral-800 rounded-xl transition"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-neutral-400" />
                    Arquitectura, CI/CD & Nube
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Architecture Docs Button */}
          <button
            onClick={onOpenArchitectureDocs}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 rounded-xl text-xs font-semibold transition"
            title="Ver documentación técnica de arquitectura, CI/CD y nube"
          >
            <Shield className="w-3.5 h-3.5 text-red-500" />
            <span className="hidden xl:inline">Arquitectura & CI/CD</span>
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 md:hidden text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Main navigation row (Tabs) */}
      <div className="border-t border-neutral-800/80 bg-neutral-950/50">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 flex items-center overflow-x-auto scrollbar-none">
          <nav className="flex space-x-1 py-1.5">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onSelectView(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                  activeView === item.id
                    ? 'bg-neutral-800 text-white shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/60'
                }`}
              >
                {item.label}
                {item.badge !== undefined && (
                  <span
                    className={`ml-1 text-[10px] font-mono font-bold text-white px-1.5 py-0.2 rounded-full ${
                      item.badgeColor || 'bg-amber-600'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-neutral-800 bg-neutral-950 p-4 space-y-3">
          <div className="space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onSelectView(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold ${
                  activeView === item.id ? 'bg-red-600 text-white' : 'text-neutral-300 hover:bg-neutral-900'
                }`}
              >
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-black/40 text-white">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="pt-3 border-t border-neutral-800 space-y-2">
            <button
              onClick={() => {
                onOpenArchitectureDocs();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 bg-neutral-900 rounded-xl text-xs font-semibold text-neutral-300"
            >
              <Shield className="w-4 h-4 text-red-500" />
              Documentación Arquitectura & CI/CD
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
