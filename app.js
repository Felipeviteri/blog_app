// Carregando os modulos
const express = require('express')
const handlebars = require('express-handlebars')
const bodyParser = require('body-parser')
const app = express()
const admin = require('./routes/admin') // Chama grupo de rotas admin
const path = require('path') // Chama diretorios e arquivos estaticos
const mongoose = require('mongoose')
const session = require('express-session')
const flash = require('connect-flash')


// Configuracoes

    // Sessao
    app.use(session({
        secret: "cursodenode",
        resave: true,
        saveUninitialized: true
    }))
    app.use(flash())
    // Midlleware
    app.use(function(req,res, next){
        res.locals.success_msg = req.flash("success_msg") // criar variavel global .locals
        res.locals.error_msg = req.flash("error_msg")
        next()
    })
    // Body-parser
    app.use(bodyParser.urlencoded({extended: true}))
    app.use(bodyParser.json())
    // Handelebars
    app.engine('handlebars', handlebars({defaultLayout: 'main'}))
    app.set('view engine', 'handlebars')
    // Mongoose
    mongoose.Promise = global.Promise;
    mongoose.connect('mongodb://localhost/blogapp', {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }).then(function(){
        console.log("MongoDB conectado...")
    }).catch(function(erro){
        console.log("Houve um erro ao se conectar o MongoDB: " + erro)
    })

    // Public

    // (arquivos estaticos css, Bootstrap, img)
    app.use(express.static(path.join(__dirname,"public")))

    // Midlleware

// Rotas
    app.get('/', function(req,res){
        res.send("Rota principal")
    })
    app.get('/posts', function(req,res){
        res.send("Lista posts")
    })

    app.use('/admin', admin)



// Outros
const PORT = 3000
app.listen(PORT, function(){
    console.log("Servidor Rodando!")
})
