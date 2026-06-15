function valor(id) {
    const el = document.getElementById(id);
    return el ? el.value : "";
}

function numero(id) {
    const el = document.getElementById(id);
    return el ? parseFloat(el.value) || 0 : 0;
}

function atualizarTexto(id, texto) {
    const el = document.getElementById(id);
    if (el) el.innerText = texto;
}

function preencherCampo(id, valorCampo) {
    const campo = document.getElementById(id);
    if (campo && valorCampo !== undefined && valorCampo !== null) {
        campo.value = valorCampo;
    }
}

/* ============================
   PREMIUM
============================ */

function premiumAtivo() {
    return localStorage.getItem("premiumAtivo") === "sim";
}

function verificarPremium() {
    const status = document.getElementById("statusPremium");
    const ativo = premiumAtivo();

    if (status) {
        status.innerHTML = ativo
            ? "<p>✅ Premium ativo. Avaliação completa, histórico e área do treinador liberados.</p>"
            : "<p>🔒 Premium não ativo. Use o código enviado após pagamento.</p>";
    }

    carregarAlunos();
    carregarHistoricoAvaliacoes();
}

function ativarPremium() {
    const codigo = prompt("Digite o código Premium:");

    if (codigo === "BOXTIMER2026") {
        localStorage.setItem("premiumAtivo", "sim");
        verificarPremium();
        alert("Premium ativado com sucesso!");
    } else {
        alert("Código inválido.");
    }
}

function desativarPremium() {
    localStorage.removeItem("premiumAtivo");
    verificarPremium();
    alert("Premium desativado.");
}

function exigirPremium() {
    if (!premiumAtivo()) {
        alert("Recurso Premium. Ative o Premium para usar esta função.");
        return false;
    }

    return true;
}

/* ============================
   CADASTRO
============================ */

let cadastro = JSON.parse(localStorage.getItem("cadastroAtleta")) || {};

async function salvarCadastro() {
    cadastro = {
        nome: valor("nome"),
        idade: valor("idade"),
        sexo: valor("sexo"),
        peso: valor("peso"),
        altura: valor("altura"),
        cidade: valor("cidade"),
        objetivo: valor("objetivo"),
        modalidade: valor("modalidade"),
        restricoes: valor("restricoes"),
        lesoes: valor("lesoes"),
        medicamentos: valor("medicamentos"),
        historico: valor("historico"),
        preferencias: valor("preferencias"),
        horarioAcorda: valor("horarioAcorda"),
        horarioDorme: valor("horarioDorme"),
        refeicoesDia: valor("refeicoesDia"),
        aguaAtual: valor("aguaAtual"),
        data: new Date().toLocaleString("pt-BR")
    };
localStorage.setItem("cadastroAtleta", JSON.stringify(cadastro));

    try {
        await db.collection("cadastros").add(cadastro);
        alert("Cadastro salvo no aparelho e no Firebase!");
    } catch (erro) {
        console.error("Erro ao salvar cadastro no Firebase:", erro);
        alert("Cadastro salvo no aparelho, mas não foi para o Firebase.");
    }

    carregarCadastro();
}


function carregarCadastro() {
    const area = document.getElementById("cadastroSalvo");
    if (!area) return;

    if (!cadastro.nome) {
        area.innerHTML = "<p>Nenhum cadastro salvo ainda.</p>";
        return;
    }

    Object.keys(cadastro).forEach(campo => preencherCampo(campo, cadastro[campo]));

    area.innerHTML = `
        <div class="perfil-box">
            <h3>👤 ${cadastro.nome}</h3>
            <p><strong>Idade:</strong> ${cadastro.idade || "Não informada"}</p>
            <p><strong>Peso:</strong> ${cadastro.peso || "Não informado"} kg</p>
            <p><strong>Altura:</strong> ${cadastro.altura || "Não informada"} m</p>
            <p><strong>Objetivo:</strong> ${formatarObjetivo(cadastro.objetivo)}</p>
            <p><strong>Modalidade:</strong> ${cadastro.modalidade || "Não informada"}</p>
        </div>
    `;
}

/* ============================
   TERMO
============================ */

function aceitarTermo() {
    const aceite = document.getElementById("aceiteTermo");
    const status = document.getElementById("statusTermo");

    if (!aceite || !aceite.checked) {
        alert("Você precisa aceitar o termo para continuar.");
        return;
    }

    localStorage.setItem("termoAceito", "sim");

    if (status) {
        status.innerHTML = "<p>✅ Termo aceito com sucesso.</p>";
    }
}

function carregarTermo() {
    const status = document.getElementById("statusTermo");
    const aceite = document.getElementById("aceiteTermo");

    if (localStorage.getItem("termoAceito") === "sim") {
        if (aceite) aceite.checked = true;
        if (status) status.innerHTML = "<p>✅ Termo já aceito.</p>";
    }
}

