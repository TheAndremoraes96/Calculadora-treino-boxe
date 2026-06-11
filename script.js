function calcularIMC() {

    let peso = document.getElementById("peso").value;
    let altura = document.getElementById("altura").value;

    let imc = peso / (altura * altura);

    let classificacao = "";

    if (imc < 18.5) {
        classificacao = "Abaixo do peso";
    } else if (imc < 25) {
        classificacao = "Peso normal";
    } else if (imc < 30) {
        classificacao = "Sobrepeso";
    } else {
        classificacao = "Obesidade";
    }

    document.getElementById("resultado").innerHTML =
        "IMC: " + imc.toFixed(2) +
        "<br>Classificação: " + classificacao;
}

let tempo = 180;
let contador;

let round = 1;
let maxRounds = 12;

let emDescanso = false;

function tocarCampainha() {

    const audio = new Audio(
        "https://actions.google.com/sounds/v1/alarms/beep_short.ogg"
    );

    audio.play();
}

function atualizarRound() {

    document.getElementById("round").innerHTML =
        "🔥 ROUND " + round + " / " + maxRounds + " 🔥";
}

function iniciarTimer() {

    clearInterval(contador);

    contador = setInterval(function () {

        let minutos = Math.floor(tempo / 60);
        let segundos = tempo % 60;

        document.getElementById("timer").innerHTML =
            minutos.toString().padStart(2, "0") +
            ":" +
            segundos.toString().padStart(2, "0");

        tempo--;

        if (tempo < 0) {

            clearInterval(contador);

            if (!emDescanso) {

                tocarCampainha();

                document.getElementById("status").innerHTML =
                    "🧊 DESCANSO";

                emDescanso = true;

                tempo = 60;

                iniciarTimer();

            } else {

                round++;

                if (round > maxRounds) {

                    tocarCampainha();

                    document.getElementById("status").innerHTML =
                        "🏆 TREINO FINALIZADO";

                    document.getElementById("timer").innerHTML =
                        "00:00";

                    return;
                }

                emDescanso = false;

                tocarCampainha();

                atualizarRound();

                document.getElementById("status").innerHTML =
                    "🥊 LUTA";

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

    clearInterval(contador);

    round = 1;
    tempo = 180;
    emDescanso = false;

    atualizarRound();

    document.getElementById("status").innerHTML =
        "🥊 LUTA";

    document.getElementById("timer").innerHTML =
        "03:00";
}

atualizarRound();
