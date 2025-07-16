// script.js

// Variáveis de estado e mapas de detalhes (Copiados do Index0.html)
let config = null; // vai guardar todo o conteúdo do config-imagens.json
let pontuacaoEstilos = {
  "Clássico": 0,
  "Moderno": 0, // Adicionar 'Moderno' e 'Criativo' conforme o Index0.html
  "Criativo": 0
};
let respostasEstilo = [];
let bonecaSelecionada = null; // Para a seleção visual da boneca
let tipoFisicoCalculado = null; // Para armazenar o tipo físico calculado pelas medidas

// Mapa de estilos para detalhes no resultado (Copiado do Index0.html)
const detalhesEstiloMap = {
  "Clássico": "Você tem uma preferência por looks atemporais, elegantes e com toques tradicionais. Valoriza a sofisticação e a discrição, optando por peças de alta qualidade e cortes impecáveis. Seu guarda-roupa é a base para qualquer ocasião.",
  "Moderno": "Seu estilo se inclina para o contemporâneo, com linhas limpas, minimalismo e tendências atuais. Gosta de inovar e de peças com design diferenciado, valorizando a funcionalidade e o impacto visual. Você está sempre à frente.",
  "Criativo": "Você é uma pessoa que adora ousar, misturar texturas, cores e padrões. Seu estilo é único, expressivo e cheio de personalidade, utilizando a moda como uma forma de arte. Não tem medo de experimentar e criar tendências."
};

// Mapa de tipos físicos para imagens e descrições (usando os PNGs salvos em 'imagens/') (Copiado do Index0.html)
const detalhesTipoFisicoMap = {
  "Ampulheta": {
    img: "imagens/tipo-fisico-ampulheta.png",
    desc: "Seu corpo possui ombros e quadris de larguras semelhantes, com uma cintura significativamente mais fina e marcada. É considerado um formato harmonioso e equilibrado."
  },
  "Retângulo": {
    img: "imagens/tipo-fisico-retangulo.png",
    desc: "As medidas de ombros, cintura e quadril são bastante semelhantes, criando uma silhueta mais reta e proporcional. Seu desafio é criar a ilusão de curvas."
  },
  "Triângulo (Pêra)": {
    img: "imagens/tipo-fisico-triangulo.png",
    desc: "Caracteriza-se por quadris visivelmente mais largos que os ombros, com cintura geralmente marcada. O foco é equilibrar a parte superior e inferior do corpo."
  },
  "Triângulo Invertido": {
    img: "imagens/tipo-fisico-triangulo-invertido.png",
    desc: "Seus ombros são mais largos que os quadris, criando uma silhueta em 'V'. O objetivo é suavizar os ombros e adicionar volume aos quadris."
  },
  "Oval (Maçã)": {
    img: "imagens/tipo-fisico-oval.png",
    desc: "A região da cintura é mais larga que os ombros e quadris, com a silhueta mais arredondada no centro. O ideal é alongar o tronco e valorizar pernas e braços."
  },
  "Indefinido": {
    img: "imagens/tipo-fisico-indefinido.png", // Imagem para quando não houver correspondência clara
    desc: "Com base nas medidas fornecidas, não foi possível classificar seu tipo físico de forma precisa. Por favor, verifique as medidas ou utilize a seleção visual da boneca."
  }
};


// Função para carregar o arquivo de configuração (Já existia, mantida)
async function carregarConfig() {
  try {
    const res = await fetch('config-imagens.json');
    if (!res.ok) throw new Error('Erro ao carregar config: ' + res.status);
    config = await res.json();
    console.log('Config carregada:', config);

    // Montar as seções APÓS carregar o config
    montarQuiz();
    montarTipoFisico();

  } catch (error) {
    console.error('Erro no fetch do config-imagens.json:', error);
    document.getElementById('quiz-section').innerHTML = '<p class="text-danger">Erro ao carregar dados do quiz.</p>';
    document.getElementById('tipo-fisico-section').innerHTML = '<p class="text-danger">Erro ao carregar dados do tipo físico.</p>'; // Adicionado feedback para tipo físico
  }
}

