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

let tempo = 180; // 3 minutos
let contador;
let round = 1;
let emDescanso = false;

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

                emDescanso = true;

                document.getElementById("round").innerHTML =
                    "🧊 DESCANSO";

                tempo = 60; // 1 minuto

                iniciarTimer();

            } else {

                emDescanso = false;

                round++;

                document.getElementById("round").innerHTML =
                    "🔥 ROUND " + round + " 🔥";

                tempo = 180; // 3 minutos

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

    tempo = 180;
    round = 1;
    emDescanso = false;

    document.getElementById("round").innerHTML =
        "🔥 ROUND 1 🔥";

    document.getElementById("timer").innerHTML =
        "03:00";
}
