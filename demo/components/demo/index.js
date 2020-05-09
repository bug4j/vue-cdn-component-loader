(function() {
    return {
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
    }
})();