// Função para montar a seção do quiz (Modificada para adicionar lógica e classes do Index0.html)
function montarQuiz() {
  if (!config || !config.quiz || !config.quiz.perguntas) {
    console.warn("Configuração do quiz incompleta ou ausente.");
    return;
  }

  const quizSection = document.getElementById('quiz-section');
  quizSection.innerHTML = ''; // limpa

  config.quiz.perguntas.forEach((pergunta, i) => {
    const divPergunta = document.createElement('div');
    // Adiciona classes e ID para compatibilidade com CSS e lógica do Index0.html
    divPergunta.className = 'pergunta mb-4';
    divPergunta.id = `pergunta${i + 1}`;
    if (i === 0) { // A primeira pergunta deve ser ativa inicialmente
      divPergunta.classList.add('ativa');
    }

    // Título da pergunta
    const titulo = document.createElement('p'); // Usando <p> lead como no Index0.html
    titulo.className = 'lead text-center';
    titulo.innerHTML = `<strong>Pergunta ${i + 1}:</strong> ${pergunta.texto}`;
    divPergunta.appendChild(titulo);

    // Container para as opções (usando row/col como no Index0.html)
    const opcoesRow = document.createElement('div');
    opcoesRow.className = 'row justify-content-center';

    pergunta.opcoes.forEach(opcao => {
      // Elemento para cada opção (usando col e text-center como no Index0.html)
      const colOpcao = document.createElement('div');
      colOpcao.className = 'col-md-5 text-center';

      const img = document.createElement('img');
      img.src = opcao.imagem;
      img.className = 'quiz-img'; // Classe do CSS
      img.alt = opcao.estilo;
      // **ADICIONADO**: Adiciona o onclick para chamar a lógica
      img.setAttribute('onclick', `escolherEstilo('${opcao.estilo}', ${i + 1})`);


      const desc = document.createElement('p');
      desc.className = 'text-muted'; // Classe do CSS
      desc.textContent = opcao.descricao;

      colOpcao.appendChild(img);
      colOpcao.appendChild(desc);
      opcoesRow.appendChild(colOpcao);
    });

    divPergunta.appendChild(opcoesRow); // Adiciona a linha de opções à div da pergunta
    quizSection.appendChild(divPergunta); // Adiciona a div da pergunta à seção do quiz
  });
}

// Função para montar a seção de tipo físico (REESCRITA para incluir inputs e bonecas de seleção)
function montarTipoFisico() {
  if (!config || !config.tiposFisicos || !config.bonecas) {
      console.warn("Configuração de tipo físico ou bonecas incompleta ou ausente.");
      return;
  }

  const tipoFisicoSection = document.getElementById('tipo-fisico-section');
  tipoFisicoSection.innerHTML = ''; // limpa

  // Adiciona o padding, background e shadow como no Index0.html
  tipoFisicoSection.className = 'p-4 bg-white rounded shadow-sm';

  // Adiciona o parágrafo de medidas como no Index0.html
  const leadMedidas = document.createElement('p');
  leadMedidas.className = 'lead text-center mb-4';
  leadMedidas.textContent = 'Insira suas medidas (em cm) para uma análise preliminar:';
  tipoFisicoSection.appendChild(leadMedidas);

  // Adiciona os campos de input de medida como no Index0.html
  const medidasRow = document.createElement('div');
  medidasRow.className = 'row justify-content-center g-3';
  medidasRow.innerHTML = `
      <div class="col-md-4">
          <label for="ombros" class="form-label">Ombro a ombro:</label>
          <input type="number" class="form-control" id="ombros" placeholder="Ex: 40">
      </div>
      <div class="col-md-4">
          <label for="cintura" class="form-label">Cintura:</label>
          <input type="number" class="form-control" id="cintura" placeholder="Ex: 60">
      </div>
      <div class="col-md-4">
          <label for="quadril" class="form-label">Quadril:</label>
          <input type="number" class="form-control" id="quadril" placeholder="Ex: 90">
      </div>
  `;
  tipoFisicoSection.appendChild(medidasRow);

  // Adiciona o botão "Ver Tipo Físico" como no Index0.html
  const btnVerTipo = document.createElement('button');
  btnVerTipo.className = 'btn btn-success mt-4 d-block mx-auto';
  btnVerTipo.textContent = 'Ver Tipo Físico';
  // **ADICIONADO**: Adiciona o onclick para chamar a lógica de cálculo
  btnVerTipo.setAttribute('onclick', 'mostrarResultadoTipoFisico()');
  tipoFisicoSection.appendChild(btnVerTipo);

  // Adiciona a seção de seleção visual de bonecas como no Index0.html
  const visualSelectionDiv = document.createElement('div');
  visualSelectionDiv.className = 'mt-5 text-center';

  const leadVisual = document.createElement('p');
  leadVisual.className = 'lead'; // mb-4 não é necessário aqui se a div de bonecas vem logo abaixo
  leadVisual.textContent = 'Ou selecione qual boneca parece mais com você:';
  visualSelectionDiv.appendChild(leadVisual);

  const bonecasFlexContainer = document.createElement('div');
  bonecasFlexContainer.className = 'd-flex justify-content-center flex-wrap';

  // Gera as imagens das bonecas de seleção usando config.bonecas
  config.bonecas.forEach((caminhoImagem, i) => {
      const imgBoneca = document.createElement('img');
      imgBoneca.src = caminhoImagem;
      imgBoneca.className = 'boneca-img'; // Classe do CSS
      imgBoneca.alt = `Silhueta para seleção ${i + 1}`;
      // **ADICIONADO**: Adiciona o onclick para chamar a lógica de seleção
      imgBoneca.setAttribute('onclick', `selecionarBoneca(${i + 1})`);
      bonecasFlexContainer.appendChild(imgBoneca);
  });

  visualSelectionDiv.appendChild(bonecasFlexContainer);

  const smallText = document.createElement('small');
  smallText.className = 'text-muted mt-2 d-block';
  smallText.textContent = 'A escolha visual ajuda a refinar a análise do seu biotipo, especialmente se as medidas não forem exatas.';
  visualSelectionDiv.appendChild(smallText);

  tipoFisicoSection.appendChild(visualSelectionDiv); // Adiciona a seção de seleção visual
}


