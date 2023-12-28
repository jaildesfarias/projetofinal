const Sequelize = require('sequelize');

const sequelize = new Sequelize('projetofinal', 'root', 'fofo', {
  host: 'localhost',
  dialect: 'mysql',
});

const Usuario = sequelize.define('Usuario', {
  nome: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
    },
  },
  email: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
      notEmpty: true,
    },
  },
  login: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true,
    },
  },
  senha: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
    },
  },
}, {
});

sequelize.sync()
  .then(() => {
    console.log('Modelo sincronizado com o banco de dados');
  })
  .catch((err) => {
    console.error('Erro ao sincronizar o modelo:', err);
  });

module.exports = Usuario;
