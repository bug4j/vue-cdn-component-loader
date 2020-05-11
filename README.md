# 远程组件加载简易实现方案
> vue很好用，组件开发大大提高了前端码农的工作效率，vue-cli结合webpack开发vue更是让前端程序员如虎添翼，但是有时候有不能使用webpack + cli(比如你碰上了一个NC的boss...)，那就只能使用cdn全量引入vue了。这自然加大了组件化开发的难度，而且一旦组件数量过多，index.html的内容就会变得过于臃肿，加载速度也没有保证。

> 为了解决上述问题，利用vue组件机制，开发了这么个cdn下远程组件加载库。
- [查看演示](./demo/index.html)
- [English doc](README-EN.md)

### 特点

 1. 可以从服务器远程加载组件
 2. 可以异步加载组件
 3. 支持less样式(需要自行引入less.js)

### 依赖

 - jquery.ajax

### 浏览器支持

 - 支持任何支持ES6规范的浏览器

### 使用说明
 - ###### api
 ```javascript
	vueComponentLoader.loadComponents(options):Promise<components:{id:constructor}>
	vueComponentLoader.getConstructor(options | id):Promise<constructor>
 ```
 - ###### 配置(options)
```javascript
{
	style:String | Array<string> | false, // 组件的样式，支持单个样式文件路径，或者多个样式文件路径数据,如果组件没有单独的样式，设置为 false
	template:String | false, // 组件html模板代码文件路径, 如果你的组件没有模板，或着 模板在 script 里面 或者使用函数式组件，设置为false
	script:String, // 组件的methods,data,等等定义信息
	baseDir:'./components/Demo/',// 组件代码的根目录，当style(或template或script) 没有配置时，默认会读取baseDir 下的 index.css(或 index.html 或 index.js)。
}
```
- ###### 组件开发规范
	- js 要求代码执行后返回一个vue组件构造函数（详情参考[vue组件开发文档](https://cn.vuejs.org/v2/guide/components-registration.html)）例如：
```javascript
(function() {
    return {
        data() {
            return {
                msg:'测试'
            }
        },
        methods: {
            fn() {
                alert(this.msg);
            }
        },
    }
})();
```
- style 任意可运行的css代码或者less代码,没有单独样式设置为false
- template vue正常解析的html 片段,没有template,或者在script中定义了template(配置了template属性，或者使用render函数)，设置为false

###### 用法
 你可以这样使用：
```javascript
vueComponentLoader.registerComponents({
    id:"test",
    baseDir:'./comps/',
    style:'./comps/index.less',
}).then(comps => {
	new Vue({
		el:"#app",
		components:{
			// 其他自定义组件
			...comps
		}
		data:() => {
			return {
				...
			}
		}
	})
})
```
或者这样使用:
```javascript
new Vue({
	el:"#app",
	components:{
			"demo":vueComponentLoader.getConstructor({
				id:'demo',
				baseDir:"./demo/"
			})
			// any other component definition
		}
	data:() => {
		return {
			// ...
		}
	}
})
```