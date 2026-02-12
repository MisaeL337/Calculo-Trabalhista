// Lógica para exibir o campo de horas noturnas apenas se "Sim" for selecionado
document.getElementById('adicionalNoturno').addEventListener('change', function() {
    // Obtém o elemento div que contém o input de horas noturnas
    const divHoras = document.getElementById('divHorasNoturnas');
    // Se o valor selecionado for 'sim', mostra o campo, senão esconde
    divHoras.style.display = this.value === 'sim' ? 'block' : 'none';
});

// Lógica para exibir campos de indenização de alimentação se "Não" for selecionado
document.getElementById('forneciaAlimentacao').addEventListener('change', function() {
    const divIndenizacao = document.getElementById('divIndenizacaoAlimentacao');
    divIndenizacao.style.display = this.value === 'nao' ? 'block' : 'none';
});

/**
 * Função principal que orquestra a coleta de dados, cálculos e exibição.
 */
function executarCalculo() {
    // --- 1. ENTRADA DE DADOS ---
    
    // Captura o nome do reclamante e da reclamada
    const nomeReclamante = document.getElementById('nomeReclamante').value;
    const nomeReclamada = document.getElementById('nomeReclamada').value;
    const motivoRescisao = document.getElementById('motivoRescisao').value;

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
    
    // Captura MESES de férias vencidas (Alterado conforme solicitação)
    const mesesFeriasVencidas = parseInt(document.getElementById('mesesFeriasVencidas').value) || 0;
    
    // Captura meses de atraso (opcional)
    const mesesAtrasoAntiguidade = parseInt(document.getElementById('mesesAtrasoAntiguidade').value) || 0;

    // --- CÁLCULO AUTOMÁTICO DE PERÍODOS ---
    // Substitui a leitura dos inputs removidos pelo cálculo direto
    const periodos = calcularPeriodosTrabalhados(dataAdmissao, dataAfastamento);
    const { anosEmpresa, mesesFGTS, meses13, mesesFeriasProp } = periodos;

    // Calcula percentual de antiguidade para exibição (5% a cada 5 anos)
    const percAntiguidade = anosEmpresa > 5 ? Math.floor(anosEmpresa / 5) * 5 : 0;

    // Captura percentual de INSS
    const percINSS = parseFloat(document.getElementById('inss').value) || 0;
    
    // Captura percentual de IRRF
    const percIRRF = parseFloat(document.getElementById('irrf').value) || 0;

    // Captura outras verbas (texto ou número)
    const outrasVerbasValor = parseFloat(document.getElementById('verbasAdicionaisValor').value) || 0;

    // Captura Domingos e Feriados
    const qtdDomingos = parseInt(document.getElementById('qtdDomingos').value) || 0;
    const qtdFeriadosTrabalhados = parseInt(document.getElementById('qtdFeriadosTrabalhados').value) || 0;
    const dsrQtd = parseInt(document.getElementById('dsrQtd').value) || 0;

    // Captura o campo de texto de observações
    const observacoes = document.getElementById('observacoes').value;
    
    // Captura valor da PLR
    const valorPLRAnual = parseFloat(document.getElementById('valorPLRAnual').value) || 0;
    const mesesPLR = parseInt(document.getElementById('mesesPLR').value) || 0;

    // Captura dados do Aviso Prévio
    const tipoAviso = document.getElementById('tipoAviso').value;
    const diasAviso = parseInt(document.getElementById('diasAviso').value) || 0;

    // Captura dados de Alimentação (Nova Lógica)
    const forneciaAlimentacao = document.getElementById('forneciaAlimentacao').value;
    let valorIndenizacaoAlimentacao = 0;
    if (forneciaAlimentacao === 'nao') {
        // Se não fornecia, captura o valor manual digitado
        valorIndenizacaoAlimentacao = parseFloat(document.getElementById('valorIndenizacaoAlimentacao').value) || 0;
    }

    // Captura Seguro-Desemprego (Apenas informativo)
    const parcelasSeguro = document.getElementById('seguroDesemprego').value;

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
    // NOVA REGRA: 1 mês = 1 salário base. Adicional = Base / 3.
    const baseFeriasVencidas = salarioBase * mesesFeriasVencidas;
    const valorFeriasVencidas = baseFeriasVencidas + (baseFeriasVencidas / 3);

    const valorFeriasProporcionais = calcularFeriasMeses(salarioBase, mesesFeriasProp);

    // Calcula o 13º salário proporcional aos meses trabalhados
    const valorDecimoTerceiro = calcularDecimoTerceiro(salarioBase, meses13);

    // Calcula o Aviso Prévio (Indenizado entra no cálculo, Trabalhado é 0 aqui)
    const valorAvisoPrevio = calcularValorAviso(salarioBase, tipoAviso, diasAviso);
    
    // Reflexos do Aviso Prévio Indenizado
    let reflexoAviso13 = 0;
    let reflexoAvisoFerias = 0;
    if (tipoAviso === 'indenizado') {
        // 1/12 de 13º
        reflexoAviso13 = salarioBase / 12;
        // 1/12 de Férias + 1/3
        const umDozeAvosFerias = salarioBase / 12;
        reflexoAvisoFerias = umDozeAvosFerias + (umDozeAvosFerias / 3);
    }

    // Domingos, Feriados e DSR (Regra: Salário / 30 * 2 * Quantidade)
    const valorDomingos = (salarioBase / 30) * 2 * qtdDomingos;
    const valorFeriadosTrab = (salarioBase / 30) * 2 * qtdFeriadosTrabalhados;
    const valorDSR = (salarioBase / 30) * 2 * dsrQtd;

    // Calcula o Abono por Antiguidade (Regra: > 5 anos)
    const valorAbonoAntiguidade = calcularAbonoAntiguidade(salarioBase, anosEmpresa, mesesAtrasoAntiguidade);

    // Calcula o FGTS Acumulado
    // Soma o FGTS padrão (Base * Meses) + FGTS sobre o Abono (que entra na base)
    const valorFGTSPadrao = calcularFGTS(salarioBase, mesesFGTS);
    const valorFGTSAbono = valorAbonoAntiguidade * 0.08;
    const valorFGTSAcumulado = valorFGTSPadrao + valorFGTSAbono;
    
    // Multa de 40% FGTS
    let multaFGTS = 0;
    if (motivoRescisao === 'semJustaCausa' || motivoRescisao === 'semRegistro') {
        multaFGTS = valorFGTSAcumulado * 0.40;
    }

    // Calcula a PLR (Valor direto)
    const valorPLR = calcularPLR(valorPLRAnual, mesesPLR);

    // Contagem informativa de feriados no período
    const totalFeriadosPeriodo = contarFeriados(dataAdmissao, dataAfastamento);

    // Soma os proventos tributáveis para base de cálculo (Salário + HE + Adicional)
    // Inclui Domingos e Feriados trabalhados.
    // PLR, VR, VA e Aviso Indenizado (e seus reflexos) geralmente não entram na base de cálculo de INSS mensal comum na rescisão da mesma forma,
    // mas para manter a estrutura simples do código anterior, vamos somar as verbas salariais no Bruto.
    const salarioBruto = salarioBase + valorTotalHE + valorAdicionalNoturno + valorFeriasVencidas + valorFeriasProporcionais + 
                         valorDecimoTerceiro + valorAvisoPrevio + reflexoAviso13 + reflexoAvisoFerias +
                         outrasVerbasValor + valorAbonoAntiguidade + valorDomingos + valorFeriadosTrab + valorDSR;

    // Calcula o valor do desconto do INSS baseado no Bruto
    const valorINSS = salarioBruto * (percINSS / 100);

    // Calcula o valor do desconto do IRRF baseado no Bruto
    const valorIRRF = salarioBruto * (percIRRF / 100);

    // Calcula o total de descontos
    const totalDescontos = valorINSS + valorIRRF;

    // Calcula o Salário Líquido (Bruto - Descontos)
    // A PLR NÃO entra aqui para garantir que Líquido <= Bruto
    const salarioLiquido = salarioBruto - totalDescontos;

    // Calcula o Total a Receber (Salário Líquido + PLR + Benefícios)
    const totalReceber = salarioLiquido + valorPLR + valorIndenizacaoAlimentacao;

    // --- CÁLCULO DOS TOTAIS ORGANIZADOS (PARA EXIBIÇÃO) ---
    // 1. Total da Rescisão (Aviso, Reflexos, Férias, 13º)
    const totalRescisao = valorAvisoPrevio + reflexoAviso13 + reflexoAvisoFerias + valorFeriasVencidas + valorFeriasProporcionais + valorDecimoTerceiro;

    // 2. Total da Folha / Extras (Salário, HE, Domingos, Feriados, Adicional, Benefícios, PLR, Outras, Abono)
    const totalFolhaExtras = salarioBase + valorTotalHE + valorDomingos + valorFeriadosTrab + valorDSR + valorAdicionalNoturno + valorIndenizacaoAlimentacao + valorPLR + outrasVerbasValor + valorAbonoAntiguidade;

    // --- 3. SAÍDA (Relatório na Página) ---
    
    exibirResultadoNaPagina({
        nomeReclamante,
        nomeReclamada,
        dataAdmissao,
        dataAfastamento,
        salarioBase,
        anosEmpresa,
        mesesFGTS,
        meses13,
        mesesFeriasProp,
        valorTotalHE,
        valorAdicionalNoturno,
        valorFeriasVencidas,
        valorFeriasProporcionais,
        valorDecimoTerceiro,
        valorAvisoPrevio,
        reflexoAviso13,
        reflexoAvisoFerias,
        valorAbonoAntiguidade,
        mesesAtrasoAntiguidade,
        percAntiguidade,
        valorFGTSAcumulado,
        multaFGTS,
        outrasVerbasValor,
        observacoes,
        valorPLR,
        valorIndenizacaoAlimentacao,
        valorDomingos,
        valorFeriadosTrab,
        valorDSR,
        totalFeriadosPeriodo,
        salarioBruto,
        parcelasSeguro,
        totalRescisao,
        totalFolhaExtras,
        valorINSS,
        valorIRRF,
        totalReceber
    });
}

