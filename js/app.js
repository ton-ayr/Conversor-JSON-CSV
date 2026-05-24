if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').catch(err => {
            console.warn('Service Worker registration failed: ', err);
        });
    });
}

const jsonInput = document.getElementById('jsonInput');
const convertBtn = document.getElementById('convertBtn');
const outputSection = document.getElementById('outputSection');
const csvOutput = document.getElementById('csvOutput');
const fileNameInput = document.getElementById('fileNameInput'); // NOVO
const downloadBtn = document.getElementById('downloadBtn');
const copyBtn = document.getElementById('copyBtn');
const errorMsg = document.getElementById('errorMsg');

let currentCSV = "";

const csvWorker = new Worker('./js/worker.js');

jsonInput.addEventListener('input', () => {
    if (jsonInput.value.trim().length > 0) {
        convertBtn.disabled = false;
    } else {
        convertBtn.disabled = true;
        outputSection.style.display = 'none';
        errorMsg.style.display = 'none';
    }
});

//Ação de Converter
convertBtn.addEventListener('click', () => {
    errorMsg.style.display = 'none';
    outputSection.style.display = 'none';
    
    const originalText = convertBtn.innerHTML;
    convertBtn.innerHTML = "⏳ Convertendo...";
    convertBtn.disabled = true;

    const rawData = jsonInput.value.trim();
    csvWorker.postMessage(rawData);
    
    csvWorker.onmessage = (event) => {
        const result = event.data;
        
        if (result.success) {
            currentCSV = result.data;
            csvOutput.value = currentCSV;
            outputSection.style.display = 'block';
        } else {
            errorMsg.textContent = `❌ Erro ao processar: ${result.error}`;
            errorMsg.style.display = 'block';
        }

        convertBtn.innerHTML = originalText;
        convertBtn.disabled = false;
    };
});

//Ação de Download
downloadBtn.addEventListener('click', () => {
    if (!currentCSV) return;
    let fileName = fileNameInput.value.trim();
    if (!fileName) {
        fileName = 'dados_convertidos';
    }
    if (!fileName.toLowerCase().endsWith('.csv')) {
        fileName += '.csv';
    }
    
    const blob = new Blob([currentCSV], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});

// Ação de Copiar
copyBtn.addEventListener('click', async () => {
    if (!currentCSV) return;
    
    try {
        await navigator.clipboard.writeText(currentCSV);
        const originalText = copyBtn.innerHTML;
        copyBtn.innerHTML = "✅ Copiado!";
        copyBtn.style.backgroundColor = "var(--success)";
        
        setTimeout(() => {
            copyBtn.innerHTML = originalText;
            copyBtn.style.backgroundColor = "var(--secondary)";
        }, 2000);
    } catch (err) {
        alert("Erro ao copiar para a área de transferência.");
    }
});