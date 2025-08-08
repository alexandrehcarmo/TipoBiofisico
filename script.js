document.addEventListener("DOMContentLoaded", () => {
  // === SCRIPT DO TESTE DE BIOTIPO FINAL ===

  // Controle de navegação entre seções
  let currentSectionIndex = 0;
  const sections = ["page1", "page2", "page3", "page4"].map(id => document.getElementById(id));

  function validarMedidas() {
    const ombros = +document.getElementById("ombros").value;
    const cintura = +document.getElementById("cintura").value;
    const quadril = +document.getElementById("quadril").value;

    if (!ombros || !cintura || !quadril) {
      alert("Preencha todas as medidas antes de prosseguir.");
      return;
    }

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
  const resultadoTexto = document.getElementById("resultado-texto");
  const imagemResultado = document.getElementById("imagem-resultado");

  const nomes = {
    X: "Ampulheta (X)",
    H: "Retangular (H)",
    A: "Triangular (A)",
    V: "Triângulo Invertido (V)",
    O: "Oval (O)"
  };

  const imagensResultadoFinal = {
    X: "Bonca_Ampulheta.png",
    H: "Bonca_Retangular.png",
    A: "Bonca_Triangular.png",
    V: "Bonca_Triangular Invertido.png",
    O: "Bonca_Oval.png"
  };

  let texto = nomes[tipo] || "Não identificado";

  if (origem === "visual") {
    texto += " — resultado baseado na sua percepção visual.";
  } else {
    texto += " — resultado calculado com base nas medidas informadas.";
  }

  resultadoTexto.textContent = texto; // LINHA ALTERADA: 'texto' já contém o nome do biotipo e a origem

  imagemResultado.src = `imagens/${imagensResultadoFinal[tipo] || 'default.png'}`;
  imagemResultado.alt = `Imagem ilustrativa do biotipo ${nomes[tipo] || tipo}`;


 // ── INÍCIO: exibe só a descrição do biotipo identificado ── 08/08
 // remove bloco antigo, se existir
 const antigo = document.querySelector('.descricao-resultado');
 if (antigo) antigo.remove();

 // mapeia cada tipo ao seu título e texto
 const descricoes = {
   X: {
     titulo: 'Ampulheta',
     texto: 'O corpo ampulheta tem ombros e quadris alinhados, com a cintura bem marcada. É uma silhueta proporcional e curvilínea. O foco está em valorizar essas curvas naturais sem esconder a cintura. Peças que acompanham a linha do corpo funcionam muito bem.'
   },
   H: {
     titulo: 'Retangular',
     texto: 'O corpo retangular tem medidas dos ombros, cintura e quadril mais alinhadas, com pouca definição de cintura. A silhueta costuma ser reta e proporcional. É um biotipo versátil, que permite criar curvas ou valorizar a estrutura natural com equilíbrio. Looks que criam pontos de foco e marcam a cintura são ótimos aliados.'
   },
   A: {
     titulo: 'Triangular',
     texto: 'No corpo triangular, os quadris são mais largos que os ombros, com cintura geralmente marcada. O volume se concentra na parte inferior da silhueta. A ideia é equilibrar as proporções, trazendo foco para a parte de cima com cores, detalhes e estruturas.'
   },
   V: {
     titulo: 'Triangular invertido',
     texto: 'O corpo triangular invertido tem os ombros mais largos que os quadris, com cintura pouco marcada. O volume está concentrado na parte superior. O objetivo é equilibrar a silhueta, suavizando os ombros e dando destaque à região inferior com formas, cores ou texturas.'
   },
   O: {
     titulo: 'Oval',
     texto: 'O corpo oval tem o centro do corpo mais evidente, com cintura menos marcada e, geralmente, volume concentrado na região abdominal. Os ombros e quadris tendem a ser mais estreitos em comparação com o centro. O foco está em alongar a silhueta e equilibrar proporções. Peças com linhas verticais e tecidos fluidos funcionam super bem.'
   }
 };
 const info = descricoes[tipo] || { titulo: '', texto: '' };

 // monta e injeta o HTML com a classe .page1 para herdar seu CSS
 const html = `
   <div class="resultado-descricao">
     <h2>${info.titulo}</h2>
     <p>${info.texto}</p> // Removendo a classe 'page1'
   </div>
 `;
 const btn = document.querySelector("button[onclick='reiniciarTeste()']");
 if (btn) btn.insertAdjacentHTML('beforebegin', html);
 // ── FIM: exibe só a descrição do biotipo identificado ──

  nextSection();
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
      imagem: "Ampulheta.png",
      texto: "A) Sinto que meus ombros e quadris têm medidas próximas ou idênticas e minha cintura é visivelmente mais fina."
    },
    {
      valor: "H",
      imagem: "Retangular.png",
      texto: "B) Meus ombros e quadris têm medidas próximas e minha cintura tem pouca ou nenhuma curvatura."
    },
    {
      valor: "A",
      imagem: "Triangular.png",
      texto: "C) Meu quadril é mais largo que os ombros e minha cintura é visivelmente mais fina."
    },
    {
      valor: "V",
      imagem: "Triangular Invertido.png",
      texto: "D) Meus ombros são mais largos que meu quadril, e minha cintura é reta ou pouco curva."
    },
    {
      valor: "O",
      imagem: "Oval.png",
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
  window.validarMedidas = validarMedidas;
  window.nextSection = nextSection;
  window.calcularResultado = calcularResultado;
  window.reiniciarTeste = reiniciarTeste;


    // ── INÍCIO: inserir descrição de biotipos antes do botão "Refazer o teste" ── em 08/08
  const descricaoCorpo = `
    <div class="descricao-resultado">
      <h3>Ampulheta</h3>
      <p>O corpo ampulheta tem ombros e quadris alinhados, com a cintura bem marcada. 
         É uma silhueta proporcional e curvilínea. O foco está em valorizar essas curvas naturais sem esconder a cintura. 
         Peças que acompanham a linha do corpo funcionam muito bem.</p>
      <h3>Retangular</h3>
      <p>O corpo retangular tem medidas dos ombros, cintura e quadril mais alinhadas, com pouca definição de cintura. 
         A silhueta costuma ser reta e proporcional. É um biotipo versátil, que permite criar curvas ou valorizar a 
         estrutura natural com equilíbrio. Looks que criam pontos de foco e marcam a cintura são ótimos aliados.</p>
      <h3>Triangular</h3>
      <p>No corpo triangular, os quadris são mais largos que os ombros, com cintura geralmente marcada. 
         O volume se concentra na parte inferior da silhueta. A ideia é equilibrar as proporções, trazendo foco para a
         parte de cima com cores, detalhes e estruturas.</p>
      <h3>Triangular invertido</h3>
      <p>O corpo triangular invertido tem os ombros mais largos que os quadris, com cintura pouco marcada. 
         O volume está concentrado na parte superior. O objetivo é equilibrar a silhueta, suavizando os ombros e dando 
         destaque à região inferior com formas, cores ou texturas.</p>
      <h3>Oval</h3>
      <p>O corpo oval tem o centro do corpo mais evidente, com cintura menos marcada e, geralmente, volume concentrado 
         na região abdominal. Os ombros e quadris tendem a ser mais estreitos em comparação com o centro. 
         O foco está em alongar a silhueta e equilibrar proporções. Peças com linhas verticais e tecidos fluidos funcionam
         super bem.</p>
    </div>
  `;

    // Seleciona o botão pelo atributo onclick
  const btnRefazer = document.querySelector("button[onclick='reiniciarTeste()']");
  if (btnRefazer) {
    btnRefazer.insertAdjacentHTML('beforebegin', descricaoCorpo);
  }
  
});
