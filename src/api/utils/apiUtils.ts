
enum RequestMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
}

interface CallApiParams {
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
  public static get(url: string) {
    return Api.call({ url, method: RequestMethod.GET });
  }

  public static post(url: string, body: object) {
    return Api.call({ url, method: RequestMethod.POST, body });
  }

  private static call = async ({ url, method, body, contentType = 'application/json', xsrfToken }: CallApiParams) => {
    const headers: HeadersInit = {
      'Content-Type': contentType
    };
    if (xsrfToken) {
      headers['x-crsf-token'] = xsrfToken;
    }
    const requestBody = body ? JSON.stringify(body) : undefined;
    const res = await fetch(url, { method, body: requestBody, headers, cache: 'no-cache' });
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

