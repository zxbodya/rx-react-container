import { combineLatest } from 'rxjs';

export function combineLatestObj(obj) {
  const sources = [];
  const keys = [];
  // eslint-disable-next-line no-restricted-syntax
  for (const key in obj) {
    /* istanbul ignore else  */
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      keys.push(key.replace(/\$$/, ''));
      sources.push(obj[key]);
    }
  }
  return combineLatest(sources, (...args) => {
    const combination = {};
    for (let i = args.length - 1; i >= 0; i -= 1) {
      combination[keys[i]] = args[i];
    }
    return combination;
  });
}