// Lógica para escolher estilo e avançar no quiz (Copiado do Index0.html)
function escolherEstilo(estilo, perguntaNumero) {
  pontuacaoEstilos[estilo] += 1;
  respostasEstilo.push(estilo); // Registra a resposta

  const perguntaAtual = document.getElementById(`pergunta${perguntaNumero}`);
  // Adiciona a classe para iniciar a animação de saída
  perguntaAtual.classList.add('fade-out-section');


  // Espera a animação terminar para esconder e verificar a próxima pergunta
  setTimeout(() => {
    perguntaAtual.classList.remove("ativa"); // Esconde a pergunta atual visualmente
    perguntaAtual.style.display = 'none'; // Garante que não ocupe espaço

    const proximaPergunta = document.getElementById(`pergunta${perguntaNumero + 1}`);
    if (proximaPergunta) {
      proximaPergunta.classList.add("ativa"); // Mostra a próxima pergunta (ativa animação de entrada)
      proximaPergunta.style.display = 'block'; // Garante que fique visível
       // Remove a classe de fade-out para não afetar a próxima exibição
      perguntaAtual.classList.remove('fade-out-section');
    } else {
      // Se não há próxima pergunta, o quiz terminou
      mostrarResultadoEstilo();
    }
  }, 500); // Duração da animação fadeOutAndUp no CSS (0.5s)

}

// Lógica para mostrar o resultado do estilo (Copiado e adaptado para usar o DOM gerado)
function mostrarResultadoEstilo() {
  // Calcula o estilo final (Lógica do Index0.html)
  let estiloFinal = "Indefinido";
  let maxPontos = -1;
  let estilosComMaisPontos = [];

  for (const estilo in pontuacaoEstilos) {
      if (pontuacaoEstilos[estilo] > maxPontos) {
          maxPontos = pontuacaoEstilos[estilo];
          estiloFinal = estilo; // Assume este como o principal
          estilosComMaisPontos = [estilo]; // Reinicia a lista de empate
      } else if (pontuacaoEstilos[estilo] === maxPontos && maxPontos > 0) {
          estilosComMaisPontos.push(estilo); // Adiciona ao empate
      }
  }

   // Se houver empate e mais de um estilo com pontuação máxima
   if (estilosComMaisPontos.length > 1) {
        estiloFinal = estilosComMaisPontos.join(" e "); // Ex: "Clássico e Criativo"
   } else if (maxPontos === 0) {
        estiloFinal = "Não Definido"; // Caso ninguém tenha pontos (pode acontecer se pular perguntas?)
   } else {
        estiloFinal = estilosComMaisPontos[0]; // Pega o único estilo com pontuação máxima
   }


  const quizSection = document.getElementById("quiz-section");
  const estiloResultadoDiv = document.getElementById("estilo-resultado");

  // Adiciona a classe de fade-out na seção do quiz
  quizSection.classList.add('fade-out-section');

  // Espera a animação de saída do quiz para mostrar o resultado
  setTimeout(() => {
    quizSection.style.display = 'none'; // Esconde a seção do quiz completamente
    quizSection.classList.add('d-none'); // Adiciona d-none do Bootstrap
    quizSection.classList.remove('fade-out-section'); // Limpa a classe de animação

    // Conteúdo do resultado com base no estilo final (Usando detalhesEstiloMap)
    // Pega a descrição do primeiro estilo em caso de empate, ou uma mensagem genérica
    const detalhes = detalhesEstiloMap[estilosComMaisPontos[0]] || "Não foi possível definir um estilo predominante claro com as respostas dadas. Experimente novamente ou explore outras opções!";


    // Monta o HTML do resultado como no Index0.html
    estiloResultadoDiv.innerHTML = `
        <div class="card p-4 shadow-sm" style="background-color: #fcfcfc; border-left: 8px solid #007bff; ">
            <h3 class="card-title text-center mb-3 text-primary">✨ Seu Estilo Predominante é:</h3>
            <p class="card-text text-center display-4" style="color: #6f42c1;"><strong>${estiloFinal}</strong></p>
            <p class="card-text text-center mt-4">${detalhes}</p>
            <p class="card-text text-muted text-center mt-3 small">Para uma análise ainda mais detalhada e personalizada, aprofunde-se em nossa plataforma!</p>
        </div>
    `;

    estiloResultadoDiv.style.display = 'block'; // Torna a div de resultado visível

    // Adiciona a classe 'show' para ativar a animação CSS de entrada (resultPopIn ou show)
    // Usando um pequeno delay para a animação ficar mais suave após o fade-out do quiz
    setTimeout(() => {
        estiloResultadoDiv.classList.add('show'); // Classe do CSS
    }, 50); // Pequeno delay

  }, 600); // Deve ser slightly longer than fade-out-section animation (0.5s)
}

