# Workshop - Documentazione Progetto

## Descrizione

### Setup

Il progetto utilizza il **GELLIFY Stack**, uno stack moderno per lo sviluppo web full-stack TypeScript.

#### Prerequisiti

- `docker` ➡️ localstack per lo sviluppo locale
- `fnm` ➡️ node version manager
- `bun` ➡️ test runner
- `pnpm` ➡️ package manager (versione 9.15.4)
- Node.js 22.x

#### Configurazione Iniziale

1. Copiare il file delle variabili d'ambiente:
   ```sh
   cp .env.example .env
   ```

2. Avviare il database locale tramite Docker:
   ```sh
   ./start-localstack.sh
   ```
   Questo script:
   - Avvia i container Docker per il database PostgreSQL e il proxy Neon
   - Esegue le migrazioni del database (`pnpm db:push`)
   - Popola il database con dati di esempio (`pnpm db:seed`)

3. Il file `.env` contiene già una configurazione valida per lo sviluppo locale via Docker.

#### Variabili d'Ambiente Richieste

- `DATABASE_URL`: URL di connessione al database PostgreSQL
- `BETTER_AUTH_SECRET`: Segreto per l'autenticazione
- `NODE_ENV`: Ambiente di esecuzione (development, test, production)

### Comandi

#### Sviluppo
- `pnpm dev` - Avvia il server di sviluppo Next.js
- `pnpm build` - Compila l'applicazione per la produzione
- `pnpm start` - Avvia il server di produzione

#### Database
- `pnpm db:generate` - Genera le migrazioni dal schema Drizzle
- `pnpm db:migrate` - Esegue le migrazioni del database
- `pnpm db:push` - Sincronizza lo schema con il database (senza migrazioni)
- `pnpm db:studio` - Apre Drizzle Studio per visualizzare il database
- `pnpm db:seed` - Popola il database con dati di esempio

#### Qualità del Codice
- `pnpm lint` - Esegue il linter Biome
- `pnpm lint:fix` - Esegue il linter e applica le correzioni automatiche
- `pnpm format` - Formatta il codice con Biome
- `pnpm typecheck` - Verifica i tipi TypeScript

#### Test
- `pnpm test` - Esegue i test con Bun

#### UI Components
- `pnpm ui-add` - Aggiunge componenti shadcn/ui

### Schema Database

#### Tabella `acme_task_table`

La tabella dei task è definita in `src/server/db/schema/tasks.ts`:

```typescript
{
  id: UUID (primary key, auto-generato)
  title: VARCHAR(256) (not null)
  description: TEXT (nullable)
  userId: UUID (foreign key → user.id, nullable)
  status: task_status ENUM (not null, default: 'BACKLOG')
  priority: task_priority ENUM (not null, default: 'LOW')
  createdAt: TIMESTAMP (with timezone, auto-generato)
  updatedAt: TIMESTAMP (with timezone, auto-aggiornato)
}
```

#### Enumerazioni

**Task Status** (`task_status`):
- `BACKLOG`
- `TODO`
- `IN_PROGRESS`
- `DONE`
- `CANCELED`

**Task Priority** (`task_priority`):
- `LOW`
- `MEDIUM`
- `HIGH`

#### Relazioni

- `userId` → `acme_user.id` (foreign key, nullable, può essere rimossa)

### Elenco Endpoint

Il progetto utilizza **tRPC** per le API. Gli endpoint sono esposti tramite `/api/trpc/[trpc]/route.ts`.

#### Endpoint tRPC - Tasks

Tutti gli endpoint sono sotto il namespace `tasks`:

1. **`tasks.get`** (Query, Public)
   - **Input**: `getTasksSchema`
     - `title?: string | null` - Filtro per titolo (case-insensitive)
     - `description?: string | null` - Filtro per descrizione (case-insensitive)
     - `status?: TaskStatus | null` - Filtro per stato
     - `priority?: TaskPriority | null` - Filtro per priorità
   - **Output**: Array di task con informazioni utente (left join)
   - **Descrizione**: Recupera la lista dei task con filtri opzionali

2. **`tasks.upsert`** (Mutation, Public)
   - **Input**: `upsertTaskSchema`
     - `id?: string` - ID del task (opzionale, genera nuovo UUID se non fornito)
     - `title: string` - Titolo del task
     - `description?: string` - Descrizione del task
     - `status?: TaskStatus` - Stato del task
     - `priority?: TaskPriority` - Priorità del task
     - `userId?: string | null` - ID utente assegnato (nullable)
   - **Output**: Task creato/aggiornato
   - **Descrizione**: Crea un nuovo task o aggiorna uno esistente (upsert)

