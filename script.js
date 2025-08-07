// === SCRIPT DO TESTE DE BIOTIPO REVISADO ===

// Variáveis de controle da navegação entre seções
let currentSectionIndex = 0;
const sections = ["page1","page2","page3","page4"]
.map(id => document.getElementById(id));

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

// Avança para a próxima seção do teste
function nextSection() {
  if (currentSectionIndex < sections.length - 1) {
    sections[currentSectionIndex].classList.remove("active-section");
    sections[currentSectionIndex].classList.add("hidden-section");
    currentSectionIndex++;
    sections[currentSectionIndex].classList.remove("hidden-section");
    sections[currentSectionIndex].classList.add("active-section");

    // Se a nova seção contém opções visuais, reseta seleção para evitar pré-seleção
    if (sections[currentSectionIndex].querySelector("#opcoes-visuais")) {
      resetOpcaoVisual();
    }
  }
}

// Função que reseta seleção visual das opções e remove destaque das labels
function resetOpcaoVisual() {
  document.querySelectorAll("input[name='visual']").forEach(input => input.checked = false);
  document.querySelectorAll('#opcoes-visuais label').forEach(label => {
    label.style.borderColor = 'transparent';
  });
}

// Calcula o biotipo com base nas medidas e opção visual selecionada
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
    biotipo = visual.value; // fallback para percepção visual
  }

  exibirResultado(biotipo);
}

// Exibe o resultado do biotipo com texto e imagem
function exibirResultado(tipo) {
  const resultadoTexto = document.getElementById("resultado-texto");
  const imagemResultado = document.getElementById("imagem-resultado");

  const nomes = {
    X: "Ampulheta (X)",
    H: "Retangular (H)",
    A: "Triangular (A)",
    V: "Triângulo Invertido (V)",
    O: "Oval (O)"
  };

  const imagens = {
    X: "Ampulheta.png",
    H: "Retangular.png",
    A: "Triangular.png",
    V: "Triangular Invertido.png",
    O: "Oval.png"
  };

  resultadoTexto.textContent = nomes[tipo] || "Não identificado";
  imagemResultado.src = `imagens/${imagens[tipo] || 'default.png'}`;
  imagemResultado.alt = `Imagem do biotipo ${nomes[tipo] || tipo}`;

  nextSection();
}

// === INSERÇÃO DAS IMAGENS E TEXTOS DA QUESTÃO VISUAL ===
document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("opcoes-visuais");

  const opcoes = [
    {
      valor: "X",
      imagem: "Ampulheta.png",
      texto: "A) Sinto que meus ombros e quadris tem medidas próximas ou idênticas e minha cintura é visivelmente mais fina."
    },
    {
      valor: "H",
      imagem: "Retangular.png",
      texto: "B) Sinto que meus ombros e quadris tem medidas próximas ou idênticas e minha cintura tem pouca ou nenhuma curvatura."
    },
    {
      valor: "A",
      imagem: "Triangular.png",
      texto: "C) Sinto que a circunferência do meu quadril é mais larga que a minha circunferência de ombros, ele é o que mais se destaca no meu corpo e minha cintura é visivelmente mais fina."
    },
    {
      valor: "V",
      imagem: "Triangular Invertido.png",
      texto: "D) Sinto que a circunferência dos meus ombros é mais larga do que a do meu quadril, eles são a região de maior destaque no meu corpo. Minha cintura é reta ou pouco curva e meu quadril em relação aos ombros é menor, mesmo que não seja pequeno."
    },
    {
      valor: "O",
      imagem: "Oval.png",
      texto: "E) Sinto que a região da minha barriga é visivelmente mais larga do que a minha circunferência de quadril e de ombros, ela é a área que mais se destaca no meu corpo."
    }
  ];

  // Limpa container antes de inserir (caso rode mais de uma vez)
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
    // Removido estilo inline de largura para deixar CSS controlar
    // img.style.maxWidth = "200px";
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

  // Listener para destacar a label da opção selecionada
  document.querySelectorAll('#opcoes-visuais input[type="radio"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      document.querySelectorAll('#opcoes-visuais label').forEach(label => {
        label.classList.remove('selected');
      });
      e.target.parentElement.classList.add('selected');
    });
  });
});
