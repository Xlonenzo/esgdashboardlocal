import React from 'react';
import DistribuicaoRacialChart from '../dashboard/DistribuicaoRacialChart';

function PortfolioSocial({ sidebarColor, buttonColor }) {
  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">Portfólio Social</h2>
        
        {/* Cards de Métricas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Total de Beneficiários</h3>
            <div className="text-3xl font-bold text-blue-600">
              Em desenvolvimento
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Investimento Social Total</h3>
            <div className="text-3xl font-bold text-green-600">
              Em desenvolvimento
            </div>
          </div>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-xl font-bold mb-4">Distribuição de Diversidade Racial</h3>
            <DistribuicaoRacialChart />
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-xl font-bold mb-4">Impacto por Área</h3>
            <div className="h-64 flex items-center justify-center bg-gray-50">
              Gráfico em desenvolvimento
            </div>
          </div>
        </div>
      </div>

      {/* Área para Informações Adicionais */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-bold mb-4">Resumo de Impacto Social</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="text-lg font-semibold text-blue-800">Projetos Ativos</h4>
            <p className="text-2xl font-bold text-blue-600">Em breve</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="text-lg font-semibold text-green-800">Comunidades Impactadas</h4>
            <p className="text-2xl font-bold text-green-600">Em breve</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h4 className="text-lg font-semibold text-purple-800">Score de Impacto</h4>
            <p className="text-2xl font-bold text-purple-600">Em breve</p>
          </div>
        </div>
      </div>

      {/* Tabela de Projetos */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Projetos Sociais Ativos</h3>
          <button
            className="px-4 py-2 text-white rounded-lg transition-opacity hover:opacity-90"
            style={{ backgroundColor: buttonColor }}
          >
            Novo Projeto
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Projeto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Área de Impacto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Beneficiários
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Investimento
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-center" colSpan="5">
                  Nenhum projeto cadastrado
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Indicadores de Performance */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-bold mb-4">Indicadores de Performance Social</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg bg-gray-50">
            <h4 className="text-sm font-semibold text-gray-600">Satisfação dos Beneficiários</h4>
            <p className="text-2xl font-bold" style={{ color: sidebarColor }}>Em breve</p>
          </div>
          <div className="p-4 rounded-lg bg-gray-50">
            <h4 className="text-sm font-semibold text-gray-600">Efetividade dos Programas</h4>
            <p className="text-2xl font-bold" style={{ color: sidebarColor }}>Em breve</p>
          </div>
          <div className="p-4 rounded-lg bg-gray-50">
            <h4 className="text-sm font-semibold text-gray-600">Alcance Geográfico</h4>
            <p className="text-2xl font-bold" style={{ color: sidebarColor }}>Em breve</p>
          </div>
          <div className="p-4 rounded-lg bg-gray-50">
            <h4 className="text-sm font-semibold text-gray-600">Retorno Social</h4>
            <p className="text-2xl font-bold" style={{ color: sidebarColor }}>Em breve</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PortfolioSocial; 