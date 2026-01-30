// Lógica para exibir o campo de horas noturnas apenas se "Sim" for selecionado
document.getElementById('adicionalNoturno').addEventListener('change', function() {
    // Obtém o elemento div que contém o input de horas noturnas
    const divHoras = document.getElementById('divHorasNoturnas');
    // Se o valor selecionado for 'sim', mostra o campo, senão esconde
    divHoras.style.display = this.value === 'sim' ? 'block' : 'none';
});

/**
 * Função principal que orquestra a coleta de dados, cálculos e exibição.
 */
function executarCalculo() {
    // --- 1. ENTRADA DE DADOS ---
    
    // Captura o nome do reclamante e da reclamada
    const nomeReclamante = document.getElementById('nomeReclamante').value;
    const nomeReclamada = document.getElementById('nomeReclamada').value;

    // Captura as datas de admissão e afastamento
    const dataAdmissao = document.getElementById('dataAdmissao').value;
    const dataAfastamento = document.getElementById('dataAfastamento').value;

    // Captura o salário base e converte para número decimal (float)
    const salarioBase = parseFloat(document.getElementById('salarioBase').value) || 0;
    
    // Captura o número de horas extras
    const numHorasExtras = parseFloat(document.getElementById('horasExtras').value) || 0;
    
    // Verifica se há adicional noturno (sim/não)
    const temAdicionalNoturno = document.getElementById('adicionalNoturno').value === 'sim';
    
    // Captura as horas noturnas trabalhadas (apenas se aplicável)
    const horasNoturnas = parseFloat(document.getElementById('horasNoturnas').value) || 0;
    
    // Captura dias de férias vencidas
    const diasFerias = parseInt(document.getElementById('diasFerias').value) || 0;
    
    // Captura meses trabalhados para o 13º salário
    const meses13 = parseInt(document.getElementById('meses13').value) || 0;
    
    // Captura meses para cálculo do FGTS acumulado
    const mesesFGTS = parseInt(document.getElementById('mesesFGTS').value) || 0;

    // Captura dados para Abono por Antiguidade
    const anosEmpresa = parseInt(document.getElementById('anosEmpresa').value) || 0;
    const mesesAtrasoAntiguidade = parseInt(document.getElementById('mesesAtrasoAntiguidade').value) || 0;

    // Calcula percentual de antiguidade para exibição (5% a cada 5 anos)
    const percAntiguidade = anosEmpresa > 5 ? Math.floor(anosEmpresa / 5) * 5 : 0;

    // Captura percentual de INSS
    const percINSS = parseFloat(document.getElementById('inss').value) || 0;
    
    // Captura percentual de IRRF
    const percIRRF = parseFloat(document.getElementById('irrf').value) || 0;

    // Captura outras verbas (texto ou número)
    const outrasVerbasValor = parseFloat(document.getElementById('verbasAdicionaisValor').value) || 0;

    // Captura o campo de texto de observações
    const observacoes = document.getElementById('observacoes').value;
    
    // Captura valor da PLR
    const valorPLRInput = parseFloat(document.getElementById('valorPLR').value) || 0;

    // Captura dados do Aviso Prévio
    const tipoAviso = document.getElementById('tipoAviso').value;
    const diasAviso = parseInt(document.getElementById('diasAviso').value) || 0;

    // --- 2. CÁLCULOS AUTOMÁTICOS (Funções Auxiliares) ---

    // Calcula o valor da hora normal de trabalho (Base / 220 horas mensais padrão)
    const valorHoraNormal = calcularValorHora(salarioBase);

    // Calcula o valor total das horas extras (com 50% de acréscimo)
    const valorTotalHE = calcularHorasExtras(valorHoraNormal, numHorasExtras);

    // Calcula o valor do adicional noturno (20% sobre a hora normal * horas noturnas)
    // Se não tiver adicional, retorna 0
    const valorAdicionalNoturno = temAdicionalNoturno ? 
        calcularAdicionalNoturno(valorHoraNormal, horasNoturnas) : 0;

    // Calcula o valor das férias (proporcional aos dias + 1/3 constitucional)
    const valorFeriasTotal = calcularFerias(salarioBase, diasFerias);

    // Calcula o 13º salário proporcional aos meses trabalhados
    const valorDecimoTerceiro = calcularDecimoTerceiro(salarioBase, meses13);

    // Calcula o Aviso Prévio (Indenizado entra no cálculo, Trabalhado é 0 aqui)
    const valorAvisoPrevio = calcularValorAviso(salarioBase, tipoAviso, diasAviso);

    // Calcula o Abono por Antiguidade (Regra: > 5 anos)
    const valorAbonoAntiguidade = calcularAbonoAntiguidade(salarioBase, anosEmpresa, mesesAtrasoAntiguidade);

    // Calcula o FGTS Acumulado
    // Soma o FGTS padrão (Base * Meses) + FGTS sobre o Abono (que entra na base)
    const valorFGTSPadrao = calcularFGTS(salarioBase, mesesFGTS);
    const valorFGTSAbono = valorAbonoAntiguidade * 0.08;
    const valorFGTSAcumulado = valorFGTSPadrao + valorFGTSAbono;

    // Calcula a PLR (Valor direto)
    const valorPLR = calcularPLR(valorPLRInput);

    // Soma os proventos tributáveis para base de cálculo (Salário + HE + Adicional)
    // Nota: Férias e 13º geralmente têm tributação exclusiva/separada, 
    // mas para este exercício somaremos tudo no Bruto Geral. O Abono entra aqui.
    const salarioBruto = salarioBase + valorTotalHE + valorAdicionalNoturno + valorFeriasTotal + 
                         valorDecimoTerceiro + valorAvisoPrevio + outrasVerbasValor + valorAbonoAntiguidade;

    // Calcula o valor do desconto do INSS baseado no Bruto
    const valorINSS = salarioBruto * (percINSS / 100);

    // Calcula o valor do desconto do IRRF baseado no Bruto
    const valorIRRF = salarioBruto * (percIRRF / 100);

    // Calcula o total de descontos
    const totalDescontos = valorINSS + valorIRRF;

    // Calcula o Salário Líquido (Bruto - Descontos)
    // A PLR NÃO entra aqui para garantir que Líquido <= Bruto
    const salarioLiquido = salarioBruto - totalDescontos;

    // Calcula o Total a Receber (Salário Líquido + PLR)
    const totalReceber = salarioLiquido + valorPLR;

    // --- 3. SAÍDA (Relatório na Página) ---
    
    exibirResultadoNaPagina({
        nomeReclamante,
        nomeReclamada,
        dataAdmissao,
        dataAfastamento,
        salarioBase,
        valorTotalHE,
        valorAdicionalNoturno,
        valorFeriasTotal,
        valorDecimoTerceiro,
        valorAvisoPrevio,
        valorAbonoAntiguidade,
        mesesAtrasoAntiguidade,
        percAntiguidade,
        valorFGTSAcumulado,
        outrasVerbasValor,
        observacoes,
        valorPLR,
        salarioBruto,
        valorINSS,
        valorIRRF,
        salarioLiquido,
        totalReceber
    });
}

