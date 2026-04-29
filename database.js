import { Sequelize } from "sequelize";

//sesuaikan nama database kita dgn yg dibawah, dan untuk password boleh diubah saat pull
//sebelum push kosongkan bagian password database nya untuk mempermudah kita
<<<<<<< HEAD
const db = new Sequelize('project_uts_db', 'root', '150605', {
=======
const db = new Sequelize('project_uts_db', 'root', 'Lohengr@M|945', {
>>>>>>> c73987a078e3ec2ffa312d3f81ba1352dbda5bf3
    host: 'localhost',
    dialect: 'mysql',
    logging: false,
});

export default db;
