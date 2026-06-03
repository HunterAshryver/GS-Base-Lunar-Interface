# 🌕 Lunar Base Interface - Frontend

## 📋 Descrição do Projeto

Interface mobile/web desenvolvida em **React Native + Expo** para o sistema de monitoramento de recursos da Base Lunar.

A aplicação exibe em tempo real os dados de sensores, reservatórios e alertas operacionais consumidos via API REST, com suporte a simulação de coleta de dados.

**Disciplina:** Técnicas Avançadas de Programação  
**Curso:** Engenharia Mecatrônica  
**Instituição:** FIAP

---

## 👥 Integrantes

| Nome                          |  RM  |
|-------------------------------|------|
|André Henrique Mendes da Cunha |564602|
|Guilherme Meira dos Santos     |566331|
|Gustavo Nobre Coppola          |561423|

---

## 🚀 Tecnologias Utilizadas

- **React Native**
- **Expo**
- **TypeScript**
- **Axios**
- **React Navigation**


---


### Pré-requisitos

- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- API Backend rodando em `localhost:8080`

---

## 📱 Funcionalidades

| Funcionalidade              | Descrição                                                  |
|-----------------------------|------------------------------------------------------------|
| 🛰️ Monitoramento de Sensores | Exibe tipo, localização, valor atual e status de cada sensor |
| 💧 Reservatórios            | Mostra nível atual com barra de progresso e percentual     |
| 🚨 Alertas                  | Lista alertas com severidade, descrição e horário          |
| 🔬 Simular Coleta           | Gera leituras aleatórias para todos os recursos            |
| 🔄 Pull to Refresh          | Atualiza os dados puxando a tela para baixo                |
| 📊 Cards de Status          | Resumo de críticos, sensores ativos, nível de reservas e alertas |

---

## 📌 Endpoints Consumidos

| Método | Endpoint                        | Uso no Frontend                  |
|--------|---------------------------------|----------------------------------|
| GET    | `/api/sensores`                 | Listar sensores no dashboard     |
| GET    | `/api/reservatorios`            | Listar reservatórios             |
| GET    | `/api/alertas`                  | Listar alertas                   |
| POST   | `/api/sensores/{id}/leitura`    | Simular leitura de sensor        |
| PATCH  | `/api/reservatorios/{id}`       | Simular atualização de reserva   |
| POST   | `/api/alertas`                  | Criar alerta de simulação        |