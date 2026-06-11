console.log("BoxTimer Pro carregado com sucesso");

// ================= IMC =================

function calcularIMC() {
    const peso = Number(document.getElementById("peso").value);
    const altura = Number(document.getElementById("altura").value);
    const objetivo = document.getElementById("objetivo").value;
    const preferencia = document.getElementById("preferencia").value;
    const orcamento = document.getElementById("orcamento").value;

    if (!peso || !altura || altura <= 0) {
        document.getElementById("resultado").innerText =
            "⚠️ Preencha peso e altura corretamente.";
        return;
    }

    const imc = peso / (altura * altura);
    const classificacao = getClassificacao(imc);
    const dieta = gerarDieta(objetivo, preferencia, orcamento);

    document.getElementById("resultado").innerHTML =
        `IMC: ${imc.toFixed(2)} <br> Classificação: ${classificacao}`;

    document.getElementById("dieta").innerText = dieta;

    salvarHistorico(imc, classificacao, objetivo, preferencia, orcamento);
    renderHistorico();
    renderGrafico();
    atualizarTema(objetivo);
}

function getClassificacao(imc) {
    if (imc < 18.5) return "Abaixo do peso";
    if (imc < 25) return "Peso normal";
    if (imc < 30) return "Sobrepeso";
    return "Obesidade";
}

// ================= DIETA =================

function gerarDieta(objetivo, preferencia, orcamento) {
    const alimentos = {
        hipertrofia: {
            carnivoro: {
                economico: ["Ovos", "Frango coxa/sobrecoxa", "Arroz", "Feijão", "Banana", "Aveia", "Macarrão", "Leite"],
                padrao: ["Peito de frango", "Carne vermelha magra", "Ovos", "Whey protein", "Batata-doce", "Arroz", "Aveia", "Pasta de amendoim"]
            },
            pescetariano: {
                economico: ["Sardinha", "Ovos", "Arroz", "Feijão", "Banana", "Aveia", "Macarrão"],
                padrao: ["Atum", "Salmão", "Ovos", "Arroz", "Batata-doce", "Iogurte natural", "Aveia"]
            },
            fit: {
                economico: ["Ovos", "Frango", "Arroz", "Feijão", "Banana", "Couve", "Aveia"],
                padrao: ["Frango", "Ovos", "Arroz integral", "Batata-doce", "Legumes", "Iogurte natural", "Aveia"]
            },
            vegetariano: {
                economico: ["Ovos", "Feijão", "Arroz", "Lentilha", "Banana", "Aveia", "Amendoim"],
                padrao: ["Ovos", "Grão-de-bico", "Lentilha", "Iogurte natural", "Queijo branco", "Aveia", "Castanhas"]
            }
        },

        emagrecimento: {
            carnivoro: {
                economico: ["Ovos", "Frango", "Couve", "Repolho", "Pepino", "Arroz em pequena quantidade", "Feijão em pequena quantidade"],
                padrao: ["Peito de frango", "Carne magra", "Ovos", "Brócolis", "Abobrinha", "Saladas", "Legumes"]
            },
            pescetariano: {
                economico: ["Sardinha", "Ovos", "Couve", "Repolho", "Pepino", "Feijão em pequena quantidade"],
                padrao: ["Peixe", "Atum", "Ovos", "Brócolis", "Saladas", "Legumes", "Couve-flor"]
            },
            fit: {
                economico: ["Ovos", "Frango", "Couve", "Repolho", "Abobrinha", "Arroz em pequena quantidade"],
                padrao: ["Frango", "Ovos", "Saladas", "Brócolis", "Legumes", "Batata-doce em pequena quantidade"]
            },
            vegetariano: {
                economico: ["Ovos", "Feijão em pequena quantidade", "Lentilha", "Couve", "Repolho", "Pepino"],
                padrao: ["Ovos", "Grão-de-bico", "Lentilha", "Saladas", "Legumes", "Iogurte natural"]
            }
        },

        manutencao: {
            carnivoro: {
                economico: ["Ovos", "Frango", "Arroz", "Feijão", "Banana", "Legumes da época"],
                padrao: ["Frango", "Carne", "Ovos", "Arroz", "Feijão", "Legumes", "Frutas"]
            },
            pescetariano: {
                economico: ["Sardinha", "Ovos", "Arroz", "Feijão", "Banana", "Legumes da época"],
                padrao: ["Peixe", "Atum", "Ovos", "Arroz", "Feijão", "Legumes", "Frutas"]
            },
            fit: {
                economico: ["Ovos", "Frango", "Arroz", "Feijão", "Banana", "Couve"],
                padrao: ["Frango", "Ovos", "Arroz integral", "Feijão", "Legumes", "Frutas", "Aveia"]
            },
            vegetariano: {
                economico: ["Ovos", "Arroz", "Feijão", "Lentilha", "Banana", "Aveia"],
                padrao: ["Ovos", "Grão-de-bico", "Lentilha", "Iogurte natural", "Queijo branco", "Legumes", "Frutas"]
            }
        }
    };

    const lista = alimentos[objetivo][preferencia][orcamento];

    return `
🍽️ Plano alimentar

Objetivo: ${formatarTexto(objetivo)}
Preferência: ${formatarTexto(preferencia)}
Orçamento: ${formatarTexto(orcamento)}

Sugestões:
- ${lista.join("\n- ")}

⚠️ Observação:
Essas são sugestões básicas. Para dieta clínica, procure um nutricionista.
`;
}

function formatarTexto(texto) {
    return texto.charAt(0).toUpperCase() + texto.slice(1);
}

// ================= TEMA =================