/* ============================
   AVALIAÇÃO PREMIUM
============================ */

let ultimaAvaliacao = null;

function gerarAvaliacao() {
    if (!exigirPremium()) return;

    const nome = valor("nome") || cadastro.nome || "Atleta";
    const idade = numero("idade");
    const sexo = valor("sexo");
    const altura = numero("altura");
    const peso = numero("peso");
    const objetivo = valor("objetivo");
    const frequencia = numero("frequencia");
    const orcamento = valor("orcamento");

    if (!idade || !altura || !peso || !sexo || !objetivo) {
        alert("Preencha cadastro com idade, sexo, altura, peso e objetivo.");
        return;
    }

    const metodo = document.querySelector('input[name="metodoAvaliacao"]:checked')?.value || "Bioimpedância";
    const imc = peso / (altura * altura);

    let classificacaoIMC = "";
    if (imc < 18.5) classificacaoIMC = "Abaixo do peso";
    else if (imc < 25) classificacaoIMC = "Peso normal";
    else if (imc < 30) classificacaoIMC = "Sobrepeso";
    else classificacaoIMC = "Obesidade";

    let tmb = sexo === "masculino"
        ? 10 * peso + 6.25 * (altura * 100) - 5 * idade + 5
        : 10 * peso + 6.25 * (altura * 100) - 5 * idade - 161;

    const tmbBio = numero("tmbBio");
    if (tmbBio > 0) tmb = tmbBio;

    let fatorAtividade = 1.2;
    if (frequencia >= 1 && frequencia <= 2) fatorAtividade = 1.375;
    if (frequencia >= 3 && frequencia <= 4) fatorAtividade = 1.55;
    if (frequencia >= 5 && frequencia <= 6) fatorAtividade = 1.725;
    if (frequencia >= 7) fatorAtividade = 1.9;

    const gastoDiario = tmb * fatorAtividade;

    let caloriasMeta = gastoDiario;
    if (objetivo === "hipertrofia") caloriasMeta += 300;
    if (objetivo === "emagrecimento") caloriasMeta -= 400;
    if (objetivo === "performance") caloriasMeta += 150;

    let proteinas = objetivo === "emagrecimento" ? peso * 2.2 : objetivo === "performance" ? peso * 1.8 : peso * 2.0;
    let gorduras = objetivo === "emagrecimento" ? peso * 0.8 : peso * 0.9;

    let carboidratos = (caloriasMeta - ((proteinas * 4) + (gorduras * 9))) / 4;
    if (carboidratos < 0) carboidratos = 0;

    const aguaRecomendada = peso * 35 / 1000;

    const somaDobras =
        numero("peitoral") +
        numero("abdomen") +
        numero("coxa") +
        numero("triceps") +
        numero("subescapular") +
        numero("suprailiaca") +
        numero("panturrilha");

    const avaliacaoDobras = somaDobras > 0
        ? `Soma das dobras: ${somaDobras.toFixed(1)} mm. Método selecionado: ${metodo}.`
        : "Dobras não informadas.";

    ultimaAvaliacao = {
        id: Date.now(),
        data: new Date().toLocaleString("pt-BR"),
        nome,
        idade,
        sexo,
        peso,
        altura,
        objetivo,
        modalidade: valor("modalidade") || cadastro.modalidade || "Não informada",
        metodo,
        imc: imc.toFixed(2),
        classificacaoIMC,
        tmb: Math.round(tmb),
        gastoDiario: Math.round(gastoDiario),
        caloriasMeta: Math.round(caloriasMeta),
        proteinas: Math.round(proteinas),
        carboidratos: Math.round(carboidratos),
        gorduras: Math.round(gorduras),
        aguaRecomendada: aguaRecomendada.toFixed(1),
        metaGordura: numero("metaGordura"),
        gordura: numero("gordura"),
        musculoEsqueletico: numero("musculoEsqueletico"),
        idadeCorporal: numero("idadeCorporal"),
        gorduraVisceral: numero("gorduraVisceral"),
        aguaCorporal: numero("aguaCorporal"),
        massaMuscular: numero("massaMuscular"),
        massaOssea: numero("massaOssea"),
        massaMagra: numero("massaMagra"),
        massaGorda: numero("massaGorda"),
        somaDobras: somaDobras.toFixed(1)
    };

    const resultado = document.getElementById("resultadoAvaliacao");

    if (resultado) {
        resultado.innerHTML = `
            <h3>👤 Resumo do Atleta</h3>
            <p><strong>Nome:</strong> ${nome}</p>
            <p><strong>Objetivo:</strong> ${formatarObjetivo(objetivo)}</p>
            <p><strong>Modalidade:</strong> ${ultimaAvaliacao.modalidade}</p>
            <p><strong>Método de avaliação:</strong> ${metodo}</p>
            <p><strong>IMC:</strong> ${imc.toFixed(2)} - ${classificacaoIMC}</p>

            <h3>⚖️ Avaliação Corporal</h3>
            <p><strong>TMB:</strong> ${Math.round(tmb)} kcal</p>
            <p><strong>Gasto diário estimado:</strong> ${Math.round(gastoDiario)} kcal</p>
            <p><strong>Meta calórica:</strong> ${Math.round(caloriasMeta)} kcal</p>
            <p><strong>Meta de gordura:</strong> ${numero("metaGordura") || "não informada"}%</p>
            <p><strong>Gordura corporal:</strong> ${numero("gordura") || "não informada"}%</p>
            <p><strong>Músculo esquelético:</strong> ${numero("musculoEsqueletico") || "não informado"}%</p>
            <p><strong>Idade corporal:</strong> ${numero("idadeCorporal") || "não informada"} anos</p>
            <p><strong>Gordura visceral:</strong> ${numero("gorduraVisceral") || "não informada"}</p>
            <p><strong>Água corporal:</strong> ${numero("aguaCorporal") || "não informada"}%</p>
            <p><strong>Massa muscular:</strong> ${numero("massaMuscular") || "não informada"} kg</p>
            <p><strong>Massa óssea:</strong> ${numero("massaOssea") || "não informada"} kg</p>
            <p><strong>Massa magra:</strong> ${numero("massaMagra") || "não informada"} kg</p>
            <p><strong>Massa gorda:</strong> ${numero("massaGorda") || "não informada"} kg</p>
            <p><strong>Dobras cutâneas:</strong> ${avaliacaoDobras}</p>

            <h3>🥩 Macronutrientes</h3>
            <p><strong>Proteínas:</strong> ${Math.round(proteinas)}g/dia</p>
            <p><strong>Carboidratos:</strong> ${Math.round(carboidratos)}g/dia</p>
            <p><strong>Gorduras:</strong> ${Math.round(gorduras)}g/dia</p>
            <p><strong>Água recomendada:</strong> ${aguaRecomendada.toFixed(1)} litros/dia</p>

            <h3>🍽️ Plano Alimentar Premium</h3>
            ${gerarPlanoAlimentar(objetivo, orcamento)}

            <h3>🥊 Pré-Treino</h3>
            <p>${estrategiaPreTreino(objetivo)}</p>

            <h3>💪 Pós-Treino</h3>
            <p>${estrategiaPosTreino(objetivo)}</p>

            <h3>💊 Suplementação Opcional</h3>
            <p>Creatina, whey protein, cafeína e eletrólitos podem ser úteis conforme rotina, tolerância e orientação profissional.</p>

            <h3>⚠️ Alerta</h3>
            <p>Esta avaliação é educativa e não substitui nutricionista, médico ou avaliação presencial.</p>
        `;
    }
}

