document.addEventListener("DOMContentLoaded", () => {
  // === SCRIPT DO TESTE DE BIOTIPO FINAL ===

  // Controle de navegação entre seções
  let currentSectionIndex = 0;
  const sections = ["page1", "page2", "page3", "page4"].map(id => document.getElementById(id));


  // guarda dados da cliente (nome/email) — será enviado ao final
  
  window.cliente = { nome: '', email: '' };


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

    // Atualiza objeto global
    cliente.nome = nomeVal;
    cliente.email = emailVal;

    // Avança para próxima seção imediatamente
    nextSection();

    // Envia os dados para a planilha de forma "silenciosa" e não bloqueante
    try {
        if (typeof sendToGoogleSheet === 'function') {
            sendToGoogleSheet(cliente.nome, cliente.email, '')
                .catch(err => console.error('Erro no envio para planilha:', err));
        }
    } catch (err) {
        console.error('Erro ao chamar sendToGoogleSheet:', err);
    }
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
        biotipo = "X";
      } else {
        biotipo = "H";
      }
    } else if (difOmbroQuadril >= 7) {
      biotipo = "V";
    } else if (difQuadrilOmbro >= 7) {
      biotipo = "A";
    } else if (difCinturaOmbro >= 3 && difCinturaQuadril >= 3) {
      biotipo = "O";
    } else {
      biotipo = visual.value;
      origemResultado = "visual";
    }

    // chama exibição do resultado (apenas isso)
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
      H: { texto: 'O corpo retangular tem medidas dos ombros, cintura e quadril mais alinhadas, com definição de cintura pequena ou inexistente. A silhueta costuma ser reta e proporcional. Looks que criam pontos de foco e marcam a cintura são ótimos aliados.' },
      A: { texto: 'No corpo triangular, os quadris são mais largos que os ombros, com cintura geralmente marcada. A ideia é equilibrar as proporções, trazendo foco para a parte de cima com cores, detalhes e estruturas.' },
      V: { texto: 'O corpo triangular invertido tem os ombros mais largos que os quadris, com cintura pouco marcada. O objetivo é equilibrar a silhueta, suavizando os ombros e dando destaque à região inferior com formas, cores ou texturas.' },
      O: { texto: 'O corpo oval tem o centro do corpo mais evidente, com cintura menos marcada e, geralmente, volume concentrado na região abdominal. O foco está em alongar a silhueta e equilibrar proporções.' }
    };
    const info = descricoes[tipo] || { texto: '' };

    // Abre a página 4
    nextSection();

    const page4 = document.getElementById('page4');
    if (!page4) return console.warn('Página #page4 não encontrada.');

    // limpa conteúdo antigo
    page4.innerHTML = page4.innerHTML; // força remoção de event handlers antigos (seguro)

    // garante content-wrapper e id único para o PDF
    let wrapper = page4.querySelector('.content-wrapper');
    if (!wrapper) {
      wrapper = document.createElement('div');
      wrapper.className = 'content-wrapper';
      page4.appendChild(wrapper);
    }
    wrapper.id = 'resultado-container';

    const imagemSrc = `imagens/${imagensResultadoFinal[tipo] || 'default.jpg'}`;

    wrapper.innerHTML = `
      <h2 class="resultado-title" id="resultado-titulo">Resultado</h2>
      <p id="resultado-texto" class="resultado-resumo">${textoResumo}</p>
      <img id="imagem-resultado" src="${imagemSrc}" alt="Imagem do biotipo ${nomes[tipo] || tipo}" />
      <div class="resultado-descricao"><p>${info.texto}</p></div>
      <div class="btn-wrapper">
        <button class="btn-refazer" id="btn-refazer">Refazer o teste</button>
        <button id="btn-download-pdf" type="button">Baixar PDF</button>
      </div>
      <!-- <p class="info-envio">📩 Seu resultado foi enviado para o e-mail informado.</p> -->
    `;

    // listeners após o innerHTML
    const btnRefazer = document.getElementById('btn-refazer');
    if (btnRefazer) btnRefazer.addEventListener('click', reiniciarTeste);

    const btnDownload = document.getElementById('btn-download-pdf');
    if (btnDownload && !btnDownload.dataset.pdfHandled) {
      btnDownload.dataset.pdfHandled = '1';
      btnDownload.addEventListener('click', () => {
        if (window._pdfGenerating) return;
        const safeName = (cliente && cliente.nome) ? cliente.nome.replace(/\s+/g,'_').replace(/[^a-zA-Z0-9_-]/g,'') : 'cliente';
        generatePdfAndDownload(`resultado_${safeName}.pdf`);
      });
    }

    // Disparos silenciosos: enviar para Planilha e gerar PDF automaticamente
    // (Não bloqueante. use handleResultadoExibicao que você já adicionou)
    // Apenas envia os dados para planilha (não gera PDF automaticamente)
    try {
      if (typeof sendToGoogleSheet === 'function') {
        sendToGoogleSheet(cliente.nome || '', cliente.email || '', nomes[tipo] || tipo);
      }
    } catch (err) {
      console.error('Erro ao acionar envio:', err);
    }

    sendToGoogleSheet(cliente.nome, cliente.email, nomes[tipo] || tipo);

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

  function reiniciarTeste() {
    // oculta a seção atual
    if (sections[currentSectionIndex]) {
      sections[currentSectionIndex].classList.remove("active-section");
      sections[currentSectionIndex].classList.add("hidden-section");
    }

    // volta para a primeira
    currentSectionIndex = 0;
    if (sections[currentSectionIndex]) {
      sections[currentSectionIndex].classList.remove("hidden-section");
      sections[currentSectionIndex].classList.add("active-section");
    }

    // limpa campos
    const ombrosEl = document.getElementById("ombros");
    const cinturaEl = document.getElementById("cintura");
    const quadrilEl = document.getElementById("quadril");
    if (ombrosEl) ombrosEl.value = "";
    if (cinturaEl) cinturaEl.value = "";
    if (quadrilEl) quadrilEl.value = "";

    const textoEl = document.getElementById("resultado-texto");
    if (textoEl) textoEl.textContent = "";

    const imgEl = document.getElementById("imagem-resultado");
    if (imgEl) { imgEl.src = ""; imgEl.alt = ""; }

    resetOpcaoVisual();
    window.scrollTo({ top: 0, behavior: "auto" });
  }

    // Expor as funções ao escopo global (para os botões funcionarem)
  window.validarDadosCliente = validarDadosCliente;
  window.validarMedidas = validarMedidas;
  window.nextSection = nextSection;
  window.calcularResultado = calcularResultado;
  window.reiniciarTeste = reiniciarTeste;
  
});


