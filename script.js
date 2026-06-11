console.log("BoxTimer carregado");

// ================= IMC =================

window.calcularIMC = function () {

    let peso = Number(document.getElementById("peso").value);
    let altura = Number(document.getElementById("altura").value);
    let objetivo = document.getElementById("objetivo").value;

    console.log("peso:", peso);
    console.log("altura:", altura);

    if (!peso || !altura) {
        document.getElementById("resultado").innerText =
            "Preencha peso e altura";
        return;
    }

    let imc = peso / (altura * altura);

    let classificacao = "";

    if (imc < 18.5) classificacao = "Abaixo do peso";
    else if (imc < 25) classificacao = "Normal";
    else if (imc < 30) classificacao = "Sobrepeso";
    else classificacao = "Obesidade";

    document.getElementById("resultado").innerHTML =
        "IMC: " + imc.toFixed(2) + " - " + classificacao;

    document.getElementById("dieta").innerText =
        gerarDieta(objetivo);
};


// ================= DIETA =================

function gerarDieta(objetivo) {

    const dieta = {
        hipertrofia: ["Ovos", "Frango", "Arroz", "Banana", "Aveia"],
        emagrecimento: ["Frango", "Salada", "Legumes", "Peixe"],
        manutencao: ["Arroz", "Feijão", "Frango", "Ovos"]
    };

    return "🍽️ Dieta:\n- " + dieta[objetivo].join("\n- ");
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

                document.getElementById("status").innerText = "LUTA";
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
