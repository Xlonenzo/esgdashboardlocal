import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Plus, Search, Edit2, Trash2, Filter as FaFilter, AlertCircle } from 'lucide-react';
import { API_URL } from '../config';
import constants from '../data/constants.json';

function EnvironmentalDocuments({ sidebarColor, buttonColor }) {
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [documentsPerPage] = useState(10);
  const [filters, setFilters] = useState({
    document_type: '',
    document_status: '',
    thematic_area: ''
  });

  const [newDocument, setNewDocument] = useState({
    title: '',
    description: '',
    document_type: '',
    document_subtype: '',
    thematic_area: '',
    document_status: '',
    validity_period: '',
    language: '',
    document_format: '',
    creation_date: new Date().toISOString().split('T')[0],
    last_modification_date: new Date().toISOString().split('T')[0],
    latitude: '',
    longitude: '',
    accessibility: '',
    executive_summary: '',
    notes: '',
    signature_authentication: '',
    legal_notice: ''
  });

  // Buscar documentos
  const fetchDocuments = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_URL}/environmental-documents`);
      setDocuments(response.data);
      setError(null);
    } catch (err) {
      console.error('Erro ao buscar documentos:', err);
      setError('Falha ao carregar os documentos. Por favor, tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  // Handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewDocument(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar campos obrigatórios
    const requiredFields = [
      'title', 'document_type', 'document_subtype', 'thematic_area',
      'document_status', 'validity_period', 'language', 'document_format',
      'creation_date', 'last_modification_date', 'latitude', 'longitude',
      'accessibility', 'description', 'executive_summary', 'notes',
      'signature_authentication', 'legal_notice'
    ];

    const missingFields = requiredFields.filter(field => !newDocument[field]);
    
    if (missingFields.length > 0) {
      alert(`Por favor, preencha todos os campos obrigatórios: ${missingFields.join(', ')}`);
      return;
    }

    try {
      if (editingDocument) {
        await axios.put(`${API_URL}/environmental-documents/${editingDocument.id}`, newDocument);
        alert('Documento atualizado com sucesso!');
      } else {
        await axios.post(`${API_URL}/environmental-documents`, newDocument);
        alert('Novo documento adicionado com sucesso!');
      }
      fetchDocuments();
      setIsFormOpen(false);
      setEditingDocument(null);
      setNewDocument({
        title: '',
        description: '',
        document_type: '',
        document_subtype: '',
        thematic_area: '',
        document_status: '',
        validity_period: '',
        language: '',
        document_format: '',
        creation_date: new Date().toISOString().split('T')[0],
        last_modification_date: new Date().toISOString().split('T')[0],
        latitude: '',
        longitude: '',
        accessibility: '',
        executive_summary: '',
        notes: '',
        signature_authentication: '',
        legal_notice: ''
      });
    } catch (error) {
      console.error('Erro ao salvar documento:', error);
      alert('Erro ao salvar documento. Por favor, tente novamente.');
    }
  };

  const handleEdit = (document) => {
    setEditingDocument(document);
    setNewDocument({
      ...document,
      creation_date: document.creation_date.split('T')[0],
      last_modification_date: document.last_modification_date?.split('T')[0] || ''
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este documento?')) {
      try {
        await axios.delete(`${API_URL}/environmental-documents/${id}`);
        fetchDocuments();
        alert('Documento excluído com sucesso!');
      } catch (error) {
        console.error('Erro ao excluir documento:', error);
        alert('Erro ao excluir documento. Por favor, tente novamente.');
      }
    }
  };

  // Atualizar a lógica de filtragem usando useMemo
  const filteredDocuments = useMemo(() => {
    if (!documents) return [];
    
    return documents.filter(doc => {
      const matchesSearch = !searchTerm || (
        doc.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );

      const matchesDocumentType = !filters.document_type || 
        doc.document_type === filters.document_type;

      const matchesDocumentStatus = !filters.document_status || 
        doc.document_status === filters.document_status;

      const matchesThematicArea = !filters.thematic_area || 
        doc.thematic_area === filters.thematic_area;

      return matchesSearch && matchesDocumentType && 
             matchesDocumentStatus && matchesThematicArea;
    });
  }, [documents, searchTerm, filters]);

  // Atualizar a lógica de paginação
  const indexOfLastDocument = currentPage * documentsPerPage;
  const indexOfFirstDocument = indexOfLastDocument - documentsPerPage;
  const currentDocuments = filteredDocuments.slice(indexOfFirstDocument, indexOfLastDocument);

  // Adicionar handler para mudança de página se não existir
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Handler para mudança de filtro
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setCurrentPage(1); // Reset da página ao filtrar
  };

  // Estilo comum para campos de texto truncado
  const truncatedInputClass = "w-full p-2 border rounded overflow-hidden text-ellipsis whitespace-nowrap";

  // Atualizar o estilo para textareas
  const textareaClass = "w-full p-2 border rounded h-32 resize-none"; // h-32 equivale a 8rem, bom para 6 linhas

  if (isLoading) return <div className="flex justify-center items-center h-full">Carregando...</div>;
  if (error) return <div className="text-red-500 text-center">{error}</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-6">Documentos Ambientais</h2>

      {/* Ajustado para flex-row-reverse para alinhar o botão à direita */}
      <div className="flex flex-row-reverse justify-between items-center mb-6">
        <button
          onClick={() => {
            setIsFormOpen(true);
            setEditingDocument(null);
            setNewDocument({
              title: '',
              description: '',
              document_type: '',
              document_subtype: '',
              thematic_area: '',
              document_status: '',
              validity_period: '',
              language: '',
              document_format: '',
              creation_date: new Date().toISOString().split('T')[0],
              last_modification_date: new Date().toISOString().split('T')[0],
              latitude: '',
              longitude: '',
              accessibility: '',
              executive_summary: '',
              notes: '',
              signature_authentication: '',
              legal_notice: ''
            });
          }}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 inline-flex items-center h-10"
          style={{ backgroundColor: buttonColor }}
        >
          <Plus size={16} className="mr-2" />
          <span className="leading-none">Novo Documento</span>
        </button>

        <div className="relative">
          <input
            type="text"
            placeholder="Pesquisar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border rounded"
          />
          <Search size={20} className="absolute left-3 top-2.5 text-gray-400" />
        </div>
      </div>

      {/* Formulário */}
      {isFormOpen && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <h3 className="text-lg font-bold mb-2">
            {editingDocument ? 'Editar Documento' : 'Adicionar Novo Documento'}
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            {/* Título */}
            <div>
              <label className="block mb-2 flex items-center">
                Título
                <AlertCircle className="ml-1 text-red-500 opacity-60" size={12} />
              </label>
              <input
                type="text"
                name="title"
                value={newDocument.title}
                onChange={handleInputChange}
                required
                maxLength="512"
                className={truncatedInputClass}
                title={newDocument.title}
              />
            </div>

            {/* Tipo de Documento */}
            <div>
              <label className="block mb-2 flex items-center">
                Tipo de Documento
                <AlertCircle className="ml-1 text-red-500 opacity-60" size={12} />
              </label>
              <select
                name="document_type"
                value={newDocument.document_type}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
              >
                <option value="">Selecione...</option>
                {constants.documentTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Subtipo de Documento */}
            <div>
              <label className="block mb-2 flex items-center">
                Subtipo de Documento
                <AlertCircle className="ml-1 text-red-500 opacity-60" size={12} />
              </label>
              <select
                name="document_subtype"
                value={newDocument.document_subtype}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
              >
                <option value="">Selecione...</option>
                {constants.documentSubtypes.map(subtype => (
                  <option key={subtype} value={subtype}>{subtype}</option>
                ))}
              </select>
            </div>

            {/* Área Temática */}
            <div>
              <label className="block mb-2 flex items-center">
                Área Temática
                <AlertCircle className="ml-1 text-red-500 opacity-60" size={12} />
              </label>
              <select
                name="thematic_area"
                value={newDocument.thematic_area}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
              >
                <option value="">Selecione...</option>
                {constants.thematicAreas.map(area => (
                  <option key={area} value={area}>{area}</option>
                ))}
              </select>
            </div>

            {/* Status do Documento */}
            <div>
              <label className="block mb-2 flex items-center">
                Status do Documento
                <AlertCircle className="ml-1 text-red-500 opacity-60" size={12} />
              </label>
              <select
                name="document_status"
                value={newDocument.document_status}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
              >
                <option value="">Selecione...</option>
                {constants.documentStatuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>

            {/* Período de Validade */}
            <div>
              <label className="block mb-2 flex items-center">
                Período de Validade
                <AlertCircle className="ml-1 text-red-500 opacity-60" size={12} />
              </label>
              <input
                type="text"
                name="validity_period"
                value={newDocument.validity_period}
                onChange={handleInputChange}
                required
                maxLength="512"
                className={truncatedInputClass}
                title={newDocument.validity_period}
              />
            </div>

            {/* Idioma */}
            <div>
              <label className="block mb-2 flex items-center">
                Idioma
                <AlertCircle className="ml-1 text-red-500 opacity-60" size={12} />
              </label>
              <select
                name="language"
                value={newDocument.language}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
              >
                <option value="">Selecione...</option>
                {constants.languages.map(lang => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
            </div>

            {/* Formato do Documento */}
            <div>
              <label className="block mb-2 flex items-center">
                Formato do Documento
                <AlertCircle className="ml-1 text-red-500 opacity-60" size={12} />
              </label>
              <select
                name="document_format"
                value={newDocument.document_format}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
              >
                <option value="">Selecione...</option>
                {constants.documentFormats.map(format => (
                  <option key={format} value={format}>{format}</option>
                ))}
              </select>
            </div>

            {/* Data de Criação */}
            <div>
              <label className="block mb-2 flex items-center">
                Data de Criação
                <AlertCircle className="ml-1 text-red-500 opacity-60" size={12} />
              </label>
              <input
                type="date"
                name="creation_date"
                value={newDocument.creation_date}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>

            {/* Data da Última Modificação */}
            <div>
              <label className="block mb-2 flex items-center">
                Data da Última Modificação
                <AlertCircle className="ml-1 text-red-500 opacity-60" size={12} />
              </label>
              <input
                type="date"
                name="last_modification_date"
                value={newDocument.last_modification_date}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>

            {/* Latitude */}
            <div>
              <label className="block mb-2 flex items-center">
                Latitude
                <AlertCircle className="ml-1 text-red-500 opacity-60" size={12} />
              </label>
              <input
                type="number"
                step="0.000001"
                name="latitude"
                value={newDocument.latitude}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                placeholder="Ex: -23.550520"
                required
              />
            </div>

            {/* Longitude */}
            <div>
              <label className="block mb-2 flex items-center">
                Longitude
                <AlertCircle className="ml-1 text-red-500 opacity-60" size={12} />
              </label>
              <input
                type="number"
                step="0.000001"
                name="longitude"
                value={newDocument.longitude}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                placeholder="Ex: -46.633308"
                required
              />
            </div>

            {/* Acessibilidade */}
            <div>
              <label className="block mb-2 flex items-center">
                Acessibilidade
                <AlertCircle className="ml-1 text-red-500 opacity-60" size={12} />
              </label>
              <select
                name="accessibility"
                value={newDocument.accessibility}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
              >
                <option value="">Selecione...</option>
                {constants.accessibilityLevels.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>

            {/* Descrição */}
            <div className="col-span-2">
              <label className="block mb-2 flex items-center">
                Descrição
                <AlertCircle className="ml-1 text-red-500 opacity-60" size={12} />
              </label>
              <textarea
                name="description"
                value={newDocument.description}
                onChange={handleInputChange}
                maxLength="512"
                className={textareaClass}
                rows="6"
                placeholder="Descreva o documento..."
                required
              />
              <span className="text-xs text-gray-500">
                {newDocument.description.length}/512 caracteres
              </span>
            </div>

            {/* Resumo Executivo */}
            <div className="col-span-2">
              <label className="block mb-2 flex items-center">
                Resumo Executivo
                <AlertCircle className="ml-1 text-red-500 opacity-60" size={12} />
              </label>
              <textarea
                name="executive_summary"
                value={newDocument.executive_summary}
                onChange={handleInputChange}
                maxLength="512"
                className={textareaClass}
                rows="6"
                placeholder="Digite o resumo executivo..."
                required
              />
              <span className="text-xs text-gray-500">
                {newDocument.executive_summary.length}/512 caracteres
              </span>
            </div>

            {/* Notas */}
            <div className="col-span-2">
              <label className="block mb-2 flex items-center">
                Notas
                <AlertCircle className="ml-1 text-red-500 opacity-60" size={12} />
              </label>
              <textarea
                name="notes"
                value={newDocument.notes}
                onChange={handleInputChange}
                maxLength="512"
                className={textareaClass}
                rows="6"
                placeholder="Adicione notas relevantes..."
                required
              />
              <span className="text-xs text-gray-500">
                {newDocument.notes.length}/512 caracteres
              </span>
            </div>

            {/* Autenticação de Assinatura */}
            <div>
              <label className="block mb-2 flex items-center">
                Autenticação de Assinatura
                <AlertCircle className="ml-1 text-red-500 opacity-60" size={12} />
              </label>
              <select
                name="signature_authentication"
                value={newDocument.signature_authentication}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
              >
                <option value="">Selecione...</option>
                {constants.signatureAuthentication.map(auth => (
                  <option key={auth} value={auth}>{auth}</option>
                ))}
              </select>
            </div>

            {/* Aviso Legal */}
            <div className="col-span-2">
              <label className="block mb-2 flex items-center">
                Aviso Legal
                <AlertCircle className="ml-1 text-red-500 opacity-60" size={12} />
              </label>
              <textarea
                name="legal_notice"
                value={newDocument.legal_notice}
                onChange={handleInputChange}
                maxLength="512"
                className={textareaClass}
                rows="6"
                placeholder="Digite o aviso legal..."
                required
              />
              <span className="text-xs text-gray-500">
                {newDocument.legal_notice.length}/512 caracteres
              </span>
            </div>

            {/* Botões de ação */}
            <div className="col-span-2 mt-4 space-x-2">
              <button
                type="submit"
                className="text-white px-4 py-2 rounded hover:opacity-80"
                style={{ backgroundColor: buttonColor || '#4F46E5' }}
              >
                {editingDocument ? 'Atualizar' : 'Adicionar'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsFormOpen(false);
                  setEditingDocument(null);
                  setNewDocument({
                    title: '',
                    description: '',
                    document_type: '',
                    document_subtype: '',
                    thematic_area: '',
                    document_status: '',
                    validity_period: '',
                    language: '',
                    document_format: '',
                    creation_date: new Date().toISOString().split('T')[0],
                    last_modification_date: new Date().toISOString().split('T')[0],
                    latitude: '',
                    longitude: '',
                    accessibility: '',
                    executive_summary: '',
                    notes: '',
                    signature_authentication: '',
                    legal_notice: ''
                  });
                }}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tabela */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border">
          <thead>
            <tr>
              <th className="px-4 py-2 border">Título</th>
              <th className="px-4 py-2 border">
                <select
                  name="document_type"
                  value={filters.document_type}
                  onChange={handleFilterChange}
                  className="w-full p-1 text-sm border rounded"
                >
                  <option value="">Todos os tipos</option>
                  {constants.documentTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </th>
              <th className="px-4 py-2 border">
                <select
                  name="document_status"
                  value={filters.document_status}
                  onChange={handleFilterChange}
                  className="w-full p-1 text-sm border rounded"
                >
                  <option value="">Todos os status</option>
                  {constants.documentStatuses.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </th>
              <th className="px-4 py-2 border">Data de Criação</th>
              <th className="px-4 py-2 border">Ações</th>
            </tr>
          </thead>
          <tbody>
            {currentDocuments.map(doc => (
              <tr key={doc.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 border">{doc.title}</td>
                <td className="px-4 py-2 border">{doc.document_type}</td>
                <td className="px-4 py-2 border">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${doc.document_status === 'Ativo' ? 'bg-green-100 text-green-800' : 
                    doc.document_status === 'Em Revisão' ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-gray-100 text-gray-800'}`}>
                    {doc.document_status}
                  </span>
                </td>
                <td className="px-4 py-2 border">
                  {new Date(doc.creation_date).toLocaleDateString()}
                </td>
                <td className="px-4 py-2 border">
                  <button
                    onClick={() => handleEdit(doc)}
                    className="text-blue-500 hover:text-blue-700 mr-2"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(doc.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginação ajustada */}
      {!isFormOpen && filteredDocuments.length > 0 && (
        <div className="flex justify-center mt-4">
          {Array.from({ 
            length: Math.ceil(filteredDocuments.length / documentsPerPage)
          }, (_, i) => (
            <button
              key={i}
              onClick={() => handlePageChange(i + 1)}
              className={`mx-1 px-3 py-1 rounded ${
                currentPage === i + 1 
                  ? 'text-white'
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
              style={{
                backgroundColor: currentPage === i + 1 ? buttonColor || '#4F46E5' : undefined
              }}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default EnvironmentalDocuments; 