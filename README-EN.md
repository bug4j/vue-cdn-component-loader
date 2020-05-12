# a resolution to load remote component while using vue cdn js
> make it possible to load a component from a remote location when using vue in cdn js model
- [view demo](./demo/index.html)
- [中文文档](README.md)

### features

 1. load component from any accessable server
 2. async component loading
 3. work fine with less style (require less.js)

### requirements
 - vuejs
 - less (only when you component using less)

### Borwser support

 - support any browser that support es6

### instruction
 
 - ###### api
 ```javascript
	vueComponentLoader.loadComponents(options | Array<options>):Promise<components:{id:constructor}>
	vueComponentLoader.getConstructor(options | id):Promise<constructor>
 ```
 
 - ###### congfigurations(options)
```javascript
{
	style:String | Array<string> | false, // component's style , a style file url or an array of style urls, if your component has no style script,set it false
	template:String | false, // component's html template file url,if your component has no templete , or you choose to defeine template in script file or you are using a functional component, set it to false
	script:String, // component's methods,data... definition script file url
	baseDir:'./components/Demo/',// the work path of your component, if style url (or template url or script url) is not present in the config, it will use baseDir/index.css(or baseDir/index.html or baseDir/index.js) as fallback;
}
```
- ###### development guide
	- js you can write an js code you want as long as your code return an object that vue can recognize as a component , read the vue official document for more（详情参考[vue component development guide ](https://cn.vuejs.org/v2/guide/components-registration.html)）,here is an example:
```javascript
(function() {
	function sayHello() {
		console.log("hello world");
	}
    return {
        data() {
            return {
                msg:'测试'
            }
        },
        methods: {
            fn() {
                alert(this.msg);
			},
			sayHello
        },
    }
})();
```
- style: any correct css code or less code, or false if your component has no style
- template: any correct html code or false if your component has no template ,or you'd prefer to define template in the script, or you are using render function.

###### usage
u can use like this:
```javascript
vueComponentLoader.registerComponents({
    id:"test",
    baseDir:'./comps/',
	style:'./comps/index.less',
	async:false,// if you want your component load when using it, remove this filed or set it to true
}).then(comps => {
	new Vue({
		el:"#app",
		components:{
			...comps,
			// any other component declarations
		}
		data:() => {
			return {
				// ...
			}
		}
	})
})
```
or u can use it like this:
```javascript
new Vue({
	el:"#app",
	components:{
			"demo":vueComponentLoader.getConstructor({
				id:'demo',
				baseDir:"./demo/"
			})
			// any other component declarations
		}
	data:() => {
		return {
			// ...
		}
	}
})
```