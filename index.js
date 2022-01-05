const mammoth = require("mammoth");
const fs = require("fs");
const data = require("./courriers.json");
const { SOURCES } = require("@socialgouv/cdtn-sources");
const slugify = require("@socialgouv/cdtn-slugify");

const DOC_DIR = "docx";

const options = {
  styleMap: [
    "p[style-name='signature'] => div.courrier-signature > p:fresh",
    "p[style-name='choix'] => li.checklist:fresh",
    "p[style-name='centre'] => div.center > p:fresh",
    "p[style-name='Titre-centre'] => div.title-center:fresh",
    "p[style-name='expediteur'] => div.courrier-expediteur > p:fresh",
    "p[style-name='destinataire'] => div.courrier-destinataire > p:fresh",
    "p[style-name='Titre'] => h3.courrier-titre:fresh",
    "r[style-name='options'] => span.options",
    "r[style-name='editable'] => span.editable",
  ],
};

const convertFile2Html = ({
  cdtn_id,
  initial_id,
  title,
  description,
  filename,
  ...rest
}) => {
  return mammoth
    .convertToHtml(
      {
        path: `${__dirname}/${DOC_DIR}/${filename}`,
      },
      options
    )
    .then((result) => {
      const slug = slugify(title);
      const fileUrl = `https://cdtn.azure.com/${filename}`;
      return {
        cdtn_id,
        initial_id,
        meta_description: description,
        slug,
        source: SOURCES.LETTERS,
        text: description,
        title,
        document: {
          ...rest,
          description,
          filename,
          fileUrl,
          filesize: fs.statSync(`${__dirname}/${DOC_DIR}/${filename}`).size,
          html: result.value,
        },
      };
    })
    .catch((err) => {
      console.error(`Error while converting ${filename}`, err);
    });
};

const getCourriers = () => Promise.all(data.map(convertFile2Html));

module.exports = { getCourriers };

async function main() {
  const data = await getCourriers();
  console.log(JSON.stringify(data));
  console.error(`exported ${data.length} documents`);
}

if (require.main === module) {
  main();
}
