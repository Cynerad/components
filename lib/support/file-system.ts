import * as fs from "node:fs/promises";

import { basePath, folderName } from "@/lib/support/path";
import { after } from "@/lib/support/string";

const fileSystem = {
  async get(path: string, options: Parameters<typeof fs.readFile>[1] = { encoding: "utf-8" }) {
    return await fs.readFile(basePath(path), options);
  },
  async pathExists(path: string) {
    try {
      await fs.stat(basePath(path));
      return true;
    } catch {
      return false;
    }
  },
  async fileExists(path: string) {
    return (await fs.stat(basePath(path))).isFile();
  },
  async folderExists(path: string) {
    return (await fs.stat(basePath(path))).isDirectory();
  },
  async createDirectory(path: string, options: Parameters<typeof fs.mkdir>[1] = { recursive: true }) {
    await fs.mkdir(basePath(path), options);
  },
  async createDirectoryIfNotExists(path: string) {
    const directory = after(folderName(path), basePath());
    if (!(await this.pathExists(directory))) {
      await this.createDirectory(directory);
    }
  },
  async createFile(path: string, options: Parameters<typeof fs.writeFile>[2] = "utf-8") {
    await this.createDirectoryIfNotExists(path);

    await fs.writeFile(basePath(path), "", options);
  },
  async write(pathToWrite: string, data: string | NodeJS.ArrayBufferView, options: Parameters<typeof fs.writeFile>[2] = "utf-8") {
    await this.createDirectoryIfNotExists(pathToWrite);

    await fs.writeFile(basePath(pathToWrite), data, options);
  },
  async append(path: string, data: string | Uint8Array, options?: Parameters<typeof fs.appendFile>[2]) {
    await fs.appendFile(basePath(path), data, options);
  },
  async replaceContent(path: string, searchValue: string | RegExp, replaceValue: string) {
    const file = (await this.get(path)).toString();

    await this.write(path, file.replace(searchValue, replaceValue));
  },
  async symbolicLink(target: string, path: string) {
    await fs.symlink(basePath(target), basePath(path));
  },
  async temporary(prefix: string, options?: Parameters<typeof fs.mkdtemp>[1]) {
    await fs.mkdtemp(prefix, options);
  },
  async rename(pathFrom: string, newPath: string) {
    await fs.rename(basePath(pathFrom), basePath(newPath));
  },
  async copy(copyFrom: string, copyTo: string, options: Parameters<typeof fs.cp>[2] = { recursive: true }) {
    await fs.cp(basePath(copyFrom), basePath(copyTo), options);
  },
  async cut(cutFrom: string, cutTo: string) {
    await this.copy(cutFrom, cutTo);

    await this.remove(cutFrom, { recursive: true });
  },
  async remove(path: string, options?: Parameters<typeof fs.rm>[1]) {
    await fs.rm(basePath(path), options);
  },
};

export { fileSystem };
