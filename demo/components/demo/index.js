(function() {
    return Vue.extend({
        // template:'<h1>{{ msg }}</h1>',
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
        }
    })
})();