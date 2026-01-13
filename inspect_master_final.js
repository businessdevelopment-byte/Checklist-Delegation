import https from 'https';

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbw7hMLxUdRO4Gl_JRLtl2B5Q_FRJuCaOPC7dj_Ezvk1EPbUJR6q88AMF0oQtPCoFoFi/exec?sheet=master&action=fetch&t=" + Date.now();

https.get(SCRIPT_URL, (res) => {
    if (res.statusCode === 301 || res.statusCode === 302) {
        https.get(res.headers.location, handleResponse);
    } else {
        handleResponse(res);
    }
}).on('error', (err) => {
    console.error("Error:", err.message);
});

function handleResponse(res) {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            if (json.table && json.table.rows) {
                const rows = json.table.rows;
                const headerRow = rows[0];
                console.log("Total columns found:", headerRow.c.length);

                let deptBaseIndex = -1;
                headerRow.c.forEach((cell, i) => {
                    const header = cell ? String(cell.v).trim() : '';
                    console.log(`Column ${String.fromCharCode(65 + i)} (Index ${i}): "${header}"`);
                    if (header.toLowerCase() === "department base") {
                        deptBaseIndex = i;
                    }
                });

                if (deptBaseIndex !== -1) {
                    console.log(`\nSUCCESS: Found "Department base" at Index ${deptBaseIndex} (Column ${String.fromCharCode(65 + deptBaseIndex)})`);

                    // Sample a row that has data
                    const samples = rows.slice(1).filter(r => r.c && r.c[3] && r.c[3].v);
                    if (samples.length > 0) {
                        const sample = samples[0];
                        console.log("\nSample Data Mapping:");
                        console.log(`Doer (Col D): ${sample.c[3] ? sample.c[3].v : 'null'}`);
                        console.log(`Dept Base (Col ${String.fromCharCode(65 + deptBaseIndex)}): ${sample.c[deptBaseIndex] ? sample.c[deptBaseIndex].v : 'null'}`);
                    }
                } else {
                    console.log('\nFAILURE: "Department base" header not found in Row 0.');
                }
            }
        } catch (e) {
            console.error("Parse Error:", e.message);
        }
    });
}
