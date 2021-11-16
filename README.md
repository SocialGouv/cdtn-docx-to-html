# Modèles de documents disponibles pour le cdtn (aka mailTemplates)

Les courriers sont stockés dans le dossier [`./docx`](./docx). Afin de pouvoir qualifier chaque courrier, un fichier
json [`./courriers.json`](./courriers.json) permet de faire le lien entre un fichier de courrier type et ses
métadonnées.

Ces données sont ensuite utilisées pour indexer les modèles dans ElasticSearch

## Étapes

### 1. Installation des dépendances

Exécuter la commande suivante dans le terminal :

```bash
yarn
```

### 2. Définition des métadonnées du modèle

Ajouter un nouvel objet JSON dans le tableau contenu dans fichier `courrier.json` à la racine du projet.

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
    }
  ],
  "description": "Une description"
}
```

Informations :

* `cdtn_id`, `ìnitial_id` (
  via [ce lien](https://preprod-cdtn-admin.dev.fabrique.social.gouv.fr/api/id?source=modeles_de_courriers))
* titre du document (fourni par le métier)
* date (la date du jour)
* author (fourni par le métier)
* filename: Nom du document word (**Attention, Il faut au préalable uploader les documents en `.docx` sur l'admin**)
* references (fourni par le métier)
* description (fourni par le métier)

### 3. Génération du document BDD

Exécuter la commande :

```bash
yarn -s start > courriers.out.json
```

Cette commande va générer un fichier à envoyer à Hasura pour l'indexation au niveau de la base de données.

### 4. Indexation dans Hasura

**Requis**: Configuration des environnements kubernetes de la fabrique sur le poste.
Depuis [Rancher](https://rancher.fabrique.social.gouv.fr/), vous pouvez récupérer le kubeconfig.

Depuis le projet `cdtn-admin`, exécuter les commandes suivantes :

```bash
kubectl config set-context --current --namespace=cdtn-admin
kubectl port-forward deployment/hasura 8080:80
hasura console --endpoint http://localhost:8080 --admin-secret "(à récupérer sur rancher dans le secret hasura)" --project targets/hasura
```

Sur la console Hasura, exécuter la requête GraphQL suivante afin de mettre à jour les modèles de documents :

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

Query variables:

```json
{
  "objects": courriers.out.json
}
```

Remplacer `courriers.out.json` par le contenu du fichier `courriers.out.json` généré.

### 5. Activer les nouveaux modèles

Lors de l'ajout d'un nouveau modèle, celui-ci est désactivé par défaut. Il faut l'activer pour le rendre accessible sur
le frontend.

Sur la console Hasura, exécuter la requête GraphQL suivante afin d'activer un modèle :

```graphql
mutation enableDocument($cdtnId: String!) {
    update_documents_by_pk(pk_columns: {cdtn_id: $cdtnId}, _set: {is_available: true}) {
        cdtn_id
        is_available
    }
}
```

Query variables:

```json
{
  "cdtnId": "XXX"
}
```

Remplacer `XXX` par le `cdtn_id` du document à activer.