// --- FUNÇÕES DE CÁLCULO ---

/**
 * Calcula os períodos de tempo baseados nas datas de admissão e afastamento.
 * Contém a lógica que antes estava em calcularDatasAutomaticas.
 */
function calcularPeriodosTrabalhados(dtAdm, dtAfast) {
    const resultado = {
        anosEmpresa: 0,
        mesesFGTS: 0,
        meses13: 0,
        mesesFeriasProp: 0
    };

    if (!dtAdm || !dtAfast) return resultado;

    const dataInicio = new Date(dtAdm);
    const dataFim = new Date(dtAfast);

    if (dataFim < dataInicio) return resultado;

    // 1. Anos Completos de Empresa
    let anos = dataFim.getFullYear() - dataInicio.getFullYear();
    const m = dataFim.getMonth() - dataInicio.getMonth();
    if (m < 0 || (m === 0 && dataFim.getDate() < dataInicio.getDate())) {
        anos--;
    }
    resultado.anosEmpresa = anos;

    // 2. Meses Totais para FGTS
    let mesesTotais = (dataFim.getFullYear() - dataInicio.getFullYear()) * 12;
    mesesTotais += dataFim.getMonth() - dataInicio.getMonth();
    if (dataFim.getDate() >= 15) {
        mesesTotais += 1;
    }
    resultado.mesesFGTS = Math.max(0, mesesTotais);

    // 3. Meses para 13º Salário
    let dataInicio13 = new Date(dataFim.getFullYear(), 0, 1);
    if (dataInicio > dataInicio13) {
        dataInicio13 = dataInicio;
    }
    
    let meses13 = 0;
    let tempDate = new Date(dataInicio13);
    while (tempDate <= dataFim) {
        const ano = tempDate.getFullYear();
        const mes = tempDate.getMonth();
        const ultimoDiaMes = new Date(ano, mes + 1, 0).getDate();
        let diaFimMes = ultimoDiaMes;
        
        if (ano === dataFim.getFullYear() && mes === dataFim.getMonth()) {
            diaFimMes = dataFim.getDate();
        }

        let diaInicioMes = 1;
        if (ano === dataInicio13.getFullYear() && mes === dataInicio13.getMonth()) {
            diaInicioMes = dataInicio13.getDate();
        }

        const diasTrabalhadosNoMes = diaFimMes - diaInicioMes + 1;
        if (diasTrabalhadosNoMes >= 15) {
            meses13++;
        }
        tempDate = new Date(ano, mes + 1, 1);
    }
    resultado.meses13 = meses13;

    // 4. Férias Proporcionais
    let inicioPeriodoAquisitivo = new Date(dataInicio);
    while (new Date(inicioPeriodoAquisitivo.getFullYear() + 1, inicioPeriodoAquisitivo.getMonth(), inicioPeriodoAquisitivo.getDate()) <= dataFim) {
        inicioPeriodoAquisitivo.setFullYear(inicioPeriodoAquisitivo.getFullYear() + 1);
    }
    
    let mesesFeriasProp = 0;
    let cursor = new Date(inicioPeriodoAquisitivo);
    while (cursor < dataFim) {
        let proximoMes = new Date(cursor.getFullYear(), cursor.getMonth() + 1, cursor.getDate());
        let dataCorte = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate() + 14);
        if (dataFim >= dataCorte) {
            mesesFeriasProp++;
        }
        cursor = proximoMes;
    }
    resultado.mesesFeriasProp = Math.min(12, mesesFeriasProp);

    return resultado;
}

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

