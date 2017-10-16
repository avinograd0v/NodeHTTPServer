import pathMod from 'path';
import fs from 'fs-extra';
import {STATUS_CODES, SERVER, CONNECTION, EXTENTIONS} from "./constants";

// TODO: convert to stream
class Response {
  constructor(stream, serve) {
    this.stream = stream;
    this.serve = serve;

    this.data = ``;
    this.status = `200 ${STATUS_CODES[200]}`;
    this.headers = `Server: ${SERVER}\r\nDate: ${new Date().toUTCString()}\r\nConnection: ${CONNECTION}\r\n`;
  }

  _createResponseString = () => {
    return `HTTP/1.1 ${this.status}\r\n${this.headers}\r\n${this.data}`;
  };

  setHeader = (name, value) => {
    this.headers += `${name}: ${value}\r\n`;
  };

  setStatus = statusCode => {
    this.status = `${statusCode} ${STATUS_CODES[statusCode]}`;
  };

  _sendFile = (fileStat, filePath, ext, method) => {
    this.setStatus(200);
    this.setHeader('Content-Type', EXTENTIONS[ext] || 'text/plain');
    this.setHeader('Content-Length', fileStat.size);
    this.send();

    if (method === 'GET') {
      const fileStream = fs.createReadStream(filePath, { flags: 'r', mode: 0o666 });

      fileStream.on('data', chunk => {
        this.stream.push(chunk)
      });

      // fileStream.on('end', this.end);
    } else {
      this.end();
    }
  };

  _getFileOr404 = async ({path, method}) => {
    const indexFileName = '/index.html';

    const filePath = pathMod.join(this.serve, path.split('?')[0].replace(/\/\.\./g, ''));

    const ext = pathMod.extname(filePath).slice(1);

    try {
      const stat = await fs.stat(filePath);
      if (stat.isDirectory()) {
        const indexFilePath = pathMod.join(filePath, indexFileName);
        const indexFileStat = await fs.stat(indexFilePath);
        const ext = pathMod.extname(indexFilePath).slice(1);

        this._sendFile(indexFileStat, indexFilePath, ext, method);

      } else  {

        this._sendFile(stat, filePath, ext, method);
      }
    } catch (err) {
      this.setStatus(404);
      this.send();
      this.end();
    }
  };

  end = () => this.stream.push(null);

  sendFileOr404 = this._getFileOr404;
  checkFileOr404 = this._getFileOr404;

  send = () => {
    const data = this._createResponseString();
    this.stream.push(data);
  }
}

export default Response;
