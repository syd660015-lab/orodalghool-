
import React from 'react';
import { AppTab } from '../types';
import { Search, GraduationCap, PenTool, Info, Sparkles, Library } from 'lucide-react';

interface LayoutProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ activeTab, setActiveTab, children }) => {
  const navItems = [
    { id: AppTab.ANALYZER, label: 'المحلل', icon: Search },
    { id: AppTab.LEARN, label: 'الأكاديمية', icon: GraduationCap },
    { id: AppTab.METERS, label: 'البحور', icon: Library },
    { id: AppTab.TOOLS, label: 'الأدوات', icon: PenTool },
    { id: AppTab.ABOUT, label: 'حول', icon: Info },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Header */}
      <header className="bg-emerald-900 text-white p-4 shadow-lg sticky top-0 z-50">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-white p-1.5 rounded-lg">
              <Sparkles className="text-emerald-900 w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold poetry-font">عروضي</h1>
          </div>
          <span className="hidden sm:inline-block text-xs bg-emerald-800 px-3 py-1 rounded-full border border-emerald-700">
            الذكاء الاصطناعي في خدمة الشعر العربي
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-4xl w-full mx-auto p-4 pb-24">
        {children}
        
        <footer className="mt-12 mb-8 text-center border-t border-slate-200 pt-8">
          <p className="text-slate-400 text-sm font-medium">
            تصميم وبرمجة: دكتور. أحمد حمدي عاشور الغول
          </p>
          <p className="text-slate-300 text-[10px] mt-1 font-bold uppercase tracking-widest">
            © {new Date().getFullYear()} عروضي AI
          </p>
        </footer>
      </main>

      {/* Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] px-4 py-2 z-50">
        <div className="max-w-md mx-auto flex justify-around items-center">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
                activeTab === item.id 
                  ? 'text-emerald-700 bg-emerald-50 scale-105' 
                  : 'text-slate-500 hover:text-emerald-600'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] font-bold">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default Layout;
