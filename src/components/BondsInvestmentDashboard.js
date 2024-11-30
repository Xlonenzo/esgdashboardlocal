import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

function BondsInvestmentDashboard() {
  const [bondsData, setBondsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBondsData();
  }, []);

  const fetchBondsData = async () => {
    try {
      const response = await axios.get(`${API_URL}/bonds-companies`, {
        withCredentials: true
      });
      setBondsData(response.data);
      setLoading(false);
    } catch (error) {
      setError('Erro ao carregar dados');
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

  const calculateTotalValue = () => {
    return bondsData.reduce((total, bond) => total + bond.bond_value, 0);
  };

  const calculateAverageInterestRate = () => {
    const average = bondsData.reduce((total, bond) => total + bond.interest_rate, 0) / bondsData.length;
    return formatPercentage(average);
  };

  // Preparar dados para o gráfico de taxas
  const prepareInterestRateData = () => {
    return bondsData.map(bond => ({
      name: bond.bond_name,
      taxa: bond.interest_rate,
      emissor: bond.issuer_company_name
    })).sort((a, b) => b.taxa - a.taxa); // Ordenar por taxa decrescente
  };

  if (loading) return <div className="p-4">Carregando...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="p-6 space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-2">Valor Total em Títulos</h3>
          <p className="text-3xl font-bold text-green-600">
            {formatCurrency(calculateTotalValue())}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-2">Total de Títulos</h3>
          <p className="text-3xl font-bold text-blue-600">
            {bondsData.length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-2">Taxa Média</h3>
          <p className="text-3xl font-bold text-purple-600">
            {calculateAverageInterestRate()}
          </p>
        </div>
      </div>

      {/* Gráfico de Taxas */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Taxas de Juros por Título</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={prepareInterestRateData()}
            margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name" 
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis 
              tickFormatter={(value) => `${(value * 100).toFixed(1)}%`}
              label={{ value: 'Taxa de Juros (%)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip 
              formatter={(value) => [`${(value * 100).toFixed(2)}%`, 'Taxa de Juros']}
              labelFormatter={(label) => `Título: ${label}`}
            />
            <Legend />
            <Bar 
              dataKey="taxa" 
              fill="#8884d8" 
              name="Taxa de Juros"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Tabela de Títulos */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <h3 className="text-lg font-semibold p-6 border-b">Títulos por Taxa de Juros</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nome
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Taxa
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Emissor
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {bondsData
                .sort((a, b) => b.interest_rate - a.interest_rate) // Ordenar por taxa decrescente
                .map((bond) => (
                  <tr key={bond.bond_id}>
                    <td className="px-6 py-4 whitespace-nowrap">{bond.bond_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-purple-600">
                      {formatPercentage(bond.interest_rate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {formatCurrency(bond.bond_value)}
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

export default BondsInvestmentDashboard; 