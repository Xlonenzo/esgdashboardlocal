import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEdit, FaTrash, FaPlus, FaSearch } from 'react-icons/fa';
import { API_URL } from '../config';
import constants from '../data/constants.json';

// Função para formatar valor em moeda
const formatCurrencyInput = (value) => {
  try {
    // Remove tudo exceto números
    let numericValue = value.toString().replace(/\D/g, '');
    
    // Se não houver valor, retorna zero formatado
    if (!numericValue) return 'R$ 0,00';
    
    // Garante que o valor tenha pelo menos 3 dígitos (incluindo centavos)
    numericValue = numericValue.padStart(3, '0');
    
    // Separa os centavos
    const decimal = numericValue.slice(-2);
    // Pega a parte inteira mantendo todos os dígitos
    const integer = numericValue.slice(0, -2);
    
    // Formata com separadores de milhar
    const formattedInteger = integer.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    
    return `R$ ${formattedInteger || '0'},${decimal}`;
  } catch (error) {
    console.error('Erro na formatação:', error);
    return 'R$ 0,00';
  }
};

// Função para extrair valor numérico
const parseCurrencyValue = (formattedValue) => {
  try {
    const cleanValue = formattedValue
      .replace(/[R$\s.]/g, '')
      .replace(',', '.');
    return parseFloat(cleanValue) || 0;
  } catch (error) {
    console.error('Erro no parsing:', error);
    return 0;
  }
};