async function salvarAvaliacaoHistorico() {
    if (!exigirPremium()) return;

    if (!ultimaAvaliacao) {
        alert("Gere uma avaliação antes de salvar no histórico.");
        return;
    }

    let historico = JSON.parse(localStorage.getItem("historicoAvaliacoes")) || [];
    historico.unshift(ultimaAvaliacao);

    localStorage.setItem("historicoAvaliacoes", JSON.stringify(historico));

    try {
        await db.collection("avaliacoes").add(ultimaAvaliacao);
        alert("Avaliação salva no aparelho e no Firebase!");
    } catch (erro) {
        console.error("Erro ao salvar avaliação no Firebase:", erro);
        alert("Avaliação salva no aparelho, mas não foi para o Firebase.");
    }

    carregarHistoricoAvaliacoes();
}

function carregarHistoricoAvaliacoes() {
    const area = document.getElementById("listaHistoricoAvaliacoes");
    if (!area) return;

    if (!premiumAtivo()) {
        area.innerHTML = "<p>🔒 Histórico disponível apenas no Premium.</p>";
        return;
    }

    const historico = JSON.parse(localStorage.getItem("historicoAvaliacoes")) || [];

    if (historico.length === 0) {
        area.innerHTML = "<p>Nenhuma avaliação salva ainda.</p>";
        return;
    }

    area.innerHTML = historico.map(av => `
        <div class="post">
            <h3>📊 ${av.nome}</h3>
            <small>${av.data}</small>
            <p><strong>Peso:</strong> ${av.peso} kg</p>
            <p><strong>IMC:</strong> ${av.imc} - ${av.classificacaoIMC}</p>
            <p><strong>Gordura:</strong> ${av.gordura || "não informada"}%</p>
            <p><strong>Massa muscular:</strong> ${av.massaMuscular || "não informada"} kg</p>
            <p><strong>Meta calórica:</strong> ${av.caloriasMeta} kcal</p>
            <p><strong>Proteínas:</strong> ${av.proteinas}g</p>
            <p><strong>Carboidratos:</strong> ${av.carboidratos}g</p>
            <p><strong>Gorduras:</strong> ${av.gorduras}g</p>
            <button class="btn-excluir" onclick="excluirAvaliacaoHistorico(${av.id})">🗑️ Excluir Avaliação</button>
        </div>
    `).join("");
}

