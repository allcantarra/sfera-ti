// Script Node.js para gerar o hash correto do bcrypt
// Rode este script no backend para gerar o hash
const bcrypt = require('bcrypt');

async function generateHash() {
    const senha = 'admin123';
    const saltRounds = 10;

    const hash = await bcrypt.hash(senha, saltRounds);
    console.log('===================================');
    console.log('Hash gerado para senha: admin123');
    console.log('===================================');
    console.log(hash);
    console.log('===================================');
    console.log('\nCopie este hash e substitua no init.sql');
}

generateHash();