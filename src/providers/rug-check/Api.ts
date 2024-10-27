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

export interface DtoAuthMessage {
  message?: string;
  publicKey?: string;
  timestamp?: number;
}

export interface DtoAuthRequest {
  message?: DtoAuthMessage;
  signature?: {
    data?: number[];
    type?: string;
  };
  wallet?: string;
}

export interface DtoAuthResponse {
  token?: string;
}

export interface DtoDomainResponse {
  tokens?: RugcheckApiVerifiedTokenSimple;
}

export interface DtoPong {
  message?: string;
}

export interface DtoTokenInfoAgg {
  metadata?: RugcheckApiTokenMetadata;
  mint?: string;
  score?: number;
  user_visits?: number;
  visits?: number;
}

export interface DtoVaultResponse {
  lockers?: Record<string, RugcheckApiLocker>;
  total?: DtoVaultResponseSummary;
}

export interface DtoVaultResponseSummary {
  pct?: number;
  totalUSDC?: number;
}

export interface DtoVoteRequest {
  mint?: string;
  side?: boolean;
}

export interface DtoVoteResponse {
  down?: number;
  up?: number;
  userVoted?: boolean;
}

export interface RugcheckApiFileMetadata {
  description?: string;
  image?: string;
  name?: string;
  symbol?: string;
}

export interface RugcheckApiKnownAccount {
  name?: string;
  type?: string;
}

export interface RugcheckApiLocker {
  owner?: string;
  programID?: string;
  tokenAccount?: string;
  type?: string;
  unlockDate?: number;
  uri?: string;
  usdcLocked?: number;
}

export interface RugcheckApiMarket {
  liquidityA?: string;
  liquidityAAccount?: string;
  liquidityB?: string;
  liquidityBAccount?: string;
  lp?: RugcheckApiMarketLP;
  marketType?: string;
  mintA?: string;
  mintAAccount?: string;
  mintB?: string;
  mintBAccount?: string;
  mintLP?: string;
  mintLPAccount?: string;
  pubkey?: string;
}

export interface RugcheckApiMarketLP {
  base?: number;
  baseMint?: string;
  basePrice?: number;
  baseUSD?: number;
  currentSupply?: number;
  holders?: RugcheckApiTokenHolder[];
  lpCurrentSupply?: number;
  lpLocked?: number;
  lpLockedPct?: number;
  lpLockedUSD?: number;
  lpMaxSupply?: number;
  lpMint?: string;
  lpTotalSupply?: number;
  lpUnlocked?: number;
  pctReserve?: number;
  pctSupply?: number;
  quote?: number;
  quoteMint?: string;
  quotePrice?: number;
  quoteUSD?: number;
  reserveSupply?: number;
  tokenSupply?: number;
  totalTokensUnlocked?: number;
}

export interface RugcheckApiRisk {
  description?: string;
  level?: string;
  name?: string;
  score?: number;
  value?: string;
}

export interface RugcheckApiToken {
  createAt?: string;
  creator?: string;
  decimals?: number;
  events?: RugcheckApiTokenEvent[];
  freezeAuthority?: string;
  mint?: string;
  mintAuthority?: string;
  program?: string;
  symbol?: string;
  updatedAt?: string;
}

export interface RugcheckApiTokenCheck {
  creator?: string;
  detectedAt?: string;
  events?: RugcheckApiTokenEvent[];
  fileMeta?: RugcheckApiFileMetadata;
  freezeAuthority?: string;
  knownAccounts?: Record<string, RugcheckApiKnownAccount>;
  lockerOwners?: Record<string, boolean>;
  /** TODO */
  lockers?: Record<string, RugcheckApiLocker>;
  /** TODO */
  lpLockers?: any;
  markets?: RugcheckApiMarket[];
  mint?: string;
  mintAuthority?: string;
  risks?: RugcheckApiRisk[];
  rugged?: boolean;
  score?: number;
  token?: string;
  /** TODO Meta struct */
  tokenMeta?: RugcheckApiTokenMetadata;
  tokenProgram?: string;
  tokenType?: string;
  token_extensions?: string;
  topHolders?: RugcheckApiTokenHolder[];
  totalLPProviders?: number;
  totalMarketLiquidity?: number;
  transferFee?: {
    authority?: string;
    maxAmount?: number;
    pct?: number;
  };
  verification?: RugcheckApiVerifiedToken;
}

