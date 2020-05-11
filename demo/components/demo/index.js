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
        }
    })
})();