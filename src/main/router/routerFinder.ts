import { Router } from 'express';

const requireDirectory = require('require-directory');
const options: object = {
  extensions: ['ts', 'js'],
  recurse: true,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  visit: (obj: any) => {
    return typeof obj === 'object' && obj.default !== undefined ? obj.default : obj;
  },
};

export class RouterFinder {
  public static findAll(path: string): Router[] {
    return Object.values(requireDirectory(module, path, options));
  }
}
