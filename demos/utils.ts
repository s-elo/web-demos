export function capFirstOne(str: string) {
  return str.replace(/^\w/, (m) => m.toUpperCase());
}

interface RequestOpts {
  url: string;
  method: string;
  data?: any;
  headers?: object;
}

const domain = `http://localhost:3500`;

export function request(options: RequestOpts) {
  return new Promise((resolve, _) => {
    const { method, url } = options;

    const xhr = new XMLHttpRequest();
    xhr.open(method, `${domain}${url}`);

    options.headers &&
      Object.keys(options.headers).forEach((key) =>
        xhr.setRequestHeader(key, (options.headers as any)[key])
      );

    const data = options.data ? options.data : null;
    xhr.send(data);
    xhr.onload = (e) => {
      resolve({
        data: (e.target as XMLHttpRequest).response,
      });
    };
  });
}
