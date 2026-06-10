function calcularIMC() {

    let peso = document.getElementById("peso").value;

    let altura = document.getElementById("altura").value;

    let imc = peso / (altura * altura);

    document.getElementById("resultado").innerHTML =
        "Seu IMC é: " + imc.toFixed(2);

}
