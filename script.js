console.log("BoxTimer Pro ativo");

// ================= IMC =================

function calcularIMC() {

    let peso = Number(document.getElementById("peso").value);
    let altura = Number(document.getElementById("altura").value);
    let objetivo = document.getElementById("objetivo").value;
    let orcamento = document.getElementById("orcamento").value;

    if (!peso || !altura) {
        document.getElementById("resultado").innerText =
            "Preencha peso e altura corretamente";
        return;
    }

    let imc = peso / (altura * altura);

    let classificacao = getClassificacao(imc);

    let dieta = gerarDieta(objetivo, orcamento);

    document.getElementById("resultado").innerHTML =
        "IMC: " + imc.toFixed(2) + " - " + classificacao;

    document.getElementById("dieta").innerText = dieta;

    salvarHistorico(imc, classificacao, objetivo);

    renderHistorico();
}


// ================= CLASSIFICAÇÃO =================

function getClassificacao(imc) {

    if (imc < 18.5) return "Abaixo do peso";
    if (imc < 25) return "Normal";
    if (imc < 30) return "Sobrepeso";
    return "Obesidade";
}


// ================= DIETA (COM ECONÔMICO + PADRÃO) =================

function gerarDieta(objetivo, orcamento) {

    const base = {
        hipertrofia: {
            economico: ["Ovos", "Frango (coxa)", "Arroz", "Feijão", "Banana"],
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


// ================= HISTÓRICO LOCAL =================

function salvarHistorico(imc, classificacao, objetivo) {

    let dados = JSON.parse(localStorage.getItem("imcHistorico")) || [];

    dados.push({
        data: new Date().toLocaleString(),
        imc,
        classificacao,
        objetivo
    });

    localStorage.setItem("imcHistorico", JSON.stringify(dados));
}


// ================= RENDER HISTÓRICO =================

function renderHistorico() {

    let dados = JSON.parse(localStorage.getItem("imcHistorico")) || [];

    let html = "";

    dados.slice().reverse().forEach(d => {
        html += `
        <div>
            📅 ${d.data} | IMC: ${d.imc.toFixed(2)} | ${d.objetivo}
        </div>
        `;
    });

    document.getElementById("historico").innerHTML = html;
}


// ================= TIMER =================

let tempo = 180;
let round = 1;
let maxRounds = 12;
let descanso = false;
let intervalo;

function iniciarTimer() {

    clearInterval(intervalo);

    intervalo = setInterval(() => {

        let m = Math.floor(tempo / 60);
        let s = tempo % 60;

        document.getElementById("timer").innerText =
            `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;

        tempo--;

        if (tempo < 0) {

            if (!descanso) {
                descanso = true;
                tempo = 60;
                document.getElementById("status").innerText = "DESCANSO";
            } else {
                descanso = false;
                round++;
                tempo = 180;

                document.getElementById("status").innerText = "🥊 LUTA";
                document.getElementById("round").innerText =
                    "ROUND " + round + " / " + maxRounds;
            }
        }

    }, 1000);
}

function pararTimer() {
    clearInterval(intervalo);
}

function reiniciarTimer() {
    round = 1;
    tempo = 180;
    descanso = false;

    document.getElementById("round").innerText =
        "ROUND 1 / " + maxRounds;

    document.getElementById("timer").innerText = "03:00";
}
