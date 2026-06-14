function valor(id) {
    const el = document.getElementById(id);
    return el ? el.value : "";
}

function numero(id) {
    const el = document.getElementById(id);
    return el ? parseFloat(el.value) || 0 : 0;
}

/* ============================
   PERFIL DO ATLETA
============================ */

let perfil = JSON.parse(localStorage.getItem("perfilAtleta")) || {};

function salvarPerfil() {
    perfil = {
        nome: valor("perfilNome"),
        cidade: valor("perfilCidade"),
        idade: valor("perfilIdade"),
        peso: valor("perfilPeso"),
        modalidade: valor("perfilModalidade"),
        objetivo: valor("perfilObjetivo"),
        bio: valor("perfilBio")
    };

    localStorage.setItem("perfilAtleta", JSON.stringify(perfil));
    carregarPerfil();
}

function carregarPerfil() {
    const area = document.getElementById("perfilSalvo");
    if (!area) return;

    if (!perfil.nome) {
        area.innerHTML = "<p>Nenhum perfil salvo ainda.</p>";
        return;
    }

    area.innerHTML = `
        <div class="perfil-box">
            <h3>👤 ${perfil.nome}</h3>
            <p><strong>Cidade:</strong> ${perfil.cidade || "Não informada"}</p>
            <p><strong>Idade:</strong> ${perfil.idade || "Não informada"}</p>
            <p><strong>Peso:</strong> ${perfil.peso || "Não informado"} kg</p>
            <p><strong>Modalidade:</strong> ${perfil.modalidade || "Não informada"}</p>
            <p><strong>Objetivo:</strong> ${perfil.objetivo || "Não informado"}</p>
            <p><strong>Bio:</strong> ${perfil.bio || "Sem descrição"}</p>
        </div>
    `;
}

/* ============================
   AVALIAÇÃO NUTRICIONAL
============================ */

function gerarAvaliacao() {
    const nome = valor("nome") || "Atleta";
    const idade = numero("idade");
    const sexo = valor("sexo");
    const altura = numero("altura");
    const peso = numero("peso");
    const objetivo = valor("objetivo");
    const frequencia = numero("frequencia");
    const orcamento = valor("orcamento");

    if (!idade || !altura || !peso || !sexo || !objetivo) {
        alert("Preencha idade, sexo, altura, peso e objetivo nutricional.");
        return;
    }

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

    let proteinas = 0;
    let gorduras = 0;

    if (objetivo === "hipertrofia") {
        proteinas = peso * 2.0;
        gorduras = peso * 0.9;
    } else if (objetivo === "emagrecimento") {
        proteinas = peso * 2.2;
        gorduras = peso * 0.8;
    } else if (objetivo === "performance") {
        proteinas = peso * 1.8;
        gorduras = peso * 0.9;
    } else {
        proteinas = peso * 1.8;
        gorduras = peso * 0.8;
    }

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

    let avaliacaoDobras = "Dobras não informadas.";

    if (somaDobras > 0) {
        avaliacaoDobras = `Soma das dobras: ${somaDobras.toFixed(1)} mm. Use essa medida para acompanhar evolução corporal a cada 30 dias.`;
    }

    const gordura = numero("gordura") || "não informada";
    const massaMuscular = numero("massaMuscular") || "não informada";
    const massaMagra = numero("massaMagra") || "não informada";
    const massaGorda = numero("massaGorda") || "não informada";
    const gorduraVisceral = numero("gorduraVisceral") || "não informada";

    const resultado = `
        <h3>👤 Resumo do Perfil</h3>
        <p><strong>Nome:</strong> ${nome}</p>
        <p><strong>Objetivo nutricional:</strong> ${formatarObjetivo(objetivo)}</p>
        <p><strong>IMC:</strong> ${imc.toFixed(2)} - ${classificacaoIMC}</p>

        <h3>⚖️ Avaliação Corporal</h3>
        <p><strong>TMB estimada:</strong> ${Math.round(tmb)} kcal</p>
        <p><strong>Gasto calórico diário:</strong> ${Math.round(gastoDiario)} kcal</p>
        <p><strong>Meta calórica diária:</strong> ${Math.round(caloriasMeta)} kcal</p>
        <p><strong>Gordura corporal:</strong> ${gordura}%</p>
        <p><strong>Massa muscular:</strong> ${massaMuscular} kg</p>
        <p><strong>Massa magra:</strong> ${massaMagra} kg</p>
        <p><strong>Massa gorda:</strong> ${massaGorda} kg</p>
        <p><strong>Gordura visceral:</strong> ${gorduraVisceral}</p>
        <p><strong>Dobras cutâneas:</strong> ${avaliacaoDobras}</p>

        <h3>🥩 Macronutrientes Recomendados</h3>
        <p><strong>Proteínas:</strong> ${Math.round(proteinas)}g por dia</p>
        <p><strong>Carboidratos:</strong> ${Math.round(carboidratos)}g por dia</p>
        <p><strong>Gorduras:</strong> ${Math.round(gorduras)}g por dia</p>
        <p><strong>Água:</strong> ${aguaRecomendada.toFixed(1)} litros por dia</p>

        <h3>🍽️ Plano Alimentar Diário</h3>
        ${gerarPlanoAlimentar(objetivo, orcamento)}

        <h3>🥊 Estratégia Pré-Treino</h3>
        <p>${estrategiaPreTreino(objetivo)}</p>

        <h3>💪 Estratégia Pós-Treino</h3>
        <p>${estrategiaPosTreino(objetivo)}</p>

        <h3>💊 Suplementação Opcional</h3>
        <p>Creatina, whey protein, cafeína e eletrólitos podem ser úteis dependendo da rotina, tolerância e orientação profissional.</p>

        <h3>⚠️ Alertas Importantes</h3>
        <p>Esta avaliação é uma estimativa educativa e não substitui nutricionista, médico ou avaliação presencial.</p>

        <h3>📅 Próxima Reavaliação</h3>
        <p>Recomenda-se nova avaliação a cada 30 dias com peso, medidas, bioimpedância, dobras cutâneas e desempenho nos treinos.</p>
    `;

    document.getElementById("resultadoAvaliacao").innerHTML = resultado;
}