function excluirAvaliacaoHistorico(id) {
    if (!confirm("Deseja excluir esta avaliação do histórico?")) return;

    let historico = JSON.parse(localStorage.getItem("historicoAvaliacoes")) || [];
    historico = historico.filter(av => av.id !== id);

    localStorage.setItem("historicoAvaliacoes", JSON.stringify(historico));
    carregarHistoricoAvaliacoes();
}

function limparHistoricoAvaliacoes() {
    if (!exigirPremium()) return;

    if (!confirm("Deseja apagar todo o histórico de avaliações?")) return;

    localStorage.removeItem("historicoAvaliacoes");
    carregarHistoricoAvaliacoes();
    alert("Histórico apagado.");
}

/* ============================
   PLANO ALIMENTAR
============================ */

function gerarPlanoAlimentar(objetivo, orcamento) {
    const preferencias = valor("preferencias").toLowerCase();
    const restricoes = valor("restricoes").toLowerCase();

    const semLactose = restricoes.includes("lactose");
    const vegetariano = restricoes.includes("vegetariano") || preferencias.includes("vegetariano");
    const vegano = restricoes.includes("vegano") || preferencias.includes("vegano");
    const semGluten = restricoes.includes("glúten") || restricoes.includes("gluten");

    let proteinas = vegetariano || vegano
        ? "ovos, tofu, lentilha, grão-de-bico, feijão e proteína vegetal"
        : "frango, ovos, patinho, peixe, sardinha e atum";

    if (vegano) {
        proteinas = "tofu, lentilha, grão-de-bico, feijão, ervilha, soja e proteína vegetal";
    }

    if (orcamento === "economico") {
        proteinas = vegetariano || vegano
            ? "feijão, lentilha, grão-de-bico, soja e tofu"
            : "ovos, frango, sardinha, fígado, patinho e atum";
    }

    const carboidratos = semGluten
        ? "arroz, batata-doce, mandioca, frutas, tapioca e aveia sem glúten"
        : "arroz, feijão, batata-doce, banana, aveia, pão integral e macarrão";

    const lacteos = semLactose || vegano
        ? "bebida vegetal, iogurte sem lactose ou proteína vegetal"
        : "iogurte natural, leite, queijo branco ou whey protein";

    if (objetivo === "hipertrofia") {
        return `
            <ul>
                <li><strong>Café:</strong> 3 ovos ou tofu mexido, 60g de aveia, 1 banana.</li>
                <li><strong>Lanche:</strong> ${lacteos} com fruta.</li>
                <li><strong>Almoço:</strong> 150g de arroz, 100g de feijão, 180g de ${proteinas}, salada e azeite.</li>
                <li><strong>Pré-treino:</strong> banana com aveia, tapioca ou pão sem glúten se necessário.</li>
                <li><strong>Pós-treino:</strong> 180g de ${proteinas} + ${carboidratos}.</li>
                <li><strong>Jantar:</strong> ${proteinas} com ${carboidratos} e legumes.</li>
            </ul>`;
    }

    if (objetivo === "emagrecimento") {
        return `
            <ul>
                <li><strong>Café:</strong> 2 ovos ou tofu, fruta e café sem açúcar.</li>
                <li><strong>Lanche:</strong> ${semLactose ? "fruta ou castanhas" : lacteos}.</li>
                <li><strong>Almoço:</strong> 100g de arroz, 80g de feijão, 160g de ${proteinas} e bastante salada.</li>
                <li><strong>Pré-treino:</strong> fruta ou pequena porção de ${carboidratos}.</li>
                <li><strong>Pós-treino:</strong> ${proteinas} com legumes.</li>
                <li><strong>Jantar:</strong> proteína magra ou vegetal com salada e legumes.</li>
            </ul>`;
    }

    return `
        <ul>
            <li><strong>Café:</strong> ovos/tofu, fruta e aveia.</li>
            <li><strong>Lanche:</strong> fruta, castanhas ou ${lacteos}.</li>
            <li><strong>Almoço:</strong> arroz, feijão, ${proteinas} e salada.</li>
            <li><strong>Pré-treino:</strong> banana, tapioca ou carboidrato leve.</li>
            <li><strong>Pós-treino:</strong> ${proteinas} com carboidrato moderado.</li>
            <li><strong>Jantar:</strong> refeição equilibrada com legumes, proteína e carboidrato controlado.</li>
        </ul>`;
}

