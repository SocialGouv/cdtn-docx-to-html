# Modeles de documents disponible pour le cdtn (aka mailTemplates)

Les courriers sont stockés dans le dossier [`./docx`](./docx). Afin de pouvoir qualifier chaque courrier, un fichier json [`./courriers.json`](./courriers.json) permet de faire le lien entre un fichier de courrier type et ses métadonnées.

Ces données sont ensuite utilisées pour indexer les modèles dans ElasticSearch

## Développement

Pré-requis: nodejs

Installation des dépendances

```bash
yarn
```

```bash
yarn -s start > courriers.out.json
```

## Importation dans hasura

On peut modifier les documents dans hasura avec la commande suivante.
On utilise ce qu'on appelle un `upsert` afin d'ajouter les nouveaux modèles et modifier les modèles existants.

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