function gerarPlanoAlimentar(objetivo, orcamento) {
    const proteinaBase = orcamento === "economico"
        ? "ovos, frango, sardinha, patinho, atum e leite"
        : "frango, peixe, patinho, ovos, iogurte natural, whey protein e cortes magros";

    const carboBase = orcamento === "economico"
        ? "arroz, feijão, batata-doce, banana, aveia e macarrão"
        : "arroz integral, batata-doce, mandioca, frutas, aveia e pão integral";

    if (objetivo === "hipertrofia") {
        return `
            <ul>
                <li><strong>Café da manhã:</strong> 3 ovos, 60g de aveia, 1 banana e café.</li>
                <li><strong>Lanche:</strong> Iogurte natural ou whey com fruta.</li>
                <li><strong>Almoço:</strong> 150g de arroz, 100g de feijão, 180g de frango, salada e azeite.</li>
                <li><strong>Pré-treino:</strong> Banana com aveia ou pão com ovos.</li>
                <li><strong>Pós-treino:</strong> 180g de proteína + carboidrato para recuperação.</li>
                <li><strong>Jantar:</strong> ${proteinaBase} com ${carboBase}.</li>
            </ul>
        `;
    }

    if (objetivo === "emagrecimento") {
        return `
            <ul>
                <li><strong>Café da manhã:</strong> 2 ovos, fruta e café sem açúcar.</li>
                <li><strong>Lanche:</strong> Iogurte natural ou fruta.</li>
                <li><strong>Almoço:</strong> 100g de arroz, 80g de feijão, 160g de frango e bastante salada.</li>
                <li><strong>Pré-treino:</strong> Fruta ou pequena porção de carboidrato.</li>
                <li><strong>Pós-treino:</strong> Proteína magra com legumes.</li>
                <li><strong>Jantar:</strong> Carne magra, ovos ou peixe com salada e legumes.</li>
            </ul>
        `;
    }

    if (objetivo === "performance") {
        return `
            <ul>
                <li><strong>Café da manhã:</strong> Ovos, aveia, banana e mel.</li>
                <li><strong>Lanche:</strong> Fruta com iogurte ou sanduíche natural.</li>
                <li><strong>Almoço:</strong> Arroz, feijão, proteína magra, legumes e salada.</li>
                <li><strong>Pré-treino:</strong> Carboidrato de fácil digestão 60 a 90 minutos antes.</li>
                <li><strong>Pós-treino:</strong> Proteína + carboidrato para recuperação muscular.</li>
                <li><strong>Jantar:</strong> Refeição completa com boa fonte de carboidrato e proteína.</li>
            </ul>
        `;
    }

    return `
        <ul>
            <li><strong>Café da manhã:</strong> Ovos, fruta e aveia.</li>
            <li><strong>Lanche:</strong> Fruta ou iogurte.</li>
            <li><strong>Almoço:</strong> Arroz, feijão, proteína magra e salada.</li>
            <li><strong>Pré-treino:</strong> Banana ou pão com ovos.</li>
            <li><strong>Pós-treino:</strong> Proteína magra com carboidrato moderado.</li>
            <li><strong>Jantar:</strong> Refeição equilibrada com legumes, proteína e carboidrato controlado.</li>
        </ul>
    `;
}

