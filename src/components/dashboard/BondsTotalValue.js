import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../config';

function BondsTotalValue() {
  const [totalValue, setTotalValue] = useState(0);
  const [bondsCount, setBondsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${API_URL}/bonds-total-value`);
        console.log('Resposta da API:', response.data);
        
        setTotalValue(response.data.total_value);
        setBondsCount(response.data.bonds_count);
      } catch (error) {
        console.error('Erro ao buscar valor total dos títulos:', error);
        setError('Falha ao carregar o valor total');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatCurrency = (value) => {
    const val = parseFloat(value);
    if (val >= 1000000000) {
      return `R$ ${(val / 1000000000).toFixed(2)}B`;
    }
    if (val >= 1000000) {
      return `R$ ${(val / 1000000).toFixed(2)}M`;
    }
    return `R$ ${(val / 1000).toFixed(2)}K`;
  };

  if (loading) return <div>Carregando...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="text-center">
        <h4 className="text-lg font-semibold text-gray-600">Valor Total em Títulos</h4>
        <p className="text-3xl font-bold text-green-600 mt-2">
          {formatCurrency(totalValue)}
        </p>
        <p className="text-sm text-gray-500 mt-1">
          Valor exato: R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
        <p className="text-sm text-gray-500 mt-1">
          Total de {bondsCount} títulos
        </p>
      </div>
    </div>
  );
}

export default BondsTotalValue; 