// Lógica para mostrar o resultado do tipo físico (Copiado e adaptado)
function mostrarResultadoTipoFisico() {
  // Lógica de leitura de inputs e cálculo do tipo físico (Copiado do Index0.html)
  const ombrosInput = document.getElementById('ombros');
  const cinturaInput = document.getElementById('cintura');
  const quadrilInput = document.getElementById('quadril');

  const ombros = parseFloat(ombrosInput.value);
  const cintura = parseFloat(cinturaInput.value);
  const quadril = parseFloat(quadrilInput.value);

  // Validação de entrada (Copiado do Index0.html)
  if (isNaN(ombros) || isNaN(cintura) || isNaN(quadril) || ombros <= 0 || cintura <= 0 || quadril <= 0) {
      alert("Por favor, preencha todas as medidas com números válidos e positivos.");
      return; // Para a execução da função
  }

  let tipo = "Indefinido";

  // Regras de classificação de tipo físico (proporções aproximadas) (Copiado do Index0.html)
  const tolerancia = 0.05; // 5% de tolerância para "semelhante"

  // Lógica para Ampulheta
  if (Math.abs(ombros - quadril) / ombros < tolerancia && cintura / ombros < 0.75) {
      tipo = "Ampulheta";
  }
  // Lógica para Retângulo
  else if (Math.abs(ombros - cintura) / ombros < tolerancia && Math.abs(cintura - quadril) / cintura < tolerancia) {
      tipo = "Retângulo";
  }
  // Lógica para Triângulo (Pêra) - Quadril > Ombros
  else if (quadril > ombros * (1 + tolerancia) && quadril > cintura * (1 + tolerancia)) { // Adicionado cintura para Pêra ser mais clara
      tipo = "Triângulo (Pêra)";
  }
  // Lógica para Triângulo Invertido - Ombros > Quadril
  else if (ombros > quadril * (1 + tolerancia) && ombros > cintura * (1 + tolerancia)) { // Adicionado cintura para Triângulo Invertido ser mais claro
      tipo = "Triângulo Invertido";
  }
  // Lógica para Oval (Maçã) - Cintura > Ombros e Quadril
  else if (cintura > ombros * (1 + tolerancia) && cintura > quadril * (1 + tolerancia)) {
      tipo = "Oval (Maçã)";
  }

  // Armazena o tipo calculado para exportação
  tipoFisicoCalculado = tipo;

  const tipoFisicoSection = document.getElementById("tipo-fisico-section");
  const tipoFisicoResultadoDiv = document.getElementById("tipo-fisico-resultado");

  // Adiciona a classe de fade-out na seção de inputs
  tipoFisicoSection.classList.add('fade-out-section');

  // Espera a animação de saída para mostrar o resultado
  setTimeout(() => {
      tipoFisicoSection.style.display = 'none'; // Esconde a seção de inputs
      tipoFisicoSection.classList.add('d-none'); // Adiciona d-none do Bootstrap
      tipoFisicoSection.classList.remove('fade-out-section'); // Limpa a classe de animação

      // Obtém detalhes da boneca e descrição
      const detalhes = detalhesTipoFisicoMap[tipo] || detalhesTipoFisicoMap["Indefinido"];

      // Monta o HTML do resultado como no Index0.html
      tipoFisicoResultadoDiv.innerHTML = `
          <div class="card p-4 shadow-sm" style="background-color: #fcfcfc; border-left: 8px solid #28a745;">
              <h3 class="card-title text-center mb-3 text-success">🧍‍♀️ Seu Tipo Físico Estimado é:</h3>
              <p class="card-text text-center display-4" style="color: #6f42c1;"><strong>${tipo}</strong></p>
              <img src="${detalhes.img}" alt="Silhueta do tipo ${tipo}" class="boneca-tipo d-block mx-auto">
              <p class="card-text text-center mt-4">${detalhes.desc}</p>
              <p class="card-text text-muted text-center mt-3 small">Lembre-se que esta é uma estimativa baseada nas medidas e/ou seleção visual. Para uma análise mais aprofundada, consulte um especialista!</p>
          </div>
      `;

      tipoFisicoResultadoDiv.style.display = 'block'; // Torna a div de resultado visível

      // Adiciona a classe 'show' para ativar a animação CSS de entrada
      setTimeout(() => {
          tipoFisicoResultadoDiv.classList.add('show'); // Classe do CSS
      }, 50); // Pequeno delay

  }, 600); // Deve ser slightly longer than fade-out-section animation (0.5s)
}


