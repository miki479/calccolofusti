let contatoreFusti = 0;
let contatoreQuintali = 0;

// Dati per il grafico
let datiGrafico = {
    labels: [], // Etichette (ad esempio, tempo o calcoli)
    datasets: [{
        label: 'Fusti prodotti',
        data: [],  // Dati di produzione per fusti
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        fill: false,
        tension: 0.1
    }, {
        label: 'Quintali prodotti',
        data: [],  // Dati di produzione per quintali
        borderColor: 'rgba(153, 102, 255, 1)',
        backgroundColor: 'rgba(153, 102, 255, 0.2)',
        fill: false,
        tension: 0.1
    }]
};

let ctx = document.getElementById('grafico-produzione').getContext('2d');
let graficoProduzione = new Chart(ctx, {
    type: 'line',
    data: datiGrafico,
    options: {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            tooltip: {
                mode: 'index',
                intersect: false,
            }
        },
        scales: {
            x: {
                type: 'linear',
                position: 'bottom'
            },
            y: {
                beginAtZero: true
            }
        }
    }
});

// Funzione per aggiornare il grafico
function aggiornaGrafico(tipo, valore) {
    let data = new Date();
    let ora = data.getHours() + (data.getMinutes() / 60);

    if (tipo === "fusti") {
        datiGrafico.labels.push(ora);
        datiGrafico.datasets[0].data.push(valore);
    } else if (tipo === "quintali") {
        datiGrafico.labels.push(ora);
        datiGrafico.datasets[1].data.push(valore);
    }

    graficoProduzione.update();
}

// TAB SWITCHING
function openTab(evt, tabId) {
    const tabs = document.querySelectorAll('.tab-content');
    const buttons = document.querySelectorAll('.tab-button');

    tabs.forEach(tab => tab.classList.remove('active'));
    buttons.forEach(btn => btn.classList.remove('active'));

    document.getElementById(tabId).classList.add('active');
    evt.currentTarget.classList.add('active');
}

// Velocità di Produzione
const velocitaProduzione = {
    "25": { fustiOra: 120, qOra: 30 },
    "20": { fustiOra: 33, qOra: 9.9 },
    "20sacca": { fustiOra: 22, qOra: 6.6 },
    "10": { fustiOra: 260, qOra: 26 },
    "3bag": { fustiOra: null, qOra: 9 }
};

function aggiornaVelocita() {
    const tipo = document.getElementById('fustoTipo').value;
    const macchineDiv = document.getElementById('macchineInputs');
    macchineDiv.classList.toggle('hidden', tipo !== "25");
}

function aggiornaVelocitaQuintali() {
    const tipo = document.getElementById('fustoTipoQ').value;
}

// CALCOLO FUSTI
function calcolaFusti() {
    const tipo = document.getElementById('fustoTipo').value;
    const fustiDaProdurre = parseInt(document.getElementById('fustiTotali').value);
    const pausa = parseInt(document.getElementById('pausa').value) || 0;
    const cambioMacchina = parseInt(document.getElementById('cambioMacchina').value) || 0;

    let velocita = velocitaProduzione[tipo]?.fustiOra;

    if (!velocita || isNaN(fustiDaProdurre)) {
        alert("Inserisci un numero valido di fusti!");
        return;
    }

    if (tipo === "25") {
        const macchina1 = parseInt(document.getElementById('macchina1').value) || 0;
        const macchina2 = parseInt(document.getElementById('macchina2').value) || 0;
        const totaleMacchine = macchina1 + macchina2;

        if (totaleMacchine > 0) {
            velocita = totaleMacchine;
        } else {
            alert("Inserisci la produzione di almeno una macchina!");
            return;
        }
    }

    const tempoOre = (fustiDaProdurre / velocita) + (pausa / 60) + (cambioMacchina / 60);
    const risultato = formattaTempoDinamico(tempoOre);

    const output = `🚀 Produzione Totale: ${velocita} fusti/h<br>⏱️ Tempo stimato: ${risultato}`;
    document.getElementById('risultatoFusti').innerHTML = output;

    contatoreFusti++;
    aggiungiCronologia("cronologiaFusti", contatoreFusti, output);
    salvaStato();
}

// CALCOLO QUINTALI
function calcolaQuintali() {
    const tipo = document.getElementById('fustoTipoQ').value;
    const quintaliDaProdurre = parseFloat(document.getElementById('quintaliTotali').value);
    const pausa = parseInt(document.getElementById('pausaQ').value) || 0;
    const cambioMacchina = parseInt(document.getElementById('cambioMacchinaQ').value) || 0;

    let velocita = velocitaProduzione[tipo]?.qOra;

    if (!velocita || isNaN(quintaliDaProdurre)) {
        alert("Inserisci un numero valido di quintali!");
        return;
    }

    const tempoOre = (quintaliDaProdurre / velocita) + (pausa / 60) + (cambioMacchina / 60);
    const risultato = formattaTempoDinamico(tempoOre);

    const output = `🚀 Produzione Totale: ${velocita} q/h<br>⏱️ Tempo stimato: ${risultato}`;
    document.getElementById('risultatoQuintali').innerHTML = output;

    contatoreQuintali++;
    aggiungiCronologia("cronologiaQuintali", contatoreQuintali, output);
    salvaStato();
}

function aggiungiCronologia(identificativo, contatore, output) {
    const cronologia = document.getElementById(identificativo);
    cronologia.innerHTML += `<p>Calcolo #${contatore}: ${output}</p>`;
}

function formattaTempoDinamico(tempoOre) {
    const ore = Math.floor(tempoOre);
    const minuti = Math.round((tempoOre - ore) * 60);
    return `${ore} ore e ${minuti} minuti`;
}

function salvaStato() {
    // Salva stato in localStorage per preservare i dati
    const stato = {
        fusti: contatoreFusti,
        quintali: contatoreQuintali
    };
    localStorage.setItem('statoProduzione', JSON.stringify(stato));
}

function esportaCSV() {
    const stato = localStorage.getItem('statoProduzione');
    if (stato) {
        const statoJSON = JSON.parse(stato);
        const csvContent = `Fusti: ${statoJSON.fusti}, Quintali: ${statoJSON.quintali}`;
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'produzione.csv';
        link.click();
    }
}

function aggiornaTurno() {
    const currentTime = new Date();
    const turno = currentTime.getHours() >= 5 && currentTime.getHours() < 14 ? 'Mattino' : 'Pomeriggio';
    document.getElementById('turnoStatus').innerHTML = `Turno corrente: ${turno}`;
}

// RESET CRONOLOGIA
function resettaCronologia() {
    contatoreFusti = 0;
    contatoreQuintali = 0;
    document.getElementById('cronologiaFusti').innerHTML = '';
    document.getElementById('cronologiaQuintali').innerHTML = '';
}
