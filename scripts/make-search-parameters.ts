import { generateWithStub } from "@/lib/support/generator";
import { camel, capitalize, kebab } from "@/lib/support/string";

const args = process.argv.slice(2);

const SearchParamName = args[0];

generateWithStub({
  filePath: `search-params/${kebab(SearchParamName)}`,
  mime: "ts",
  stubPath : "scripts/stubs/search-params.stub",
 replaceParameters : {
   "{{blank}}": camel(SearchParamName),
   "{{blank-cap}}": capitalize(SearchParamName),
 } 
});
