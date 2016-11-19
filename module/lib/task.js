import _ from 'lodash';

const 
    PRIORITY = { h: 10, n: 5, l: 1 },
    ERROR_COUNT = 2

function getUUID() {
    var id = setTimeout(x=>x,0);
    clearTimeout(id);
    return id;
};

let taskHandler = function taskHandler () {
    if (!(this instanceof taskHandler)) {
        return new taskHandler();
    }
    this.blocks = [];  // 请求块数
    this.actives = []; // 当前正在请求的队列
    this.currentBlock; // 当前请求块
    this.iis = 5; // 最大并发数
}

taskHandler.prototype = {
    /*
     * 添加名称为name模块到模块队
     */
    addBlock: function (name) {
        var block = this.findBlock(name);
        if (block) {
            this.removeBlock(name);
        } else {
            block = requestBlock(name);
        }
        this.blocks.push(block);
        return block;
    },
    /*
     * 查找名称为name的Block
     */
    findBlock: function (name) {
        return _.find(this.blocks, { name: name });
    },
    /*
     * 删除请求队列块 
     */
    removeBlock: function (name) {
        _.remove(this.blocks, function (block) {
            return block.name == name;
        });
    },
    /*
     * 添加请求
     */
    addRequest:function (request, blockName) {
        var block = this.findBlock(blockName);
        if (!block) {
            block = this.addBlock(blockName);
        }
        if(!request.def){
            request = Object.assign( {
                taskid: getUUID(),
                waiting: true,
                priority: 5,
                blockName: blockName
            }, request);
            request.def=new Promise((resolve, reject)=>{
                 request.resolve=resolve;
                 request.reject=reject;
                 
            });
        }

        block.add(request);
        this.sendRequest();
        return request.def;
    },
    /*
     * 发送请求
     */
    sendRequest: function () {
    	console.log('this.actives.length');
    	console.log(this.actives.length);
        if (this.actives.length >= this.iis) {
        	console.log('now waiting for other task exec');
        	return;
        }
        let that = this;
        var request = that.getRequest();
        if (request && request.waiting) {
            request.waiting = false;
            that.actives.push(request);
        	request.run().then(function(result){
                _.remove(that.actives,  (req) => req.taskid == request.taskid);
        		request.resolve(result);
        	},function(err){
        		
                // console.log(err);
                _.remove(that.actives,  (req) => req.taskid == request.taskid);
            	 if (request.errorCount >= ERROR_COUNT) {
                    console.log(`error count reach max ERROR_COUNT ${ERROR_COUNT}!`);
        	  	    request.reject(err);
                }
                else {
                request.waiting = true;
                request.priority -= 1;
                request.errorCount = (request.errorCount || 0) + 1;
                console.log('error happend!queue will try again!');
                that.addRequest(request, request.blockName);
                }
            }).then(()=>{
              that.sendRequest();
            });

            
        }
    },
    /*
     * 获取请求
     */
    getRequest: function () {
        var request;
        for (var l = this.blocks.length; l--;) {
            request = this.blocks[l].getRequest();
            if (request) {
                break;
            }
        }
        return request;
    }
}

const  task = taskHandler();


var requestBlock = function (name) {
    if (!(this instanceof requestBlock)) {
        return new requestBlock(name);
    }
    this.name = name;
    this.queue = [];
}

requestBlock.prototype = {
    add: function (request) {
        // 合并请求（暂未实现）
        var i = 0;
        for (var l = this.queue.length; i < l; i++) {
            if (this.queue[i].priority <= request.priority) {
                break;
            }
        }
        this.queue.splice(i, 0, request);
    },
    getRequest: function (request) {
        while (true) {
            var request = this.queue.shift();
            if (!request || request.waiting) {
                return request;
            }
        }
    }
}

module.exports = (function () {
    function buildRequest(option) {
        return {
        	taskid: option.taskid,
            run: option.run,
            priority: PRIORITY[option.priority] || 5
        };
    }

    return {
        addTask: function (option,taskname='noname') {
            return task.addRequest(buildRequest(option), taskname);
        },
        removeTask: function (option) {
            return task.addRequest(buildRequest(option), taskname);
        },
        editTask: function (option) {
            return task.addRequest(buildRequest(option), taskname);
        },
        handler: task
    }
}());