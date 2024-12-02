import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEdit, FaTrash, FaFilter, FaExclamationCircle } from 'react-icons/fa';
import { API_URL } from '../config';

// Definição dos campos obrigatórios
const REQUIRED_FIELDS = {
    cnpj: 'CNPJ',
    name: 'Nome da Empresa',
    razao_social: 'Razão Social'
};

// Componente para label com indicador de obrigatório
const RequiredFieldLabel = ({ htmlFor, children }) => (
    <div className="flex items-center gap-1">
        <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700">
            {children}
        </label>
        <div 
            className="text-red-500 opacity-40 hover:opacity-60 transition-opacity" 
            title="Campo obrigatório"
        >
            <FaExclamationCircle size={12} />
        </div>
    </div>
);

// Função para formatar CNPJ durante digitação
const formatCNPJ = (value) => {
    // Remove tudo que não é número
    const numericValue = value.replace(/\D/g, '');
    
    // Aplica a máscara XX.XXX.XXX/XXXX-XX
    return numericValue
        .replace(/^(\d{2})(\d)/, '$1.$2')
        .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
        .replace(/\.(\d{3})(\d)/, '.$1/$2')
        .replace(/(\d{4})(\d)/, '$1-$2')
        .substring(0, 18); // Limita ao tamanho máximo do CNPJ formatado
};

// Função para formatar CEP durante digitação
const formatCEP = (value) => {
    // Remove tudo que não é número
    const numericValue = value.replace(/\D/g, '');
    
    // Aplica a máscara XXXXX-XXX
    return numericValue
        .replace(/^(\d{5})(\d)/, '$1-$2')
        .substring(0, 9); // Limita ao tamanho máximo do CEP formatado
};

// Função para formatar telefone
const formatPhone = (value) => {
    // Remove tudo que não é número
    const numericValue = value.replace(/\D/g, '');
    
    // Verifica se é celular (9 dígitos) ou fixo (8 dígitos)
    if (numericValue.length <= 10) {
        // Formato: (XX) XXXX-XXXX
        return numericValue
            .replace(/^(\d{2})(\d)/, '($1) $2')
            .replace(/(\d{4})(\d)/, '$1-$2')
            .substring(0, 14);
    } else {
        // Formato: (XX) XXXXX-XXXX
        return numericValue
            .replace(/^(\d{2})(\d)/, '($1) $2')
            .replace(/(\d{5})(\d)/, '$1-$2')
            .substring(0, 15);
    }
};

// Função para remover formatação
const removeFormat = (value) => {
    return value ? value.replace(/\D/g, '') : '';
};

const removePhoneFormat = (value) => {
    return value ? value.replace(/\D/g, '') : '';
};

