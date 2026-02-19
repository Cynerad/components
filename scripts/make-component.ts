import generate from "./generate";

const args = process.argv.slice(2);

const componentPath = args[0];

const arrayPath = componentPath.split("/");

const componentName = arrayPath[arrayPath.length - 1];

const pascalComponentName = componentName.replace(/(^\w|-\w)/g, (match) => match.replace("-", "").toUpperCase());

generate(componentPath, "scripts/stubs/component.stub", {
  "{{ComponentName}}": pascalComponentName,
});
