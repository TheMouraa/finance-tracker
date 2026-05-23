let saldo = 0;
function atualizarSaldo() {
  document.getElementById("saldo").innerText =
    `R$ ${saldo.toFixed(2)}`;
}
function adicionarReceita() {
  let valor = prompt("Digite o valor da receita");
  if (valor) {
    saldo += parseFloat(valor);
    adicionarTransacao(`Receita: R$ ${valor}`);
    atualizarSaldo();
  }
}
function adicionarDespesa () {
  let valor = prompt("Digite o valor da despesa:");
  if (valor) {
    saldo -= parseFloat(valor);
    adicionarTransacao(`Despesa: R$ ${valor}`);
    atualizarSaldo();
  }
}
function adicionarTransacao(texto) {
  let lista = document.getElementById("lista-transacoes");
  let item = document.createElement("li");
  item.innerText = texto;
  lista.appendChild(item);
}
