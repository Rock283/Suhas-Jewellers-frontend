import { useLocation, useNavigate } from 'react-router-dom';
import { LayoutGrid, Users, BarChart3 } from 'lucide-react';

const tabs = [
  { label: 'Dashboard', icon: LayoutGrid, path: '/dashboard' },
  { label: 'Customers', icon: Users, path: '/customers' },
  { label: 'Reports', icon: BarChart3, path: '/reports' },
];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const active = location.pathname === tab.path || (tab.path === '/customers' && location.pathname.startsWith('/customer'));
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`flex flex-col items-center gap-0.5 px-4 py-1.5 transition-colors ${active ? 'text-primary' : 'text-muted-foreground'}`}
            >
              <tab.icon className="w-5 h-5" />
              <span className="text-[10px] font-body font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
