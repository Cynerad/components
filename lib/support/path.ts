import path from "node:path";

function basePath(pathTo: string = "") {
  return path.join(process.cwd(), pathTo);
}

function appPath(pathTo: string = "") {
  return path.join(process.cwd(), "app", pathTo);
}

function publicPath(pathTo: string = "") {
  return path.join(process.cwd(), "public", pathTo);
}

function fileName(pathTo: string) {
  return path.basename(pathTo);
}

function folderName(pathTo: string) {
  const parsedObject = path.parse(basePath(pathTo));
  return parsedObject.ext === "" ? path.join(parsedObject.dir, parsedObject.name) : parsedObject.dir;
}

function extension(pathTo: string) {
  return path.extname(pathTo);
}

export { appPath, basePath, extension, fileName, folderName, publicPath };
