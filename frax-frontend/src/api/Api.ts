/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface DsCartBadgeDTO {
  count?: number;
  diet_id?: number;
}

export interface DsDietDTO {
  PGP?: number;
  PRP?: number;
  c_pol?: number;
  complition_date?: string;
  creation_date?: string;
  creator_login?: number;
  forming_date?: string;
  id?: number;
  moderator_login?: number;
  n_pol?: number;
  products?: DsProductInDietDTO[];
  status?: number;
}

export interface DsDietResolveRequest {
  /** "complete" | "reject" */
  action: string;
}

export interface DsDietUpdateRequest {
  c_pol: number;
  n_pol: number;
}

export interface DsLoginResponse {
  token?: string;
  user?: DsUserDTO;
}

export interface DsPaginatedResponse {
  items?: any;
  total?: number;
}

export interface DsProductCreateRequest {
  c_pol?: number;
  n_pol?: number;
  text: string;
  title: string;
}

export interface DsProductDTO {
  c_pol?: number;
  id?: number;
  image?: string;
  n_pol?: number;
  text?: string;
  title?: string;
}

export interface DsProductInDietDTO {
  c_pol?: number;
  description?: string;
  image?: string;
  n_pol?: number;
  product_id?: number;
  text?: string;
  title?: string;
}

export interface DsProductToDietUpdateRequest {
  description?: string;
}

export interface DsProductUpdateRequest {
  c_pol?: number;
  n_pol?: number;
  text?: string;
  title?: string;
}

export interface DsUserDTO {
  full_name?: string;
  id?: number;
  moderator?: boolean;
  username?: string;
}

export interface DsUserLoginRequest {
  password: string;
  username: string;
}

export interface DsUserRegisterRequest {
  full_name: string;
  password: string;
  username: string;
}

export interface DsUserUpdateRequest {
  full_name?: string;
  password?: string;
  username?: string;
}

import type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  HeadersDefaults,
  ResponseType,
} from "axios";
import axios from "axios";

export type QueryParamsType = Record<string | number, any>;

export interface FullRequestParams
  extends Omit<AxiosRequestConfig, "data" | "params" | "url" | "responseType"> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseType;
  /** request body */
  body?: unknown;
}

export type RequestParams = Omit<
  FullRequestParams,
  "body" | "method" | "query" | "path"
>;

export interface ApiConfig<SecurityDataType = unknown>
  extends Omit<AxiosRequestConfig, "data" | "cancelToken"> {
  securityWorker?: (
    securityData: SecurityDataType | null,
  ) => Promise<AxiosRequestConfig | void> | AxiosRequestConfig | void;
  secure?: boolean;
  format?: ResponseType;
}

export enum ContentType {
  Json = "application/json",
  JsonApi = "application/vnd.api+json",
  FormData = "multipart/form-data",
  UrlEncoded = "application/x-www-form-urlencoded",
  Text = "text/plain",
}

export class HttpClient<SecurityDataType = unknown> {
  public instance: AxiosInstance;
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
  private secure?: boolean;
  private format?: ResponseType;

