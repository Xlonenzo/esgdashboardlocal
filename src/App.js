import React, { useState } from 'react';
import {
  Home,
  Settings,
  BarChart2,
  Leaf,
  Users,
  Briefcase,
  ChevronDown,
  ChevronRight,
  Menu,
  Book,
  ClipboardList,
  Database,
} from 'lucide-react';

// Importar dados de arquivos separados
import articlesData from './data/articles';
import actionPlansData from './data/actionPlans';
import dataSourcesData from './data/dataSources';
import kpisData from './data/kpis'; // Importar os dados dos KPIs
import yearsData from './data/years';
import menuItemsData from './data/menuItems';

// Importar componentes
import HomeContent from './components/HomeContent';
import AdminContent from './components/AdminContent';
import KPIManagement from './components/KPIManagement';
import InfoLibrary from './components/InfoLibrary';
import ActionPlanManagement from './components/ActionPlanManagement';
import DataSourceManagement from './components/DataSourceManagement';
import GovernancaAnalytics from './components/GovernancaAnalytics';
import AnalyticsContent from './components/AnalyticsContent';
import KPIChart from './components/KPIChart';
import FornecedoresAvaliados from './components/FornecedoresAvaliados';
import UserManagement from './components/admin/UserManagement';
import LoginPage from './components/LoginPage';  // Novo Componente
import ComparacaoKPI from './components/ComparacaoKPI';  // Importar o componente de Comparação de KPI
import Customization from './components/Customization'; // Importar o componente de Personalização
import Sidebar from './components/Sidebar'; // Importe o componente Sidebar
import Topbar from './components/Topbar'; // Importe o componente Topbar

// Importar estilos (se estiver usando Tailwind CSS ou outro CSS)
import './index.css';

function App() {
  const [activeMenuItem, setActiveMenuItem] = useState('/');
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isLoggedIn, setIsLoggedIn] = useState(true);  // Estado para login
  const [sidebarColor, setSidebarColor] = useState('#727E7A'); // Define a cor padrão do sidebar como #727E7A
  const [logo, setLogo] = useState('/logo.png'); // Define o logo padrão

  // Inicializar estado com dados importados
  const [articles, setArticles] = useState(articlesData);
  const [actionPlans, setActionPlans] = useState(actionPlansData);
  const [dataSources, setDataSources] = useState(dataSourcesData);
  const [kpis, setKpis] = useState(kpisData); // Inicializar estado dos KPIs
  const years = yearsData;
  const menuItems = menuItemsData;

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleLogin = () => {
    setIsLoggedIn(true);  // Atualiza o estado quando o login for bem-sucedido
  };

  const handleLogout = () => {
    setIsLoggedIn(false); // Desconecta o usuário
  };

  const renderContent = () => {
    switch (activeMenuItem) {
      case '/':
        return <HomeContent kpis={kpis} selectedYear={selectedYear} />;
      case '/admin':
        return <AdminContent />;
      case '/admin/customization':  // Nova rota para Personalização
        return <Customization setSidebarColor={setSidebarColor} setLogo={setLogo} />; // Passa a função para mudar a cor e a logo
      case '/info-library':
        return <InfoLibrary articles={articles} setArticles={setArticles} />;
      case '/admin/data-source':
        return (
          <DataSourceManagement
            dataSources={dataSources}
            setDataSources={setDataSources}
          />
        );
      case '/admin/user-management': // Nova rota
        return <UserManagement />;
      case '/analytics/environment':
        return (
          <AnalyticsContent
            category="environment"
            kpis={kpis}
            selectedYear={selectedYear}
          />
        );
      case '/analytics/governance':
        return <GovernancaAnalytics selectedYear={selectedYear} />;
      case '/analytics/social':
        return (
          <AnalyticsContent
            category="social"
            kpis={kpis}
            selectedYear={selectedYear}
          />
        );
      case '/analytics/comparacao-kpi': // Nova rota para Comparação de KPI
        return <ComparacaoKPI />;
      case '/kpi-management':
        return <KPIManagement kpis={kpis} setKpis={setKpis} />; // Passar props
      case '/action-plan':
        return (
          <ActionPlanManagement
            actionPlans={actionPlans}
            setActionPlans={setActionPlans}
            kpis={kpis}
            setKpis={setKpis}
          />
        );
      default:
        return <div>Selecione uma opção do menu</div>;
    }
  };

  // Verifica se o usuário está logado
  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Topbar */}
      <div className="flex flex-col w-full">
        <Topbar onLogout={handleLogout} sidebarColor={sidebarColor} />

        <div className="flex h-full">
          <Sidebar
            sidebarColor={sidebarColor} // Passa a cor do sidebar
            menuItems={menuItems}
            activeMenuItem={activeMenuItem}
            setActiveMenuItem={setActiveMenuItem}
            isAnalyticsOpen={isAnalyticsOpen}
            setIsAnalyticsOpen={setIsAnalyticsOpen}
            isAdminOpen={isAdminOpen}
            setIsAdminOpen={setIsAdminOpen}
            isSidebarCollapsed={isSidebarCollapsed}
            toggleSidebar={toggleSidebar}
            logo={logo} // Passa o logo dinamicamente
          />
          <main className="flex-1 overflow-y-auto p-8">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">Dashboard ESG</h1>
              <div className="flex items-center">
                <label
                  htmlFor="year-select"
                  className="mr-2 text-sm font-medium text-gray-700"
                >
                  Ano:
                </label>
                <select
                  id="year-select"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {renderContent()}
          </main>
        </div>
      </div>
    </div>
  );
}

export default App;
