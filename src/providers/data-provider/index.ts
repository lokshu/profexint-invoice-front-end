'use client';

import Cookies from 'js-cookie';
import type {DataProvider} from '@refinedev/core';
import { formatErrorMessage } from '@utilities/format-error-message';

const API_URL = process.env.NEXT_PUBLIC_API_URL as string;

// Custom fetcher that adds JWT from cookies to Authorization header
// const fetcher = async (url: string, options?: RequestInit) => {
//     // Retrieve the stored auth data from cookies
//     const auth = Cookies.get("auth");
//     const token = auth ? JSON.parse(auth).access : null;
//
//     return fetch(url, {
//         ...options,
//         headers: {
//             ...options?.headers,
//             // Append the Authorization header with the JWT if available
//             ...(token ? { Authorization: `Bearer ${token}` } : {}),
//         },
//     });
// };
const fetcher = async (
    url: string,
    options?: RequestInit,
    attemptRefresh: boolean = true
): Promise<Response> => {
    const auth = Cookies.get('auth');
    const token = auth ? JSON.parse(auth).access : null;

    const response = await fetch(url, {
        ...options,
        headers: {
            ...options?.headers,
            ...(token ? {'Authorization': `Bearer ${token}`} : {}),
        },
    });

    // If unauthorized and haven't tried refreshing the token yet
    if (response.status === 401 && attemptRefresh) {
        const refreshResult = await tryRefreshToken();

        if (refreshResult) {
            // If token refresh was successful, retry the original request without attempting another refresh
            return fetcher(url, options, false);
        } else {
            Cookies.remove('auth');

            // redirect to login page
            window.location.href = '/login';

            // If token refresh failed, potentially log out the user or handle accordingly
            // throw new Error('Session expired. Please log in again.');
        }
    }

    return response;
};

const tryRefreshToken = async () => {
    try {
        const auth = Cookies.get('auth');
        if (!auth) return false;

        const parsedAuth = JSON.parse(auth);
        const refreshToken = parsedAuth.refresh;

        const response = await fetch(`${API_URL}/api/v1/token/refresh/`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({refresh: refreshToken}),
        });

        if (!response.ok) {
            return false;
        } else if (response.status === 401) {
            return false;
        }

        const data = await response.json();

        // Update the auth cookie with the new access token
        Cookies.set('auth', JSON.stringify({
            ...parsedAuth, // Preserve other data
            access: data.access, // Update access token
        }), {
            expires: 30, // Adjust according to your auth logic
            path: '/',
        });

        return true;
    } catch (error) {
        return false;
    }
};

