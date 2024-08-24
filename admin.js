const TechAdmin = require('./models/admin');

async function createAdmin() {
    try {
        const existingUser = await TechAdmin.findOne({ username: 'admin' });
        if (existingUser) {
        } else {
            const newUser = await TechAdmin.create({
                username: 'admin',
                password: '1234'
            });
            console.log('Admin user created:', newUser);
        }
    } catch (err) {
        console.error('Error during admin creation:', err);
    }
}
createAdmin();
