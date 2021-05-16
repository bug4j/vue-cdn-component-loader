var vueComponentLoader = (function() {
    let loadedComponents = {}; // 保存已加载过的组件，方式重复加载
    let less = window.less || window.top.less || undefined;
    let isVue3 = Vue.version.charAt(0) > 2;

    function convertOptions(options) { 
        if(options.baseDir) {
            if(options.baseDir.lastIndexOf("/") < (options.baseDir.length - 1)) {
                options.baseDir = `${options.baseDir}/`;
            }
        }
        if(options.style != false && !options.style && options.baseDir) {
            options.style = `${options.baseDir}index.css`;
        }
        if(options.template != false && !options.template && options.baseDir) {
            options.template = `${options.baseDir}index.html`;
        } 
        if(!options.script && options.baseDir) {
            options.script = `${options.baseDir}index.js`;
        }
        if(options.lazy != false) {
            options.lazy = true;
        }
        options.id = options.id || options.name;
        return options;
     }
    
     function injectStyle(src) {
        if(!src) return;
        if(src && src.constructor.name === "String") {
            _ajax(src).then(resp => {
                let style = document.createElement("style");
                if(src.endsWith('.less') || ((src.indexOf("?") - 5) == src.indexOf(".less"))) {// less
                    if(!less || !less.render) {
                        console.error("provided a less style script but less lib was not found!");
                        return;
                    } else {
                        rawCode = less.render(resp,{rootPath:location.href,filename:'index.css'}).then(rendered => {
                            style.innerHTML = (rendered || {}).css || "";
                            document.head.append(style);
                        });
                    }
                } else {
                    style.innerHTML = resp;
                    document.head.append(style);
                }
            })
        } else if(src && Object.prototype.toString.call(src) === "[object Array]"){
            src.forEach(s => injectStyle(s));
        }
    }

    function _ajax(url,method) {
        return new Promise((resolve, reject) => {
            let req = new XMLHttpRequest();
            req.open((method || "GET"),url,true);
            req.onload = (e) => {
                let xhr = e.target;
                if(xhr.status === 200 || xhr.status === 304) {
                    if(xhr.responseType.toLowerCase().indexOf('application/json') >= 0) {
                        resolve(JSON.parse(xhr.responseText));
                    } else {
                        resolve(xhr.responseText);
                    }
                }
            }
            
            req.ontimeout = (e) => { reject(e) };
            req.onerror = (e) => { reject(e) };
            req.send();
        })
    }

    function doLoadComponent(options) {
        loadedComponents[options.id] = loadedComponents[options.id] || {
            id:options.id,
            options:options,
            component:null,
            promise: null,
        };
        if(!loadedComponents[options.id].promise) {
            injectStyle(options.style); // 加载样式
            let templatePromise = options.template ? _ajax(options.template) : Promise.resolve(`<div></div>`);
            loadedComponents[options.id].promise = templatePromise.then(template => {
                template = template || `<div></div>`;
                return _ajax(options.script).then(script => {
                    
                    let comConstr = eval(script); // 获取组件定义代码
                    // 整合组件html 模板
                    if(Object.prototype.toString.call(comConstr) === '[object Function]') {
                        if(comConstr.extendOptions && comConstr.mixin) {
                            let t = !!options.template ? template : (comConstr.extendOptions.template || template);
                            comConstr.mixin({template:t});
                        }
                    } else {
                        comConstr.template = !!options.template ? template : (comConstr.template || template); 
                    }
                    return Promise.resolve(comConstr);
                })
            });
            loadedComponents[options.id].component = () => loadedComponents[options.id].promise;
        }
        return loadedComponents[options.id].promise;
    }

    function assembleComponent(options) {
        let comp = null;
        if(options.lazy) {
            comp = isVue3 ? Vue.defineAsyncComponent(() => doLoadComponent(options)) : () => doLoadComponent(options);
        } else {
            let p = doLoadComponent(options);
            let f = () => p;
            comp = isVue3 ? Vue.defineAsyncComponent(f) : f;
        }
        return comp;
    }

    function getOne(opt) {
        if(!opt.id && opt.id != '0') throw Error('invalid id for you component');
        return assembleComponent(opt);
    }

    function getAll(options) {
        let arr = options;
        if(Object.prototype.toString.call(options) === '[object Object]') {
            arr = [convertOptions(options)];
        } else {
            arr = options.map(o => convertOptions(o));
        }
        let ps = [];
        let res = {};
        arr.forEach(option => {
            ps.push(Promise.resolve(getOne(option)).then(comp => {
                res[option.id] = comp;
                return Promise.resolve(comp);
            }));
        })
        return Promise.all(ps).then(comps => Promise.resolve(res));
    }

    function get(options) {
        return getOne(convertOptions(options));
    }

    return Object.freeze({   
        get,getAll,registerComponents:getAll, getConstructor: get
    });
})();