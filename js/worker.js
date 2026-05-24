// Funções processamento
function parseNestedStrings(obj) {
    if (typeof obj === 'string') {
        let trimmed = obj.trim();
        if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
            try { return parseNestedStrings(JSON.parse(trimmed)); } catch (e) { return obj; }
        }
        return obj;
    } else if (Array.isArray(obj)) {
        return obj.map(parseNestedStrings);
    } else if (obj !== null && typeof obj === 'object') {
        const newObj = {};
        for (let key in obj) { newObj[key] = parseNestedStrings(obj[key]); }
        return newObj;
    }
    return obj;
}

function findMainArray(obj) {
    if (Array.isArray(obj)) return obj;
    if (typeof obj !== 'object' || obj === null) return [];
    let largestArray = [];
    for (let key in obj) {
        if (Array.isArray(obj[key])) {
            if (obj[key].length > largestArray.length) largestArray = obj[key];
        } else if (typeof obj[key] === 'object') {
            const nestedArray = findMainArray(obj[key]);
            if (nestedArray.length > largestArray.length) largestArray = nestedArray;
        }
    }
    return largestArray;
}

function flattenObject(ob, prefix = '') {
    let toReturn = {};
    for (let i in ob) {
        if (!ob.hasOwnProperty(i)) continue;
        const key = prefix ? `${prefix}.${i}` : i;
        if (typeof ob[i] === 'object' && ob[i] !== null) {
            if (Array.isArray(ob[i])) { toReturn[key] = ob[i]; } 
            else {
                let flatObject = flattenObject(ob[i], key);
                toReturn = { ...toReturn, ...flatObject };
            }
        } else { toReturn[key] = ob[i]; }
    }
    return toReturn;
}

function explodeRecord(flatRecord) {
    let arrayKey = Object.keys(flatRecord).find(k => Array.isArray(flatRecord[k]));
    if (!arrayKey) return [flatRecord];

    let records = [];
    let items = flatRecord[arrayKey];
    
    if (items.length === 0) {
        let newRecord = { ...flatRecord };
        newRecord[arrayKey] = '';
        records.push(...explodeRecord(newRecord));
    } else {
        items.forEach(item => {
            let newRecord = { ...flatRecord };
            if (typeof item === 'object' && item !== null) {
                 const flatItem = flattenObject(item, arrayKey);
                 delete newRecord[arrayKey];
                 newRecord = { ...newRecord, ...flatItem };
            } else { newRecord[arrayKey] = item; }
            records.push(...explodeRecord(newRecord));
        });
    }
    return records;
}

function escapeCSVValue(val) {
    if (val === null || val === undefined) return '';
    const str = String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
}

// Ouve as mensagens enviadas pelo app.js
self.onmessage = function(event) {
    try {
        const rawText = event.data;
        
        let cleanedText = rawText.replace(/"""([\s\S]*?)"""/g, (match, conteudo) => {
            let limpo = conteudo.replace(/"/g, '\\"').replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t');
            return `"${limpo}"`;
        });

        let jsonData = JSON.parse(cleanedText);
        jsonData = parseNestedStrings(jsonData);
        let hits = findMainArray(jsonData);

        if (hits.length === 0) {
            throw new Error("Não encontrei nenhuma lista de dados estruturada no JSON.");
        }

        let flatRecords = [];
        hits.forEach(hit => {
            const sourceData = hit._source ? { _id: hit._id, ...hit._source } : hit;
            const flatBase = flattenObject(sourceData);
            const exploded = explodeRecord(flatBase);
            flatRecords.push(...exploded);
        });

        const headersSet = new Set();
        flatRecords.forEach(record => {
            Object.keys(record).forEach(key => headersSet.add(key));
        });
        const headers = Array.from(headersSet);

        const csvRows = [];
        csvRows.push(headers.join(',')); 

        flatRecords.forEach(record => {
            const row = headers.map(header => escapeCSVValue(record[header]));
            csvRows.push(row.join(','));
        });

        // Devolve o CSV pronto
        self.postMessage({ success: true, data: csvRows.join('\n') });

    } catch (error) {
        // Devolve o erro capturado
        self.postMessage({ success: false, error: error.message });
    }
};