function estrategiaPreTreino(objetivo) {
    if (objetivo === "emagrecimento") return "Alimento leve, carboidrato moderado e boa digestão.";
    if (objetivo === "hipertrofia") return "Carboidratos e proteínas para melhorar força, volume de treino e recuperação.";
    if (objetivo === "performance") return "Carboidratos de fácil digestão, hidratação e eletrólitos.";
    return "Refeição equilibrada 60 a 90 minutos antes do treino.";
}

function estrategiaPosTreino(objetivo) {
    if (objetivo === "emagrecimento") return "Proteína suficiente para preservar massa muscular e controlar fome.";
    if (objetivo === "hipertrofia") return "Proteína e carboidrato para recuperação e síntese muscular.";
    if (objetivo === "performance") return "Reposição de carboidratos, proteínas, líquidos e eletrólitos.";
    return "Proteína magra e carboidrato de qualidade após o treino.";
}

function formatarObjetivo(objetivo) {
    if (objetivo === "hipertrofia") return "Hipertrofia";
    if (objetivo === "emagrecimento") return "Emagrecimento";
    if (objetivo === "performance") return "Performance";
    if (objetivo === "competicao") return "Competição";
    return "Manutenção";
}

/* ============================
   ÁREA DO TREINADOR
============================ */

let alunos = JSON.parse(localStorage.getItem("alunosTreinador")) || [];

function cadastrarAluno() {
    if (!exigirPremium()) return;

    const nome = valor("alunoNome");
    const contato = valor("alunoContato");
    const peso = numero("alunoPeso");
    const objetivo = valor("alunoObjetivo");
    const observacoes = valor("alunoObservacoes");

    if (!nome || !objetivo) {
        alert("Preencha pelo menos nome e objetivo do aluno.");
        return;
    }

    const aluno = {
        id: Date.now(),
        nome,
        contato,
        peso,
        objetivo,
        observacoes,
        data: new Date().toLocaleString("pt-BR")
    };

    alunos.unshift(aluno);
    localStorage.setItem("alunosTreinador", JSON.stringify(alunos));

    limparFormularioAluno();
    carregarAlunos();
    alert("Aluno cadastrado com sucesso.");
}

function limparFormularioAluno() {
    ["alunoNome", "alunoContato", "alunoPeso", "alunoObjetivo", "alunoObservacoes"].forEach(id => {
        const campo = document.getElementById(id);
        if (campo) campo.value = "";
    });
}

function carregarAlunos() {
    const area = document.getElementById("listaAlunos");
    if (!area) return;

    if (!premiumAtivo()) {
        area.innerHTML = "<p>🔒 Área do treinador disponível apenas no Premium.</p>";
        return;
    }

    if (alunos.length === 0) {
        area.innerHTML = "<p>Nenhum aluno cadastrado ainda.</p>";
        return;
    }

    area.innerHTML = alunos.map(aluno => `
        <div class="post">
            <h3>👤 ${aluno.nome}</h3>
            <small>Cadastrado em ${aluno.data}</small>
            <p><strong>Contato:</strong> ${aluno.contato || "Não informado"}</p>
            <p><strong>Peso:</strong> ${aluno.peso || "Não informado"} kg</p>
            <p><strong>Objetivo:</strong> ${formatarObjetivo(aluno.objetivo)}</p>
            <p><strong>Observações:</strong> ${aluno.observacoes || "Nenhuma"}</p>
            <button class="btn-excluir" onclick="excluirAluno(${aluno.id})">🗑️ Excluir Aluno</button>
        </div>
    `).join("");
}

function excluirAluno(id) {
    if (!confirm("Deseja excluir este aluno?")) return;

    alunos = alunos.filter(aluno => aluno.id !== id);
    localStorage.setItem("alunosTreinador", JSON.stringify(alunos));
    carregarAlunos();
}

function limparAlunos() {
    if (!exigirPremium()) return;

    if (!confirm("Deseja apagar todos os alunos cadastrados?")) return;

    alunos = [];
    localStorage.removeItem("alunosTreinador");
    carregarAlunos();
    alert("Todos os alunos foram removidos.");
}

/* ============================
   TIMER
============================ */

let timerInterval = null;
let tempoAtual = 180;
let roundAtualNumero = 1;
let emDescanso = false;
let timerRodando = false;

function atualizarDisplayTimer() {
    const minutos = Math.floor(tempoAtual / 60);
    const segundos = tempoAtual % 60;

    atualizarTexto("timerDisplay", `${String(minutos).padStart(2, "0")}:${String(segundos).padStart(2, "0")}`);
    atualizarTexto("roundAtual", emDescanso ? `Descanso após Round ${roundAtualNumero}` : `Round ${roundAtualNumero}`);
    atualizarTexto("timerStatus", emDescanso ? "Descanso" : "Round em andamento");
}

