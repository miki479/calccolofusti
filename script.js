// Funzione per calcolare l'orario di fine produzione
function calcolaOrari() {
    const turno = document.getElementById('turno').value;
    const fusti = parseInt(document.getElementById('fusti').value) || 0;
    const pausa = parseFloat(document.getElementById('pausa').value) || 0;
    const cambio = parseInt(document.getElementById('cambio').value) || 0;

    if (fusti <= 0) {
        alert("Inserisci un numero valido di fusti!");
        return;
    }

    let [oraInizio, minutoInizio] = turno.split(":").map(num => parseInt(num));
    const tempoProduzione = fusti / 120;
    let tempoTotale = tempoProduzione + pausa + (cambio / 60);
    let oraFine = oraInizio + Math.floor(tempoTotale);
    let minutoFine = minutoInizio + Math.round((tempoTotale % 1) * 60);

    if (minutoFine >= 60) {
        oraFine += 1;
        minutoFine -= 60;
    }

    let orarioFissoElem = document.getElementById('orario-fisso');
    let orarioFisso = `${oraFine}:${minutoFine.toString().padStart(2, '0')}`;

    let straordinario = "";
    if (oraFine > 20 || (oraFine === 20 && minutoFine > 40)) {
        straordinario = `(Straordinario: 30min o 1h, finirai alle ${oraFine + 1}:${minutoFine < 30 ? '30' : '00'})`;
        orarioFissoElem.style.color = "red";
    } else {
        orarioFissoElem.style.color = "black";
    }

    document.getElementById('orario-fisso').textContent = `Orario Fisso: ${orarioFisso} ${straordinario}`;
    aggiornaOrarioDinamico(oraFine, minutoFine);
    salvaCronologia(turno, fusti, orarioFisso, pausa, cambio, straordinario);
    creaGraficoProduzione(fusti);
}

// Funzione per aggiornare l'orario dinamico
function aggiornaOrarioDinamico(oraFine, minutoFine) {
    function aggiorna() {
        let oraAttuale = new Date();
        let oreMancanti = oraFine - oraAttuale.getHours();
        let minutiMancanti = minutoFine - oraAttuale.getMinutes();
        if (minutiMancanti < 0) {
            oreMancanti -= 1;
            minutiMancanti += 60;
        }
        document.getElementById('orario-dinamico').textContent = `Orario Dinamico: ${oreMancanti}h ${minutiMancanti}m`;
    }
    aggiorna();
    setInterval(aggiorna, 60000); // Aggiorna ogni minuto
}

// Funzione per aggiungere un elemento alla cronologia
function salvaCronologia(turno, fusti, orarioFisso, pausa, cambio, straordinario) {
    let cronologia = JSON.parse(localStorage.getItem('cronologia')) || [];
    cronologia.push({ turno, fusti, orarioFisso, pausa, cambio, straordinario });
    localStorage.setItem('cronologia', JSON.stringify(cronologia));
    aggiornaCronologia();
}

// Funzione per aggiornare la lista della cronologia
function aggiornaCronologia() {
    let cronologia = JSON.parse(localStorage.getItem('cronologia')) || [];
    let lista = document.getElementById('cronologia-lista');
    lista.innerHTML = ''; // Svuota la lista ogni volta per aggiornarla
    cronologia.forEach((item, index) => {
        let elemento = document.createElement('div');
        elemento.classList.add('cronologia-item');
        elemento.innerHTML = `
            <span>Turno: ${item.turno}, Fusti: ${item.fusti}</span>
            <button onclick="mostraDettagliCronologia(${index})">Vedi</button>
            <button onclick="eliminaElementoCronologia(${index})">Elimina</button>
        `;
        lista.appendChild(elemento);
    });
}

// Funzione per eliminare una voce dalla cronologia
function eliminaElementoCronologia(index) {
    let cronologia = JSON.parse(localStorage.getItem('cronologia')) || [];
    cronologia.splice(index, 1); // Rimuove l'elemento selezionato
    localStorage.setItem('cronologia', JSON.stringify(cronologia)); // Salva nuovamente la cronologia aggiornata
    aggiornaCronologia(); // Rende visibile la cronologia aggiornata
}

// Funzione per visualizzare la Modal con i dettagli della cronologia
function mostraDettagliCronologia(index) {
    let cronologia = JSON.parse(localStorage.getItem('cronologia')) || [];
    let dettaglio = cronologia[index];

    document.getElementById('modal-titolo').textContent = `Dettagli Cronologia ${index + 1}`;
    document.getElementById('modal-contenuto').innerHTML = `
        <p>Turno: ${dettaglio.turno}</p>
        <p>Fusti: ${dettaglio.fusti}</p>
        <p>Orario Fisso: ${dettaglio.orarioFisso}</p>
        <p>Pausa: ${dettaglio.pausa} ore</p>
        <p>Cambio: ${dettaglio.cambio} minuti</p>
        <p>Straordinario: ${dettaglio.straordinario || 'Nessuno'}</p>
    `;
    document.getElementById('modal').style.display = "block";
}

// Funzione per chiudere la Modal
function chiudiModal() {
    document.getElementById('modal').style.display = "none";
}

document.querySelector('.close').addEventListener('click', chiudiModal);

// Funzione per selezionare il turno in base all'ora corrente
function selezionaTurnoAutomatico() {
    const oraAttuale = new Date().getHours();
    if (oraAttuale >= 6 && oraAttuale < 14) {
        document.getElementById('turno').value = "6:00";
    } else if (oraAttuale >= 14 && oraAttuale < 22) {
        document.getElementById('turno').value = "14:00";
    } else {
        document.getElementById('turno').value = "8:00";
    }
}

document.addEventListener('DOMContentLoaded', selezionaTurnoAutomatico);

// Funzione per creare il grafico della produzione
function creaGraficoProduzione(fusti) {
    const ctx = document.getElementById('grafico-produzione').getContext('2d');

    const dati = {
        labels: ['Mattina', 'Pomeriggio', 'Spezzato'],
        datasets: [{
            label: 'Fusti Prodotti',
            data: [fusti, fusti / 2, fusti / 3],
            backgroundColor: ['rgba(54, 162, 235, 0.2)', 'rgba(255, 99, 132, 0.2)', 'rgba(75, 192, 192, 0.2)'],
            borderColor: ['rgba(54, 162, 235, 1)', 'rgba(255, 99, 132, 1)', 'rgba(75, 192, 192, 1)'],
            borderWidth: 1
        }]
    };

    const config = {
        type: 'bar',
        data: dati,
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    };

    new Chart(ctx, config);
}