// Lógica para selecionar a boneca visualmente (Copiado do Index0.html)
function selecionarBoneca(numero) {
  // Remove a classe 'selected' de todas as imagens de boneca de seleção
  document.querySelectorAll('#tipo-fisico-section .boneca-img').forEach(el => el.classList.remove('selected'));

  // Adiciona a classe 'selected' apenas à boneca clicada
  // Nota: O Index0.html usava querySelectorAll('.boneca-img') sem especificar a seção.
  // Como montarTipoFisico agora gera essas imagens dentro de #tipo-fisico-section,
  // é mais seguro usar '#tipo-fisico-section .boneca-img'.
  // O número da boneca corresponde ao índice + 1 na lista de bonecas.
  const bonecasDeSelecao = document.querySelectorAll('#tipo-fisico-section .boneca-img');
  if (numero > 0 && numero <= bonecasDeSelecao.length) {
     bonecasDeSelecao[numero - 1].classList.add('selected');
     bonecaSelecionada = numero; // Armazena a boneca selecionada visualmente
     console.log(`Boneca ${numero} selecionada! Esta escolha pode complementar a análise das medidas.`);
     // alert(`Boneca ${numero} selecionada! Esta escolha pode complementar a análise das medidas.`); // Mantido o alert original se desejar
  } else {
      console.warn(`Número de boneca inválido: ${numero}`);
  }

}


// Lógica para exportar os resultados (Copiado do Index0.html)
function exportarResultados() {
  const data = {
    estiloQuiz: {
      respostas: respostasEstilo,
      pontuacaoFinal: pontuacaoEstilos,
      // Tenta pegar o estilo predominante exibido no resultado, se houver
      estiloPredominante: document.querySelector('#estilo-resultado p.display-4 strong')?.textContent || "Ainda não definido / Quiz não completo"
    },
    tipoFisico: {
      // Pega os valores atuais dos inputs (podem estar vazios se o botão não foi clicado)
      medidas: {
        ombros: document.getElementById('ombros')?.value || "Não informado",
        cintura: document.getElementById('cintura')?.value || "Não informado",
        quadril: document.getElementById('quadril')?.value || "Não informado"
      },
      tipoFisicoCalculado: tipoFisicoCalculado || "Não calculado pelas medidas", // Inclui o tipo calculado anteriormente
      bonecaVisualSelecionada: bonecaSelecionada || "Nenhuma selecionada" // Inclui a boneca visualmente selecionada
    },
    dataExportacao: new Date().toISOString() // Data e hora atual em formato ISO
  };

  // Cria um Blob com os dados JSON (Copiado do Index0.html)
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob); // Cria um URL temporário para o Blob
  const a = document.createElement('a'); // Cria um link <a> invisível
  a.href = url; // Define o href do link como o URL do Blob
  a.download = 'resultados_analise_moda.json'; // Define o nome do arquivo para download
  a.click(); // Simula o clique no link para iniciar o download
  URL.revokeObjectURL(url); // Libera o objeto URL após o download para liberar memória
  console.log("Resultados exportados para resultados_analise_moda.json");
  // alert('Resultados exportados para resultados_analise_moda.json'); // Opcional: manter alert
}

// Quando a página carregar, chama a função para carregar config e iniciar tudo (Já existia, mantida)
window.onload = carregarConfig;
