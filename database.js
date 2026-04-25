import { Sequelize } from "sequelize";

const db = new Sequelize('project_uts_db', 'root', '150605', {
    host: 'localhost',
    dialect: 'mysql',
    logging: true
});

export default db;