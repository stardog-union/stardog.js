import { QueryType, ContentType } from '../constants';

// Polyfill from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/startsWith
// For Tableau, which doesn't support String.prototype.startsWith for some reason
const startsWith = (str: string, search: string, pos?: number) =>
  str.substr(!pos || pos < 0 ? 0 : +pos, search.length) === search;

const baseAndCommentsMatcher = /^((base\s+<[^>]*>\s*)|([\t ]*#([^\n\r]*)))([\r|\r\n|\n])/gim;
const prefixMatcher = /prefix[^:]+:\s*<[^>]*>\s*/gi;
const whitespaceMatcher = /\s/g;

export namespace query.utils {
  export const queryType = (query: string) => {
    // Lifted from http://tinyurl.com/ybnd9wzl
    // i'm almost certain I'm going to have to revisit this.
    const q = query
      // remove base information and comments
      .replace(baseAndCommentsMatcher, '')
      // remove prefix information
      .replace(prefixMatcher, '')
      // flatten everything down into a single string
      .replace(whitespaceMatcher, '')
      .toLowerCase();

    if (startsWith(q, 'select')) {
      return QueryType.SELECT;
    }

    if (startsWith(q, 'ask')) {
      return QueryType.ASK;
    }

    if (startsWith(q, 'construct')) {
      return QueryType.CONSTRUCT;
    }

    if (startsWith(q, 'describe')) {
      return QueryType.DESCRIBE;
    }

    if (
      startsWith(q, 'insert') ||
      startsWith(q, 'delete') ||
      startsWith(q, 'with') ||
      startsWith(q, 'load') ||
      startsWith(q, 'clear') ||
      startsWith(q, 'create') ||
      startsWith(q, 'drop') ||
      startsWith(q, 'copy') ||
      startsWith(q, 'move') ||
      startsWith(q, 'add')
    ) {
      return QueryType.UPDATE;
    }

    if (startsWith(q, 'paths')) {
      return QueryType.PATHS;
    }

    return null;
  };

  export const mimeType = (query: string) => {
    const type = queryType(query);

    switch (type) {
      case QueryType.SELECT:
      case QueryType.PATHS:
        return ContentType.SPARQL_RESULTS_JSON;
      case QueryType.ASK:
      case QueryType.UPDATE:
        return ContentType.TEXT_BOOLEAN;
      case QueryType.CONSTRUCT:
      case QueryType.DESCRIBE:
        return ContentType.TEXT_TURTLE;
      default:
        return ContentType.ALL;
    }
  };
}
