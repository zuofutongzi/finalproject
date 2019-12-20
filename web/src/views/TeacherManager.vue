<template>
    <div class="teacherManager">

    </div>
</template>

<script>
export default {
    components: {},
    props: {},
    data() {
        return {
            user: {},
            userDetail: {}
        };
    },
    watch: {},
    computed: {},
    methods: {},
    created() {},
    mounted() {
        this.user = this.$store.getters.user;
        var options = {
            identity: 'teacher'
        }
        this.$axios
            .get('/api/user', {params: options})
            .then(res => {
                if(res.status == 200){
                    this.userDetail = res.data;
                    console.log(this.userDetail);
                }
            })
    }
};
</script>

<style scoped>
</style>