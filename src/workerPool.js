const workerizeWorker = require('workerize-loader!./worker'); // eslint-disable-line import/no-webpack-loader-syntax

// https://gist.github.com/605541#file_js_web_worker_pool.js,
// https://gist.github.com/kig/1188381
// Web Worker Pool
// size is the max number of arguments
export class WorkerPool {

  constructor(size){
    this.size = size;
    this.workers = 0,
    this.jobs = [];
    this.resolves = {}
    this.rejects = {}
    this.globalMsgId = 0
  }

    // url: the url of the worker script
    // msg: the initial message to pass to the worker
    // cb : the callback to recieve messages from postMessage.
    //      return true from cb to dismiss the worker and advance the queue.
    // ctx: the context for cb.apply
   queueJob(url, msg, cb, ctx, failure, success) {
		const newId = ++this.globalMsgId
    var job = {
        "url": url, // TODO make to name of fn
        "msg": msg, // argument of fn
        "cb" : cb,
        "failure": failure,
        "success": success,
        "ctx": ctx,
        "id": newId
    };
    this.jobs.push(job);
		const thiz = this;	
		return new Promise(function(resolve, reject) {
			thiz.resolves[newId] = resolve
			thiz.rejects[newId] = reject
			if (thiz.workers < thiz.size) thiz.nextJob();
		}) 
  }
    
  nextJob() {
      if (this.jobs.length) {

        var job    = this.jobs.shift(),
            worker = workerizeWorker(); 
        const {id} = job;
        this.workers++;

        const handler = ({target}) => {
            target[job.url](job.msg).then(d => this.resolves[id](d))
                                    .catch(e => this.rejects[id](e))
                                    .finally(() => {
																			delete this.rejects[id];
																			delete this.resolves[id];
																			forBoth();
																		})
        }

        const forBoth = e => { 
            worker.terminate();
            worker.removeEventListener('ready', handler);
            worker = null;
            this.workers--;
            this.nextJob();
        }

        worker.addEventListener('ready', handler);

      }
  }

}