function iniciarTimer() {
    if (timerRodando) return;

    const totalRounds = numero("totalRoundsConfig") || 12;
    const tempoRound = numero("tempoRoundConfig") || 180;
    const tempoDescanso = numero("tempoDescansoConfig") || 60;

    if (tempoAtual <= 0) tempoAtual = tempoRound;

    timerRodando = true;

    timerInterval = setInterval(() => {
        tempoAtual--;
        atualizarDisplayTimer();

        if (tempoAtual <= 0) {
            tocarCampainha();

            if (!emDescanso) {
                if (roundAtualNumero >= totalRounds) {
                    finalizarTimer();
                    return;
                }

                emDescanso = true;
                tempoAtual = tempoDescanso;
            } else {
                emDescanso = false;
                roundAtualNumero++;
                tempoAtual = tempoRound;
            }

            atualizarDisplayTimer();
        }
    }, 1000);
}

function pausarTimer() {
    clearInterval(timerInterval);
    timerRodando = false;
    atualizarTexto("timerStatus", "Pausado");
}

function reiniciarTimer() {
    clearInterval(timerInterval);
    tempoAtual = numero("tempoRoundConfig") || 180;
    roundAtualNumero = 1;
    emDescanso = false;
    timerRodando = false;
    atualizarDisplayTimer();
    atualizarTexto("timerStatus", "Pronto");
}

function finalizarTimer() {
    clearInterval(timerInterval);
    timerRodando = false;
    atualizarTexto("timerStatus", "Treino finalizado");
    atualizarTexto("roundAtual", "Todos os rounds concluídos");
    tocarCampainha();
}

function tocarCampainha() {
    try {
        const audio = new Audio("https://actions.google.com/sounds/v1/alarms/beep_short.ogg");
        audio.play();
    } catch (e) {
        console.log("Campainha não disponível.");
    }
}

/* ============================
   ATIVIDADES E FEED
============================ */

let atividades = JSON.parse(localStorage.getItem("atividadesBoxTimer")) || [];

function publicarAtividade() {
    const nome = valor("atividadeNome") || cadastro.nome || "Atleta";
    const tipo = valor("tipoAtividade");
    const distancia = numero("distancia");
    const tempo = numero("tempo");
    const calorias = numero("calorias");
    const rounds = numero("rounds");
    const golpes = numero("golpes");
    const carga = valor("carga");
    const comentario = valor("comentarioAtividade");
    const fotoInput = document.getElementById("fotoAtividade");

    if (!tipo || !tempo) {
        alert("Preencha pelo menos tipo de atividade e tempo.");
        return;
    }

    const arquivo = fotoInput ? fotoInput.files[0] : null;

    if (arquivo) {
        const reader = new FileReader();
        reader.onload = e => salvarAtividade(nome, tipo, distancia, tempo, calorias, rounds, golpes, carga, comentario, e.target.result);
        reader.readAsDataURL(arquivo);
    } else {
        salvarAtividade(nome, tipo, distancia, tempo, calorias, rounds, golpes, carga, comentario, "");
    }
}

function salvarAtividade(nome, tipo, distancia, tempo, calorias, rounds, golpes, carga, comentario, foto) {
    atividades.unshift({
        id: Date.now(),
        nome,
        tipo,
        distancia,
        tempo,
        calorias,
        rounds,
        golpes,
        carga,
        comentario,
        foto,
        curtidas: 0,
        comentarios: [],
        data: new Date().toLocaleString("pt-BR")
    });

    localStorage.setItem("atividadesBoxTimer", JSON.stringify(atividades));
    carregarFeed();
    atualizarDashboard();
}

function carregarFeed() {
    const feed = document.getElementById("feedAtividades");
    if (!feed) return;

    feed.innerHTML = "";

    if (atividades.length === 0) {
        feed.innerHTML = "<p>Nenhuma atividade publicada ainda.</p>";
        return;
    }

    atividades.forEach(a => {
        feed.innerHTML += `
            <div class="post">
                <h3>👤 ${a.nome}</h3>
                <small>📅 ${a.data}</small>
                <p><strong>Atividade:</strong> ${a.tipo}</p>
                ${a.distancia ? `<p><strong>Distância:</strong> ${a.distancia} km</p>` : ""}
                <p><strong>Tempo:</strong> ${a.tempo} min</p>
                ${a.calorias ? `<p><strong>Calorias:</strong> ${a.calorias} kcal</p>` : ""}
                ${a.rounds ? `<p><strong>Rounds:</strong> ${a.rounds}</p>` : ""}
                ${a.golpes ? `<p><strong>Golpes:</strong> ${a.golpes}</p>` : ""}
                ${a.carga ? `<p><strong>Carga/Séries:</strong> ${a.carga}</p>` : ""}
                ${a.comentario ? `<p>${a.comentario}</p>` : ""}
                ${a.foto ? `<img src="${a.foto}" class="foto-post">` : ""}

                <button onclick="curtirAtividade(${a.id})">❤️ Curtir (${a.curtidas})</button>

                <div class="area-comentarios">
                    <input id="nomeComentario-${a.id}" placeholder="Seu nome">
                    <input id="textoComentario-${a.id}" placeholder="Comentário">
                    <button onclick="comentarAtividade(${a.id})">💬 Comentar</button>
                    ${(a.comentarios || []).map(c => `<div class="comentario"><strong>${c.nome}:</strong> ${c.texto}</div>`).join("")}
                </div>

                <button class="btn-excluir" onclick="excluirAtividade(${a.id})">🗑️ Excluir atividade</button>
            </div>
        `;
    });
}