// --- FUNÇÕES DE CÁLCULO ---

function calcularValorHora(salario) {
    // Divisor padrão mensalista é 220 horas
    return salario / 220; 
}

function calcularHorasExtras(valorHora, horas) {
    // Valor da hora extra é Hora Normal * 1.5 (50% de adicional)
    const valorHoraExtra = valorHora * 1.5;
    // Retorna o valor unitário da HE vezes a quantidade de horas
    return valorHoraExtra * horas;
}

function calcularAdicionalNoturno(valorHora, horasNoturnas) {
    // Adicional noturno é 20% (0.2) sobre a hora normal
    const valorHoraNoturna = valorHora * 0.2;
    // Retorna o valor do adicional vezes as horas noturnas trabalhadas
    return valorHoraNoturna * horasNoturnas;
}

function calcularFerias(salario, dias) {
    // Calcula o valor de 1 dia de trabalho (Salário / 30)
    const valorDia = salario / 30;
    // Calcula o valor pelos dias de férias gozados/vencidos
    const valorDiasFerias = valorDia * dias;
    // Adiciona o terço constitucional (1/3)
    const tercoConstitucional = valorDiasFerias / 3;
    // Retorna a soma
    return valorDiasFerias + tercoConstitucional;
}

function calcularDecimoTerceiro(salario, meses) {
    // O 13º é (Salário / 12) * meses trabalhados
    return (salario / 12) * meses;
}

function calcularValorAviso(salario, tipo, dias) {
    if (tipo === 'indenizado') {
        // Salário diário * dias
        return (salario / 30) * dias;
    }
    return 0; // Trabalhado não gera valor extra na rescisão (é salário normal)
}

function calcularFGTS(salarioBase, mesesFGTS) {
    // O cálculo do FGTS é 8% (0.08) do salário base
    // Multiplicado pela quantidade de meses informada
    return salarioBase * 0.08 * mesesFGTS;
}

function calcularPLR(valorPLR) {
    // A PLR entra integralmente no valor a receber neste contexto
    // (Assumindo valor líquido ou isento para simplificação conforme pedido, 
    // já que não deve entrar na base de INSS/Férias)
    return valorPLR;
}

