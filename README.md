# Conversor JSON para CSV 🔄

Projeto web utilitário desenvolvido em **Vanilla JavaScript** para converter payloads JSON complexos e aninhados em planilhas CSV estruturadas. 
A aplicação roda 100% no navegador do cliente (Client-side), garantindo privacidade e velocidade, além de contar com processamento assíncrono para evitar travamentos.

Acesse a aplicação:
[Conversor JSON > CSV](https://tonverso.com/conversor/)

---

## Tecnologias utilizadas

| Tecnologia         | Versão / Uso                                           |
|--------------------|--------------------------------------------------------|
| HTML5 / CSS3       | Estrutura e Estilização                                |
| JavaScript (ES6)   | Lógica e manipulação de interface                      |
| Web Workers        | Processamento de arquivos pesados em segundo plano     |
| PWA                | Service Worker e Manifest para funcionamento offline   |

---

## Pré-requisitos

Por ser uma aplicação inteiramente Front-end e utilizar **Módulos ES6** (`import`/`export`) e **Web Workers**, o navegador bloqueia a execução direta do arquivo pelo sistema de arquivos (protocolo `file:///`) por questões de segurança (CORS).

- **Navegador Web Moderno** (Chrome, Edge, Firefox, Safari)
- **Servidor HTTP Local** para testes (Ex: Extensão *Live Server* no VS Code ou `http-server` do Node)

---

## Execução (Local)

### 1. Clone o repositório:
```bash
git clone git@github.com:seu-usuario/Conversor-JSON-CSV.git
cd Conversor-JSON-CSV
```

### 2. Inicie um servidor local:
**Opção A (VS Code):**
- Abra a pasta do projeto no VS Code.
- Clique com o botão direito no arquivo `index.html` e selecione **"Open with Live Server"**.

**Opção B (Via Terminal com Node.js):**
```bash
npx http-server .
```

### 3. Acesse a aplicação:
- O servidor local geralmente abrirá no endereço `http://127.0.0.1:5500` ou `http://localhost:8080`.

---

## Observação de Segurança e Privacidade

Todo o processamento de conversão dos dados (do JSON colado até a geração do arquivo `.csv`) ocorre exclusivamente na memória do navegador do usuário, o que significa que **nenhum dado sensível é enviado para servidores externos**.

---

## Estrutura de pastas:

```text
Conversor-JSON-CSV/
├── css/
│   └── style.css       # Estilos globais
├── js/
│   ├── app.js          # Script principal (UI, controle de eventos e registro do PWA)
│   └── worker.js       # Web Worker (Lógica de conversão isolada da UI)
├── index.html          # Estrutura principal da página
├── manifest.json       # Configuração para instalação como aplicativo (PWA)
├── sw.js               # Service Worker para cache e suporte offline
└── README.md
```
