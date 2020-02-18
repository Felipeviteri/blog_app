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
require('./models/Postagem') //chama o arquivo de model
const Postagem = mongoose.model('Postagens') // passa a referencia do model para variavel



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

    // Rotas
    
    // Rota principal recebe do banco categoria as postagens nele inseridos
    app.get('/', function(req,res){
        Postagem.find().populate("categoria").sort({date: "desc"}).then(function(postagens){
            res.render("index", {postagens: postagens})
        }).catch(function(erro){
            req.flash("error_msg", "Houve um erro interno.")
            res.redirect('/404')
        })
    })

    app.get('/postagem/:slug', function(req,res){
        Postagem.findOne({slug: req.params.slug}).then(function(postagens){
            if(postagens){
                res.render('postagem/index', {postagens: postagens})
            } else {
                req.flash("error_msg", "Esta postagem nao existe")
                res.redirect('/')
            }
        }).catch(function(erro){
            console.log(erro)
            req.flash("error_msg", "Houve um erro interno")
            res.redirect('/')
        })
    })

    // Rota de erro da rota principal - (index)
    app.get('/404', function(req,res){
        res.send("Erro 404!")
    })

    // Rota dos Posts
    app.get('/posts', function(req,res){
        res.send("Lista posts")
    })

    // Rota Admin - 
    app.use('/admin', admin)



// Outros
const PORT = 3000
app.listen(PORT, function(){
    console.log("Servidor Rodando!")
})
