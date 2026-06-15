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

/* PREMIUM */

const CODIGO_MASTER_PREMIUM = "BOXTIMER2026";

function premiumAtivo() {
    return localStorage.getItem("premiumAtivo") === "sim";
}

function verificarPremium() {
    const status = document.getElementById("statusPremium");
    const email = localStorage.getItem("premiumEmail") || "";
    const plano = localStorage.getItem("premiumPlano") || "";

    if (status) {
        status.innerHTML = premiumAtivo()
            ? `<p>✅ Premium ativo.${email ? `<br><strong>E-mail:</strong> ${email}` : ""}${plano ? `<br><strong>Plano:</strong> ${plano}` : ""}</p>`
            : "<p>🔒 Premium não ativo.</p>";
    }

    carregarAlunos();
    carregarHistoricoAvaliacoes();
}

async function ativarPremium() {
    const email = valor("premiumEmail").toLowerCase().trim();
    const codigo = valor("premiumCodigo").toUpperCase().trim();

    if (!codigo) {
        alert("Digite o código Premium.");
        return;
    }

    if (codigo === CODIGO_MASTER_PREMIUM) {
        localStorage.setItem("premiumAtivo", "sim");
        localStorage.setItem("premiumEmail", email || "cortesia");
        localStorage.setItem("premiumPlano", "cortesia");
        localStorage.setItem("premiumCodigo", CODIGO_MASTER_PREMIUM);

        verificarPremium();
        alert("Premium ativado com código mestre.");
        return;
    }

    if (!email) {
        alert("Digite o e-mail usado na assinatura.");
        return;
    }

    if (typeof db === "undefined" || !db.collection) {
        alert("Firebase não conectado.");
        return;
    }

    try {
        const doc = await db.collection("premiumKeys").doc(codigo).get();

        if (!doc.exists) {
            alert("Código Premium não encontrado.");
            return;
        }

        const chave = doc.data();

        if (!chave.ativo) {
            alert("Este código Premium está desativado.");
            return;
        }

        if (String(chave.email || "").toLowerCase().trim() !== email) {
            alert("Este código não pertence a este e-mail.");
            return;
        }

        if (chave.dataExpiracao) {
            const hoje = new Date();
            const expiracao = new Date(chave.dataExpiracao);

            if (hoje > expiracao) {
                alert("Este código Premium expirou.");
                return;
            }
        }

        await db.collection("premiumKeys").doc(codigo).update({
            usado: true,
            ultimoUso: new Date().toISOString()
        });

        localStorage.setItem("premiumAtivo", "sim");
        localStorage.setItem("premiumEmail", email);
        localStorage.setItem("premiumPlano", chave.plano || "mensal");
        localStorage.setItem("premiumCodigo", codigo);

        verificarPremium();
        alert("Premium ativado com sucesso!");
    } catch (erro) {
        console.error("Erro ao ativar Premium:", erro);
        alert("Erro ao validar o código Premium.");
    }
}

