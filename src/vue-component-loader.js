/**
 * cdn vuejs 模块加载器
 * @author bug4j
 * @document https://github.com/bug4j/vue-cdn-component-loader
 */
let vueComponentLoader = (function() {
    let loadedComponents = {}; // 保存已加载过的组件，方式重复加载
    let less = window.less || window.top.less || undefined;
    function doLoadComponent(options) {
        injectStyle(options.style); // 加载样式
        let templatePromise = options.template ? _ajax(options.template) : new Promise(resolve => {resolve(`<template></template>`)});
        return templatePromise.then(template => {
            template = template || `<template></template>`;
            return _ajax(options.script).then(script => {
                let comConstr = eval(script); // 获取组件定义代码
                // 整合组件html 模板
                if(comConstr.constructor.name === 'Function') {
                    if(comConstr.extendOptions && comConstr.mixin) {
                        let t = !!options.template ? template : (comConstr.extendOptions.template || template);
                        comConstr.mixin({template:t});
                    }
                } else {
                    comConstr.template = !!options.template ? template : (comConstr.template || template); 
                }
                return new Promise(resolve => {resolve(comConstr);})
            })
        })
    }
    function loadComponent(opts) {
        let options = convertOptions(opts); // 转换配置
        if(loadedComponents[options.id]) { // 判断是否已经被加载
            return new Promise(resolve => {
                resolve(loadedComponents[options.id]); // 已经被加载，直接返回
            })
        } else {
            if(options.async) { // 异步组件
                return new Promise(resolve => {
                    let res = {
                        id:options.id,
                        options:options,
                        constructor:function() {
                            return doLoadComponent(options);
                        }
                    }
                    loadedComponents[options.id] = res; // 保存当前组件加载结果
                    resolve(res);
                }).catch(e => {});
            } else {
                return new Promise(resolve => {
                    doLoadComponent(options).then(comConstr => {
                        let res = {
                            id:options.id,
                            options:options,
                            constructor:comConstr
                        }
                        loadedComponents[options.id] = res; // 保存当前组件加载结果
                        resolve(res);
                    })
                })
            }
        }
    }

    function loadComponents(options) {
        if(options) {
            let p = undefined;
            if(options.constructor.name === 'Array') {
                let pros = [];
                options.forEach(opt => {
                    pros.push(loadComponent(opt));
                })
                p = Promise.all(pros);
            } else {
                p = Promise.all([loadComponent(options)]);
            }
            return p.then(resp => {
                let res = {};
                resp.forEach(comp => {
                    comp.constructor.name = comp.id || comp.name;
                    res[comp.id] = comp.constructor;
                })
                return new Promise(resolve => {resolve(res)});
            })
        } else {
            return Promise.all(new Promise(resolve => {resolve()}));
        }
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
        } else if(src && src.constructor.name === "Array"){
            src.forEach(s => injectStyle(s));
        }
    }

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

        if(options.async != false) {
            options.async = true;
        }

        options.id = options.id || options.name;
        return options;
     }

    function getConstructor(opt) {
        if((opt.constructor.name === 'String' && loadedComponents[opt]) || (opt.constructor.name === 'Object' && loadedComponents[opt.id])) {
            let id = opt.id || opt;
            return function() {
                return loadedComponents[id].constructor();
            }
        } else if(opt.constructor.name === 'Object' && !loadedComponents[opt.id]){
            let options = convertOptions(opt);
            let constr = function () {
                return doLoadComponent(opt).then(constr => {
                    let res = {
                        id:options.id,
                        options:options,
                        constructor:constr
                    }
                    loadedComponents[options.id] = res; // 保存当前组件加载结果
                    return new Promise(resolve => { resolve(constr); });
                })
            }
            loadedComponents[options.id] = {
                id:options.id,
                options:options,
                constructor:constr
            }; 
            return constr;
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
    return {
        registerComponents:loadComponents,
        getConstructor:getConstructor
    };
})();