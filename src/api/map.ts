import { MAP_API_HOST } from "../constants";
import { Api, ApiError, ApiOptions } from "./utils/apiUtils";

export interface SnekMap {
  id: string,
  name: string,
  author: string,
  data: string,
  imageUrl: string,
}

interface GetTokenResponse {
  csrfToken: string;
}

export const getToken = async (): Promise<string> => {
  const url = `${MAP_API_HOST}/csrf-token`;
  const res: GetTokenResponse = await Api.get(url);
  if (res.csrfToken) {
    return res.csrfToken;
  }
}

interface PresignedUpload {
  signedUrl: string;
  token: string;
  path: string;
}

interface SupabaseMeta {
  projectId: string;
  bucketName: string;
}

interface PublishMapResponse {
  id: string,
  name: string,
  author: string,
  imageUrl: string,
  upload: PresignedUpload,
  supameta: SupabaseMeta,
}

export const publishMap = (mapId: string | undefined, name: string, author: string, mapData: string, options: ApiOptions): Promise<PublishMapResponse> => {
  const url = `${MAP_API_HOST}/map`;
  const body = { mapId, name, author, mapData };
  return Api.post(url, body, options);
}

export const uploadMapImage = async (file: File, supameta: SupabaseMeta, upload: PresignedUpload): Promise<void> => {
  // const url = upload.signedUrl;
  const headers: HeadersInit = {
    Authorization: `Bearer ${upload.token}`,
  };

  const url = `https://${supameta.projectId}.supabase.co/storage/v1/object/${supameta.bucketName}/${upload.path}`;

  const res = await fetch(url, { method: 'POST', body: file, headers });
  if (!res.ok || res.status >= 400) {
    throw new ApiError(`[ERROR] ${res.status} response`, res.status);
  }
}

export const getMap = (id: string): Promise<SnekMap> => {
  const url = `${MAP_API_HOST}/map/${id}`;
  return Api.get(url);
}

export interface GetMapByDataResponse {
  map: SnekMap,
  next: SnekMap | null,
}
export const getMapByData = (data: string): Promise<GetMapByDataResponse> => {
  const url = `${MAP_API_HOST}/map/lookup?data=${data}`;
  return Api.get(url);
}

interface ListMapResponse {
  data: SnekMap[]
  meta: {
    numResults: number;
    totalItems: number;
  }
}
export const listMap = ({ limit = 10, offset = 0, search = '' }): Promise<ListMapResponse> => {
  const url = `${MAP_API_HOST}/map/?limit=${limit}&offset=${offset}&search=${search}`;
  return Api.get(url);
}
