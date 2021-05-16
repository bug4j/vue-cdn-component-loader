(function () {
    return {
        props:{
            loading:{
                type:Boolean,
                default:false,
            }
        },
        template:`<div class="loading-component">
                        <slot></slot>
                        <template v-if="loading">
                            <div class="loading-wrapper">
                                <div class="loading">
                                    <div class="loading-inner">
                                        <div class="loading-loader-container">
                                            <div class="la-timer la-2x">
                                                <div></div>
                                            </div>
                                        </div>
                                        <h3 class="loading-title"> fetch component resources ... </h3>
                                    </div>
                                </div>
                        
                            </div>
                            <div class="loading-mask"></div>
                        </template>
                    </div>`,
        data() {
            return {
                
            }
        },
        mounted() {
            if(Vue.version.charAt(0) == 3)
                this.$emit('hook:mounted');
        }

    }
})();