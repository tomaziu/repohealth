import { spawn } from "node:child_process";
import http from "node:http";
import { existsSync, statSync } from "node:fs";
import path from "node:path";
import { URL } from "node:url";
import { applyFixes } from "./fix.mjs";
import { resolveLanguage, t } from "./i18n.mjs";
import { scanRepository } from "./scan.mjs";

export async function startUiServer(options = {}) {
  const root = path.resolve(options.root || ".");
  const host = options.host || "127.0.0.1";
  const preferredPort = options.port || 4789;
  const language = resolveLanguage(options.lang);

  const server = http.createServer(async (request, response) => {
    try {
      await handleRequest(request, response, { root, language });
    } catch (error) {
      sendJson(response, 500, { error: error.message });
    }
  });

  const port = await listen(server, host, preferredPort);
  const url = `http://${host}:${port}`;

  if (options.open !== false) {
    openBrowser(url);
  }

  return { server, url, host, port };
}

async function handleRequest(request, response, context) {
  const requestUrl = new URL(request.url, "http://localhost");

  if (request.method === "GET" && requestUrl.pathname === "/") {
    sendHtml(response, htmlTemplate({ root: context.root, language: context.language }));
    return;
  }

  if (request.method === "GET" && requestUrl.pathname === "/api/scan") {
    const target = resolveTarget(requestUrl.searchParams.get("path") || context.root, context.language);
    const language = resolveLanguage(requestUrl.searchParams.get("lang") || context.language);
    sendJson(response, 200, scanRepository(target, { lang: language }));
    return;
  }

  if (request.method === "POST" && requestUrl.pathname === "/api/fix") {
    const body = await readJsonBody(request);
    const language = resolveLanguage(body.lang || context.language);
    const target = resolveTarget(body.path || context.root, language);
    const before = scanRepository(target, { lang: language });
    const changes = applyFixes(target, before, { dryRun: Boolean(body.dryRun) });
    const after = body.dryRun ? before : scanRepository(target, { lang: language });
    sendJson(response, 200, { changes, before, after });
    return;
  }

  if (request.method === "GET" && requestUrl.pathname === "/api/health") {
    sendJson(response, 200, { ok: true });
    return;
  }

  sendJson(response, 404, { error: "Not found" });
}

function resolveTarget(target, language) {
  const fullPath = path.resolve(target);
  if (!existsSync(fullPath)) {
    throw new Error(t(language, "cli.path_missing", { path: fullPath }));
  }

  if (!statSync(fullPath).isDirectory()) {
    throw new Error(t(language, "cli.path_not_directory", { path: fullPath }));
  }

  return fullPath;
}

function listen(server, host, preferredPort) {
  return new Promise((resolve, reject) => {
    const tryListen = (port, attemptsLeft) => {
      const onError = (error) => {
        server.off("listening", onListening);
        if (error.code === "EADDRINUSE" && attemptsLeft > 0) {
          tryListen(port + 1, attemptsLeft - 1);
          return;
        }
        reject(error);
      };

      const onListening = () => {
        server.off("error", onError);
        resolve(server.address().port);
      };

      server.once("error", onError);
      server.once("listening", onListening);
      server.listen(port, host);
    };

    tryListen(preferredPort, 20);
  });
}

function openBrowser(url) {
  const platform = process.platform;
  if (platform === "win32") {
    spawn("cmd", ["/c", "start", "", url], { detached: true, stdio: "ignore", windowsHide: true }).unref();
    return;
  }

  if (platform === "darwin") {
    spawn("open", [url], { detached: true, stdio: "ignore" }).unref();
    return;
  }

  spawn("xdg-open", [url], { detached: true, stdio: "ignore" }).unref();
}

function readJsonBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    request.setEncoding("utf8");
    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1024 * 1024) {
        request.destroy();
        reject(new Error("Request body is too large."));
      }
    });
    request.on("end", () => {
      if (!body) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(body));
      } catch {
        reject(new Error("Invalid JSON body."));
      }
    });
    request.on("error", reject);
  });
}

