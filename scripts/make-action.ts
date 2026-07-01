import { generateWithStub } from "@/lib/support/generator";
import { camel, capitalize, kebab } from "@/lib/support/string";

const args = process.argv.slice(2);

const actionName = args[0];

generateWithStub({
  filePath: `/actions/${kebab(actionName)}`,
  mime: "ts",
  stubPath: "scripts/stubs/action.stub",
  replaceParameters: {
    "{{blank}}": camel(actionName),
    "{{blank-cap}}": capitalize(actionName),
  },
});
