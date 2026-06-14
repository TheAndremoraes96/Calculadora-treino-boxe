function valor(id) {
    return document.getElementById(id).value;
}

function numero(id) {
    return parseFloat(document.getElementById(id).value) || 0;
}

function gerarAvaliacao() {
    const nome = valor("nome") || "Atleta";
    const idade = numero("idade");
    const sexo = valor("sexo");
    const altura = numero("altura");
    const peso = numero("peso");
    const objetivo = valor("objetivo");
    const frequencia = numero("frequencia");
    const duracao = numero("duracao");
    const intensidade = valor("intensidade");
    const orcamento = valor("orcamento");

    if (!idade || !altura || !peso || !sexo || !objetivo) {
        alert("Preencha idade, sexo, altura, peso e objetivo.");
        return;
    }

    const imc = peso / (altura * altura);

    let classificacaoIMC = "";

    if (imc < 18.5) {
        classificacaoIMC = "Abaixo do peso";
    } else if (imc < 25) {
        classificacaoIMC = "Peso normal";
    } else if (imc < 30) {
        classificacaoIMC = "Sobrepeso";
    } else {
        classificacaoIMC = "Obesidade";
    }

    let tmb = 0;

    if (sexo === "masculino") {
        tmb = 10 * peso + 6.25 * (altura * 100) - 5 * idade + 5;
    } else {
        tmb = 10 * peso + 6.25 * (altura * 100) - 5 * idade - 161;
    }

    let fatorAtividade = 1.2;

    if (frequencia >= 1 && frequencia <= 2) fatorAtividade = 1.375;
    if (frequencia >= 3 && frequencia <= 4) fatorAtividade = 1.55;
    if (frequencia >= 5 && frequencia <= 6) fatorAtividade = 1.725;
    if (frequencia >= 7) fatorAtividade = 1.9;

    let gastoDiario = tmb * fatorAtividade;

    let caloriasMeta = gastoDiario;

    if (objetivo === "hipertrofia") caloriasMeta += 300;
    if (objetivo === "emagrecimento") caloriasMeta -= 400;
    if (objetivo === "performance") caloriasMeta += 150;

    let proteinas = 0;
    let gorduras = 0;
    let carboidratos = 0;

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

    carboidratos = (caloriasMeta - ((proteinas * 4) + (gorduras * 9))) / 4;

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

    const alimentos = gerarPlanoAlimentar(objetivo, orcamento);

    const resultado = `
        <h3>👤 Resumo do Perfil</h3>
        <p><strong>Nome:</strong> ${nome}</p>
        <p><strong>Objetivo:</strong> ${formatarObjetivo(objetivo)}</p>
        <p><strong>IMC:</strong> ${imc.toFixed(2)} - ${classificacaoIMC}</p>

        <h3>⚖️ Avaliação Corporal</h3>
        <p><strong>TMB estimada:</strong> ${Math.round(tmb)} kcal</p>
        <p><strong>Gasto calórico diário:</strong> ${Math.round(gastoDiario)} kcal</p>
        <p><strong>Meta calórica diária:</strong> ${Math.round(caloriasMeta)} kcal</p>
        <p><strong>Bioimpedância:</strong> Gordura corporal ${numero("gordura") || "não informada"}%, massa muscular ${numero("massaMuscular") || "não informada"} kg.</p>
        <p><strong>Dobras cutâneas:</strong> ${avaliacaoDobras}</p>

        <h3>🥩 Macronutrientes Recomendados</h3>
        <p><strong>Proteínas:</strong> ${Math.round(proteinas)}g por dia</p>
        <p><strong>Carboidratos:</strong> ${Math.round(carboidratos)}g por dia</p>
        <p><strong>Gorduras:</strong> ${Math.round(gorduras)}g por dia</p>
        <p><strong>Água:</strong> ${aguaRecomendada.toFixed(1)} litros por dia</p>

        <h3>🍽️ Plano Alimentar Diário</h3>
        ${alimentos}

        <h3>🥊 Estratégia Pré-Treino</h3>
        <p>${estrategiaPreTreino(objetivo)}</p>

        <h3>💪 Estratégia Pós-Treino</h3>
        <p>${estrategiaPosTreino(objetivo)}</p>

        <h3>💊 Suplementação Opcional</h3>
        <p>Creatina, whey protein, cafeína e eletrólitos podem ser úteis dependendo da rotina, tolerância e orientação profissional.</p>

        <h3>⚠️ Alertas Importantes</h3>
        <p>Esta avaliação é uma estimativa educativa e não substitui nutricionista, médico ou avaliação presencial. Pessoas com doenças, gestantes, adolescentes, idosos ou atletas em corte de peso extremo devem buscar acompanhamento profissional.</p>

        <h3>📅 Próxima Reavaliação</h3>
        <p>Recomenda-se nova avaliação a cada 30 dias com peso, medidas, bioimpedância, dobras cutâneas e evolução de desempenho.</p>
    `;

    document.getElementById("resultadoAvaliacao").innerHTML = resultado;
}

