import lodashPick from 'lodash.pick';
import { RequestHeader, ContentType } from './constants';
import { JsonPrimitive } from './types';

const getAsTypedTuple = <T extends string[]>(...args: T): T => args;
const FIELDS = getAsTypedTuple('status', 'statusText', 'headers', 'ok', 'url');
type Fields = typeof FIELDS extends (infer U)[] ? U : never;

export namespace utils.transforms {
  export const httpBody = async (res: Response) => {
    const contentType = res.headers.get(RequestHeader.CONTENT_TYPE);
    const response: Pick<Response, Fields> & {
      body: JsonPrimitive;
    } = lodashPick(res, FIELDS) as any;

    if (contentType && contentType.indexOf('json') > -1) {
      response.body = await res.json();
      return response;
    }

    const body = await res.text();
    response.body = body.trim();

    if (contentType === ContentType.TEXT_BOOLEAN) {
      response.body = body.toLowerCase() === 'true';
    }

    if (res.status === 204 || body === '') {
      response.body = null;
    }

    return response;
  };

  export const httpMessage = (res: Response) => lodashPick(res, FIELDS);
}