function curtirAtividade(id) {
    atividades = atividades.map(a => {
        if (a.id === id) a.curtidas++;
        return a;
    });

    localStorage.setItem("atividadesBoxTimer", JSON.stringify(atividades));
    carregarFeed();
}

function comentarAtividade(id) {
    const nome = valor(`nomeComentario-${id}`) || "Usuário";
    const texto = valor(`textoComentario-${id}`);

    if (!texto.trim()) {
        alert("Digite um comentário.");
        return;
    }

    atividades = atividades.map(a => {
        if (a.id === id) a.comentarios.push({ nome, texto });
        return a;
    });

    localStorage.setItem("atividadesBoxTimer", JSON.stringify(atividades));
    carregarFeed();
}

function excluirAtividade(id) {
    if (!confirm("Deseja excluir esta atividade?")) return;

    atividades = atividades.filter(a => a.id !== id);
    localStorage.setItem("atividadesBoxTimer", JSON.stringify(atividades));
    carregarFeed();
    atualizarDashboard();
}

/* ============================
   EVENTOS
============================ */

let eventos = JSON.parse(localStorage.getItem("eventosBoxTimer")) || [];

function criarEvento() {
    const organizador = valor("eventoOrganizador") || "Organizador";
    const tipo = valor("eventoTipo");
    const data = valor("eventoData");
    const hora = valor("eventoHora");
    const local = valor("eventoLocal");
    const max = numero("eventoMax");
    const descricao = valor("eventoDescricao");

    if (!tipo || !data || !hora || !local) {
        alert("Preencha tipo, data, hora e local.");
        return;
    }

    eventos.unshift({
        id: Date.now(),
        organizador,
        tipo,
        data,
        hora,
        local,
        max,
        descricao,
        participantes: []
    });

    localStorage.setItem("eventosBoxTimer", JSON.stringify(eventos));
    carregarEventos();
}

function carregarEventos() {
    const lista = document.getElementById("listaEventos");
    if (!lista) return;

    lista.innerHTML = "";

    if (eventos.length === 0) {
        lista.innerHTML = "<p>Nenhum evento criado ainda.</p>";
        return;
    }

    eventos.forEach(e => {
        lista.innerHTML += `
            <div class="evento">
                <h3>📅 ${e.tipo}</h3>
                <p><strong>Organizador:</strong> ${e.organizador}</p>
                <p><strong>Data:</strong> ${e.data} às ${e.hora}</p>
                <p><strong>Local:</strong> ${e.local}</p>
                ${e.max ? `<p><strong>Vagas:</strong> ${e.participantes.length}/${e.max}</p>` : ""}
                ${e.descricao ? `<p>${e.descricao}</p>` : ""}

                <input id="participante-${e.id}" placeholder="Seu nome">
                <button onclick="confirmarPresenca(${e.id})">✅ Confirmar presença</button>

                <h4>Participantes</h4>
                <ul>${e.participantes.length ? e.participantes.map(p => `<li>${p}</li>`).join("") : "<li>Nenhum participante confirmado</li>"}</ul>

                <button class="btn-excluir" onclick="excluirEvento(${e.id})">🗑️ Excluir evento</button>
            </div>
        `;
    });
}

function confirmarPresenca(id) {
    const nome = valor(`participante-${id}`);

    if (!nome.trim()) {
        alert("Digite seu nome.");
        return;
    }

    eventos = eventos.map(e => {
        if (e.id === id) {
            if (e.max && e.participantes.length >= e.max) {
                alert("Evento lotado.");
                return e;
            }

            if (!e.participantes.includes(nome)) e.participantes.push(nome);
        }

        return e;
    });

    localStorage.setItem("eventosBoxTimer", JSON.stringify(eventos));
    carregarEventos();
}

function excluirEvento(id) {
    if (!confirm("Deseja excluir este evento?")) return;

    eventos = eventos.filter(e => e.id !== id);
    localStorage.setItem("eventosBoxTimer", JSON.stringify(eventos));
    carregarEventos();
}

