import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { API_URL } from '../../config';

function IndicatorCountChart() {
  const [indicators, setIndicators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchIndicatorCounts = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/indicator-counts`);
      const sortedData = response.data.sort((a, b) => b.count - a.count);
      setIndicators(sortedData);
    } catch (error) {
      console.error('Erro ao buscar contagem de indicadores:', error);
      setError('Falha ao carregar os dados dos indicadores');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIndicatorCounts();
  }, [fetchIndicatorCounts]);

  if (loading) return <div>Carregando dados dos indicadores...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="h-[400px] w-full">
      <ResponsiveContainer>
        <BarChart
          data={indicators}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          layout="vertical"
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis 
            dataKey="type" 
            type="category" 
            width={150}
          />
          <Tooltip 
            formatter={(value) => [`${value} indicadores`, 'Quantidade']}
          />
          <Bar 
            dataKey="count" 
            fill="#0088FE"
            label={{ 
              position: 'right',
              formatter: (value) => `${value}`,
              fill: '#666'
            }}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default IndicatorCountChart; 