function estrategiaPreTreino(objetivo) {
    if (objetivo === "emagrecimento") return "Priorize alimento leve, com carboidrato moderado e boa digestão para manter energia sem exagerar nas calorias.";
    if (objetivo === "hipertrofia") return "Use carboidratos e proteínas antes do treino para melhorar força, volume de treino e recuperação.";
    if (objetivo === "performance") return "Priorize carboidratos de fácil digestão, hidratação adequada e eletrólitos em treinos longos ou intensos.";
    return "Mantenha uma refeição equilibrada 60 a 90 minutos antes do treino.";
}

function estrategiaPosTreino(objetivo) {
    if (objetivo === "emagrecimento") return "Consuma proteína suficiente após o treino para preservar massa muscular e controlar fome.";
    if (objetivo === "hipertrofia") return "Priorize proteína e carboidrato após o treino para recuperação, síntese muscular e reposição de energia.";
    if (objetivo === "performance") return "Reponha carboidratos, proteínas, líquidos e eletrólitos para acelerar recuperação entre sessões.";
    return "Inclua proteína magra e carboidrato de qualidade após o treino.";
}

function formatarObjetivo(objetivo) {
    if (objetivo === "hipertrofia") return "Hipertrofia";
    if (objetivo === "emagrecimento") return "Emagrecimento";
    if (objetivo === "performance") return "Performance";
    return "Manutenção";
}

/* ============================
   FEED DE ATIVIDADES
============================ */

let atividades = JSON.parse(localStorage.getItem("atividadesBoxTimer")) || [];

function publicarAtividade() {
    const nome = valor("atividadeNome") || perfil.nome || "Atleta";
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
        alert("Preencha pelo menos o tipo de atividade e o tempo.");
        return;
    }

    const arquivo = fotoInput.files[0];

    if (arquivo) {
        const reader = new FileReader();

        reader.onload = function (e) {
            salvarAtividade(nome, tipo, distancia, tempo, calorias, rounds, golpes, carga, comentario, e.target.result);
        };

        reader.readAsDataURL(arquivo);
    } else {
        salvarAtividade(nome, tipo, distancia, tempo, calorias, rounds, golpes, carga, comentario, "");
    }
}

function salvarAtividade(nome, tipo, distancia, tempo, calorias, rounds, golpes, carga, comentario, foto) {
    const atividade = {
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
    };

    atividades.unshift(atividade);
    localStorage.setItem("atividadesBoxTimer", JSON.stringify(atividades));

    limparFormularioAtividade();
    carregarFeed();
    atualizarDashboard();
}

function limparFormularioAtividade() {
    [
        "atividadeNome",
        "tipoAtividade",
        "distancia",
        "tempo",
        "calorias",
        "rounds",
        "golpes",
        "carga",
        "comentarioAtividade",
        "fotoAtividade"
    ].forEach(id => {
        const campo = document.getElementById(id);
        if (campo) campo.value = "";
    });
}

