const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const path = require('path');
const Usuario = require('./models/usuarios');
const app = express();

app.use(express.urlencoded({ extended: true }));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

const sequelize = Usuario.sequelize;

sequelize.sync()
    .then(() => {
        console.log('Modelo Usuario sincronizado com o banco de dados');
    })
    .catch((err) => {
        console.error('Erro ao sincronizar o modelo Usuario:', err);
    });

app.get('/logout', (req, res) => {
    res.render('principal');
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.get('/', (req, res) => {
    res.render('principal');
});

app.get('/cadastro', (req, res) => {
    res.render('cadastrarUsuario');
});

app.get('/busca', (req, res) => {
    res.render('buscarUsuario');
});

app.post('/cadastrar', async (req, res) => {
    try {
        const { nome, email, login, senha } = req.body;
        const hashedSenha = await bcrypt.hash(senha, 10);
        await Usuario.create({ nome, email, login, senha: hashedSenha });
        res.send('Usuário cadastrado com sucesso!');
    } catch (err) {
        res.send(`Erro no cadastro: ${err.message}`);
    }
});

app.post('/buscar', async (req, res) => {
    try {
        const { nome } = req.body;
        const usuarioEncontrado = await Usuario.findOne({
            where: { nome },
        });
        res.render('resultadoBusca', { usuarioEncontrado });
    } catch (err) {
        res.send(`Erro na busca: ${err.message}`);
    }
});

app.get('/editar/:id', async (req, res) => {
    try {
        const usuarioId = req.params.id;
        const usuarioParaEditar = await Usuario.findByPk(usuarioId);

        res.render('editarUsuario', { usuarioParaEditar });
    } catch (err) {
        res.send(`Erro ao carregar formulário de edição: ${err.message}`);
    }
});

app.post('/editar/:id', async (req, res) => {
    try {
        const usuarioId = req.params.id;
        const { nome, email, login, senha } = req.body;
        const usuarioAtualizado = {
            nome, email, login, senha: senha ? await bcrypt.hash(senha, 10) : undefined,
        };
        await Usuario.update(usuarioAtualizado, { where: { id: usuarioId } });
        res.send('Edição feita com sucesso!');
    } catch (err) {
        res.send(`Erro na edição: ${err.message}`);
    }
});

app.get('/excluir/:id', async (req, res) => {
    try {
        const usuarioId = req.params.id;
        await Usuario.destroy({ where: { id: usuarioId } });
        res.send('Usuário excluído com sucesso!');
    } catch (err) {
        res.send(`Erro na exclusão: ${err.message}`);
    }
});

app.use(session({
    secret: '1234',
    resave: false,
    saveUninitialized: true,
}));

app.post('/login', async (req, res) => {
    try {
        const { login, senha } = req.body;
        const usuarioEncontrado = await Usuario.findOne({
            where: { login },
        });

        if (usuarioEncontrado) {
            const senhaCorreta = await bcrypt.compare(senha, usuarioEncontrado.senha);

            if (senhaCorreta) {
                req.session.usuario = {
                    id: usuarioEncontrado.id,
                    nome: usuarioEncontrado.nome,
                    login: usuarioEncontrado.login,
                };
                res.redirect('/home');
            } else {
                res.send('Senha incorreta');
            }
        } else {
            res.send('Usuário não encontrado');
        }
    } catch (err) {
        res.send(`Erro no login: ${err.message}`);
    }
});

app.get('/home', (req, res) => {
    const usuarioLogado = req.session.usuario;
    res.render('home', { usuarioLogado });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
