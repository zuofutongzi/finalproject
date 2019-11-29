const REST_Routes = [
    {
        prefix: '/user',
        pin: 'module:user,if:*',
        map: {
            load: {
                GET: true,
                name: '',
                suffix: '/:id'
            },
            edit: {
                PUT: true,
                name: '',
                suffix: '/:id'
            },
            create: {
                POST: true,
                name: ''
            },
            // delete: {
            //     DELETE: true,
            //     name: '',
            //     suffix: '/:id'
            // },
        }
    }
]

function user(options){
    this.add('module:user,if:load',(msg,done) => {
        const { id } = msg.args.params;
        done(null, {id: id});
    })
}

module.exports = {
    init: user,
    routes: REST_Routes
}