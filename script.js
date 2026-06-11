// ================= FIREBASE =================
const firebaseConfig = {
    apiKey: "SUA_API_KEY",
    authDomain: "SEU_PROJETO.firebaseapp.com",
    databaseURL: "https://SEU_PROJETO.firebaseio.com",
    projectId: "SEU_PROJETO",
    storageBucket: "SEU_PROJETO.appspot.com",
    messagingSenderId: "XXXX",
    appId: "XXXX"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();


// ================= IMC =================

function calcularIMC() {

    let peso = Number(document.getElementById("peso").value);
    let altura = Number(document.getElementById("altura").value);
    let objetivo = document.getElementById("objetivo").value;
    let preferencia = document.getElementById("preferencia").value;
    let orcamento = document.getElementById("orcamento").value;

    let imc = peso / (altura * altura);

    let classificacao = getClassificacao(imc);

    let dieta = gerarDieta(objetivo, preferencia, orcamento);

    document.getElementById("resultado").innerHTML =
        IMC: ${imc.toFixed(2)} <br> ${classificacao};

    document.getElementById("dieta").innerText = dieta;

    salvarHistorico(imc, classificacao, objetivo);

    renderHistorico();
    renderGrafico();

    atualizarTema(objetivo);
}


// ================= CLASSIFICAÇÃO =================

function getClassificacao(imc) {
    if (imc < 18.5) return "Abaixo do peso";
    if (imc < 25) return "Normal";
    if (imc < 30) return "Sobrepeso";
    return "Obesidade";
}


// ================= DIETA =================

function gerarDieta(objetivo, preferencia, orcamento) {

    const base = {
        hipertrofia: {
            economico: ["Ovos", "Frango", "Arroz", "Feijão", "Banana"],
            padrao: ["Frango", "Carne", "Whey", "Arroz", "Batata doce"]
        },
        emagrecimento: {
            economico: ["Ovos", "Frango", "Couve", "Arroz (pouco)"],
            padrao: ["Peixe", "Frango", "Saladas", "Legumes"]
        },
        manutencao: {
            economico: ["Ovos", "Arroz", "Feijão", "Banana"],
            padrao: ["Frango", "Arroz", "Feijão", "Legumes"]
        }
    };

    return "🍽️ Dieta:\n- " + base[objetivo][orcamento].join("\n- ");
}


// ================= TEMA =================

function atualizarTema(objetivo) {

    document.body.className = "";

    if (objetivo === "hipertrofia") document.body.classList.add("hipertrofia");
    if (objetivo === "emagrecimento") document.body.classList.add("emagrecimento");
    if (objetivo === "manutencao") document.body.classList.add("manutencao");
}


// ================= HISTÓRICO =================

function salvarHistorico(imc, classificacao, objetivo) {

    let dados = JSON.parse(localStorage.getItem("imcHistorico")) || [];

    let registro = {
        data: new Date().toLocaleString(),
        imc,
        classificacao,
        objetivo
    };

    dados.push(registro);

    localStorage.setItem("imcHistorico", JSON.stringify(dados));

    db.ref("atletas").push(registro);
}


// ================= RENDER HISTÓRICO =================

function renderHistorico() {

    let dados = JSON.parse(localStorage.getItem("imcHistorico")) || [];

    let html = "";

    dados.slice().reverse().forEach(d => {
        html += `
        <div>
            📅 ${d.data} | IMC: ${d.imc.toFixed(2)} | ${d.objetivo}
        </div>`;
    });

    document.getElementById("historico").innerHTML = html;
}


// ================= GRÁFICO REAL =================

function renderGrafico() {

    let dados = JSON.parse(localStorage.getItem("imcHistorico")) || [];

    if (dados.length === 0) return;

    const chart = {
        chartType: "line",
        meta: {
            title: "Evolução do IMC",
            description: "Progresso do atleta"
        },
        xKey: "treino",
        series: [
            { dataKey: "imc", label: "IMC", valueFormat: "raw" }
        ],
        data: dados.map((d, i) => ({
            treino: i + 1,
            imc: Number(d.imc)
        }))
    };

    window.renderChart?.("grafico-imc", chart);
}


// ================= TIMER =================

let tempo = 180;
let round = 1;
let maxRounds = 12;
let emDescanso = false;
let contador;

function iniciarTimer() {

    clearInterval(contador);

    contador = setInterval(() => {

        let m = Math.floor(tempo / 60);
        let s = tempo % 60;

        document.getElementById("timer").innerHTML =
            ${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")};

        tempo--;

        if (tempo < 0) {

            if (!emDescanso) {
                emDescanso = true;
                tempo = 60;
                document.getElementById("status").innerText = "DESCANSO";
            } else {
                emDescanso = false;
                round++;
                tempo = 180;
                document.getElementById("status").innerText = "LUTA";
                document.getElementById("round").innerText = ROUND ${round} / ${maxRounds};
            }
        }

    }, 1000);
}

function pararTimer() {
    clearInterval(contador);
}

function reiniciarTimer() {
    round = 1;
    tempo = 180;
    emDescanso = false;
}


// ================= PWA =================
if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js");
}


// ================= INIT =================
renderHistorico();
renderGrafico();
