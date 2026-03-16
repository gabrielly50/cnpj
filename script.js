async function consultarCNPJ() {
    const cnpj = document.getElementById('cnpjInput').value.replace(/\D/g, '');
    const divResultado = document.getElementById('resultado');
    const btnPdf = document.getElementById('btnPdf');

    if (cnpj.length !== 14) {
        alert("Por favor, digite os 14 números do CNPJ.");
        return;
    }

    divResultado.innerHTML = "<p>Buscando dados na base da Receita...</p>";

    try {
        const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`);
        
        if (!response.ok) throw new Error('CNPJ não encontrado ou erro na base.');
        
        const data = await response.json();
        window.dadosAtuais = data; // Salva para o PDF

        divResultado.innerHTML = `
            <div class="item"><span class="label">Razão Social</span> ${data.razao_social}</div>
            <div class="item"><span class="label">Nome Fantasia</span> ${data.nome_fantasia || 'Não informado'}</div>
            <div class="item"><span class="label">Atividade Principal</span> ${data.cnae_fiscal_descricao}</div>
            <div class="item"><span class="label">Capital Social</span> R$ ${data.capital_social.toLocaleString('pt-BR')}</div>
            <div class="item"><span class="label">Endereço</span> ${data.logradouro}, ${data.numero} - ${data.bairro}</div>
            <div class="item"><span class="label">Município/UF</span> ${data.municipio} - ${data.uf}</div>
            <div class="item"><span class="label">Telefone</span> ${data.ddd_telefone_1 || 'Não cadastrado'}</div>
        `;
        
        btnPdf.style.display = "block";

    } catch (error) {
        divResultado.innerHTML = `<p style="color:red">Erro: ${error.message}</p>`;
        btnPdf.style.display = "none";
    }
}

function gerarPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const d = window.dadosAtuais;

    doc.setFont("helvetica", "bold");
    doc.text("Comprovante de Inscrição Cadastral", 10, 20);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    
    let y = 40;
    const linhas = [
        `Razão Social: ${d.razao_social}`,
        `CNPJ: ${d.cnpj}`,
        `Situação: ${d.descricao_situacao_cadastral}`,
        `Capital Social: R$ ${d.capital_social}`,
        `Logradouro: ${d.logradouro}, ${d.numero}`,
        `Bairro: ${d.bairro}`,
        `Cidade: ${d.municipio} - ${d.uf}`,
        `Telefone: ${d.ddd_telefone_1}`
    ];

    linhas.forEach(linha => {
        doc.text(linha, 10, y);
        y += 10;
    });

    doc.save(`relatorio_cnpj_${d.cnpj}.pdf`);
}