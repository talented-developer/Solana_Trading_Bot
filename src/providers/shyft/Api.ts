/* eslint-disable */
/* tslint:disable */
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export type QueryParamsType = Record<string | number, any>;
export type ResponseFormat = keyof Omit<Body, "body" | "bodyUsed">;
export type SolanaBlockchainEnvironment = "testnet" | "devnet" | "mainnet-beta"

export interface FullRequestParams extends Omit<RequestInit, "body"> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseFormat;
  /** request body */
  body?: unknown;
  /** base url */
  baseUrl?: string;
  /** request cancellation token */
  cancelToken?: CancelToken;
}

export type RequestParams = Omit<FullRequestParams, "body" | "method" | "query" | "path">;

export interface ApiConfig<SecurityDataType = unknown> {
  baseUrl?: string;
  baseApiParams?: Omit<RequestParams, "baseUrl" | "cancelToken" | "signal">;
  securityWorker?: (securityData: SecurityDataType | null) => Promise<RequestParams | void> | RequestParams | void;
  customFetch?: typeof fetch;
}

export interface HttpResponse<D extends unknown, E extends unknown = unknown> extends Response {
  data: D;
  error: E;
}

type CancelToken = Symbol | string | number;

export enum ContentType {
  Json = "application/json",
  FormData = "multipart/form-data",
  UrlEncoded = "application/x-www-form-urlencoded",
  Text = "text/plain",
}

export class HttpClient<SecurityDataType = unknown> {
  public baseUrl: string = "https://api.shyft.to/sol/v1";
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
  private abortControllers = new Map<CancelToken, AbortController>();
  private customFetch = (...fetchParams: Parameters<typeof fetch>) => fetch(...fetchParams);

  private baseApiParams: RequestParams = {
    credentials: "same-origin",
    headers: {},
    redirect: "follow",
    referrerPolicy: "no-referrer",
  };

