document.addEventListener('DOMContentLoaded', () => {

    // Funzione per calcolare l'orario di fine
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
        const tempoProduzione = fusti / 120;  // tempo per produrre fusti
        let tempoTotale = tempoProduzione + pausa + (cambio / 60);
        let oraFine = oraInizio + Math.floor(tempoTotale);
        let minutoFine = minutoInizio + Math.round((tempoTotale % 1) * 60);

        if (minutoFine >= 60) {
            oraFine += 1;
            minutoFine -= 60;
        }

        if (oraFine >= 24) {
            oraFine -= 24; // Gestisce il superamento delle 24 ore
        }

        // Verifica se i fusti sono troppi per il turno
        let messaggioSuperamento = "";
        let fustiProdotti = fusti;
        const tassoProduzione = 2;  // 2 fusti al minuto

        if (turno === "6:00") {
            // Calcolo dei fusti per il turno di mattina (fino alle 14:00)
            let tempoDisponibile = (14 - oraInizio) * 60 - minutoInizio; // tempo disponibile in minuti
            fustiProdotti = Math.floor(tempoDisponibile * tassoProduzione); // calcoliamo quanti fusti si possono fare
            if (fusti > fustiProdotti) {
                messaggioSuperamento = `I fusti sono troppi per il tuo turno, potrai fare circa ${fustiProdotti} fusti entro le 14:00.`;
            }
        } else if (turno === "14:00") {
            // Calcolo dei fusti per il turno pomeridiano (fino alle 22:00)
            let tempoDisponibile = (22 - oraInizio) * 60 - minutoInizio; // tempo disponibile in minuti
            fustiProdotti = Math.floor(tempoDisponibile * tassoProduzione); // calcoliamo quanti fusti si possono fare
            if (fusti > fustiProdotti) {
                messaggioSuperamento = `I fusti sono troppi per il tuo turno, potrai fare circa ${fustiProdotti} fusti entro le 22:00.`;
            }
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

        document.getElementById('orario-fisso').textContent = `Orario Fisso: ${orarioFisso} ${straordinario} ${messaggioSuperamento}`;
        aggiornaOrarioDinamico(oraFine, minutoFine);
        salvaCronologia(turno, fusti, orarioFisso, pausa, cambio, straordinario);
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
            const orarioDinamicElem = document.getElementById('orario-dinamico');
            if (orarioDinamicElem) {
                orarioDinamicElem.textContent = `Orario Dinamico: Ti mancano ${oreMancanti}h ${minutiMancanti}m`;
            }
        }
        aggiorna();
        setInterval(aggiorna, 60000);
    }

    // Funzione per salvare la cronologia nel localStorage
    function salvaCronologia(turno, fusti, orarioFisso, pausa, cambio, straordinario) {
        let cronologia = JSON.parse(localStorage.getItem('cronologia')) || [];
        let nuovoCalcolo = {
            turno,
            fusti,
            orarioFisso,
            pausa,
            cambio,
            straordinario
        };
        cronologia.push(nuovoCalcolo);
        localStorage.setItem('cronologia', JSON.stringify(cronologia));
        aggiornaCronologia();
    }

    // Funzione per aggiornare la lista della cronologia
    function aggiornaCronologia() {
        let cronologia = JSON.parse(localStorage.getItem('cronologia')) || [];
        let lista = document.getElementById('cronologia-lista');
        lista.innerHTML = '';

        cronologia.forEach((item, index) => {
            let elemento = document.createElement('div');
            elemento.classList.add('cronologia-item');
            elemento.innerHTML = `
                <span>Calcolo ${index + 1} (${item.turno}) - Finirai alle ${item.orarioFisso} ${item.straordinario}</span>
                <button class="elimina-btn" data-index="${index}">❌ Elimina</button>
            `;
            lista.appendChild(elemento);
        });

        // Aggiungi l'event listener per ogni pulsante "elimina"
        const eliminaBtns = document.querySelectorAll('.elimina-btn');
        eliminaBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = e.target.dataset.index;
                eliminaCronologia(index);
            });
        });
    }

    // Funzione per eliminare un calcolo dalla cronologia
    function eliminaCronologia(index) {
        let cronologia = JSON.parse(localStorage.getItem('cronologia')) || [];
        cronologia.splice(index, 1);
        localStorage.setItem('cronologia', JSON.stringify(cronologia));
        aggiornaCronologia();
    }

    // Avvia la cronologia appena il DOM è pronto
    aggiornaCronologia();

    // Aggiorna il calcolo quando si clicca il pulsante
    document.getElementById('calcolaBtn').addEventListener('click', calcolaOrari);
});
