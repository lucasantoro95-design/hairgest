# Modulo Fiscale - Documentazione Tecnica

> **CRITICO**: questo documento descrive le regole di calcolo fiscale di
> HairGest. Ogni modifica al modulo fiscale deve rispettarle. I clienti
> usano questi numeri per pianificare l'accantonamento delle tasse —
> errori = soldi reali persi.

## Profilo cliente target

- Parrucchieri italiani
- Regime **Forfettario** (Legge 190/2014)
- Iscritti **Gestione Artigiani INPS** (codice ATECO 96.02.01)
- Coefficiente di redditivita': **67%**
- Aliquota imposta sostitutiva: **5%** (primi 5 anni di attivita') o **15%**
- Limite forfettario: **85.000 EUR** di fatturato annuo

## Fonti normative

- **Circolare INPS n. 14/2026** del 09/02/2026 — contributi gestione
  artigiani 2026 (aliquote, minimale, scadenze).
- **Legge 190/2014** — regime forfettario, deducibilita' contributi.
- Riferimento online:
  https://www.tutelaprevidenziale.it/artigiani-e-commercianti-contributi-inps-2026-aliquote-minimali-scadenze-circolare-n-14-2026/

## Definizioni

### Fatturato fiscale (`fiscalRevenueCents`)

Somma degli incassi dell'anno, **esclusi** i canali in
`FISCAL_EXCLUDED_CHANNELS` (default: `['PREVENTIVI']`).

I preventivi sono tracciati in pagina Incassi (visibili nel pie chart,
nel KPI "Preventivi", nel "Totale Incassi") ma **non concorrono al
fatturato fiscale**. Razionale: rappresentano stime di lavoro non ancora
fatturato/incassato.

### Spese operative (`operatingExpensesCents`)

Somma delle spese dell'anno, **escluse** le categorie in
`OPERATING_EXCLUDED_EXPENSE_CATEGORIES` (default: `['Affitto', 'Finanziamenti']`).

Le spese delle categorie escluse restano visibili nella pagina Spese
(contate nel `totalExpensesCents`) ma non sono sottratte nel "Riepilogo
Annuo" del modulo fiscale per il calcolo dell'utile netto stimato.
Razionale:
- **Affitto**: costo immobiliare non riflette la gestione corrente.
- **Finanziamenti**: rimborso capitale/interessi e' movimento finanziario,
  non gestionale.

### Imponibile lordo

```
imponibile_lordo = fatturato_fiscale × coefficiente_redditivita / 100
```

Coefficiente fissato dalla legge in base al codice ATECO. Per parrucchieri = 67%.

### INPS dovuto (gestione artigiani)

Composto da due parti:

#### 1. Contributo fisso annuo

Importo dovuto **a prescindere dal reddito** (anche con fatturato zero).

- **2026**: 4.521,36 EUR (config `inps_fixed_annual_cents = 452136`)
- Pagato in **4 rate trimestrali** da 1.130,34 EUR
- Scadenze 2026: 18 maggio, 20 agosto, 16 novembre, 16 febbraio 2027

#### 2. IVS variabile (a scaglioni)

Sull'imponibile lordo che eccede il **minimale**.

- **Minimale 2026**: 18.808 EUR (`inps_minimale_cents`)
- **Soglia 2° scaglione 2026**: 56.224 EUR (`inps_scaglione2_threshold_cents`)
- **Aliquota 1° scaglione**: 24% (config `inps_rate`)
- **Aliquota 2° scaglione**: 25% (config `inps_rate_2`)

Formula:
```
if imponibile_lordo <= minimale:
    variabile = 0
elif imponibile_lordo <= soglia2:
    variabile = (imponibile_lordo - minimale) × rate1 / 100
else:
    variabile = (soglia2 - minimale) × rate1 / 100
              + (imponibile_lordo - soglia2) × rate2 / 100
```

Le scadenze del variabile seguono quelle IRPEF (saldo + acconti, giugno
e novembre).

#### Riduzione 35% (opzionale)

I forfettari iscritti gestione artigiani possono richiedere la
**riduzione del 35%** entro il **28 febbraio** dell'anno di riferimento.
La riduzione si applica **sia al fisso sia al variabile**:

```
if config.inps_reduction_35:
    fisso × = 0.65
    variabile × = 0.65
```

In app: toggle in Impostazioni > Configurazione Fiscale.

### Imposta sostitutiva

**Punto critico, spesso sbagliato**: l'imposta si calcola sull'imponibile
**netto**, dove dall'imponibile lordo si sottraggono i **contributi INPS
effettivamente pagati nell'anno** (principio di cassa).

```
imponibile_netto = max(0, imponibile_lordo - inps_pagato_anno)
imposta = imponibile_netto × tax_rate / 100
```

`inps_pagato_anno` = somma dei pagamenti registrati con `type` in
`('inps_fisso', 'inps_variabile')` per l'anno corrente in `tax_payments`.

I pagamenti del tipo `imposta_sostitutiva` **non** sono deducibili
(non si sottraggono dall'imponibile).

### Utile netto stimato

```
utile_netto = fatturato_fiscale - spese_operative - tasse_dovute_totali
tasse_dovute_totali = imposta_sostitutiva + inps_fisso + inps_variabile
```

Importante: usa `fatturato_fiscale` (esclude PREVENTIVI) e
`spese_operative` (esclude Affitto + Finanziamenti).

### Saldo residuo

Per ogni voce (imposta, INPS fisso, INPS variabile):
```
saldo = dovuto_anno - pagato_anno
```
Se saldo > 0 → ancora da pagare. Se saldo <= 0 → coperto/pagato in eccesso.

## Implementazione

### File chiave

| File | Responsabilita' |
|---|---|
| `src/lib/constants.ts` | `INPS_ARTIGIANI_2026`, `FISCAL_EXCLUDED_CHANNELS`, `OPERATING_EXCLUDED_EXPENSE_CATEGORIES`, `INPS_FISSO_DEADLINES_2026` |
| `src/lib/calculations.ts` | `calculateFiscalSummary()` con formula corretta a scaglioni e deducibilita' |
| `src/lib/database.ts` | Schema `fiscal_config` (campi INPS) + `tax_payments`, migration idempotenti |
| `src/lib/types.ts` | `FiscalConfig`, `TaxPayment`, `FiscalSummary` |
| `src/hooks/useFiscal.ts` | CRUD `fiscal_config` |
| `src/hooks/useTaxPayments.ts` | CRUD `tax_payments`, aggregati per tipo |
| `src/hooks/useRevenues.ts` | espone `fiscalRevenueCents` (esclude PREVENTIVI) |
| `src/hooks/useExpenses.ts` | espone `operatingExpensesCents` (esclude Affitto/Finanziamenti) |
| `src/pages/Fiscale.tsx` | UI riepilogo + form pagamenti |
| `src/pages/Impostazioni.tsx` | tab "Fiscale" con tutti i parametri INPS configurabili |

### Tabella `tax_payments`

```sql
CREATE TABLE tax_payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  business_id INTEGER NOT NULL,
  year INTEGER NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('inps_fisso','inps_variabile','imposta_sostitutiva','altro')),
  amount_cents INTEGER NOT NULL,
  payment_date TEXT NOT NULL,
  notes TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
```

### Configurabilita'

Tutti i parametri INPS sono editabili in Impostazioni > Configurazione
Fiscale. Razionale: i numeri cambiano ogni anno (Circolari INPS) — il
commercialista del cliente puo' aggiornarli senza dover aspettare una
nuova release dell'app.

## Aggiornamento parametri ad anno nuovo

Quando esce la **Circolare INPS** dell'anno seguente:

1. Cercare i nuovi numeri (contributo fisso, minimale, soglia 2°
   scaglione, aliquote).
2. Aggiornare `INPS_ARTIGIANI_2026` (rinominandolo in `..._2027` etc.)
   in `src/lib/constants.ts`.
3. Aggiornare `INPS_FISSO_DEADLINES_2026` con le nuove date.
4. Aggiornare i `DEFAULT` nelle migration (`runMigrations`) — ma SOLO
   per i nuovi business (i clienti esistenti hanno gia' valori che
   possono modificare manualmente).
5. Comunicare il cambio nel modal What's New.
6. Aggiornare questo documento.

## Avvertenze

- **NON** modificare la formula senza prima aggiornare i test
  numerici (vedi esempi sotto).
- **NON** rimuovere PREVENTIVI da `FISCAL_EXCLUDED_CHANNELS` senza
  conferma esplicita del cliente — i preventivi inserisciti diventerebbero
  immediatamente fatturato tassabile.
- **NON** aggiungere/rimuovere categorie da `OPERATING_EXCLUDED_EXPENSE_CATEGORIES`
  senza conferma — cambia l'utile netto stimato.

## Esempio di calcolo

Parrucchiere con:
- Fatturato 2026: 60.000 EUR (di cui 5.000 di preventivi)
- Spese: 20.000 EUR (di cui 8.000 affitto + 4.000 finanziamenti)
- Imposta sostitutiva 5% (primi 5 anni)
- Riduzione 35% NON applicata
- Pagato a maggio: 1 rata INPS fisso (1.130,34 EUR)

```
fatturato_fiscale = 60.000 - 5.000 = 55.000
imponibile_lordo = 55.000 × 0.67 = 36.850

INPS fisso = 4.521,36
INPS variabile: imponibile sopra minimale = 36.850 - 18.808 = 18.042
              tutto nel primo scaglione (sotto 56.224)
              variabile = 18.042 × 0.24 = 4.330,08
INPS totale dovuto = 4.521,36 + 4.330,08 = 8.851,44

INPS pagato = 1.130,34
imponibile_netto = 36.850 - 1.130,34 = 35.719,66
imposta_sostitutiva = 35.719,66 × 0.05 = 1.785,98

tasse_totali_dovute = 1.785,98 + 8.851,44 = 10.637,42
spese_operative = 20.000 - 8.000 - 4.000 = 8.000
utile_netto_stimato = 55.000 - 8.000 - 10.637,42 = 36.362,58

saldo_residuo = 10.637,42 - 1.130,34 = 9.507,08 (da accantonare)
```
