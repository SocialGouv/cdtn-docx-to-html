# Modeles de documents disponible pour le cdtn

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
