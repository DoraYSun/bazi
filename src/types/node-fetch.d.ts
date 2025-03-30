declare module 'node-fetch' {
  export default function fetch(url: RequestInfo, init?: RequestInit): Promise<Response>;
  
  export class Response {
    constructor(body?: BodyInit | null, init?: ResponseInit);
    readonly headers: Headers;
    readonly ok: boolean;
    readonly redirected: boolean;
    readonly status: number;
    readonly statusText: string;
    readonly type: ResponseType;
    readonly url: string;
    readonly body: ReadableStream<Uint8Array> | null;
    readonly bodyUsed: boolean;
    
    clone(): Response;
    json(): Promise<any>;
    text(): Promise<string>;
    arrayBuffer(): Promise<ArrayBuffer>;
    blob(): Promise<Blob>;
    formData(): Promise<FormData>;
  }
} 