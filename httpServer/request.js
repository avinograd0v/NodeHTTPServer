class Request {
  constructor(requestString) {
    this._parseHttpRequest(requestString)
  }

  _parseHttpRequest(requestString) {
    const httpMethod = requestString.substr(0, requestString.indexOf(" "));
    const start = requestString.indexOf(httpMethod) + httpMethod.length + 1;
    const length = requestString.lastIndexOf("HTTP") - start - 1;
    const requestedUrl = decodeURIComponent(requestString.substr(start, length));

    this.path = requestedUrl;
    this.method = httpMethod;
  }
}

export default Request;
