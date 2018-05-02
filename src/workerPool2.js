const workerizeWorker = require('workerize-loader!./worker'); // eslint-disable-line import/no-webpack-loader-syntax

// https://gist.github.com/605541#file_js_web_worker_pool.js,
// https://gist.github.com/kig/1188381
// Web Worker Pool
// size is the max number of arguments
export class WorkerPool {

  constructor(size){
    this.size = size || 4;
    this.pool = [];
    this.jobs = [];
    this.resolves = {};
    this.rejects = {};
    this.globalMsgId = 0;
    this.fillPool();
  }

  // NOTE: not sure it's worth interfering with the render cycle with async
  fillPool = () => {
    for (var i = 0; i < this.size; i++) {
      const worker = workerizeWorker();
      this.pool.push(worker);
    }
  }

  // url: the url of the worker fn
  // msg: the initial message to pass to the worker
  queueJob(url, msg) {
    const newId = ++this.globalMsgId;
    var job = {
        "url": url,
        "msg": msg,
        "id": newId
    };
    this.jobs.push(job);
		const thiz = this;	
		return new Promise(function(resolve, reject) {
			thiz.resolves[newId] = resolve
			thiz.rejects[newId] = reject
      thiz.nextJob();
		}) 
  }

  nextJob() {

      if (this.jobs.length && this.pool.length) {

        const job = this.jobs.shift();
        const worker = this.pool.shift();
        const {id, url, msg} = job;

        worker[url](msg).then(this.resolves[id])
                        .catch(this.rejects[id])
                        .finally(() => {
                          delete this.rejects[id];
                          delete this.resolves[id];
                          this.pool.push(worker);
                          this.nextJob();
                        })

        // worker[url](msg).then(d => this.resolves[id](d))
        //                 .catch(e => this.rejects[id](e))
        //                 .finally(() => {
        //                   delete this.rejects[id];
        //                   delete this.resolves[id];
        //                   this.pool.push(worker);
        //                   this.nextJob();
        //                 })
      }
  }

}
