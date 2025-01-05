import fs from "fs/promises";

export const pathExists = async (path: string) => {
  return fs
    .access(path)
    .then(() => true)
    .catch(() => false);
};