function sendToGoogleSheet(nomeVal, emailVal, resultado) {
    try {
        const base = 'https://script.google.com/macros/s/AKfycbyQ3aZ0dXZtChuFr3J75n5MHTVYQSLsWsbVgGlzVbj8htHxyzseDoyQnZhh5Su6ULyb/exec';
        const params = new URLSearchParams({
            nome: nomeVal || '',
            email: emailVal || '',
            resultado: resultado || '',
            data: new Date().toISOString(),
            secret: 'Armario@2025'
        }).toString();

        const url = base + '?' + params + '&_t=' + Date.now();

        // envio "silencioso" usando Image (não bloqueia)
        const img = new Image();
        img.src = url;

        console.log('sendToGoogleSheet enviado:', { nomeVal, emailVal, resultado });
    } catch (err) {
        console.error('Erro ao enviar para planilha:', err);
    }
}

async function generatePdfAndDownload(filename, nomeVal = '', emailVal = '') {
  console.log("DEBUG: generatePdfAndDownload chamado (force-print v3)");

  if (!window.jspdf || !window.jspdf.jsPDF) {
    alert('jsPDF não carregado.');
    return;
  }
  if (window._pdfGenerating) {
    console.warn('PDF já em geração');
    return;
  }
  window._pdfGenerating = true;

  const loadScript = (src) => new Promise((res, rej) => {
    if (document.querySelector(`script[data-src='${src}']`)) return res();
    const s = document.createElement('script');
    s.dataset.src = src;
    s.src = src;
    s.onload = res;
    s.onerror = rej;
    document.head.appendChild(s);
  });

  try {
    // selectors prováveis para a "última tela"
    const selectors = ['#resultado-container', '#page4', '.resultado-final', '.resultado-wrapper', '.content-wrapper.active-section'];
    let wrapper = null;
    for (const sel of selectors) {
      wrapper = document.querySelector(sel);
      if (wrapper) break;
    }
    if (!wrapper) {
      console.warn('Wrapper de resultado não encontrado. Tentando usar body como fallback.');
      wrapper = document.body;
    }

    // esconde controles dentro do wrapper para captura
    const hiddenEls = [];
    wrapper.querySelectorAll('button, input[type=button], input[type=submit], .no-print, .btn').forEach(el => {
      hiddenEls.push({ el, disp: el.style.display });
      el.style.display = 'none';
    });

    // garante html2canvas
    if (typeof html2canvas === 'undefined') {
      try {
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js');
        if (typeof html2canvas === 'undefined') throw new Error('html2canvas não disponível');
      } catch (e) {
        console.warn('Falha ao carregar html2canvas:', e);
      }
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const margin = 36;
    let cursorY = margin;

    // 1) inserir logo no topo do PDF (tenta carregar imagens/logoredonda.png ou img existente no DOM)
    try {
      const logoEl = document.querySelector('img[src*="logoredonda.png"]') || document.querySelector('.logo-top') || null;
      let logoDataUrl = null;
      if (logoEl && logoEl.src) {
        // usa a src existente
        const canvas = document.createElement('canvas');
        const img = new Image();
        img.crossOrigin = 'anonymous';
        await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = logoEl.src; });
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        canvas.getContext('2d').drawImage(img, 0, 0);
        logoDataUrl = canvas.toDataURL('image/png');
      } else {
        // tenta carregar pelo caminho relativo
        try {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = 'imagens/logoredonda.png'; });
          const c = document.createElement('canvas');
          c.width = img.naturalWidth; c.height = img.naturalHeight;
          c.getContext('2d').drawImage(img, 0, 0);
          logoDataUrl = c.toDataURL('image/png');
        } catch (e) {
          console.warn('Logo não encontrada em DOM nem em imagens/logoredonda.png:', e);
        }
      }
      if (logoDataUrl) {
        const imgObj = new Image();
        imgObj.src = logoDataUrl;
        await new Promise((res, rej) => { imgObj.onload = res; imgObj.onerror = rej; });
        const maxLogoW = 140;
        const ratio = imgObj.naturalWidth / imgObj.naturalHeight || 1;
        const logoW = Math.min(maxLogoW, pageW - margin * 2);
        const logoH = logoW / ratio;
        const logoX = (pageW - logoW) / 2;
        doc.addImage(logoDataUrl, 'PNG', logoX, cursorY, logoW, logoH);
        cursorY += logoH + 8;
        console.log('Logo inserida no PDF.');
      } else {
        console.log('Logo não disponível para inserir no PDF.');
      }
    } catch (e) {
      console.warn('Erro ao inserir logo:', e);
    }

    // 2) tentar capturar a aparência exata da última tela com html2canvas
    let addedPreview = false;
    if (typeof html2canvas !== 'undefined') {
      try {
        // clona para não alterar o DOM visível
        const clone = wrapper.cloneNode(true);
        // força que inputs exibam seus valores (clonar não copia value para elementos de formulário)
        clone.querySelectorAll('input, textarea').forEach(n => {
          const name = n.getAttribute('name') || n.id;
          if (name) {
            const orig = document.querySelector(`#${n.id}`) || document.querySelector(`[name="${name}"]`);
            if (orig && (orig.value || orig.checked !== undefined)) {
              if (n.tagName.toLowerCase() === 'input' && (orig.type === 'checkbox' || orig.type === 'radio')) {
                if (orig.checked) n.setAttribute('checked','checked');
              } else {
                n.setAttribute('value', orig.value || '');
                if (n.tagName.toLowerCase() === 'textarea') n.textContent = orig.value || '';
              }
            }
          }
        });

        const off = document.createElement('div');
        off.style.position = 'fixed';
        off.style.left = '-9999px';
        off.style.top = '-9999px';
        off.style.width = wrapper.offsetWidth + 'px';
        off.style.height = wrapper.offsetHeight + 'px';
        off.appendChild(clone);
        document.body.appendChild(off);

        const canvas = await html2canvas(clone, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
        const dataUrl = canvas.toDataURL('image/png');
        document.body.removeChild(off);

        // desenha a captura no PDF ajustando escala para largura
        const maxW = pageW - margin * 2;
        const img = new Image();
        img.src = dataUrl;
        await new Promise((res, rej) => { img.onload = res; img.onerror = rej; });
        const ratio = img.naturalWidth / img.naturalHeight || 1;
        let drawW = Math.min(maxW, img.naturalWidth * (72/96));
        let drawH = drawW / ratio;
        if (cursorY + drawH > pageH - margin) {
          doc.addPage();
          cursorY = margin;
        }
        const x = (pageW - drawW) / 2;
        doc.addImage(dataUrl, 'PNG', x, cursorY, drawW, drawH);
        cursorY += drawH + 12;
        addedPreview = true;
        console.log('Preview (captura) adicionado ao PDF.');
      } catch (e) {
        console.warn('Falha ao capturar a tela com html2canvas:', e);
      }
    } else {
      console.log('html2canvas não disponível. Usando fallback textual/imagem.');
    }

    // 3) fallback: se captura falhar, incluir nome, email, resultado e #imagem-resultado separadamente
    if (!addedPreview) {
//       const nome = nomeVal || document.getElementById('clientName')?.value || document.getElementById('nome')?.value || '';
//      const email = emailVal || document.getElementById('clientEmail')?.value || document.getElementById('email')?.value || '';

      const nome = nomeVal || document.getElementById('clientName')?.value || '';
      const email = emailVal || document.getElementById('clientEmail')?.value || '';

      const resultadoTexto = document.getElementById('resultado-texto')?.innerText || '';
      doc.setFontSize(18);
      doc.text('Resultado do Teste de Biotipo', margin, cursorY);
      cursorY += 22;
      doc.setFontSize(12);
      doc.text(`Nome: ${nome}`, margin, cursorY); cursorY += 16;
      doc.text(`E-mail: ${email}`, margin, cursorY); cursorY += 16;
      doc.text(`Resultado: ${resultadoTexto}`, margin, cursorY); cursorY += 18;

      try {
        const imgEl = document.getElementById('imagem-resultado');
        if (imgEl && imgEl.src) {
          const tmp = new Image();
          tmp.crossOrigin = 'anonymous';
          await new Promise((res, rej) => { tmp.onload = res; tmp.onerror = rej; tmp.src = imgEl.src; });
          const maxW = pageW - margin * 2;
          const ratio = tmp.naturalWidth / tmp.naturalHeight || 1;
          let drawW = Math.min(maxW, tmp.naturalWidth * (72/96));
          let drawH = drawW / ratio;
          if (cursorY + drawH > pageH - margin) { doc.addPage(); cursorY = margin; }
          const x = (pageW - drawW) / 2;
          // converter para dataURL via canvas
          const cv = document.createElement('canvas');
          cv.width = tmp.naturalWidth; cv.height = tmp.naturalHeight;
          cv.getContext('2d').drawImage(tmp, 0, 0);
          const data = cv.toDataURL('image/png');
          doc.addImage(data, 'PNG', x, cursorY, drawW, drawH);
          cursorY += drawH + 12;
        }
      } catch (e) {
        console.warn('Erro ao adicionar imagem do resultado (fallback):', e);
      }

      const descricao = document.querySelector('.resultado-descricao p')?.innerText || '';
      if (descricao) {
        const lines = doc.splitTextToSize(descricao, pageW - margin * 2);
        if (cursorY + lines.length * 14 > pageH - margin) { doc.addPage(); cursorY = margin; }
        doc.text(lines, margin, cursorY);
        cursorY += lines.length * 14 + 8;
      }
    }

    // rodapé
    const footer = 'Gerado em: ' + new Date().toLocaleString();
    doc.setFontSize(10);
    doc.text(footer, margin, pageH - 28);

    // restaurar elementos escondidos
    hiddenEls.forEach(o => { o.el.style.display = o.disp || ''; });

    // abre preview em nova aba (blob). fallback: salvar
    try {
      const blob = doc.output('blob');
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (e) {
      doc.save(filename || 'resultado.pdf');
    }
  } catch (err) {
    console.error('generatePdfAndDownload: erro:', err);
  } finally {
    window._pdfGenerating = false;
  }
}


// Função principal chamada ao exibir resultado
async function handleResultadoExibicao(nomeVal, emailVal, resultadoTexto) {
  // envia silencioso (não bloqueante)
  // const nome_sent = document.getElementById('nome')?.value || '';
  // const email_sent = document.getElementById('email')?.value || '';
  const resultado_sent = document.getElementById('resultado-texto')?.innerText || '';
  sendToGoogleSheet(nomeVal, emailVal, resultado_sent);
  // console.log('sendToGoogleSheet chamado', { nome, email, resultado });
  // gera PDF para download
  const safeName = (nomeVal || 'cliente').replace(/\s+/g,'_').replace(/[^a-zA-Z0-9_-]/g,'');
  generatePdfAndDownload(`resultado_${safeName}.pdf`, nomeVal, emailVal);

}