  constructor(apiConfig: ApiConfig<SecurityDataType> = {}) {
    Object.assign(this, apiConfig);
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected encodeQueryParam(key: string, value: any) {
    const encodedKey = encodeURIComponent(key);
    return `${encodedKey}=${encodeURIComponent(typeof value === "number" ? value : `${value}`)}`;
  }

  protected addQueryParam(query: QueryParamsType, key: string) {
    return this.encodeQueryParam(key, query[key]);
  }

  protected addArrayQueryParam(query: QueryParamsType, key: string) {
    const value = query[key];
    return value.map((v: any) => this.encodeQueryParam(key, v)).join("&");
  }

  protected toQueryString(rawQuery?: QueryParamsType): string {
    const query = rawQuery || {};
    const keys = Object.keys(query).filter((key) => "undefined" !== typeof query[key]);
    return keys
      .map((key) => (Array.isArray(query[key]) ? this.addArrayQueryParam(query, key) : this.addQueryParam(query, key)))
      .join("&");
  }

  protected addQueryParams(rawQuery?: QueryParamsType): string {
    const queryString = this.toQueryString(rawQuery);
    return queryString ? `?${queryString}` : "";
  }

  private contentFormatters: Record<ContentType, (input: any) => any> = {
    [ContentType.Json]: (input: any) =>
      input !== null && (typeof input === "object" || typeof input === "string") ? JSON.stringify(input) : input,
    [ContentType.Text]: (input: any) => (input !== null && typeof input !== "string" ? JSON.stringify(input) : input),
    [ContentType.FormData]: (input: any) =>
      Object.keys(input || {}).reduce((formData, key) => {
        const property = input[key];
        formData.append(
          key,
          property instanceof Blob
            ? property
            : typeof property === "object" && property !== null
              ? JSON.stringify(property)
              : `${property}`,
        );
        return formData;
      }, new FormData()),
    [ContentType.UrlEncoded]: (input: any) => this.toQueryString(input),
  };

  protected mergeRequestParams(params1: RequestParams, params2?: RequestParams): RequestParams {
    return {
      ...this.baseApiParams,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...(this.baseApiParams.headers || {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected createAbortSignal = (cancelToken: CancelToken): AbortSignal | undefined => {
    if (this.abortControllers.has(cancelToken)) {
      const abortController = this.abortControllers.get(cancelToken);
      if (abortController) {
        return abortController.signal;
      }
      return void 0;
    }

    const abortController = new AbortController();
    this.abortControllers.set(cancelToken, abortController);
    return abortController.signal;
  };

  public abortRequest = (cancelToken: CancelToken) => {
    const abortController = this.abortControllers.get(cancelToken);

    if (abortController) {
      abortController.abort();
      this.abortControllers.delete(cancelToken);
    }
  };

  public request = async <T = any, E = any>({
    body,
    secure,
    path,
    type,
    query,
    format,
    baseUrl,
    cancelToken,
    ...params
  }: FullRequestParams): Promise<HttpResponse<T, E>> => {
    const secureParams =
      ((typeof secure === "boolean" ? secure : this.baseApiParams.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const queryString = query && this.toQueryString(query);
    const payloadFormatter = this.contentFormatters[type || ContentType.Json];
    const responseFormat = format || requestParams.format;

    return this.customFetch(`${baseUrl || this.baseUrl || ""}${path}${queryString ? `?${queryString}` : ""}`, {
      ...requestParams,
      headers: {
        ...(requestParams.headers || {}),
        ...(type && type !== ContentType.FormData ? { "Content-Type": type } : {}),
      },
      signal: (cancelToken ? this.createAbortSignal(cancelToken) : requestParams.signal) || null,
      body: typeof body === "undefined" || body === null ? null : payloadFormatter(body),
    }).then(async (response) => {
      const r = response.clone() as HttpResponse<T, E>;
      r.data = null as unknown as T;
      r.error = null as unknown as E;

      const data = !responseFormat
        ? r
        : await response[responseFormat]()
            .then((data) => {
              if (r.ok) {
                r.data = data;
              } else {
                r.error = data;
              }
              return r;
            })
            .catch((e) => {
              r.error = e;
              return r;
            });

      if (cancelToken) {
        this.abortControllers.delete(cancelToken);
      }

      if (!response.ok) throw data;
      return data;
    });
  };
}

/**
 * @title Shyft V1
 * @version 1.0.0
 * @baseUrl https://api.shyft.to/sol/v1
 * @contact
 *
 * This API collection will enable you to speed up your web3 development on Solana.
 */
export class Api<SecurityDataType extends unknown> extends HttpClient<SecurityDataType> {
  wallet = {
    /**
     * @description lets you check the balance in your solana wallet
     *
     * @tags Wallet
     * @name GetBalance
     * @summary Get Balance
     * @request GET:/wallet/balance
     */
    getBalance: (
      query?: {
        /**
         * Solana blockchain environment (testnet/devnet/mainnet-beta)
         * @example "mainnet-beta"
         */
        network?: string;
        /**
         * Wallet address
         * @example "9pg3RVmbsz7U1DnVCHPGZeAPSnQwTCPX5iNn257D2qzK"
         */
        wallet?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          /** @example "Balance fetched successfully" */
          message?: string;
          /** @example 0.33619124 */
          result?: number;
          /** @example true */
          success?: boolean;
        },
        any
      >({
        path: `/wallet/balance`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * @description allows you to transfer SOL from your account to another.
     *
     * @tags Wallet
     * @name SendSol
     * @summary Send Sol
     * @request POST:/wallet/send_sol
     */
    sendSol: (
      data: {
        /** @example 0.022 */
        amount?: number;
        /** @example "5saw7yPUSpP6UmDZpNUx77xffKEkJdcoaKEqhDcfZ4tefkjoHHRCT6W1dTd4f8T6KWyfjCbfYsD9Lhb6Styxgbkj" */
        from_private_key?: string;
        /** @example "devnet" */
        network?: string;
        /** @example "AaYFExyZuMHbJHzjimKyQBAH1yfA9sKTxSzBc6Nr5X4s" */
        to_address?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          /** @example "0.022 SOL transferred successfully" */
          message?: string;
          result?: {
            /** @example 0.022 */
            amount?: number;
            /** @example "2hSAU7uW851GmoZvkRyvRT6C66XimQy8H1yEz5iW2qKp5tAzLuaDrpHjoj3LkFtTpazgzQUKrRPm2gaLe3E6QjA9" */
            transactionHash?: string;
          };
          /** @example true */
          success?: boolean;
        },
        any
      >({
        path: `/wallet/send_sol`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Get Token Balance
     *
     * @tags Wallet
     * @name GetTokenBalance
     * @summary Get Token Balance
     * @request GET:/wallet/token_balance
     */
    getTokenBalance: (
      query?: {
        /** @example "mainnet-beta" */
        network?: string;
        /**
         * Wallet address
         * @example "9pg3RVmbsz7U1DnVCHPGZeAPSnQwTCPX5iNn257D2qzK"
         */
        wallet?: string;
        /**
         * Token address whose balance you want to fetch
         * @example "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
         */
        token?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          /** @example "Token balance fetched successfully" */
          message?: string;
          result?: {
            /** @example 500000 */
            balance?: number;
          };
          /** @example true */
          success?: boolean;
        },
        any
      >({
        path: `/wallet/token_balance`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * @description Get All Tokens Balance
     *
     * @tags Wallet
     * @name GetAllTokensBalance
     * @summary Get All Tokens Balance
     * @request GET:/wallet/all_tokens
     */
    getAllTokensBalance: (
      query?: {
        /** @example "mainnet-beta" */
        network?: string;
        /** @example "wu9w9RWz3JpKEArHSqLwkY7zwNqceeHuMtYEnXYHwQK" */
        wallet?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          /** @example "4 tokens fetched successfully" */
          message?: string;
          /** @example [{"address":"7yPeRofJpfPkjLJ8CLB7czuk4sKG9toXWVq8CcHr4DcU","balance":100},{"address":"4TLk2jocJuEysZubcMFCqsEFFu5jVGzTp14kAANDaEFv","balance":500000},{"address":"FK84vq6aVT2KFrKWz4m7oTufhDZdAt6qpMEBT4dziBEk","balance":100},{"address":"3dbNYdGJ2bWXtLhMcXW6szxmKPQSAjFuxXxU3PVAwaMA","balance":100}] */
          result?: {
            /** @example "7yPeRofJpfPkjLJ8CLB7czuk4sKG9toXWVq8CcHr4DcU" */
            address?: string;
            /** @example 100 */
            balance?: number;
          }[];
          /** @example true */
          success?: boolean;
        },
        any
      >({
        path: `/wallet/all_tokens`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * @description Get Portfolio
     *
     * @tags Wallet
     * @name GetPortfolio
     * @summary Get Portfolio
     * @request GET:/wallet/get_portfolio
     */
    getPortfolio: (
      query?: {
        /** @example "mainnet-beta" */
        network?: string;
        /** @example "9pg3RVmbsz7U1DnVCHPGZeAPSnQwTCPX5iNn257D2qzK" */
        wallet?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          /** @example "Portfolio fetched successfully" */
          message?: string;
          result?: {
            /** @example [{"data":{"creators":[{"address":"BvzKvn6nUUAYtKu2pH3h5SbUkUNcRPQawg4bURBiojJx","share":100,"verified":1}],"name":"Nightweaver","sellerFeeBasisPoints":0,"symbol":"NW","uri":"https://nftstorage.link/ipfs/' + 'bafkreidwzqo2fjyas32s2bhsvjo7fyi42yidtg5hpzetlsrij66eq3xblm"},"isMutable":1,"key":4,"mint":"ApJPjFr585xKSMk7EtAKU4UrcpyEgdN7X8trvd3gChYk","primarySaleHappened":0,"updateAuthority":"BvzKvn6nUUAYtKu2pH3h5SbUkUNcRPQawg4bURBiojJx"},{"data":{"creators":[{"address":"BvzKvn6nUUAYtKu2pH3h5SbUkUNcRPQawg4bURBiojJx","share":100,"verified":1}],"name":"SHYFT","sellerFeeBasisPoints":5,"symbol":"SHF","uri":"https://nftstorage.link/ipfs/ + bafkreid4ugb2wgbl2qkpfzd6bn34zkzjswfeo3esichllkn2m7fpffs4hy"},"isMutable":1,"key":4,"mint":"9XTGWZENKa18N1vgCQ3RjJWHG92Di2JKYi73jiC4hkEM","primarySaleHappened":0,"updateAuthority":"BvzKvn6nUUAYtKu2pH3h5SbUkUNcRPQawg4bURBiojJx"},{"data":{"creators":[{"address":"BvzKvn6nUUAYtKu2pH3h5SbUkUNcRPQawg4bURBiojJx","share":100,"verified":1}],"name":"Shyft","sellerFeeBasisPoints":1000,"symbol":"SH","uri":"https://nftstorage.link/ipfs/bafkreiewipf55m2tn5frny4alervvbqwdwdqmiaqzuri7ing2outmrxmke"},"isMutable":1,"key":4,"mint":"Cx3661bLrm7Q51yHnKSFhVr4YBLHBsvojj13nWBZkvQc","primarySaleHappened":0,"updateAuthority":"BvzKvn6nUUAYtKu2pH3h5SbUkUNcRPQawg4bURBiojJx"},{"data":{"creators":[{"address":"BvzKvn6nUUAYtKu2pH3h5SbUkUNcRPQawg4bURBiojJx","share":100,"verified":1}],"name":"some updated description","sellerFeeBasisPoints":5000,"symbol":"SH","uri":"https://nftstorage.link/ipfs/bafkreicb53w3npl4o6i7hhcbphxlf3qfiysjg2g33vay66wc5mg7gbzmk4"},"isMutable":1,"key":4,"mint":"3vv1QNVH5buEjxqYFZ6N5HPweW57T4kpP6VnrkHBtuT2","primarySaleHappened":0,"updateAuthority":"BvzKvn6nUUAYtKu2pH3h5SbUkUNcRPQawg4bURBiojJx"},{"data":{"creators":[{"address":"BvzKvn6nUUAYtKu2pH3h5SbUkUNcRPQawg4bURBiojJx","share":100,"verified":1}],"name":"MadBull","sellerFeeBasisPoints":1000,"symbol":"MB","uri":"https://nftstorage.link/ipfs/bafkreih5mkw2qmj5uc2dq7k6ifqtxiyw6vwp6rod2pajmej3vrvevblxre"},"isMutable":1,"key":4,"mint":"3UakQSxCAXQGSaeU41CtSvJD1J4rQShn4onKCEd9DKDs","primarySaleHappened":0,"updateAuthority":"BvzKvn6nUUAYtKu2pH3h5SbUkUNcRPQawg4bURBiojJx"},{"data":{"creators":[{"address":"BvzKvn6nUUAYtKu2pH3h5SbUkUNcRPQawg4bURBiojJx","share":100,"verified":1}],"name":"Shyft","sellerFeeBasisPoints":0,"symbol":"SH","uri":"https://nftstorage.link/ipfs/' + 'bafkreifpu66ojho2slqp5nbakmqa42ygaaqkf4repc3ioykgdqnxrohkba"},"isMutable":1,"key":4,"mint":"3PCt2frS9X5RwuH2KnebpUpHXcAqszvrWHnZg2m1wqDr","primarySaleHappened":1,"updateAuthority":"BvzKvn6nUUAYtKu2pH3h5SbUkUNcRPQawg4bURBiojJx"},{"data":{"creators":[{"address":"BvzKvn6nUUAYtKu2pH3h5SbUkUNcRPQawg4bURBiojJx","share":100,"verified":1}],"name":"Shyft","sellerFeeBasisPoints":1000,"symbol":"SH","uri":"https://nftstorage.link/ipfs/bafkreic74pvutsfh76oclnsgiz65zrfzptla44nb32pj54umz4nokj3uxa"},"isMutable":1,"key":4,"mint":"3E4arF7r89DbcLDg6AFuxcgLSsm4pHPQ12dKq9jBBNAQ","primarySaleHappened":0,"updateAuthority":"BvzKvn6nUUAYtKu2pH3h5SbUkUNcRPQawg4bURBiojJx"},{"data":{"creators":[{"address":"BvzKvn6nUUAYtKu2pH3h5SbUkUNcRPQawg4bURBiojJx","share":100,"verified":1}],"name":"MadBull","sellerFeeBasisPoints":1000,"symbol":"MB","uri":"https://nftstorage.link/ipfs/bafkreieoyd5jezffx5erzy7hqcewchlmnvipgjkcofpanktvpnukkhca6a"},"isMutable":1,"key":4,"mint":"4fN2a97sfVQaJWErLTjFu8GH63o8Xphv2DsdU5KSqHM3","primarySaleHappened":0,"updateAuthority":"BvzKvn6nUUAYtKu2pH3h5SbUkUNcRPQawg4bURBiojJx"},{"data":{"creators":[{"address":"BvzKvn6nUUAYtKu2pH3h5SbUkUNcRPQawg4bURBiojJx","share":100,"verified":1}],"name":"Mad Fucking Bug","sellerFeeBasisPoints":1000,"symbol":"MFB","uri":"https://nftstorage.link/ipfs/bafkreibdg2i2ycci5x2nj3seumhdhwt26k6ewezpv2ektbhgt2ir2l5loa"},"isMutable":1,"key":4,"mint":"b656nAT7qUKaQTC6m5to758ySR86eRbPcvN85RpmRHf","primarySaleHappened":0,"updateAuthority":"BvzKvn6nUUAYtKu2pH3h5SbUkUNcRPQawg4bURBiojJx"}] */
            nfts?: {
              data?: {
                /** @example [{"address":"BvzKvn6nUUAYtKu2pH3h5SbUkUNcRPQawg4bURBiojJx","share":100,"verified":1}] */
                creators?: {
                  /** @example "BvzKvn6nUUAYtKu2pH3h5SbUkUNcRPQawg4bURBiojJx" */
                  address?: string;
                  /** @example 100 */
                  share?: number;
                  /** @example 1 */
                  verified?: number;
                }[];
                /** @example "Nightweaver" */
                name?: string;
                /** @example 0 */
                sellerFeeBasisPoints?: number;
                /** @example "NW" */
                symbol?: string;
                /** @example "https://nftstorage.link/ipfs/' + 'bafkreidwzqo2fjyas32s2bhsvjo7fyi42yidtg5hpzetlsrij66eq3xblm" */
                uri?: string;
              };
              /** @example 1 */
              isMutable?: number;
              /** @example 4 */
              key?: number;
              /** @example "ApJPjFr585xKSMk7EtAKU4UrcpyEgdN7X8trvd3gChYk" */
              mint?: string;
              /** @example 0 */
              primarySaleHappened?: number;
              /** @example "BvzKvn6nUUAYtKu2pH3h5SbUkUNcRPQawg4bURBiojJx" */
              updateAuthority?: string;
            }[];
            /** @example 9 */
            num_nfts?: number;
            /** @example 2 */
            num_tokens?: number;
            /** @example 1.87873304 */
            sol_balance?: number;
            /** @example [{"address":"4TLk2jocJuEysZubcMFCqsEFFu5jVGzTp14kAANDaEFv","balance":500000},{"address":"7yPeRofJpfPkjLJ8CLB7czuk4sKG9toXWVq8CcHr4DcU","balance":310.000001}] */
            tokens?: {
              /** @example "4TLk2jocJuEysZubcMFCqsEFFu5jVGzTp14kAANDaEFv" */
              address?: string;
              /** @example 500000 */
              balance?: number;
            }[];
          };
          /** @example true */
          success?: boolean;
        },
        any
      >({
        path: `/wallet/get_portfolio`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * @description Get All Domains
     *
     * @tags Wallet
     * @name GetAllDomains
     * @summary Get All Domains
     * @request GET:/wallet/get_domains
     */
    getAllDomains: (
      query?: {
        /** @example "mainnet-beta" */
        network?: string;
        /** @example "9hqqMGMfG44L2R1a1osDgQRWKYt4YuegfUB6rUSaXrv8" */
        wallet?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          /** @example "1 domains fetched successfully" */
          message?: string;
          /** @example [{"address":"CK9rDU7Bk9SV5SEmRUakMjN87fpqTTSWq2ieojTmXJoL","name":"anoushk.sol"}] */
          result?: {
            /** @example "CK9rDU7Bk9SV5SEmRUakMjN87fpqTTSWq2ieojTmXJoL" */
            address?: string;
            /** @example "anoushk.sol" */
            name?: string;
          }[];
          /** @example true */
          success?: boolean;
        },
        any
      >({
        path: `/wallet/get_domains`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * @description Resolve Address
     *
     * @tags Wallet
     * @name ResolveAddress
     * @summary Resolve Address
     * @request GET:/wallet/resolve_address
     */
    resolveAddress: (
      query?: {
        /**
         * Solana blockchain environment (testnet/devnet/mainnet-beta)
         * @example "mainnet-beta"
         */
        network?: string;
        /**
         * Wallet address
         * @example "CK9rDU7Bk9SV5SEmRUakMjN87fpqTTSWq2ieojTmXJoL"
         */
        address?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          /** @example "Address resolved successfully" */
          message?: string;
          result?: {
            /** @example "anoushk.sol" */
            name?: string;
          };
          /** @example true */
          success?: boolean;
        },
        any
      >({
        path: `/wallet/resolve_address`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * @description Sign Transaction
     *
     * @tags Wallet
     * @name SignTransaction
     * @summary Sign Transaction
     * @request POST:/wallet/sign_transaction
     */
    signTransaction: (
      data: {
        /** @example "5eG1aSjNoPmScw84G1d7f9n2fgmWabtQEgRjTUXvpTrRH1qduEMwUvUFYiS8px22JNedkWFTUWj9PrRyq1MyessunKC8Mjyq3hH5WZkM15D3gsooH8hsFegyYRBmccLBTEnPph6fExEySkJwsfH6oGC62VmDDCpWyPHZLYv52e4qtUb1TBE6SgXE6FX3TFqrX5HApSkb9ZaCSz21FyyEbXtrmMxBQE1CR7BTyadWL1Vy9SLfo9tnsVpHHDHthFRr" */
        encoded_transaction?: string;
        /** @example "devnet" */
        network?: string;
        /** @example "5GGZQpoiDPRJLwMonq4ovBBKbxvNq76L3zgMXyiQ5grbPzgF3k35dkHuWwt3GmwVGZBXywXteJcJ53Emsda92D5v" */
        private_key?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/wallet/sign_transaction`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description Transaction History
     *
     * @tags Wallet
     * @name TransactionHistory
     * @summary Transaction History
     * @request GET:/wallet/transaction_history
     */
    transactionHistory: (
      query?: {
        /** @example "devnet" */
        network?: string;
        /** @example "2fmz8SuNVyxEP6QwKQs6LNaT2ATszySPEJdhUDesxktc" */
        wallet?: string;
        /** @example "2" */
        tx_num?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/wallet/transaction_history`,
        method: "GET",
        query: query,
        ...params,
      }),

    /**
     * @description Send SOL Detached
     *
     * @tags Wallet
     * @name SendSolDetached
     * @summary Send SOL Detached
     * @request POST:/wallet/send_sol_detach
     */
    sendSolDetached: (
      data: {
        /** @example 1.2 */
        amount?: number;
        /** @example "BFefyp7jNF5Xq2A4JDLLFFGpxLq5oPEFKBAQ46KJHW2R" */
        from_address?: string;
        /** @example "devnet" */
        network?: string;
        /** @example "2fmz8SuNVyxEP6QwKQs6LNaT2ATszySPEJdhUDesxktc" */
        to_address?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/wallet/send_sol_detach`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description Create Semi Custodial Wallet
     *
     * @tags Semi Custodial Wallet
     * @name CreateSemiCustodialWallet
     * @summary Create Semi Custodial Wallet
     * @request POST:/wallet/create_semi_wallet/
     */
    createSemiCustodialWallet: (
      data: {
        /** @example "shyt@1234*()" */
        password?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          /** @example "Semi custodial wallet created successfully" */
          message?: string;
          result?: {
            /** @example "Eqiyw6f6f9n2MHEwz2Xk2BkczoufVuUfpg8zchTy7qxf" */
            wallet_address?: string;
          };
          /** @example true */
          success?: boolean;
        },
        any
      >({
        path: `/wallet/create_semi_wallet/`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Get Keypair
     *
     * @tags Semi Custodial Wallet
     * @name GetKeypair
     * @summary Get Keypair
     * @request GET:/wallet/get_keypair
     */
    getKeypair: (
      data: {
        /** @example "shyt@1234*()" */
        password?: string;
        /** @example "Eqiyw6f6f9n2MHEwz2Xk2BkczoufVuUfpg8zchTy7qxf" */
        wallet?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          /** @example "Decryption Data" */
          message?: string;
          result?: {
            /** @example "Eqiyw6f6f9n2MHEwz2Xk2BkczoufVuUfpg8zchTy7qxf" */
            publicKey?: string;
            /** @example "36x5aoumtgWXZ9bBM38Cih4UeuGqTkM2Q3gwRNiJFpYoYgp9uZym9swn93uQYRS6aRyKWKuqQMm8fpa4NMtvSutP" */
            secretKey?: string;
          };
          /** @example true */
          success?: boolean;
        },
        any
      >({
        path: `/wallet/get_keypair`,
        method: "GET",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Decrypt Semi Custodial Wallet
     *
     * @tags Semi Custodial Wallet
     * @name DecryptSemiCustodialWallet
     * @summary Decrypt Semi Custodial Wallet
     * @request GET:/wallet/decrypt_semi_wallet
     */
    decryptSemiCustodialWallet: (
      data: {
        /** @example "shyt@1234*()" */
        password?: string;
        /** @example "Eqiyw6f6f9n2MHEwz2Xk2BkczoufVuUfpg8zchTy7qxf" */
        wallet?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          /** @example "Decryption Data" */
          message?: string;
          result?: {
            /** @example "{"salt":"VXEx1TAshyxx7PQmgcJnCY","kdf":"pbkdf2","digest":"sha256","iterations":100000,"nonce":"7aDRwa35rYizZK6VL4qkiTvKgguxXNVta"}" */
            decryptionKey?: string;
            /** @example "uRdy44KDYaztpXv4GvtHhHphwuTaEbgztM633s4JbSSvJ9KW597tfmyznrc8Qeq9NbTNC6JSRVkNzydHbLBaj5E1vAoRTMcpt9tjBmn8pnbK7GeyNTGube39fTRfM8U3kvTYvrhJjAJ6dG" */
            encryptedPrivateKey?: string;
          };
          /** @example true */
          success?: boolean;
        },
        any
      >({
        path: `/wallet/decrypt_semi_wallet`,
        method: "GET",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
  };
  nft = {
    /**
     * @description Mints an NFT into a wallet corresponding to the private key on blockchain. Wallet's public address is set as the update authority.
     *
     * @tags NFTs, Testing (Devnet/Testnet)
     * @name CreateNft
     * @summary Create NFT
     * @request POST:/nft/create
     */
    createNft: (
      data: {
        /**
         * attributes associated to this NFT
         * @example "[{"trait_type": "speed", "value": 100},
         * {"trait_type": "aggression", "value": "crazy"},
         * {"trait_type": "energy", "value": "very high"}]"
         */
        attributes?: string;
        /**
         * NFT description
         * @example "hair on fire problem solving"
         */
        description?: string;
        /**
         * any url to associate with the NFT
         * @example "https://shyft.to/"
         */
        external_url?: string;
        /**
         * Image/pdf/.doc or any file that you would want to turn into nft
         * @format binary
         */
        file?: File;
        /**
         * Maximum number of clones/edition mints possible for this NFT
         * @example "1"
         */
        max_supply?: string;
        /**
         * NFT name
         * @example "MadBull"
         */
        name?: string;
        /**
         * solana blockchain environment (testnet/devnet/mainnet-beta)
         * @example "devnet"
         */
        network?: string;
        /**
         * your wallet's private key
         * @example "41zT4s2kNukmBNQWMFPSzo3VQbjhers5TP6tyvr3MjqvJAETMmQybZtRsRXPK1rdA1xBJruy4n58Zb1pNmoKy7y1"
         */
        private_key?: string;
        /**
         * represents how much percentage of secondary sales does the original creator gets. Ranges from (0-100), 0 being original creator gets nothing and 100 being original creator gets entire amount from secondary sales
         * @example "10"
         */
        royalty?: string;
        /**
         * NFT symbol
         * @example "MB"
         */
        symbol?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          /** @example "NFT created successfully" */
          message?: string;
          result?: {
            /** @example "HcMZECPFWf9d2c29EfEdDFJpBjJJRVjNmD1PkKeVAfRn" */
            edition?: string;
            /** @example "B8Ro5Nxn5ZteY7nXVKFGuHDqXKpKzxCFL5zPkNkwoRRB" */
            metadata?: string;
            /** @example "42W21y86sURFNaWgwDuLTfMKay5LVRzFJrMe2J7xMYTx" */
            mint?: string;
            /** @example "9T1vwiGXQREk8DF9jorscGX6paWDTFPzuRL8JegtWtfGAJnbaRv3KTz3onrhbiuMwsm9WsyQN2GFbkyS5nYvyBE" */
            txId?: string;
          };
          /** @example true */
          success?: boolean;
        },
        any
      >({
        path: `/nft/create`,
        method: "POST",
        body: data,
        type: ContentType.FormData,
        format: "json",
        ...params,
      }),

    /**
     * @description updates the properties and data associated to the nft
     *
     * @tags NFTs, Testing (Devnet/Testnet)
     * @name UpdateNft
     * @summary Update NFT
     * @request POST:/nft/update
     */
    updateNft: (
      data: {
        /**
         * attributes associated to this NFT
         * @example "{"health" : 50}"
         */
        attributes?: string;
        /**
         * NFT description
         * @example "some description"
         */
        description?: string;
        /**
         * any url to associate with the NFT
         * @example "https://psychostore.in"
         */
        external_url?: string;
        /**
         * digital file that nft represents (image/doc/video etc)
         * @format binary
         */
        file?: File;
        /**
         * NFT name
         * @example "SHYFT"
         */
        name?: string;
        /**
         * solana blockchain environment (testnet/devnet/mainnet-beta)
         * @example "devnet"
         */
        network?: string;
        /**
         * your wallet's private key
         * @example "41zT4s2kNukmBNQWMFPSzo3VQbjhers5TP6tyvr3MjqvJAETMmQybZtRsRXPK1rdA1xBJruy4n58Zb1pNmoKy7y1"
         */
        private_key?: string;
        /**
         * represents how much percentage of secondary sales does the original creator gets. Ranges from (0-100), 0 being original creator gets nothing and 100 being original creator gets entire amount from secondary sales
         * @example "5"
         */
        royalty?: string;
        /**
         * NFT symbol
         * @example "SHF"
         */
        symbol?: string;
        /**
         * address of the NFT to be updated
         * @example "7a7KrDuQQHET6HxfKwmjGCkt43s7BZM46nDrJNtctWgh"
         */
        token_address?: string;
        /**
         * address of the update_authority of the NFT to be updated
         * @example "BvzKvn6nUUAYtKu2pH3h5SbUkUNcRPQawg4bURBiojJx"
         */
        update_authority?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          /** @example "NFT updated" */
          message?: string;
          result?: {
            /** @example "2yLHYFCYJWqneQ8zqkgQs7qnzu6bbGjgcSPuGbUsXnwai21EpMi814vMXkAaUKyKKadbduoEe3a2HzNCLsESpKx8" */
            txId?: string;
          };
          /** @example true */
          success?: boolean;
        },
        any
      >({
        path: `/nft/update`,
        method: "POST",
        body: data,
        type: ContentType.FormData,
        format: "json",
        ...params,
      }),

    /**
     * @description Burn/Delete an on-chain nft.
     *
     * @tags NFTs, Testing (Devnet/Testnet)
     * @name BurnNft
     * @summary Burn NFT
     * @request DELETE:/nft/burn
     */
    burnNft: (
      data: {
        /** @example "devnet" */
        network?: string;
        /** @example "41zT4s2kNukmBNQWMFPSzo3VQbjhers5TP6tyvr3MjqvJAETMmQybZtRsRXPK1rdA1xBJruy4n58Zb1pNmoKy7y1" */
        private_key?: string;
        /** @example "7a7KrDuQQHET6HxfKwmjGCkt43s7BZM46nDrJNtctWgh" */
        token_address?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          /** @example "NFT burned successfully" */
          message?: string;
          result?: {
            /** @example "cjWb4KTFchNj9yXJoyR1rtWaMRMtkgkcoeuKARGBjBvK953UgvzPKwZNQVQ2srN7eVoqBcumWJZF4MkDKrnJNim" */
            txId?: string;
          };
          /** @example true */
          success?: boolean;
        },
        any
      >({
        path: `/nft/burn`,
        method: "DELETE",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Transfer NFT
     *
     * @tags NFTs, Testing (Devnet/Testnet)
     * @name TransferNft
     * @summary Transfer NFT
     * @request POST:/nft/transfer
     */
    transferNft: (
      data: {
        /** @example "2CayyFUNQd57iTHXh67FfNsamwUz6vGgcX7wAA2f5wMf3M4DKUUkLGozhJr4uDzXbF6261WKAtVUaNL7QQVDFTzx" */
        from_address?: string;
        /** @example "devnet" */
        network?: string;
        /** @example "3E4arF7r89DbcLDg6AFuxcgLSsm4pHPQ12dKq9jBBNAQ" */
        to_address?: string;
        /** @example "b656nAT7qUKaQTC6m5to758ySR86eRbPcvN85RpmRHf" */
        token_address?: string;
        /** @example true */
        transfer_authority?: boolean;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          /** @example "NFT Transfer" */
          message?: string;
          result?: {
            /** @example "3kAqDDXFaoYpVp2GLGhghWpPnUcdsopaucKtGRhVPqSt5CsSx3BE8wMZGcMxBFeXz27DwXLJ8abG65FWmMt7eufS" */
            transferTxId?: string;
            /** @example "4vL7YaFYWLozctJ76WNoArr1gFtVfEGDS4DoAKv5AKFUToc67d5jn9G8NKf3XgxBACPWsXFbj9yRt3fVq1d92nGd" */
            updateTxId?: string;
          };
          /** @example true */
          success?: boolean;
        },
        any
      >({
        path: `/nft/transfer`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Mint NFT
     *
     * @tags NFTs, Testing (Devnet/Testnet)
     * @name MintNft
     * @summary Mint NFT
     * @request POST:/nft/mint
     */
    mintNft: (
      data: {
        /** @example "37CGrKHKhCj42xSMeJ5HH2TfidjPWHVR994L8msVRzoC" */
        mint_address?: string;
        /** @example "BFefyp7jNF5Xq2A4JDLLFFGpxLq5oPEFKBAQ46KJHW2R" */
        mint_authority?: string;
        /** @example "devnet" */
        network?: string;
        /** @example "5GGZQpoiDPRJLwMonq4ovBBKbxvNq76L3zgMXyiQ5grbPzgF3k35dkHuWwt3GmwVGZBXywXteJcJ53Emsda92D5v" */
        private_key?: string;
        /** @example "BFefyp7jNF5Xq2A4JDLLFFGpxLq5oPEFKBAQ46KJHW2R" */
        update_authority?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/nft/mint`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description Create NFT Detached
     *
     * @tags NFTs
     * @name CreateNftDetached
     * @summary Create NFT Detached
     * @request POST:/nft/create_detach
     */
    createNftDetached: (
      data: {
        /** @example "[ {    "trait_type": "edification",    "value": "100"  }]" */
        attributes?: string;
        /** @example "Girl with beautiful eyes" */
        description?: string;
        /** @example "https://shyft.to" */
        external_url?: string;
        /** @format binary */
        file?: File;
        /** @example "1" */
        max_supply?: string;
        /** @example "fish eyes" */
        name?: string;
        /** @example "devnet" */
        network?: string;
        /** @example "5" */
        royalty?: string;
        /** @example "FYE" */
        symbol?: string;
        /** @example "2fmz8SuNVyxEP6QwKQs6LNaT2ATszySPEJdhUDesxktc" */
        wallet?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/nft/create_detach`,
        method: "POST",
        body: data,
        type: ContentType.FormData,
        ...params,
      }),

    /**
     * @description Mint NFT Detached
     *
     * @tags NFTs
     * @name MintNftDetached
     * @summary Mint NFT Detached
     * @request POST:/nft/mint_detach
     */
    mintNftDetached: (
      data: {
        /** @example "37CGrKHKhCj42xSMeJ5HH2TfidjPWHVR994L8msVRzoC" */
        master_nft_address?: string;
        /** @example "mainnet-beta" */
        network?: string;
        /** @example "BFefyp7jNF5Xq2A4JDLLFFGpxLq5oPEFKBAQ46KJHW2R" */
        receiver?: string;
        /** @example "BFefyp7jNF5Xq2A4JDLLFFGpxLq5oPEFKBAQ46KJHW2R" */
        transfer_authority?: string;
        /** @example "2fmz8SuNVyxEP6QwKQs6LNaT2ATszySPEJdhUDesxktc" */
        wallet?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/nft/mint_detach`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description Burn NFT Detached
     *
     * @tags NFTs
     * @name BurnNftDetached
     * @summary Burn NFT Detached
     * @request DELETE:/nft/burn_detach
     */
    burnNftDetached: (
      data: {
        /** @example false */
        close?: boolean;
        /** @example "devnet" */
        network?: string;
        /** @example "HBE5dEcFHiJtU8vmTyx7MhB43nFRMJt8ddC8Lupc3Jph" */
        token_address?: string;
        /** @example "2fmz8SuNVyxEP6QwKQs6LNaT2ATszySPEJdhUDesxktc" */
        wallet?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/nft/burn_detach`,
        method: "DELETE",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description Update NFT Detached
     *
     * @tags NFTs
     * @name UpdateNftDetached
     * @summary Update NFT Detached
     * @request POST:/nft/update_detach
     */
    updateNftDetached: (
      data: {
        /** @example "[{ "trait_type": "edification", "value": "100" }]" */
        attributes?: string;
        /** @example "Shyft makes web3 development easy" */
        description?: string;
        /** @format binary */
        file?: File;
        /** @example "Shyft" */
        name?: string;
        /** @example "devnet" */
        network?: string;
        /** @example "100" */
        royalty?: string;
        /** @example "SH" */
        symbol?: string;
        /** @example "HJ32KZye152eCFQYrKDcoyyq77dVDpa8SXE6v8T1HkBP" */
        token_address?: string;
        /** @example "2fmz8SuNVyxEP6QwKQs6LNaT2ATszySPEJdhUDesxktc" */
        wallet?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/nft/update_detach`,
        method: "POST",
        body: data,
        type: ContentType.FormData,
        ...params,
      }),

    /**
     * @description Transfet NFT Detached
     *
     * @tags NFTs
     * @name TransfetNftDetached
     * @summary Transfet NFT Detached
     * @request POST:/nft/transfer_detach
     */
    transfetNftDetached: (
      data: {
        /** @example "2fmz8SuNVyxEP6QwKQs6LNaT2ATszySPEJdhUDesxktc" */
        from_address?: string;
        /** @example "devnet" */
        network?: string;
        /** @example "BFefyp7jNF5Xq2A4JDLLFFGpxLq5oPEFKBAQ46KJHW2R" */
        to_address?: string;
        /** @example "HJ32KZye152eCFQYrKDcoyyq77dVDpa8SXE6v8T1HkBP" */
        token_address?: string;
        /** @example true */
        transfer_authority?: boolean;
      },
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/nft/transfer_detach`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description Search
     *
     * @tags NFTs
     * @name Search
     * @summary Search
     * @request GET:/nft/search
     */
    search: (
      query?: {
        /** @example "devnet" */
        network?: string;
        /** @example "5xSbS5PCkxPeZeJLHRBw57hMbCBNzSRoRaVfpQt5rxAg" */
        creators?: string;
        /** @example "5xSbS5PCkxPeZeJLHRBw57hMbCBNzSRoRaVfpQt5rxAg" */
        wallet?: string;
        /** @example "{ "edification": { "gt": "10" }, "energy": "10" }" */
        attributes?: string;
        /** @example "{ "lte": 5 }" */
        royalty?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/nft/search`,
        method: "GET",
        query: query,
        ...params,
      }),

    /**
     * @description Read all the nfts from a wallet, or optionally all nfts with a paricular update_authority from a wallet
     *
     * @tags NFTs
     * @name ReadAllNfts
     * @summary Read All NFTs
     * @request GET:/nft/read_all
     */
    readAllNfts: (
      query?: {
        /**
         * solana blockchain environment (testnet/devnet/mainnet-beta)
         * @example "mainnet-beta"
         */
        network?: string;
        /**
         * your wallet address
         * @example "Gn4edvDxdL4igg9hZMLAg1NRwCmkYLxbjwnoGg68tHzp"
         */
        address?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          /** @example "All NFTS in your wallet" */
          message?: string;
          /** @example [{"attributes":{"Background":"Peach","Eyes":"Black Sunglasses","Head":"Beanie","Mouth":"Joint","Skin":"Melted Rainbow"},"attributes_array":[{"trait_type":"Background","value":"Peach"},{"trait_type":"Skin","value":"Melted Rainbow"},{"trait_type":"Mouth","value":"Joint"},{"trait_type":"Eyes","value":"Black Sunglasses"},{"trait_type":"Head","value":"Beanie"}],"cached_image_uri":"https://monkelabs.nyc3.digitaloceanspaces.com/chill-dogs-club/images/78d3eea143160b8b408f12e04fcf2d8b.png","creators":[{"address":"874siiZq4GedsKiwUyZ2UnckbzxMWTr8jTE7MNTdjALP","share":0,"verified":1},{"address":"Hz2XVrEbVFJw9UUWkp4WoikVd1N5aoao3sACJbvjTSR5","share":50,"verified":0},{"address":"Dftf9uRkTrfKcxk5rpnVzi5D9SxaphRXYsHqBTeWKPmM","share":45,"verified":0},{"address":"mnKzuL9RMtR6GeSHBfDpnQaefcMsiw7waoTSduKNiXM","share":5,"verified":0}],"description":"Chill Dogs Club is a collection of 6,666 NFTs Chillin & vibin & thrillin on the Solana Blockchain. Be part of the chill ass pack to dominate the world. Get all the perks we have, unlocked benefits, and stay HYDRATED as we take over the world.","files":[],"image_uri":"https://monkelabs.nyc3.digitaloceanspaces.com/chill-dogs-club/images/78d3eea143160b8b408f12e04fcf2d8b.png","metadata_uri":"https://monkelabs.nyc3.digitaloceanspaces.com/chill-dogs-club/json/78d3eea143160b8b408f12e04fcf2d8b.json","mint":"Gb11ZEeygZ2fr3qpGKr6XKx4ENzD5JHtHUq2vo6LGwE1","name":"Chill Dogs Club #1300","owner":"5i1XCVR7AjBgfpuAV5sQahu4wVvZjCCQL7PQZ2vkD7cD","royalty":0.1,"symbol":"CDC","update_authority":"874siiZq4GedsKiwUyZ2UnckbzxMWTr8jTE7MNTdjALP"},{"attributes":{"Accessories":"Weed","Background":"Green2","Eyes":"Sasuke Eye","Mouth":"Tongue Out","Outfit":"Pattern Shirt","Skin":"Melted Rainbow"},"attributes_array":[{"trait_type":"Background","value":"Green2"},{"trait_type":"Skin","value":"Melted Rainbow"},{"trait_type":"Outfit","value":"Pattern Shirt"},{"trait_type":"Accessories","value":"Weed"},{"trait_type":"Mouth","value":"Tongue Out"},{"trait_type":"Eyes","value":"Sasuke Eye"}],"cached_image_uri":"https://monkelabs.nyc3.digitaloceanspaces.com/chill-dogs-club/images/8513920d5f72b0f6e16357da677da5be.png","creators":[{"address":"874siiZq4GedsKiwUyZ2UnckbzxMWTr8jTE7MNTdjALP","share":0,"verified":1},{"address":"Hz2XVrEbVFJw9UUWkp4WoikVd1N5aoao3sACJbvjTSR5","share":50,"verified":0},{"address":"Dftf9uRkTrfKcxk5rpnVzi5D9SxaphRXYsHqBTeWKPmM","share":45,"verified":0},{"address":"mnKzuL9RMtR6GeSHBfDpnQaefcMsiw7waoTSduKNiXM","share":5,"verified":0}],"description":"Chill Dogs Club is a collection of 6,666 NFTs Chillin & vibin & thrillin on the Solana Blockchain. Be part of the chill ass pack to dominate the world. Get all the perks we have, unlocked benefits, and stay HYDRATED as we take over the world.","files":[],"image_uri":"https://monkelabs.nyc3.digitaloceanspaces.com/chill-dogs-club/images/8513920d5f72b0f6e16357da677da5be.png","metadata_uri":"https://monkelabs.nyc3.digitaloceanspaces.com/chill-dogs-club/json/8513920d5f72b0f6e16357da677da5be.json","mint":"AkABzWGyWpPfU6KJSfquHtq7PrUWrY2CVXrRDng67oSZ","name":"Chill Dogs Club #787","owner":"5i1XCVR7AjBgfpuAV5sQahu4wVvZjCCQL7PQZ2vkD7cD","royalty":0.1,"symbol":"CDC","update_authority":"874siiZq4GedsKiwUyZ2UnckbzxMWTr8jTE7MNTdjALP"},{"attributes":{"Background":"Gradient5","Eyes":"Toothpicks","Head":"Mohawk","Mouth":"Colored Teeth","Skin":"Mushroom Skin","Wing":"Wing"},"attributes_array":[{"trait_type":"Background","value":"Gradient5"},{"trait_type":"Wing","value":"Wing"},{"trait_type":"Skin","value":"Mushroom Skin"},{"trait_type":"Mouth","value":"Colored Teeth"},{"trait_type":"Eyes","value":"Toothpicks"},{"trait_type":"Head","value":"Mohawk"}],"cached_image_uri":"https://monkelabs.nyc3.digitaloceanspaces.com/chill-dogs-club/images/11289ee56fa763e3e93b01131e5460b7.png","creators":[{"address":"874siiZq4GedsKiwUyZ2UnckbzxMWTr8jTE7MNTdjALP","share":0,"verified":1},{"address":"Hz2XVrEbVFJw9UUWkp4WoikVd1N5aoao3sACJbvjTSR5","share":50,"verified":0},{"address":"Dftf9uRkTrfKcxk5rpnVzi5D9SxaphRXYsHqBTeWKPmM","share":45,"verified":0},{"address":"mnKzuL9RMtR6GeSHBfDpnQaefcMsiw7waoTSduKNiXM","share":5,"verified":0}],"description":"Chill Dogs Club is a collection of 6,666 NFTs Chillin & vibin & thrillin on the Solana Blockchain. Be part of the chill ass pack to dominate the world. Get all the perks we have, unlocked benefits, and stay HYDRATED as we take over the world.","files":[],"image_uri":"https://monkelabs.nyc3.digitaloceanspaces.com/chill-dogs-club/images/11289ee56fa763e3e93b01131e5460b7.png","metadata_uri":"https://monkelabs.nyc3.digitaloceanspaces.com/chill-dogs-club/json/11289ee56fa763e3e93b01131e5460b7.json","mint":"AVt9BCAHiFeLrasgjk9747TEP3Ss7pwrGKNemoh4BY7P","name":"Chill Dogs Club #785","owner":"5i1XCVR7AjBgfpuAV5sQahu4wVvZjCCQL7PQZ2vkD7cD","royalty":0.1,"symbol":"CDC","update_authority":"874siiZq4GedsKiwUyZ2UnckbzxMWTr8jTE7MNTdjALP"},{"attributes":{"Accessories":"Diamond Collar","Background":"Gradient4","Eyes":"Robot Eye","Mouth":"Drooling","Outfit":"Wide Jersey","Skin":"Golden Bone","Wing":"Wing"},"attributes_array":[{"trait_type":"Background","value":"Gradient4"},{"trait_type":"Wing","value":"Wing"},{"trait_type":"Skin","value":"Golden Bone"},{"trait_type":"Outfit","value":"Wide Jersey"},{"trait_type":"Accessories","value":"Diamond Collar"},{"trait_type":"Mouth","value":"Drooling"},{"trait_type":"Eyes","value":"Robot Eye"}],"cached_image_uri":"https://monkelabs.nyc3.digitaloceanspaces.com/chill-dogs-club/images/0d745eae7b1240af5e8140fac5cdaa64.png","creators":[{"address":"874siiZq4GedsKiwUyZ2UnckbzxMWTr8jTE7MNTdjALP","share":0,"verified":1},{"address":"Hz2XVrEbVFJw9UUWkp4WoikVd1N5aoao3sACJbvjTSR5","share":50,"verified":0},{"address":"Dftf9uRkTrfKcxk5rpnVzi5D9SxaphRXYsHqBTeWKPmM","share":45,"verified":0},{"address":"mnKzuL9RMtR6GeSHBfDpnQaefcMsiw7waoTSduKNiXM","share":5,"verified":0}],"description":"Chill Dogs Club is a collection of 6,666 NFTs Chillin & vibin & thrillin on the Solana Blockchain. Be part of the chill ass pack to dominate the world. Get all the perks we have, unlocked benefits, and stay HYDRATED as we take over the world.","files":[],"image_uri":"https://monkelabs.nyc3.digitaloceanspaces.com/chill-dogs-club/images/0d745eae7b1240af5e8140fac5cdaa64.png","metadata_uri":"https://monkelabs.nyc3.digitaloceanspaces.com/chill-dogs-club/json/0d745eae7b1240af5e8140fac5cdaa64.json","mint":"Cc9f6ZcBbp3BGJZPy64NrXpa1YnXm7MtuVYEPypyrSur","name":"Chill Dogs Club #1914","owner":"5i1XCVR7AjBgfpuAV5sQahu4wVvZjCCQL7PQZ2vkD7cD","royalty":0.1,"symbol":"CDC","update_authority":"874siiZq4GedsKiwUyZ2UnckbzxMWTr8jTE7MNTdjALP"},{"attributes":{"Accessories":"Gun Necklace","Background":"Green1","Eyes":"Angry Eyes","Mouth":"Cigar","Skin":"Robot"},"attributes_array":[{"trait_type":"Background","value":"Green1"},{"trait_type":"Skin","value":"Robot"},{"trait_type":"Accessories","value":"Gun Necklace"},{"trait_type":"Mouth","value":"Cigar"},{"trait_type":"Eyes","value":"Angry Eyes"}],"cached_image_uri":"https://monkelabs.nyc3.digitaloceanspaces.com/chill-dogs-club/images/d459408fd8cd4c6dbc13a32418439b35.png","creators":[{"address":"874siiZq4GedsKiwUyZ2UnckbzxMWTr8jTE7MNTdjALP","share":0,"verified":1},{"address":"Hz2XVrEbVFJw9UUWkp4WoikVd1N5aoao3sACJbvjTSR5","share":50,"verified":0},{"address":"Dftf9uRkTrfKcxk5rpnVzi5D9SxaphRXYsHqBTeWKPmM","share":45,"verified":0},{"address":"mnKzuL9RMtR6GeSHBfDpnQaefcMsiw7waoTSduKNiXM","share":5,"verified":0}],"description":"Chill Dogs Club is a collection of 6,666 NFTs Chillin & vibin & thrillin on the Solana Blockchain. Be part of the chill ass pack to dominate the world. Get all the perks we have, unlocked benefits, and stay HYDRATED as we take over the world.","files":[],"image_uri":"https://monkelabs.nyc3.digitaloceanspaces.com/chill-dogs-club/images/d459408fd8cd4c6dbc13a32418439b35.png","metadata_uri":"https://monkelabs.nyc3.digitaloceanspaces.com/chill-dogs-club/json/d459408fd8cd4c6dbc13a32418439b35.json","mint":"B9ERPWWQSXTEpgLmDkoz5W15bar8y5rz2PfPjpVHUbtw","name":"Chill Dogs Club #2214","owner":"5i1XCVR7AjBgfpuAV5sQahu4wVvZjCCQL7PQZ2vkD7cD","royalty":0.1,"symbol":"CDC","update_authority":"874siiZq4GedsKiwUyZ2UnckbzxMWTr8jTE7MNTdjALP"},{"attributes":{"Accessories":"Headphone","Background":"Gradient4","Eyes":"White Glasses","Mouth":"Grillz","Skin":"Melted Rainbow"},"attributes_array":[{"trait_type":"Background","value":"Gradient4"},{"trait_type":"Skin","value":"Melted Rainbow"},{"trait_type":"Accessories","value":"Headphone"},{"trait_type":"Mouth","value":"Grillz"},{"trait_type":"Eyes","value":"White Glasses"}],"cached_image_uri":"https://monkelabs.nyc3.digitaloceanspaces.com/chill-dogs-club/images/eb233c74b0b3de4533ffb7066ff81dc5.png","creators":[{"address":"874siiZq4GedsKiwUyZ2UnckbzxMWTr8jTE7MNTdjALP","share":0,"verified":1},{"address":"Hz2XVrEbVFJw9UUWkp4WoikVd1N5aoao3sACJbvjTSR5","share":50,"verified":0},{"address":"Dftf9uRkTrfKcxk5rpnVzi5D9SxaphRXYsHqBTeWKPmM","share":45,"verified":0},{"address":"mnKzuL9RMtR6GeSHBfDpnQaefcMsiw7waoTSduKNiXM","share":5,"verified":0}],"description":"Chill Dogs Club is a collection of 6,666 NFTs Chillin & vibin & thrillin on the Solana Blockchain. Be part of the chill ass pack to dominate the world. Get all the perks we have, unlocked benefits, and stay HYDRATED as we take over the world.","files":[],"image_uri":"https://monkelabs.nyc3.digitaloceanspaces.com/chill-dogs-club/images/eb233c74b0b3de4533ffb7066ff81dc5.png","metadata_uri":"https://monkelabs.nyc3.digitaloceanspaces.com/chill-dogs-club/json/eb233c74b0b3de4533ffb7066ff81dc5.json","mint":"4CjVLpb17BKQQcuxg2CZc1VSgn8LxcDBdjV1ULNB3dog","name":"Chill Dogs Club #2063","owner":"5i1XCVR7AjBgfpuAV5sQahu4wVvZjCCQL7PQZ2vkD7cD","royalty":0.1,"symbol":"CDC","update_authority":"874siiZq4GedsKiwUyZ2UnckbzxMWTr8jTE7MNTdjALP"},{"attributes":{"Background":"Gradient5","Eyes":"Black Sunglasses","Mouth":"Angry","Skin":"Leopard"},"attributes_array":[{"trait_type":"Background","value":"Gradient5"},{"trait_type":"Skin","value":"Leopard"},{"trait_type":"Mouth","value":"Angry"},{"trait_type":"Eyes","value":"Black Sunglasses"}],"cached_image_uri":"https://monkelabs.nyc3.digitaloceanspaces.com/chill-dogs-club/images/04c1aeed7dc44f46a8a121db21baeef3.png","creators":[{"address":"874siiZq4GedsKiwUyZ2UnckbzxMWTr8jTE7MNTdjALP","share":0,"verified":1},{"address":"Hz2XVrEbVFJw9UUWkp4WoikVd1N5aoao3sACJbvjTSR5","share":50,"verified":0},{"address":"Dftf9uRkTrfKcxk5rpnVzi5D9SxaphRXYsHqBTeWKPmM","share":45,"verified":0},{"address":"mnKzuL9RMtR6GeSHBfDpnQaefcMsiw7waoTSduKNiXM","share":5,"verified":0}],"description":"Chill Dogs Club is a collection of 6,666 NFTs Chillin & vibin & thrillin on the Solana Blockchain. Be part of the chill ass pack to dominate the world. Get all the perks we have, unlocked benefits, and stay HYDRATED as we take over the world.","files":[],"image_uri":"https://monkelabs.nyc3.digitaloceanspaces.com/chill-dogs-club/images/04c1aeed7dc44f46a8a121db21baeef3.png","metadata_uri":"https://monkelabs.nyc3.digitaloceanspaces.com/chill-dogs-club/json/04c1aeed7dc44f46a8a121db21baeef3.json","mint":"6uUM1LACcyhABeWym4XeDf8WTP5UzWiQgM89CCdKBLZT","name":"Chill Dogs Club #793","owner":"5i1XCVR7AjBgfpuAV5sQahu4wVvZjCCQL7PQZ2vkD7cD","royalty":0.1,"symbol":"CDC","update_authority":"874siiZq4GedsKiwUyZ2UnckbzxMWTr8jTE7MNTdjALP"},{"attributes":{"Background":"Yellowish","Eyes":"B Glasses","Mouth":"Ice","Skin":"Zombie"},"attributes_array":[{"trait_type":"Background","value":"Yellowish"},{"trait_type":"Skin","value":"Zombie"},{"trait_type":"Mouth","value":"Ice"},{"trait_type":"Eyes","value":"B Glasses"}],"cached_image_uri":"https://monkelabs.nyc3.digitaloceanspaces.com/chill-dogs-club/images/b6751390441c0102d750df6d3c034698.png","creators":[{"address":"874siiZq4GedsKiwUyZ2UnckbzxMWTr8jTE7MNTdjALP","share":0,"verified":1},{"address":"Hz2XVrEbVFJw9UUWkp4WoikVd1N5aoao3sACJbvjTSR5","share":50,"verified":0},{"address":"Dftf9uRkTrfKcxk5rpnVzi5D9SxaphRXYsHqBTeWKPmM","share":45,"verified":0},{"address":"mnKzuL9RMtR6GeSHBfDpnQaefcMsiw7waoTSduKNiXM","share":5,"verified":0}],"description":"Chill Dogs Club is a collection of 6,666 NFTs Chillin & vibin & thrillin on the Solana Blockchain. Be part of the chill ass pack to dominate the world. Get all the perks we have, unlocked benefits, and stay HYDRATED as we take over the world.","files":[],"image_uri":"https://monkelabs.nyc3.digitaloceanspaces.com/chill-dogs-club/images/b6751390441c0102d750df6d3c034698.png","metadata_uri":"https://monkelabs.nyc3.digitaloceanspaces.com/chill-dogs-club/json/b6751390441c0102d750df6d3c034698.json","mint":"H6DLDubyHdV1nxB1BKG7NfsEe1qXRJuRHVjqryBw2B3Q","name":"Chill Dogs Club #529","owner":"5i1XCVR7AjBgfpuAV5sQahu4wVvZjCCQL7PQZ2vkD7cD","royalty":0.1,"symbol":"CDC","update_authority":"874siiZq4GedsKiwUyZ2UnckbzxMWTr8jTE7MNTdjALP"},{"attributes":{"Accessories":"Diamond Collar","Background":"Gradient5","Eyes":"Oval Glasses","Mouth":"Joint","Skin":"Tattoo","Wing":"Wing"},"attributes_array":[{"trait_type":"Background","value":"Gradient5"},{"trait_type":"Wing","value":"Wing"},{"trait_type":"Skin","value":"Tattoo"},{"trait_type":"Accessories","value":"Diamond Collar"},{"trait_type":"Mouth","value":"Joint"},{"trait_type":"Eyes","value":"Oval Glasses"}],"cached_image_uri":"https://monkelabs.nyc3.digitaloceanspaces.com/chill-dogs-club/images/c2311831806013353af8843eb900ed9f.png","creators":[{"address":"874siiZq4GedsKiwUyZ2UnckbzxMWTr8jTE7MNTdjALP","share":0,"verified":1},{"address":"Hz2XVrEbVFJw9UUWkp4WoikVd1N5aoao3sACJbvjTSR5","share":50,"verified":0},{"address":"Dftf9uRkTrfKcxk5rpnVzi5D9SxaphRXYsHqBTeWKPmM","share":45,"verified":0},{"address":"mnKzuL9RMtR6GeSHBfDpnQaefcMsiw7waoTSduKNiXM","share":5,"verified":0}],"description":"Chill Dogs Club is a collection of 6,666 NFTs Chillin & vibin & thrillin on the Solana Blockchain. Be part of the chill ass pack to dominate the world. Get all the perks we have, unlocked benefits, and stay HYDRATED as we take over the world.","files":[],"image_uri":"https://monkelabs.nyc3.digitaloceanspaces.com/chill-dogs-club/images/c2311831806013353af8843eb900ed9f.png","metadata_uri":"https://monkelabs.nyc3.digitaloceanspaces.com/chill-dogs-club/json/c2311831806013353af8843eb900ed9f.json","mint":"5vXwcwXVjqK4BdD8TjnfN32GUjzae5dLXTQoQ3wnXPkw","name":"Chill Dogs Club #636","owner":"5i1XCVR7AjBgfpuAV5sQahu4wVvZjCCQL7PQZ2vkD7cD","royalty":0.1,"symbol":"CDC","update_authority":"874siiZq4GedsKiwUyZ2UnckbzxMWTr8jTE7MNTdjALP"}] */
          result?: {
            attributes?: {
              /** @example "Weed" */
              Accessories?: string;
              /** @example "Peach" */
              Background?: string;
              /** @example "Black Sunglasses" */
              Eyes?: string;
              /** @example "Beanie" */
              Head?: string;
              /** @example "Joint" */
              Mouth?: string;
              /** @example "Pattern Shirt" */
              Outfit?: string;
              /** @example "Melted Rainbow" */
              Skin?: string;
              /** @example "Wing" */
              Wing?: string;
            };
            /** @example [{"trait_type":"Background","value":"Peach"},{"trait_type":"Skin","value":"Melted Rainbow"},{"trait_type":"Mouth","value":"Joint"},{"trait_type":"Eyes","value":"Black Sunglasses"},{"trait_type":"Head","value":"Beanie"}] */
            attributes_array?: {
              /** @example "Background" */
              trait_type?: string;
              /** @example "Peach" */
              value?: string;
            }[];
            /** @example "https://monkelabs.nyc3.digitaloceanspaces.com/chill-dogs-club/images/78d3eea143160b8b408f12e04fcf2d8b.png" */
            cached_image_uri?: string;
            /** @example [{"address":"874siiZq4GedsKiwUyZ2UnckbzxMWTr8jTE7MNTdjALP","share":0,"verified":1},{"address":"Hz2XVrEbVFJw9UUWkp4WoikVd1N5aoao3sACJbvjTSR5","share":50,"verified":0},{"address":"Dftf9uRkTrfKcxk5rpnVzi5D9SxaphRXYsHqBTeWKPmM","share":45,"verified":0},{"address":"mnKzuL9RMtR6GeSHBfDpnQaefcMsiw7waoTSduKNiXM","share":5,"verified":0}] */
            creators?: {
              /** @example "874siiZq4GedsKiwUyZ2UnckbzxMWTr8jTE7MNTdjALP" */
              address?: string;
              /** @example 0 */
              share?: number;
              /** @example 1 */
              verified?: number;
            }[];
            /** @example "Chill Dogs Club is a collection of 6,666 NFTs Chillin & vibin & thrillin on the Solana Blockchain. Be part of the chill ass pack to dominate the world. Get all the perks we have, unlocked benefits, and stay HYDRATED as we take over the world." */
            description?: string;
            /** @example [] */
            files?: any[];
            /** @example "https://monkelabs.nyc3.digitaloceanspaces.com/chill-dogs-club/images/78d3eea143160b8b408f12e04fcf2d8b.png" */
            image_uri?: string;
            /** @example "https://monkelabs.nyc3.digitaloceanspaces.com/chill-dogs-club/json/78d3eea143160b8b408f12e04fcf2d8b.json" */
            metadata_uri?: string;
            /** @example "Gb11ZEeygZ2fr3qpGKr6XKx4ENzD5JHtHUq2vo6LGwE1" */
            mint?: string;
            /** @example "Chill Dogs Club #1300" */
            name?: string;
            /** @example "5i1XCVR7AjBgfpuAV5sQahu4wVvZjCCQL7PQZ2vkD7cD" */
            owner?: string;
            /** @example 0.1 */
            royalty?: number;
            /** @example "CDC" */
            symbol?: string;
            /** @example "874siiZq4GedsKiwUyZ2UnckbzxMWTr8jTE7MNTdjALP" */
            update_authority?: string;
          }[];
          /** @example true */
          success?: boolean;
        },
        any
      >({
        path: `/nft/read_all`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * @description Get the properties, metadata and on-chain parameters of an already existing on-chian nft.
     *
     * @tags NFTs
     * @name ReadNft
     * @summary Read NFT
     * @request GET:/nft/read
     */
    readNft: (
      query?: {
        /** @example "mainnet-beta" */
        network?: string;
        /** @example "9M3FVED6hDob8zCTWy3ZHAMEsaT8J6rF3RHiPmuFYNDa" */
        token_address?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          /** @example "NFT metadata" */
          message?: string;
          result?: {
            attributes?: object;
            /** @example [] */
            attributes_array?: any[];
            /** @example "" */
            cached_image_uri?: string;
            /** @example [{"address":"46ZT7WzoW9iUuog5CApatYpuvrQ5B1Rbh3cG1ghdnBqD","share":0,"verified":1},{"address":"RRUMF9KYPcvNSmnicNMAFKx5wDYix3wjNa6bA7R6xqA","share":10,"verified":0},{"address":"3rzfGenxaRb96tRwLeTUjwgkoW7WZceeBUEGqLHcBiGi","share":30,"verified":0},{"address":"AvXAPcZWzd2He45sKh1UgtByeycx3KyLMVi3XPMdxHpZ","share":30,"verified":0},{"address":"AUwqqE5sNb8WwBNRHCr7ZzPZeGwMGCHBfqTZkM6BzCB5","share":30,"verified":0}] */
            creators?: {
              /** @example "46ZT7WzoW9iUuog5CApatYpuvrQ5B1Rbh3cG1ghdnBqD" */
              address?: string;
              /** @example 0 */
              share?: number;
              /** @example 1 */
              verified?: number;
            }[];
            /** @example "" */
            description?: string;
            /** @example [{"type":"image/png","uri":"https://bafybeidbn6wtidp2ndqe6wpzjftqdxcsaz6oprdnrpxarpizfssqnb3nci.ipfs.dweb.link/2947.png?ext=png"}] */
            files?: {
              /** @example "image/png" */
              type?: string;
              /** @example "https://bafybeidbn6wtidp2ndqe6wpzjftqdxcsaz6oprdnrpxarpizfssqnb3nci.ipfs.dweb.link/2947.png?ext=png" */
              uri?: string;
            }[];
            /** @example "" */
            image_uri?: string;
            /** @example "https://bafybeienvaho763k63zdria3xfml3t2qtpqb3vecpowkjs4wctekzejohy.ipfs.dweb.link/2947.json" */
            metadata_uri?: string;
            /** @example "HM7rAFv4ZczcNpddJh9TBgBFLBKpbGcdsaP8DpZzeA3t" */
            mint?: string;
            /** @example "Vanguards #2948" */
            name?: string;
            /** @example "79r4Jw78d5NifosapXiKUhZ4zbjjMBDP28SHSmBnHcM" */
            owner?: string;
            /** @example 8 */
            royalty?: number;
            /** @example "GUARD" */
            symbol?: string;
            /** @example "FRV6drYBfv5GDyYMzpxy9a3cJ5SNMKVwBm5sGehuhK6d" */
            update_authority?: string;
          };
          /** @example true */
          success?: boolean;
        },
        any
      >({
        path: `/nft/read`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),
  };
  storage = {
    /**
     * @description Upload and store file on IPFS decentralized data storage.
     *
     * @tags Storage
     * @name UploadImage
     * @summary Upload Image
     * @request POST:/storage/upload
     */
    uploadImage: (
      data: {
        /**
         * Image/video/document or any file that you want to upload and store on IPFS decentralized storage.
         * @format binary
         */
        file?: File;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          /** @example "File uploaded successfully" */
          message?: string;
          result?: {
            /** @example "bafkreihlunxuyqd6mbl632jxad52xeaxxtlq5nmgixoibtc5kg4ti27lmu" */
            cid?: string;
            /** @example "https://nftstorage.link/ipfs/bafkreihlunxuyqd6mbl632jxad52xeaxxtlq5nmgixoibtc5kg4ti27lmu" */
            uri?: string;
          };
          /** @example true */
          success?: boolean;
        },
        any
      >({
        path: `/storage/upload`,
        method: "POST",
        body: data,
        type: ContentType.FormData,
        format: "json",
        ...params,
      }),
  };
  token = {
    /**
     * @description Create Token
     *
     * @tags Fungible Tokens, Testing(Devnet/Testnet)
     * @name CreateToken
     * @summary Create Token
     * @request POST:/token/create
     */
    createToken: (
      data: {
        /**
         * token description, if any
         * @example "This is a test Token"
         */
        description?: string;
        /**
         * token representative image
         * @format binary
         */
        file?: File;
        /**
         * token name
         * @example "Super Saiyan"
         */
        name?: string;
        /**
         * solana blockchain environment (testnet/devnet/mainnet-beta)
         * @example "devnet"
         */
        network?: string;
        /**
         * wallets private key
         * @example "41zT4s2kNukmBNQWMFPSzo3VQbjhers5TP6tyvr3MjqvJAETMmQybZtRsRXPK1rdA1xBJruy4n58Zb1pNmoKy7y1"
         */
        private_key?: string;
        /**
         * token symbol
         * @example "SD"
         */
        symbol?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          /** @example "Token created successfully" */
          message?: string;
          result?: {
            /** @example "GbW8gGptmmdBWcxxoXPr86bUvgotds5QxNv3aWxhdJD" */
            token_address?: string;
            /** @example "2ikMrqeDtQsnmDQsGPNe4Sx29bzBxqfJYvHJzuoxF2cWkG3zktXpPFkuEriYep8ZRjdAtegPH7JU6595TtTbtfGv" */
            txhash?: string;
          };
          /** @example true */
          success?: boolean;
        },
        any
      >({
        path: `/token/create`,
        method: "POST",
        body: data,
        type: ContentType.FormData,
        format: "json",
        ...params,
      }),

    /**
     * @description Mint Token
     *
     * @tags Fungible Tokens, Testing(Devnet/Testnet)
     * @name MintToken
     * @summary Mint Token
     * @request POST:/token/mint
     */
    mintToken: (
      data: {
        /** @example 100 */
        amount?: number;
        /** @example "devnet" */
        network?: string;
        /** @example "41zT4s2kNukmBNQWMFPSzo3VQbjhers5TP6tyvr3MjqvJAETMmQybZtRsRXPK1rdA1xBJruy4n58Zb1pNmoKy7y1" */
        private_key?: string;
        /** @example "BvzKvn6nUUAYtKu2pH3h5SbUkUNcRPQawg4bURBiojJx" */
        receiver?: string;
        /** @example "4TLk2jocJuEysZubcMFCqsEFFu5jVGzTp14kAANDaEFv" */
        token_address?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          /** @example "Token minted successfully" */
          message?: string;
          result?: {
            /** @example "31iZYdmRWoic5A3GPBQGrWj9o7qGm8EA6v86kS4yJAqJmi8UWAgf68qGD628LNUtapHwMaVKjMwcMXQSKqBLo1sK" */
            txhash?: string;
          };
          /** @example true */
          success?: boolean;
        },
        any
      >({
        path: `/token/mint`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Burn Token
     *
     * @tags Fungible Tokens, Testing(Devnet/Testnet)
     * @name BurnToken
     * @summary Burn Token
     * @request DELETE:/token/burn
     */
    burnToken: (
      data: {
        /** @example 10 */
        amount?: number;
        /** @example "devnet" */
        network?: string;
        /** @example "2CayyFUNQd57iTHXh67FfNsamwUz6vGgcX7wAA2f5wMf3M4DKUUkLGozhJr4uDzXbF6261WKAtVUaNL7QQVDFTzx" */
        private_key?: string;
        /** @example "4TLk2jocJuEysZubcMFCqsEFFu5jVGzTp14kAANDaEFv" */
        token_address?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          /** @example "Token burned successfully" */
          message?: string;
          result?: {
            /** @example "3xnsCm1Fux1anpkuSbqXHzjEAJ8r1wWykCVQzXLnPMFQ8FKvwEG9RAfmCGZPVYQipXxrfA3FZFD2wvgMDUQNnu6W" */
            txhash?: string;
          };
          /** @example true */
          success?: boolean;
        },
        any
      >({
        path: `/token/burn`,
        method: "DELETE",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Transfer Token
     *
     * @tags Fungible Tokens, Testing(Devnet/Testnet)
     * @name TransferToken
     * @summary Transfer Token
     * @request POST:/token/transfer
     */
    transferToken: (
      data: {
        /** @example 100 */
        amount?: number;
        /** @example "2CayyFUNQd57iTHXh67FfNsamwUz6vGgcX7wAA2f5wMf3M4DKUUkLGozhJr4uDzXbF6261WKAtVUaNL7QQVDFTzx" */
        from_address?: string;
        /** @example "devnet" */
        network?: string;
        /** @example "97a3giHcGsk8YoEgWv4rP1ooWwJBgS72fpckZM6mQiFH" */
        to_address?: string;
        /** @example "7yPeRofJpfPkjLJ8CLB7czuk4sKG9toXWVq8CcHr4DcU" */
        token_address?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          /** @example "Token transfered successfully" */
          message?: string;
          result?: {
            /** @example "2TZGGpV7qXUPYNKmNyvZPZRvBprTpDqLbV9LkY1kxM44MhVLcyecisWPD5gJeyojkwUQ1JZenM4EjRGUJBSuXeZ7" */
            txId?: string;
          };
          /** @example true */
          success?: boolean;
        },
        any
      >({
        path: `/token/transfer`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Get Token Info
     *
     * @tags Fungible Tokens
     * @name GetTokenInfo
     * @summary Get Token Info
     * @request GET:/token/get_info
     */
    getTokenInfo: (
      query?: {
        /**
         * solana blockchain environment (testnet/devnet/mainnet-beta)
         * @example "devnet"
         */
        network?: SolanaBlockchainEnvironment;
        /**
         * token whose info you want
         * @example "7a7KrDuQQHET6HxfKwmjGCkt43s7BZM46nDrJNtctWgh"
         */
        token_address?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          /** @example "Tokens info" */
          message?: string;
          result?: {
            /** @example "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v" */
            address?: string;
            /** @example 5034999432.111212 */
            current_supply?: number;
            /** @example 6 */
            decimals?: number;
            /** @example "" */
            description?: string;
            /** @example "3sNBr7kMccME5D55xNgsmYpZnzPgP2g12CixAajXypn6" */
            freeze_authority?: string;
            /** @example "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png" */
            image?: string;
            /** @example "2wmVCSfPxGPjrnMMn7rchp4uaeoTqN39mXFC2zhPdri9" */
            mint_authority?: string;
            /** @example "USD Coin" */
            name?: string;
            /** @example "USDC" */
            symbol?: string;
          };
          /** @example true */
          success?: boolean;
        },
        any
      >({
        path: `/token/get_info`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * @description Create Token Detached
     *
     * @tags Fungible Tokens
     * @name CreateTokenDetached
     * @summary Create Token Detached
     * @request POST:/token/create_detach
     */
    createTokenDetached: (
      data: {
        /** @example "9" */
        decimals?: string;
        /** @example "This is a test token" */
        description?: string;
        /** @format binary */
        file?: File;
        /** @example "Shyft" */
        name?: string;
        /** @example "devnet" */
        network?: string;
        /** @example "SHY" */
        symbol?: string;
        /** @example "2fmz8SuNVyxEP6QwKQs6LNaT2ATszySPEJdhUDesxktc" */
        wallet?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/token/create_detach`,
        method: "POST",
        body: data,
        type: ContentType.FormData,
        ...params,
      }),

    /**
     * @description Mint Token Detached
     *
     * @tags Fungible Tokens
     * @name MintTokenDetached
     * @summary Mint Token Detached
     * @request POST:/token/mint_detach
     */
    mintTokenDetached: (
      data: {
        /** @example 10 */
        amount?: number;
        /** @example "devnet" */
        network?: string;
        /** @example "5GGZQpoiDPRJLwMonq4ovBBKbxvNq76L3zgMXyiQ5grbPzgF3k35dkHuWwt3GmwVGZBXywXteJcJ53Emsda92D5v" */
        private_key?: string;
        /** @example "5GGZQpoiDPRJLwMonq4ovBBKbxvNq76L3zgMXyiQ5grbPzgF3k35dkHuWwt3GmwVGZBXywXteJcJ53Emsda92D5v" */
        receiver?: string;
        /** @example "2upV85cDWrDRagDkFH7xezbQPwgAaQQS6CyMHFKqrUnq" */
        token_address?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/token/mint_detach`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description Burn Token Detached
     *
     * @tags Fungible Tokens
     * @name BurnTokenDetached
     * @summary Burn Token Detached
     * @request DELETE:/token/burn_detach
     */
    burnTokenDetached: (
      data: {
        /** @example 10 */
        amount?: number;
        /** @example "devnet" */
        network?: string;
        /** @example "HBE5dEcFHiJtU8vmTyx7MhB43nFRMJt8ddC8Lupc3Jph" */
        token_address?: string;
        /** @example "2fmz8SuNVyxEP6QwKQs6LNaT2ATszySPEJdhUDesxktc" */
        wallet?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/token/burn_detach`,
        method: "DELETE",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description Transfer Token Detached
     *
     * @tags Fungible Tokens
     * @name TransferTokenDetached
     * @summary Transfer Token Detached
     * @request POST:/token/transfer_detach
     */
    transferTokenDetached: (
      data: {
        /** @example 10 */
        amount?: number;
        /** @example "2fmz8SuNVyxEP6QwKQs6LNaT2ATszySPEJdhUDesxktc" */
        from_address?: string;
        /** @example "devnet" */
        network?: string;
        /** @example "BFefyp7jNF5Xq2A4JDLLFFGpxLq5oPEFKBAQ46KJHW2R" */
        to_address?: string;
        /** @example "2upV85cDWrDRagDkFH7xezbQPwgAaQQS6CyMHFKqrUnq" */
        token_address?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/token/transfer_detach`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),
  };
  marketplace = {
    /**
     * @description List
     *
     * @tags Marketplace, Listings
     * @name List
     * @summary List
     * @request POST:/marketplace/list
     * @secure
     */
    list: (
      data: {
        /** @example "5p4Bua5tSsSo1RJ94H1w5DiMSPfWcvMvnMVjPpZ6sJUb" */
        marketplace_address?: string;
        /** @example "devnet" */
        network?: string;
        /** @example "9A75AztajAwN9wTkg1BsC6xDEzC8pgjidtjnURQS5CZy" */
        nft_address?: string;
        /** @example 200 */
        price?: number;
        /** @example "AaYFExyZuMHbJHzjimKyQBAH1yfA9sKTxSzBc6Nr5X4s" */
        seller_wallet?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          /** @example "Listing transaction created successfully" */
          message?: string;
          result?: {
            /** @example "SD" */
            currency_symbol?: string;
            /** @example "AQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAkPjlCtsELWJl97h5yDtobRADXUyvXT9dlM1oxZPoaUeKgpllGmU5gB59zBiKHVbO8VeC6JBAmVdAve1TCQm79VVjhSiF+WfTTQLprZ++cPGcNMg8fd1Bb2uNwt+ZnRJ9HZOzf9oOsIrhnzGnwmmsXlbiQCzUHGNBMSUvwe19pOZJmBPxdjLzxMWA2dxD8ReB3LtFPWfjX1bDeFRziMOWg2W4m2fjngEDx4r40rWgWbsbLqB2Cbp5s7XiU8v5DTP0n0AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAjhSV9PmtVj5c6ltuYJZYN3YSarvxvJATg57nqEEIktEd8poSl+tLizGFN9/5gcQ5f+VDVA01ZfUfbnMjHpK2EyeELoVlWCYLzz5fir3Nbcqf9Gx2d8RF9cFc+TSeDElEKZZOGPLpGFWTq5BNzchVG6wFRyTCCdrvUrSocOkIQe/QkXpd1kxJfsVlBtsCpJgr0Q4vNEDVSkqQLBd+H9dUgBqfVFxh70WY12tQEVf3CwMEkxo8hVnWl27rLXwgAAAAGp9UXGSxcUSGMyUw9SvF/WNruCJuh/UTj29mKAAAAAAbd9uHXZaGT2cvhRs7reawctIXtX1s3kTqM9YV+/wCpOn1cWYdAqVoej66EIV2mORZptt6peUpDYdE3C6fgj/QCCgwABQcJCAEEAg4GCw0bM+aFpAF/g63///8A0O2QLgAAAAEAAAAAAAAACgUDAAYNDAnPayygS97DG/8=" */
            encoded_transaction?: string;
            /** @example "9hXPhRfAYsR9fYcuPcDS36wimTRthVVjmX9NKgxub65G" */
            list_state?: string;
            /** @example "5p4Bua5tSsSo1RJ94H1w5DiMSPfWcvMvnMVjPpZ6sJUb" */
            marketplace_address?: string;
            /** @example "devnet" */
            network?: string;
            /** @example "9A75AztajAwN9wTkg1BsC6xDEzC8pgjidtjnURQS5CZy" */
            nft_address?: string;
            /** @example 200 */
            price?: number;
            /** @example "AaYFExyZuMHbJHzjimKyQBAH1yfA9sKTxSzBc6Nr5X4s" */
            seller_address?: string;
          };
          /** @example true */
          success?: boolean;
        },
        any
      >({
        path: `/marketplace/list`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Buy
     *
     * @tags Marketplace, Listings
     * @name Buy
     * @summary Buy
     * @request POST:/marketplace/buy
     * @secure
     */
    buy: (
      data: {
        /** @example "GE4kh5FsCDWeJfqLsKx7zC9ijkqKpCuYQxh8FYBiTJe" */
        buyer_wallet?: string;
        /** @example "5p4Bua5tSsSo1RJ94H1w5DiMSPfWcvMvnMVjPpZ6sJUb" */
        marketplace_address?: string;
        /** @example "devnet" */
        network?: string;
        /** @example "9A75AztajAwN9wTkg1BsC6xDEzC8pgjidtjnURQS5CZy" */
        nft_address?: string;
        /** @example 200 */
        price?: number;
        /** @example "AaYFExyZuMHbJHzjimKyQBAH1yfA9sKTxSzBc6Nr5X4s" */
        seller_address?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          /** @example "Purchase transaction created successfully" */
          message?: string;
          result?: {
            /** @example "GE4kh5FsCDWeJfqLsKx7zC9ijkqKpCuYQxh8FYBiTJe" */
            buyer_address?: string;
            /** @example "SD" */
            currecy_symbol?: string;
            /** @example "AQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAwdA+Z8BRyNDL30G+lsh0lwSNNhbnN6HAnoyUtyAiN7Pg8WFKs1kLJcl7wBbIMEVU8U/cMUCZLX/CoF1Ih2qFhMLimWUaZTmAHn3MGIodVs7xV4LokECZV0C97VMJCbv1VWOFKIX5Z9NNAumtn75w8Zw0yDx93UFva43C35mdEn0dkznEeawQqhuNSNwrQimb8zSDgd0/SPgz0lk1Y+MdfErjs3/aDrCK4Z8xp8JprF5W4kAs1BxjQTElL8HtfaTmSZRrqwEsvjPmYXt1n916LP3p+OIyAJ8ZkRzOfYCb7P0C2BPxdjLzxMWA2dxD8ReB3LtFPWfjX1bDeFRziMOWg2W4LdCYEZgu7rLH2HrJGv06UkEnTPnUzVzAuloi6A5v1XjlCtsELWJl97h5yDtobRADXUyvXT9dlM1oxZPoaUeKiI/octVFO+d5ZKwvooTy93IHuPGaSZmXwsyI4QFmd2U4m2fjngEDx4r40rWgWbsbLqB2Cbp5s7XiU8v5DTP0n0qaC9BXeewP847v5fFL8noPMvrLJQo7L7c9BQP4A4vP+8Oj92SPA2oeL7kNdgl7p0fPSupZ6rtElv8lgkOZmG0LxlYRVhIUFbialSGLq4ZUqJwC7NGhTFtV6BSNxSTG0QvfngFps2Yh/VHAw+K/bqiprin/PLNsBdVlvYIfiHIFb3073n03t1tRvvaaZaroGXLTJ8D17ja1Aw5wtbUcOrXgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAI4UlfT5rVY+XOpbbmCWWDd2Emq78byQE4Oe56hBCJLQzUnvqkKk9xgLz7ESDXWhSKunzibV+8TTasl6JupSX/Ud8poSl+tLizGFN9/5gcQ5f+VDVA01ZfUfbnMjHpK2EeTKWl9RAfeeYvQ8jPvmPksbBnF9iTRGPlRAWC3qadxSMlyWPTiSJ8bs9ECkUjg2DC1oTmdr/EIQEjnvY2+n4WcnhC6FZVgmC88+X4q9zW3Kn/RsdnfERfXBXPk0ngxJRCmWThjy6RhVk6uQTc3IVRusBUckwgna71K0qHDpCEHv0JF6XdZMSX7FZQbbAqSYK9EOLzRA1UpKkCwXfh/XVIAan1RcYe9FmNdrUBFX9wsDBJMaPIVZ1pdu6y18IAAAABqfVFxksXFEhjMlMPUrxf1ja7gibof1E49vZigAAAAAG3fbh12Whk9nL4UbO63msHLSF7V9bN5E6jPWFfv8Aqb9NoZpoH0at0rCsksZDv02GdHRdNQVrvDeFIim9q2yABBgOAAgAEwsSBBcUAgEcERsaZgY9EgHa6+r//wDQ7ZAuAAAAAQAAAAAAAAAYBQoAERsaCV75WubvQETa/RgXAAkLFRITBAYNFxQCDAEHAxwRFhkbEA8bJUrZnU8xIwb///8A0O2QLgAAAAEAAAAAAAAAGAcOBQoAERsaCeOa+we0OGSP/w==" */
            encoded_transaction?: string;
            /** @example "5p4Bua5tSsSo1RJ94H1w5DiMSPfWcvMvnMVjPpZ6sJUb" */
            marketplace_address?: string;
            /** @example "devnet" */
            network?: string;
            /** @example "9A75AztajAwN9wTkg1BsC6xDEzC8pgjidtjnURQS5CZy" */
            nft_address?: string;
            /** @example 200 */
            price?: number;
            /** @example "DgRJqPFrdi4tuNMgq9kWk2v8YEc8YQR58ynY3C4ihCqu" */
            purchase_receipt?: string;
            /** @example "AaYFExyZuMHbJHzjimKyQBAH1yfA9sKTxSzBc6Nr5X4s" */
            seller_address?: string;
          };
          /** @example true */
          success?: boolean;
        },
        any
      >({
        path: `/marketplace/buy`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Unlist
     *
     * @tags Marketplace, Listings
     * @name Unlist
     * @summary Unlist
     * @request POST:/marketplace/unlist
     * @secure
     */
    unlist: (
      data: {
        /** @example "9hXPhRfAYsR9fYcuPcDS36wimTRthVVjmX9NKgxub65G" */
        list_state?: string;
        /** @example "5p4Bua5tSsSo1RJ94H1w5DiMSPfWcvMvnMVjPpZ6sJUb" */
        marketplace_address?: string;
        /** @example "devnet" */
        network?: string;
        /** @example "AaYFExyZuMHbJHzjimKyQBAH1yfA9sKTxSzBc6Nr5X4s" */
        seller_wallet?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          /** @example "NFT unlist transaction created successfully" */
          message?: string;
          result?: {
            /** @example "AQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAcMjlCtsELWJl97h5yDtobRADXUyvXT9dlM1oxZPoaUeKgpllGmU5gB59zBiKHVbO8VeC6JBAmVdAve1TCQm79VVjs3/aDrCK4Z8xp8JprF5W4kAs1BxjQTElL8HtfaTmSZgT8XYy88TFgNncQ/EXgdy7RT1n419Ww3hUc4jDloNluJtn454BA8eK+NK1oFm7Gy6gdgm6ebO14lPL+Q0z9J9AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAR3ymhKX60uLMYU33/mBxDl/5UNUDTVl9R9ucyMekrYR5MpaX1EB955i9DyM++Y+SxsGcX2JNEY+VEBYLepp3FMnhC6FZVgmC88+X4q9zW3Kn/RsdnfERfXBXPk0ngxJRCmWThjy6RhVk6uQTc3IVRusBUckwgna71K0qHDpCEHsGp9UXGHvRZjXa1ARV/cLAwSTGjyFWdaXbustfCAAAAAbd9uHXZaGT2cvhRs7reawctIXtX1s3kTqM9YV+/wCpct6pZAZ7i6ymjVspuneru5FxM8ljhIq99PwwQbFF5uwCCQgABAcIBgEDCxjo298p2+zcvgDQ7ZAuAAAAAQAAAAAAAAAJAwIFCgirO4p+9r1bCw==" */
            encoded_transaction?: string;
          };
          /** @example true */
          success?: boolean;
        },
        any
      >({
        path: `/marketplace/unlist`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Active Listings
     *
     * @tags Marketplace, Listings
     * @name ActiveListings
     * @summary Active Listings
     * @request GET:/marketplace/active_listings
     * @secure
     */
    activeListings: (
      data: any,
      query?: {
        /** @example "devnet" */
        network?: string;
        /** @example "8svcgCzGTT12h3uvDNR3BUY27hJvKtYdxcMKjEQzh14q" */
        marketplace_address?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          /** @example "active listing fetched successfully" */
          message?: string;
          /** @example [{"created_at":"2022-08-22T17:16:06.000Z","currency_symbol":"SD","list_state":"9xPa5TQyctvZ4vGkKcgEzT316JankshomR13dPLVN2nD","marketplace_address":"8svcgCzGTT12h3uvDNR3BUY27hJvKtYdxcMKjEQzh14q","network":"devnet","nft_address":"GpLzvmQYcQM3USH7RGehoriEzmJLJ8AfKVdLFZRoVBsz","price":100,"receipt":"FwEG6zTfM4mT9SaCMS61nswuJcfNDLEi2xn7T7gs4qRs","seller_address":"AaYFExyZuMHbJHzjimKyQBAH1yfA9sKTxSzBc6Nr5X4s"},{"created_at":"2022-08-22T17:20:17.000Z","currency_symbol":"SD","list_state":"8WM1Etk7fWraMshaAgYc6jBBKVAGsPwwRnNWyke9o5yN","marketplace_address":"8svcgCzGTT12h3uvDNR3BUY27hJvKtYdxcMKjEQzh14q","network":"devnet","nft_address":"5r2rJ37qUGYCqqHzvjBTjMBh4Pu2VD9wSiUnsky8UzYS","price":300,"receipt":"D9qHwezut8c7rmLkaGE1h1Yo3fVTp9EKYnLRDFjupyA3","seller_address":"GE4kh5FsCDWeJfqLsKx7zC9ijkqKpCuYQxh8FYBiTJe"}] */
          result?: {
            /** @example "2022-08-22T17:16:06.000Z" */
            created_at?: string;
            /** @example "SD" */
            currency_symbol?: string;
            /** @example "9xPa5TQyctvZ4vGkKcgEzT316JankshomR13dPLVN2nD" */
            list_state?: string;
            /** @example "8svcgCzGTT12h3uvDNR3BUY27hJvKtYdxcMKjEQzh14q" */
            marketplace_address?: string;
            /** @example "devnet" */
            network?: string;
            /** @example "GpLzvmQYcQM3USH7RGehoriEzmJLJ8AfKVdLFZRoVBsz" */
            nft_address?: string;
            /** @example 100 */
            price?: number;
            /** @example "FwEG6zTfM4mT9SaCMS61nswuJcfNDLEi2xn7T7gs4qRs" */
            receipt?: string;
            /** @example "AaYFExyZuMHbJHzjimKyQBAH1yfA9sKTxSzBc6Nr5X4s" */
            seller_address?: string;
          }[];
          /** @example true */
          success?: boolean;
        },
        any
      >({
        path: `/marketplace/active_listings`,
        method: "GET",
        query: query,
        body: data,
        secure: true,
        type: ContentType.Text,
        format: "json",
        ...params,
      }),

    /**
     * @description Get Listing Details
     *
     * @tags Marketplace, Listings
     * @name GetListingDetails
     * @summary Get Listing Details
     * @request GET:/marketplace/list_details
     * @secure
     */
    getListingDetails: (
      query?: {
        /** @example "devnet" */
        network?: string;
        /** @example "8svcgCzGTT12h3uvDNR3BUY27hJvKtYdxcMKjEQzh14q" */
        marketplace_address?: string;
        /** @example "BMv5StFwfJsXmMmehYATuytfhkmANvfhUHpu6YQHF1pX" */
        list_state?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          /** @example "listing details fetched successfully" */
          message?: string;
          result?: {
            /** @example "2022-08-22T17:40:37.000Z" */
            cancelled_at?: string;
            /** @example "2022-08-22T17:40:02.000Z" */
            created_at?: string;
            /** @example "SD" */
            currency_symbol?: string;
            /** @example "8WM1Etk7fWraMshaAgYc6jBBKVAGsPwwRnNWyke9o5yN" */
            list_state?: string;
            /** @example "8svcgCzGTT12h3uvDNR3BUY27hJvKtYdxcMKjEQzh14q" */
            marketplace_address?: string;
            /** @example "devnet" */
            network?: string;
            /** @example "5r2rJ37qUGYCqqHzvjBTjMBh4Pu2VD9wSiUnsky8UzYS" */
            nft_address?: string;
            /** @example 300 */
            price?: number;
            /** @example "D9qHwezut8c7rmLkaGE1h1Yo3fVTp9EKYnLRDFjupyA3" */
            receipt?: string;
            /** @example "GE4kh5FsCDWeJfqLsKx7zC9ijkqKpCuYQxh8FYBiTJe" */
            seller_address?: string;
          };
          /** @example true */
          success?: boolean;
        },
        any
      >({
        path: `/marketplace/list_details`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Seller Listings
     *
     * @tags Marketplace, Listings
     * @name SellerListings
     * @summary Seller Listings
     * @request GET:/marketplace/seller_listings
     * @secure
     */
    sellerListings: (
      query?: {
        /** @example "devnet" */
        network?: string;
        /** @example "8svcgCzGTT12h3uvDNR3BUY27hJvKtYdxcMKjEQzh14q" */
        marketplace_address?: string;
        /** @example "AaYFExyZuMHbJHzjimKyQBAH1yfA9sKTxSzBc6Nr5X4s" */
        seller_address?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          /** @example "all seller listings fetched successfully" */
          message?: string;
          /** @example [{"cancelled_at":"2022-08-22T17:16:06.000Z","created_at":"2022-08-22T17:16:06.000Z","currency_symbol":"SD","list_state":"9xPa5TQyctvZ4vGkKcgEzT316JankshomR13dPLVN2nD","marketplace_address":"8svcgCzGTT12h3uvDNR3BUY27hJvKtYdxcMKjEQzh14q","network":"devnet","nft_address":"GpLzvmQYcQM3USH7RGehoriEzmJLJ8AfKVdLFZRoVBsz","price":100,"receipt":"FwEG6zTfM4mT9SaCMS61nswuJcfNDLEi2xn7T7gs4qRs","seller_address":"AaYFExyZuMHbJHzjimKyQBAH1yfA9sKTxSzBc6Nr5X4s"},{"created_at":"2022-08-22T17:43:27.000Z","currency_symbol":"SD","list_state":"C2JWsZ2G8qaJ5jXo3GnQHASG7mp3P2hPTBT9t4t7w2Ui","marketplace_address":"8svcgCzGTT12h3uvDNR3BUY27hJvKtYdxcMKjEQzh14q","network":"devnet","nft_address":"GpLzvmQYcQM3USH7RGehoriEzmJLJ8AfKVdLFZRoVBsz","price":300,"purchased_at":"2022-08-22T17:59:08.000Z","receipt":"4kx9aNZy1Jacwwzah3jV9mx1HLy52qz9a2b8EbjbQSWm","seller_address":"AaYFExyZuMHbJHzjimKyQBAH1yfA9sKTxSzBc6Nr5X4s"},{"created_at":"2022-08-22T17:52:08.000Z","currency_symbol":"SD","list_state":"6ZpfzfbPXTjvxDVFBjEG9nGy2ucq7rs9prr3URCpozkK","marketplace_address":"8svcgCzGTT12h3uvDNR3BUY27hJvKtYdxcMKjEQzh14q","network":"devnet","nft_address":"7vuJXdVxJpztB4zdQiVYMCNgNe5JTJsdoVux6RoFLxB8","price":100,"purchased_at":"2022-08-22T17:59:08.000Z","receipt":"2XAkVVJbq3RvpCGBiPABRwiNHi9Q5Ckj29h5g4Gop85m","seller_address":"AaYFExyZuMHbJHzjimKyQBAH1yfA9sKTxSzBc6Nr5X4s"},{"buyer_address":"GE4kh5FsCDWeJfqLsKx7zC9ijkqKpCuYQxh8FYBiTJe","created_at":"2022-08-22T17:58:24.000Z","currency_symbol":"SD","list_state":"GvY8fytxoEftwBDhkJ8VLBFN2iHK6aiHoDXHYejinL9d","marketplace_address":"8svcgCzGTT12h3uvDNR3BUY27hJvKtYdxcMKjEQzh14q","network":"devnet","nft_address":"B6wQuXUXkKZu5n3WEfDfdRQKNUpdwstUUErJsb1wmXB","price":100,"purchase_receipt":"8g1BveFpxf2p7JNLwNQAZBWGXSPdK8Y2NHVVpfNDLpaF","purchased_at":"2022-08-22T17:59:08.000Z","receipt":"HfRsreZ8Mem5RPsx8B1Tp13vuadLEKvUQ9vzRLTZfoc8","seller_address":"AaYFExyZuMHbJHzjimKyQBAH1yfA9sKTxSzBc6Nr5X4s"}] */
          result?: {
            /** @example "GE4kh5FsCDWeJfqLsKx7zC9ijkqKpCuYQxh8FYBiTJe" */
            buyer_address?: string;
            /** @example "2022-08-22T17:16:06.000Z" */
            cancelled_at?: string;
            /** @example "2022-08-22T17:16:06.000Z" */
            created_at?: string;
            /** @example "SD" */
            currency_symbol?: string;
            /** @example "9xPa5TQyctvZ4vGkKcgEzT316JankshomR13dPLVN2nD" */
            list_state?: string;
            /** @example "8svcgCzGTT12h3uvDNR3BUY27hJvKtYdxcMKjEQzh14q" */
            marketplace_address?: string;
            /** @example "devnet" */
            network?: string;
            /** @example "GpLzvmQYcQM3USH7RGehoriEzmJLJ8AfKVdLFZRoVBsz" */
            nft_address?: string;
            /** @example 100 */
            price?: number;
            /** @example "8g1BveFpxf2p7JNLwNQAZBWGXSPdK8Y2NHVVpfNDLpaF" */
            purchase_receipt?: string;
            /** @example "2022-08-22T17:59:08.000Z" */
            purchased_at?: string;
            /** @example "FwEG6zTfM4mT9SaCMS61nswuJcfNDLEi2xn7T7gs4qRs" */
            receipt?: string;
            /** @example "AaYFExyZuMHbJHzjimKyQBAH1yfA9sKTxSzBc6Nr5X4s" */
            seller_address?: string;
          }[];
          /** @example true */
          success?: boolean;
        },
        any
      >({
        path: `/marketplace/seller_listings`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Active Sellers
     *
     * @tags Marketplace, Listings
     * @name ActiveSellers
     * @summary Active Sellers
     * @request GET:/marketplace/active_sellers
     * @secure
     */
    activeSellers: (
      query?: {
        /** @example "devnet" */
        network?: string;
        /** @example "7b2dSy4F26A6WweKgdmXzyi5FhhN5AqhuXAQHYcaXfqW" */
        marketplace_address?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          /** @example "active listing fetched successfully" */
          message?: string;
          /** @example ["97a3giHcGsk8YoEgWv4rP1ooWwJBgS72fpckZM6mQiFH","EijtaNNHqqaPmWwAmUi8f1TC6gSPnqkoodQd2BLFpA8T","GE4kh5FsCDWeJfqLsKx7zC9ijkqKpCuYQxh8FYBiTJe","AaYFExyZuMHbJHzjimKyQBAH1yfA9sKTxSzBc6Nr5X4s"] */
          result?: string[];
          /** @example true */
          success?: boolean;
        },
        any
      >({
        path: `/marketplace/active_sellers`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Order History
     *
     * @tags Marketplace, Listings
     * @name OrderHistory
     * @summary Order History
     * @request GET:/marketplace/buy_history
     * @secure
     */
    orderHistory: (
      query?: {
        /** @example "devnet" */
        network?: string;
        /** @example "8svcgCzGTT12h3uvDNR3BUY27hJvKtYdxcMKjEQzh14q" */
        marketplace_address?: string;
        /** @example "GE4kh5FsCDWeJfqLsKx7zC9ijkqKpCuYQxh8FYBiTJe" */
        buyer_address?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          /** @example "order history fetched successfully" */
          message?: string;
          /** @example [{"buyer_address":"AaYFExyZuMHbJHzjimKyQBAH1yfA9sKTxSzBc6Nr5X4s","created_at":"2022-08-17T04:36:16.094Z","marketplace_address":"7b2dSy4F26A6WweKgdmXzyi5FhhN5AqhuXAQHYcaXfqW","network":"devnet","nft_address":"DcxcgowdRg2bXFP4CcgFMaeppYY7GFquNhbZ5RwTVz3L","price":1,"seller_address":"GE4kh5FsCDWeJfqLsKx7zC9ijkqKpCuYQxh8FYBiTJe"}] */
          result?: {
            /** @example "AaYFExyZuMHbJHzjimKyQBAH1yfA9sKTxSzBc6Nr5X4s" */
            buyer_address?: string;
            /** @example "2022-08-17T04:36:16.094Z" */
            created_at?: string;
            /** @example "7b2dSy4F26A6WweKgdmXzyi5FhhN5AqhuXAQHYcaXfqW" */
            marketplace_address?: string;
            /** @example "devnet" */
            network?: string;
            /** @example "DcxcgowdRg2bXFP4CcgFMaeppYY7GFquNhbZ5RwTVz3L" */
            nft_address?: string;
            /** @example 1 */
            price?: number;
            /** @example "GE4kh5FsCDWeJfqLsKx7zC9ijkqKpCuYQxh8FYBiTJe" */
            seller_address?: string;
          }[];
          /** @example true */
          success?: boolean;
        },
        any
      >({
        path: `/marketplace/buy_history`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Create Marketplace
     *
     * @tags Marketplace
     * @name CreateMarketplace
     * @summary Create Marketplace
     * @request POST:/marketplace/create
     * @secure
     */
    createMarketplace: (
      data: {
        /** @example "Eb3ykuiCtvGcqs4XRCASThFf4EUxrL7k3TZsytWkXTBe" */
        creator_wallet?: string;
        /** @example "4TLk2jocJuEysZubcMFCqsEFFu5jVGzTp14kAANDaEFv" */
        currency_address?: string;
        /** @example "EijtaNNHqqaPmWwAmUi8f1TC6gSPnqkoodQd2BLFpA8T" */
        fee_payer?: string;
        /** @example "Eb3ykuiCtvGcqs4XRCASThFf4EUxrL7k3TZsytWkXTBe" */
        fee_recipient?: string;
        /** @example "devnet" */
        network?: string;
        /** @example 10 */
        transaction_fee?: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          /** @example "Create marketplace transaction generated successfully" */
          message?: string;
          result?: {
            /** @example "5p4Bua5tSsSo1RJ94H1w5DiMSPfWcvMvnMVjPpZ6sJUb" */
            address?: string;
            /** @example "Eb3ykuiCtvGcqs4XRCASThFf4EUxrL7k3TZsytWkXTBe" */
            authority?: string;
            /** @example "Eb3ykuiCtvGcqs4XRCASThFf4EUxrL7k3TZsytWkXTBe" */
            creator?: string;
            /** @example "4TLk2jocJuEysZubcMFCqsEFFu5jVGzTp14kAANDaEFv" */
            currency_address?: string;
            /** @example "SD" */
            currency_symbol?: string;
            /** @example "AQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAYMyeELoVlWCYLzz5fir3Nbcqf9Gx2d8RF9cFc+TSeDElEpllGmU5gB59zBiKHVbO8VeC6JBAmVdAve1TCQm79VVkd8poSl+tLizGFN9/5gcQ5f+VDVA01ZfUfbnMjHpK2EqaC9BXeewP847v5fFL8noPMvrLJQo7L7c9BQP4A4vP/L2Tz8ECwUGHyaWuUik2ukTTolCWNP5F9oXvoxjPoaDMgxpny4OsTYbvTQ5jbV54cdGa8QasHaArFAWj/qdQoYAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAzUnvqkKk9xgLz7ESDXWhSKunzibV+8TTasl6JupSX/YyXJY9OJInxuz0QKRSODYMLWhOZ2v8QhASOe9jb6fhZCmWThjy6RhVk6uQTc3IVRusBUckwgna71K0qHDpCEHsGp9UXGSxcUSGMyUw9SvF/WNruCJuh/UTj29mKAAAAAAbd9uHXZaGT2cvhRs7reawctIXtX1s3kTqM9YV+/wCpxFDDStIysCI9d4yBvF+7gZtZzrXRFHSvxMY69iXWIy0BCQ0HAAAEBQACAQMLBggKD91C8p/5zobx//z76AMAAA==" */
            encoded_transaction?: string;
            /** @example "EijtaNNHqqaPmWwAmUi8f1TC6gSPnqkoodQd2BLFpA8T" */
            fee_payer?: string;
            /** @example "Eb3ykuiCtvGcqs4XRCASThFf4EUxrL7k3TZsytWkXTBe" */
            fee_recipient?: string;
            /** @example "devnet" */
            network?: string;
            /** @example 10 */
            transaction_fee?: number;
            /** @example "EUUT8hfgak2YKcW41HoNWeiTuARv33fwRPn416enRxsR" */
            treasury_address?: string;
          };
          /** @example true */
          success?: boolean;
        },
        any
      >({
        path: `/marketplace/create`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Update Marketplace
     *
     * @tags Marketplace
     * @name UpdateMarketplace
     * @summary Update Marketplace
     * @request POST:/marketplace/update
     * @secure
     */
    updateMarketplace: (
      data: {
        /** @example "Eb3ykuiCtvGcqs4XRCASThFf4EUxrL7k3TZsytWkXTBe" */
        authority_wallet?: string;
        /** @example "Eb3ykuiCtvGcqs4XRCASThFf4EUxrL7k3TZsytWkXTBe" */
        fee_recipient?: string;
        /** @example "5p4Bua5tSsSo1RJ94H1w5DiMSPfWcvMvnMVjPpZ6sJUb" */
        marketplace_address?: string;
        /** @example "devnet" */
        network?: string;
        /** @example 1 */
        transaction_fee?: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          /** @example "Update marketplace transaction generated successfully" */
          message?: string;
          result?: {
            /** @example "5p4Bua5tSsSo1RJ94H1w5DiMSPfWcvMvnMVjPpZ6sJUb" */
            address?: string;
            /** @example "Eb3ykuiCtvGcqs4XRCASThFf4EUxrL7k3TZsytWkXTBe" */
            authority?: string;
            /** @example "4TLk2jocJuEysZubcMFCqsEFFu5jVGzTp14kAANDaEFv" */
            currency_address?: string;
            /** @example "AQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAYKyeELoVlWCYLzz5fir3Nbcqf9Gx2d8RF9cFc+TSeDElFHfKaEpfrS4sxhTff+YHEOX/lQ1QNNWX1H25zIx6SthMvZPPwQLBQYfJpa5SKTa6RNOiUJY0/kX2he+jGM+hoMyDGmfLg6xNhu9NDmNtXnhx0ZrxBqwdoCsUBaP+p1ChgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADNSe+qQqT3GAvPsRINdaFIq6fOJtX7xNNqyXom6lJf9jJclj04kifG7PRApFI4NgwtaE5na/xCEBI572Nvp+FkKZZOGPLpGFWTq5BNzchVG6wFRyTCCdrvUrSocOkIQewan1RcZLFxRIYzJTD1K8X9Y2u4Im6H9ROPb2YoAAAAABt324ddloZPZy+FGzut5rBy0he1fWzeROoz1hX7/AKlFm2epCAheuIsvp1L68IUwsnWOR4qVB8/IaIlflC8D5wEHDAUAAAACAwABCQQGCA1U1wKs8QD12wFkAAAA" */
            encoded_transaction?: string;
            /** @example "EijtaNNHqqaPmWwAmUi8f1TC6gSPnqkoodQd2BLFpA8T" */
            fee_payer?: string;
            /** @example "EUUT8hfgak2YKcW41HoNWeiTuARv33fwRPn416enRxsR" */
            fee_recipient_account?: string;
            /** @example "devnet" */
            network?: string;
            /** @example 1 */
            transaction_fee?: number;
            /** @example "CRA4Qd6H4tisWLCENT7pzaRbURcKwZTToDnGHTezRxBG" */
            treasury_address?: string;
          };
          /** @example true */
          success?: boolean;
        },
        any
      >({
        path: `/marketplace/update`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Withdraw Fees
     *
     * @tags Marketplace
     * @name WithdrawFees
     * @summary Withdraw Fees
     * @request POST:/marketplace/withdraw_fee
     * @secure
     */
    withdrawFees: (
      data: {
        /** @example 1 */
        amount?: number;
        /** @example "Eb3ykuiCtvGcqs4XRCASThFf4EUxrL7k3TZsytWkXTBe" */
        authority_wallet?: string;
        /** @example "5p4Bua5tSsSo1RJ94H1w5DiMSPfWcvMvnMVjPpZ6sJUb" */
        marketplace_address?: string;
        /** @example "devnet" */
        network?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          /** @example "Fee withdrawl transaction created successfully" */
          message?: string;
          result?: {
            /** @example 1 */
            amount?: number;
            /** @example "AQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAQIyeELoVlWCYLzz5fir3Nbcqf9Gx2d8RF9cFc+TSeDElFHfKaEpfrS4sxhTff+YHEOX/lQ1QNNWX1H25zIx6SthKmgvQV3nsD/OO7+XxS/J6DzL6yyUKOy+3PQUD+AOLz/yDGmfLg6xNhu9NDmNtXnhx0ZrxBqwdoCsUBaP+p1ChgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADNSe+qQqT3GAvPsRINdaFIq6fOJtX7xNNqyXom6lJf9CmWThjy6RhVk6uQTc3IVRusBUckwgna71K0qHDpCEHsG3fbh12Whk9nL4UbO63msHLSF7V9bN5E6jPWFfv8AqaMKy0fh8oHtamtDl4kF1O2PHC5CeU8uf1uHup73YnvsAQYHBQADAgEHBBAApFZMOEgMqgDKmjsAAAAA" */
            encoded_transaction?: string;
            /** @example "CRA4Qd6H4tisWLCENT7pzaRbURcKwZTToDnGHTezRxBG" */
            from?: string;
            /** @example "EUUT8hfgak2YKcW41HoNWeiTuARv33fwRPn416enRxsR" */
            to?: string;
          };
          /** @example true */
          success?: boolean;
        },
        any
      >({
        path: `/marketplace/withdraw_fee`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Find Marketplace
     *
     * @tags Marketplace
     * @name FindMarketplace
     * @summary Find Marketplace
     * @request GET:/marketplace/find
     * @secure
     */
    findMarketplace: (
      query?: {
        /** @example "devnet" */
        network?: string;
        /** @example "HFiyiUWFxmyKgBwCZ5ay9MYG4AajRDAJBiyRxYqM9JC" */
        creator_address?: string;
        /** @example "So11111111111111111111111111111111111111112" */
        currency_address?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          /** @example "Marketplace found successfully" */
          message?: string;
          result?: {
            /** @example "BfHZdoZmuoS6QoK1PTF5Z5n8waxdqfCoPLzMJ6M3FVQx" */
            address?: string;
            /** @example "AaYFExyZuMHbJHzjimKyQBAH1yfA9sKTxSzBc6Nr5X4s" */
            authority?: string;
            /** @example "AaYFExyZuMHbJHzjimKyQBAH1yfA9sKTxSzBc6Nr5X4s" */
            creator?: string;
            /** @example "So11111111111111111111111111111111111111112" */
            currency_address?: string;
            /** @example "SOL" */
            currency_symbol?: string;
            /** @example "AaYFExyZuMHbJHzjimKyQBAH1yfA9sKTxSzBc6Nr5X4s" */
            fee_payer?: string;
            /** @example "AaYFExyZuMHbJHzjimKyQBAH1yfA9sKTxSzBc6Nr5X4s" */
            fee_recipient_account?: string;
            /** @example "devnet" */
            network?: string;
            /** @example 0.1 */
            transaction_fee?: number;
            /** @example "BnAj7BSTb1MrvuVmEvWxKh2Ur5wMiE1T17MtXDdRxbLa" */
            treasury_address?: string;
          };
          /** @example true */
          success?: boolean;
        },
        any
      >({
        path: `/marketplace/find`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Get Markets
     *
     * @tags Marketplace
     * @name GetMarkets
     * @summary Get Markets
     * @request GET:/marketplace/my_markets
     * @secure
     */
    getMarkets: (
      query?: {
        /** @example "devnet" */
        network?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          /** @example "Marketplaces fetched successfully" */
          message?: string;
          /** @example [{"address":"8VE6di1XAyb46NMz1T4r5fSZExqZkDP8jmCYQ8s5QJBU","authority":"HFiyiUWFxmyKgBwCZ5ay9MYG4AajRDAJBiyRxYqM9JC","created_at":"2022-08-18T07:00:21.773Z","creator":"HFiyiUWFxmyKgBwCZ5ay9MYG4AajRDAJBiyRxYqM9JC","currency_address":"4TLk2jocJuEysZubcMFCqsEFFu5jVGzTp14kAANDaEFv","currency_symbol":"SD","fee_payer":"HFiyiUWFxmyKgBwCZ5ay9MYG4AajRDAJBiyRxYqM9JC","fee_receipient":"4nhpcksnKrPANftwGpNBgfkVA6cocK6pcCQm2fCxNKf1","network":"devnet","transaction_fee":20,"updated_at":"2022-08-22T15:20:10.851Z"},{"address":"DBjXX7k4uZ2X4Fdp8w9T7zsKYGLN6dJuRAu7oQPJUxtC","authority":"HFiyiUWFxmyKgBwCZ5ay9MYG4AajRDAJBiyRxYqM9JC","created_at":"2022-08-18T07:30:06.624Z","creator":"HFiyiUWFxmyKgBwCZ5ay9MYG4AajRDAJBiyRxYqM9JC","currency_address":"22MxhzHTv3TkeUSv67KKPwud6UnSdKpahosmzJekh4rp","currency_symbol":"Cf","fee_payer":"HFiyiUWFxmyKgBwCZ5ay9MYG4AajRDAJBiyRxYqM9JC","fee_receipient":"5jxWhMYUjRupnzkraxWny6Vju9iHySTVRxHRowyU5hoe","network":"devnet","transaction_fee":20,"updated_at":"2022-08-22T15:18:52.580Z"},{"address":"8DPSUU8NBFJinJRwBtdcJwi1xncaGncJszh561xx5LkM","authority":"HFiyiUWFxmyKgBwCZ5ay9MYG4AajRDAJBiyRxYqM9JC","created_at":"2022-08-22T14:57:34.974Z","creator":"HFiyiUWFxmyKgBwCZ5ay9MYG4AajRDAJBiyRxYqM9JC","currency_address":"fMeYB3g4ppGbskqpad4X2f85qQeufUSqNVd1djWdHEy","currency_symbol":"VG","fee_payer":"HFiyiUWFxmyKgBwCZ5ay9MYG4AajRDAJBiyRxYqM9JC","fee_receipient":"8hERWBX8aMKnQ4t5Waw18PeGrGbmK8UrvnVyuanngjY1","network":"devnet","transaction_fee":20,"updated_at":"2022-08-22T15:14:53.128Z"}] */
          result?: {
            /** @example "8VE6di1XAyb46NMz1T4r5fSZExqZkDP8jmCYQ8s5QJBU" */
            address?: string;
            /** @example "HFiyiUWFxmyKgBwCZ5ay9MYG4AajRDAJBiyRxYqM9JC" */
            authority?: string;
            /** @example "2022-08-18T07:00:21.773Z" */
            created_at?: string;
            /** @example "HFiyiUWFxmyKgBwCZ5ay9MYG4AajRDAJBiyRxYqM9JC" */
            creator?: string;
            /** @example "4TLk2jocJuEysZubcMFCqsEFFu5jVGzTp14kAANDaEFv" */
            currency_address?: string;
            /** @example "SD" */
            currency_symbol?: string;
            /** @example "HFiyiUWFxmyKgBwCZ5ay9MYG4AajRDAJBiyRxYqM9JC" */
            fee_payer?: string;
            /** @example "4nhpcksnKrPANftwGpNBgfkVA6cocK6pcCQm2fCxNKf1" */
            fee_receipient?: string;
            /** @example "devnet" */
            network?: string;
            /** @example 20 */
            transaction_fee?: number;
            /** @example "2022-08-22T15:20:10.851Z" */
            updated_at?: string;
          }[];
          /** @example true */
          success?: boolean;
        },
        any
      >({
        path: `/marketplace/my_markets`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Treasury Balance
     *
     * @tags Marketplace
     * @name TreasuryBalance
     * @summary Treasury Balance
     * @request GET:/marketplace/treasury_balance
     * @secure
     */
    treasuryBalance: (
      query?: {
        /** @example "devnet" */
        network?: string;
        /** @example "BnAj7BSTb1MrvuVmEvWxKh2Ur5wMiE1T17MtXDdRxbLa" */
        marketplace_address?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          /** @example "treasury balance fetched successfully" */
          message?: string;
          result?: {
            /** @example 160 */
            amount?: number;
            /** @example "SD" */
            symbol?: string;
          };
          /** @example true */
          success?: boolean;
        },
        any
      >({
        path: `/marketplace/treasury_balance`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Marketplace stats
     *
     * @tags Marketplace
     * @name MarketplaceStats
     * @summary Marketplace stats
     * @request GET:/marketplace/stats
     * @secure
     */
    marketplaceStats: (
      query?: {
        /** @example "devnet" */
        network?: string;
        /** @example "5LSMwR5GLr4WjDHS5FoUXQCN5osZYHRoDGjmcEsS843B" */
        marketplace_address?: string;
        /** @example "2022-09-02" */
        start_date?: string;
        /** @example "2022-09-06" */
        end_date?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          /** @example "Marketplace stats fetched successfully" */
          message?: string;
          result?: {
            /** @example 0.2 */
            listed_volume?: number;
            /** @example 0.1 */
            sales_volume?: number;
            /** @example 2 */
            total_listings?: number;
            /** @example 1 */
            total_sales?: number;
            /** @example 1 */
            total_sellers?: number;
          };
          /** @example true */
          success?: boolean;
        },
        any
      >({
        path: `/marketplace/stats`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),
  };
  getApiKey = {
    /**
     * @description This is the first API that you need to use and generate the `x-api-key`, used in the header for authentication of other api calls in this collection.
     *
     * @name GetApiKey
     * @summary Get API Key
     * @request POST:/get_api_key
     */
    getApiKey: (
      data: {
        /** @example "vishesh@shyft.to" */
        email?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          /** @example "API key sent successfully to your email." */
          message?: string;
          /** @example true */
          success?: boolean;
        },
        any
      >({
        path: `/get_api_key`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
  };
}
