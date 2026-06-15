const CODIGO_ADMIN_PREMIUM = "BOXADMIN2026";

function valor(id) {
    const el = document.getElementById(id);
    return el ? el.value : "";
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
    const senhaAdmin = valor("senhaAdmin").trim();

    if (senhaAdmin !== CODIGO_ADMIN_PREMIUM) {
        alert("Senha administrativa incorreta.");
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
    } catch (erro) {
        console.error("Erro ao gerar chave Premium:", erro);
        alert("Erro ao gerar chave Premium.");
    }
}

window.gerarChavePremiumAdmin = gerarChavePremiumAdmin;
