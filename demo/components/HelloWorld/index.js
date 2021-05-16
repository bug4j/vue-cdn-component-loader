(function () {
    return {
        data() {
            return {
                showRouter: false
            }
        },
        methods:{
            clicked() {
                this.showRouter = true;
                this.$nextTick(() => {
                    this.$router.push({ path: '/router-demo' })
                })
            }
        }
    }
})();