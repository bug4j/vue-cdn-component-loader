let vueCmponentLoader = (function() {
    let loadedComponents = {}; // 保存已加载过的组件，方式重复加载
    let less = window.less || window.top.less || undefined;
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
                            injectStyle(options.style); // 加载样式
                            return Promise.resolve($.get(options.template)).then(template => {
                                return new Promise(resolve => {
                                    $.get(options.script).then(script => {
                                        let comConstr = eval(script); // 获取组件定义代码
                                        comConstr.template = template; // 整合组件html 模板
                                        resolve(comConstr);
                                    })
                                })
                            });
                        }
                    }
                    loadedComponents[options.id] = res; // 保存当前组件加载结果
                    resolve(res);
                });
            } else {
                injectStyle(options.style);
                return new Promise(resolve => {
                    let compConstr = null;
                    $.ajax({
                        async:false,
                        url:options.script,
                        dataType:"script",
                        success:(resp) => {
                            compConstr = eval(resp);
                        }
                    })
                    $.ajax({
                        async:false,
                        url:options.template,
                        success:resp => {
                            compConstr.template = resp;
                        }
                    }).catch(e => {})
                    let res = {
                        id:options.id,
                        options:options,
                        constructor:compConstr
                    };
                    loadedComponents[options.id] = res;
                    resolve(res);
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
        if(src && src.constructor.name === "String") {
            $.get(src).then(resp => {
                let style = document.createElement("style");
                if(/.*[\.less]\?*/.test(src)) {// less
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
        if(!options.style && options.baseDir) {
            options.style = `${options.baseDir}index.css`;
        }
        if(!options.template && options.baseDir) {
            options.template = `${options.baseDir}index.html`;
        }
        if(!options.script && options.baseDir) {
            options.script = `${options.baseDir}index.js`;
        }
        if(options.async != false && !options.async) {
            options.async = true;
        } else {
            options.async = true;
        }
        options.id = options.id || options.name;
        return options;
     }

    return {
        registerComponents:loadComponents
    };
})();