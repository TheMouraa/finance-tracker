// Estado simples em memória (persistido no localStorage)
let transacoes = [];
let grafico;

// ==========================
// CARREGAMENTO / SALVAMENTO
// ==========================
function carregar() {
  const raw = localStorage.getItem('transacoes');
  transacoes = raw ? JSON.parse(raw) : [];
  renderizar();
}

function salvar() {
  localStorage.setItem('transacoes', JSON.stringify(transacoes));
}

// ==========================
// FORMATAÇÃO
// ==========================
function formatarReal(valor) {
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
}

// ==========================
// DATA / FILTROS
// ==========================
function getMesAno(dataISO) {
  const d = new Date(dataISO);
  return {
    mes: d.getMonth() + 1,
    ano: d.getFullYear()
  };
}

function filtrarMesAtual() {
  const hoje = new Date();
  const mes = hoje.getMonth() + 1;
  const ano = hoje.getFullYear();

  return transacoes.filter(t => {
    const d = getMesAno(t.data);
    return d.mes === mes && d.ano === ano;
  });
}

function filtrarPeriodo(inicio, fim) {
  const ini = new Date(inicio);
  const end = new Date(fim);

  return transacoes.filter(t => {
    const d = new Date(t.data);
    return d >= ini && d <= end;
  });
}

// ==========================
// CÁLCULOS
// ==========================
function calcularSaldo() {
  return filtrarMesAtual().reduce((s, t) => s + t.valor, 0);
}

function calcularTotais() {
  const dados = filtrarMesAtual();

  const receitas = dados
    .filter(t => t.valor > 0)
    .reduce((s, v) => s + v.valor, 0);

  const despesas = dados
    .filter(t => t.valor < 0)
    .reduce((s, v) => s + v.valor, 0);

  return { receitas, despesas };
}

// ==========================
// MODAL
// ==========================
function abrirModal() {
  document.getElementById('modal').classList.remove('hidden');
}

function fecharModal() {
  document.getElementById('modal').classList.add('hidden');
}

// ==========================
// TRANSAÇÕES
// ==========================
function adicionarTransacaoObj(transacao) {
  transacoes.push(transacao);
  salvar();
  renderizar();
}

function removerTransacao(id) {
  transacoes = transacoes.filter(t => t.id !== id);
  salvar();
  renderizar();
}

// ==========================
// INIT
// ==========================
document.addEventListener('DOMContentLoaded', () => {
  carregar();

  document.getElementById('btn-add').addEventListener('click', abrirModal);
  document.getElementById('close-modal').addEventListener('click', fecharModal);
  document.getElementById('cancel').addEventListener('click', fecharModal);

  const form = document.getElementById('form-transacao');

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const descricao = document.getElementById('descricao').value.trim();
    const tipo = document.getElementById('tipo').value;
    const raw = parseFloat(document.getElementById('valor').value);

    if (!descricao || !tipo || Number.isNaN(raw)) {
      alert('Preencha todos os campos.');
      return;
    }

    const valor = tipo === 'receita'
      ? Math.abs(raw)
      : -Math.abs(raw);

    const transacao = {
      id: Date.now(),
      descricao,
      valor,
      data: new Date().toISOString()
    };

    adicionarTransacaoObj(transacao);

    form.reset();
    fecharModal();
  });
});

// ==========================
// RENDERIZAÇÃO
// ==========================
function renderizar() {
  const saldoEl = document.getElementById('saldo');
  const totalReceitasEl = document.getElementById('total-receitas');
  const totalDespesasEl = document.getElementById('total-despesas');
  const lista = document.getElementById('lista-transacoes');

  const saldo = calcularSaldo();
  saldoEl.innerText = formatarReal(saldo);

  const { receitas, despesas } = calcularTotais();
  totalReceitasEl.innerText = formatarReal(receitas);
  totalDespesasEl.innerText = formatarReal(Math.abs(despesas));

  lista.innerHTML = '';

  filtrarMesAtual()
    .slice()
    .reverse()
    .forEach(t => {
      const li = document.createElement('li');
      li.className = t.valor >= 0 ? 'positive' : 'negative';

      const wrapper = document.createElement('div');
      wrapper.className = 'txn';

      const desc = document.createElement('span');
      desc.textContent = t.descricao;

      const right = document.createElement('div');

      const amt = document.createElement('span');
      amt.className = 'amt';
      amt.textContent =
        (t.valor >= 0 ? '+' : '-') +
        ' ' +
        formatarReal(Math.abs(t.valor));

      const del = document.createElement('button');
      del.className = 'del';
      del.textContent = 'Remover';
      del.addEventListener('click', () => removerTransacao(t.id));

      right.appendChild(amt);
      right.appendChild(del);

      wrapper.appendChild(desc);
      wrapper.appendChild(right);

      li.appendChild(wrapper);
      lista.appendChild(li);
    });

  atualizarGrafico();
}

// ==========================
// GRÁFICO
// ==========================
function atualizarGrafico() {
  const ctx = document.getElementById('grafico').getContext('2d');

  const { receitas, despesas } = calcularTotais();

  const data = {
    labels: ['Receitas', 'Despesas'],
    datasets: [{
      data: [receitas, Math.abs(despesas)],
      backgroundColor: ['#2ecc71', '#e74c3c']
    }]
  };

  if (grafico) grafico.destroy();

  grafico = new Chart(ctx, {
    type: 'doughnut',
    data
  });
}