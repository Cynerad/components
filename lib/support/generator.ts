import { fileSystem } from "@/lib/support/file-system";
import { log } from "@/lib/support/log";
import { basePath } from "@/lib/support/path";

type GenerateType = {
  filePath: string;
  mime?: string;
};

type ReplacePathStupType = GenerateType & {
  stubPath: string;
  replaceParameters: Record<string, string>;
};

async function generate({ filePath, mime = "tsx" }: GenerateType) {
  const fileLocation = `${filePath}.${mime}`;

  if (await fileSystem.pathExists(fileLocation)) {
    log(`file ${basePath(fileLocation)} already exsists.`, "red");
    process.exit(1);
  }

  log(`creating on :  ${basePath(fileLocation)}`, "green");
  await fileSystem.createFile(fileLocation);
}

async function generateWithStub({ filePath, mime = "tsx", stubPath, replaceParameters }: ReplacePathStupType) {
  const fileLocation = `${filePath}.${mime}`;

  if (!(await fileSystem.pathExists(stubPath))) {
    log(`stub path : ${stubPath} : not exists.`, "red");
    process.exit(1);
  }

  if (await fileSystem.pathExists(fileLocation)) {
    log(`${basePath(fileLocation)} already exsists.`, "red");
    process.exit(1);
  }

  let stub = await fileSystem.get(stubPath);

  for (const [key, value] of Object.entries(replaceParameters)) {
    stub = stub.toString().replaceAll(key, value);
  }

  log(`creating on :  ${basePath(fileLocation)}`, "green");
  await fileSystem.write(fileLocation, stub);
}

export { generate, generateWithStub };