export interface RugcheckApiTokenEvent {
  createdAt?: string;
  event?: number;
  newValue?: string;
  oldValue?: string;
}

export interface RugcheckApiTokenHolder {
  address?: string;
  amount?: number;
  decimals?: number;
  insider?: boolean;
  owner?: string;
  pct?: number;
  uiAmount?: number;
  uiAmountString?: string;
}

export interface RugcheckApiTokenMetadata {
  mutable?: boolean;
  name?: string;
  symbol?: string;
  updateAuthority?: string;
  uri?: string;
}

export interface RugcheckApiVerifiedToken {
  description?: string;
  jup_verified?: boolean;
  links?: RugcheckApiVerifiedTokenLinks[];
  mint?: string;
  name?: string;
  payer?: string;
  symbol?: string;
}

export interface RugcheckApiVerifiedTokenLinks {
  provider?: string;
  value?: string;
}

export interface RugcheckApiVerifiedTokenSimple {
  createdAt?: string;
  domain?: string;
  mint?: string;
  name?: string;
  symbol?: string;
}

export interface ServicesTrendingToken {
  mint?: string;
  up_count?: number;
  vote_count?: number;
}

export type QueryParamsType = Record<string | number, any>;
export type ResponseFormat = keyof Omit<Body, 'body' | 'bodyUsed'>;

export interface FullRequestParams extends Omit<RequestInit, 'body'> {
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

export type RequestParams = Omit<FullRequestParams, 'body' | 'method' | 'query' | 'path'>;

export interface ApiConfig<SecurityDataType = unknown> {
  baseUrl?: string;
  baseApiParams?: Omit<RequestParams, 'baseUrl' | 'cancelToken' | 'signal'>;
  securityWorker?: (securityData: SecurityDataType | null) => Promise<RequestParams | void> | RequestParams | void;
  customFetch?: typeof fetch;
}

export interface HttpResponse<D extends unknown, E extends unknown = unknown> extends Response {
  data: D;
  error: E;
}

type CancelToken = Symbol | string | number;

export enum ContentType {
  Json = 'application/json',
  FormData = 'multipart/form-data',
  UrlEncoded = 'application/x-www-form-urlencoded',
  Text = 'text/plain',
}

export class HttpClient<SecurityDataType = unknown> {
  public baseUrl: string = '';
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>['securityWorker'];
  private abortControllers = new Map<CancelToken, AbortController>();
  private customFetch = (input: RequestInfo, init?: RequestInit) => fetch(input, init);

  private baseApiParams: RequestParams = {
    credentials: 'same-origin',
    headers: {},
    redirect: 'follow',
    referrerPolicy: 'no-referrer',
  };