function calcularFeriasMeses(salario, meses) {
    const valorProporcional = (salario / 12) * meses;
    const terco = valorProporcional / 3;
    return valorProporcional + terco;
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

function calcularPLR(valorAnual, meses) {
    if (!valorAnual || !meses) return 0;
    return (valorAnual / 12) * meses;
}

function calcularAbonoAntiguidade(salario, anos, mesesAtraso) {
    // Regra 1: O abono só existe se tiver MAIS de 5 anos completos (> 5)
    if (anos <= 5) return 0;

    // Regra 2: 5% a cada 5 anos completos (Ex: 6 anos = 1 bloco de 5 = 5%)
    const percentual = Math.floor(anos / 5) * 0.05;

    // Regra 4: (salário base * percentual) * meses em atraso
    return (salario * percentual) * mesesAtraso;
}

function contarFeriados(inicioStr, fimStr) {
    if (!inicioStr || !fimStr) return 0;
    const inicio = new Date(inicioStr);
    const fim = new Date(fimStr);
    
    // Lista simplificada de feriados nacionais fixos (Mês-Dia)
    const feriadosFixos = [
        "01-01", // Confraternização Universal
        "04-21", // Tiradentes
        "05-01", // Dia do Trabalho
        "09-07", // Independência
        "10-12", // N. Sra. Aparecida
        "11-02", // Finados
        "11-15", // Proclamação da República
        "12-25"  // Natal
    ];

    let count = 0;
    // Itera pelos anos
    for (let ano = inicio.getFullYear(); ano <= fim.getFullYear(); ano++) {
        feriadosFixos.forEach(f => {
            const [mes, dia] = f.split('-');
            const dataFeriado = new Date(ano, parseInt(mes)-1, parseInt(dia));
            if (dataFeriado >= inicio && dataFeriado <= fim) {
                count++;
            }
        });
    }
    return count;
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

    // --- 1.1 RESUMO DO PERÍODO ---
    atualizarLinha('resAnosEmpresa', dados.anosEmpresa, false);
    atualizarLinha('resMesesFGTS', dados.mesesFGTS, false);
    atualizarLinha('resMeses13', dados.meses13 + " avos", false);
    atualizarLinha('resMesesFeriasProp', dados.mesesFeriasProp + " avos", false);

    // --- 2. VERBAS ---
    atualizarLinha('resSalarioBase', dados.salarioBase);
    atualizarLinha('resAvisoPrevio', dados.valorAvisoPrevio);
    atualizarLinha('resReflexoAviso13', dados.reflexoAviso13);
    atualizarLinha('resReflexoAvisoFerias', dados.reflexoAvisoFerias);
    atualizarLinha('resHorasExtras', dados.valorTotalHE);
    atualizarLinha('resAdicionalNoturno', dados.valorAdicionalNoturno);
    atualizarLinha('resDomingos', dados.valorDomingos);
    atualizarLinha('resFeriadosTrab', dados.valorFeriadosTrab);
    atualizarLinha('resDSR', dados.valorDSR);
    atualizarLinha('resFeriasVencidas', dados.valorFeriasVencidas);
    atualizarLinha('resFeriasProporcionais', dados.valorFeriasProporcionais);
    atualizarLinha('resDecimoTerceiro', dados.valorDecimoTerceiro);
    atualizarLinha('resIndenizacaoAlimentacao', dados.valorIndenizacaoAlimentacao);
    atualizarLinha('resAbonoAntiguidade', dados.valorAbonoAntiguidade);
    
    // Novos Totais de Grupo
    atualizarLinha('resTotalRescisao', dados.totalRescisao);
    atualizarLinha('resTotalFolhaExtras', dados.totalFolhaExtras);
    
    // Atualiza o texto do rótulo do Abono com os detalhes (Percentual e Meses) se houver valor
    if (dados.valorAbonoAntiguidade > 0) {
        const lblAbono = document.getElementById('lblAbonoAntiguidade');
        if (lblAbono) lblAbono.textContent = `(+) Abono por Antiguidade (${dados.percAntiguidade}% × ${dados.mesesAtrasoAntiguidade} meses)`;
    }

    atualizarLinha('resVerbasAdicionais', dados.outrasVerbasValor);

    // --- 3. TOTAIS E DESCONTOS ---
    
    atualizarLinha('resINSS', dados.valorINSS, true, true);
    atualizarLinha('resIRRF', dados.valorIRRF, true, true);
    
    
    atualizarLinha('resTotalReceber', dados.totalReceber);
    
    atualizarLinha('resFGTSAcumulado', dados.valorFGTSAcumulado);
    atualizarLinha('resMultaFGTS', dados.multaFGTS);
    atualizarLinha('resTotalFeriadosPeriodo', dados.totalFeriadosPeriodo, false); // false para não formatar como moeda
    atualizarLinha('resSeguroDesemprego', dados.parcelasSeguro, false);

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