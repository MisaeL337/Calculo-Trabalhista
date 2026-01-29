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
    
    // Captura percentual de INSS
    const percINSS = parseFloat(document.getElementById('inss').value) || 0;
    
    // Captura percentual de IRRF
    const percIRRF = parseFloat(document.getElementById('irrf').value) || 0;

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

    // Soma os proventos tributáveis para base de cálculo (Salário + HE + Adicional)
    // Nota: Férias e 13º geralmente têm tributação exclusiva/separada, 
    // mas para este exercício somaremos tudo no Bruto Geral.
    const salarioBruto = salarioBase + valorTotalHE + valorAdicionalNoturno + valorFeriasTotal + valorDecimoTerceiro;

    // Calcula o valor do desconto do INSS baseado no Bruto
    const valorINSS = salarioBruto * (percINSS / 100);

    // Calcula o valor do desconto do IRRF baseado no Bruto
    const valorIRRF = salarioBruto * (percIRRF / 100);

    // Calcula o FGTS (8% sobre o salário bruto, não é descontado do funcionário, mas calculado)
    const valorFGTS = salarioBruto * 0.08;

    // Calcula o total de descontos
    const totalDescontos = valorINSS + valorIRRF;

    // Calcula o Salário Líquido Final
    const salarioLiquido = salarioBruto - totalDescontos;

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
        salarioBruto,
        valorINSS,
        valorIRRF,
        valorFGTS,
        salarioLiquido
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

/**
 * Exibe os resultados do cálculo diretamente na página HTML.
 * @param {object} dados - O objeto contendo todos os valores calculados.
 */
function exibirResultadoNaPagina(dados) {
    // Formata valores para moeda BRL para exibição
    const fmt = (val) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    // Função auxiliar para formatar data (AAAA-MM-DD -> DD/MM/AAAA)
    const fmtData = (dataStr) => {
        if (!dataStr) return '-';
        const [ano, mes, dia] = dataStr.split('-');
        return `${dia}/${mes}/${ano}`;
    };

    // Preenche os campos do relatório no HTML
    document.getElementById('resNomeReclamante').textContent = dados.nomeReclamante || '-';
    document.getElementById('resNomeReclamada').textContent = dados.nomeReclamada || '-';
    document.getElementById('resDataAdmissao').textContent = fmtData(dados.dataAdmissao);
    document.getElementById('resDataAfastamento').textContent = fmtData(dados.dataAfastamento);
    document.getElementById('resSalarioBase').textContent = fmt(dados.salarioBase);
    document.getElementById('resHorasExtras').textContent = fmt(dados.valorTotalHE);
    document.getElementById('resAdicionalNoturno').textContent = fmt(dados.valorAdicionalNoturno);
    document.getElementById('resFerias').textContent = fmt(dados.valorFeriasTotal);
    document.getElementById('resDecimoTerceiro').textContent = fmt(dados.valorDecimoTerceiro);
    document.getElementById('resSalarioBruto').textContent = fmt(dados.salarioBruto);
    document.getElementById('resINSS').textContent = `- ${fmt(dados.valorINSS)}`;
    document.getElementById('resIRRF').textContent = `- ${fmt(dados.valorIRRF)}`;
    document.getElementById('resSalarioLiquido').textContent = fmt(dados.salarioLiquido);
    document.getElementById('resFGTS').textContent = fmt(dados.valorFGTS);

    // Exibe o card de resultados
    const resultadoCard = document.getElementById('resultadoCard');
    resultadoCard.style.display = 'block';
    // Rola a página para que o resultado fique visível
    resultadoCard.scrollIntoView({ behavior: 'smooth' });
}