document.addEventListener("DOMContentLoaded", () => {
  // === SCRIPT DO TESTE DE BIOTIPO FINAL ===

  // Controle de navegação entre seções
  let currentSectionIndex = 0;
  const sections = ["page1", "page2", "page3", "page4"].map(id => document.getElementById(id));


  // guarda dados da cliente (nome/email) — será enviado ao final
  let cliente = { nome: '', email: '' };

  // tenta pré-popular os campos a partir da query string (?name=...&email=...) ou de window.PRELOAD_USER
  function prepopulateIfAvailable() {
    // 1) verifica variável global (opcional — backend/integração pode injetar window.PRELOAD_USER)
    if (window.PRELOAD_USER && typeof window.PRELOAD_USER === 'object') {
      cliente.nome = window.PRELOAD_USER.name || '';
      cliente.email = window.PRELOAD_USER.email || '';
    }
    // 2) fallback: query string
    const params = new URLSearchParams(window.location.search);
    if (params.get('name')) cliente.nome = decodeURIComponent(params.get('name'));
    if (params.get('email')) cliente.email = decodeURIComponent(params.get('email'));

    // aplica nos inputs, caso existam no DOM
    const nameInput = document.getElementById('clientName');
    const emailInput = document.getElementById('clientEmail');
    if (nameInput && cliente.nome) nameInput.value = cliente.nome;
    if (emailInput && cliente.email) emailInput.value = cliente.email;
  }

  // chama pre-população imediatamente (se houver dados)
  prepopulateIfAvailable();


  function validarDadosCliente() {
    const nomeInput = document.getElementById('clientName');
    const emailInput = document.getElementById('clientEmail');

    const nomeVal = nomeInput.value.trim();
    const emailVal = emailInput.value.trim();

    if (!nomeVal) {
      alert("Por favor, preencha seu nome.");
      return;
    }
    if (emailVal && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) {
      alert("O e-mail informado não parece válido. Verifique e tente novamente.");
      return;
    }

    // atualiza objeto global
    cliente.nome = nomeVal;
    cliente.email = emailVal;

    nextSection(); // avança para page2
  }


  function validarMedidas() {
    // captura medidas
    const ombros = +document.getElementById("ombros").value;
    const cintura = +document.getElementById("cintura").value;
    const quadril = +document.getElementById("quadril").value;

    // captura nome/email dos inputs (se existem)
    const nomeInput = document.getElementById('clientName');
    const emailInput = document.getElementById('clientEmail');

    const nomeVal = nomeInput ? nomeInput.value.trim() : '';
    const emailVal = emailInput ? emailInput.value.trim() : '';

    // validação: nome e email opcionais, mas se preenchidos, email deve ser válido
    if (!ombros || !cintura || !quadril) {
      alert("Preencha todas as medidas antes de prosseguir.");
      return;
    }

    if (emailVal && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) {
      alert("O e-mail informado não parece válido. Verifique e tente novamente.");
      return;
    }

    // atualiza cliente global
    cliente.nome = nomeVal || cliente.nome || '';
    cliente.email = emailVal || cliente.email || '';

    // avança
    nextSection();
  }

  function nextSection() {
    if (currentSectionIndex < sections.length - 1) {
      sections[currentSectionIndex].classList.remove("active-section");
      sections[currentSectionIndex].classList.add("hidden-section");
      currentSectionIndex++;
      sections[currentSectionIndex].classList.remove("hidden-section");
      sections[currentSectionIndex].classList.add("active-section");

      // Rola para o topo da página ao trocar de seção
      window.scrollTo({ top: 0, behavior: "auto" });

      // Se a nova seção contém opções visuais, reseta seleção
      if (sections[currentSectionIndex].querySelector("#opcoes-visuais")) {
        resetOpcaoVisual();
      }
    }
  }

  function resetOpcaoVisual() {
    document.querySelectorAll("input[name='visual']").forEach(input => input.checked = false);
    document.querySelectorAll('#opcoes-visuais label').forEach(label => {
      label.classList.remove('selected');
    });
  }

  function calcularResultado() {
    const ombros = parseFloat(document.getElementById("ombros").value);
    const cintura = parseFloat(document.getElementById("cintura").value);
    const quadril = parseFloat(document.getElementById("quadril").value);
    const visual = document.querySelector("input[name='visual']:checked");

    if (isNaN(ombros) || isNaN(cintura) || isNaN(quadril) || !visual) {
      alert("Por favor, preencha todas as medidas e selecione uma opção visual.");
      return;
    }

    let biotipo = "";
    let origemResultado = "medidas";

    const difOmbroQuadril = ombros - quadril;
    const difQuadrilOmbro = quadril - ombros;
    const difCinturaOmbro = cintura - ombros;
    const difCinturaQuadril = cintura - quadril;

    if (Math.abs(difOmbroQuadril) <= 3 && Math.abs(difQuadrilOmbro) <= 3) {
      if (cintura <= ombros - 10 && cintura <= quadril - 10) {
        biotipo = "X"; // Ampulheta
      } else {
        biotipo = "H"; // Retângulo
      }
    } else if (difOmbroQuadril >= 7) {
      biotipo = "V"; // Triângulo Invertido
    } else if (difQuadrilOmbro >= 7) {
      biotipo = "A"; // Triangular
    } else if (difCinturaOmbro >= 3 && difCinturaQuadril >= 3) {
      biotipo = "O"; // Oval
    } else {
      biotipo = visual.value;
      origemResultado = "visual";
    }

    exibirResultado(biotipo, origemResultado);
  }

function exibirResultado(tipo, origem) {
  const nomes = {
    X: "Ampulheta (X)",
    H: "Retangular (H)",
    A: "Triangular (A)",
    V: "Triângulo Invertido (V)",
    O: "Oval (O)"
  };

  const imagensResultadoFinal = {
    X: "Bonca_Ampulheta.jpg",
    H: "Bonca_Retangular.jpg",
    A: "Bonca_Triangular.jpg",
    V: "Bonca_Triangular Invertido.jpg",
    O: "Bonca_Oval.jpg"
  };

  let textoResumo = nomes[tipo] || "Não identificado";
  if (origem === "visual") {
    textoResumo += " — resultado baseado na sua percepção visual.";
  } else {
    textoResumo += " — resultado calculado com base nas medidas informadas.";
  }

  const descricoes = {
    X: { texto: 'O corpo ampulheta tem ombros e quadris alinhados, com a cintura bem marcada. É uma silhueta proporcional e curvilínea. O foco está em valorizar essas curvas naturais sem esconder a cintura. Peças que acompanham a linha do corpo funcionam muito bem.' },
    H: { texto: 'O corpo retangular tem medidas dos ombros, cintura e quadril mais alinhadas, com pouca definição de cintura. A silhueta costuma ser reta e proporcional. Looks que criam pontos de foco e marcam a cintura são ótimos aliados.' },
    A: { texto: 'No corpo triangular, os quadris são mais largos que os ombros, com cintura geralmente marcada. A ideia é equilibrar as proporções, trazendo foco para a parte de cima com cores, detalhes e estruturas.' },
    V: { texto: 'O corpo triangular invertido tem os ombros mais largos que os quadris, com cintura pouco marcada. O objetivo é equilibrar a silhueta, suavizando os ombros e dando destaque à região inferior com formas, cores ou texturas.' },
    O: { texto: 'O corpo oval tem o centro do corpo mais evidente, com cintura menos marcada e, geralmente, volume concentrado na região abdominal. O foco está em alongar a silhueta e equilibrar proporções.' }
  };
  const info = descricoes[tipo] || { texto: '' };

  nextSection(); // abre page4

  const page4 = document.getElementById('page4');
  if (!page4) return console.warn('Página #page4 não encontrada.');

  // remove quaisquer restos antigos dentro de page4 (botões, títulos, etc)
  page4.querySelectorAll('.resultado-title, #resultado-texto, #imagem-resultado, .resultado-descricao, .btn-wrapper, button[onclick="reiniciarTeste()"]').forEach(el => el.remove());

  // garante content-wrapper único
  let wrapper = page4.querySelector('.content-wrapper');
  if (!wrapper) {
    wrapper = document.createElement('div');
    wrapper.className = 'content-wrapper';
    page4.appendChild(wrapper);
  }

  const imagemSrc = `imagens/${imagensResultadoFinal[tipo] || 'default.png'}`;

  wrapper.innerHTML = `
    <h2 class="resultado-title">Resultado</h2>
    <p id="resultado-texto" class="resultado-resumo">${textoResumo}</p>
    <img id="imagem-resultado" src="${imagemSrc}" alt="Imagem ilustrativa do biotipo ${nomes[tipo] || tipo}" />
    <div class="resultado-descricao"><p>${info.texto}</p></div>
    <div class="btn-wrapper"><button class="btn-refazer" onclick="reiniciarTeste()">Refazer o teste</button></div>
    <p class="info-envio">📩 Seu resultado foi enviado para o e-mail informado.</p>
  `;

  // --- envia resultado + contato ao webhook (n8n) para armazenar e disparar e-mail
  (function sendToIntegration() {
    // nome/email preferencialmente da variável cliente, se preenchida; senão tenta pegar dos inputs (backup)
    const nomeParaEnvio = cliente.nome || document.getElementById('clientName')?.value || '';
    const emailParaEnvio = cliente.email || document.getElementById('clientEmail')?.value || '';

    // monta payload
    const payload = {
      nome: nomeParaEnvio,
      email: emailParaEnvio,
      resultado: nomes[tipo] || tipo,
      origem: origem // 'medidas' ou 'visual'
    };

    // só envia se houver email (evita chamadas inúteis). Caso queira sempre salvar, remova essa checagem.
    if (!payload.email) {
      console.info('Nenhum e-mail disponível — não será enviado ao webhook.');
      return;
    }

    // URL do webhook n8n
        
    const N8N_WEBHOOK_URL = 'https://marinanaves.app.n8n.cloud/webhook/teste-biotipo';
    

    fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    .then(res => {
      if (!res.ok) throw new Error('Falha ao enviar ao webhook: ' + res.status);
      console.info('Resultado enviado ao webhook com sucesso.');
    })
    .catch(err => {
      console.error('Erro ao enviar resultado ao webhook:', err);
    });
  })();


}


  function reiniciarTeste() {
    // Oculta a tela atual (resultado)
    sections[currentSectionIndex].classList.remove("active-section");
    sections[currentSectionIndex].classList.add("hidden-section");

    // Reseta índice e mostra a primeira seção
    currentSectionIndex = 0;
    sections[currentSectionIndex].classList.remove("hidden-section");
    sections[currentSectionIndex].classList.add("active-section");

    // Limpa todos os campos
    document.getElementById("ombros").value = "";
    document.getElementById("cintura").value = "";
    document.getElementById("quadril").value = "";
    document.getElementById("resultado-texto").textContent = "";
    document.getElementById("imagem-resultado").src = "";
    document.getElementById("imagem-resultado").alt = "";

    resetOpcaoVisual();
    window.scrollTo({ top: 0, behavior: "auto" });
  }

  // Inserção dinâmica das imagens e textos da pergunta visual
  const container = document.getElementById("opcoes-visuais");

  const opcoes = [
    {
      valor: "X",
      imagem: "Ampulheta.jpg",
      texto: "A) Sinto que meus ombros e quadris têm medidas próximas ou idênticas e minha cintura é visivelmente mais fina."
    },
    {
      valor: "H",
      imagem: "Retangular.jpg",
      texto: "B) Meus ombros e quadris têm medidas próximas e minha cintura tem pouca ou nenhuma curvatura."
    },
    {
      valor: "A",
      imagem: "Triangular.jpg",
      texto: "C) Meu quadril é mais largo que os ombros e minha cintura é visivelmente mais fina."
    },
    {
      valor: "V",
      imagem: "Triangular Invertido.jpg",
      texto: "D) Meus ombros são mais largos que meu quadril, e minha cintura é reta ou pouco curva."
    },
    {
      valor: "O",
      imagem: "Oval.jpg",
      texto: "E) Minha barriga é visivelmente mais larga que meu quadril e ombros."
    }
  ];

  container.innerHTML = "";

  opcoes.forEach((opcao) => {
    const label = document.createElement("label");
    label.classList.add("visual-option");
    label.style.cursor = "pointer";

    const radio = document.createElement("input");
    radio.type = "radio";
    radio.name = "visual";
    radio.value = opcao.valor;

    const img = document.createElement("img");
    img.src = `imagens/${opcao.imagem}`;
    img.alt = `Imagem ${opcao.valor}`;
    img.style.display = "block";
    img.style.marginBottom = "10px";
    img.style.borderRadius = "6px";
    img.style.objectFit = "contain";

    const span = document.createElement("span");
    span.textContent = opcao.texto;
    span.style.display = "block";

    label.appendChild(radio);
    label.appendChild(img);
    label.appendChild(span);

    container.appendChild(label);
  });

  // Destaque visual ao selecionar
  document.querySelectorAll('#opcoes-visuais input[type="radio"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      document.querySelectorAll('#opcoes-visuais label').forEach(label => {
        label.classList.remove('selected');
      });
      e.target.parentElement.classList.add('selected');
    });
  });

  // Expor as funções ao escopo global (para os botões funcionarem)
  window.validarDadosCliente = validarDadosCliente;
  window.validarMedidas = validarMedidas;
  window.nextSection = nextSection;
  window.calcularResultado = calcularResultado;
  window.reiniciarTeste = reiniciarTeste;
  
});
