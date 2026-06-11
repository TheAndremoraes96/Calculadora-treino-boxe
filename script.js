let interval;
let time = 120;

function calcular() {
  let peso = parseFloat(document.getElementById("peso").value);
  let altura = parseFloat(document.getElementById("altura").value);
  let objetivo = document.getElementById("objetivo").value;

  let imc = peso / (altura * altura);
  let resultado = document.getElementById("resultado");

  let status = "";

  if (imc < 18.5) status = "Abaixo do peso";
  else if (imc < 25) status = "Normal";
  else if (imc < 30) status = "Sobrepeso";
  else status = "Obesidade";

  resultado.innerHTML = `IMC: ${imc.toFixed(2)} - ${status}`;

  salvarHistorico(imc);

  gerarDieta(objetivo);

  mudarTema(objetivo);

  atualizarGrafico();
}

function gerarDieta(objetivo) {
  let dieta = "";

  if (objetivo === "hipertrofia") {
    dieta = "Frango, arroz, ovos, batata doce, whey";
  }

  if (objetivo === "emagrecimento") {
    dieta = "Frango, salada, ovos, legumes, água";
  }

  if (objetivo === "manutencao") {
    dieta = "Alimentação equilibrada com tudo moderado";
  }

  document.getElementById("dieta").innerText = dieta;
}

function mudarTema(objetivo) {
  if (objetivo === "hipertrofia") {
    document.body.style.background = "#d0f0ff";
  }

  if (objetivo === "emagrecimento") {
    document.body.style.background = "#d0ffd6";
  }

  if (objetivo === "manutencao") {
    document.body.style.background = "#f5f5f5";
  }
}

function startRound() {
  clearInterval(interval);

  time = 120;

  interval = setInterval(() => {
    let min = Math.floor(time / 60);
    let sec = time % 60;

    document.getElementById("timer").innerText =
      `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;

    time--;

    if (time < 0) {
      clearInterval(interval);
      alert("Round finalizado!");
    }
  }, 1000);
}

function resetTimer() {
  clearInterval(interval);
  document.getElementById("timer").innerText = "00:00";
}

function salvarHistorico(imc) {
  let dados = JSON.parse(localStorage.getItem("imc")) || [];
  dados.push({ imc, data: new Date().toLocaleDateString() });
  localStorage.setItem("imc", JSON.stringify(dados));
}

function atualizarGrafico() {
  let dados = JSON.parse(localStorage.getItem("imc")) || [];

  let labels = dados.map(d => d.data);
  let valores = dados.map(d => d.imc);

  new Chart(document.getElementById("grafico"), {
    type: "line",
    data: {
      labels: labels,
      datasets: [{
        label: "Evolução IMC",
        data: valores,
        borderColor: "blue",
        fill: false
      }]
    }
  });
}
