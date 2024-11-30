import { render, screen } from '@testing-library/react';
import App from './App';

describe('App Component', () => {
  test('renderiza o formulário de login', () => {
    render(<App />);
    
    // Verifica se os elementos principais do login existem
    expect(screen.getByPlaceholderText('Senha')).toBeInTheDocument();
    expect(screen.getByText('Entrar')).toBeInTheDocument();
  });

  // Você pode adicionar mais testes aqui
  test('renderiza campos de input corretamente', () => {
    render(<App />);
    
    const passwordInput = screen.getByPlaceholderText('Senha');
    expect(passwordInput).toHaveAttribute('type', 'password');
  });
});