function limparTodasInscricoes() {
    if (!confirm("Deseja remover todos os participantes inscritos nos eventos?")) return;

    eventos = eventos.map(e => {
        e.participantes = [];
        return e;
    });

    localStorage.setItem("eventosBoxTimer", JSON.stringify(eventos));
    carregarEventos();
    alert("Todas as inscrições foram removidas.");
}

function excluirTodosEventos() {
    if (!confirm("Deseja excluir todos os eventos criados?")) return;

    eventos = [];
    localStorage.removeItem("eventosBoxTimer");
    carregarEventos();
    alert("Todos os eventos foram excluídos.");
}

/* ============================
   DASHBOARD
============================ */

function atualizarDashboard() {
    const totalTreinos = atividades.length;
    const totalMinutos = atividades.reduce((soma, item) => soma + (Number(item.tempo) || 0), 0);
    const totalHoras = totalMinutos / 60;
    const totalKm = atividades.reduce((soma, item) => soma + (Number(item.distancia) || 0), 0);
    const totalRounds = atividades.reduce((soma, item) => soma + (Number(item.rounds) || 0), 0);

    atualizarTexto("totalTreinos", totalTreinos);
    atualizarTexto("totalHoras", `${totalHoras.toFixed(1)}h`);
    atualizarTexto("totalKm", `${totalKm.toFixed(1)} km`);
    atualizarTexto("totalRounds", totalRounds);

    gerarConquistas(totalTreinos, totalKm, totalRounds);
}

function gerarConquistas(totalTreinos, totalKm, totalRounds) {
    const area = document.getElementById("conquistas");
    if (!area) return;

    let conquistas = [];

    if (totalTreinos >= 1) conquistas.push("🏅 Primeiro treino");
    if (totalTreinos >= 10) conquistas.push("🥉 10 treinos");
    if (totalTreinos >= 50) conquistas.push("🥈 50 treinos");
    if (totalTreinos >= 100) conquistas.push("🥇 100 treinos");
    if (totalKm >= 10) conquistas.push("🏃 10 km");
    if (totalKm >= 50) conquistas.push("🔥 50 km");
    if (totalKm >= 100) conquistas.push("🚀 100 km");
    if (totalRounds >= 50) conquistas.push("🥊 50 rounds");
    if (totalRounds >= 500) conquistas.push("👑 500 rounds");

    area.innerHTML = conquistas.length
        ? conquistas.map(c => `<span class="badge">${c}</span>`).join("")
        : "<p>Nenhuma conquista desbloqueada ainda.</p>";
}

/* ============================
   SATISFAÇÃO
============================ */

function salvarSatisfacao() {
    const nota = valor("notaApp");
    const avaliacao = valor("avaliacaoApp");

    if (!nota || !avaliacao.trim()) {
        alert("Preencha a nota e o comentário.");
        return;
    }

    const dados = {
        nota,
        avaliacao,
        data: new Date().toLocaleString("pt-BR")
    };

    localStorage.setItem("satisfacaoBoxTimer", JSON.stringify(dados));

    const area = document.getElementById("resultadoSatisfacao");
    if (area) area.innerHTML = `<p>✅ Obrigado pela avaliação: ${nota}</p>`;
}

/* ============================
   BACKUP DOS DADOS
============================ */

function exportarBackup() {
    const dados = {
        cadastro: JSON.parse(localStorage.getItem("cadastroAtleta")) || null,
        alunos: JSON.parse(localStorage.getItem("alunosTreinador")) || [],
        historicoAvaliacoes: JSON.parse(localStorage.getItem("historicoAvaliacoes")) || [],
        atividades: JSON.parse(localStorage.getItem("atividadesBoxTimer")) || [],
        eventos: JSON.parse(localStorage.getItem("eventosBoxTimer")) || [],
        satisfacao: JSON.parse(localStorage.getItem("satisfacaoBoxTimer")) || null,
        premiumAtivo: localStorage.getItem("premiumAtivo") || "nao"
    };

    const blob = new Blob(
        [JSON.stringify(dados, null, 2)],
        { type: "application/json" }
    );

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "backup-boxtimer-pro.json";
    link.click();
}

/* ============================
   INICIALIZAÇÃO
============================ */

document.addEventListener("DOMContentLoaded", () => {
    carregarCadastro();
    carregarTermo();
    reiniciarTimer();
    carregarFeed();
    carregarEventos();
    atualizarDashboard();
    verificarPremium();

    setTimeout(() => {
        carregarAlunos();
        carregarHistoricoAvaliacoes();
    }, 500);
});

window.testarFirebase = function () {
    db.collection("avaliacoes").add({
        nome: "Teste BoxTimer Pro",
        data: new Date().toLocaleString("pt-BR")
    })
    .then(() => {
        alert("Firebase funcionando!");
    })
    .catch((erro) => {
        console.error("Erro ao salvar no Firebase:", erro);
        alert("Erro ao salvar no Firebase.");
    });
};
