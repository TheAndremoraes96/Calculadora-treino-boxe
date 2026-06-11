// ================================
// 🥊 BOX TIMER PRO - EVOLUÇÃO COMPLETA
// ================================


// ================= IMC =================

function calcularIMC() {

    let peso = parseFloat(document.getElementById("peso").value);
    let altura = parseFloat(document.getElementById("altura").value);
    let objetivo = document.getElementById("objetivo").value;
    let preferencia = document.getElementById("preferencia").value;

    if (!peso || !altura) return;

    let imc = peso / (altura * altura);

    let classificacao = getClassificacao(imc);
    let dieta = gerarDieta(objetivo, preferencia);

    document.getElementById("resultado").innerHTML =
        `IMC: ${imc.toFixed(2)} <br>Classificação: ${classificacao}`;

    document.getElementById("dieta").innerText = dieta;

    salvarHistorico(imc, classificacao, objetivo);
    renderHistorico();
    renderGrafico();
}


// ================= CLASSIFICAÇÃO =================

function getClassificacao(imc) {

    if (imc < 18.5) return "Abaixo do peso";
    if (imc < 25) return "Peso normal";
    if (imc < 30) return "Sobrepeso";
    return "Obesidade";
}


// ================= DIETA INTELIGENTE =================

function gerarDieta(objetivo, preferencia) {

    const base = {
        hipertrofia: {
            carnivoro: ["Ovos", "Frango", "Carne vermelha", "Whey", "Arroz", "Batata doce"],
            pescetariano: ["Ovos", "Salmão", "Atum", "Arroz", "Aveia", "Frutas"],
            fit: ["Ovos", "Frango", "Arroz", "Aveia", "Banana", "Legumes"]
        },
        emagrecimento: {
            carnivoro: ["Frango", "Ovos", "Carne magra", "Saladas", "Brócolis"],
            pescetariano: ["Peixe", "Atum", "Ovos", "Legumes", "Saladas"],
            fit: ["Frango", "Ovos", "Legumes", "Couve", "Saladas"]
        },
        manutencao: {
            carnivoro: ["Frango", "Carne", "Ovos", "Arroz", "Feijão"],
            pescetariano: ["Peixe", "Ovos", "Arroz", "Feijão", "Legumes"],
            fit: ["Frango", "Ovos", "Legumes", "Frutas", "Arroz"]
        }
    };

    return `
🍽️ Dieta (${objetivo} - ${preferencia}):

- ${base[objetivo][preferencia].join("\n- ")}
    `;
}


// ================= HISTÓRICO =================

function salvarHistorico(imc, classificacao, objetivo) {

    let historico = JSON.parse(localStorage.getItem("imcHistorico")) || [];

    historico.push({
        data: new Date().toLocaleString(),
        imc,
        classificacao,
        objetivo
    });

    localStorage.setItem("imcHistorico", JSON.stringify(historico));
}


// ================= RENDER HISTÓRICO =================

function renderHistorico() {

    let historico = JSON.parse(localStorage.getItem("imcHistorico")) || [];

    let container = document.getElementById("historico");
    container.innerHTML = "";

    historico.slice().reverse().forEach(item => {

        container.innerHTML += `
        <div style="border:1px solid #ccc; margin:5px; padding:8px;">
            📅 ${item.data}<br>
            IMC: ${item.imc.toFixed(2)}<br>
            ${item.classificacao} | ${item.objetivo}
        </div>
        `;
    });
}


// ================= GRÁFICO =================

function renderGrafico() {

    let historico = JSON.parse(localStorage.getItem("imcHistorico")) || [];

    let data = historico.map(h => ({
        dia: h.data,
        imc: h.imc
    }));

    const chart = {
        chartType: "line",
        meta: {
            title: "Evolução do IMC",
            description: "Histórico de progresso do atleta"
        },
        xKey: "dia",
        series: [
            {
                dataKey: "imc",
                label: "IMC",
                valueFormat: "raw"
            }
        ],
        data
    };

    document.getElementById("grafico-imc").innerHTML =
        `<pre>${JSON.stringify(chart, null, 2)}</pre>`;
}


// ================= LIMPAR =================

function limparHistorico() {

    localStorage.removeItem("imcHistorico");
    renderHistorico();
    renderGrafico();
}


// INIT
renderHistorico();
renderGrafico();


// ================= TIMER (mantido igual ao seu) =================

let tempo = 180;
let contador;
let round = 1;
let maxRounds = 12;
let emDescanso = false;

function tocarCampainha() {
    new Audio("https://actions.google.com/sounds/v1/alarms/beep_short.ogg").play();
}

function atualizarRound() {
    document.getElementById("round").innerHTML =
        `🔥 ROUND ${round} / ${maxRounds} 🔥`;
}

function iniciarTimer() {

    clearInterval(contador);

    contador = setInterval(() => {

        let m = Math.floor(tempo / 60);
        let s = tempo % 60;

        document.getElementById("timer").innerHTML =
            String(m).padStart(2, "0") + ":" +
            String(s).padStart(2, "0");

        tempo--;

        if (tempo < 0) {

            clearInterval(contador);

            if (!emDescanso) {

                tocarCampainha();
                emDescanso = true;
                tempo = 60;

                document.getElementById("status").innerHTML = "🧊 DESCANSO";
                iniciarTimer();

            } else {

                round++;

                if (round > maxRounds) {
                    document.getElementById("status").innerHTML = "🏆 FINAL";
                    return;
                }

                emDescanso = false;
                tocarCampainha();
                atualizarRound();

                document.getElementById("status").innerHTML = "🥊 LUTA";
                tempo = 180;

                iniciarTimer();
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
    atualizarRound();
}
