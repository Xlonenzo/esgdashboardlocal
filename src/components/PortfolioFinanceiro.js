import React from 'react';
import FundManagerDashboard from './FundManagerDashboard';

function PortfolioFinanceiro({ sidebarColor, buttonColor }) {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Portfólio Financeiro</h2>
      <FundManagerDashboard />
    </div>
  );
}

export default PortfolioFinanceiro; 