function EmissionTracking({ sidebarColor, buttonColor }) {
  const [emissions, setEmissions] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEmission, setEditingEmission] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [emissionsPerPage] = useState(12);
  const [projects, setProjects] = useState([]);

  const [newEmission, setNewEmission] = useState({
    project_id: '',
    scope: '',
    emission_type: '',
    value: 0,
    unit: '',
    source: '',
    calculation_method: '',
    uncertainty_level: null,
    timestamp: new Date().toISOString().slice(0, 16),
    calculated_emission: false,
    reporting_standard: ''
  });

  const [availableEmissionTypes, setAvailableEmissionTypes] = useState([]);

  useEffect(() => {
    fetchEmissions();
    fetchCompanies();
    fetchProjects();
  }, []);

  const fetchEmissions = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/emissions`);
      
      // Validar e formatar os dados recebidos
      const formattedEmissions = response.data.map(emission => ({
        ...emission,
        timestamp: emission.timestamp ? new Date(emission.timestamp).toISOString() : null,
        value: Number(emission.value),
        uncertainty_level: emission.uncertainty_level ? Number(emission.uncertainty_level) : null
      }));
      
      setEmissions(formattedEmissions);
      
    } catch (error) {
      console.error('Erro ao buscar emissões:', error);
      
      // Mostrar mensagem mais detalhada do erro
      const errorMessage = error.response?.data?.detail || error.message;
      alert(`Erro ao carregar emissões: ${errorMessage}`);
      
      // Em caso de erro, definir lista vazia
      setEmissions([]);
      
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      const response = await axios.get(`${API_URL}/companies`);
      setCompanies(response.data);
    } catch (error) {
      console.error('Erro ao buscar empresas:', error);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await axios.get(`${API_URL}/project-tracking`);
      setProjects(response.data);
    } catch (error) {
      console.error('Erro ao buscar projetos:', error);
    }
  };

  const resetForm = () => {
    setNewEmission({
      project_id: '',
      scope: '',
      emission_type: '',
      value: 0,
      unit: '',
      source: '',
      calculation_method: '',
      uncertainty_level: null,
      timestamp: new Date().toISOString().slice(0, 16),
      calculated_emission: false,
      reporting_standard: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Validações alinhadas com as constraints do banco
      if (!newEmission.project_id) throw new Error('Projeto é obrigatório');
      if (!newEmission.scope) throw new Error('Escopo é obrigatório');
      if (!newEmission.emission_type) throw new Error('Tipo de emissão é obrigatório e deve ter no máximo 20 caracteres');
      if (isNaN(newEmission.value) || newEmission.value < 0) 
        throw new Error('Valor deve ser maior ou igual a zero');
      if (!newEmission.unit) throw new Error('Unidade é obrigatória');
      if (!newEmission.source) throw new Error('Fonte é obrigatória');
      if (!newEmission.calculation_method) throw new Error('Método de cálculo é obrigatório');
      if (newEmission.uncertainty_level !== null && 
          (newEmission.uncertainty_level < 0 || newEmission.uncertainty_level > 100)) 
        throw new Error('Nível de incerteza deve estar entre 0 e 100%');
      if (!newEmission.timestamp) 
        throw new Error('Data e hora são obrigatórias');
      if (!newEmission.reporting_standard) throw new Error('Padrão de relatório é obrigatório');

      const formattedData = {
        project_id: parseInt(newEmission.project_id),
        scope: String(newEmission.scope).trim(),
        emission_type: String(newEmission.emission_type).trim(),
        value: parseFloat(newEmission.value),
        unit: String(newEmission.unit).trim(),
        source: String(newEmission.source).trim(),
        calculation_method: String(newEmission.calculation_method).trim(),
        uncertainty_level: newEmission.uncertainty_level === '' ? null : parseFloat(newEmission.uncertainty_level),
        timestamp: new Date(newEmission.timestamp).toISOString().slice(0, 19).replace('Z', ''),
        calculated_emission: Boolean(newEmission.calculated_emission),
        reporting_standard: String(newEmission.reporting_standard).trim()
      };

      // Envio para API
      if (editingEmission) {
        await axios.put(`${API_URL}/emissions/${editingEmission.id}`, formattedData);
      } else {
        await axios.post(`${API_URL}/emissions`, formattedData);
      }

      fetchEmissions();
      resetForm();
      setIsFormOpen(false);
      setEditingEmission(null);
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (emission) => {
    setEditingEmission(emission);
    setNewEmission(emission);
    setIsFormOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este registro?')) {
      try {
        await axios.delete(`${API_URL}/emissions/${id}`);
        alert('Registro excluído com sucesso!');
        fetchEmissions();
      } catch (error) {
        console.error('Erro ao excluir registro:', error);
        alert('Erro ao excluir registro. Por favor, tente novamente.');
      }
    }
  };

  // Paginação
  const indexOfLastEmission = currentPage * emissionsPerPage;
  const indexOfFirstEmission = indexOfLastEmission - emissionsPerPage;
  const currentEmissions = emissions.slice(indexOfFirstEmission, indexOfLastEmission);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Filtragem e Busca
  const filteredEmissions = emissions.filter(emission => {
    const project = projects.find(p => p.id === emission.project_id);
    return (
      project?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emission.emission_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emission.scope.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Handler específico para campos de moeda
  const handleCurrencyInput = (e) => {
    const rawValue = e.target.value.replace(/\D/g, '');
    const formattedValue = formatCurrencyInput(rawValue);
    const numericValue = parseCurrencyValue(formattedValue);
    
    setNewEmission(prev => ({
      ...prev,
      value: numericValue,
      value_formatted: formattedValue
    }));
  };

  // Handler para quando o campo perde o foco
  const handleCurrencyBlur = () => {
    const formattedValue = formatCurrencyInput(String(newEmission.value));
    setNewEmission(prev => ({
      ...prev,
      value_formatted: formattedValue
    }));
  };

  const handleScopeChange = (e) => {
    const selectedScope = e.target.value;
    setNewEmission(prev => ({
      ...prev,
      scope: selectedScope,
      emission_type: ''
    }));
    
    if (selectedScope) {
      setAvailableEmissionTypes(constants.emissionTypes[selectedScope] || []);
    } else {
      setAvailableEmissionTypes([]);
    }
  };

  const renderForm = () => (
    <div className="bg-white p-6 rounded-lg shadow mb-6">
      <h3 className="text-lg font-bold mb-4">
        {editingEmission ? 'Editar Registro de Emissão' : 'Novo Registro de Emissão'}
      </h3>
      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
        {/* Projeto */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Projeto
          </label>
          <select
            name="project_id"
            value={newEmission.project_id}
            onChange={handleInputChange}
            className="p-2 border rounded w-full"
            required
          >
            <option value="">Selecione o Projeto</option>
            {projects.map(project => (
              <option key={project.id} value={project.id}>{project.name}</option>
            ))}
          </select>
        </div>

        {/* Escopo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Escopo
          </label>
          <select
            name="scope"
            value={newEmission.scope}
            onChange={handleScopeChange}
            className="p-2 border rounded w-full"
            required
          >
            <option value="">Selecione o Escopo</option>
            {constants.emissionScopes.map(scope => (
              <option key={scope} value={scope}>{scope}</option>
            ))}
          </select>
        </div>

        {/* Tipo de Emissão */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipo de Emissão
          </label>
          <select
            name="emission_type"
            value={newEmission.emission_type}
            onChange={handleInputChange}
            className="p-2 border rounded w-full"
            required
            disabled={!newEmission.scope}
          >
            <option value="">Selecione o Tipo</option>
            {availableEmissionTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        {/* Valor */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Valor
          </label>
          <input
            type="text"
            name="value"
            value={newEmission.value_formatted || formatCurrencyInput(String(newEmission.value || 0))}
            onChange={handleCurrencyInput}
            onBlur={handleCurrencyBlur}
            className="p-2 border rounded w-full"
            required
          />
        </div>

        {/* Unidade */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Unidade
          </label>
          <select
            name="unit"
            value={newEmission.unit}
            onChange={handleInputChange}
            className="p-2 border rounded w-full"
            required
          >
            <option value="">Selecione a Unidade</option>
            {constants.emissionUnits.map(unit => (
              <option key={unit} value={unit}>{unit}</option>
            ))}
          </select>
        </div>

        {/* Fonte */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fonte
          </label>
          <select
            name="source"
            value={newEmission.source}
            onChange={handleInputChange}
            className="p-2 border rounded w-full"
            required
          >
            <option value="">Selecione a Fonte</option>
            {constants.emissionSources.map(source => (
              <option key={source} value={source}>{source}</option>
            ))}
          </select>
        </div>

        {/* Método de Cálculo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Método de Cálculo
          </label>
          <select
            name="calculation_method"
            value={newEmission.calculation_method}
            onChange={handleInputChange}
            className="p-2 border rounded w-full"
            required
          >
            <option value="">Selecione o Método</option>
            {constants.calculationMethods.map(method => (
              <option key={method} value={method}>{method}</option>
            ))}
          </select>
        </div>

        {/* Nível de Incerteza */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nível de Incerteza (%)
          </label>
          <input
            type="number"
            name="uncertainty_level"
            value={newEmission.uncertainty_level}
            onChange={handleInputChange}
            className="p-2 border rounded w-full"
            required
            step="0.01"
            min="0"
            max="100"
          />
        </div>

        {/* Data e Hora */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Data e Hora
          </label>
          <input
            type="datetime-local"
            name="timestamp"
            value={newEmission.timestamp ? newEmission.timestamp.slice(0, 16) : ''}
            onChange={handleInputChange}
            className="p-2 border rounded w-full"
            required
          />
        </div>

        {/* Emissão Calculada */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Emissão Calculada
          </label>
          <input
            type="checkbox"
            name="calculated_emission"
            checked={newEmission.calculated_emission}
            onChange={(e) => handleInputChange({
              target: {
                name: 'calculated_emission',
                value: e.target.checked
              }
            })}
            className="p-2 border rounded"
          />
        </div>

        {/* Padrão de Relatório */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Padrão de Relatório
          </label>
          <select
            name="reporting_standard"
            value={newEmission.reporting_standard}
            onChange={handleInputChange}
            className="p-2 border rounded w-full"
            required
          >
            <option value="">Selecione o Padrão</option>
            {constants.reportingStandards.map(standard => (
              <option key={standard} value={standard}>{standard}</option>
            ))}
          </select>
        </div>

        <div className="col-span-2 flex justify-end space-x-2 mt-4">
          <button
            type="submit"
            className="px-4 py-2 text-white rounded hover:opacity-90"
            style={{ backgroundColor: buttonColor }}
            disabled={loading}
          >
            {loading ? 'Salvando...' : editingEmission ? 'Atualizar' : 'Adicionar'}
          </button>
          <button
            type="button"
            onClick={() => {
              setIsFormOpen(false);
              setEditingEmission(null);
              resetForm();
            }}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEmission(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="container mx-auto px-4">
      <div className="flex flex-row-reverse justify-between items-center mb-6">
        <button
          onClick={() => {
            setIsFormOpen(true);
            setEditingEmission(null);
            resetForm();
          }}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 inline-flex items-center h-10"
          style={{ backgroundColor: buttonColor }}
        >
          <FaPlus size={16} className="mr-2" />
          <span className="leading-none">Novo Registro</span>
        </button>

        <h2 className="text-2xl font-bold">Dados de Emissões</h2>
      </div>

      {/* Barra de pesquisa */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Pesquisar emissões..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 border rounded pl-10"
          />
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
        </div>
      </div>

      {isFormOpen && renderForm()}

      {/* Tabela de emissões */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border">
          <thead>
            <tr>
              <th className="px-4 py-2 border">Projeto</th>
              <th className="px-4 py-2 border">Escopo</th>
              <th className="px-4 py-2 border">Tipo</th>
              <th className="px-4 py-2 border">Valor</th>
              <th className="px-4 py-2 border">Unidade</th>
              <th className="px-4 py-2 border">Data de Medição</th>
              <th className="px-4 py-2 border">Ações</th>
            </tr>
          </thead>
          <tbody>
            {currentEmissions.map(emission => (
              <tr key={emission.id}>
                <td className="px-4 py-2 border">
                  {projects.find(p => p.id === emission.project_id)?.name || 'N/A'}
                </td>
                <td className="px-4 py-2 border">{emission.scope}</td>
                <td className="px-4 py-2 border">{emission.emission_type}</td>
                <td className="px-4 py-2 border">
                  {formatCurrencyInput(String(emission.value))}
                </td>
                <td className="px-4 py-2 border">{emission.unit}</td>
                <td className="px-4 py-2 border">
                  {new Date(emission.timestamp).toLocaleDateString('pt-BR')}
                </td>
                <td className="px-4 py-2 border">
                  <button
                    onClick={() => handleEdit(emission)}
                    className="text-blue-500 hover:text-blue-700 mr-2"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(emission.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginação */}
      <div className="flex justify-center mt-4">
        {Array.from({ length: Math.ceil(filteredEmissions.length / emissionsPerPage) }, (_, i) => (
          <button
            key={i}
            onClick={() => paginate(i + 1)}
            className={`mx-1 px-3 py-1 rounded ${
              currentPage === i + 1 ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
}

export default EmissionTracking;