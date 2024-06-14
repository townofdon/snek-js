import { MAP_HOST } from "../constants";
import { Api, ApiError, ApiOptions } from "./utils/apiUtils";

export interface SnekMap {
  id: string,
  name: string,
  author: string,
  data: string,
}

interface GetTokenResponse {
  csrfToken: string;
}

export const getToken = async (): Promise<string> => {
  const url = `${MAP_HOST}/csrf-token`;
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

export const publishMap = (name: string, author: string, mapData: string, options: ApiOptions): Promise<PublishMapResponse> => {
  const url = `${MAP_HOST}/map`;
  const body = { name, author, mapData };
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
  const url = `${MAP_HOST}/map/${id}`;
  return Api.get(url);
}

export const listMap = (limit = 10, offset = 0): Promise<SnekMap> => {
  const query = new URLSearchParams();
  query.set('limit', String(limit));
  query.set('offset', String(offset));
  const url = `${MAP_HOST}/map/?${query.toString()}`;
  return Api.get(url);
}
