const Loading = vueComponentLoader.get({
    id:"loading",
    baseDir:'./components/loading/',
    template:false,
    style:'./components/loading/index.less',
    async:false,
});

const routes = [{
    path:'/router-home',
    name:'home',
    component: vueComponentLoader.get({
        id:"/router-home",
        baseDir:'./components/home/',
        style:'./components/home/index.less',
        lazy:false,
    })
},{
    path:'/router-demo',
    name:'router-demo',
    component: vueComponentLoader.get({
        id:"router-demo",
        baseDir:'./components/router-demo/',
        style:'./components/router-demo/index.less',
    })
}];

let options = {
    data() {
        return {
            showComp:false,
            loading:false,
            compId:'hello-world'
        }
    },
    methods: {
        loaded() {
            document.querySelectorAll('.code').forEach(block => {
                if(block.classList.contains('lang-javascript')) {
                    block.innerHTML = js_beautify(block.innerHTML.replace(/\s{2,}/g,' '));
                }
                hljs.highlightBlock(block);
            });
        }
    },
    components:{
        Loading,
    }
}