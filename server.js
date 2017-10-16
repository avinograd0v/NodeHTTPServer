const httpServer = require('./httpServer/httpServerImplementation');
const cluster = require('cluster');
const config = require('./helpers/configParser')('/etc/httpd.conf');

const numCPUs = config.cpu_limit;

if (cluster.isMaster) {
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', () => {
    cluster.fork({});
  });

  // const requestsPerWorker = new Array(numCPUs).fill(0);
  //
  // setInterval(() => {
  //   requestsPerWorker.forEach((val, id) => {
  //     console.log(`worker ${id} - ${val} requests`)
  //   });
  // }, 5000);
  //
  // const messageHandler = msg => {
  //   if (msg.cmd && msg.cmd === 'notifyRequest') {
  //     requestsPerWorker[msg.workerID - 1] += 1;
  //   }
  // };
  //
  // for (const id in cluster.workers) {
  //   cluster.workers[id].on('message', messageHandler);
  // }

} else {
  const { router } = new httpServer({ port: config.listen, serve: config.document_root });

  router.get('*', (req, res) => {
    // console.log(req);
    // process.send({ cmd: 'notifyRequest', workerID: cluster.worker.id });
    res.sendFileOr404(req)
  });

  router.head('*', (req, res) => {
    // console.log(req);
    // process.send({ cmd: 'notifyRequest', workerID: cluster.worker.id });
    res.checkFileOr404(req)
  });
}
