import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { API_URL } from '../../config';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

function BondTypesChart() {
  const [bondTypes, setBondTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBondTypes = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/bond-types-summary`);
      setBondTypes(response.data.map((item, index) => ({
        ...item,
        color: COLORS[index % COLORS.length],
        name: item.type
      })));
    } catch (error) {
      console.error('Erro ao buscar tipos de bonds:', error);
      setError('Falha ao carregar os dados dos bonds');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBondTypes();
  }, [fetchBondTypes]);

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, value, name }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
      >
        {`${value} (${(percent * 100).toFixed(1)}%)`}
      </text>
    );
  };

  if (loading) return <div>Carregando dados dos bonds...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="h-[400px] w-full">
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={bondTypes}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={150}
            innerRadius={80}
            dataKey="count"
            nameKey="name"
          >
            {bondTypes.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value, name, props) => [
              `${name}`,
              `Quantidade: ${value}`,
              `Valor Total: R$ ${props.payload.total_value.toLocaleString('pt-BR')}`,
              `Percentual: ${props.payload.percentage.toFixed(2)}%`
            ]}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export default BondTypesChart; 