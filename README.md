# 远程组件加载简易实现方案
> vue很好用，组件开发大大提高了前端码农的工作效率，vue-cli结合webpack开发vue更是让前端程序员如虎添翼，但是有时候有不能使用webpack + cli(比如你碰上了一个NC的boss...)，那就只能使用cdn全量引入vue了。这自然加大了组件化开发的难度，而且一旦组件数量过多，index.html的内容就会变得过于臃肿，加载速度也没有保证。

> 为了解决上述问题，利用vue组件机制，开发了这么个cdn下远程组件加载库。
- [查看Vue2演示](https://bug4j.github.io/vue-cdn-component-loader/demo/index.html)
- [查看Vue3演示](https://bug4j.github.io/vue-cdn-component-loader/demo/index-v3.html)
- [English doc](README-EN.md)

### 特点

 1. 可以从服务器远程加载组件

 2. 可以异步加载组件

 3. 支持less样式(需要自行引入less.js)

### 缺陷
暂不支持 vue3 Composition Api

### 依赖
 - vuejs
 - less.js (仅仅当你的组件使用less样式时)

### 浏览器支持

 - 支持任何支持ES6规范的浏览器

### 使用说明
 - ###### api
 ```javascript
	vueComponentLoader.getAll(options | Array<options>):Promise<components:{id:constructor}>
	vueComponentLoader.get(options | id):Promise<constructor>
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
  js 要求代码执行后返回一个vue组件构造函数，或者一个options对象，或者一个能resolve前面两者的promise（详情参考[vue组件开发文档](https://cn.vuejs.org/v2/guide/components-registration.html)）例如：
```javascript
(async function() {
    const { default: { message:msg } } = await import('/module.js');
    return {
        data() {
            return {
                msg
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
vueComponentLoader.getAll({
    id:"test",
    baseDir:'./comps/',
    style:'./comps/index.less',
}).then(comps => {
	new Vue({
		el:"#app",
		components:{
			...comps
			// 其他自定义组件
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
			"demo":vueComponentLoader.get({
				id:'demo',
				baseDir:"./demo/"
			})
			// 其他自定义组件
		}
	data:() => {
		return {
			// ...
		}
	}
})
```