function sendHtml(response, html) {
  response.writeHead(200, {
    "content-type": "text/html; charset=utf-8",
    "cache-control": "no-store",
  });
  response.end(html);
}

function sendJson(response, status, data) {
  response.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
  });
  response.end(JSON.stringify(data, null, 2));
}

function htmlTemplate({ root, language }) {
  const state = JSON.stringify({ root, language });
  return `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>RepoHealth</title>
    <style>
      :root {
        color-scheme: light;
        --bg: #f6f7f4;
        --panel: #ffffff;
        --panel-strong: #eef4f1;
        --ink: #17201b;
        --muted: #65736b;
        --line: #d8ded9;
        --green: #1f7a4d;
        --green-soft: #dff1e8;
        --orange: #ad6a00;
        --orange-soft: #fff1d7;
        --red: #b33a3a;
        --red-soft: #fde4e1;
        --blue: #315f96;
        --blue-soft: #e3eef9;
        --shadow: 0 18px 50px rgba(23, 32, 27, 0.08);
      }

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        background: var(--bg);
        color: var(--ink);
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        font-size: 15px;
        letter-spacing: 0;
      }

      button,
      input,
      select {
        font: inherit;
      }

      button {
        border: 1px solid transparent;
        border-radius: 8px;
        cursor: pointer;
        min-height: 40px;
        padding: 0 14px;
        transition: background 160ms ease, border-color 160ms ease, transform 160ms ease;
      }

      button:disabled {
        cursor: not-allowed;
        opacity: 0.6;
      }

      button:not(:disabled):active {
        transform: translateY(1px);
      }

      .app {
        min-height: 100vh;
      }

      .topbar {
        background: #17201b;
        color: #f8faf7;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }

      .topbar-inner {
        max-width: 1180px;
        margin: 0 auto;
        min-height: 68px;
        padding: 0 24px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 20px;
      }

      .brand {
        display: flex;
        align-items: center;
        gap: 12px;
        min-width: 180px;
      }

      .brand-mark {
        width: 34px;
        height: 34px;
        border-radius: 8px;
        background: linear-gradient(135deg, #78c78f, #d8b45c);
        display: grid;
        place-items: center;
        color: #17201b;
        font-weight: 800;
      }

      .brand h1 {
        margin: 0;
        font-size: 20px;
        line-height: 1;
      }

      .brand small {
        display: block;
        color: #b8c5bd;
        margin-top: 4px;
        font-size: 12px;
      }

      .language {
        display: flex;
        align-items: center;
        gap: 8px;
        color: #d8e2dc;
      }

      .language select {
        min-height: 38px;
        border: 1px solid rgba(255, 255, 255, 0.18);
        background: rgba(255, 255, 255, 0.08);
        color: #fff;
        border-radius: 8px;
        padding: 0 10px;
      }

      .language option {
        color: #17201b;
      }

      main {
        max-width: 1180px;
        margin: 0 auto;
        padding: 28px 24px 48px;
      }

      .workspace {
        background: var(--panel);
        border: 1px solid var(--line);
        border-radius: 8px;
        box-shadow: var(--shadow);
        padding: 18px;
      }

      .path-row {
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto auto auto;
        gap: 10px;
        align-items: end;
      }

      label {
        display: grid;
        gap: 7px;
        color: var(--muted);
        font-weight: 600;
      }

      input {
        width: 100%;
        min-height: 42px;
        border-radius: 8px;
        border: 1px solid var(--line);
        padding: 0 12px;
        color: var(--ink);
        background: #fff;
      }

      input:focus,
      select:focus,
      button:focus-visible {
        outline: 3px solid rgba(49, 95, 150, 0.25);
        outline-offset: 2px;
      }

      .primary {
        background: var(--green);
        color: white;
      }

      .secondary {
        background: var(--blue-soft);
        color: #173f69;
        border-color: #c5d8ea;
      }

      .danger {
        background: var(--red);
        color: white;
      }

      .results {
        display: grid;
        grid-template-columns: 290px minmax(0, 1fr);
        gap: 18px;
        margin-top: 18px;
        align-items: start;
      }

      .score-panel,
      .checks-panel,
      .changes-panel {
        background: var(--panel);
        border: 1px solid var(--line);
        border-radius: 8px;
      }

      .score-panel {
        padding: 18px;
      }

      .score-ring {
        width: 176px;
        aspect-ratio: 1;
        border-radius: 50%;
        margin: 4px auto 16px;
        display: grid;
        place-items: center;
        background: conic-gradient(var(--green) calc(var(--score, 0) * 1%), #e3e8e4 0);
      }

      .score-ring-inner {
        width: 126px;
        aspect-ratio: 1;
        border-radius: 50%;
        background: #fff;
        display: grid;
        place-items: center;
        text-align: center;
        border: 1px solid var(--line);
      }

      .score-number {
        font-size: 34px;
        line-height: 1;
        font-weight: 800;
      }

      .score-grade {
        color: var(--muted);
        margin-top: 6px;
        font-weight: 700;
      }

      .summary-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 8px;
      }

      .summary-item {
        border-radius: 8px;
        padding: 10px;
        background: var(--panel-strong);
      }

      .summary-item strong {
        display: block;
        font-size: 22px;
      }

      .summary-item span {
        color: var(--muted);
        font-size: 12px;
        font-weight: 700;
      }

      .checks-panel header,
      .changes-panel header {
        padding: 14px 16px;
        border-bottom: 1px solid var(--line);
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
      }

      .checks-panel h2,
      .changes-panel h2 {
        margin: 0;
        font-size: 16px;
      }

      .checks-list {
        display: grid;
      }

      .check {
        min-height: 74px;
        padding: 14px 16px;
        display: grid;
        grid-template-columns: 92px minmax(0, 1fr);
        gap: 12px;
        border-bottom: 1px solid var(--line);
      }

      .check:last-child {
        border-bottom: 0;
      }

      .badge {
        align-self: start;
        border-radius: 999px;
        min-height: 28px;
        padding: 5px 10px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        font-weight: 800;
      }

      .badge.pass {
        background: var(--green-soft);
        color: var(--green);
      }

      .badge.warn {
        background: var(--orange-soft);
        color: var(--orange);
      }

      .badge.fail {
        background: var(--red-soft);
        color: var(--red);
      }

      .badge.skip {
        background: var(--blue-soft);
        color: var(--blue);
      }

      .check h3 {
        margin: 0 0 6px;
        font-size: 15px;
      }

      .check p {
        margin: 0;
        color: var(--muted);
        line-height: 1.45;
      }

      .changes-panel {
        margin-top: 18px;
        overflow: hidden;
      }

      .changes-list {
        display: grid;
      }

      .change {
        padding: 11px 16px;
        display: grid;
        grid-template-columns: 110px minmax(0, 1fr);
        gap: 12px;
        border-top: 1px solid var(--line);
      }

      .change:first-child {
        border-top: 0;
      }

      .change code {
        overflow-wrap: anywhere;
      }

      .status-line {
        min-height: 22px;
        margin-top: 12px;
        color: var(--muted);
        font-weight: 600;
      }

      .error {
        color: var(--red);
      }

      @media (max-width: 820px) {
        .topbar-inner {
          align-items: flex-start;
          flex-direction: column;
          padding-top: 16px;
          padding-bottom: 16px;
        }

        .path-row,
        .results {
          grid-template-columns: 1fr;
        }

        .path-row button {
          width: 100%;
        }

        .check,
        .change {
          grid-template-columns: 1fr;
        }

        .score-ring {
          width: 150px;
        }

        .score-ring-inner {
          width: 108px;
        }
      }
    </style>
  </head>
  <body>
    <div class="app">
      <header class="topbar">
        <div class="topbar-inner">
          <div class="brand">
            <div class="brand-mark" aria-hidden="true">R</div>
            <div>
              <h1>RepoHealth</h1>
              <small>Saúde de repositórios</small>
            </div>
          </div>
          <label class="language">
            Idioma
            <select id="language">
              <option value="pt-BR">Português Brasil</option>
              <option value="en">English</option>
            </select>
          </label>
        </div>
      </header>

      <main>
        <section class="workspace">
          <div class="path-row">
            <label>
              Caminho do repositório
              <input id="repoPath" autocomplete="off">
            </label>
            <button class="primary" id="scanButton" type="button">Escanear</button>
            <button class="secondary" id="previewButton" type="button">Prévia</button>
            <button class="danger" id="fixButton" type="button">Aplicar</button>
          </div>
          <div class="status-line" id="statusLine"></div>
        </section>

        <section class="results" aria-live="polite">
          <aside class="score-panel">
            <div class="score-ring" id="scoreRing">
              <div class="score-ring-inner">
                <div>
                  <div class="score-number" id="scoreNumber">--</div>
                  <div class="score-grade" id="scoreGrade">Nota --</div>
                </div>
              </div>
            </div>
            <div class="summary-grid">
              <div class="summary-item"><strong id="passCount">0</strong><span>OK</span></div>
              <div class="summary-item"><strong id="warnCount">0</strong><span>Avisos</span></div>
              <div class="summary-item"><strong id="failCount">0</strong><span>Falhas</span></div>
              <div class="summary-item"><strong id="skipCount">0</strong><span>Ignorados</span></div>
            </div>
          </aside>

          <section class="checks-panel">
            <header>
              <h2>Checks</h2>
              <span id="rootPath"></span>
            </header>
            <div class="checks-list" id="checksList"></div>
          </section>
        </section>

        <section class="changes-panel" id="changesPanel" hidden>
          <header>
            <h2>Arquivos</h2>
            <span id="changesMode"></span>
          </header>
          <div class="changes-list" id="changesList"></div>
        </section>
      </main>
    </div>

    <script>
      window.REPOCARE = ${state};
    </script>
    <script>
      const texts = {
        "pt-BR": {
          scanning: "Escaneando...",
          fixing: "Aplicando correções...",
          previewing: "Gerando prévia...",
          ready: "Pronto.",
          preview: "Prévia",
          applied: "Correções aplicadas.",
          noChanges: "Nenhum arquivo seguro para criar.",
          grade: "Nota",
          files: "Arquivos",
          actions: {
            "created": "criado",
            "would-create": "criaria",
            "skipped": "ignorado"
          },
          status: {
            pass: "OK",
            warn: "AVISO",
            fail: "FALHA",
            skip: "IGNORADO"
          }
        },
        en: {
          scanning: "Scanning...",
          fixing: "Applying fixes...",
          previewing: "Previewing...",
          ready: "Ready.",
          preview: "Preview",
          applied: "Fixes applied.",
          noChanges: "No safe files to create.",
          grade: "Grade",
          files: "Files",
          actions: {
            "created": "created",
            "would-create": "would create",
            "skipped": "skipped"
          },
          status: {
            pass: "OK",
            warn: "WARN",
            fail: "FAIL",
            skip: "SKIP"
          }
        }
      };

      const elements = {
        repoPath: document.querySelector("#repoPath"),
        language: document.querySelector("#language"),
        scanButton: document.querySelector("#scanButton"),
        previewButton: document.querySelector("#previewButton"),
        fixButton: document.querySelector("#fixButton"),
        statusLine: document.querySelector("#statusLine"),
        scoreRing: document.querySelector("#scoreRing"),
        scoreNumber: document.querySelector("#scoreNumber"),
        scoreGrade: document.querySelector("#scoreGrade"),
        passCount: document.querySelector("#passCount"),
        warnCount: document.querySelector("#warnCount"),
        failCount: document.querySelector("#failCount"),
        skipCount: document.querySelector("#skipCount"),
        checksList: document.querySelector("#checksList"),
        changesPanel: document.querySelector("#changesPanel"),
        changesList: document.querySelector("#changesList"),
        changesMode: document.querySelector("#changesMode"),
        rootPath: document.querySelector("#rootPath")
      };

      elements.repoPath.value = window.REPOCARE.root;
      elements.language.value = window.REPOCARE.language || "pt-BR";

      elements.scanButton.addEventListener("click", () => scan());
      elements.previewButton.addEventListener("click", () => fix({ dryRun: true }));
      elements.fixButton.addEventListener("click", () => fix({ dryRun: false }));
      elements.language.addEventListener("change", () => scan());
      elements.repoPath.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          scan();
        }
      });

      scan();

      async function scan() {
        setBusy(true, tr("scanning"));
        hideChanges();
        try {
          const result = await requestJson("/api/scan?path=" + encodeURIComponent(elements.repoPath.value) + "&lang=" + encodeURIComponent(elements.language.value));
          renderScan(result);
          setStatus(tr("ready"));
        } catch (error) {
          setError(error.message);
        } finally {
          setBusy(false);
        }
      }

      async function fix({ dryRun }) {
        setBusy(true, dryRun ? tr("previewing") : tr("fixing"));
        try {
          const payload = {
            path: elements.repoPath.value,
            lang: elements.language.value,
            dryRun
          };
          const result = await requestJson("/api/fix", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(payload)
          });
          renderScan(result.after);
          renderChanges(result.changes, dryRun);
          setStatus(dryRun ? tr("preview") + "." : tr("applied"));
        } catch (error) {
          setError(error.message);
        } finally {
          setBusy(false);
        }
      }

      async function requestJson(url, options) {
        const response = await fetch(url, options);
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Erro inesperado.");
        }
        return data;
      }

      function renderScan(result) {
        elements.scoreRing.style.setProperty("--score", result.score);
        elements.scoreNumber.textContent = String(result.score);
        elements.scoreGrade.textContent = tr("grade") + " " + result.grade;
        elements.passCount.textContent = result.summary.pass;
        elements.warnCount.textContent = result.summary.warn;
        elements.failCount.textContent = result.summary.fail;
        elements.skipCount.textContent = result.summary.skip;
        elements.rootPath.textContent = result.root;
        elements.checksList.replaceChildren(...result.checks.map(renderCheck));
      }

      function renderCheck(check) {
        const row = document.createElement("article");
        row.className = "check";

        const badge = document.createElement("span");
        badge.className = "badge " + check.status;
        badge.textContent = tr("status")[check.status] || check.status.toUpperCase();

        const content = document.createElement("div");
        const title = document.createElement("h3");
        title.textContent = check.title;
        const message = document.createElement("p");
        message.textContent = check.message;

        content.append(title, message);
        row.append(badge, content);
        return row;
      }

      function renderChanges(changes, dryRun) {
        elements.changesPanel.hidden = false;
        elements.changesMode.textContent = dryRun ? tr("preview") : tr("applied");

        if (changes.length === 0) {
          const empty = document.createElement("div");
          empty.className = "change";
          empty.textContent = tr("noChanges");
          elements.changesList.replaceChildren(empty);
          return;
        }

        elements.changesList.replaceChildren(...changes.map((change) => {
          const row = document.createElement("div");
          row.className = "change";

          const action = document.createElement("strong");
          action.textContent = tr("actions")[change.action] || change.action;

          const file = document.createElement("code");
          file.textContent = change.file;

          row.append(action, file);
          return row;
        }));
      }

      function hideChanges() {
        elements.changesPanel.hidden = true;
        elements.changesList.replaceChildren();
      }

      function setBusy(isBusy, message) {
        elements.scanButton.disabled = isBusy;
        elements.previewButton.disabled = isBusy;
        elements.fixButton.disabled = isBusy;
        if (message) {
          setStatus(message);
        }
      }

      function setStatus(message) {
        elements.statusLine.className = "status-line";
        elements.statusLine.textContent = message;
      }

      function setError(message) {
        elements.statusLine.className = "status-line error";
        elements.statusLine.textContent = message;
      }

      function tr(key) {
        const lang = texts[elements.language.value] ? elements.language.value : "pt-BR";
        return texts[lang][key];
      }
    </script>
  </body>
</html>`;
}