3. **`tasks.delete`** (Mutation, Public)
   - **Input**: `getTaskByIdSchema`
     - `id: string` - ID del task da eliminare
   - **Output**: Task eliminato
   - **Descrizione**: Elimina un task per ID

4. **`tasks.assignUser`** (Mutation, Protected)
   - **Input**: `assignUserToTaskSchema`
     - `id: string` - ID del task
     - `userId: string | null` - ID utente da assegnare (null per rimuovere l'assegnazione)
   - **Output**: Task aggiornato con userId
   - **Descrizione**: Assegna o rimuove l'assegnazione di un utente a un task

5. **`tasks.assignStatus`** (Mutation, Protected)
   - **Input**: `assignStatusToTaskSchema`
     - `id: string` - ID del task
     - `status: TaskStatus` - Nuovo stato del task
   - **Output**: Task aggiornato con status
   - **Descrizione**: Cambia lo stato di un task

### Note di Implementazione

#### Backend (BE)

##### Architettura

L'implementazione backend dei task segue un'architettura a livelli:

1. **Router Layer** (`src/server/api/trpc/routers/tasks.ts`)
   - Definisce gli endpoint tRPC
   - Gestisce autenticazione (public/protected procedures)
   - Valida gli input con Zod schemas
   - Chiama i servizi del dominio

2. **Service Layer** (`src/server/domains/task/task-service.ts`)
   - Funzioni di business logic
   - Orchestrazione tra queries e mutations
   - Interfaccia tra router e data layer

3. **Data Layer**
   - **Queries** (`src/server/domains/task/queries.ts`): Operazioni di lettura
   - **Mutations** (`src/server/domains/task/mutations.ts`): Operazioni di scrittura

##### Query Implementation

**`getTasksQuery`**:
- Costruisce dinamicamente le condizioni WHERE basate sui filtri
- Utilizza `ilike` per ricerche case-insensitive su title e description
- Utilizza `eq` per filtri esatti su status e priority
- Esegue un `leftJoin` con la tabella `user` per recuperare il nome utente
- Restituisce: `id`, `userId`, `title`, `description`, `status`, `priority`, `userName`

**`getTaskByIdQuery`**:
- Query semplice per recuperare un task per ID
- Non utilizzata attualmente nel router (endpoint non esposto)

##### Mutation Implementation

**`upsertTaskMutation`**:
- Gestisce sia creazione che aggiornamento
- Utilizza `onConflictDoUpdate` per l'upsert
- Logica speciale per `userId`: se è `undefined` o `null`, non viene sovrascritto durante l'update (permette di rimuovere solo esplicitamente)
- Durante l'insert, `userId` viene incluso solo se non è `undefined` o `null`

**`deleteTaskMutation`**:
- Elimina il task per ID
- Restituisce i dati del task eliminato

**`assignUserToTaskMutation`**:
- Aggiorna solo il campo `userId`
- Permette di assegnare un utente (`userId: string`) o rimuovere l'assegnazione (`userId: null`)

**`assignStatusToTaskMutation`**:
- Aggiorna solo il campo `status`
- Validazione garantita dal tipo TypeScript e Zod schema

##### Validazione

- Tutti gli input sono validati tramite Zod schemas (`src/shared/validators/task.schema.ts`)
- Gli schemi utilizzano `@hono/zod-openapi` per la documentazione OpenAPI
- Tipi TypeScript derivati dagli schemi Zod garantiscono type-safety end-to-end

##### Autenticazione

- `tasks.get`, `tasks.upsert`, `tasks.delete`: **Public procedures** (accessibili senza autenticazione)
- `tasks.assignUser`, `tasks.assignStatus`: **Protected procedures** (richiedono autenticazione)
- L'autenticazione è gestita tramite Better Auth
- La sessione utente è disponibile nel context tRPC

#### Frontend (FE)

##### Architettura Componenti

L'implementazione frontend utilizza una struttura modulare con componenti riutilizzabili:

1. **Page Component** (`src/app/[locale]/(app)/task/page.tsx`)
   - Server Component che gestisce i search params
   - Utilizza `nuqs` per la gestione degli URL params
   - Idrata il client con `HydrateClient` per tRPC

2. **Table Component** (`src/components/task/task-table.tsx`)
   - Componente principale per la visualizzazione dei task
   - Gestisce: fetch dati, filtri lato client, sorting, paginazione
   - Utilizza React Query per la gestione dello stato server

3. **Form Components**
   - **`task-form-dialog.tsx`**: Form riutilizzabile per creare/modificare task
   - **`add-task-dialog.tsx`**: Wrapper per creare nuovi task
   - **`edit-task-dialog.tsx`**: Wrapper per modificare task esistenti

4. **Action Components**
   - **`assign-user-dialog.tsx`**: Dialog per assegnare utenti ai task
   - **`assign-status-dialog.tsx`**: Dialog per cambiare lo stato dei task

5. **Filter Component** (`src/components/task/task-filter.tsx`)
   - Gestisce i filtri lato client
   - Sincronizza i filtri con gli URL params

##### Gestione Stato

**React Query (TanStack Query)**:
- Utilizzato per tutte le chiamate API
- Gestione automatica di cache, refetch, loading states
- Invalidation delle query dopo le mutations

**URL State Management**:
- Utilizza `nuqs` per sincronizzare filtri e dialog state con gli URL params
- Permette condivisione di URL con filtri applicati
- Sincronizzazione bidirezionale tra URL e stato dei componenti

##### Filtri

**Filtri Lato Server**:
- `status` e `priority` vengono inviati al backend tramite tRPC
- I filtri vengono applicati nella query SQL

**Filtri Lato Client**:
- `search` (ricerca testuale) viene applicata lato client dopo il fetch
- Cerca in: `title`, `description`, `userName`
- Case-insensitive

##### Sorting

- Implementato lato client
- Colonne ordinabili: `id`, `title`, `userName`, `status`, `priority`
- Toggle tra ascending/descending
- Stato gestito con `useState`

##### Paginazione

- Implementata lato client
- Dimensione pagina: 5 task per pagina
- Navigazione con pulsanti Previous/Next
- Indicatore pagina corrente / totale

##### Gestione Dialog

**Sincronizzazione URL**:
- `EditTaskDialog` sincronizza lo stato open/close con il param `?id=taskId` nell'URL
- Permette di aprire un dialog direttamente tramite URL
- Evita flip-flopping durante la navigazione

**State Management**:
- Dialog possono essere controllati o non controllati
- `EditTaskDialog` supporta entrambe le modalità
- Altri dialog utilizzano state interno

##### Mutations e Optimistic Updates

**Delete Mutation**:
- Conferma tramite `AlertDialog` prima dell'eliminazione
- Toast di successo/errore
- Invalidation di tutte le query dopo il successo

**Upsert Mutation**:
- Gestisce sia creazione che modifica
- Durante la creazione, assegna automaticamente l'utente corrente se disponibile
- Durante la modifica, mantiene il `userId` esistente (non lo sovrascrive)
- Toast di successo/errore
- Chiusura automatica del dialog dopo il successo

**Assign User Mutation**:
- Ricerca utenti con filtro testuale lato client
- Selezione utente da lista
- Permette di rimuovere l'assegnazione (userId: null)
- Toast di successo/errore

**Assign Status Mutation**:
- Selezione stato da dropdown
- Toast di successo/errore

##### Type Safety

- Tutti i tipi derivati dagli schemi Zod
- Type safety end-to-end da backend a frontend
- Utilizzo di `useTRPC` hook per type-safe API calls
- Tipi condivisi in `src/shared/types/tasks.ts`

##### Internazionalizzazione

- Utilizzo di `next-international` per i18n
- Tutte le stringhe dell'interfaccia utilizzano chiavi di traduzione
- Scope `task` per le traduzioni dei task
- Supporto per più lingue (it, en)

##### UX Improvements

- Loading states durante il fetch
- Empty states quando non ci sono task
- Disabled states durante le mutations
- Toast notifications per feedback utente
- Confirmation dialog per operazioni distruttive
- Truncate per testo lungo nelle celle della tabella

## Decision Log (Trade-off Principali)

### Architettura

1. **tRPC vs REST API**
   - **Scelta**: tRPC per tutti gli endpoint dei task
   - **Pro**: Type-safety end-to-end, migliore DX, meno boilerplate
   - **Contro**: Meno standardizzato, richiede conoscenza di tRPC
   - **Trade-off**: REST API disponibili solo per i todo, non per i task

2. **Public vs Protected Procedures**
   - **Scelta**: Alcune procedure pubbliche (get, upsert, delete), altre protette (assignUser, assignStatus)
   - **Pro**: Flessibilità, permette operazioni base senza autenticazione
   - **Contro**: Potenziale problema di sicurezza (chiunque può creare/eliminare task)
   - **Trade-off**: Potrebbe essere necessario rendere tutte le procedure protette in produzione

### Database

3. **Drizzle ORM vs Prisma/TypeORM**
   - **Scelta**: Drizzle ORM
   - **Pro**: Type-safe, performante, SQL-like syntax, migliore controllo sulle query
   - **Contro**: Curva di apprendimento, meno features out-of-the-box rispetto a Prisma
   - **Trade-off**: Maggiore controllo vs maggiore convenienza

4. **Upsert vs Separate Create/Update**
   - **Scelta**: Single upsert mutation
   - **Pro**: Meno codice, gestione semplificata
   - **Contro**: Logica più complessa per gestire userId (non sovrascrivere se undefined)
   - **Trade-off**: Semplicità API vs complessità implementazione

5. **Nullable userId**
   - **Scelta**: userId nullable, può essere rimosso
   - **Pro**: Flessibilità, permette task non assegnati
   - **Contro**: Logica più complessa per gestire null vs undefined
   - **Trade-off**: Flessibilità vs complessità

### Frontend

6. **Client-side vs Server-side Filtering/Sorting/Pagination**
   - **Scelta**: Filtri status/priority lato server, search/sorting/pagination lato client
   - **Pro**: Migliori performance per filtri semplici (server), UX migliore per search (client)
   - **Contro**: Inconsistenza, paginazione client-side non scalabile
   - **Trade-off**: Performance vs Scalabilità (paginazione server-side sarebbe migliore per grandi dataset)

7. **URL State Management**
   - **Scelta**: Utilizzo di `nuqs` per sincronizzare stato con URL
   - **Pro**: Condivisibilità URL, migliore UX, supporto browser back/forward
   - **Contro**: Complessità aggiuntiva, potenziale sincronizzazione issues
   - **Trade-off**: UX migliore vs complessità codice

8. **Controlled vs Uncontrolled Dialog**
   - **Scelta**: Supporto per entrambe le modalità in EditTaskDialog
   - **Pro**: Flessibilità, riutilizzabilità
   - **Contro**: Complessità implementazione, potenziale confusione
   - **Trade-off**: Flessibilità vs semplicità

9. **React Query vs Zustand/Redux**
   - **Scelta**: React Query per stato server
   - **Pro**: Gestione automatica cache, refetch, loading states, ottimizzato per API calls
   - **Contro**: Non adatto per stato client complesso
   - **Trade-off**: Specializzazione vs generalità

### Validazione

10. **Zod Schemas Condivisi**
    - **Scelta**: Schemi Zod condivisi tra BE e FE
    - **Pro**: Type-safety end-to-end, single source of truth, validazione consistente
    - **Contro**: Dipendenza condivisa, potenziale accoppiamento
    - **Trade-off**: Type safety vs accoppiamento

### UI/UX

11. **shadcn/ui Components**
    - **Scelta**: Utilizzo di shadcn/ui per i componenti UI
    - **Pro**: Componenti accessibili, personalizzabili, copy-paste friendly
    - **Contro**: Meno "batteries included" rispetto a librerie complete
    - **Trade-off**: Controllo vs convenienza

12. **Toast Notifications**
    - **Scelta**: Utilizzo di Sonner per le notifiche
    - **Pro**: UX migliore, feedback immediato
    - **Contro**: Dipendenza aggiuntiva
    - **Trade-off**: UX vs dipendenze

### Performance

13. **Left Join vs Inner Join per User**
    - **Scelta**: Left join per recuperare userName
    - **Pro**: Mostra task anche senza utente assegnato
    - **Contro**: Potenziale overhead per join non necessario
    - **Trade-off**: Completezza dati vs performance

14. **Client-side Search**
    - **Scelta**: Ricerca testuale lato client
    - **Pro**: UX migliore (istantanea), meno carico server
    - **Contro**: Non scalabile, carica tutti i dati in memoria
    - **Trade-off**: UX vs Scalabilità (dovrebbe essere server-side per grandi dataset)

### Sicurezza

15. **Public Procedures per Operazioni CRUD**
    - **Scelta**: get, upsert, delete sono public
    - **Pro**: Sviluppo più rapido, testing più semplice
    - **Contro**: Problemi di sicurezza, chiunque può creare/eliminare task
    - **Trade-off**: Velocità sviluppo vs sicurezza (da rivedere in produzione)