function atualizarTema(objetivo) {
    const body = document.getElementById("appBody");

    body.classList.remove("tema-hipertrofia", "tema-emagrecimento", "tema-manutencao");

    if (objetivo === "hipertrofia") body.classList.add("tema-hipertrofia");
    if (objetivo === "emagrecimento") body.classList.add("tema-emagrecimento");
    if (objetivo === "manutencao") body.classList.add("tema-manutencao");
}

function atualizarTemaPorSelect() {
    const objetivo = document.getElementById("objetivo").value;
    atualizarTema(objetivo);
}

// ================= HISTÓRICO =================

function salvarHistorico(imc, classificacao, objetivo, preferencia, orcamento) {
    const historico = JSON.parse(localStorage.getItem("historicoIMC")) || [];

    const registro = {
        data: new Date().toLocaleString("pt-BR"),
        imc: Number(imc.toFixed(2)),
        classificacao,
        objetivo,
        preferencia,
        orcamento
    };

    historico.push(registro);
    localStorage.setItem("historicoIMC", JSON.stringify(historico));
}

function renderHistorico() {
    const historico = JSON.parse(localStorage.getItem("historicoIMC")) || [];
    const container = document.getElementById("historico");

    if (historico.length === 0) {
        container.innerHTML = "Nenhum registro ainda.";
        return;
    }

    let html = "";

    historico.slice().reverse().forEach((item) => {
        html += `
            <div class="historico-card">
                <strong>📅 ${item.data}</strong><br>
                IMC: ${item.imc}<br>
                Classificação: ${item.classificacao}<br>
                Objetivo: ${formatarTexto(item.objetivo)}<br>
                Preferência: ${formatarTexto(item.preferencia)}<br>
                Orçamento: ${formatarTexto(item.orcamento)}
            </div>
        `;
    });

    container.innerHTML = html;
}

function limparHistorico() {
    localStorage.removeItem("historicoIMC");
    renderHistorico();
    renderGrafico();
}

// ================= GRÁFICO CANVAS =================

function renderGrafico() {
    const canvas = document.getElementById("graficoIMC");

    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const historico = JSON.parse(localStorage.getItem("historicoIMC")) || [];

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#111";
    ctx.font = "16px Arial";
    ctx.fillText("Evolução do IMC", 20, 25);

    if (historico.length === 0) {
        ctx.font = "14px Arial";
        ctx.fillText("Nenhum dado para exibir ainda.", 20, 60);
        return;
    }

    const valores = historico.map(item => Number(item.imc));
    const max = Math.max(...valores) + 2;
    const min = Math.min(...valores) - 2;

    const padding = 45;
    const largura = canvas.width - padding * 2;
    const altura = canvas.height - padding * 2;

    ctx.strokeStyle = "#333";
    ctx.lineWidth = 1;

    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, canvas.height - padding);
    ctx.lineTo(canvas.width - padding, canvas.height - padding);
    ctx.stroke();

    function getX(index) {
        if (valores.length === 1) return padding + largura / 2;
        return padding + (index * largura) / (valores.length - 1);
    }

    function getY(valor) {
        return canvas.height - padding - ((valor - min) / (max - min)) * altura;
    }

    ctx.strokeStyle = "#007bff";
    ctx.lineWidth = 3;
    ctx.beginPath();

    valores.forEach((valor, index) => {
        const x = getX(index);
        const y = getY(valor);

        if (index === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    });

    ctx.stroke();

    valores.forEach((valor, index) => {
        const x = getX(index);
        const y = getY(valor);

        ctx.fillStyle = "#007bff";
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#111";
        ctx.font = "12px Arial";
        ctx.fillText(valor.toFixed(2), x - 15, y - 10);
        ctx.fillText(index + 1, x - 4, canvas.height - 25);
    });

    ctx.fillStyle = "#111";
    ctx.font = "12px Arial";
    ctx.fillText("Treinos", canvas.width / 2 - 20, canvas.height - 5);
}

// ================= TIMER DE BOXE =================

let tempo = 180;
let contador = null;
let round = 1;
let maxRounds = 12;
let emDescanso = false;

function iniciarTimer() {
    clearInterval(contador);

    contador = setInterval(() => {
        atualizarTimerNaTela();

        tempo--;

        if (tempo < 0) {
            clearInterval(contador);

            if (!emDescanso) {
                tocarCampainha();

                emDescanso = true;
                tempo = 60;

                document.getElementById("status").innerText = "🧊 DESCANSO";

                iniciarTimer();
            } else {
                round++;

                if (round > maxRounds) {
                    tocarCampainha();

                    document.getElementById("status").innerText =
                        "🏆 TREINO FINALIZADO";

                    document.getElementById("timer").innerText = "00:00";
                    return;
                }

                tocarCampainha();

                emDescanso = false;
                tempo = 180;

                document.getElementById("round").innerText =
                    `🔥 ROUND ${round} / ${maxRounds} 🔥`;

                document.getElementById("status").innerText = "🥊 LUTA";

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

    document.getElementById("round").innerText = "🔥 ROUND 1 / 12 🔥";
    document.getElementById("status").innerText = "🥊 LUTA";
    document.getElementById("timer").innerText = "03:00";
}

function atualizarTimerNaTela() {
    const minutos = Math.floor(tempo / 60);
    const segundos = tempo % 60;

    document.getElementById("timer").innerText =
        `${String(minutos).padStart(2, "0")}:${String(segundos).padStart(2, "0")}`;
}

function tocarCampainha() {
    const audio = new Audio("https://actions.google.com/sounds/v1/alarms/beep_short.ogg");
    audio.play();
}

// ================= INICIALIZAÇÃO =================

renderHistorico();
renderGrafico();
atualizarTemaPorSelect();