// Wrap the dataProviderSimpleRest with the custom fetcher
// export const dataProvider = dataProviderSimpleRest(`${API_URL}/api/v1`, fetcher);
export const dataProvider: DataProvider = {
    deleteOne: async ({resource, id, metaData}) => {
        const response = await fetcher(`${API_URL}/api/v1/${resource}/${id}/`, {
            method: 'DELETE',
        });

        if (response.status < 200 || response.status > 299) {
            throw new Error(`Error: ${response.statusText}`);
        }

        const data = await response.json();
        return {data};
    },

    // Implement getApiUrl method
    getApiUrl: () => {
        return API_URL;
    },
    getList: async ({resource, pagination, filters, sorters, meta}) => {
        // Create a new URLSearchParams object to store query parameters
        const params = new URLSearchParams();

        // Check if pagination is enabled and set the page and page_size query parameters for Django REST Framework API
        if (pagination && pagination.mode === 'server') {
            // 'page' is used instead of 'current' for the page number
            if (pagination.current) {
                params.append('page', pagination.current.toString());
            }

            // 'page_size' is used instead of 'pageSize' to specify items per page
            if (pagination.pageSize) {
                params.append('page_size', pagination.pageSize.toString());
            }
        }

        // Check if sorters are provided and set the 'ordering' query parameter for Django REST Framework API
        if (sorters && sorters.length > 0) {
            // Since DRF uses 'ordering' parameter for sorting, we'll concatenate all sorters
            // into a single 'ordering' parameter, taking into account the order direction
            const orderingValues = sorters.map(sorter => {
                return sorter.order === 'asc' ? sorter.field : `-${sorter.field}`;
            });
            // Join all ordering values with commas if you have multiple sorters
            // DRF allows multiple ordering fields separated by commas
            params.append('ordering', orderingValues.join(','));
        }

        // Check if filters are provided and set the query parameters for Django REST Framework API
        if (filters && filters.length > 0) {
            // Loop through each filter and set the query parameter based on the operator
            filters.forEach((filter: any) => {
                switch (filter.operator) {
                    case "contains":
                        // For "contains", we use the 'search' query parameter
                        params.append('search', filter.value);
                        break;
                    case "eq":
                        // For "eq", we just use the field name directly
                        params.append(filter.field, filter.value);
                        break;
                    default:
                        console.log(`Unsupported filter operator: ${filter.operator}`);
                        return; // Skip unsupported operators
                }
            });
        }

        // Make a GET request to the API with the constructed query parameters
        const response = await fetcher(
            `${API_URL}/api/v1/${resource}?${params.toString()}`,
        );

        // Check if the response status is not in the 2xx range
        if (response.status < 200 || response.status > 299) throw response;

        // Parse the response JSON data
        let data = await response.json();

        // Initialise the total variable to store the total number of items
        let total;

        // Check if the returned data contains a count field
        // If it does, the response is paginated
        if ('results' in data) {
            // The response is paginated
            total = data.count;
            data = data.results;
        } else {
            // The response is not paginated
            total = data.length;
        }

        return {
            data,
            total,
        };
    },
    getMany: async ({resource, ids, meta}) => {
        const params = new URLSearchParams();

        if (ids) { /* ... */
        }

        const response = await fetcher(
            `${API_URL}/api/v1/${resource}?${params.toString()}`,
        );

        if (response.status < 200 || response.status > 299) throw response;

        const data = await response.json();

        return {data};
    },
    getOne: async ({ resource, id, meta }) => {
        const response = await fetcher(`${API_URL}/api/v1/${resource}/${id}/`, {
            headers: {
                Accept: meta?.headers?.Accept || 'application/json',
            }
        });

        if (response.status < 200 || response.status > 299) throw response;

        const isBinary = meta?.responseType === 'arraybuffer';
        const data = isBinary ? await response.arrayBuffer() : await response.json();

        return { data };
    },

    create: async ({ resource, variables }) => {
        const isFileUpload = resource === 'document-attachments/upload' || resource === 'user-signatures';
        const body: BodyInit = isFileUpload ? variables as FormData : JSON.stringify(variables);

        const response = await fetcher(`${API_URL}/api/v1/${resource}/`, {
            method: 'POST',
            body,
            headers: isFileUpload ? {} : {
                'Content-Type': 'application/json',
            },
        });

        if (response.status < 200 || response.status > 299) throw response;

        const data = await response.json();

        return { data };
    },
    update: async ({resource, id, variables}) => {
        const url = id ? `${API_URL}/api/v1/${resource}/${id}/` : `${API_URL}/api/v1/${resource}/`;
        const response = await fetcher(url, {
            method: 'PATCH',
            body: JSON.stringify(variables),
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (response.status < 200 || response.status > 299) throw response;

        const data = await response.json();

        return {data};
    },
    custom: async ({ url, method, sort, filters, payload, query, headers, meta }) => {
        const isFileUpload = url.includes('document-attachments/upload') || url.includes('user-signatures') || url.includes('company-profile');

        // Check if the URL contains any query parameters
        const containsQueryParams = url.includes('?');

        let body: BodyInit | undefined;

        if (payload && (method === 'post' || method === 'put' || method === 'patch')) {
            if (isFileUpload) {
                body = payload as unknown as FormData;
                console.log(body);
            } else {
                body = JSON.stringify(payload);
            }
        }

        const options: RequestInit = {
            method,
            body,
            headers: isFileUpload ? {} : {
                'Content-Type': 'application/json',
                ...(headers || {})
            },
        };

        const apiUrl = containsQueryParams ? `${API_URL}/api/v1/${url}` : `${API_URL}/api/v1/${url}/`;

        const response = await fetcher(apiUrl, options);

        if (!response.ok) {
            const errorData = await response.json();
            const message = formatErrorMessage(errorData);
            throw { statusCode: response.status, message };
        }

        const data = await response.json();

        return { data };
    }

    // custom: async ({ url, method, sort, filters, payload, query, headers, meta }) => {
    //     const options: RequestInit = {
    //         method,
    //         headers: {
    //             'Content-Type': 'application/json',
    //             ...(headers || {})
    //         },
    //         ...(payload && (method === 'post' || method === 'put' || method === 'patch') && { body: JSON.stringify(payload) })
    //     };
    //
    //     const response = await fetcher(`${API_URL}/api/v1/${url}/`, options);
    //
    //     if (!response.ok) {
    //         const errorData = await response.json();
    //         const message = formatErrorMessage(errorData);
    //         throw { statusCode: response.status, message };
    //     }
    //
    //     if (!response.ok) {
    //         throw new Error(`API call failed: ${response.statusText}`);
    //     }
    //
    //     const data = await response.json();
    //
    //     return { data };
    // },
};
