
const API_TIMEOUT_DURATION_MS = 5000;

enum RequestMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
}

export interface ApiOptions {
  xsrfToken?: string,
  timeout?: number
}

interface InternalCallApiParams {
  url: string,
  method: RequestMethod,
  body?: object,
  contentType?: string,
  xsrfToken?: string,
}

class ApiError extends Error {
  public status: number = 0
  constructor(message: string, status?: number) {
    super(message);
    if (status) {
      this.status = status;
    }
  }
}

export class Api {
  public static get(url: string, options: ApiOptions = {}) {
    return Api.withTimeout(Api.call({ url, method: RequestMethod.GET, xsrfToken: options.xsrfToken }), options.timeout);
  }

  public static post(url: string, body: object, options: ApiOptions = {}) {
    return Api.withTimeout(Api.call({ url, method: RequestMethod.POST, body, xsrfToken: options.xsrfToken }), options.timeout);
  }

  private static withTimeout(apiCall: (signal: AbortSignal) => Promise<any>, duration: number = API_TIMEOUT_DURATION_MS): Promise<any> {
    const abortController = new AbortController();
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        abortController.abort();
        reject(new Error('Timed out'));
      }, duration);
      apiCall(abortController.signal)
        .then(res => {
          if (timeout) {
            clearTimeout(timeout);
          }
          resolve(res);
        })
        .catch((err) => {
          if (timeout) {
            clearTimeout(timeout);
          }
          reject(err);
        });
    });
  }

  private static call = ({ url, method, body, contentType = 'application/json', xsrfToken }: InternalCallApiParams) => async (signal: AbortSignal) => {
    const headers: HeadersInit = {
      'Content-Type': contentType
    };
    if (xsrfToken) {
      headers['x-csrf-token'] = xsrfToken;
    }
    const requestBody = body ? JSON.stringify(body) : undefined;
    const res = await fetch(url, { method, body: requestBody, headers, cache: 'no-cache', signal });
    if (!res.ok || res.status >= 400) {
      throw new ApiError(`[ERROR] ${res.status} response`, res.status);
    }
    if (res.status >= 300) {
      throw new ApiError('Unexpected redirect from server', res.status);
    }
    const data = await res.json();
    return data;
  }
}