function CompanyManagement({ buttonColor }) {
  const [companies, setCompanies] = useState([]);
  const [isAddingCompany, setIsAddingCompany] = useState(false);
  const [newCompany, setNewCompany] = useState({
    cnpj: '',
    name: '',
    razao_social: '',
    endereco: '',
    trade_name: '',
    registration_date: '',
    size: '',
    sector: '',
    city: '',
    state: '',
    zip_code: '',
    phone: '',
    email: '',
    website: '',
    is_active: true
  });
  const [editingCompany, setEditingCompany] = useState(null);
  const [filters, setFilters] = useState({
    cnpj: '',
    name: '',
    trade_name: '',
    city: '',
    state: '',
    is_active: ''
  });

  // Definição de opções para selects
  const sizeOptions = ['Micro', 'Pequena', 'Média', 'Grande'];
  const sectorOptions = [
    'Agronegócio',
    'Alimentos e Bebidas',
    'Automobilístico',
    'Bancário e Financeiro',
    'Comércio Varejista',
    'Construção Civil',
    'Consultoria',
    'Educação',
    'Energia',
    'Farmacêutico',
    'Hotelaria e Turismo',
    'Imobiliário',
    'Indústria',
    'Infraestrutura',
    'Logística e Transportes',
    'Metalurgia e Siderurgia',
    'Mineração',
    'Papel e Celulose',
    'Petróleo e Gás',
    'Química e Petroquímica',
    'Saúde',
    'Seguros',
    'Serviços',
    'Tecnologia da Informação',
    'Telecomunicações',
    'Têxtil e Confecção',
    'Varejo',
    'Outros'
  ];

  // Adicionar estados para mensagens de erro
  const [errors, setErrors] = useState({
    email: '',
    website: '',
    validation: []
  });

  // Função para validar email
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  // Função para validar website
  const validateWebsite = (website) => {
    const re = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
    return re.test(website);
  };

  // Função para validar campos obrigatórios
  const validateRequiredFields = (company) => {
    const validationErrors = [];
    Object.entries(REQUIRED_FIELDS).forEach(([field, label]) => {
        if (!company[field]) {
            validationErrors.push(`${label} é obrigatório`);
        }
    });
    return validationErrors;
  };

  // Handler para email com validação
  const handleEmailChange = (e) => {
    const email = e.target.value;
    if (email && !validateEmail(email)) {
        setErrors(prev => ({
            ...prev,
            email: 'Email inválido'
        }));
    } else {
        setErrors(prev => ({
            ...prev,
            email: ''
        }));
    }
    handleInputChange('email', email);
  };

  // Handler para website com validação
  const handleWebsiteChange = (e) => {
    const website = e.target.value;
    if (website && !validateWebsite(website)) {
        setErrors(prev => ({
            ...prev,
            website: 'Website inválido'
        }));
    } else {
        setErrors(prev => ({
            ...prev,
            website: ''
        }));
    }
    handleInputChange('website', website);
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const response = await axios.get(`${API_URL}/companies`);
      setCompanies(response.data);
    } catch (error) {
      console.error('Erro ao buscar empresas:', error);
    }
  };

  // Função genérica para lidar com mudanças nos inputs
  const handleInputChange = (field, value) => {
    if (editingCompany) {
        setEditingCompany(prev => ({
            ...prev,
            [field]: value
        }));
    } else {
        setNewCompany(prev => ({
            ...prev,
            [field]: value
        }));
    }
  };

  // Handler específico para CNPJ
  const handleCNPJChange = (e) => {
    const formattedValue = formatCNPJ(e.target.value);
    const numericValue = removeFormat(formattedValue);
    
    if (editingCompany) {
        setEditingCompany(prev => ({
            ...prev,
            cnpj: numericValue,
            cnpj_formatted: formattedValue
        }));
    } else {
        setNewCompany(prev => ({
            ...prev,
            cnpj: numericValue,
            cnpj_formatted: formattedValue
        }));
    }
  };

  // Handler específico para CEP
  const handleCEPChange = (e) => {
    const formattedValue = formatCEP(e.target.value);
    const numericValue = removeFormat(formattedValue);
    
    if (editingCompany) {
        setEditingCompany(prev => ({
            ...prev,
            zip_code: numericValue,
            zip_code_formatted: formattedValue
        }));
    } else {
        setNewCompany(prev => ({
            ...prev,
            zip_code: numericValue,
            zip_code_formatted: formattedValue
        }));
    }
  };

  // Handler específico para telefone
  const handlePhoneChange = (e) => {
    const formattedValue = formatPhone(e.target.value);
    const numericValue = removePhoneFormat(formattedValue);
    
    if (editingCompany) {
        setEditingCompany(prev => ({
            ...prev,
            phone: numericValue,
            phone_formatted: formattedValue
        }));
    } else {
        setNewCompany(prev => ({
            ...prev,
            phone: numericValue,
            phone_formatted: formattedValue
        }));
    }
  };

  // Handler para adicionar empresa com validação
  const handleAddCompany = async () => {
    const validationErrors = validateRequiredFields(newCompany);
    if (validationErrors.length > 0) {
        setErrors(prev => ({
            ...prev,
            validation: validationErrors
        }));
        return;
    }

    try {
        // Remove formatação antes de enviar
        const companyData = {
            ...newCompany,
            cnpj: removeFormat(newCompany.cnpj),
            zip_code: removeFormat(newCompany.zip_code),
            phone: removePhoneFormat(newCompany.phone)
        };

        const response = await axios.post(`${API_URL}/companies`, companyData);
        
        if (response.status === 201) {
            setCompanies([...companies, response.data]);
            setIsAddingCompany(false);
            setNewCompany({
                cnpj: '',
                name: '',
                razao_social: '',
                // ... outros campos zerados
            });
        }
    } catch (error) {
        console.error('Erro ao adicionar empresa:', error);
    }
  };

  // Handler para atualizar empresa com validação
  const handleUpdateCompany = async () => {
    const validationErrors = validateRequiredFields(editingCompany);
    if (validationErrors.length > 0) {
        setErrors(prev => ({
            ...prev,
            validation: validationErrors
        }));
        return;
    }

    try {
        // Remove formatação antes de enviar
        const companyData = {
            ...editingCompany,
            cnpj: removeFormat(editingCompany.cnpj),
            zip_code: removeFormat(editingCompany.zip_code),
            phone: removePhoneFormat(editingCompany.phone)
        };

        const response = await axios.put(
            `${API_URL}/companies/${editingCompany.id}`,
            companyData
        );
        
        if (response.status === 200) {
            setCompanies(
                companies.map((company) =>
                    company.id === editingCompany.id ? response.data : company
                )
            );
            setEditingCompany(null);
        }
    } catch (error) {
        console.error('Erro ao atualizar empresa:', error);
    }
  };

  const handleDeleteCompany = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta empresa?')) {
      try {
        await axios.delete(`${API_URL}/companies/${id}`);
        setCompanies(companies.filter((company) => company.id !== id));
      } catch (error) {
        console.error('Erro ao deletar empresa:', error);
        alert(error.response?.data?.detail || 'Erro ao deletar empresa');
      }
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const renderColumnFilter = (columnName, placeholder) => (
    <div className="flex items-center">
      <input
        type="text"
        name={columnName}
        value={filters[columnName]}
        onChange={handleFilterChange}
        className="w-full p-1 text-sm border rounded"
        placeholder={`Filtrar ${placeholder}`}
      />
      <FaFilter className="ml-1 text-gray-500" />
    </div>
  );

  const filteredCompanies = companies.filter(company => {
    return Object.keys(filters).every(key => {
      if (!filters[key]) return true;
      if (key === 'is_active') {
        const filterValue = filters[key].toLowerCase();
        const isActive = company[key] ? 'sim' : 'não';
        return isActive.includes(filterValue);
      }
      return company[key]?.toString().toLowerCase().includes(filters[key].toLowerCase());
    });
  });

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Gerenciamento de Empresas</h2>

      <div className="flex flex-row-reverse justify-between items-center mb-4">
        <button 
          onClick={() => setIsAddingCompany(!isAddingCompany)}
          className="text-white px-4 py-2 rounded hover:opacity-90 transition-all"
          style={{ backgroundColor: buttonColor }}
        >
          {isAddingCompany ? 'Cancelar' : 'Adicionar Nova Empresa'}
        </button>
      </div>

      {(isAddingCompany || editingCompany) && (
        <div className="mt-4 p-6 bg-gray-50 rounded-xl shadow-sm">
          <h3 className="text-lg font-bold mb-4">
            {editingCompany ? 'Editar Empresa' : 'Adicionar Nova Empresa'}
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <RequiredFieldLabel htmlFor="cnpj">CNPJ</RequiredFieldLabel>
              <input
                id="cnpj"
                type="text"
                value={editingCompany ? editingCompany.cnpj : newCompany.cnpj}
                onChange={handleCNPJChange}
                maxLength={18}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                placeholder="00.000.000/0000-00"
              />
            </div>
            <div>
              <RequiredFieldLabel htmlFor="name">Nome da Empresa</RequiredFieldLabel>
              <input
                id="name"
                type="text"
                value={editingCompany ? editingCompany.name : newCompany.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              />
            </div>
            <div>
              <RequiredFieldLabel htmlFor="razao_social">Razão Social</RequiredFieldLabel>
              <input
                id="razao_social"
                type="text"
                value={editingCompany ? editingCompany.razao_social : newCompany.razao_social}
                onChange={(e) => handleInputChange('razao_social', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              />
            </div>
            <div>
              <label htmlFor="trade_name" className="block text-sm font-medium text-gray-700">
                Nome Fantasia
              </label>
              <input
                id="trade_name"
                type="text"
                value={editingCompany ? editingCompany.trade_name : newCompany.trade_name}
                onChange={(e) => handleInputChange('trade_name', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              />
            </div>
            <div>
              <label htmlFor="endereco" className="block text-sm font-medium text-gray-700">
                Endereço
              </label>
              <input
                id="endereco"
                type="text"
                value={editingCompany ? editingCompany.endereco : newCompany.endereco}
                onChange={(e) => handleInputChange('endereco', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              />
            </div>
            <div>
              <label htmlFor="registration_date" className="block text-sm font-medium text-gray-700">
                Data de Registro
              </label>
              <input
                id="registration_date"
                type="date"
                value={editingCompany ? editingCompany.registration_date : newCompany.registration_date}
                onChange={(e) => handleInputChange('registration_date', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              />
            </div>
            <div>
              <label htmlFor="size" className="block text-sm font-medium text-gray-700">
                Tamanho
              </label>
              <select
                id="size"
                value={editingCompany ? editingCompany.size : newCompany.size}
                onChange={(e) => handleInputChange('size', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              >
                <option value="">Selecione o tamanho</option>
                {sizeOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="sector" className="block text-sm font-medium text-gray-700">
                Setor
              </label>
              <select
                id="sector"
                value={editingCompany ? editingCompany.sector : newCompany.sector}
                onChange={(e) => handleInputChange('sector', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              >
                <option value="">Selecione o setor</option>
                {sectorOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                Cidade
              </label>
              <input
                id="city"
                type="text"
                value={editingCompany ? editingCompany.city : newCompany.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              />
            </div>
            <div>
              <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                Estado
              </label>
              <input
                id="state"
                type="text"
                maxLength={2}
                value={editingCompany ? editingCompany.state : newCompany.state}
                onChange={(e) => handleInputChange('state', e.target.value.toUpperCase())}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                placeholder="UF"
              />
            </div>
            <div>
              <label htmlFor="zip_code" className="block text-sm font-medium text-gray-700">
                CEP
              </label>
              <input
                id="zip_code"
                type="text"
                value={editingCompany ? editingCompany.zip_code : newCompany.zip_code}
                onChange={handleCEPChange}
                maxLength={9}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                placeholder="00000-000"
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Telefone
              </label>
              <input
                id="phone"
                type="text"
                value={editingCompany ? 
                    (editingCompany.phone_formatted || formatPhone(editingCompany.phone)) : 
                    (newCompany.phone_formatted || formatPhone(newCompany.phone))
                }
                onChange={handlePhoneChange}
                maxLength={15}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                placeholder="(00) 00000-0000"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={editingCompany ? editingCompany.email : newCompany.email}
                onChange={handleEmailChange}
                className={`mt-1 block w-full rounded-md shadow-sm ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.email && (
                  <p className="mt-1 text-sm text-red-500">{errors.email}</p>
              )}
            </div>
            <div>
              <label htmlFor="website" className="block text-sm font-medium text-gray-700">
                Website
              </label>
              <input
                id="website"
                type="url"
                value={editingCompany ? editingCompany.website : newCompany.website}
                onChange={handleWebsiteChange}
                className={`mt-1 block w-full rounded-md shadow-sm ${
                    errors.website ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.website && (
                  <p className="mt-1 text-sm text-red-500">{errors.website}</p>
              )}
            </div>
            <div>
              <label htmlFor="is_active" className="flex items-center gap-2">
                <input
                  id="is_active"
                  type="checkbox"
                  checked={editingCompany ? editingCompany.is_active : newCompany.is_active}
                  onChange={(e) => handleInputChange('is_active', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
                <span className="text-sm font-medium text-gray-700">Ativo</span>
              </label>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-500 mt-6 mb-4">
            <FaExclamationCircle size={12} className="text-red-500 opacity-40" />
            <span>Campos obrigatórios</span>
          </div>

          <div className="flex justify-end gap-2">
            <button
              onClick={editingCompany ? handleUpdateCompany : handleAddCompany}
              className="px-4 py-2 text-white rounded"
              style={{ backgroundColor: buttonColor }}
            >
              {editingCompany ? 'Atualizar' : 'Adicionar'}
            </button>
            <button
              onClick={() => {
                setIsAddingCompany(false);
                setEditingCompany(null);
              }}
              className="px-4 py-2 bg-red-500 text-white rounded"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border rounded-lg">
          <thead>
            <tr>
              <th className="px-4 py-2 border">{renderColumnFilter('cnpj', 'CNPJ')}</th>
              <th className="px-4 py-2 border">{renderColumnFilter('name', 'Nome')}</th>
              <th className="px-4 py-2 border">{renderColumnFilter('trade_name', 'Nome Fantasia')}</th>
              <th className="px-4 py-2 border">{renderColumnFilter('city', 'Cidade')}</th>
              <th className="px-4 py-2 border">{renderColumnFilter('state', 'Estado')}</th>
              <th className="px-4 py-2 border">{renderColumnFilter('is_active', 'Ativo')}</th>
              <th className="px-4 py-2 border">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredCompanies.map((company) => (
              <tr key={company.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 border">{company.cnpj}</td>
                <td className="px-4 py-2 border">{company.name}</td>
                <td className="px-4 py-2 border">{company.trade_name}</td>
                <td className="px-4 py-2 border">{company.city}</td>
                <td className="px-4 py-2 border">{company.state}</td>
                <td className="px-4 py-2 border">{company.is_active ? 'Sim' : 'Não'}</td>
                <td className="px-4 py-2 border">
                  <div className="flex space-x-2 justify-center">
                    <button
                      onClick={() => setEditingCompany(company)}
                      style={{ color: buttonColor }}
                      className="hover:opacity-80 transition-colors"
                      title="Editar"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDeleteCompany(company.id)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                      title="Excluir"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Exibição de erros de validação */}
      {errors.validation.length > 0 && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
              <strong className="font-bold">Por favor, corrija os seguintes erros:</strong>
              <ul className="list-disc list-inside">
                  {errors.validation.map((error, index) => (
                      <li key={index}>{error}</li>
                  ))}
              </ul>
          </div>
      )}
    </div>
  );
}

export default CompanyManagement;