  constructor({
    securityWorker,
    secure,
    format,
    ...axiosConfig
  }: ApiConfig<SecurityDataType> = {}) {
    this.instance = axios.create({
      ...axiosConfig,
      baseURL: axiosConfig.baseURL || "",
    });
    this.secure = secure;
    this.format = format;
    this.securityWorker = securityWorker;
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected mergeRequestParams(
    params1: AxiosRequestConfig,
    params2?: AxiosRequestConfig,
  ): AxiosRequestConfig {
    const method = params1.method || (params2 && params2.method);

    return {
      ...this.instance.defaults,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...((method &&
          this.instance.defaults.headers[
            method.toLowerCase() as keyof HeadersDefaults
          ]) ||
          {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected stringifyFormItem(formItem: unknown) {
    if (typeof formItem === "object" && formItem !== null) {
      return JSON.stringify(formItem);
    } else {
      return `${formItem}`;
    }
  }

  protected createFormData(input: Record<string, unknown>): FormData {
    if (input instanceof FormData) {
      return input;
    }
    return Object.keys(input || {}).reduce((formData, key) => {
      const property = input[key];
      const propertyContent: any[] =
        property instanceof Array ? property : [property];

      for (const formItem of propertyContent) {
        const isFileType = formItem instanceof Blob || formItem instanceof File;
        formData.append(
          key,
          isFileType ? formItem : this.stringifyFormItem(formItem),
        );
      }

      return formData;
    }, new FormData());
  }

  public request = async <T = any, _E = any>({
    secure,
    path,
    type,
    query,
    format,
    body,
    ...params
  }: FullRequestParams): Promise<AxiosResponse<T>> => {
    const secureParams =
      ((typeof secure === "boolean" ? secure : this.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const responseFormat = format || this.format || undefined;

    if (
      type === ContentType.FormData &&
      body &&
      body !== null &&
      typeof body === "object"
    ) {
      body = this.createFormData(body as Record<string, unknown>);
    }

    if (
      type === ContentType.Text &&
      body &&
      body !== null &&
      typeof body !== "string"
    ) {
      body = JSON.stringify(body);
    }

    return this.instance.request({
      ...requestParams,
      headers: {
        ...(requestParams.headers || {}),
        ...(type ? { "Content-Type": type } : {}),
      },
      params: query,
      responseType: responseFormat,
      data: body,
      url: path,
    });
  };
}

/**
 * @title API для системы DIET
 * @version 1.0
 * @contact API Support <support@example.com>
 *
 * API-сервер для управления заявками и продуктами в системе DIET.
 */
export class Api<
  SecurityDataType extends unknown,
> extends HttpClient<SecurityDataType> {
  auth = {
    /**
     * @description Получение JWT токена по логину и паролю для доступа к защищенным эндпоинтам.
     *
     * @tags auth
     * @name LoginCreate
     * @summary Аутентификация пользователя (все)
     * @request POST:/auth/login
     */
    loginCreate: (
      credentials: DsUserLoginRequest,
      params: RequestParams = {},
    ) =>
      this.request<DsLoginResponse, Record<string, string>>({
        path: `/auth/login`,
        method: "POST",
        body: credentials,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Добавляет текущий JWT токен в черный список, делая его недействительным. Требует авторизации.
     *
     * @tags auth
     * @name LogoutCreate
     * @summary Выход из системы (авторизованный пользователь)
     * @request POST:/auth/logout
     * @secure
     */
    logoutCreate: (params: RequestParams = {}) =>
      this.request<Record<string, string>, Record<string, string>>({
        path: `/auth/logout`,
        method: "POST",
        secure: true,
        ...params,
      }),
  };
  diet = {
    /**
     * @description Возвращает отфильтрованный список всех сформированных заявок (кроме черновиков и удаленных).
     *
     * @tags diet
     * @name DietList
     * @summary Получить список заявок (авторизованный пользователь)
     * @request GET:/diet
     * @secure
     */
    dietList: (
      query?: {
        /** Фильтр по статусу заявки */
        status?: number;
        /** Фильтр по дате 'от' (формат YYYY-MM-DD) */
        from?: string;
        /** Фильтр по дате 'до' (формат YYYY-MM-DD) */
        to?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<DsDietDTO[], Record<string, string>>({
        path: `/diet`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Находит или создает черновик заявки для текущего пользователя и добавляет в него продукт.
     *
     * @tags products
     * @name DraftProductsCreate
     * @summary Добавить продукт в черновик заявки (все)
     * @request POST:/diet/draft/products/{product_id}
     * @secure
     */
    draftProductsCreate: (productId: number, params: RequestParams = {}) =>
      this.request<Record<string, string>, Record<string, string>>({
        path: `/diet/draft/products/${productId}`,
        method: "POST",
        secure: true,
        ...params,
      }),

    /**
     * @description Возвращает ID черновика текущего пользователя и количество продуктов в нем.
     *
     * @tags diet
     * @name ProductscartList
     * @summary Получить информацию для иконки корзины (авторизованный пользователь)
     * @request GET:/diet/productscart
     * @secure
     */
    productscartList: (params: RequestParams = {}) =>
      this.request<DsCartBadgeDTO, Record<string, string>>({
        path: `/diet/productscart`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Возвращает полную информацию о заявке, включая привязанные продукты.
     *
     * @tags diet
     * @name DietDetail
     * @summary Получить одну заявку по ID (авторизованный пользователь)
     * @request GET:/diet/{id}
     * @secure
     */
    dietDetail: (id: number, params: RequestParams = {}) =>
      this.request<DsDietDTO, Record<string, string>>({
        path: `/diet/${id}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Позволяет пользователю обновить поля своей заявки.
     *
     * @tags diet
     * @name DietUpdate
     * @summary Обновить данные заявки (авторизованный пользователь)
     * @request PUT:/diet/{id}
     * @secure
     */
    dietUpdate: (
      id: number,
      updateData: DsDietUpdateRequest,
      params: RequestParams = {},
    ) =>
      this.request<void, Record<string, string>>({
        path: `/diet/${id}`,
        method: "PUT",
        body: updateData,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description Логически удаляет заявку, переводя ее в статус "удалена".
     *
     * @tags diet
     * @name DietDelete
     * @summary Удалить заявку (авторизованный пользователь)
     * @request DELETE:/diet/{id}
     * @secure
     */
    dietDelete: (id: number, params: RequestParams = {}) =>
      this.request<void, Record<string, string>>({
        path: `/diet/${id}`,
        method: "DELETE",
        secure: true,
        ...params,
      }),

    /**
     * @description Переводит заявку из статуса "черновик" в "сформирована".
     *
     * @tags diet
     * @name FormUpdate
     * @summary Сформировать заявку (авторизованный пользователь)
     * @request PUT:/diet/{id}/form
     * @secure
     */
    formUpdate: (id: number, params: RequestParams = {}) =>
      this.request<void, Record<string, string>>({
        path: `/diet/${id}/form`,
        method: "PUT",
        secure: true,
        ...params,
      }),

    /**
     * @description Изменяет дополнительное описание для конкретного продукта в рамках одной заявки.
     *
     * @tags m-m
     * @name ProductsUpdate
     * @summary Обновить описание продукта в заявке (авторизованный пользователь)
     * @request PUT:/diet/{id}/products/{product_id}
     * @secure
     */
    productsUpdate: (
      id: number,
      productId: number,
      updateData: DsProductToDietUpdateRequest,
      params: RequestParams = {},
    ) =>
      this.request<void, Record<string, string>>({
        path: `/diet/${id}/products/${productId}`,
        method: "PUT",
        body: updateData,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description Удаляет связь между заявкой и продуктом.
     *
     * @tags m-m
     * @name ProductsDelete
     * @summary Удалить продукт из заявки (авторизованный пользователь)
     * @request DELETE:/diet/{id}/products/{product_id}
     * @secure
     */
    productsDelete: (
      id: number,
      productId: number,
      params: RequestParams = {},
    ) =>
      this.request<void, Record<string, string>>({
        path: `/diet/${id}/products/${productId}`,
        method: "DELETE",
        secure: true,
        ...params,
      }),

    /**
     * @description Модератор завершает (с расчетом) или отклоняет заявку.
     *
     * @tags diet
     * @name ResolveUpdate
     * @summary Завершить или отклонить заявку (только модератор)
     * @request PUT:/diet/{id}/resolve
     * @secure
     */
    resolveUpdate: (
      id: number,
      action: DsDietResolveRequest,
      params: RequestParams = {},
    ) =>
      this.request<void, Record<string, string>>({
        path: `/diet/${id}/resolve`,
        method: "PUT",
        body: action,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),
  };
  products = {
    /**
     * @description Возвращает постраничный список продуктов.
     *
     * @tags products
     * @name ProductsList
     * @summary Получить список продуктов (все)
     * @request GET:/products
     */
    productsList: (
      query?: {
        /** Фильтр по названию продукта */
        title?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<DsPaginatedResponse, Record<string, string>>({
        path: `/products`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * @description Создает новую запись о продукте.
     *
     * @tags products
     * @name ProductsCreate
     * @summary Создать новый продукт (только модератор)
     * @request POST:/products
     * @secure
     */
    productsCreate: (
      productData: DsProductCreateRequest,
      params: RequestParams = {},
    ) =>
      this.request<DsProductDTO, Record<string, string>>({
        path: `/products`,
        method: "POST",
        body: productData,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Возвращает детальную информацию о продукте.
     *
     * @tags products
     * @name ProductsDetail
     * @summary Получить один продукт по ID (все)
     * @request GET:/products/{id}
     */
    productsDetail: (id: number, params: RequestParams = {}) =>
      this.request<DsProductDTO, Record<string, string>>({
        path: `/products/${id}`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * @description Обновляет информацию о существующем продукте.
     *
     * @tags products
     * @name ProductsUpdate
     * @summary Обновить продукт (только модератор)
     * @request PUT:/products/{id}
     * @secure
     */
    productsUpdate: (
      id: number,
      updateData: DsProductUpdateRequest,
      params: RequestParams = {},
    ) =>
      this.request<DsProductDTO, Record<string, string>>({
        path: `/products/${id}`,
        method: "PUT",
        body: updateData,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Удаляет продукт риска из системы.
     *
     * @tags products
     * @name ProductsDelete
     * @summary Удалить продукт (только модератор)
     * @request DELETE:/products/{id}
     * @secure
     */
    productsDelete: (id: number, params: RequestParams = {}) =>
      this.request<void, Record<string, string>>({
        path: `/products/${id}`,
        method: "DELETE",
        secure: true,
        ...params,
      }),

    /**
     * @description Загружает и привязывает изображение к продукту.
     *
     * @tags products
     * @name ImageCreate
     * @summary Загрузить изображение для продукта (только модератор)
     * @request POST:/products/{id}/image
     * @secure
     */
    imageCreate: (
      id: number,
      data: {
        /** Файл изображения */
        file: File;
      },
      params: RequestParams = {},
    ) =>
      this.request<Record<string, string>, Record<string, string>>({
        path: `/products/${id}/image`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.FormData,
        format: "json",
        ...params,
      }),
  };
  users = {
    /**
     * @description Создает нового пользователя в системе. По умолчанию роль "пользователь", не "модератор".
     *
     * @tags auth
     * @name UsersCreate
     * @summary Регистрация нового пользователя (все)
     * @request POST:/users
     */
    usersCreate: (
      credentials: DsUserRegisterRequest,
      params: RequestParams = {},
    ) =>
      this.request<DsUserDTO, Record<string, string>>({
        path: `/users`,
        method: "POST",
        body: credentials,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Возвращает публичные данные пользователя. Требует авторизации.
     *
     * @tags users
     * @name UsersDetail
     * @summary Получение данных пользователя по ID (авторизованный пользователь)
     * @request GET:/users/{id}
     * @secure
     */
    usersDetail: (id: number, params: RequestParams = {}) =>
      this.request<DsUserDTO, Record<string, string>>({
        path: `/users/${id}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Обновляет имя пользователя или пароль. Требует авторизации.
     *
     * @tags users
     * @name UsersUpdate
     * @summary Обновление данных пользователя (авторизованный пользователь)
     * @request PUT:/users/{id}
     * @secure
     */
    usersUpdate: (
      id: number,
      updateData: DsUserUpdateRequest,
      params: RequestParams = {},
    ) =>
      this.request<void, Record<string, string>>({
        path: `/users/${id}`,
        method: "PUT",
        body: updateData,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),
  };
}
