import { generateWithStub } from "@/lib/support/generator";
import { camel, capitalize, kebab } from "@/lib/support/string";

const args = process.argv.slice(2);

const columnName = args[0];

// generate columns
generateWithStub({
  filePath: `/app/${kebab(columnName)}/column`,
  mime: "tsx",
  stubPath: "scripts/stubs/table/columns.stub",
  replaceParameters: {
    "{{blank}}": camel(columnName),
    "{{blank-cap}}": capitalize(columnName),
  },
});

// generate data-table
generateWithStub({
  filePath: `/app/${kebab(columnName)}/data-table`,
  mime: "tsx",
  stubPath: "scripts/stubs/table/data-table.stub",
  replaceParameters: {
    "{{blank}}": camel(columnName),
    "{{blank-cap}}": capitalize(columnName),
  },
});

// generate page
if (args.includes("--page")) {
  generateWithStub({
    filePath: `/app/${kebab(columnName)}/page`,
    mime: "tsx",
    stubPath: "scripts/stubs/table/page.stub",
    replaceParameters: {
      "{{blank}}": kebab(columnName),
      "{{blank-cap}}": capitalize(columnName),
    },
  });
}

// generate action
if (args.includes("--action")) {
  generateWithStub({
    filePath: `/actions/${kebab(columnName)}`,
    mime: "ts",
    stubPath: "scripts/stubs/action.stub",
    replaceParameters: {
      "{{blank}}": camel(columnName),
      "{{blank-cap}}": capitalize(columnName),
    },
  });
}
