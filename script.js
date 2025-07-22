    // --- VARIÁVEIS GLOBAIS E DE LÓGICA ---
    let pontuacaoEstilos = {};
    let respostasPorPergunta = {};
    let estilosPrimarioSecundario = { primary: null, secondary: null, tertiary: null };
    let perguntaAtualIndice = -1;
    let faseAtual = 1;
    const totalPerguntas = 35;
    const todosOsEstilos = ["clássica", "tradicional", "dramática", "romântica", "sexy", "criativa", "básica"];
    const labelsOpcoes = ["A", "B", "C", "D", "E", "F", "G"];
    let todasAsPerguntas = [];
    let phaseResultModal;

    // Guarda, para cada fase, o mapa de pontuações antes do reset
    const faseCounts = {
        1: {},
        2: {},
        3: {}
    };

    // Mapeamentos
    const imagemRanges = { 15: [3, 9], 16: [11, 17], 17: [19, 25], 18: [27, 33], 19: [35, 41], 20: [43, 49], 21: [51, 57], 22: [59, 65], 23: [67, 73], 24: [75, 81], 25: [83, 89], 26: [91, 97], 27: [99, 105], 28: [107, 113], 29: [115, 121], 30: [123, 129], 31: [131, 137], 32: [139, 145], 33: [147, 153], 34: [155, 161], 35: [163, 169] };
    const detalhesEstiloMapCompleto = { "clássica": "Você é elegante, refinada e feminina, prezando por acabamentos impecáveis e atemporalidade. Seu estilo é sofisticado, discreto, e você gosta de se enfeitar, encontrando prazer em combinar peças clássicas com detalhes que revelam uma sofisticação natural.", "tradicional": "Você é elegante, refinada e prática, valorizando a funcionalidade acima de tudo. Gosta de estar bem vestida com peças atemporais, clássicas e sóbrias, sem precisar dedicar muito tempo a isso. Discrição e eficiência são a sua marca.", "dramática": "Você é elegante, moderna e poderosa, buscando impacto sem dizer uma palavra. Adora misturar elementos diferentes para criar contrapontos, com roupas clássicas que possuem toques modernos, cores e elementos marcantes, sempre em busca de um visual interessante e contemporâneo.", "romântica": "Você é elegante, feminina e delicada, expressando leveza através das suas roupas. Prefere elementos femininos, como laços, pérolas e mangas bufantes, e se veste para realçar sua feminilidade de forma fofa e encantadora.", "sexy": "Você é elegante, feminina e atraente, buscando se sentir poderosa e desejada. Suas roupas e acessórios valorizam seu corpo de forma elegante e magnética, mostrando o suficiente para ser atraente sem ser vulgar.", "criativa": "Você é elegante, moderna e fashionista, adorando ousar e brincar com combinações inusitadas. Acompanha tendências e usa a moda como forma de expressar sua criatividade e personalidade única, sem medo de experimentar e de se destacar.", "básica": "Você é elegante, prática e natural, priorizando o conforto e a discrição. Ama roupas confortáveis, fáceis de combinar e que não chamem muita atenção, evitando formalidade excessiva e prezando por um estilo simples, chique e sem frescura." };
    const ordemDesempate = [15, 21, 29, 33, 34, 35, 32, 31, 28, 25, 20, 19, 18, 17];

    // --- Conteúdo das páginas de introdução (Exatamente como no documento original) ---
    const introPages = [
        { 
            id: "intro-page-1", 
            title:"", 
            content: `
                <p>Seja bem-vinda ao nosso teste de estilos! Aqui você responderá uma série de perguntas que foram cuidadosamente formuladas por mim, Marina, juntamente a uma equipe de consultoras e psicopedagogas. Este teste segue a metodologia Armário Perfeito de Consultoria de Imagem, método desenvolvido por mim e validado pelo MEC.</p>
                <p>Dentro do método AP cada mulher possui 3 estilos predominantes: sendo um estilo primário, que é a sua identidade principal, seguido do estilo secundário e terciário.</p>
                <p>Vamos descobrir cada um deles e para isso o teste será dividido em 3 etapas:</p>
                <ol>
                    <li> a descoberta do estilo primário</li>
                    <li> a descoberta do estilo secundário</li>
                    <li> a descoberta do estilo terciário</li>
                </ol>
                <p>Vamos começar? Separe 30 minutos para responder!</p>
            ` 
        }
    ];
    
    let currentIntroPageIndex = 0;

    function initQuiz() {
        phaseResultModal = new bootstrap.Modal(document.getElementById('phase-result-modal'));
        document.getElementById('quiz-section').style.display = 'none';
        document.getElementById('final-resultado').style.display = 'none';
        document.getElementById('exportButtonContainer').style.display = 'none';
        showIntroPage();
        window.scrollTo(0, 0); // Para garantir que a página role para o topo ao iniciar
    }

    function showIntroPage() {
        const introSection = document.getElementById('intro-section');

        introSection.innerHTML = `
        <div class="intro-page card p-4 shadow-sm active">
            ${currentIntroPageIndex === 0 ? `
                <h1 class="display-4 fw-bold mb-3">Bem-vinda ao Quiz "Armário Perfeito"!</h1>
            ` : ''}
            <h3 class="card-title text-center mb-3 text-primary">${introPages[currentIntroPageIndex].title}</h3>
            <div class="card-text">${introPages[currentIntroPageIndex].content}</div>
            <div class="navigation-buttons">
                ${currentIntroPageIndex > 0 ? '<button class="btn btn-outline-secondary" onclick="prevIntroPage()">Voltar</button>' : ''}
                <button class="btn btn-primary" onclick="nextIntroPage()">${currentIntroPageIndex < introPages.length - 1 ? 'Próximo' : 'Começar Teste'}</button>
            </div>
        </div>
        `;
        
        introSection.style.display = 'block';
    }

    function nextIntroPage() {
        if (currentIntroPageIndex < introPages.length - 1) {
            currentIntroPageIndex++;
            showIntroPage();
        } else {
                 document.getElementById('intro-section').classList.add('fade-out-section');
                 setTimeout(() => {
                    document.getElementById('intro-section').style.display = 'none';
                    startQuiz();
                 }, 500);
               }
        }

    function prevIntroPage() { if (currentIntroPageIndex > 0) { currentIntroPageIndex--; showIntroPage(); } }
    
    function startQuiz() {
        document.getElementById('quiz-section').style.display = 'block';
        loadAllQuestions();
        resetPontuacao();
        perguntaAtualIndice = 0;
        renderQuestion();
    }
    
    function resetPontuacao() { todosOsEstilos.forEach(estilo => { pontuacaoEstilos[estilo] = 0; }); }

    function renderQuestion() {   
        const quizSection = document.getElementById('quiz-section');
        quizSection.innerHTML = '';
        if (perguntaAtualIndice >= totalPerguntas) {
            processPhaseResults();
            return;
        }
        const pergunta = todasAsPerguntas[perguntaAtualIndice];
        const perguntaDiv = document.createElement('div');
        perguntaDiv.className = 'pergunta-container active card p-4 shadow-sm mb-4';
        perguntaDiv.innerHTML = `<p class="lead text-center"><strong>Pergunta ${pergunta.numero} de ${totalPerguntas} (Fase ${faseAtual})</strong></p><p class="text-center h5">${pergunta.texto}</p><div class="row justify-content-center mt-3" id="opcoes-pergunta-${pergunta.numero}"></div><div class="navigation-buttons"><button id="btn-proxima" class="btn btn-primary btn-lg" onclick="avancarParaProximaPergunta()" disabled>Próxima Pergunta</button></div>`;
        quizSection.appendChild(perguntaDiv);
        const opcoesContainer = document.getElementById(`opcoes-pergunta-${pergunta.numero}`);
        opcoesContainer.classList.add(`phase-${faseAtual}`); 
        let hasRenderableOptions = false;
        let currentVisualLabelIndex = 0;
        pergunta.opcoes.forEach(opcao => {
            const isEstiloOculto = (faseAtual === 2 && estilosPrimarioSecundario.primary === opcao.estilo) || (faseAtual === 3 && (estilosPrimarioSecundario.primary === opcao.estilo || estilosPrimarioSecundario.secondary === opcao.estilo));
            if (!isEstiloOculto) {
                hasRenderableOptions = true;
                const visualLabel = labelsOpcoes[currentVisualLabelIndex++];
                const colDiv = document.createElement('div');
                colDiv.className = pergunta.tipo === 'text' ? 'col-12' : 'col-lg-4 col-md-6';
                if (pergunta.tipo === 'text') {
                    colDiv.innerHTML = `<div class="d-grid gap-2"><label class="btn btn-outline-primary mb-2 py-3 text-start"><input type="radio" class="d-none" name="pergunta-${pergunta.numero}" value="${opcao.label}" data-estilo="${opcao.estilo}"> <strong>${visualLabel}.</strong> ${opcao.textExibicao}</label></div>`;
                } else {
                    colDiv.innerHTML = `<div class="text-center mb-3"><label class="d-block"><input type="radio" class="d-none" name="pergunta-${pergunta.numero}" value="${opcao.label}" data-estilo="${opcao.estilo}"><img src="${opcao.image}" class="quiz-img" alt="Opção ${visualLabel}"><p class="text-muted mt-2 fw-bold">${visualLabel}</p></label></div>`;
                }
                opcoesContainer.appendChild(colDiv);
            }
        });

        document.querySelectorAll(`input[name="pergunta-${pergunta.numero}"]`).forEach(input => {
            input.addEventListener('change', (event) => {
                handleAnswerSelection(pergunta.numero, event.target.dataset.estilo, event.target.value);
                if (pergunta.tipo === 'text') {
                    document.querySelectorAll(`input[name="pergunta-${pergunta.numero}"]`).forEach(radio => {
                        radio.parentElement.classList.remove('active', 'btn-primary');
                        radio.parentElement.classList.add('btn-outline-primary');
                    });
                    event.target.parentElement.classList.add('active', 'btn-primary');
                    event.target.parentElement.classList.remove('btn-outline-primary');
                } else {
                    document.querySelectorAll(`#opcoes-pergunta-${pergunta.numero} .quiz-img`).forEach(img => img.classList.remove('selected'));
                    event.target.nextElementSibling.classList.add('selected');
                }
            });
        });

        if (!hasRenderableOptions) {
            opcoesContainer.innerHTML = `<p class="text-center text-muted">Não há mais opções de estilo para esta fase. Avançando...</p>`;
            document.getElementById('btn-proxima').disabled = false;
        }

        if (perguntaDiv) { // Certifica-se de que a perguntaDiv existe
            perguntaDiv.scrollIntoView({ block: "start", behavior: "smooth" });
        }
        
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    function handleAnswerSelection(questionNumber, selectedStyle, selectedOptionLabel) {
        respostasPorPergunta[questionNumber] = { estilo: selectedStyle, label: selectedOptionLabel };
        document.getElementById('btn-proxima').disabled = false;
    }

    function avancarParaProximaPergunta() {
        const pergunta = todasAsPerguntas[perguntaAtualIndice];
        const resposta = respostasPorPergunta[pergunta.numero];
        if (resposta && resposta.estilo) {
            pontuacaoEstilos[resposta.estilo] = (pontuacaoEstilos[resposta.estilo] || 0) + 1;
        }
        perguntaAtualIndice++;
        renderQuestion();
    }

    function processPhaseResults() {
        // Antes de tudo, clone a pontuação atual naquela fase
        faseCounts[faseAtual] = { ...pontuacaoEstilos };
        // Determina o estilo vencedor da fase
        let estilosExcluidos = faseAtual === 2
            ? [estilosPrimarioSecundario.primary]
            : faseAtual === 3
            ? [estilosPrimarioSecundario.primary, estilosPrimarioSecundario.secondary]
            : [];

        const estiloVencedorDaFase = getEstiloVencedor(pontuacaoEstilos, estilosExcluidos);

        if (faseAtual === 1)   estilosPrimarioSecundario.primary   = estiloVencedorDaFase;
        if (faseAtual === 2)   estilosPrimarioSecundario.secondary = estiloVencedorDaFase;
        if (faseAtual === 3)   estilosPrimarioSecundario.tertiary  = estiloVencedorDaFase;

        // console.log(">>> Resultado da Fase", faseAtual, ":", estilosPrimarioSecundario);
        console.log(`>>> Fase ${faseAtual} contagens:`, faseCounts[faseAtual]);
        console.log(`>>> Escolhido como ${faseAtual===1?'primário':faseAtual===2?'secundário':'terciário'}:`, estiloVencedorDaFase);

        if (faseAtual < 3) {
            // mostra modal apenas nas fases 1 e 2
            const modalTitle = document.getElementById('modalLabel');
            const modalBody  = document.getElementById('modalBody');
            const modalBtn   = document.getElementById('modal-continue-btn');

            modalTitle.textContent = faseAtual === 1
            ? 'FASE 2'
            : 'FASE 3';
            modalBody.innerHTML = faseAtual === 1
            ? `Perfeito, após estas respostas descobrimos o seu estilo primário. Na segunda fase do teste vamos descobrir o seu estilo secundário. Para isso, as perguntas da fase 1 se repetem, porém, excluindo as que correspondem ao seu estilo primário. A ideia aqui é encontrar qual seria a sua segunda opção de resposta, para então identificarmos o seu estilo secundário.`
            : `Perfeito, após estas respostas já temos os seus estilos primário e secundário. Agora vamos para a terceira e última fase do teste. Nosso objetivo aqui é descobrir o seu estilo terciário. Para isso, as perguntas da fase 1 e 2 se repetem, porém, excluindo as que correspondem aos seus estilos primário e secundário. <br><br>Vamos lá?`;
            modalBtn.textContent   = faseAtual === 1 ? 'Ir para Fase 2' : 'Ir para Fase 3';
            phaseResultModal.show();
        } else {
            // — Fase 3: exibe direto o resultado final, sem modal —
            console.log(">>> Chegou na Fase 3, exibindo resultado final");
            displayFinalResults();
        }
    }

    function proceedToNextStep() {
        // Só chamados quando há modal. Aqui só avançamos fases 1 e 2.
        phaseResultModal.hide();

        faseAtual++;
        resetPontuacao();
        perguntaAtualIndice = 0;
        renderQuestion();
    }

    function displayFinalResults() {
        window.scrollTo(0, 0);
        const finalDiv = document.getElementById('final-resultado');

        // Esconde tudo o que não interessa mais
        document.getElementById('intro-section').style.display = 'none';
        document.getElementById('quiz-section').style.display  = 'none';
        document.getElementById('exportButtonContainer').style.display = 'block'; // mantém export

        // Extrai estilos finais
        const primary   = estilosPrimarioSecundario.primary   || 'NÃO DEFINIDO';
        const secondary = estilosPrimarioSecundario.secondary || 'NÃO DEFINIDO';
        const tertiary  = estilosPrimarioSecundario.tertiary  || 'NÃO DEFINIDO';

        // Busca as contagens salvas
        const count1 = faseCounts[1][primary]   ?? 0;
        const count2 = faseCounts[2][secondary] ?? 0;
        const count3 = faseCounts[3][tertiary]  ?? 0;

        const totalQuestionsForPercentage = totalPerguntas; // Base para o cálculo da porcentagem (35 perguntas totais)

        const perc1 = Math.round((count1 / totalQuestionsForPercentage) * 100);
        const perc2 = Math.round((count2 / totalQuestionsForPercentage) * 100);
        const perc3 = Math.round((count3 / totalQuestionsForPercentage) * 100);

        // Monta o HTML de resultado
        const html = `
            <div class="final-results-header">
            <h3>Diagnóstico de estilo finalizado.</h3>
            <p class="text-center mb-1">
            <p class="lead mb-1">Parabéns! Os seus estilos são:</p>
            <p class="text-left mb-4">
                <strong>Primário:</strong> ${primary.toUpperCase()} (<em>${count1} seleções - ${perc1}%</em>)<br>
                <strong>Secundário:</strong> ${secondary.toUpperCase()} (<em>${count2} seleções - ${perc2}%</em>)<br>
                <strong>Terciário:</strong> ${tertiary.toUpperCase()} (<em>${count3} seleções - ${perc3}%</em>)
            </p>
            </div>
            <div class="row justify-content-center">
            <div class="col-lg-8 mb-4">
                <div class="style-result primary-style">
                <h4><span class="style-icon">⭐</span>Estilo Primário</h4>
                <span class="style-name">${primary.toUpperCase()}</span>
                <p class="style-description">${detalhesEstiloMapCompleto[primary] || 'Descrição não disponível.'}</p>
                <p class="text-muted"><small>${count1} perguntas selecionadas nesta fase</small></p>
                </div>
            </div>
            </div>
            <div class="row justify-content-center">
            <div class="col-lg-6 mb-4">
                <div class="style-result secondary-style">
                <h4><span class="style-icon">✨</span>Estilo Secundário</h4>
                <span class="style-name">${secondary.toUpperCase()}</span>
                <p class="style-description">${detalhesEstiloMapCompleto[secondary] || 'Descrição não disponível.'}</p>
                <p class="text-muted"><small>${count2} perguntas selecionadas nesta fase</small></p>
                </div>
            </div>
            <div class="col-lg-6 mb-4">
                <div class="style-result tertiary-style">
                <h4><span class="style-icon">💫</span>Estilo Terciário</h4>
                <span class="style-name">${tertiary.toUpperCase()}</span>
                <p class="style-description">${detalhesEstiloMapCompleto[tertiary] || 'Descrição não disponível.'}</p>
                <p class="text-muted"><small>${count3} perguntas selecionadas nesta fase</small></p>
                </div>
            </div>
            </div>
            <p class="final-call-to-action">
            Para entender todos os detalhes sobre eles e saber como aplicá-los no seu armário e na sua rotina, basta acessar os materiais de cada um deles que se encontram dentro da sessão inicial do nosso aplicativo!
            </p>
        `;

        const resultadoDiv = document.getElementById('final-resultado');
        resultadoDiv.innerHTML   = html;
        resultadoDiv.style.display = 'block';
        resultadoDiv.classList.add('show');
    }


    function getEstiloVencedor(pontuacoes, estilosExcluidos) {
        let maxPontos = -1;
        let vencedoresPotenciais = [];
        todosOsEstilos.forEach(estilo => {
            if (!estilosExcluidos.includes(estilo)) {
                const pontos = pontuacoes[estilo] || 0;
                if (pontos > maxPontos) {
                    maxPontos = pontos;
                    vencedoresPotenciais = [estilo];
                } else if (pontos === maxPontos && pontos > 0) {
                    vencedoresPotenciais.push(estilo);
                }
            }
        });
        if (vencedoresPotenciais.length === 1) return vencedoresPotenciais[0];
        if (vencedoresPotenciais.length > 1) return aplicarDesempate(vencedoresPotenciais, respostasPorPergunta, estilosExcluidos);
        // Fallback para caso não encontre nenhum vencedor potencial (todos excluídos ou 0 pontos)
        /* Adicione a linha abaixo (será a linha 460)  console.log("getEstiloVencedor: Retornando estilos:", { primary, secondary, tertiary });*/
        return todosOsEstilos.find(s => !estilosExcluidos.includes(s)) || todosOsEstilos[0]; 
    }

    function aplicarDesempate(estilosEmpatados, respostas, estilosExcluidos) {
        for (const qNum of ordemDesempate) {
            const respostaDaPergunta = respostas[qNum];
            if (respostaDaPergunta && estilosEmpatados.includes(respostaDaPergunta.estilo) && !estilosExcluidos.includes(respostaDaPergunta.estilo)) {
                return respostaDaPergunta.estilo;
            }
        }
        // Se o desempate não puder ser resolvido pelas perguntas específicas,
        // retorna o primeiro estilo empatado em ordem alfabética como fallback,
        // desde que não esteja na lista de excluídos.
        const sortedEmpatados = estilosEmpatados.sort();
        return sortedEmpatados.find(s => !estilosExcluidos.includes(s)) || sortedEmpatados[0];
    }

    function exportarResults() {
        const data = {
            estiloQuiz: { estiloPrimario: estilosPrimarioSecundario.primary, estiloSecundario: estilosPrimarioSecundario.secondary, estiloTerciario: estilosPrimarioSecundario.tertiary, respostasCompletas: respostasPorPergunta },
            dataExportacao: new Date().toISOString()
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'resultados_analise_estilo.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(a.href);
    }

    function loadAllQuestions() {
        todasAsPerguntas = [
            { numero: 1, texto: "Como você gostaria de ser percebida ao entrar em um ambiente?", tipo: "text",
                opcoes: [
                    { label: "A", text: "Elegante, refinada e feminina.", estilo: "clássica" },
                    { label: "B", text: "Elegante,refinada e prática.", estilo: "tradicional" },
                    { label: "C", text: "Elegante, moderna e poderosa.", estilo: "dramática" },
                    { label: "D", text: "Elegante, feminina e delicada.", estilo: "romântica" },
                    { label: "E", text: "Elegante, feminina, e atraente.", estilo: "sexy" },
                    { label: "F", text: "Elegante, Moderna e fashionista.", estilo: "criativa" },
                    { label: "G", text: "Elegante, prática e natural.", estilo: "básica" }
                ]
            },
            { numero: 2, texto: "Qual destas afirmações mais combinam com você?", tipo: "text",
                opcoes: [
                    { label: "A", text: `Gosto de sentir que estou sempre bem vestida e sofisticada.`, estilo: "clássica" },
                    { label: "B", text: `Gosto de sentir que estou sempre bem vestida mas antes, prezo pela funcionalidade.`, estilo: "tradicional" },
                    { label: "C", text: `Gosto de sentir que estou sempre bem vestida mas não gosto de me sentir "clássica demais”.`, estilo: "dramática" },
                    { label: "D", text: `Adoro me sentir feminina e mostrar delicadeza e leveza através das minhas roupas.`, estilo: "romântica" },
                    { label: "E", text: `Eu quero que minha roupa atraia olhares e mostre que sou uma mulher segura.`, estilo: "sexy" },
                    { label: "F", text: `Adoro ser a pessoa mais estilosa do lugar, amo acompanhar tendências!`, estilo: "criativa" },
                    { label: "G", text: `Não gosto de chamar atenção, prefiro estar discreta, isso me deixa mais à vontade.`, estilo: "básica" }
                ]
            },
            { numero: 3, texto: "O que é mais importante dentre todas as alternativas?", tipo: "text",
                opcoes: [
                    { label: "A", text: "Ser elegante.", estilo: "clássica" },
                    { label: "B", text: "Ser prática.", estilo: "tradicional" },
                    { label: "C", text: "Ser moderna.", estilo: "dramática" },
                    { label: "D", text: "Ser feminina.", estilo: "romântica" },
                    { label: "E", text: "Ser atraente.", estilo: "sexy" },
                    { label: "F", text: "Ser fashion.", estilo: "criativa" },
                    { label: "G", text: "Ser confortável.", estilo: "básica" }
                ]
            },
            { numero: 4, texto: "Qual das terceiras peças abaixo, você acha mais a sua cara para combinar com um jeans e camiseta básica?", tipo: "text",
                opcoes: [
                    { label: "A", text: "Um blazer acinturado bege com botões dourados.", estilo: "clássica" },
                    { label: "B", text: "Um blazer reto, risca de giz marinho.", estilo: "tradicional" },
                    { label: "C", text: "Um blazer oversized com ombreiras.", estilo: "dramática" },
                    { label: "D", text: "Um casaquinho de tweed rosa.", estilo: "romântica" },
                    { label: "E", text: "Uma casaco de pelos vinho.", estilo: "sexy" },
                    { label: "F", text: "Um kimono de veludo bordado com paetês coloridos.", estilo: "criativa" },
                    { label: "G", text: "Uma jaqueta de couro preta.", estilo: "básica" }
                ]
            },
            { numero: 5, texto: "Qual frase mais combina com o seu jeito de se vestir no dia a dia?", tipo: "text",
                opcoes: [
                    { label: "A", text: `“É possível ser feminina e formal ao mesmo tempo.”`, estilo: "clássica" },
                    { label: "B", text: `“Discrição é o último grau de sofisticação.”`, estilo: "tradicional" },
                    { label: "C", text: `“Amo causar impacto sem dizer uma palavra.”`, estilo: "dramática" },
                    { label: "D", text: `“Me visto para expressar minha feminilidade.”`, estilo: "romântica" },
                    { label: "E", text: `“Quero me sentir poderosa e desejada.”`, estilo: "sexy" },
                    { label: "F", text: `“Amo brincar com combinações inusitadas.”`, estilo: "criativa" },
                    { label: "G", text: `“Me visto com praticidade e zero frescura.”`, estilo: "básica" }
                ]
            },
            { numero: 6, texto: "Qual é o melhor elogio sobre o seu look?", tipo: "text",
                opcoes: [
                    { label: "A", text: `“Você está chiquíssima.”`, estilo: "clássica" },
                    { label: "B", text: `“Você está simples e elegante.”`, estilo: "tradicional" },
                    { label: "C", text: `“Você está moderna e impactante.”`, estilo: "dramática" },
                    { label: "D", text: `“Você está tão delicada e feminina!”`, estilo: "romântica" },
                    { label: "E", text: `“Você está incrível e irresistível.”`, estilo: "sexy" },
                    { label: "F", text: `“Você está diferente de todos e criativa!”`, estilo: "criativa" },
                    { label: "G", text: `“Você parece tão confortável e natural!”`, estilo: "básica" }
                ]
            },
            { numero: 7, texto: "Qual estilo de loja te atrai mais, considerando que todas elas tem o mesmo preço e qualidade?", tipo: "text",
                opcoes: [
                    { label: "A", text: "Uma loja de peças clássicas com toque de feminilidade.", estilo: "clássica" },
                    { label: "B", text: "Uma loja de peças clássicas e confortáveis.", estilo: "tradicional" },
                    { label: "C", text: "Uma loja de peças clássicas misturada com peças de impacto.", estilo: "dramática" },
                    { label: "D", text: "Uma loja de peças leves, com ar delicado e feminino.", estilo: "romântica" },
                    { label: "E", text: "Uma loja de peças elegantes e sensuais ao mesmo tempo.", estilo: "sexy" },
                    { label: "F", text: "Uma loja com tendencias, e todos os tipos de estilo.", estilo: "criativa" },
                    { label: "G", text: "Uma loja com peças básicas, confortáveis, sem modismos.", estilo: "básica" }
                ]
            },
            { numero: 8, texto: "Qual frase define melhor a sua relação com as tendências?", tipo: "text",
                opcoes: [
                    { label: "A", text: "Prefiro peças clássicas e atemporais, assim vou me sentir sempre elegante.", estilo: "clássica" },
                    { label: "B", text: "Acho chato essa coisa da moda ficar mudando, prefiro estar sempre igual, assim não erro e ganho mais tempo.", estilo: "tradicional" },
                    { label: "C", text: "Gosto de algumas tendências, mas sempre misturo com clássicos.", estilo: "dramática" },
                    { label: "D", text: "Gosto de tendências que realçam meu lado feminino de uma forma delicada.", estilo: "romântica" },
                    { label: "E", text: "Gosto de tendências que realçam meu lado feminino de uma forma mais poderosa.", estilo: "sexy" },
                    { label: "F", text: "Estou sempre testando tudo que é novo, adoro ousar e me divirto fazendo isso.", estilo: "criativa" },
                    { label: "G", text: "Não tenho paciência para acompanhar tendências, gosto de roupas confortáveis e fáceis.", estilo: "básica" }
                ]
            },
            { numero: 9, texto: "Qual destas situações te faria repensar uma roupa?", tipo: "text",
                opcoes: [
                    { label: "A", text: "Parecer informal demais.", estilo: "clássica" },
                    { label: "B", text: "Sentir que a roupa me deixou muito doce.", estilo: "tradicional" },
                    { label: "C", text: "Ficar apagada ou sem destaque.", estilo: "dramática" },
                    { label: "D", text: "Sentir que a roupa endureceu sua imagem.", estilo: "romântica" },
                    { label: "E", text: "Sentir que a roupa não valoriza seu corpo.", estilo: "sexy" },
                    { label: "F", text: "Achar que está comum demais", estilo: "criativa" },
                    { label: "G", text: "Sentir que está chamando atenção demais.", estilo: "básica" }
                ]
            },
            { numero: 10, texto: "Qual reação você mais gostaria de ouvir a respeito do seu look?", tipo: "text",
                opcoes: [
                    { label: "A", text: `“Você é sempre elegante e sofisticada!”`, estilo: "clássica" },
                    { label: "B", text: `“Você é sempre elegante e transmite força!”`, estilo: "tradicional" },
                    { label: "C", text: `“Uau, como você tem presença!”`, estilo: "dramática" },
                    { label: "D", text: `“Que fofa, você está muito linda!”`, estilo: "romântica" },
                    { label: "E", text: `“Que linda, você tem um magnetismo natural!”`, estilo: "sexy" },
                    { label: "F", text: `“Você é a mais estilosa!”`, estilo: "criativa" },
                    { label: "G", text: `“Você é natural e chique de uma forma simples.”`, estilo: "básica" }
                ]
            },
            { numero: 11, texto: "Quando você entra em uma loja pra olhar as novidades casualmente, qual é a sua reação?", tipo: "text",
                opcoes: [
                    { label: "A", text: `Vai direto na sessão de peças clássicas e femininas.`, estilo: "clássica" },
                    { label: "B", text: `Vai direto na sessão de peças clássicas e cortes mais retos, sem "firula”.`, estilo: "tradicional" },
                    { label: "C", text: `Vai na sessão dos clássicos mas sempre olha as versões mais modernas deles.`, estilo: "dramática" },
                    { label: "D", text: `Vai na sessão de  peças com mais movimento e com ar delicado e feminino.`, estilo: "romântica" },
                    { label: "E", text: `Vai atrás de peças que tenham sensualidade, que são femininas de um jeito mais poderoso.`, estilo: "sexy" },
                    { label: "F", text: `Vai direto na arara de tendências pra conhecer tudo que saiu de mais recente.`, estilo: "criativa" },
                    { label: "G", text: `Busca peças práticas, confortáveis e que deixam arrumada em precisar de fazer tanto esforço...`, estilo: "básica" }
                ]
            },
            { numero: 12, texto: "O que você prefere parecer?", tipo: "text",
                opcoes: [
                    { label: "A", text: "Parecer polida e uma verdadeira dama.", estilo: "clássica" },
                    { label: "B", text: "Parecer reservada, racional e eficiente.", estilo: "tradicional" },
                    { label: "C", text: "Parecer interessante, contemporânea e poderosa.", estilo: "dramática" },
                    { label: "D", text: "Parecer feminina, familiar e cuidadosa.", estilo: "romântica" },
                    { label: "E", text: "Parecer feminina, poderosa e magnética.", estilo: "sexy" },
                    { label: "F", text: "Parecer ousada, expansiva e divertida.", estilo: "criativa" },
                    { label: "G", text: "Parecer simples, natural e elegante sem nenhum excesso.", estilo: "básica" }
                ]
            },
            { numero: 13, texto: "Se você fosse um sapato, qual você seria?", tipo: "text",
                opcoes: [
                    { label: "A", text: "Um scarpin de bico fino.", estilo: "clássica" },
                    { label: "B", text: "Um mocassim.", estilo: "tradicional" },
                    { label: "C", text: "Uma sandália impactante.", estilo: "dramática" },
                    { label: "D", text: "Uma sapatilha.", estilo: "romântica" },
                    { label: "E", text: "Uma sandália de salto agulha e apenas duas tiras.", estilo: "sexy" },
                    { label: "F", text: "Um sapato colorido e que ninguém tem.", estilo: "criativa" },
                    { label: "G", text: "Uma rasteira fácil de calçar.", estilo: "básica" }
                ]
            },
            { numero: 14, texto: "Qual das afirmações mais se aproxima de você?", tipo: "text",
                opcoes: [
                    { label: "A", text: "Gosto de roupas clássicas porque gosto de estar sempre bem vestida e refinada.", estilo: "clássica" },
                    { label: "B", text: "Gosto de roupas clássicas porque gosto de estar bem vestida de forma prática.", estilo: "tradicional" },
                    { label: "C", text: "Gosto de roupas clássicas mas mas também me interesso por elementos criativos e modernos.", estilo: "dramática" },
                    { label: "D", text: "Gosto de roupas que tenham romantismo e feminilidade.", estilo: "romântica" },
                    { label: "E", text: "Gosto de roupas que sejam sensuais mas que não sejam vulgares.", estilo: "sexy" },
                    { label: "F", text: "Gosto de roupas diferentes e criativas, amo experimentar um pouco de tudo.", estilo: "criativa" },
                    { label: "G", text: "Gostou de roupas fáceis, simples e que eu não pareça muito montada.", estilo: "básica" }
                ]
            },
            { numero: 15, texto: "Qual dos looks abaixo tem mais a sua cara?", tipo: "image" },
            { numero: 16, texto: "Escolha um modelo de brinco de pérola que tem mais a sua cara:", tipo: "image" },
            { numero: 17, texto: "Qual dos vestidos abaixo tem mais a sua cara?", tipo: "image" },
            { numero: 18, texto: "Qual das camisas tem mais a sua cara?", tipo: "image" },
            { numero: 19, texto: "Qual das calças tem mais a sua cara?", tipo: "image" },
            { numero: 20, texto: "Qual das saias tem mais a sua cara?", tipo: "image" },
            { numero: 21, texto: "Com qual look você iria em um jantar romântico em um restaurante elegante?", tipo: "image" },
            { numero: 22, texto: "Escolha qual dos tênis você usaria para compor um look básico com jeans e camiseta:", tipo: "image" },
            { numero: 23, texto: "Qual das sandálias tem mais a sua cara?", tipo: "image" },
            { numero: 24, texto: "Qual dos sapatos tem mais a sua cara?", tipo: "image" },
            { numero: 25, texto: "Qual dos grupos de estampas você olha e imediatamente já gosta mais?", tipo: "image" },
            { numero: 26, texto: "Qual dos modelos de bolsa tem mais a sua cara?", tipo: "image" },
            { numero: 27, texto: "Qual modelo de óculos tem mais a sua cara?", tipo: "image" },
            { numero: 28, texto: "Qual look você usaria para um baile de gala?", tipo: "image" },
            { numero: 29, texto: "Todos estes looks tem a mesma base, mas os acessórios e a modelagem das roupas variam. Qual deles é mais a sua cara?", tipo: "image" },
            { numero: 30, texto: "Qual relógio é mais a sua cara?", tipo: "image" },
            { numero: 31, texto: "Como você usaria este vestido dentro do seu gosto?", tipo: "image" },
            { numero: 32, texto: "Como você usaria essa calça de paetês prateados dentro do seu gosto?", tipo: "image" },
            { numero: 33, texto: "Como você usaria esta mini saia de couro dentro do seu gosto?", tipo: "image" },
            { numero: 34, texto: "Como você usaria essa camiseta básica branca dentro do seu gosto?", tipo: "image" },
            { numero: 35, texto: "Como você usaria esta camisa dentro do seu gosto?", tipo: "image" }
        ];
        // Popula opções de imagem
        for (let i = 14; i < totalPerguntas; i++) 
            {
                const q = todasAsPerguntas[i];
            
                if (q.tipo === 'image') 
                  {
                    const [startImg, endImg] = imagemRanges[q.numero];
                    q.opcoes = [];
                    for (let imgNum = startImg, j = 0; imgNum <= endImg; imgNum++, j++) 
                        { 
                         if (todosOsEstilos[j]) 
                            { q.opcoes.push({ label: labelsOpcoes[j], image: `imagens/${imgNum}.png`, estilo: todosOsEstilos[j] });
                              // Prepare displayText for text questions (1-14)
                              todasAsPerguntas.forEach(q => {
                                if (q.tipo === 'text') {
                                    q.opcoes.forEach(o => {o.textExibicao = o.text.replace(/\s*\([^)]*\)\s*$/, '').trim();});
                                   }
                                });
                            }
                        }
                  }
            }
    }
    document.addEventListener('DOMContentLoaded', initQuiz);