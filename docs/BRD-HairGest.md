# HairGest - Business Requirements Document (BRD)

**Versione:** 1.0
**Data:** 12 Febbraio 2026
**Prodotto:** HairGest - Gestionale Finanziario per Saloni da Parrucchiere
**Autore:** Product Manager
**Stato:** Draft - In attesa di approvazione

---

## 1. Executive Summary

HairGest e' una webapp di gestione finanziaria progettata specificamente per saloni da parrucchiere in regime forfettario. Il prodotto sostituisce l'attuale gestione basata su fogli Excel, offrendo un'esperienza digitale affidabile, persistente e automatizzata per il tracking di incassi, spese, profitti e previsionale fiscale.

**Primo utente pilota:** Mattia, proprietario di **Glam Hair Boutique**
**Dato critico:** La sala ha iniziato l'attivita' a Giugno 2025 con un investimento iniziale di 36.000 euro e un obiettivo di utile annuale di 60.000 euro.

---

## 2. Analisi dei Dati Esistenti (Excel di Mattia)

### 2.1 Struttura Attuale dell'Excel

L'Excel attuale e' composto da 11 fogli:

| Foglio | Funzione |
|---|---|
| Inizia qui | Configurazione: attivita', categorie spesa, obiettivi mensili |
| INCASSI | Registro incassi con canale (Negozio/Privato) |
| INCOME BACK-END | Backend dati incassi con mese/anno |
| Traccia le Spese | Registro spese con categoria e descrizione |
| EXPENSES BACK-END | Backend dati spese |
| Panoramica Incassi | Riepilogo incassi mensili per canale e proprieta' |
| Panoramica spese | Riepilogo spese mensili per categoria |
| Panoramica generale | P&L annuale: incassi vs spese vs profitto vs obiettivo |
| Panoramica mensile | Dettaglio singolo mese selezionato |
| Panoramica negozio | Dettaglio per singola proprieta'/negozio |
| CHARTS BACK-END | Dati aggregati per grafici |

### 2.2 Dati Reali di Mattia (Giugno - Dicembre 2025)