function desativarPremium() {
    localStorage.removeItem("premiumAtivo");
    localStorage.removeItem("premiumEmail");
    localStorage.removeItem("premiumPlano");
    localStorage.removeItem("premiumCodigo");

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

function gerarCodigoPremium() {
    const parte1 = Math.random().toString(36).substring(2, 6).toUpperCase();
    const parte2 = Math.random().toString(36).substring(2, 6).toUpperCase();
    const parte3 = Math.random().toString(36).substring(2, 6).toUpperCase();

    return `BOX-${parte1}-${parte2}-${parte3}`;
}

function calcularDataExpiracao(plano) {
    const data = new Date();

    if (plano === "mensal") data.setMonth(data.getMonth() + 1);
    else if (plano === "trimestral") data.setMonth(data.getMonth() + 3);
    else if (plano === "anual") data.setFullYear(data.getFullYear() + 1);
    else if (plano === "cortesia") data.setMonth(data.getMonth() + 1);
    else data.setMonth(data.getMonth() + 1);

    return data.toISOString();
}

async function gerarChavePremium() {
    const senhaAdmin = prompt("Digite o código mestre para gerar chave:");

    if (senhaAdmin !== CODIGO_MASTER_PREMIUM) {
        alert("Acesso negado.");
        return;
    }

    const nome = valor("novoPremiumNome").trim();
    const email = valor("novoPremiumEmail").toLowerCase().trim();
    const plano = valor("novoPremiumPlano") || "mensal";

    if (!nome || !email) {
        alert("Preencha nome e e-mail do assinante.");
        return;
    }

    if (typeof db === "undefined" || !db.collection) {
        alert("Firebase não conectado.");
        return;
    }

    const codigo = gerarCodigoPremium();
    const dataCriacao = new Date().toISOString();
    const dataExpiracao = calcularDataExpiracao(plano);

    const chavePremium = {
        codigo,
        nome,
        email,
        plano,
        ativo: true,
        usado: false,
        dataCriacao,
        dataExpiracao
    };

    try {
        await db.collection("premiumKeys").doc(codigo).set(chavePremium);

        const area = document.getElementById("codigoPremiumGerado");

        if (area) {
            area.innerHTML = `
                <div class="perfil-box">
                    <h3>✅ Código Premium Gerado</h3>
                    <p><strong>Nome:</strong> ${nome}</p>
                    <p><strong>E-mail:</strong> ${email}</p>
                    <p><strong>Plano:</strong> ${plano}</p>
                    <p><strong>Código:</strong></p>
                    <input value="${codigo}" readonly>
                    <p><strong>Expira em:</strong> ${new Date(dataExpiracao).toLocaleDateString("pt-BR")}</p>
                </div>
            `;
        }

        alert("Código Premium gerado e salvo no Firebase!");
    } catch (erro) {
        console.error("Erro ao gerar chave Premium:", erro);
        alert("Erro ao gerar chave Premium.");
    }
}

/* CADASTRO / FIREBASE */

let cadastro = JSON.parse(localStorage.getItem("cadastroAtleta")) || {};
let atletasFirebase = [];
let unsubscribeAtletas = null;

function salvarCadastro() {
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

    if (!cadastro.nome) {
        alert("Preencha o nome do atleta.");
        return;
    }

    localStorage.setItem("cadastroAtleta", JSON.stringify(cadastro));
    carregarCadastro();

    if (typeof db !== "undefined" && db.collection) {
        db.collection("cadastros")
            .add(cadastro)
            .then(() => {
                alert("Cadastro salvo com sucesso no Firebase!");
                carregarAtletas();
            })
            .catch((erro) => {
                console.error("Erro ao salvar cadastro:", erro);
                alert("Cadastro salvo localmente, mas deu erro no Firebase.");
            });
    } else {
        alert("Cadastro salvo localmente. Firebase não conectado.");
    }
}

function carregarCadastro() {
    const area = document.getElementById("cadastroSalvo");
    if (!area) return;

    cadastro = JSON.parse(localStorage.getItem("cadastroAtleta")) || {};

    if (!cadastro.nome) {
        area.innerHTML = "<p>Nenhum cadastro salvo ainda.</p>";
        return;
    }

    Object.keys(cadastro).forEach((campo) => preencherCampo(campo, cadastro[campo]));

    area.innerHTML = `
        <div class="perfil-box">
            <h3>👤 ${cadastro.nome}</h3>
            <p><strong>Idade:</strong> ${cadastro.idade || "Não informada"}</p>
            <p><strong>Peso:</strong> ${cadastro.peso || "Não informado"} kg</p>
            <p><strong>Altura:</strong> ${cadastro.altura || "Não informada"} m</p>
            <p><strong>Cidade:</strong> ${cadastro.cidade || "Não informada"}</p>
            <p><strong>Objetivo:</strong> ${formatarObjetivo(cadastro.objetivo)}</p>
            <p><strong>Modalidade:</strong> ${cadastro.modalidade || "Não informada"}</p>
        </div>
    `;
}

function carregarAtletasFirebase() {
    const area = document.getElementById("listaAtletasFirebase");
    if (!area) return;

    area.innerHTML = "<p>Carregando atletas...</p>";

    if (typeof db === "undefined" || !db.collection) {
        area.innerHTML = "<p>Firebase não conectado.</p>";
        return;
    }

    db.collection("cadastros")
        .get()
        .then((snapshot) => {
            atletasFirebase = [];

            snapshot.forEach((doc) => {
                atletasFirebase.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            atletasFirebase.sort((a, b) =>
                String(b.data || "").localeCompare(String(a.data || ""))
            );

            mostrarAtletas(atletasFirebase);
            atualizarDashboardProfissional();
        })
        .catch((erro) => {
            console.error("Erro ao carregar atletas:", erro);
            area.innerHTML = "<p>Erro ao carregar atletas.</p>";
        });
}

function carregarAtletasTempoReal() {
    const area = document.getElementById("listaAtletasFirebase");
    if (!area) return;

    if (typeof db === "undefined" || !db.collection) {
        area.innerHTML = "<p>Firebase não conectado.</p>";
        return;
    }

    if (unsubscribeAtletas) return;

    area.innerHTML = "<p>Sincronizando atletas em tempo real...</p>";

    unsubscribeAtletas = db.collection("cadastros")
        .onSnapshot((snapshot) => {
            atletasFirebase = [];

            snapshot.forEach((doc) => {
                atletasFirebase.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            atletasFirebase.sort((a, b) =>
                String(b.data || "").localeCompare(String(a.data || ""))
            );

            mostrarAtletas(atletasFirebase);
            atualizarDashboardProfissional();
        }, (erro) => {
            console.error("Erro no tempo real:", erro);
            area.innerHTML = "<p>Erro ao sincronizar atletas.</p>";
        });
}

function carregarAtletas() {
    carregarAtletasFirebase();
}

function mostrarAtletas(lista) {
    const area = document.getElementById("listaAtletasFirebase");
    if (!area) return;

    if (!lista || lista.length === 0) {
        area.innerHTML = "<p>Nenhum atleta encontrado.</p>";
        return;
    }

    area.innerHTML = lista.map((atleta) => `
        <div class="post">
            <h3>🥊 ${atleta.nome || "Atleta sem nome"}</h3>
            <p><strong>Idade:</strong> ${atleta.idade || "Não informada"}</p>
            <p><strong>Peso:</strong> ${atleta.peso || "Não informado"} kg</p>
            <p><strong>Altura:</strong> ${atleta.altura || "Não informada"} m</p>
            <p><strong>Cidade:</strong> ${atleta.cidade || "Não informada"}</p>
            <p><strong>Objetivo:</strong> ${formatarObjetivo(atleta.objetivo)}</p>
            <p><strong>Modalidade:</strong> ${atleta.modalidade || "Não informada"}</p>
            <p><strong>Data:</strong> ${atleta.data || "Sem data"}</p>

            <button onclick="carregarAtletaNoFormulario('${atleta.id}')">✏️ Editar no Formulário</button>
            <button class="btn-excluir" onclick="excluirAtletaFirebase('${atleta.id}')">🗑️ Excluir Atleta</button>
        </div>
    `).join("");
}

function pesquisarAtletas() {
    const termo = valor("pesquisaAtleta").toLowerCase().trim();

    if (!termo) {
        mostrarAtletas(atletasFirebase);
        return;
    }

    const filtrados = atletasFirebase.filter((atleta) =>
        String(atleta.nome || "").toLowerCase().includes(termo) ||
        String(atleta.cidade || "").toLowerCase().includes(termo) ||
        String(atleta.modalidade || "").toLowerCase().includes(termo) ||
        String(atleta.objetivo || "").toLowerCase().includes(termo)
    );

    mostrarAtletas(filtrados);
}

function carregarAtletaNoFormulario(id) {
    const atleta = atletasFirebase.find((item) => item.id === id);

    if (!atleta) {
        alert("Atleta não encontrado.");
        return;
    }

    Object.keys(atleta).forEach((campo) => {
        preencherCampo(campo, atleta[campo]);
    });

    cadastro = atleta;
    localStorage.setItem("cadastroAtleta", JSON.stringify(cadastro));
    carregarCadastro();

    location.hash = "#cadastro";
    alert("Atleta carregado no formulário.");
}

function excluirAtletaFirebase(id) {
    if (!confirm("Deseja excluir este atleta do Firebase?")) return;

    if (typeof db === "undefined" || !db.collection) {
        alert("Firebase não conectado.");
        return;
    }

    db.collection("cadastros")
        .doc(id)
        .delete()
        .then(() => {
            alert("Atleta excluído com sucesso.");
            carregarAtletas();
        })
        .catch((erro) => {
            console.error("Erro ao excluir atleta:", erro);
            alert("Erro ao excluir atleta.");
        });
}

/* TERMO */

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

/* AVALIAÇÃO */

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

    const proteinas = objetivo === "emagrecimento"
        ? peso * 2.2
        : objetivo === "performance"
            ? peso * 1.8
            : peso * 2.0;

    const gorduras = objetivo === "emagrecimento" ? peso * 0.8 : peso * 0.9;

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
        gordura: numero("gordura"),
        massaMuscular: numero("massaMuscular"),
        somaDobras: somaDobras.toFixed(1)
    };

    const resultado = document.getElementById("resultadoAvaliacao");

    if (resultado) {
        resultado.innerHTML = `
            <h3>👤 Resumo do Atleta</h3>
            <p><strong>Nome:</strong> ${nome}</p>
            <p><strong>Objetivo:</strong> ${formatarObjetivo(objetivo)}</p>
            <p><strong>Modalidade:</strong> ${ultimaAvaliacao.modalidade}</p>
            <p><strong>Método:</strong> ${metodo}</p>
            <p><strong>IMC:</strong> ${imc.toFixed(2)} - ${classificacaoIMC}</p>

            <h3>🥩 Macronutrientes</h3>
            <p><strong>Calorias:</strong> ${Math.round(caloriasMeta)} kcal/dia</p>
            <p><strong>Proteínas:</strong> ${Math.round(proteinas)}g/dia</p>
            <p><strong>Carboidratos:</strong> ${Math.round(carboidratos)}g/dia</p>
            <p><strong>Gorduras:</strong> ${Math.round(gorduras)}g/dia</p>
            <p><strong>Água:</strong> ${aguaRecomendada.toFixed(1)} litros/dia</p>

            <h3>🍽️ Plano Alimentar</h3>
            ${gerarPlanoAlimentar(objetivo, orcamento)}
        `;
    }
}

function salvarAvaliacaoHistorico() {
    if (!exigirPremium()) return;

    if (!ultimaAvaliacao) {
        alert("Gere uma avaliação antes de salvar no histórico.");
        return;
    }

    let historico = JSON.parse(localStorage.getItem("historicoAvaliacoes")) || [];
    historico.unshift(ultimaAvaliacao);
    localStorage.setItem("historicoAvaliacoes", JSON.stringify(historico));

    carregarHistoricoAvaliacoes();
    atualizarDashboardProfissional();

    if (typeof db !== "undefined" && db.collection) {
        db.collection("avaliacoes")
            .add(ultimaAvaliacao)
            .then(() => alert("Avaliação salva no Firebase!"))
            .catch((erro) => {
                console.error("Erro ao salvar avaliação:", erro);
                alert("Avaliação salva localmente, mas deu erro no Firebase.");
            });
    } else {
        alert("Avaliação salva localmente.");
    }
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

    area.innerHTML = historico.map((av) => `
        <div class="post">
            <h3>📊 ${av.nome}</h3>
            <small>${av.data}</small>
            <p><strong>Peso:</strong> ${av.peso} kg</p>
            <p><strong>IMC:</strong> ${av.imc} - ${av.classificacaoIMC}</p>
            <p><strong>Meta calórica:</strong> ${av.caloriasMeta} kcal</p>
            <p><strong>Proteínas:</strong> ${av.proteinas}g</p>
            <p><strong>Carboidratos:</strong> ${av.carboidratos}g</p>
            <p><strong>Gorduras:</strong> ${av.gorduras}g</p>
            <button class="btn-excluir" onclick="excluirAvaliacaoHistorico(${av.id})">🗑️ Excluir Avaliação</button>
        </div>
    `).join("");
}

function excluirAvaliacaoHistorico(id) {
    let historico = JSON.parse(localStorage.getItem("historicoAvaliacoes")) || [];
    historico = historico.filter((av) => av.id !== id);
    localStorage.setItem("historicoAvaliacoes", JSON.stringify(historico));
    carregarHistoricoAvaliacoes();
    atualizarDashboardProfissional();
}

function limparHistoricoAvaliacoes() {
    localStorage.removeItem("historicoAvaliacoes");
    carregarHistoricoAvaliacoes();
    atualizarDashboardProfissional();
}

/* ALIMENTAÇÃO */

function gerarPlanoAlimentar(objetivo, orcamento) {
    const economico = orcamento === "economico";

    if (objetivo === "hipertrofia") {
        return `
        <ul>
            <li>Café: 3 ovos, 60g de aveia e 1 banana.</li>
            <li>Almoço: 150g de arroz, 100g de feijão e 180g de frango ou carne.</li>
            <li>Pré-treino: banana com aveia ou tapioca.</li>
            <li>Pós-treino: 180g de proteína com carboidrato.</li>
            <li>Jantar: proteína, arroz/batata e legumes.</li>
            <li>${economico ? "Opção econômica: ovos, frango, arroz, feijão, banana e aveia." : "Opção padrão: frango, carne magra, peixe, iogurte e castanhas."}</li>
        </ul>`;
    }

    if (objetivo === "emagrecimento") {
        return `
        <ul>
            <li>Café: 2 ovos, fruta e café sem açúcar.</li>
            <li>Almoço: 100g de arroz, 80g de feijão, 160g de proteína e salada.</li>
            <li>Pré-treino: fruta ou carboidrato leve.</li>
            <li>Jantar: proteína magra com legumes.</li>
            <li>${economico ? "Opção econômica: ovos, sardinha, frango, legumes e frutas." : "Opção padrão: frango, peixe, patinho, iogurte natural e saladas variadas."}</li>
        </ul>`;
    }

    return `
    <ul>
        <li>Café: ovos, fruta e aveia.</li>
        <li>Almoço: arroz, feijão, proteína e salada.</li>
        <li>Lanche: fruta, iogurte ou castanhas.</li>
        <li>Jantar: refeição equilibrada com proteína, carboidrato e legumes.</li>
    </ul>`;
}

function formatarObjetivo(objetivo) {
    if (objetivo === "hipertrofia") return "Hipertrofia";
    if (objetivo === "emagrecimento") return "Emagrecimento";
    if (objetivo === "performance") return "Performance";
    if (objetivo === "competicao") return "Competição";
    if (objetivo === "manutencao") return "Manutenção";
    return "Manutenção";
}

/* TREINADOR */

let alunos = JSON.parse(localStorage.getItem("alunosTreinador")) || [];

function cadastrarAluno() {
    if (!exigirPremium()) return;

    const aluno = {
        id: Date.now(),
        nome: valor("alunoNome"),
        contato: valor("alunoContato"),
        peso: valor("alunoPeso"),
        objetivo: valor("alunoObjetivo"),
        observacoes: valor("alunoObservacoes"),
        data: new Date().toLocaleString("pt-BR")
    };

    if (!aluno.nome || !aluno.objetivo) {
        alert("Preencha nome e objetivo do aluno.");
        return;
    }

    alunos.unshift(aluno);
    localStorage.setItem("alunosTreinador", JSON.stringify(alunos));
    carregarAlunos();
    alert("Aluno cadastrado.");
}

function carregarAlunos() {
    const area = document.getElementById("listaAlunos");
    if (!area) return;

    if (!premiumAtivo()) {
        area.innerHTML = "<p>🔒 Área disponível apenas no Premium.</p>";
        return;
    }

    if (alunos.length === 0) {
        area.innerHTML = "<p>Nenhum aluno cadastrado.</p>";
        return;
    }

    area.innerHTML = alunos.map((aluno) => `
        <div class="post">
            <h3>👤 ${aluno.nome}</h3>
            <p><strong>Contato:</strong> ${aluno.contato || "Não informado"}</p>
            <p><strong>Peso:</strong> ${aluno.peso || "Não informado"} kg</p>
            <p><strong>Objetivo:</strong> ${formatarObjetivo(aluno.objetivo)}</p>
            <p>${aluno.observacoes || ""}</p>
            <button class="btn-excluir" onclick="excluirAluno(${aluno.id})">Excluir</button>
        </div>
    `).join("");
}

function excluirAluno(id) {
    alunos = alunos.filter((aluno) => aluno.id !== id);
    localStorage.setItem("alunosTreinador", JSON.stringify(alunos));
    carregarAlunos();
}

function limparAlunos() {
    alunos = [];
    localStorage.removeItem("alunosTreinador");
    carregarAlunos();
}

/* TIMER */

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

    const tempoRound = numero("tempoRoundConfig") || 180;
    if (tempoAtual <= 0) tempoAtual = tempoRound;

    timerRodando = true;

    timerInterval = setInterval(() => {
        tempoAtual--;
        atualizarDisplayTimer();

        if (tempoAtual <= 0) {
            tocarCampainha();

            if (!emDescanso) {
                emDescanso = true;
                tempoAtual = numero("tempoDescansoConfig") || 60;
            } else {
                emDescanso = false;
                roundAtualNumero++;
                tempoAtual = tempoRound;
            }
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
}

function tocarCampainha() {
    try {
        new Audio("https://actions.google.com/sounds/v1/alarms/beep_short.ogg").play();
    } catch (e) {}
}

/* FEED */

let atividades = JSON.parse(localStorage.getItem("atividadesBoxTimer")) || [];

function publicarAtividade() {
    const atividade = {
        id: Date.now(),
        nome: valor("atividadeNome") || cadastro.nome || "Atleta",
        tipo: valor("tipoAtividade"),
        distancia: valor("distancia"),
        tempo: valor("tempo"),
        calorias: valor("calorias"),
        rounds: valor("rounds"),
        golpes: valor("golpes"),
        carga: valor("carga"),
        comentario: valor("comentarioAtividade"),
        curtidas: 0,
        comentarios: [],
        data: new Date().toLocaleString("pt-BR")
    };

    if (!atividade.tipo || !atividade.tempo) {
        alert("Preencha tipo e tempo.");
        return;
    }

    atividades.unshift(atividade);
    localStorage.setItem("atividadesBoxTimer", JSON.stringify(atividades));
    carregarFeed();
    atualizarDashboardProfissional();
}

function carregarFeed() {
    const feed = document.getElementById("feedAtividades");
    if (!feed) return;

    if (atividades.length === 0) {
        feed.innerHTML = "<p>Nenhuma atividade publicada ainda.</p>";
        return;
    }

    feed.innerHTML = atividades.map((a) => `
        <div class="post">
            <h3>👤 ${a.nome}</h3>
            <small>${a.data}</small>
            <p><strong>Atividade:</strong> ${a.tipo}</p>
            <p><strong>Tempo:</strong> ${a.tempo} min</p>
            <p><strong>Distância:</strong> ${a.distancia || 0} km</p>
            <p><strong>Rounds:</strong> ${a.rounds || 0}</p>
            <p>${a.comentario || ""}</p>
            <button onclick="curtirAtividade(${a.id})">❤️ Curtir (${a.curtidas})</button>
            <button class="btn-excluir" onclick="excluirAtividade(${a.id})">Excluir</button>
        </div>
    `).join("");
}

function curtirAtividade(id) {
    atividades = atividades.map((a) => {
        if (a.id === id) a.curtidas++;
        return a;
    });

    localStorage.setItem("atividadesBoxTimer", JSON.stringify(atividades));
    carregarFeed();
}

function excluirAtividade(id) {
    atividades = atividades.filter((a) => a.id !== id);
    localStorage.setItem("atividadesBoxTimer", JSON.stringify(atividades));
    carregarFeed();
    atualizarDashboardProfissional();
}

/* EVENTOS */

let eventos = JSON.parse(localStorage.getItem("eventosBoxTimer")) || [];

function criarEvento() {
    const evento = {
        id: Date.now(),
        organizador: valor("eventoOrganizador"),
        tipo: valor("eventoTipo"),
        data: valor("eventoData"),
        hora: valor("eventoHora"),
        local: valor("eventoLocal"),
        max: valor("eventoMax"),
        descricao: valor("eventoDescricao"),
        participantes: []
    };

    if (!evento.tipo || !evento.data || !evento.hora || !evento.local) {
        alert("Preencha tipo, data, hora e local.");
        return;
    }

    eventos.unshift(evento);
    localStorage.setItem("eventosBoxTimer", JSON.stringify(eventos));
    carregarEventos();
}

function carregarEventos() {
    const lista = document.getElementById("listaEventos");
    if (!lista) return;

    if (eventos.length === 0) {
        lista.innerHTML = "<p>Nenhum evento criado ainda.</p>";
        return;
    }

    lista.innerHTML = eventos.map((e) => `
        <div class="evento">
            <h3>${e.tipo}</h3>
            <p><strong>Data:</strong> ${e.data} às ${e.hora}</p>
            <p><strong>Local:</strong> ${e.local}</p>
            <p>${e.descricao || ""}</p>
            <input id="participante-${e.id}" placeholder="Seu nome">
            <button onclick="confirmarPresenca(${e.id})">Confirmar presença</button>
            <ul>${e.participantes.map((p) => `<li>${p}</li>`).join("")}</ul>
            <button class="btn-excluir" onclick="excluirEvento(${e.id})">Excluir</button>
        </div>
    `).join("");
}

function confirmarPresenca(id) {
    const nome = valor(`participante-${id}`);
    if (!nome) return;

    eventos = eventos.map((e) => {
        if (e.id === id && !e.participantes.includes(nome)) {
            e.participantes.push(nome);
        }
        return e;
    });

    localStorage.setItem("eventosBoxTimer", JSON.stringify(eventos));
    carregarEventos();
}

function excluirEvento(id) {
    eventos = eventos.filter((e) => e.id !== id);
    localStorage.setItem("eventosBoxTimer", JSON.stringify(eventos));
    carregarEventos();
}

function limparTodasInscricoes() {
    eventos = eventos.map((e) => {
        e.participantes = [];
        return e;
    });

    localStorage.setItem("eventosBoxTimer", JSON.stringify(eventos));
    carregarEventos();
}

function excluirTodosEventos() {
    eventos = [];
    localStorage.removeItem("eventosBoxTimer");
    carregarEventos();
}

/* DASHBOARD */

let graficoEvolucao = null;

function atualizarDashboard() {
    const totalTreinos = atividades.length;
    const totalMinutos = atividades.reduce((soma, item) => soma + (Number(item.tempo) || 0), 0);
    const totalKm = atividades.reduce((soma, item) => soma + (Number(item.distancia) || 0), 0);
    const totalRounds = atividades.reduce((soma, item) => soma + (Number(item.rounds) || 0), 0);

    atualizarTexto("totalTreinos", totalTreinos);
    atualizarTexto("totalHoras", `${(totalMinutos / 60).toFixed(1)}h`);
    atualizarTexto("totalKm", `${totalKm.toFixed(1)} km`);
    atualizarTexto("totalRounds", totalRounds);
}

function calcularIMCAtleta(atleta) {
    const peso = Number(atleta.peso) || 0;
    const altura = Number(atleta.altura) || 0;

    if (!peso || !altura) return 0;

    return peso / (altura * altura);
}

function atualizarDashboardProfissional() {
    const totalAtletas = atletasFirebase.length;

    const pesosValidos = atletasFirebase
        .map((a) => Number(a.peso) || 0)
        .filter((p) => p > 0);

    const pesoMedioValor = pesosValidos.length
        ? pesosValidos.reduce((soma, peso) => soma + peso, 0) / pesosValidos.length
        : 0;

    const imcsValidos = atletasFirebase
        .map(calcularIMCAtleta)
        .filter((imc) => imc > 0);

    const imcMedioValor = imcsValidos.length
        ? imcsValidos.reduce((soma, imc) => soma + imc, 0) / imcsValidos.length
        : 0;

    const objetivos = {};

    atletasFirebase.forEach((atleta) => {
        const objetivo = atleta.objetivo || "manutencao";
        objetivos[objetivo] = (objetivos[objetivo] || 0) + 1;
    });

    let objetivoMaisComum = "-";

    if (Object.keys(objetivos).length > 0) {
        objetivoMaisComum = Object.keys(objetivos).reduce((a, b) =>
            objetivos[a] > objetivos[b] ? a : b
        );
    }

    atualizarTexto("totalAtletas", totalAtletas);
    atualizarTexto("pesoMedio", `${pesoMedioValor.toFixed(1)} kg`);
    atualizarTexto("imcMedio", imcMedioValor.toFixed(2));
    atualizarTexto("objetivoMaisComum", formatarObjetivo(objetivoMaisComum));

    atualizarDashboard();
    gerarGraficoEvolucao();
}

function gerarGraficoEvolucao() {
    const canvas = document.getElementById("graficoEvolucao");

    if (!canvas || typeof Chart === "undefined") {
        console.log("Canvas ou Chart não encontrado.");
        return;
    }

    let historico = JSON.parse(localStorage.getItem("historicoAvaliacoes")) || [];
    historico = historico.slice().reverse();

    if (historico.length === 0 && atletasFirebase.length > 0) {
        historico = atletasFirebase.map((atleta) => ({
            data: atleta.data || atleta.nome || "Atleta",
            peso: Number(atleta.peso) || 0,
            imc: calcularIMCAtleta(atleta).toFixed(2)
        }));
    }

    const labels = historico.map((item, index) => item.data || `Registro ${index + 1}`);
    const pesos = historico.map((item) => Number(item.peso) || 0);
    const imcs = historico.map((item) => Number(item.imc) || 0);

    if (graficoEvolucao) {
        graficoEvolucao.destroy();
    }

    graficoEvolucao = new Chart(canvas, {
        type: "line",
        data: {
            labels,
            datasets: [
                {
                    label: "Peso (kg)",
                    data: pesos,
                    borderColor: "#00cec9",
                    backgroundColor: "#00cec9",
                    borderWidth: 3,
                    pointRadius: 6,
                    pointHoverRadius: 8,
                    tension: 0.4
                },
                {
                    label: "IMC",
                    data: imcs,
                    borderColor: "#ff7675",
                    backgroundColor: "#ff7675",
                    borderWidth: 3,
                    pointRadius: 6,
                    pointHoverRadius: 8,
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: "#ffffff",
                        font: {
                            size: 14,
                            weight: "bold"
                        }
                    }
                }
            },
            scales: {
                x: {
                    ticks: { color: "#ffffff" },
                    grid: { color: "#333333" }
                },
                y: {
                    beginAtZero: false,
                    ticks: { color: "#ffffff" },
                    grid: { color: "#333333" }
                }
            }
        }
    });

    console.log("✅ Gráfico atualizado com sucesso.");
}

/* SATISFAÇÃO / BACKUP / PIX */

function salvarSatisfacao() {
    const nota = valor("notaApp");
    const avaliacao = valor("avaliacaoApp");

    if (!nota || !avaliacao) {
        alert("Preencha a nota e o comentário.");
        return;
    }

    localStorage.setItem("satisfacaoBoxTimer", JSON.stringify({
        nota,
        avaliacao,
        data: new Date().toLocaleString("pt-BR")
    }));

    const area = document.getElementById("resultadoSatisfacao");
    if (area) area.innerHTML = `<p>✅ Obrigado pela avaliação: ${nota}</p>`;
}

function exportarBackup() {
    const dados = {
        cadastro,
        atletasFirebase,
        alunos,
        atividades,
        eventos,
        historicoAvaliacoes: JSON.parse(localStorage.getItem("historicoAvaliacoes")) || []
    };

    const blob = new Blob([JSON.stringify(dados, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "backup-boxtimer-pro.json";
    link.click();
}

function copiarPix() {
    const pix = document.getElementById("pixKey");

    if (!pix) {
        alert("Chave PIX não encontrada.");
        return;
    }

    pix.select();
    pix.setSelectionRange(0, 99999);

    navigator.clipboard.writeText(pix.value)
        .then(() => alert("Chave PIX copiada!"))
        .catch(() => alert("Não foi possível copiar o PIX."));
}

/* INICIALIZAÇÃO */

document.addEventListener("DOMContentLoaded", () => {
    carregarCadastro();
    carregarTermo();
    reiniciarTimer();
    carregarFeed();
    carregarEventos();
    atualizarDashboardProfissional();
    verificarPremium();

    setTimeout(() => {
        carregarAtletasTempoReal();
        carregarAtletas();
    }, 1000);
});

/* FUNÇÕES GLOBAIS */

window.salvarCadastro = salvarCadastro;
window.salvarAtleta = salvarCadastro;

window.carregarCadastro = carregarCadastro;
window.carregarAtletasFirebase = carregarAtletasFirebase;
window.carregarAtletasTempoReal = carregarAtletasTempoReal;
window.carregarAtletas = carregarAtletas;

window.pesquisarAtletas = pesquisarAtletas;
window.carregarAtletaNoFormulario = carregarAtletaNoFormulario;
window.excluirAtletaFirebase = excluirAtletaFirebase;

window.aceitarTermo = aceitarTermo;
window.carregarTermo = carregarTermo;

window.gerarAvaliacao = gerarAvaliacao;
window.salvarAvaliacaoHistorico = salvarAvaliacaoHistorico;
window.carregarHistoricoAvaliacoes = carregarHistoricoAvaliacoes;
window.limparHistoricoAvaliacoes = limparHistoricoAvaliacoes;
window.excluirAvaliacaoHistorico = excluirAvaliacaoHistorico;

window.ativarPremium = ativarPremium;
window.desativarPremium = desativarPremium;
window.gerarChavePremium = gerarChavePremium;

window.cadastrarAluno = cadastrarAluno;
window.carregarAlunos = carregarAlunos;
window.limparAlunos = limparAlunos;
window.excluirAluno = excluirAluno;

window.iniciarTimer = iniciarTimer;
window.pausarTimer = pausarTimer;
window.reiniciarTimer = reiniciarTimer;

window.publicarAtividade = publicarAtividade;
window.carregarFeed = carregarFeed;
window.curtirAtividade = curtirAtividade;
window.excluirAtividade = excluirAtividade;

window.criarEvento = criarEvento;
window.carregarEventos = carregarEventos;
window.confirmarPresenca = confirmarPresenca;
window.excluirEvento = excluirEvento;
window.limparTodasInscricoes = limparTodasInscricoes;
window.excluirTodosEventos = excluirTodosEventos;

window.atualizarDashboard = atualizarDashboard;
window.atualizarDashboardProfissional = atualizarDashboardProfissional;
window.gerarGraficoEvolucao = gerarGraficoEvolucao;
window.salvarSatisfacao = salvarSatisfacao;
window.exportarBackup = exportarBackup;
window.copiarPix = copiarPix;

window.testarFirebase = function () {
    if (typeof db === "undefined" || !db.collection) {
        alert("Firebase não conectado.");
        return;
    }

    db.collection("avaliacoes").add({
        nome: "Teste BoxTimer Pro",
        data: new Date().toLocaleString("pt-BR")
    })
    .then(() => alert("Firebase funcionando!"))
    .catch((erro) => {
        console.error("Erro Firebase:", erro);
        alert("Erro ao salvar no Firebase.");
    });
};

console.log("✅ BoxTimer Pro final com Premium por e-mail carregado com sucesso.");
