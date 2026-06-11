console.log("BoxTimer Pro carregado");

// ================= IMC + PLANO =================

function calcularIMC() {
    const nome = document.getElementById("nome").value || "Atleta";
    const idade = Number(document.getElementById("idade").value);
    const peso = Number(document.getElementById("peso").value);
    const altura = Number(document.getElementById("altura").value);
    const sexo = document.getElementById("sexo").value;
    const objetivo = document.getElementById("objetivo").value;
    const preferencia = document.getElementById("preferencia").value;
    const orcamento = document.getElementById("orcamento").value;
    const frequencia = Number(document.getElementById("frequencia").value);

    if (!peso || !altura || !idade || altura <= 0) {
        document.getElementById("resultado").innerText =
            "⚠️ Preencha peso, altura e idade corretamente.";
        return;
    }

    const imc = peso / (altura * altura);
    const classificacao = getClassificacao(imc);
    const calorias = calcularCalorias(peso, altura, idade, sexo, objetivo, frequencia);
    const proteina = calcularProteina(peso, objetivo);
    const agua = peso * 35;

    const plano = gerarPlanoAlimentar(
        nome,
        objetivo,
        preferencia,
        orcamento,
        calorias,
        proteina,
        agua
    );

    document.getElementById("resultado").innerHTML =
        `IMC: ${imc.toFixed(2)} <br>
         Classificação: ${classificacao} <br>
         Calorias estimadas: ${calorias} kcal/dia <br>
         Proteína estimada: ${proteina}g/dia <br>
         Água estimada: ${(agua / 1000).toFixed(1)}L/dia`;

    document.getElementById("dieta").innerText = plano;

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

function calcularCalorias(peso, altura, idade, sexo, objetivo, frequencia) {
    const alturaCm = altura * 100;

    let tmb;

    if (sexo === "masculino") {
        tmb = 10 * peso + 6.25 * alturaCm - 5 * idade + 5;
    } else {
        tmb = 10 * peso + 6.25 * alturaCm - 5 * idade - 161;
    }

    let fatorAtividade = 1.4;

    if (frequencia === 4) fatorAtividade = 1.5;
    if (frequencia === 5) fatorAtividade = 1.6;
    if (frequencia >= 6) fatorAtividade = 1.7;

    let calorias = tmb * fatorAtividade;

    if (objetivo === "hipertrofia") calorias += 300;
    if (objetivo === "emagrecimento") calorias -= 400;

    return Math.round(calorias);
}

function calcularProteina(peso, objetivo) {
    if (objetivo === "hipertrofia") return Math.round(peso * 2);
    if (objetivo === "emagrecimento") return Math.round(peso * 1.8);
    return Math.round(peso * 1.6);
}

// ================= PLANO ALIMENTAR =================

function gerarPlanoAlimentar(nome, objetivo, preferencia, orcamento, calorias, proteina, agua) {
    const alimentos = getAlimentos(objetivo, preferencia, orcamento);

    return `
🥊 Plano alimentar personalizado - ${nome}

Objetivo: ${formatarTexto(objetivo)}
Preferência alimentar: ${formatarTexto(preferencia)}
Orçamento: ${formatarTexto(orcamento)}

Meta aproximada:
- Calorias: ${calorias} kcal/dia
- Proteína: ${proteina}g/dia
- Água: ${(agua / 1000).toFixed(1)}L por dia

========================
🍽️ REFEIÇÕES DO DIA
========================

07:00 - Café da manhã
- ${alimentos.cafe.join("\n- ")}

10:00 - Lanche da manhã
- ${alimentos.lancheManha.join("\n- ")}

13:00 - Almoço
- ${alimentos.almoco.join("\n- ")}

16:30 - Pré-treino
- ${alimentos.preTreino.join("\n- ")}

19:00 - Pós-treino
- ${alimentos.posTreino.join("\n- ")}

21:00 - Jantar
- ${alimentos.jantar.join("\n- ")}

22:30 - Ceia
- ${alimentos.ceia.join("\n- ")}

========================
⚠️ Observação importante
========================
Este plano é uma referência educativa para organização alimentar.
As quantidades são estimativas gerais.
Para dieta exata, exames, restrições, doenças ou suplementação, procure um nutricionista.
`;
}

function getAlimentos(objetivo, preferencia, orcamento) {
    const planos = {
        hipertrofia: {
            economico: {
                cafe: ["3 ovos", "60g de aveia", "1 banana", "250ml de leite"],
                lancheManha: ["1 banana", "30g de amendoim"],
                almoco: ["200g de arroz", "150g de feijão", "180g de frango coxa/sobrecoxa", "Salada à vontade"],
                preTreino: ["150g de macarrão ou batata-doce", "2 ovos"],
                posTreino: ["200g de arroz", "180g de frango"],
                jantar: ["150g de arroz", "150g de feijão", "150g de frango ou 3 ovos"],
                ceia: ["250ml de leite", "40g de aveia"]
            },
            padrao: {
                cafe: ["3 ovos", "70g de aveia", "1 banana", "30g de whey protein"],
                lancheManha: ["170g de iogurte natural", "30g de castanhas"],
                almoco: ["200g de arroz", "120g de feijão", "200g de peito de frango", "150g de legumes"],
                preTreino: ["200g de batata-doce", "1 banana"],
                posTreino: ["30g de whey protein", "150g de arroz ou batata-doce"],
                jantar: ["180g de carne magra", "150g de arroz", "150g de legumes"],
                ceia: ["170g de iogurte natural", "25g de pasta de amendoim"]
            }
        },

        emagrecimento: {
            economico: {
                cafe: ["2 ovos", "1 banana", "Café sem açúcar"],
                lancheManha: ["1 fruta"],
                almoco: ["100g de arroz", "80g de feijão", "150g de frango", "Salada à vontade"],
                preTreino: ["1 banana ou 80g de batata-doce"],
                posTreino: ["150g de frango", "150g de legumes"],
                jantar: ["2 ovos", "100g de couve ou repolho", "100g de legumes"],
                ceia: ["Chá sem açúcar ou 170g de iogurte natural"]
            },
            padrao: {
                cafe: ["2 ovos", "40g de aveia", "1 fruta"],
                lancheManha: ["170g de iogurte natural"],
                almoco: ["120g de arroz integral", "160g de frango ou peixe", "Salada à vontade"],
                preTreino: ["100g de batata-doce"],
                posTreino: ["150g de peixe ou frango", "150g de legumes"],
                jantar: ["150g de proteína magra", "Salada à vontade", "150g de legumes"],
                ceia: ["170g de iogurte natural ou chá sem açúcar"]
            }
        },

        manutencao: {
            economico: {
                cafe: ["2 ovos", "40g de aveia", "1 banana"],
                lancheManha: ["1 fruta", "20g de amendoim"],
                almoco: ["150g de arroz", "120g de feijão", "150g de frango", "120g de legumes"],
                preTreino: ["1 banana", "30g de aveia"],
                posTreino: ["120g de arroz", "150g de frango ou 2 ovos"],
                jantar: ["120g de arroz", "100g de feijão", "150g de proteína"],
                ceia: ["250ml de leite ou 1 fruta"]
            },
            padrao: {
                cafe: ["2 ovos", "50g de aveia", "1 fruta", "170g de iogurte natural"],
                lancheManha: ["25g de castanhas", "1 fruta"],
                almoco: ["150g de arroz", "100g de feijão", "150g de frango ou peixe", "150g de legumes"],
                preTreino: ["100g de batata-doce", "1 banana"],
                posTreino: ["150g de proteína", "120g de arroz"],
                jantar: ["150g de carne, frango ou peixe", "150g de legumes", "100g de arroz"],
                ceia: ["170g de iogurte natural ou 60g de queijo branco"]
            }
        }
    };

    let plano = planos[objetivo][orcamento];

    if (preferencia === "vegetariano") {
        plano = substituirPorVegetariano(plano);
    }

    if (preferencia === "pescetariano") {
        plano = substituirPorPescetariano(plano);
    }

    if (preferencia === "fit") {
        plano = substituirPorFit(plano);
    }

    return plano;
}

function substituirPorVegetariano(plano) {
    return trocarProteinas(plano, ["ovos", "lentilha", "grão-de-bico", "feijão", "iogurte natural", "queijo branco"]);
}

function substituirPorPescetariano(plano) {
    return trocarProteinas(plano, ["sardinha", "atum", "peixe", "ovos"]);
}

function substituirPorFit(plano) {
    return trocarProteinas(plano, ["frango", "ovos", "peixe", "iogurte natural"]);
}

function trocarProteinas(plano, opcoes) {
    const novoPlano = JSON.parse(JSON.stringify(plano));

    Object.keys(novoPlano).forEach(refeicao => {
        novoPlano[refeicao] = novoPlano[refeicao].map(item => {
            if (
                item.toLowerCase().includes("frango") ||
                item.toLowerCase().includes("carne") ||
                item.toLowerCase().includes("peito") ||
                item.toLowerCase().includes("proteína") ||
                item.toLowerCase().includes("peixe")
            ) {
                return item + ` (substituição possível: ${opcoes.join(", ")})`;
            }

            return item;
        });
    });

    return novoPlano;
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
    atualizarTema(document.getElementById("objetivo").value);
}

// ================= HISTÓRICO =================

function salvarHistorico(imc, classificacao, objetivo, preferencia, orcamento) {
    const historico = JSON.parse(localStorage.getItem("historicoIMC")) || [];

    historico.push({
        data: new Date().toLocaleString("pt-BR"),
        imc: Number(imc.toFixed(2)),
        classificacao,
        objetivo,
        preferencia,
        orcamento
    });

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

// ================= GRÁFICO =================

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
}

// ================= TIMER BOXE =================

let tempo = 180;
let contador = null;
let cronometroTotal = null;
let tempoTotal = 0;
let round = 1;
let maxRounds = 12;
let emDescanso = false;

function iniciarTimer() {
    clearInterval(contador);

    if (!cronometroTotal) {
        cronometroTotal = setInterval(() => {
            tempoTotal++;
            atualizarTempoTotal();
        }, 1000);
    }

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
                    clearInterval(contador);
                    clearInterval(cronometroTotal);
                    cronometroTotal = null;

                    document.getElementById("status").innerText = "🏆 TREINO FINALIZADO";
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
    clearInterval(cronometroTotal);
    cronometroTotal = null;
}

function reiniciarTimer() {
    clearInterval(contador);
    clearInterval(cronometroTotal);

    contador = null;
    cronometroTotal = null;
    tempo = 180;
    tempoTotal = 0;
    round = 1;
    emDescanso = false;

    document.getElementById("round").innerText = "🔥 ROUND 1 / 12 🔥";
    document.getElementById("status").innerText = "🥊 LUTA";
    document.getElementById("timer").innerText = "03:00";
    document.getElementById("tempoTotal").innerText = "00:00";
}

function atualizarTimerNaTela() {
    const minutos = Math.floor(tempo / 60);
    const segundos = tempo % 60;

    document.getElementById("timer").innerText =
        `${String(minutos).padStart(2, "0")}:${String(segundos).padStart(2, "0")}`;
}

function atualizarTempoTotal() {
    const minutos = Math.floor(tempoTotal / 60);
    const segundos = tempoTotal % 60;

    document.getElementById("tempoTotal").innerText =
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
