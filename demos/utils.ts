export function capFirstOne(str: string) {
  return str.replace(/^\w/, (m) => m.toUpperCase());
}

interface RequestOpts {
  url: string;
  method: string;
  data?: any;
  queryParams?: object;
  headers?: object;
  onProgress?: (this: XMLHttpRequest, ev: ProgressEvent<EventTarget>) => any;
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
    // listen the progress event
    options.onProgress && (xhr.upload.onprogress = options.onProgress);

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

export function setStyle(dom: HTMLElement, styleObj: object) {
  Object.assign(dom.style, styleObj);
}

// able to import the worker using import syntax
export function BuildWorker(workerScript: () => void) {
  // workerScript should be a function containing the worker script
  // so that we can import the function using es6 import
  if (!workerScript) return;

  const scriptStr = workerScript.toString();
  const reg = /^\s*function\s*\(\s*\)\s*\{(([\s\S](?!\}$))*[\s\S])/;

  if (!scriptStr.match(reg)) return;

  return new Worker(
    window.URL.createObjectURL(
      new Blob([(scriptStr.match(reg) as RegExpMatchArray)[1]], {
        type: "text/javascript",
      })
    )
  );
}
