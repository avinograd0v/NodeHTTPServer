import { Transform } from 'stream';

class HttpProtocolStream extends Transform {
  constructor(options, requestHandler) {
    super(options);

    this.requestBuffer = '';
    this.requestHandler = requestHandler;
  }

  _transform(chunk, encoding, callback) {
    this.requestBuffer += chunk.toString();
    const headersEndFlag = '\r\n\r\n';

    let foundIndex;

    while((foundIndex = this.requestBuffer.indexOf(headersEndFlag)) !== -1) {
      const requestString = this.requestBuffer.slice(0, foundIndex + headersEndFlag.length);
      this.requestBuffer = this.requestBuffer.slice(foundIndex + headersEndFlag.length);
      this.requestHandler(requestString, this);
    }

    callback();
  }
}

export default HttpProtocolStream;