  constructor(apiConfig: ApiConfig<SecurityDataType> = {}) {
    Object.assign(this, apiConfig);
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected encodeQueryParam(key: string, value: any) {
    const encodedKey = encodeURIComponent(key);
    return `${encodedKey}=${encodeURIComponent(typeof value === 'number' ? value : `${value}`)}`;
  }

  protected addQueryParam(query: QueryParamsType, key: string) {
    return this.encodeQueryParam(key, query[key]);
  }

  protected addArrayQueryParam(query: QueryParamsType, key: string) {
    const value = query[key];
    return value.map((v: any) => this.encodeQueryParam(key, v)).join('&');
  }

  protected toQueryString(rawQuery?: QueryParamsType): string {
    const query = rawQuery || {};
    const keys = Object.keys(query).filter((key) => 'undefined' !== typeof query[key]);
    return keys
      .map((key) => (Array.isArray(query[key]) ? this.addArrayQueryParam(query, key) : this.addQueryParam(query, key)))
      .join('&');
  }

  protected addQueryParams(rawQuery?: QueryParamsType): string {
    const queryString = this.toQueryString(rawQuery);
    return queryString ? `?${queryString}` : '';
  }

  private contentFormatters: Record<ContentType, (input: any) => any> = {
    [ContentType.Json]: (input: any) =>
      input !== null && (typeof input === 'object' || typeof input === 'string') ? JSON.stringify(input) : input,
    [ContentType.Text]: (input: any) => (input !== null && typeof input !== 'string' ? JSON.stringify(input) : input),
    [ContentType.FormData]: (input: any) =>
      Object.keys(input || {}).reduce((formData, key) => {
        const property = input[key];
        formData.append(
          key,
          property instanceof Blob
            ? property
            : typeof property === 'object' && property !== null
              ? JSON.stringify(property)
              : `${property}`,
        );
        return formData;
      }, new FormData()),
    [ContentType.UrlEncoded]: (input: any) => this.toQueryString(input),
  };

  protected mergeRequestParams(params1: RequestParams, params2?: RequestParams): RequestParams {
    const mergedHeaders = {
      ...(this.baseApiParams.headers || {}),
      ...(params1.headers || {}),
      ...((params2 && params2.headers) || {}),
    };

    return {
      ...this.baseApiParams,
      ...params1,
      ...(params2 || {}),
      headers: mergedHeaders as HeadersInit,
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
      ((typeof secure === 'boolean' ? secure : this.baseApiParams.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const queryString = query && this.toQueryString(query);
    const payloadFormatter = this.contentFormatters[type || ContentType.Json];
    const responseFormat = format || requestParams.format;

    const requestInit: RequestInit = {
      ...requestParams,
      headers: new Headers({
        ...(requestParams.headers || {}),
        ...(type && type !== ContentType.FormData ? { 'Content-Type': type } : {}),
      }),
      signal: (cancelToken ? this.createAbortSignal(cancelToken) : requestParams.signal) || null,
      body: typeof body === 'undefined' || body === null ? null : payloadFormatter(body),
    };

    return this.customFetch(`${baseUrl || this.baseUrl || ''}${path}${queryString ? `?${queryString}` : ''}`, requestInit)
      .then(async (response) => {
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
 * @title RugCheck API
 * @version 1.0
 * @license
 * @contact
 *
 * The RugCheck API for solana tokens
 */
export class Api<SecurityDataType extends unknown> extends HttpClient<SecurityDataType> {
  auth = {
    /**
     * No description
     *
     * @tags Auth
     * @name LoginSolanaCreate
     * @summary Login to Rugcheck via a signed solana message
     * @request POST:/auth/login/solana
     */
    loginSolanaCreate: (req: DtoAuthRequest, params: RequestParams = {}) =>
      this.request<DtoAuthResponse, any>({
        path: `/auth/login/solana`,
        method: 'POST',
        body: req,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),
  };
  domains = {
    /**
     * No description
     *
     * @tags Domains
     * @name DomainsList
     * @summary Returns all registered .token domains
     * @request GET:/domains
     */
    domainsList: (
      query?: {
        /** Page number for results */
        page?: number;
        /** Limit number of results */
        limit?: number;
        /** Filter to only domains with verification set */
        verified?: boolean;
      },
      params: RequestParams = {},
    ) =>
      this.request<DtoDomainResponse, any>({
        path: `/domains`,
        method: 'GET',
        query: query,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags Domains
     * @name DataCsvList
     * @summary Returns all registered .token domains as csv
     * @request GET:/domains/data.csv
     */
    dataCsvList: (
      query?: {
        /** Filter to only domains with verification set */
        verified?: boolean;
      },
      params: RequestParams = {},
    ) =>
      this.request<any, void>({
        path: `/domains/data.csv`,
        method: 'GET',
        query: query,
        ...params,
      }),
  };
  leaderboard = {
    /**
     * No description
     *
     * @tags General
     * @name LeaderboardList
     * @summary Leaderboard ranking
     * @request GET:/leaderboard
     */
    leaderboardList: (params: RequestParams = {}) =>
      this.request<DtoPong, any>({
        path: `/leaderboard`,
        method: 'GET',
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),
  };
  maintenance = {
    /**
     * No description
     *
     * @tags General
     * @name MaintenanceList
     * @summary Maintenance service
     * @request GET:/maintenance
     */
    maintenanceList: (params: RequestParams = {}) =>
      this.request<DtoPong, any>({
        path: `/maintenance`,
        method: 'GET',
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),
  };
  ping = {
    /**
     * No description
     *
     * @tags General
     * @name PingList
     * @summary Ping service
     * @request GET:/ping
     */
    pingList: (params: RequestParams = {}) =>
      this.request<DtoPong, any>({
        path: `/ping`,
        method: 'GET',
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),
  };
  stats = {
    /**
     * No description
     *
     * @tags Stats
     * @name NewTokensList
     * @summary Recently detected tokens
     * @request GET:/stats/new_tokens
     */
    newTokensList: (params: RequestParams = {}) =>
      this.request<RugcheckApiToken[], any>({
        path: `/stats/new_tokens`,
        method: 'GET',
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Only users who have connected their wallet have their views counted
     *
     * @tags Stats
     * @name RecentList
     * @summary Most viewed tokens in past 24 hours
     * @request GET:/stats/recent
     */
    recentList: (params: RequestParams = {}) =>
      this.request<DtoTokenInfoAgg[], any>({
        path: `/stats/recent`,
        method: 'GET',
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Only users who have connected their wallet are able to vote
     *
     * @tags Stats
     * @name TrendingList
     * @summary Most voted for tokens in past 24 hours
     * @request GET:/stats/trending
     */
    trendingList: (params: RequestParams = {}) =>
      this.request<ServicesTrendingToken[], any>({
        path: `/stats/trending`,
        method: 'GET',
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags Stats
     * @name VerifiedList
     * @summary Recently verified tokens
     * @request GET:/stats/verified
     */
    verifiedList: (params: RequestParams = {}) =>
      this.request<RugcheckApiVerifiedToken[], any>({
        path: `/stats/verified`,
        method: 'GET',
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),
  };
  tokens = {
    /**
     * No description
     *
     * @tags Vaults
     * @name LockersDetail
     * @summary Returns the tokens LP vaults
     * @request GET:/tokens/{id}/lockers
     */
    lockersDetail: (id: string, params: RequestParams = {}) =>
      this.request<DtoVaultResponse, any>({
        path: `/tokens/${id}/lockers`,
        method: 'GET',
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags Vaults
     * @name LockersFluxDetail
     * @summary Returns the tokens LP vaults from flux locker
     * @request GET:/tokens/{id}/lockers/flux
     */
    lockersFluxDetail: (id: string, params: RequestParams = {}) =>
      this.request<DtoVaultResponse, any>({
        path: `/tokens/${id}/lockers/flux`,
        method: 'GET',
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags Votes
     * @name ReportDetail
     * @summary Report a token
     * @request GET:/tokens/{mint}/report
     */
    reportDetail: (mint: string, params: RequestParams = {}) =>
      this.request<any, void>({
        path: `/tokens/${mint}/report`,
        method: 'GET',
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Tokens
     * @name ReportSummaryDetail
     * @summary Generate a report summary for given token mint
     * @request GET:/tokens/{mint}/report/summary
     */
    reportSummaryDetail: (mint: string, params: RequestParams = {}) =>
      this.request<RugcheckApiTokenCheck, any>({
        path: `/tokens/${mint}/report/summary`,
        method: 'GET',
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags Votes
     * @name VotesDetail
     * @summary Vote on a token mint
     * @request GET:/tokens/{mint}/votes
     */
    votesDetail: (mint: string, req: DtoVoteRequest, params: RequestParams = {}) =>
      this.request<DtoVoteResponse, any>({
        path: `/tokens/${mint}/votes`,
        method: 'GET',
        body: req,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),
  };
}
