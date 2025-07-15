// Dados iniciais
const clientes = JSON.parse(localStorage.getItem('clientes')) || [];
const produtos = JSON.parse(localStorage.getItem('produtos')) || [];
const historico = JSON.parse(localStorage.getItem('historico')) || [];

function mostrar(secaoId) {
  document.querySelectorAll('.secao').forEach(secao => {
    secao.style.display = secao.id === secaoId ? 'block' : 'none';
  });

  if (secaoId === 'listaClientes') listarClientes();
  if (secaoId === 'catalogo') listarCatalogo();
}

function salvar() {
  localStorage.setItem('clientes', JSON.stringify(clientes));
  localStorage.setItem('produtos', JSON.stringify(produtos));
  localStorage.setItem('historico', JSON.stringify(historico));
}

function cadastrarCliente() {
  const nome = document.getElementById('nomeCliente').value.trim();
  const telefone = document.getElementById('telefoneCliente').value.trim();
  const cidade = document.getElementById('cidadeCliente').value.trim();
  const grupo = document.getElementById('grupoCliente').value;

  if (!nome) return alert('Informe o nome do cliente.');

  clientes.push({ id: Date.now(), nome, telefone, cidade, grupo });
  salvar();
  alert('Cliente cadastrado!');
  document.getElementById('nomeCliente').value = '';
  document.getElementById('telefoneCliente').value = '';
  document.getElementById('cidadeCliente').value = '';
  document.getElementById('grupoCliente').value = '';
}

function listarClientes() {
  const lista = JSON.parse(localStorage.getItem("clientes")) || [];
  const container = document.getElementById("clientesCadastrados");
  container.innerHTML = "";

  lista.forEach(cliente => {
    const card = document.createElement("div");
    card.className = "cartao-cliente";

    const info = document.createElement("div");
    info.className = "cartao-cliente-info";
    info.innerHTML = `
      <p><strong>Nome:</strong> ${cliente.nome}</p>
      <p><strong>Telefone:</strong> ${cliente.telefone}</p>
      <p><strong>Cidade:</strong> ${cliente.cidade}</p>
      <p><strong>Grupo:</strong> ${cliente.grupo}</p>
    `;

    const botoes = document.createElement("div");
    botoes.className = "cartao-cliente-botoes";

    const visualizar = document.createElement("button");
    visualizar.textContent = "Visualizar";
    visualizar.onclick = () => abrirPerfilCliente(cliente.id);

    botoes.appendChild(visualizar);
    card.appendChild(info);
    card.appendChild(botoes);
    container.appendChild(card);
  });
}


function abrirPerfilCliente(clienteId) {
  const cliente = clientes.find(c => c.id === clienteId);
  const detalhes = document.getElementById('detalhesCliente');
  const historicoTabela = document.getElementById('historicoCliente');

  detalhes.innerHTML = `<h4>${cliente.nome}</h4><p>${cliente.cidade} - ${cliente.telefone} (${cliente.grupo})</p>`;
  historicoTabela.innerHTML = '';

  const historicoCliente = historico.filter(h => h.cliente === cliente.nome);

  historicoCliente.forEach(item => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${item.data}</td>
      <td>${item.produto}</td>
      <td>${item.quantidade}</td>
      <td>R$ ${item.valor.toFixed(2)}</td>
    `;
    historicoTabela.appendChild(tr);
  });

  mostrar('perfilCliente');
}

function cadastrarProduto() {
  const codigo = document.getElementById('codigo').value.trim();
  const nome = document.getElementById('nome').value.trim();
  const quantidade = parseInt(document.getElementById('quantidade').value);
  const valor = parseFloat(document.getElementById('valor').value);

  if (!codigo || !nome || isNaN(quantidade) || isNaN(valor)) {
    return alert('Preencha todos os campos corretamente.');
  }

  if (produtos.find(p => p.codigo === codigo)) {
    return alert('Código já cadastrado.');
  }

  produtos.push({ codigo, nome, quantidade, valor });
  salvar();
  alert('Produto cadastrado!');
  document.getElementById('codigo').value = '';
  document.getElementById('nome').value = '';
  document.getElementById('quantidade').value = '';
  document.getElementById('valor').value = '';
}

function movimentar(tipo) {
  const codigo = document.getElementById(tipo === 'entrada' ? 'codigoEntrada' : 'codigoSaida').value.trim();
  const quantidade = parseInt(document.getElementById(tipo === 'entrada' ? 'quantidadeEntrada' : 'quantidadeSaida').value);

  const produto = produtos.find(p => p.codigo === codigo);
  if (!produto) return alert('Produto não encontrado.');
  if (isNaN(quantidade) || quantidade <= 0) return alert('Quantidade inválida.');

  if (tipo === 'entrada') {
    produto.quantidade += quantidade;
  } else {
    const clienteNome = document.getElementById('clienteSaida').value.trim();
    const cliente = clientes.find(c => c.nome === clienteNome);
    if (!cliente) return alert('Cliente não encontrado.');

    if (produto.quantidade < quantidade) return alert('Estoque insuficiente.');
    produto.quantidade -= quantidade;

    historico.push({
      cliente: cliente.nome,
      produto: produto.nome,
      quantidade,
      valor: produto.valor * quantidade,
      data: new Date().toLocaleDateString()
    });
  }

  salvar();
  alert(`${tipo === 'entrada' ? 'Entrada' : 'Saída'} registrada!`);

  if (tipo === 'entrada') {
    document.getElementById('codigoEntrada').value = '';
    document.getElementById('quantidadeEntrada').value = '';
  } else {
    document.getElementById('codigoSaida').value = '';
    document.getElementById('quantidadeSaida').value = '';
    document.getElementById('clienteSaida').value = '';
  }
}

function listarCatalogo() {
  const div = document.getElementById('listaCatalogo');
  div.innerHTML = '';

  if (produtos.length === 0) {
    div.textContent = 'Nenhum produto cadastrado.';
    return;
  }

  const tabela = document.createElement('table');
  tabela.border = 1;
  tabela.width = '100%';
  tabela.innerHTML = `
    <thead>
      <tr>
        <th>Código</th>
        <th>Produto</th>
        <th>Estoque</th>
        <th>Valor (R$)</th>
      </tr>
    </thead>
    <tbody>
      ${produtos.map(p => `
        <tr>
          <td>${p.codigo}</td>
          <td>${p.nome}</td>
          <td>${p.quantidade}</td>
          <td>${p.valor.toFixed(2)}</td>
        </tr>
      `).join('')}
    </tbody>
  `;
  div.appendChild(tabela);
}
