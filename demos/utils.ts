export function capFirstOne(str: string) {
  return str.replace(/^\w/, (m) => m.toUpperCase());
}

interface RequestOpts {
  url: string;
  method: string;
  data?: any;
  queryParams?: object;
  headers?: object;
}

const domain = `http://localhost:3500`;

function queryFormatter(params: object) {
  return Object.keys(params).reduce((ret, key) => {
    const value = (params as any)[key];

    return (ret += `&${key}=${value}`);
  }, `?`);
}

export function request(options: RequestOpts) {
  return new Promise((resolve, _) => {
    const { method, url } = options;

    const xhr = new XMLHttpRequest();

    if (method.toUpperCase() === "GET" && options.queryParams != null) {
      const { queryParams } = options;

      xhr.open(method, `${domain}${url}${queryFormatter(queryParams)}`);
    } else {
      xhr.open(method, `${domain}${url}`);
    }

    options.headers &&
      Object.keys(options.headers).forEach((key) =>
        xhr.setRequestHeader(key, (options.headers as any)[key])
      );

    const data = options.data ? options.data : null;

    data ? xhr.send(data) : xhr.send();

    xhr.onload = (e) => {
      resolve(JSON.parse((e.target as XMLHttpRequest).response));
    };
  });
}
