(function() {
    return Vue.component("aa",{
        data() {
            return {
                msg:"hello world"
            }
        },
        methods: {
            foo() {
                this.$message.success("wow, it worked !")
            }
        },
        mounted() {
            this.$emit('mounted',this);
        },
        template:`<div class="demo-component">
                <div class="title">test component</div>
                <a-button @click="foo" type="primary" icon="smile">{{ msg }}</a-button>
            </div>`
    })
})();