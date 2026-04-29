import { Sequelize } from "sequelize";

//sesuaikan nama database kita dgn yg dibawah, dan untuk password boleh diubah saat pull
//sebelum push kosongkan bagian password database nya untuk mempermudah kita
<<<<<<< HEAD
const db = new Sequelize('project_uts_db', 'root', 'Ntahakulupa21', {
=======
const db = new Sequelize('project_uts_db', 'root', '', {
>>>>>>> 08352c32e77a9000055a02019499f86872768771
    host: 'localhost',
    dialect: 'mysql',
    logging: false,
});

export default db;
