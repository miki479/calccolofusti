let contatoreFusti = 0;
let contatoreQuintali = 0;
let turnoAttuale = '';
let progressInterval;

// Dati per i grafici
let datiGrafico = {
    labels: [],
    datasets: [{
        label: 'Fusti prodotti',
        data: [],
        backgroundColor: 'rgba(75, 192, 192, 0.5)'
    }]
};

let datiGraficoTurni = {
    labels: ['Mattino', 'Pomeriggio'],
    datasets: [{
        label: 'Fusti per Turno',
        data: [0, 0],
        backgroundColor: ['#76b852', '#3498db']
    }]
};

let ctxProduzione = document.getElementById('grafico-produzione').getContext('2d');
let graficoProduzione = new Chart(ctxProduzione, {
    type: 'line',
    data: datiGrafico
});

let ctxTurni = document.getElementById('grafico-turni').getContext('2d');
let graficoTurni = new Chart(ctxTurni, {
    type: 'bar',
    data: datiGraficoTurni
});

const velocitaProduzione = {
    "25": { fustiOra: 120, qOra: 30 },
    "20": { fustiOra: 33, qOra: 9.9 },
    "20sacca": { fustiOra: 22, qOra: 6.6 },
    "10": { fustiOra: 260, qOra: 26 },
    "3bag": { fustiOra: null, qOra: 9 }
};

function aggiornaTurno() {
    const ora = new Date().getHours();
    turnoAttuale = (ora >= 5 && ora < 14) ? 'Mattino' : 'Pomeriggio';
    document.getElementById('turnoStatus').textContent = `Turno corrente: ${turnoAttuale}`;
}

function openTab(evt, tabId) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
    evt.currentTarget.classList.add('active');
    document.getElementById(tabId).classList.add('active');
}

function aggiornaVelocita() {
    const tipo = document.getElementById('fustoTipo').value;
    document.getElementById('macchineInputs').classList.toggle('hidden', tipo !== "25");
}

function calcolaFusti() {
    aggiornaTurno();
    const tipo = document.getElementById('fustoTipo').value;
    const fustiDaProdurre = parseInt(document.getElementById('fustiTotali').value);
    const pausa = parseInt(document.getElementById('pausa').value) || 0;
    const cambioMacchina = parseInt(document.getElementById('cambioMacchina').value) || 0;
    let velocita = velocitaProduzione[tipo]?.fustiOra;

    if (tipo === "25") {
        const macchina1 = parseInt(document.getElementById('macchina1').value) || 0;
        const macchina2 = parseInt(document.getElementById('macchina2').value) || 0;
        const totaleMacchine = macchina1 + macchina2;
        velocita = totaleMacchine || velocita;
    }

    if (!velocita || isNaN(fustiDaProdurre)) {
        alert("Dati non validi");
        return;
    }

    const tempoOre = (fustiDaProdurre / velocita) + (pausa + cambioMacchina) / 60;
    avviaProgressBar(tempoOre * 3600, 'progressBarFusti');
    const risultato = formattaTempoDinamico(tempoOre);

    datiGrafico.labels.push(new Date().toLocaleTimeString());
    datiGrafico.datasets[0].data.push(fustiDaProdurre);
    graficoProduzione.update();

    const indiceTurno = turnoAttuale === 'Mattino' ? 0 : 1;
    datiGraficoTurni.datasets[0].data[indiceTurno] += fustiDaProdurre;
    graficoTurni.update();

    document.getElementById('risultatoFusti').innerHTML = risultato;
    contatoreFusti++;
    aggiungiCronologia("cronologiaFusti", contatoreFusti, `${risultato} | Turno: ${turnoAttuale}`);
}

function formattaTempoDinamico(tempoOre) {
    const ore = Math.floor(tempoOre);
    const minuti = Math.round((tempoOre - ore) * 60);
    const oraFine = calcolaOraFine(tempoOre);
    return `⏱️ ${ore} ore e ${minuti} minuti<br>🕒 Fine alle ${oraFine}`;
}

function calcolaOraFine(tempoOre) {
    const fine = new Date(new Date().getTime() + tempoOre * 3600 * 1000);
    return `${fine.getHours().toString().padStart(2, '0')}:${fine.getMinutes().toString().padStart(2, '0')}`;
}

function aggiungiCronologia(divId, contatore, testo) {
    const cronologia = document.getElementById(divId);
    const p = document.createElement('p');
    p.innerHTML = `#${contatore}: ${testo}`;
    p.dataset.turno = turnoAttuale;
    cronologia.appendChild(p);
}

function filtraCronologia() {
    const filtro = document.getElementById('filtroTurno').value;
    document.querySelectorAll('#cronologiaFusti p, #cronologiaQuintali p').forEach(p => {
        p.style.display = (filtro === 'tutti' || p.dataset.turno === filtro) ? 'block' : 'none';
    });
}

function avviaProgressBar(durataSec, barId) {
    let progresso = 0;
    const barra = document.getElementById(barId);
    clearInterval(progressInterval);

    progressInterval = setInterval(() => {
        progresso += 1;
        const percentuale = Math.min((progresso / durataSec) * 100, 100);
        barra.style.width = `${percentuale}%`;

        if (percentuale >= 100) {
            clearInterval(progressInterval);
            notificaFineProduzione();
        }
    }, 1000);
}

function notificaFineProduzione() {
    const audio = document.getElementById('notificaAudio');
    audio.play();

    if (navigator.vibrate) {
        navigator.vibrate([500, 200, 500]);
    }

    alert("Produzione completata!");
}

function calcolaQuintali() {
    aggiornaTurno();
    const tipo = document.getElementById('fustoTipoQ').value;
    const quintaliDaProdurre = parseFloat(document.getElementById('quintaliTotali').value);
    const pausa = parseInt(document.getElementById('pausaQ').value) || 0;
    const cambioMacchina = parseInt(document.getElementById('cambioMacchinaQ').value) || 0;

    const velocita = velocitaProduzione[tipo]?.qOra;

    if (!velocita || isNaN(quintaliDaProdurre)) {
        alert("Dati non validi");
        return;
    }

    const tempoOre = (quintaliDaProdurre / velocita) + (pausa + cambioMacchina) / 60;
    const risultato = formattaTempoDinamico(tempoOre);

    document.getElementById('risultatoQuintali').innerHTML = risultato;
    contatoreQuintali++;
    aggiungiCronologia("cronologiaQuintali", contatoreQuintali, `${risultato} | Turno: ${turnoAttuale}`);
}

function resettaCronologia() {
    document.getElementById('cronologiaFusti').innerHTML = '';
    document.getElementById('cronologiaQuintali').innerHTML = '';
    contatoreFusti = 0;
    contatoreQuintali = 0;
}

function esportaCSV() {
    let csv = "Tipo, Numero, Turno\n";
    document.querySelectorAll('#cronologiaFusti p, #cronologiaQuintali p').forEach(p => {
        csv += `${p.innerText.replace(/#/g, '').replace(/:/g, '').replace('|', ',')}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = 'cronologia_produzione.csv';
    link.click();
}
