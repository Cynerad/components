import { generateWithStub } from "@/lib/support/generator";
import { studly } from "@/lib/support/string";

const args = process.argv.slice(2);

const componentPath = args[0];

const arrayPath = componentPath.split("/");

const componentName = arrayPath[arrayPath.length - 1];

generateWithStub({
  filePath: componentPath,
  mime: "tsx",
  stubPath: "scripts/stubs/component.stub",
  replaceParameters: {
    "{{ComponentName}}": studly(componentName),
  },
});
