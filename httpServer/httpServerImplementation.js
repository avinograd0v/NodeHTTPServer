import net from 'net';
import Request from './request';
import Response from './response';
import HttpProtocolStream from './HttpStream';

class HttpServer extends net.Server {
  constructor({ port, serve }) {
    super();

    this.on('connection', this._connectionListener);
    this.listen(port);

    this.serve = serve;

    this.router = {
      get: this._get,
      head: this._head
    };

    this.registeredRoutes = {
      getRoutes: { },
      headRoutes: { }
    }
  }

  _get = (path, handler) => {
    this.registeredRoutes.getRoutes[path] = handler
  };

  _head = (path, handler) => {
    this.registeredRoutes.headRoutes[path] = handler
  };

  _handleHttpRequest = (requestString, stream) => {
    const request = new Request(requestString);

    if (request.error) { /* TODO: handle bad request */}

    switch (request.method) {
      case 'GET': {
        const response = new Response(stream, this.serve);
        if (!this.registeredRoutes.getRoutes[request.path]) {
          if (this.registeredRoutes.getRoutes['*']) {
            this.registeredRoutes.getRoutes['*'](request, response);
          } else {
            // TODO: implement 404 handler
          }
        } else {
          this.registeredRoutes.getRoutes[request.path](request, response);
        }
        break;
      }
      case 'HEAD': {
        const response = new Response(stream, this.serve);
        if (!this.registeredRoutes.headRoutes[request.path]) {
          if (this.registeredRoutes.headRoutes['*']) {
            this.registeredRoutes.headRoutes['*'](request, response);
          } else {
            // TODO: implement 404 handler
          }
        } else {
          this.registeredRoutes.headRoutes[request.path](request, response);
        }
        break;
      }
      default: {
        const response = new Response(stream, this.serve);
        response.setStatus(405);
        response.send();
        response.end();
      }
    }
  };

  _connectionListener = socket => {
    // socket.setEncoding('utf8');
    socket.setKeepAlive(true, 10);

    const httpStream = new HttpProtocolStream(null, this._handleHttpRequest);
    // console.log('HELLO');
   //  httpStream.on('end', () => { console.log('its ended'); });

    socket
      .pipe(httpStream)
      .pipe(socket)
  }
}

export default HttpServer;
