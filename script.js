function valor(id) {
    return document.getElementById(id).value;
}

function numero(id) {
    return parseFloat(document.getElementById(id).value) || 0;
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
    const campos = [
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
    ];

    campos.forEach(id => {
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

    document.getElementById("totalTreinos").innerText = totalTreinos;
    document.getElementById("totalHoras").innerText = `${totalHoras.toFixed(1)}h`;
    document.getElementById("totalKm").innerText = `${totalKm.toFixed(1)} km`;
    document.getElementById("totalRounds").innerText = totalRounds;

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
    const campos = [
        "eventoOrganizador",
        "eventoTipo",
        "eventoData",
        "eventoHora",
        "eventoLocal",
        "eventoMax",
        "eventoDescricao"
    ];

    campos.forEach(id => {
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