#### Configurazione Attivita'
- **Ragione sociale:** Glam Hair Boutique
- **Prezzo d'acquisto attivita':** 36.000 euro
- **Regime fiscale:** Forfettario
- **Anno di partenza:** 2025 (attivita' da Giugno)
- **Obiettivo utile annuale:** 60.000 euro
- **Obiettivo utile mensile:** 5.000 euro/mese

#### Canali di Entrata
| Canale | Descrizione |
|---|---|
| NEGOZIO | Incassi da lavoro in salone |
| PRIVATO | Incassi da lavori privati/fuori salone |

#### Categorie di Spesa (10 categorie)
| Categoria | Totale Annuo 2025 | Tipo |
|---|---|---|
| Fornitori | 4.360,14 euro | Variabile |
| Finanziamento | 3.181,02 euro | Fisso (530,17/mese) |
| Affitto | 2.100,00 euro | Fisso (350/mese) |
| Spese Varie | 2.178,00 euro | Variabile |
| Dipendenti | 1.750,00 euro | Variabile |
| Ristrutturazione | 1.510,00 euro | Una tantum |
| Commercialista | 1.350,00 euro | Periodico |
| Utenze | 1.305,00 euro | Variabile |
| Formazione | 800,00 euro | Periodico |
| Tasse | 747,00 euro | Periodico |
| **TOTALE** | **19.281,16 euro** | |

#### Incassi Mensili 2025

| Mese | Negozio | Privato | Totale | Spese | Profitto | Margine |
|---|---|---|---|---|---|---|
| Giugno | 1.300 | 500 | 1.800 | 0* | 1.800 | 100% |
| Luglio | 3.626 | 1.431 | 5.057 | 3.044,17 | 2.012,83 | 39,8% |
| Agosto | 3.703 | 911 | 4.614 | 2.260,31 | 2.353,69 | 51,0% |
| Settembre | 3.861 | 1.254 | 5.115 | 3.851,17 | 1.263,83 | 24,7% |
| Ottobre | 3.751,40 | 1.719 | 5.470,40 | 1.463,17 | 4.007,23 | 73,3% |
| Novembre | 3.312 | 1.061 | 4.373 | 4.434,17 | -61,17 | -1,4% |
| Dicembre | 6.215 | 1.771 | 7.986 | 4.228,17 | 3.757,83 | 47,1% |
| **TOTALE** | **25.768,40** | **8.647** | **34.415,40** | **19.281,16** | **15.134,24** | **44,0%** |

*Giugno: spese non registrate (mese parziale di apertura)

#### KPI Annuali 2025
- **Fatturato totale:** 34.415,40 euro
- **Spese totali:** 19.281,16 euro
- **Profitto netto (pre-tasse):** 15.134,24 euro
- **Media incassi mensili:** 4.916,49 euro (su 7 mesi operativi)
- **Media spese mensili:** 3.213,53 euro (su 6 mesi con spese)
- **Media profitto mensile:** 1.261,19 euro
- **Margine medio:** 44,0%
- **ROI su acquisto:** 42,04%
- **Obiettivo annuale raggiunto:** 25,2% (15.134 su 60.000)

---

## 3. Gap Analysis: Cosa Manca nell'Excel

L'Excel attuale presenta limiti significativi che il gestionale deve colmare:

### 3.1 Limiti Critici

| Gap | Impatto | Priorita' |
|---|---|---|
| **Nessun previsionale tasse regime forfettario** | Mattia non sa quanto accantonare per le tasse. Con il forfettario, il coefficiente di redditivita' per parrucchieri e' il 67% del fatturato, su cui poi si applicano le aliquote. Non prevedere le tasse puo' portare a crisi di liquidita'. | CRITICA |
| **Nessun accantonamento contributi INPS** | I contributi previdenziali non sono tracciati separatamente. Per il forfettario sono calcolati sul reddito imponibile (67% del fatturato). | CRITICA |
| **Nessuna gestione del cash flow** | Non c'e' visibilita' sulla liquidita' disponibile momento per momento. | ALTA |
| **Nessuna distinzione costi fissi vs variabili** | Impossibile capire il punto di pareggio (break-even) | ALTA |
| **Nessun budget previsionale** | Non si possono pianificare le spese future | ALTA |
| **Nessuna proiezione a fine anno** | Non si sa se si raggiungeranno gli obiettivi annuali | ALTA |
| **Nessun confronto anno su anno** | Non si puo' confrontare la performance con gli anni precedenti | MEDIA |
| **Nessun alert automatico** | Nessuna notifica se si sfora il budget o si va in perdita | MEDIA |
| **Nessun tracking ricorrenze** | Spese fisse (affitto, finanziamento) da reinserire manualmente ogni mese | MEDIA |
| **Dati non protetti** | Un file Excel puo' corrompersi, essere cancellato, non salvato | CRITICA |
| **Nessun export per il commercialista** | Nessun report strutturato da inviare al commercialista | MEDIA |
| **Nessun calcolo dell'utile netto reale** | Profitto calcolato solo come incassi - spese, senza considerare il carico fiscale | CRITICA |

### 3.2 Funzionalita' Mancanti Specifiche per Regime Forfettario

Il regime forfettario per parrucchieri prevede:

1. **Coefficiente di redditivita': 67%** del fatturato lordo
   - Su 34.415,40 euro di fatturato -> Reddito imponibile: 23.058,32 euro
2. **Imposta sostitutiva:** 15% sul reddito imponibile (5% per i primi 5 anni se nuova attivita')
   - Se 5%: 23.058,32 * 5% = 1.152,92 euro
   - Se 15%: 23.058,32 * 15% = 3.458,75 euro
3. **Contributi INPS artigiani:** circa 24% sul reddito imponibile (con minimale)
   - 23.058,32 * 24% = circa 5.533,99 euro
4. **Limite fatturato:** 85.000 euro/anno per rimanere nel forfettario

---

## 4. Requisiti del Prodotto

### 4.1 Utente Primario (Persona)

**Nome:** Mattia
**Ruolo:** Proprietario e parrucchiere
**Attivita':** Glam Hair Boutique
**Regime fiscale:** Forfettario
**Contesto:** Lavora in salone tutto il giorno, inserisce i dati a fine giornata o a fine mese dal telefono o computer. Ha bisogno di semplicita' e velocita'. Non e' un esperto finanziario.
**Pain point attuali:**
- Perde tempo con l'Excel
- Non ha visibilita' sul carico fiscale
- Rischia di perdere i dati
- Non sa quanto sta realmente guadagnando al netto delle tasse
- Non ha una vista chiara del suo andamento nel tempo

### 4.2 Requisiti Funzionali (Feature Scope V1)

#### RF-01: Gestione Attivita' e Profilo

| ID | Requisito | Priorita' |
|---|---|---|
| RF-01.1 | Creazione profilo utente con dati anagrafici attivita' | MUST |
| RF-01.2 | Configurazione regime fiscale (forfettario con coefficiente 67%) | MUST |
| RF-01.3 | Impostazione anno fiscale e mese di inizio attivita' | MUST |
| RF-01.4 | Prezzo di acquisto dell'attivita' (per calcolo ROI) | SHOULD |
| RF-01.5 | Configurazione canali di entrata personalizzabili (max 20) | MUST |
| RF-01.6 | Configurazione categorie di spesa personalizzabili (max 20) | MUST |
| RF-01.7 | Impostazione obiettivo utile annuale | MUST |
| RF-01.8 | Impostazione obiettivi utile mensili (personalizzabili per ogni mese) | MUST |
| RF-01.9 | Aliquota imposta sostitutiva configurabile (5% o 15%) | MUST |

#### RF-02: Gestione Incassi

| ID | Requisito | Priorita' |
|---|---|---|
| RF-02.1 | Inserimento incasso con: importo, canale, periodo (mese/anno), note | MUST |
| RF-02.2 | Incasso associato al negozio/proprieta' | MUST |
| RF-02.3 | Modifica e cancellazione incassi esistenti | MUST |
| RF-02.4 | Visualizzazione totale incassi cumulativo (di sempre) | MUST |
| RF-02.5 | Filtri per canale, periodo, negozio | MUST |
| RF-02.6 | Inserimento rapido da mobile con campi precompilati | SHOULD |

#### RF-03: Gestione Spese

| ID | Requisito | Priorita' |
|---|---|---|
| RF-03.1 | Inserimento spesa con: data, categoria, importo, oggetto/descrizione, note | MUST |
| RF-03.2 | Spesa associata al negozio/proprieta' | MUST |
| RF-03.3 | Modifica e cancellazione spese esistenti | MUST |
| RF-03.4 | Visualizzazione totale spese cumulativo | MUST |
| RF-03.5 | Classificazione spesa come fissa/variabile/una tantum | MUST |
| RF-03.6 | Gestione spese ricorrenti (auto-generazione mensile) | SHOULD |
| RF-03.7 | Allegato ricevuta/fattura (upload immagine) | COULD |

#### RF-04: Dashboard Panoramica Generale (Annuale)

| ID | Requisito | Priorita' |
|---|---|---|
| RF-04.1 | Profitto totale annuale (incassi - spese) | MUST |
| RF-04.2 | Media mensile dei profitti | MUST |
| RF-04.3 | Tabella mensile: incassi / spese / profitto / margine / obiettivo | MUST |
| RF-04.4 | Grafico incassi mensili (bar chart) | MUST |
| RF-04.5 | Grafico spese vs profitti | MUST |
| RF-04.6 | Grafico obiettivo vs profitto reale | MUST |
| RF-04.7 | Selezione anno di visualizzazione | MUST |
| RF-04.8 | Confronto anno su anno (YoY) | SHOULD |

#### RF-05: Dashboard Panoramica Incassi

| ID | Requisito | Priorita' |
|---|---|---|
| RF-05.1 | Totale incasso annuale | MUST |
| RF-05.2 | Media mensile incassi | MUST |
| RF-05.3 | Breakdown per canale (Negozio/Privato) mese per mese | MUST |
| RF-05.4 | Breakdown per proprieta'/negozio | MUST |
| RF-05.5 | Grafico incassi per canale (pie chart) | MUST |
| RF-05.6 | Trend incassi nel tempo (line chart) | MUST |

#### RF-06: Dashboard Panoramica Spese

| ID | Requisito | Priorita' |
|---|---|---|
| RF-06.1 | Totale spese annuali | MUST |
| RF-06.2 | Media spese mensili | MUST |
| RF-06.3 | Breakdown per categoria mese per mese | MUST |
| RF-06.4 | Breakdown per proprieta'/negozio | MUST |
| RF-06.5 | Grafico spese per categoria (pie chart / bar chart) | MUST |
| RF-06.6 | Top 3 categorie di spesa | SHOULD |
| RF-06.7 | Incidenza percentuale di ogni categoria sul totale | MUST |

#### RF-07: Dashboard Panoramica Mensile

| ID | Requisito | Priorita' |
|---|---|---|
| RF-07.1 | Selettore mese/anno | MUST |
| RF-07.2 | KPI del mese: incassi, spese, obiettivo, profitto, margine | MUST |
| RF-07.3 | Dettaglio incassi per canale nel mese | MUST |
| RF-07.4 | Dettaglio incassi per proprieta' nel mese | MUST |
| RF-07.5 | Dettaglio spese per categoria nel mese | MUST |
| RF-07.6 | Confronto con mese precedente (delta %) | SHOULD |
| RF-07.7 | Confronto con stesso mese anno precedente | SHOULD |

#### RF-08: Dashboard Panoramica Negozio

| ID | Requisito | Priorita' |
|---|---|---|
| RF-08.1 | Selettore negozio/proprieta' | MUST |
| RF-08.2 | KPI negozio: totale incassi, spese, profitto, margine, media mensile | MUST |
| RF-08.3 | Prezzo di acquisto e calcolo ROI | MUST |
| RF-08.4 | Tabella mensile incassi/spese/profitto per il negozio | MUST |
| RF-08.5 | Breakdown incassi per canale del negozio | MUST |
| RF-08.6 | Breakdown spese per categoria del negozio | MUST |

#### RF-09: Previsionale Fiscale Regime Forfettario (NUOVA)

| ID | Requisito | Priorita' |
|---|---|---|
| RF-09.1 | Calcolo automatico reddito imponibile (fatturato * 67%) | MUST |
| RF-09.2 | Calcolo imposta sostitutiva (5% o 15% del reddito imponibile) | MUST |
| RF-09.3 | Stima contributi INPS artigiani (circa 24% con minimale fisso) | MUST |
| RF-09.4 | Visualizzazione tasse previste mese per mese (pro-rata) | MUST |
| RF-09.5 | Visualizzazione utile netto reale (dopo tasse e contributi) | MUST |
| RF-09.6 | Accantonamento suggerito mensile per tasse | MUST |
| RF-09.7 | Alert superamento soglia 85.000 euro (uscita forfettario) | MUST |
| RF-09.8 | Scadenzario fiscale: date scadenza imposte e contributi | SHOULD |
| RF-09.9 | Dashboard fiscale dedicata con riepilogo annuale | MUST |
| RF-09.10 | Confronto tasse previste vs tasse effettivamente pagate | SHOULD |

#### RF-10: Proiezioni e Analisi Predittiva (NUOVA)

| ID | Requisito | Priorita' |
|---|---|---|
| RF-10.1 | Proiezione fatturato a fine anno basata su trend attuale | MUST |
| RF-10.2 | Proiezione spese a fine anno basata su trend e costi fissi | MUST |
| RF-10.3 | Proiezione profitto a fine anno | MUST |
| RF-10.4 | Distanza dall'obiettivo annuale e mensile rimanente necessario | MUST |
| RF-10.5 | Break-even point: fatturato minimo per coprire i costi fissi | SHOULD |
| RF-10.6 | Analisi stagionalita' (mesi forti vs deboli) | SHOULD |

#### RF-11: Cash Flow e Liquidita' (NUOVA)

| ID | Requisito | Priorita' |
|---|---|---|
| RF-11.1 | Saldo di cassa attuale (incassi cumulativi - spese cumulative) | MUST |
| RF-11.2 | Grafico andamento liquidita' nel tempo | SHOULD |
| RF-11.3 | Previsione liquidita' futura (considerando spese fisse programmate e tasse) | SHOULD |
| RF-11.4 | Alert se la liquidita' prevista scende sotto una soglia | SHOULD |

#### RF-12: Budget e Pianificazione (NUOVA)

| ID | Requisito | Priorita' |
|---|---|---|
| RF-12.1 | Impostazione budget mensile per categoria di spesa | SHOULD |
| RF-12.2 | Confronto budget vs speso effettivo | SHOULD |
| RF-12.3 | Alert superamento budget per categoria | SHOULD |
| RF-12.4 | Report varianza budget | COULD |

#### RF-13: Export e Reportistica (NUOVA)

| ID | Requisito | Priorita' |
|---|---|---|
| RF-13.1 | Export dati per il commercialista (PDF o Excel) | SHOULD |
| RF-13.2 | Report annuale stampabile con tutti i KPI | SHOULD |
| RF-13.3 | Export singolo mese | SHOULD |
| RF-13.4 | Report fiscale per dichiarazione dei redditi | COULD |

### 4.3 Requisiti Non Funzionali

#### RNF-01: Persistenza e Affidabilita' dei Dati (PRIORITA' MASSIMA)

| ID | Requisito | Priorita' |
|---|---|---|
| RNF-01.1 | **Salvataggio automatico** ad ogni inserimento/modifica dati | MUST |
| RNF-01.2 | **Nessun pulsante "Salva"**: i dati sono persistiti immediatamente | MUST |
| RNF-01.3 | Database persistente lato server (non localStorage/sessionStorage) | MUST |
| RNF-01.4 | Backup automatico del database (almeno giornaliero) | MUST |
| RNF-01.5 | Protezione da perdita dati: write-ahead logging o equivalente | MUST |
| RNF-01.6 | Conferma visiva all'utente che il dato e' stato salvato | MUST |
| RNF-01.7 | Gestione offline con sincronizzazione al ripristino connessione | SHOULD |
| RNF-01.8 | Storicizzazione modifiche (audit trail) per poter ripristinare dati | SHOULD |
| RNF-01.9 | Perdita dati = 0. Il sistema deve garantire zero data loss | MUST |

#### RNF-02: Usabilita'

| ID | Requisito | Priorita' |
|---|---|---|
| RNF-02.1 | Interfaccia responsive (desktop + mobile) | MUST |
| RNF-02.2 | Inserimento dati in massimo 3 click/tap | MUST |
| RNF-02.3 | Lingua italiana | MUST |
| RNF-02.4 | Formattazione valuta italiana (euro con virgola decimale) | MUST |
| RNF-02.5 | Tema chiaro/scuro | COULD |

#### RNF-03: Performance

| ID | Requisito | Priorita' |
|---|---|---|
| RNF-03.1 | Caricamento pagina < 2 secondi | MUST |
| RNF-03.2 | Salvataggio dati < 500ms con feedback visivo | MUST |
| RNF-03.3 | Dashboard e grafici calcolati in tempo reale | MUST |

#### RNF-04: Sicurezza

| ID | Requisito | Priorita' |
|---|---|---|
| RNF-04.1 | Autenticazione utente con login | MUST |
| RNF-04.2 | Dati accessibili solo dall'utente proprietario | MUST |
| RNF-04.3 | Comunicazione HTTPS | MUST |
| RNF-04.4 | Password criptata | MUST |

---

## 5. Dati Seed per Mattia (Pre-popolamento)

Il gestionale deve essere precaricato con tutti i dati dell'Excel come se Mattia lo stesse usando da quando ha aperto l'attivita'.

### 5.1 Profilo Utente

```
Nome: Mattia
Attivita': Glam Hair Boutique
Regime fiscale: Forfettario
Coefficiente redditivita': 67%
Aliquota imposta sostitutiva: da configurare (5% o 15%)
Prezzo acquisto attivita': 36.000 euro
Anno partenza: 2025
Mese partenza: Giugno
Obiettivo utile annuale: 60.000 euro
Obiettivi mensili: 5.000 euro/mese (tutti i mesi)
```

### 5.2 Canali di Entrata
```
1. NEGOZIO (incassi in salone)
2. PRIVATO (lavori privati)
```

### 5.3 Categorie di Spesa
```
1. Fornitori (variabile)
2. Formazione (periodico)
3. Utenze (variabile)
4. Tasse (periodico)
5. Finanziamento (fisso - 530,17 euro/mese)
6. Affitto (fisso - 350,00 euro/mese)
7. Dipendenti (variabile)
8. Spese Varie (variabile)
9. Commercialista (periodico)
10. Ristrutturazione (una tantum)
```

### 5.4 Incassi da Importare

| # | Canale | Negozio | Periodo | Importo |
|---|---|---|---|---|
| 1 | NEGOZIO | Glam Hair Boutique | Giugno 2025 | 1.300,00 |
| 2 | PRIVATO | Glam Hair Boutique | Giugno 2025 | 500,00 |
| 3 | NEGOZIO | Glam Hair Boutique | Luglio 2025 | 3.626,00 |
| 4 | PRIVATO | Glam Hair Boutique | Luglio 2025 | 1.431,00 |
| 5 | NEGOZIO | Glam Hair Boutique | Agosto 2025 | 3.703,00 |
| 6 | PRIVATO | Glam Hair Boutique | Agosto 2025 | 911,00 |
| 7 | NEGOZIO | Glam Hair Boutique | Settembre 2025 | 3.861,00 |
| 8 | PRIVATO | Glam Hair Boutique | Settembre 2025 | 1.254,00 |
| 9 | NEGOZIO | Glam Hair Boutique | Ottobre 2025 | 3.751,40 |
| 10 | PRIVATO | Glam Hair Boutique | Ottobre 2025 | 1.719,00 |
| 11 | NEGOZIO | Glam Hair Boutique | Novembre 2025 | 3.312,00 |
| 12 | PRIVATO | Glam Hair Boutique | Novembre 2025 | 1.061,00 |
| 13 | NEGOZIO | Glam Hair Boutique | Dicembre 2025 | 6.215,00 |
| 14 | PRIVATO | Glam Hair Boutique | Dicembre 2025 | 1.771,00 |

### 5.5 Spese da Importare

| # | Data | Categoria | Importo | Note |
|---|---|---|---|---|
| 1 | 31/07/2025 | Ristrutturazione | 1.210,00 | |
| 2 | 31/07/2025 | Utenze | 453,00 | |
| 3 | 31/07/2025 | Dipendenti | 200,00 | |
| 4 | 31/07/2025 | Fornitori | 301,00 | |
| 5 | 31/07/2025 | Affitto | 350,00 | |
| 6 | 31/07/2025 | Finanziamento | 530,17 | |
| 7 | 31/08/2025 | Tasse | 189,00 | |
| 8 | 31/08/2025 | Ristrutturazione | 300,00 | |
| 9 | 31/08/2025 | Dipendenti | 90,00 | |
| 10 | 31/08/2025 | Fornitori | 801,14 | |
| 11 | 31/08/2025 | Affitto | 350,00 | |
| 12 | 31/08/2025 | Finanziamento | 530,17 | |
| 13 | 30/09/2025 | Affitto | 350,00 | |
| 14 | 30/09/2025 | Finanziamento | 530,17 | |
| 15 | 30/09/2025 | Fornitori | 723,00 | |
| 16 | 30/09/2025 | Formazione | 800,00 | |
| 17 | 30/09/2025 | Spese Varie | 1.050,00 | |
| 18 | 30/09/2025 | Dipendenti | 60,00 | |
| 19 | 30/09/2025 | Utenze | 338,00 | |
| 20 | 31/10/2025 | Affitto | 350,00 | |
| 21 | 31/10/2025 | Finanziamento | 530,17 | |
| 22 | 31/10/2025 | Fornitori | 583,00 | |
| 23 | 30/11/2025 | Affitto | 350,00 | |
| 24 | 30/11/2025 | Finanziamento | 530,17 | |
| 25 | 30/11/2025 | Fornitori | 1.098,00 | |
| 26 | 30/11/2025 | Spese Varie | 684,00 | |
| 27 | 30/11/2025 | Tasse | 558,00 | |
| 28 | 30/11/2025 | Utenze | 514,00 | |
| 29 | 30/11/2025 | Dipendenti | 700,00 | |
| 30 | 31/12/2025 | Affitto | 350,00 | |
| 31 | 31/12/2025 | Finanziamento | 530,17 | |
| 32 | 31/12/2025 | Fornitori | 854,00 | |
| 33 | 31/12/2025 | Spese Varie | 444,00 | |
| 34 | 31/12/2025 | Commercialista | 1.350,00 | |
| 35 | 31/12/2025 | Dipendenti | 700,00 | |

---

## 6. Architettura dei Dati (Modello Logico)

### 6.1 Entita' Principali

```
UTENTE
  - id (PK)
  - nome
  - email
  - password_hash
  - created_at
  - updated_at

ATTIVITA (NEGOZIO)
  - id (PK)
  - utente_id (FK)
  - nome (es. "Glam Hair Boutique")
  - regime_fiscale (enum: forfettario)
  - coefficiente_redditivita (default: 0.67)
  - aliquota_imposta (enum: 5% | 15%)
  - prezzo_acquisto
  - data_inizio_attivita
  - obiettivo_utile_annuale
  - created_at
  - updated_at

OBIETTIVO_MENSILE
  - id (PK)
  - attivita_id (FK)
  - anno
  - mese
  - importo_obiettivo
  - created_at
  - updated_at

CANALE_ENTRATA
  - id (PK)
  - attivita_id (FK)
  - nome (es. "NEGOZIO", "PRIVATO")
  - ordine
  - attivo (boolean)

CATEGORIA_SPESA
  - id (PK)
  - attivita_id (FK)
  - nome (es. "Fornitori", "Affitto")
  - tipo (enum: fisso | variabile | una_tantum | periodico)
  - importo_fisso (nullable, per spese fisse)
  - ordine
  - attivo (boolean)

INCASSO
  - id (PK)
  - attivita_id (FK)
  - canale_id (FK)
  - anno
  - mese
  - importo (decimal)
  - note (text, nullable)
  - created_at
  - updated_at

SPESA
  - id (PK)
  - attivita_id (FK)
  - categoria_id (FK)
  - data
  - importo (decimal)
  - oggetto (text, nullable)
  - note (text, nullable)
  - ricorrente (boolean)
  - created_at
  - updated_at

CONFIGURAZIONE_FISCALE
  - id (PK)
  - attivita_id (FK)
  - anno
  - coefficiente_redditivita (0.67)
  - aliquota_imposta_sostitutiva (0.05 o 0.15)
  - aliquota_contributi_inps (0.24)
  - contributo_inps_minimale (nullable)
  - limite_fatturato_forfettario (85000)
```

### 6.2 Viste Calcolate (derivate, non stored)

```
PANORAMICA_MENSILE (calcolata)
  - anno, mese
  - totale_incassi
  - totale_spese
  - profitto_lordo (incassi - spese)
  - obiettivo
  - margine (profitto / incassi)
  - delta_vs_obiettivo
  - reddito_imponibile_cumulativo (incassi_ytd * 0.67)
  - tasse_previste_cumulative
  - contributi_previsti_cumulativi
  - utile_netto_reale

PANORAMICA_ANNUALE (calcolata)
  - anno
  - totale_incassi
  - totale_spese
  - profitto_lordo
  - reddito_imponibile (incassi * 0.67)
  - imposta_sostitutiva_prevista
  - contributi_inps_previsti
  - utile_netto (profitto_lordo - imposta - contributi)
  - media_mensile
  - margine
  - obiettivo
  - % raggiungimento_obiettivo
  - proiezione_fine_anno

PROIEZIONE (calcolata)
  - fatturato_proiettato
  - spese_proiettate
  - profitto_proiettato
  - tasse_proiettate
  - utile_netto_proiettato
  - mesi_rimanenti
  - fatturato_mensile_necessario (per raggiungere obiettivo)
```

---

## 7. Struttura delle Schermate

### 7.1 Navigazione Principale

```
SIDEBAR / NAV:
  1. Dashboard (panoramica generale)
  2. Incassi (registro + inserimento)
  3. Spese (registro + inserimento)
  4. Panoramica Mensile
  5. Panoramica Negozio
  6. Fiscale (previsionale tasse)
  7. Proiezioni
  8. Impostazioni
```

### 7.2 Gerarchia Schermate

```
/ (Login)
/dashboard (Panoramica Generale Annuale)
  - KPI cards: Fatturato, Spese, Profitto Lordo, Utile Netto, Tasse Previste
  - Grafico incassi vs spese mensile
  - Grafico obiettivo vs reale
  - Progresso obiettivo annuale (progress bar)
  - Proiezione fine anno

/incassi (Registro Incassi)
  - Lista incassi con filtri
  - Form inserimento rapido
  - Totali per canale

/spese (Registro Spese)
  - Lista spese con filtri
  - Form inserimento rapido
  - Totali per categoria
  - Indicatore costi fissi vs variabili

/mensile (Panoramica Mensile)
  - Selettore mese/anno
  - KPI mese: incassi, spese, profitto, margine, obiettivo
  - Breakdown incassi per canale
  - Breakdown spese per categoria
  - Confronto vs mese precedente

/negozio (Panoramica Negozio)
  - KPI negozio
  - ROI su investimento
  - Tabella mensile
  - Breakdown incassi/spese

/fiscale (Previsionale Fiscale)
  - Fatturato YTD
  - Reddito imponibile (67%)
  - Imposta sostitutiva prevista
  - Contributi INPS previsti
  - Totale carico fiscale
  - Accantonamento mensile suggerito
  - Barra progresso verso limite 85.000
  - Scadenzario prossime scadenze

/proiezioni (Proiezioni)
  - Proiezione fatturato fine anno
  - Proiezione spese fine anno
  - Proiezione utile netto
  - Gap vs obiettivo
  - Fatturato mensile necessario per obiettivo

/impostazioni (Impostazioni)
  - Profilo utente
  - Dati attivita'
  - Canali entrata (CRUD)
  - Categorie spesa (CRUD)
  - Configurazione fiscale
  - Obiettivi
  - Export dati
```

---

## 8. Regole di Business

### 8.1 Calcoli Fiscali Regime Forfettario

```
REDDITO_IMPONIBILE = FATTURATO_ANNUO * 0.67

IMPOSTA_SOSTITUTIVA = REDDITO_IMPONIBILE * ALIQUOTA (5% o 15%)

CONTRIBUTI_INPS = max(REDDITO_IMPONIBILE * 0.24, MINIMALE_INPS)

UTILE_NETTO = FATTURATO - SPESE_OPERATIVE - IMPOSTA_SOSTITUTIVA - CONTRIBUTI_INPS

ACCANTONAMENTO_MENSILE_SUGGERITO = (IMPOSTA_SOSTITUTIVA_PREVISTA + CONTRIBUTI_PREVISTI) / 12

ALERT_FORFETTARIO = FATTURATO_YTD >= 85000 * 0.80 (alert al 80%)
```

### 8.2 Calcoli Proiezione

```
MESI_OPERATIVI = numero mesi con almeno un incasso
MEDIA_MENSILE = FATTURATO_YTD / MESI_OPERATIVI
MESI_RIMANENTI = 12 - mese_corrente
FATTURATO_PROIETTATO = FATTURATO_YTD + (MEDIA_MENSILE * MESI_RIMANENTI)

SPESE_FISSE_MENSILI = somma(importo_fisso di categorie tipo=fisso)
MEDIA_SPESE_VARIABILI = SPESE_VARIABILI_YTD / MESI_OPERATIVI
SPESE_PROIETTATE = SPESE_YTD + ((SPESE_FISSE_MENSILI + MEDIA_SPESE_VARIABILI) * MESI_RIMANENTI)

GAP_OBIETTIVO = OBIETTIVO_ANNUALE - PROFITTO_YTD
MENSILE_NECESSARIO = GAP_OBIETTIVO / MESI_RIMANENTI
```

### 8.3 Validazioni

```
- Importo incasso: > 0, massimo 2 decimali
- Importo spesa: > 0, massimo 2 decimali
- Data spesa: non nel futuro
- Periodo incasso: non nel futuro
- Categoria spesa: obbligatoria
- Canale incasso: obbligatorio
- Obiettivo mensile: >= 0
- Aliquota: solo 5 o 15
- Coefficiente redditivita': solo 0.67 (per parrucchieri)
```

---

## 9. Strategia di Persistenza Dati

### 9.1 Principi Fondamentali

1. **Zero data loss**: ogni operazione di scrittura DEVE essere confermata dal database prima di dare feedback all'utente
2. **Auto-save**: nessun pulsante "Salva" - ogni modifica e' salvata immediatamente
3. **Feedback visivo**: indicatore di stato salvataggio sempre visibile (salvato/salvando/errore)
4. **Retry automatico**: in caso di errore di rete, retry automatico con backoff esponenziale
5. **Conflict resolution**: se due sessioni modificano lo stesso dato, vince l'ultimo (last-write-wins con timestamp)

### 9.2 Architettura Suggerita

```
Frontend (React/Next.js)
  |
  | HTTPS / API REST o tRPC
  |
Backend (Node.js)
  |
  | ORM (Prisma / Drizzle)
  |
Database (PostgreSQL / SQLite con WAL mode)
  |
  | Backup automatico
  |
Storage secondario (backup giornaliero)
```

### 9.3 Strategia di Backup

- **Database WAL mode** (Write-Ahead Logging) per protezione da crash
- **Backup automatico giornaliero** del database
- **Point-in-time recovery** disponibile
- **Export manuale** disponibile per l'utente (download dei propri dati)

---

## 10. Prioritizzazione MoSCoW

### MUST HAVE (MVP)
- Gestione incassi (CRUD) con canali
- Gestione spese (CRUD) con categorie
- Dashboard panoramica annuale con grafici
- Dashboard panoramica mensile
- Dashboard panoramica negozio
- Previsionale tasse regime forfettario
- Obiettivi mensili e annuali con tracking
- Salvataggio automatico e persistente
- Pre-popolamento dati Excel di Mattia
- Autenticazione utente
- Responsive (mobile + desktop)

### SHOULD HAVE
- Proiezioni fine anno
- Confronto mese precedente
- Spese ricorrenti
- Cash flow tracking
- Budget per categoria
- Export per commercialista
- Confronto YoY
- Scadenzario fiscale
- Classificazione costi fissi/variabili

### COULD HAVE
- Upload ricevute/fatture
- Tema chiaro/scuro
- Report varianza budget
- Notifiche push
- Report fiscale completo

### WON'T HAVE (V1)
- Gestione appuntamenti
- Gestione clienti/anagrafica
- Gestione magazzino prodotti
- Fatturazione elettronica
- Integrazione bancaria
- Multi-utente/permessi
- App nativa iOS/Android

---

## 11. Metriche di Successo

| Metrica | Target |
|---|---|
| Affidabilita' dati | 0 perdite di dati |
| Tempo inserimento incasso | < 15 secondi |
| Tempo inserimento spesa | < 20 secondi |
| Tempo caricamento dashboard | < 2 secondi |
| Accuratezza previsionale tasse | Scostamento < 5% vs reale |
| Utilizzo settimanale | Almeno 2 accessi/settimana |
| Soddisfazione utente (Mattia) | Excel completamente abbandonato |

---

## 12. Rischi e Mitigazioni

| Rischio | Impatto | Probabilita' | Mitigazione |
|---|---|---|---|
| Perdita dati | CRITICO | Bassa | WAL + backup giornaliero + export manuale |
| Calcolo tasse errato | ALTO | Media | Validazione con commercialista, disclaimer legale |
| Mattia non usa il gestionale | ALTO | Media | UX semplice, migrazione dati automatica, onboarding guidato |
| Cambio normativa fiscale | MEDIO | Bassa | Coefficienti configurabili, non hardcoded |
| Performance con anni di dati | BASSO | Bassa | Indici database, paginazione |

---

## 13. Note Tecniche per Implementazione

### 13.1 Considerazioni sulla Valuta
- Tutti gli importi in centesimi (integer) nel database per evitare errori floating point
- Formattazione italiana: separatore migliaia punto, decimali virgola (es. 1.350,00 euro)
- Simbolo euro dopo l'importo

### 13.2 Timezone e Date
- Tutte le date in UTC nel database
- Visualizzazione in timezone Europe/Rome
- I mesi fiscali sono basati sul calendario italiano

### 13.3 Disclaimer Fiscale
- Il gestionale fornisce stime e proiezioni fiscali a scopo informativo
- Non sostituisce il consulto con un commercialista
- I calcoli sono basati sulle aliquote configurate dall'utente

---

*Documento redatto seguendo il framework Product Manager di HairGest.*
*Pronto per revisione e approvazione prima dell'implementazione.*
