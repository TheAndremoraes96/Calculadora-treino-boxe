# 🥊 BoxTimer Pro

Sistema de treino de boxe com cálculo de IMC, plano alimentar inteligente, histórico de evolução, gráfico de progresso e cronômetro profissional de rounds.

---

## 🚀 Funcionalidades

### 📊 IMC do atleta
- Cálculo automático do IMC
- Classificação corporal:
  - Abaixo do peso
  - Peso normal
  - Sobrepeso
  - Obesidade

---

### 🎯 Objetivo do atleta
O usuário pode escolher entre:

- Hipertrofia
- Emagrecimento
- Manutenção

A cor do sistema muda automaticamente de acordo com o objetivo selecionado.

---

### 🍽️ Plano alimentar inteligente

O sistema gera sugestões alimentares com base em:

- Objetivo do atleta
- Preferência alimentar
- Orçamento disponível

#### Preferências alimentares:
- Carnívoro
- Pescetariano
- Fit leve
- Vegetariano

#### Orçamento:
- Econômico
- Padrão

A opção econômica foi criada para sugerir alimentos mais acessíveis, mantendo o foco no objetivo do atleta.

---

### 📈 Histórico de evolução

O sistema salva automaticamente:

- Data do registro
- IMC calculado
- Classificação corporal
- Objetivo
- Preferência alimentar
- Orçamento escolhido

Os dados ficam salvos no navegador usando `localStorage`.

---

### 📊 Gráfico de evolução do IMC

O aplicativo possui um gráfico visual feito com `Canvas`, mostrando a evolução do IMC ao longo dos registros.

---

### 🥊 Cronômetro de boxe

Cronômetro profissional para treino de boxe:

- 12 rounds
- 3 minutos por round
- 1 minuto de descanso
- Botão iniciar
- Botão parar
- Botão reiniciar
- Campainha sonora
- Finalização automática do treino

---

## 🎨 Tema dinâmico

O visual muda conforme o objetivo:

- Hipertrofia: tema azul
- Emagrecimento: tema vermelho
- Manutenção: tema verde

---

## 🛠️ Tecnologias utilizadas

- HTML5
- CSS3
- JavaScript puro
- Canvas
- localStorage

---

## 📁 Estrutura do projeto

```txt
index.html
style.css
script.js
README.md

