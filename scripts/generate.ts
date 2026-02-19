import path from "node:path";
import fs from "node:fs";

function generate(componentPath: string, stubPath: string, replacedParameters: Record<string, string>) {
  const outputPath = path.join(process.cwd(), `${componentPath}.tsx`);

  if (fs.existsSync(outputPath)) {
    console.error(`❌ path : ${outputPath}  already exists!`);
    process.exit(1);
  }

  let stub = fs.readFileSync(stubPath, "utf-8");

  for (const [key, value] of Object.entries(replacedParameters)) {
    stub = stub.replaceAll(key, value);
  }

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });

  fs.writeFileSync(outputPath, stub);

  console.info(`directory ${outputPath} created successfully! ✅`);
}

export default generate;
