import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API_URL } from '../../config';

function ProjectBudgetDetail() {
  const [totalBudget, setTotalBudget] = useState(0);
  const [projectCount, setProjectCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/project-budget-detail`);
      const total = response.data.reduce(
        (acc, curr) => acc + parseFloat(curr.total_budget_allocated), 
        0
      );
      
      setTotalBudget(total);
      setProjectCount(response.data.length);
    } catch (error) {
      console.error('Erro ao buscar detalhes de orçamento:', error);
      setError('Falha ao carregar os dados de orçamento');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) return <div>Carregando dados de orçamento...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  // Função para formatar valores em milhões/bilhões
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

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="text-center">
        <h4 className="text-lg font-semibold text-gray-600">Orçamento Total Alocado</h4>
        <p className="text-3xl font-bold text-blue-600 mt-2">
          {formatCurrency(totalBudget)}
        </p>
        <p className="text-sm text-gray-500 mt-1">
          Valor exato: R$ {totalBudget.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
        <p className="text-sm text-gray-500 mt-1">
          Total de {projectCount} projetos
        </p>
      </div>
    </div>
  );
}

export default ProjectBudgetDetail; 