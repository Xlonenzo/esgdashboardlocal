import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import BondTypesChart from './dashboard/BondTypesChart';
import IndicatorCountChart from './dashboard/IndicatorCountChart';
import ProjectBudgetDetail from './dashboard/ProjectBudgetDetail';
import { FaStar } from 'react-icons/fa';

function HomeContent() {
  const [favoriteKpis, setFavoriteKpis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchKPIs();
  }, []);

  const fetchKPIs = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/kpi-entries-with-templates?limit=1000`);
      const favorites = response.data.filter(kpi => kpi.isfavorite);
      setFavoriteKpis(favorites);
    } catch (error) {
      console.error('Erro ao buscar KPIs:', error);
      setError('Falha ao carregar os KPIs. Por favor, tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  const renderFavoriteKPIs = () => {
    return (
      <div className="mt-8">
        <h3 className="text-xl font-bold mb-4">KPIs Favoritos</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {favoriteKpis.map(kpi => (
            <div key={kpi.entry_id} className="bg-white p-4 rounded shadow">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-bold">{kpi.template_name}</h4>
                <FaStar className="text-yellow-400" />
              </div>
              <p>Atual: {kpi.actual_value.toFixed(2)}</p>
              <p>Meta: {kpi.target_value.toFixed(2)}</p>
              <p>Estado: {kpi.state || 'N/A'}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return <div>Carregando KPIs...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div>
      <header className="flex items-center justify-between p-4 bg-gray-100">
        <h2 className="text-xl font-bold">Dashboard de KPIs</h2>
        <div className="flex flex-col items-end">
          <span className="text-sm text-gray-600">Em conformidade com o CSRD</span>
          <span className="text-sm text-gray-600">Powered by Snowflake</span>
        </div>
      </header>

      {renderFavoriteKPIs()}

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-xl font-bold mb-4">Quantidade de Indicadores por Tipo</h3>
          <IndicatorCountChart />
        </div>
        <div>
          <h3 className="text-xl font-bold mb-4">Distribuição de Tipos de Bonds</h3>
          <BondTypesChart />
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-bold mb-4">Orçamento Total em Projetos</h3>
        <ProjectBudgetDetail />
      </div>
    </div>
  );
}

export default HomeContent;
