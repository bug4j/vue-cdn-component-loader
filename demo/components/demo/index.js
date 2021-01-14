(function() {
    return {
        // template:'<h1>{{ msg }}</h1>',
        data() {
            return {
                msg:"hello world"
            }
        },
        methods: {
            foo() {
            }
        },
        mounted() {
            this.$emit('mounted',this);
        }
    }
})();