function gerarPlanoAlimentar(objetivo, orcamento) {
    let proteinaBase = orcamento === "economico" ? "ovos, frango, sardinha e patinho" : "frango, peixe, patinho, ovos e whey protein";
    let carboBase = orcamento === "economico" ? "arroz, feijão, batata-doce, banana e aveia" : "arroz integral, batata-doce, mandioca, frutas e aveia";

    if (objetivo === "hipertrofia") {
        return `
            <ul>
                <li><strong>Café:</strong> 3 ovos, 60g de aveia, 1 banana.</li>
                <li><strong>Lanche:</strong> Iogurte natural ou whey com fruta.</li>
                <li><strong>Almoço:</strong> 150g de arroz, 100g de feijão, 180g de frango, salada.</li>
                <li><strong>Pré-treino:</strong> Banana com aveia ou pão com ovos.</li>
                <li><strong>Pós-treino:</strong> 180g de proteína + carboidrato de rápida reposição.</li>
                <li><strong>Jantar:</strong> ${proteinaBase} com ${carboBase}.</li>
            </ul>
        `;
    }

    if (objetivo === "emagrecimento") {
        return `
            <ul>
                <li><strong>Café:</strong> 2 ovos, fruta e café sem açúcar.</li>
                <li><strong>Lanche:</strong> Iogurte natural ou fruta.</li>
                <li><strong>Almoço:</strong> 100g de arroz, 80g de feijão, 160g de frango, bastante salada.</li>
                <li><strong>Pré-treino:</strong> Fruta ou pequena porção de carboidrato.</li>
                <li><strong>Pós-treino:</strong> Proteína magra com legumes.</li>
                <li><strong>Jantar:</strong> Carne magra, ovos ou peixe com salada e legumes.</li>
            </ul>
        `;
    }

    if (objetivo === "performance") {
        return `
            <ul>
                <li><strong>Café:</strong> Ovos, aveia, banana e mel.</li>
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
            <li><strong>Café:</strong> Ovos, fruta e aveia.</li>
            <li><strong>Lanche:</strong> Fruta ou iogurte.</li>
            <li><strong>Almoço:</strong> Arroz, feijão, proteína magra e salada.</li>
            <li><strong>Pré-treino:</strong> Banana ou pão com ovos.</li>
            <li><strong>Pós-treino:</strong> Proteína magra com carboidrato moderado.</li>
            <li><strong>Jantar:</strong> Refeição equilibrada com legumes, proteína e carboidrato controlado.</li>
        </ul>
    `;
}

function estrategiaPreTreino(objetivo) {
    if (objetivo === "emagrecimento") {
        return "Priorize alimento leve, com carboidrato moderado e boa digestão para manter energia sem exagerar nas calorias.";
    }

    if (objetivo === "hipertrofia") {
        return "Use carboidratos e proteínas antes do treino para melhorar força, volume de treino e recuperação.";
    }

    if (objetivo === "performance") {
        return "Priorize carboidratos de fácil digestão, hidratação adequada e eletrólitos em treinos longos ou intensos.";
    }

    return "Mantenha uma refeição equilibrada 60 a 90 minutos antes do treino.";
}

function estrategiaPosTreino(objetivo) {
    if (objetivo === "emagrecimento") {
        return "Consuma proteína suficiente após o treino para preservar massa muscular e controlar fome.";
    }

    if (objetivo === "hipertrofia") {
        return "Priorize proteína e carboidrato após o treino para recuperação, síntese muscular e reposição de energia.";
    }

    if (objetivo === "performance") {
        return "Reponha carboidratos, proteínas, líquidos e eletrólitos para acelerar recuperação entre sessões.";
    }

    return "Inclua proteína magra e carboidrato de qualidade após o treino.";
}

function formatarObjetivo(objetivo) {
    if (objetivo === "hipertrofia") return "Hipertrofia";
    if (objetivo === "emagrecimento") return "Emagrecimento";
    if (objetivo === "performance") return "Performance";
    return "Manutenção";
}