function carregarFeed() {
    const feed = document.getElementById("feedAtividades");
    if (!feed) return;

    feed.innerHTML = "";

    if (atividades.length === 0) {
        feed.innerHTML = "<p>Nenhuma atividade publicada ainda.</p>";
        return;
    }

    atividades.forEach(atividade => {
        let comentariosHTML = "";

        atividade.comentarios.forEach(comentario => {
            comentariosHTML += `
                <div class="comentario">
                    <strong>${comentario.nome}:</strong> ${comentario.texto}
                </div>
            `;
        });

        feed.innerHTML += `
            <div class="post">
                <h3>👤 ${atividade.nome}</h3>
                <small>📅 ${atividade.data}</small>

                <p><strong>🏷️ Atividade:</strong> ${atividade.tipo}</p>
                ${atividade.distancia ? `<p><strong>📍 Distância:</strong> ${atividade.distancia} km</p>` : ""}
                <p><strong>⏱️ Tempo:</strong> ${atividade.tempo} min</p>
                ${atividade.calorias ? `<p><strong>🔥 Calorias:</strong> ${atividade.calorias} kcal</p>` : ""}
                ${atividade.rounds ? `<p><strong>🥊 Rounds:</strong> ${atividade.rounds}</p>` : ""}
                ${atividade.golpes ? `<p><strong>👊 Golpes:</strong> ${atividade.golpes}</p>` : ""}
                ${atividade.carga ? `<p><strong>🏋️ Carga/Séries:</strong> ${atividade.carga}</p>` : ""}
                ${atividade.comentario ? `<p>${atividade.comentario}</p>` : ""}

                ${atividade.foto ? `<img src="${atividade.foto}" class="foto-post">` : ""}

                <button onclick="curtirAtividade(${atividade.id})">
                    ❤️ Curtir (${atividade.curtidas})
                </button>

                <div class="area-comentarios">
                    <input id="nomeComentario-${atividade.id}" placeholder="Seu nome">
                    <input id="textoComentario-${atividade.id}" placeholder="Escreva um comentário">
                    <button onclick="comentarAtividade(${atividade.id})">💬 Comentar</button>
                    ${comentariosHTML}
                </div>

                <button class="btn-excluir" onclick="excluirAtividade(${atividade.id})">
                    🗑️ Excluir atividade
                </button>
            </div>
        `;
    });
}

