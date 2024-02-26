async function saveCustomer(ctx) {
    ctx.body = 'save customer';
}

async function getCustomer(ctx) {
    ctx.body = 'get customer';
}

async function patchCustomer(ctx) {
    ctx.body = 'patch customer';
}

async function deleteCustomer(ctx) {
    ctx.body = 'delete customer';
}

module.exports = {
    saveCustomer,
    getCustomer,
    patchCustomer,
    deleteCustomer
}