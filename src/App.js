import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ nome: "", senha: "" });

  const fetchPedidos = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/pedidos");
      if (!response.ok) {
        throw new Error("Erro ao buscar pedidos");
      }
      const data = await response.json();
      setPedidos(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchPedidos();
    }
  }, [isLoggedIn]);

  const atualizarStatus = async (pedidoId, novoStatus) => {
    try {
      const response = await fetch(
        `http://localhost:3001/api/pedidos/${pedidoId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: novoStatus }),
        }
      );
      if (response.ok) {
        fetchPedidos();
      } else {
        console.error("Erro ao atualizar status.");
      }
    } catch (error) {
      console.error("Erro na conexão:", error);
    }
  };

  const concluirPedido = async (pedidoId) => {
    if (
      window.confirm("Tem certeza que deseja concluir e remover este pedido?")
    ) {
      try {
        const response = await fetch(
          `http://localhost:3001/api/pedidos/${pedidoId}`,
          {
            method: "DELETE",
          }
        );
        if (response.ok) {
          fetchPedidos();
        } else {
          console.error("Erro ao remover o pedido.");
        }
      } catch (error) {
        console.error("Erro na conexão:", error);
      }
    }
  };

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        "http://localhost:3001/api/usuarios/registrar",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nome: formData.nome, senha: formData.senha }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        alert(data.message);
        setIsLogin(true);
      } else {
        alert(`Erro: ${data.message}`);
      }
    } catch (error) {
      alert("Erro ao se conectar com o servidor.");
    }
  };

  // NOVA LÓGICA DE LOGIN
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:3001/api/usuarios/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: formData.nome, senha: formData.senha }),
      });
      const data = await response.json();
      if (response.ok) {
        alert(data.message);
        setIsLoggedIn(true); // Se o login for bem-sucedido, exibe o painel
      } else {
        alert(`Erro: ${data.message}`);
      }
    } catch (error) {
      alert("Erro ao se conectar com o servidor.");
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="auth-container">
        <h2>{isLogin ? "Login do Administrador" : "Registrar-se"}</h2>
        <form onSubmit={isLogin ? handleLogin : handleRegister}>
          <input
            type="text"
            name="nome"
            placeholder="Nome de Usuário"
            value={formData.nome}
            onChange={handleFormChange}
            required
          />
          <input
            type="password"
            name="senha"
            placeholder="Senha"
            value={formData.senha}
            onChange={handleFormChange}
            required
          />
          <button type="submit">{isLogin ? "Entrar" : "Registrar"}</button>
        </form>
        <p>
          {isLogin ? "Não tem uma conta? " : "Já tem uma conta? "}
          <span onClick={() => setIsLogin(!isLogin)} className="toggle-form">
            {isLogin ? "Criar Conta" : "Fazer Login"}
          </span>
        </p>
      </div>
    );
  }

  return (
    <div className="painel-admin">
      <header>
        <h1>Painel de Administração</h1>
        <p>Gerenciamento de Pedidos</p>
      </header>

      <main className="lista-pedidos">
        {loading ? (
          <div className="loading-state">Carregando pedidos...</div>
        ) : error ? (
          <div className="error-state">Erro: {error}</div>
        ) : pedidos.length > 0 ? (
          pedidos.map((pedido) => (
            <div key={pedido.id} className="pedido-card">
              <h3>Pedido #{pedido.id}</h3>
              <p>
                <strong>Cliente:</strong> {pedido.cliente.nome}
              </p>
              <p>
                <strong>Endereço:</strong> {pedido.cliente.endereco}
              </p>
              <p>
                <strong>Total:</strong> R$ {pedido.total}
              </p>
              <p className="status-label">
                <strong>Status:</strong>{" "}
                <span
                  className={`status-${pedido.status
                    .replace(/\s+/g, "-")
                    .toLowerCase()}`}
                >
                  {pedido.status}
                </span>
              </p>
              <div className="status-botoes">
                <button
                  onClick={() => atualizarStatus(pedido.id, "Em preparação")}
                >
                  Em Preparação
                </button>
                <button
                  onClick={() =>
                    atualizarStatus(pedido.id, "Pronto para entrega")
                  }
                >
                  Pronto para Entrega
                </button>
                <button onClick={() => atualizarStatus(pedido.id, "Entregue")}>
                  Entregue
                </button>
              </div>
              <h4>Itens:</h4>
              <ul>
                {pedido.itens.map((item) => (
                  <li key={item.id}>
                    {item.nome} (x{item.quantidade})
                  </li>
                ))}
              </ul>
              <button
                className="concluir-btn"
                onClick={() => concluirPedido(pedido.id)}
              >
                Concluir Pedido
              </button>
            </div>
          ))
        ) : (
          <div className="sem-pedidos">
            <p>Nenhum pedido recebido ainda.</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
