# Modeles de documents disponible pour le cdtn (aka mailTemplates)

Les courriers sont stockés dans le dossier [`./docx`](./docx). Afin de pouvoir qualifier chaque courrier, un fichier json [`./courriers.json`](./courriers.json) permet de faire le lien entre un fichier de courrier type et ses métadonnées.

Ces données sont ensuite utilisées pour indexer les modèles dans ElasticSearch

## Étapes

### 1. Installation des dépendances

Lancer la commande suivante dans le terminal :

```bash
yarn
```
  
### 2. Ajout du document avec ce template de métadonnées à glisser dans `courrier.json`

```json
{
    "cdtn_id": "XXX",
    "initial_id": "YYY-YYY-YY-YY-YY",
    "title": "Mon titre",
    "date": "29/10/2021",
    "author": "Ministère du Travail",
    "filename": "mon.document.docx",
    "references": [
      {
        "url": "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000036762168/",
        "title": "Article L1237-19-1",
        "type": "external"
      },
    ],
    "description": "Une description"
  }
```

Les champs `cdtn_id`, `ìnitial_id` se récupère via [ce lien](https://preprod-cdtn-admin.dev.fabrique.social.gouv.fr/api/id?source=modeles_de_courriers)

Les autres champs sont à modifier avec les informations du documents.

### 3. Génération de l'output

Il faut lancer cette commande :

```bash
yarn -s start > courriers.out.json
```

Cette commande va générer un fichier à envoyer à Hasura pour l'indexation au niveau de la base de données.

### 4. Indexation dans Hasura

> **NB**: Il faut au préalable uploader les documents en `.docx` sur l'admin

Dans un premier temps, il faut se connecter sur Rancher et récupérer les informations de connexions aux clusters (de dev et de prod). Ensuite, il faut localement se connecter au bon cluster en faisant un **port forwarding** sur le bon hasura en récupérant les informations de connexion.

Enfin, il faudra lancer cette commande pour accéder console :

```bash
hasura console --endpoint http://localhost:8080 --admin-secret "A RECUP SUR RANCHER" --project targets/hasura
```

Lorsqu'on est connecté à hasura, il faudra lancer la commande suivante afin d'ajouter ou modifier les modèles de documents :

```graphql
mutation updateDocuments($objects: [documents_insert_input!]!) {
  insert_documents(
    objects: $objects
    on_conflict: {
      constraint: documents_pkey
      update_columns: [document, title, meta_description, text, slug]
    }
  ) {
    affected_rows
  }
}
```

Il faut bien évidemment définir `$objects` dans les query parameters avec les données issues de `courriers.out.json` en faisant un simple copier coller du fichier généré.
