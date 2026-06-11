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

let tempo = 5;
let contador;
let round =1;
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

    round++;

    document.getElementById("round").innerHTML =
        "🔥 ROUND " + round + " 🔥";

    tempo = 180;

    document.getElementById("timer").innerHTML = "03:00";

    alert("Round encerrado!");
}

    }, 1000);
}

function pararTimer() {
    clearInterval(contador);
}

function reiniciarTimer() {

    clearInterval(contador);

    tempo = 180;

    document.getElementById("timer").innerHTML = "03:00";
}