function calcularAbonoAntiguidade(salario, anos, mesesAtraso) {
    // Regra 1: O abono só existe se tiver MAIS de 5 anos completos (> 5)
    if (anos <= 5) return 0;

    // Regra 2: 5% a cada 5 anos completos (Ex: 6 anos = 1 bloco de 5 = 5%)
    const percentual = Math.floor(anos / 5) * 0.05;

    // Regra 4: (salário base * percentual) * meses em atraso
    return (salario * percentual) * mesesAtraso;
}

/**
 * Exibe os resultados do cálculo diretamente na página HTML.
 * @param {object} dados - O objeto contendo todos os valores calculados.
 */
function exibirResultadoNaPagina(dados) {
    // Função auxiliar para formatar moeda
    const fmt = (val) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    // Função auxiliar para formatar data
    const fmtData = (dataStr) => {
        if (!dataStr) return ''; // Retorna vazio se não houver data para ocultar a linha
        const [ano, mes, dia] = dataStr.split('-');
        return `${dia}/${mes}/${ano}`;
    };

    // Função auxiliar para exibir ou ocultar linhas baseadas no valor
    const atualizarLinha = (idElemento, valor, isMoeda = true, isDesconto = false) => {
        const elemento = document.getElementById(idElemento);
        if (!elemento) return;

        const linha = elemento.closest('.resultado-linha');
        
        let deveMostrar = false;
        let textoExibicao = '';

        if (typeof valor === 'number') {
            // Para números: mostra apenas se for maior que zero
            deveMostrar = valor > 0;
            if (deveMostrar) {
                const valFmt = isMoeda ? fmt(valor) : valor;
                textoExibicao = isDesconto ? `- ${valFmt}` : valFmt;
            }
        } else if (typeof valor === 'string') {
            // Para texto: mostra apenas se não estiver vazio
            deveMostrar = valor.trim() !== '';
            textoExibicao = valor;
        }

        if (deveMostrar) {
            linha.style.display = 'flex'; // Exibe a linha
            elemento.textContent = textoExibicao;
        } else {
            linha.style.display = 'none'; // Oculta a linha
        }
    };

    // --- 1. DADOS CADASTRAIS ---
    atualizarLinha('resNomeReclamante', dados.nomeReclamante, false);
    atualizarLinha('resNomeReclamada', dados.nomeReclamada, false);
    atualizarLinha('resDataAdmissao', fmtData(dados.dataAdmissao), false);
    atualizarLinha('resDataAfastamento', fmtData(dados.dataAfastamento), false);

    // --- 2. VERBAS ---
    atualizarLinha('resSalarioBase', dados.salarioBase);
    atualizarLinha('resAvisoPrevio', dados.valorAvisoPrevio);
    atualizarLinha('resHorasExtras', dados.valorTotalHE);
    atualizarLinha('resAdicionalNoturno', dados.valorAdicionalNoturno);
    atualizarLinha('resFerias', dados.valorFeriasTotal);
    atualizarLinha('resDecimoTerceiro', dados.valorDecimoTerceiro);
    atualizarLinha('resAbonoAntiguidade', dados.valorAbonoAntiguidade);
    
    // Atualiza o texto do rótulo do Abono com os detalhes (Percentual e Meses) se houver valor
    if (dados.valorAbonoAntiguidade > 0) {
        const lblAbono = document.getElementById('lblAbonoAntiguidade');
        if (lblAbono) lblAbono.textContent = `(+) Abono por Antiguidade (${dados.percAntiguidade}% × ${dados.mesesAtrasoAntiguidade} meses)`;
    }

    atualizarLinha('resVerbasAdicionais', dados.outrasVerbasValor);

    // --- 3. TOTAIS E DESCONTOS ---
    atualizarLinha('resSalarioBruto', dados.salarioBruto);
    
    atualizarLinha('resINSS', dados.valorINSS, true, true);
    atualizarLinha('resIRRF', dados.valorIRRF, true, true);
    
    atualizarLinha('resSalarioLiquido', dados.salarioLiquido);
    
    atualizarLinha('resPLR', dados.valorPLR);
    
    atualizarLinha('resTotalReceber', dados.totalReceber);
    
    atualizarLinha('resFGTSAcumulado', dados.valorFGTSAcumulado);

    // --- 4. OBSERVAÇÕES ---
    const linhaObs = document.getElementById('linhaObservacoes');
    const elObs = document.getElementById('resObservacoes');

    if (dados.observacoes && dados.observacoes.trim() !== "") {
        linhaObs.style.display = 'block';
        elObs.textContent = dados.observacoes;
    } else {
        linhaObs.style.display = 'none';
    }

    // Exibe o card de resultados
    const resultadoCard = document.getElementById('resultadoCard');
    resultadoCard.style.display = 'block';
    // Rola a página para que o resultado fique visível
    resultadoCard.scrollIntoView({ behavior: 'smooth' });
}