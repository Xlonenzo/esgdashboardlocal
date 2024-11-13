import React from 'react';
import BondTypesChart from '../dashboard/BondTypesChart';
import BondsTotalValue from '../dashboard/BondsTotalValue';
import ProjectBudgetDetail from '../dashboard/ProjectBudgetDetail';
import IndicatorCountChart from '../dashboard/IndicatorCountChart';

function PortfolioFinanceiro({ sidebarColor, buttonColor }) {
  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">Portfólio Financeiro</h2>
        
        {/* Cards de Valores Totais */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <BondsTotalValue />
          <ProjectBudgetDetail />
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-xl font-bold mb-4">Distribuição de Tipos de Títulos</h3>
            <BondTypesChart />
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-xl font-bold mb-4">Indicadores por Tipo</h3>
            <IndicatorCountChart />
          </div>
        </div>
      </div>

      {/* Área para Informações Adicionais */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-bold mb-4">Resumo do Portfólio</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="text-lg font-semibold text-blue-800">Títulos Ativos</h4>
            <p className="text-2xl font-bold text-blue-600">Em breve</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="text-lg font-semibold text-green-800">Projetos Ativos</h4>
            <p className="text-2xl font-bold text-green-600">Em breve</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h4 className="text-lg font-semibold text-purple-800">Performance</h4>
            <p className="text-2xl font-bold text-purple-600">Em breve</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PortfolioFinanceiro; 