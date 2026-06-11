// ================================
// 🥊 BOX TIMER PRO + IMC + HISTÓRICO
// ================================


// ================= IMC =================

function calcularIMC() {

    let peso = parseFloat(document.getElementById("peso").value);
    let altura = parseFloat(document.getElementById("altura").value);
    let objetivo = document.getElementById("objetivo").value;

    if (!peso || !altura) return;

    let imc = peso / (altura * altura);

    let classificacao = getClassificacao(imc);
    let dieta = gerarDieta(objetivo);

    document.getElementById("resultado").innerHTML =
        "IMC: " + imc.toFixed(2) +
        "<br>Classificação: " + classificacao;

    document.getElementById("dieta").innerText = dieta;

    salvarHistorico(imc, classificacao, objetivo);
    carregarHistorico();
}


// 📊 CLASSIFICAÇÃO
function getClassificacao(imc) {

    if (imc < 18.5) return "Abaixo do peso";
    if (imc < 25) return "Peso normal";
    if (imc < 30) return "Sobrepeso";
    return "Obesidade";
}


// 🍽️ DIETA
function gerarDieta(objetivo) {

    if (objetivo === "hipertrofia") {
        return `
🍽️ Hipertrofia:
- Ovos
- Frango
- Arroz
- Aveia
- Banana
- Batata-doce
        `;
    }

    if (objetivo === "emagrecimento") {
        return `
🍽️ Emagrecimento:
- Frango
- Peixe
- Ovos
- Saladas
- Brócolis
- Couve
        `;
    }

    return `
🍽️ Manutenção:
- Arroz
- Feijão
- Frango
- Ovos
- Legumes
- Frutas
    `;
}


// ================= HISTÓRICO =================

// salvar evolução
function salvarHistorico(imc, classificacao, objetivo) {

    let historico = JSON.parse(localStorage.getItem("historicoIMC")) || [];

    let registro = {
        data: new Date().toLocaleString(),
        imc: imc.toFixed(2),
        classificacao: classificacao,
        objetivo: objetivo
    };

    historico.push(registro);

    localStorage.setItem("historicoIMC", JSON.stringify(historico));
}


// carregar evolução
function carregarHistorico() {

    let historico = JSON.parse(localStorage.getItem("historicoIMC")) || [];

    let container = document.getElementById("historico");

    container.innerHTML = "";

    historico.reverse().forEach(item => {

        container.innerHTML += `
        <div style="margin-bottom:10px; padding:10px; border:1px solid #ccc;">
            <strong>📅 ${item.data}</strong><br>
            IMC: ${item.imc}<br>
            Classificação: ${item.classificacao}<br>
            Objetivo: ${item.objetivo}
        </div>
        `;
    });
}


// limpar histórico
function limparHistorico() {

    localStorage.removeItem("historicoIMC");
    carregarHistorico();
}


// inicializa histórico ao abrir
carregarHistorico();


// ================= TIMER =================

let tempo = 180;
let contador;

let round = 1;
let maxRounds = 12;

let emDescanso = false;


// 🔔 CAMPANHA
function tocarCampainha() {

    const audio = new Audio(
        "https://actions.google.com/sounds/v1/alarms/beep_short.ogg"
    );

    audio.play();
}


// 🔥 ROUND
function atualizarRound() {

    document.getElementById("round").innerHTML =
        "🔥 ROUND " + round + " / " + maxRounds + " 🔥";
}


// ▶️ INICIAR
function iniciarTimer() {

    clearInterval(contador);

    contador = setInterval(() => {

        let minutos = Math.floor(tempo / 60);
        let segundos = tempo % 60;

        document.getElementById("timer").innerHTML =
            String(minutos).padStart(2, "0") + ":" +
            String(segundos).padStart(2, "0");

        tempo--;

        if (tempo < 0) {

            clearInterval(contador);

            if (!emDescanso) {

                tocarCampainha();

                document.getElementById("status").innerHTML = "🧊 DESCANSO";

                emDescanso = true;
                tempo = 60;

                iniciarTimer();

            } else {

                round++;

                if (round > maxRounds) {

                    tocarCampainha();

                    document.getElementById("status").innerHTML =
                        "🏆 TREINO FINALIZADO";

                    document.getElementById("timer").innerHTML = "00:00";
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


// ⏹️ PARAR
function pararTimer() {
    clearInterval(contador);
}


// 🔄 REINICIAR
function reiniciarTimer() {

    clearInterval(contador);

    round = 1;
    tempo = 180;
    emDescanso = false;

    atualizarRound();

    document.getElementById("status").innerHTML = "🥊 LUTA";
    document.getElementById("timer").innerHTML = "03:00";
}


// INIT
atualizarRound();
