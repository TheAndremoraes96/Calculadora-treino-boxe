const ADMIN_EMAIL_PERMITIDO = "alucasdemoraes96@gmail.com";
const PRECO_MENSAL = 14.90;

function valor(id) {
    const el = document.getElementById(id);
    return el ? el.value : "";
}

function atualizarTexto(id, texto) {
    const el = document.getElementById(id);
    if (el) el.innerText = texto;
}

function dinheiro(valorNumero) {
    return valorNumero.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

function normalizarEmail(email) {
    return String(email || "").toLowerCase().trim();
}

function mostrarPainelAdmin(usuario) {
    document.getElementById("loginAdmin").style.display = "none";
    document.getElementById("painelAdmin").style.display = "block";
    document.getElementById("painelAssinantes").style.display = "block";

    const status = document.getElementById("statusLoginAdmin");
    if (status) status.innerHTML = `<p>✅ Logado como ${usuario.email}</p>`;

    carregarAssinantesPremium();
}

function esconderPainelAdmin() {
    document.getElementById("loginAdmin").style.display = "block";
    document.getElementById("painelAdmin").style.display = "none";
    document.getElementById("painelAssinantes").style.display = "none";
}

async function loginAdmin() {
    const email = normalizarEmail(valor("adminEmail"));
    const senha = valor("adminSenha");

    if (!email || !senha) {
        alert("Digite e-mail e senha.");
        return;
    }

    if (email !== ADMIN_EMAIL_PERMITIDO) {
        alert("Este e-mail não está autorizado como administrador.");
        return;
    }

    try {
        const cred = await firebase.auth().signInWithEmailAndPassword(email, senha);
        mostrarPainelAdmin(cred.user);
    } catch (erro) {
        console.error("Erro no login admin:", erro);
        alert("Erro ao entrar. Confira e-mail, senha e Firebase Authentication.");
    }
}

async function logoutAdmin() {
    await firebase.auth().signOut();
    esconderPainelAdmin();
}

firebase.auth().onAuthStateChanged((user) => {
    if (user && normalizarEmail(user.email) === ADMIN_EMAIL_PERMITIDO) {
        mostrarPainelAdmin(user);
    } else {
        esconderPainelAdmin();
    }
});

function exigirAdminLogado() {
    const user = firebase.auth().currentUser;

    if (!user || normalizarEmail(user.email) !== ADMIN_EMAIL_PERMITIDO) {
        alert("Acesso negado. Faça login como administrador.");
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

async function gerarChavePremiumAdmin() {
    if (!exigirAdminLogado()) return;

    const nome = valor("novoPremiumNome").trim();
    const email = normalizarEmail(valor("novoPremiumEmail"));
    const plano = valor("novoPremiumPlano") || "mensal";

    if (!nome || !email) {
        alert("Preencha nome e e-mail do assinante.");
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
        status: "novo",
        dataCriacao,
        dataExpiracao,
        activationDeviceId: "",
        criadoPor: firebase.auth().currentUser.email
    };

    try {
        await db.collection("premiumKeys").doc(codigo).set(chavePremium);

        await db.collection("assinantes").doc(codigo).set({
            codigo,
            nome,
            email,
            plano,
            ativo: true,
            status: "novo",
            dataCriacao,
            dataExpiracao,
            ultimoUso: "",
            criadoPor: firebase.auth().currentUser.email
        });

        const area = document.getElementById("codigoPremiumGerado");

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

        alert("Código Premium gerado com sucesso!");
        carregarAssinantesPremium();
    } catch (erro) {
        console.error("Erro ao gerar chave Premium:", erro);
        alert("Erro ao gerar chave Premium. Verifique as regras do Firestore.");
    }
}

function statusAssinatura(chave) {
    if (!chave.ativo) return "inativo";

    if (chave.dataExpiracao && new Date() > new Date(chave.dataExpiracao)) {
        return "vencido";
    }

    return chave.status || "ativo";
}

async function carregarAssinantesPremium() {
    if (!exigirAdminLogado()) return;

    const area = document.getElementById("listaAssinantesPremium");
    if (!area) return;

    area.innerHTML = "<p>Carregando assinantes...</p>";

    try {
        const snapshot = await db.collection("premiumKeys").get();
        const assinantes = [];

        snapshot.forEach((doc) => {
            assinantes.push({
                id: doc.id,
                ...doc.data()
            });
        });

        assinantes.sort((a, b) => String(b.dataCriacao || "").localeCompare(String(a.dataCriacao || "")));

        const total = assinantes.length;
        const ativos = assinantes.filter(a => statusAssinatura(a) === "ativo" || statusAssinatura(a) === "novo").length;
        const vencidos = assinantes.filter(a => statusAssinatura(a) === "vencido").length;
        const receita = ativos * PRECO_MENSAL;

        atualizarTexto("assinantesTotal", total);
        atualizarTexto("assinantesAtivos", ativos);
        atualizarTexto("assinantesVencidos", vencidos);
        atualizarTexto("receitaMensal", dinheiro(receita));

        if (assinantes.length === 0) {
            area.innerHTML = "<p>Nenhum assinante encontrado.</p>";
            return;
        }

        area.innerHTML = assinantes.map((a) => {
            const status = statusAssinatura(a);
            const validade = a.dataExpiracao ? new Date(a.dataExpiracao).toLocaleDateString("pt-BR") : "Sem validade";
            const criado = a.dataCriacao ? new Date(a.dataCriacao).toLocaleDateString("pt-BR") : "Sem data";
            const ultimoUso = a.ultimoUso ? new Date(a.ultimoUso).toLocaleDateString("pt-BR") : "Nunca usado";

            return `
                <div class="post">
                    <h3>👤 ${a.nome || "Sem nome"}</h3>
                    <p><strong>E-mail:</strong> ${a.email || "Sem e-mail"}</p>
                    <p><strong>Plano:</strong> ${a.plano || "mensal"}</p>
                    <p><strong>Status:</strong> ${status}</p>
                    <p><strong>Código:</strong> ${a.codigo || a.id}</p>
                    <p><strong>Criado em:</strong> ${criado}</p>
                    <p><strong>Expira em:</strong> ${validade}</p>
                    <p><strong>Último uso:</strong> ${ultimoUso}</p>
                    <button onclick="renovarAssinante('${a.id}', '${a.plano || "mensal"}')">🔄 Renovar</button>
                    <button onclick="reativarAssinante('${a.id}')">✅ Reativar</button>
                    <button class="btn-excluir" onclick="desativarAssinante('${a.id}')">🚫 Desativar</button>
                    <button onclick="liberarDispositivo('${a.id}')">📱 Liberar dispositivo</button>
                </div>
            `;
        }).join("");
    } catch (erro) {
        console.error("Erro ao carregar assinantes:", erro);
        area.innerHTML = "<p>Erro ao carregar assinantes. Verifique login e regras do Firestore.</p>";
    }
}

async function renovarAssinante(codigo, planoAtual) {
    if (!exigirAdminLogado()) return;

    const plano = prompt("Plano para renovar: mensal, trimestral ou anual", planoAtual || "mensal");
    if (!plano) return;

    const dataExpiracao = calcularDataExpiracao(plano);

    try {
        await db.collection("premiumKeys").doc(codigo).update({
            ativo: true,
            status: "ativo",
            plano,
            dataExpiracao
        });

        await db.collection("assinantes").doc(codigo).set({
            ativo: true,
            status: "ativo",
            plano,
            dataExpiracao
        }, { merge: true });

        alert("Assinatura renovada.");
        carregarAssinantesPremium();
    } catch (erro) {
        console.error("Erro ao renovar:", erro);
        alert("Erro ao renovar assinatura.");
    }
}

async function reativarAssinante(codigo) {
    if (!exigirAdminLogado()) return;

    try {
        await db.collection("premiumKeys").doc(codigo).update({
            ativo: true,
            status: "ativo"
        });

        await db.collection("assinantes").doc(codigo).set({
            ativo: true,
            status: "ativo"
        }, { merge: true });

        alert("Assinante reativado.");
        carregarAssinantesPremium();
    } catch (erro) {
        console.error("Erro ao reativar:", erro);
        alert("Erro ao reativar assinante.");
    }
}

async function desativarAssinante(codigo) {
    if (!exigirAdminLogado()) return;
    if (!confirm("Deseja desativar este assinante?")) return;

    try {
        await db.collection("premiumKeys").doc(codigo).update({
            ativo: false,
            status: "inativo"
        });

        await db.collection("assinantes").doc(codigo).set({
            ativo: false,
            status: "inativo"
        }, { merge: true });

        alert("Assinante desativado.");
        carregarAssinantesPremium();
    } catch (erro) {
        console.error("Erro ao desativar:", erro);
        alert("Erro ao desativar assinante.");
    }
}

async function liberarDispositivo(codigo) {
    if (!exigirAdminLogado()) return;
    if (!confirm("Deseja liberar este código para ativar em outro dispositivo?")) return;

    try {
        await db.collection("premiumKeys").doc(codigo).update({
            activationDeviceId: "",
            usado: false
        });

        alert("Dispositivo liberado. O assinante poderá ativar novamente.");
        carregarAssinantesPremium();
    } catch (erro) {
        console.error("Erro ao liberar dispositivo:", erro);
        alert("Erro ao liberar dispositivo.");
    }
}

function baixarCSV(nomeArquivo, linhas) {
    const csv = linhas.map(linha =>
        linha.map(campo => `"${String(campo ?? "").replace(/"/g, '""')}"`).join(",")
    ).join("\\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = nomeArquivo;
    link.click();
}

async function exportarAssinantesCSV() {
    if (!exigirAdminLogado()) return;

    const snapshot = await db.collection("premiumKeys").get();
    const linhas = [["Nome", "Email", "Plano", "Status", "Codigo", "Criado em", "Expira em"]];

    snapshot.forEach((doc) => {
        const a = doc.data();
        linhas.push([
            a.nome || "",
            a.email || "",
            a.plano || "",
            statusAssinatura(a),
            a.codigo || doc.id,
            a.dataCriacao || "",
            a.dataExpiracao || ""
        ]);
    });

    baixarCSV("assinantes-boxtimer.csv", linhas);
}

async function exportarCadastrosCSV() {
    if (!exigirAdminLogado()) return;

    const snapshot = await db.collection("cadastros").get();
    const linhas = [["Nome", "Idade", "Peso", "Altura", "Cidade", "Objetivo", "Modalidade", "Data"]];

    snapshot.forEach((doc) => {
        const a = doc.data();
        linhas.push([
            a.nome || "",
            a.idade || "",
            a.peso || "",
            a.altura || "",
            a.cidade || "",
            a.objetivo || "",
            a.modalidade || "",
            a.data || ""
        ]);
    });

    baixarCSV("atletas-boxtimer.csv", linhas);
}

window.loginAdmin = loginAdmin;
window.logoutAdmin = logoutAdmin;
window.gerarChavePremiumAdmin = gerarChavePremiumAdmin;
window.carregarAssinantesPremium = carregarAssinantesPremium;
window.renovarAssinante = renovarAssinante;
window.reativarAssinante = reativarAssinante;
window.desativarAssinante = desativarAssinante;
window.liberarDispositivo = liberarDispositivo;
window.exportarAssinantesCSV = exportarAssinantesCSV;
window.exportarCadastrosCSV = exportarCadastrosCSV;

console.log("✅ Gestão Premium v3 protegida por Firebase Auth carregada.");
