function valor(id) {
    const el = document.getElementById(id);
    return el ? el.value : "";
}

function numero(id) {
    const el = document.getElementById(id);
    return el ? parseFloat(el.value) || 0 : 0;
}

/* PERFIL */

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

/* NUTRIÇÃO */

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

    const resultado = `
        <h3>👤 Resumo do Perfil</h3>
        <p><strong>Nome:</strong> ${nome}</p>
        <p><strong>Objetivo:</strong> ${formatarObjetivo(objetivo)}</p>
        <p><strong>IMC:</strong> ${imc.toFixed(2)} - ${classificacaoIMC}</p>

        <h3>⚖️ Avaliação Corporal</h3>
        <p><strong>TMB:</strong> ${Math.round(tmb)} kcal</p>
        <p><strong>Gasto diário:</strong> ${Math.round(gastoDiario)} kcal</p>
        <p><strong>Meta calórica:</strong> ${Math.round(caloriasMeta)} kcal</p>
        <p><strong>Gordura corporal:</strong> ${numero("gordura") || "não informada"}%</p>
        <p><strong>Massa muscular:</strong> ${numero("massaMuscular") || "não informada"} kg</p>
        <p><strong>Massa magra:</strong> ${numero("massaMagra") || "não informada"} kg</p>
        <p><strong>Massa gorda:</strong> ${numero("massaGorda") || "não informada"} kg</p>
        <p><strong>Gordura visceral:</strong> ${numero("gorduraVisceral") || "não informada"}</p>
        <p><strong>Dobras:</strong> ${avaliacaoDobras}</p>

        <h3>🥩 Macronutrientes</h3>
        <p><strong>Proteínas:</strong> ${Math.round(proteinas)}g/dia</p>
        <p><strong>Carboidratos:</strong> ${Math.round(carboidratos)}g/dia</p>
        <p><strong>Gorduras:</strong> ${Math.round(gorduras)}g/dia</p>
        <p><strong>Água:</strong> ${aguaRecomendada.toFixed(1)} litros/dia</p>

        <h3>🍽️ Plano Alimentar Personalizado</h3>
        ${gerarPlanoAlimentar(objetivo, orcamento)}

        <h3>🥊 Pré-Treino</h3>
        <p>${estrategiaPreTreino(objetivo)}</p>

        <h3>💪 Pós-Treino</h3>
        <p>${estrategiaPosTreino(objetivo)}</p>

        <h3>💊 Suplementação Opcional</h3>
        <p>Creatina, whey protein, cafeína e eletrólitos podem ser úteis conforme rotina, tolerância e orientação profissional.</p>

        <h3>⚠️ Alertas</h3>
        <p>Esta avaliação é educativa e não substitui nutricionista, médico ou avaliação presencial.</p>
    `;

    document.getElementById("resultadoAvaliacao").innerHTML = resultado;
}

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
                <li><strong>Café:</strong> 3 ovos ou tofu mexido, 60g de aveia, 1 banana e café.</li>
                <li><strong>Lanche:</strong> ${lacteos} com fruta.</li>
                <li><strong>Almoço:</strong> 150g de arroz, 100g de feijão, 180g de ${proteinas}, salada e azeite.</li>
                <li><strong>Pré-treino:</strong> Banana com aveia, tapioca ou pão sem glúten se necessário.</li>
                <li><strong>Pós-treino:</strong> 180g de ${proteinas} + ${carboidratos}.</li>
                <li><strong>Jantar:</strong> ${proteinas} com ${carboidratos} e legumes.</li>
            </ul>
            <p><strong>Estratégia:</strong> superávit calórico, proteína alta e carboidratos para força e recuperação.</p>
        `;
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
            </ul>
            <p><strong>Estratégia:</strong> déficit calórico, saciedade, proteína adequada e redução de ultraprocessados.</p>
        `;
    }

    if (objetivo === "performance") {
        return `
            <ul>
                <li><strong>Café:</strong> ovos/tofu, aveia, banana e mel se permitido.</li>
                <li><strong>Lanche:</strong> fruta com ${lacteos} ou sanduíche adaptado.</li>
                <li><strong>Almoço:</strong> arroz, feijão, ${proteinas}, legumes e salada.</li>
                <li><strong>Pré-treino:</strong> carboidrato de fácil digestão 60 a 90 minutos antes.</li>
                <li><strong>Pós-treino:</strong> proteína + carboidrato para recuperação.</li>
                <li><strong>Jantar:</strong> refeição completa com ${proteinas} e ${carboidratos}.</li>
            </ul>
            <p><strong>Estratégia:</strong> energia para treino, recuperação muscular, hidratação e eletrólitos.</p>
        `;
    }

    return `
        <ul>
            <li><strong>Café:</strong> ovos/tofu, fruta e aveia.</li>
            <li><strong>Lanche:</strong> fruta, castanhas ou ${lacteos}.</li>
            <li><strong>Almoço:</strong> arroz, feijão, ${proteinas} e salada.</li>
            <li><strong>Pré-treino:</strong> banana, tapioca ou carboidrato leve.</li>
            <li><strong>Pós-treino:</strong> ${proteinas} com carboidrato moderado.</li>
            <li><strong>Jantar:</strong> refeição equilibrada com legumes, proteína e carboidrato controlado.</li>
        </ul>
        <p><strong>Estratégia:</strong> manutenção calórica, qualidade alimentar e estabilidade corporal.</p>
    `;
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
    return "Manutenção";
}

/* ATIVIDADES */

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

/* DASHBOARD */

function atualizarDashboard() {
    const totalTreinos = atividades.length;
    const totalMinutos = atividades.reduce((soma, item) => soma + (Number(item.tempo) || 0), 0);
    const totalHoras = totalMinutos / 60;
    const totalKm = atividades.reduce((soma, item) => soma + (Number(item.distancia) || 0), 0);
    const totalRounds = atividades.reduce((soma, item) => soma + (Number(item.rounds) || 0), 0);

    if (document.getElementById("totalTreinos")) document.getElementById("totalTreinos").innerText = totalTreinos;
    if (document.getElementById("totalHoras")) document.getElementById("totalHoras").innerText = `${totalHoras.toFixed(1)}h`;
    if (document.getElementById("totalKm")) document.getElementById("totalKm").innerText = `${totalKm.toFixed(1)} km`;
    if (document.getElementById("totalRounds")) document.getElementById("totalRounds").innerText = totalRounds;

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

/* EVENTOS */

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

/* INICIALIZAÇÃO */

carregarPerfil();
carregarFeed();
atualizarDashboard();
carregarEventos();
