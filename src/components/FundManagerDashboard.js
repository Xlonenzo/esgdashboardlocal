import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import {
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  Legend, 
  ResponsiveContainer
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

function FundManagerDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get(`${API_URL}/fund-manager/dashboard`, {
        withCredentials: true
      });
      console.log('Dados recebidos:', response.data); // Debug
      setDashboardData(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao buscar dados:', error); // Debug
      setError('Erro ao carregar dados do dashboard');
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatPercentage = (value) => {
    return `${(value * 100).toFixed(2)}%`;
  };

  // Preparar dados para os gráficos
  const prepareSectorData = () => {
    if (!dashboardData?.distributions?.by_sector) return [];
    return Object.entries(dashboardData.distributions.by_sector)
      .map(([name, value]) => ({
        name: name || 'Não especificado',
        value: parseFloat(value) || 0
      }))
      .filter(item => item.value > 0);
  };

  const prepareTypeData = () => {
    if (!dashboardData?.distributions?.by_type) return [];
    return Object.entries(dashboardData.distributions.by_type)
      .map(([name, value]) => ({
        name: name || 'Não especificado',
        value: parseFloat(value) || 0
      }))
      .filter(item => item.value > 0);
  };

  if (loading) return <div className="p-4">Carregando...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;
  if (!dashboardData) return null;

  const sectorData = prepareSectorData();
  const typeData = prepareTypeData();

  console.log('Dados dos gráficos:', { sectorData, typeData }); // Debug

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold mb-6">Dashboard do Gestor de Fundos</h2>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-2">Valor Total do Portfólio</h3>
          <p className="text-3xl font-bold text-green-600">
            {formatCurrency(dashboardData.summary.total_portfolio_value)}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-2">Total de Títulos</h3>
          <p className="text-3xl font-bold text-blue-600">
            {dashboardData.summary.total_bonds}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-2">Taxa Média de Juros</h3>
          <p className="text-3xl font-bold text-purple-600">
            {formatPercentage(dashboardData.summary.average_interest_rate)}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-2">Score ESG Médio</h3>
          <p className="text-3xl font-bold text-orange-600">
            {formatPercentage(dashboardData.summary.average_esg_score)}
          </p>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Distribuição por Setor */}
        {sectorData.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Distribuição por Setor</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={sectorData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {sectorData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Distribuição por Tipo */}
        {typeData.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Distribuição por Tipo de Título</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={typeData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {typeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Tabela de Títulos */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <h3 className="text-lg font-semibold p-6 border-b">Títulos em Carteira</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nome
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Taxa
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Score ESG
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Emissor
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {dashboardData.bonds.map((bond) => (
                <tr key={bond.bond_id}>
                  <td className="px-6 py-4 whitespace-nowrap">{bond.bond_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{bond.bond_type}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {formatCurrency(bond.bond_value)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {formatPercentage(bond.interest_rate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {formatPercentage(bond.esg_percentage)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {bond.issuer_company_name}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default FundManagerDashboard; 