function curtirAtividade(id) {
    atividades = atividades.map(atividade => {
        if (atividade.id === id) atividade.curtidas++;
        return atividade;
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

    atividades = atividades.map(atividade => {
        if (atividade.id === id) {
            atividade.comentarios.push({ nome, texto });
        }
        return atividade;
    });

    localStorage.setItem("atividadesBoxTimer", JSON.stringify(atividades));
    carregarFeed();
}

function excluirAtividade(id) {
    if (!confirm("Deseja excluir esta atividade?")) return;

    atividades = atividades.filter(atividade => atividade.id !== id);
    localStorage.setItem("atividadesBoxTimer", JSON.stringify(atividades));

    carregarFeed();
    atualizarDashboard();
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

    const elTreinos = document.getElementById("totalTreinos");
    const elHoras = document.getElementById("totalHoras");
    const elKm = document.getElementById("totalKm");
    const elRounds = document.getElementById("totalRounds");

    if (elTreinos) elTreinos.innerText = totalTreinos;
    if (elHoras) elHoras.innerText = `${totalHoras.toFixed(1)}h`;
    if (elKm) elKm.innerText = `${totalKm.toFixed(1)} km`;
    if (elRounds) elRounds.innerText = totalRounds;

    gerarConquistas(totalTreinos, totalKm, totalRounds);
}

function gerarConquistas(totalTreinos, totalKm, totalRounds) {
    const area = document.getElementById("conquistas");
    if (!area) return;

    let conquistas = [];

    if (totalTreinos >= 1) conquistas.push("🏅 Primeiro treino publicado");
    if (totalTreinos >= 10) conquistas.push("🥉 10 treinos concluídos");
    if (totalTreinos >= 50) conquistas.push("🥈 50 treinos concluídos");
    if (totalTreinos >= 100) conquistas.push("🥇 100 treinos concluídos");
    if (totalKm >= 10) conquistas.push("🏃 10 km acumulados");
    if (totalKm >= 50) conquistas.push("🔥 50 km acumulados");
    if (totalKm >= 100) conquistas.push("🚀 100 km acumulados");
    if (totalRounds >= 50) conquistas.push("🥊 50 rounds realizados");
    if (totalRounds >= 500) conquistas.push("👑 500 rounds realizados");

    if (conquistas.length === 0) {
        area.innerHTML = "<p>Nenhuma conquista desbloqueada ainda.</p>";
        return;
    }

    area.innerHTML = conquistas.map(item => `<span class="badge">${item}</span>`).join("");
}

/* ============================
   EVENTOS ESPORTIVOS
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
        alert("Preencha tipo, data, hora e local do evento.");
        return;
    }

    const evento = {
        id: Date.now(),
        organizador,
        tipo,
        data,
        hora,
        local,
        max,
        descricao,
        participantes: []
    };

    eventos.unshift(evento);
    localStorage.setItem("eventosBoxTimer", JSON.stringify(eventos));

    limparFormularioEvento();
    carregarEventos();
}

function limparFormularioEvento() {
    [
        "eventoOrganizador",
        "eventoTipo",
        "eventoData",
        "eventoHora",
        "eventoLocal",
        "eventoMax",
        "eventoDescricao"
    ].forEach(id => {
        const campo = document.getElementById(id);
        if (campo) campo.value = "";
    });
}

function carregarEventos() {
    const lista = document.getElementById("listaEventos");
    if (!lista) return;

    lista.innerHTML = "";

    if (eventos.length === 0) {
        lista.innerHTML = "<p>Nenhum evento criado ainda.</p>";
        return;
    }

    eventos.forEach(evento => {
        const participantesHTML = evento.participantes.length
            ? evento.participantes.map(p => `<li>${p}</li>`).join("")
            : "<li>Nenhum participante confirmado</li>";

        lista.innerHTML += `
            <div class="evento">
                <h3>📅 ${evento.tipo}</h3>
                <p><strong>Organizador:</strong> ${evento.organizador}</p>
                <p><strong>Data:</strong> ${evento.data} às ${evento.hora}</p>
                <p><strong>Local:</strong> ${evento.local}</p>
                ${evento.max ? `<p><strong>Vagas:</strong> ${evento.participantes.length}/${evento.max}</p>` : ""}
                ${evento.descricao ? `<p>${evento.descricao}</p>` : ""}

                <input id="participante-${evento.id}" placeholder="Seu nome para confirmar presença">
                <button onclick="confirmarPresenca(${evento.id})">✅ Confirmar presença</button>

                <h4>Participantes</h4>
                <ul>${participantesHTML}</ul>

                <button class="btn-excluir" onclick="excluirEvento(${evento.id})">
                    🗑️ Excluir evento
                </button>
            </div>
        `;
    });
}

function confirmarPresenca(id) {
    const nome = valor(`participante-${id}`);

    if (!nome.trim()) {
        alert("Digite seu nome para confirmar presença.");
        return;
    }

    eventos = eventos.map(evento => {
        if (evento.id === id) {
            if (evento.max && evento.participantes.length >= evento.max) {
                alert("Evento lotado.");
                return evento;
            }

            if (!evento.participantes.includes(nome)) {
                evento.participantes.push(nome);
            }
        }

        return evento;
    });

    localStorage.setItem("eventosBoxTimer", JSON.stringify(eventos));
    carregarEventos();
}

function excluirEvento(id) {
    if (!confirm("Deseja excluir este evento?")) return;

    eventos = eventos.filter(evento => evento.id !== id);
    localStorage.setItem("eventosBoxTimer", JSON.stringify(eventos));
    carregarEventos();
}

/* ============================
   INICIALIZAÇÃO
============================ */

carregarPerfil();
carregarFeed();
atualizarDashboard();
carregarEventos();
