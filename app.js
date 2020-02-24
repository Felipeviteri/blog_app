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
require('./models/Categoria') //chama o arquivo de model
const Categoria = mongoose.model('Categorias') // passa a referencia do model para variavel
const usuarios = require('./routes/usuarios')
const passport = require('passport')
require('./config/auth')(passport) // chama o arquivo de config auth
const db = require('./config/db')// chama o arquivo de config db 


// Configuracoes

    // Sessao
    app.use(session({
        secret: "cursodenode",
        resave: true,
        saveUninitialized: true
    }))
    // Passport e flash (sempre nesta ordem)
    app.use(passport.initialize())
    app.use(passport.session())
    app.use(flash())
    // Midlleware
    app.use(function(req,res, next){
        res.locals.success_msg = req.flash("success_msg") // criar variavel global .locals
        res.locals.error_msg = req.flash("error_msg")
        res.locals.error = req.flash("error")
        res.locals.user = req.user || null; //armazenar dados do usuario logado (passport)
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
    mongoose.connect(db.mongoURI, {
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

    // Rota das Categorias
    app.get('/categorias', function(req,res){
        Categoria.find().then(function(categorias){
            res.render('categorias/index', {categorias: categorias})
        }).catch(function(erro){
            req.flash("error_msg", "Houve um erro interno ao listar as categorias")
            req.redirect('/')
        })
    })

    // Rota links Categorias
    app.get('/categorias/:slug', function(req,res){
        Categoria.findOne({slug: req.params.slug}).then(function(categoria){
            if(categoria){
                Postagem.find({categoria: categoria._id}).then(function(postagens){
                    console.log(postagens)
                    console.log(categoria)
                    res.render('categorias/postagens', {postagens: postagens, categoria: categoria})
                }).catch(function(erro){
                    console.log(erro)
                    console.log(postagens)
                    req.flash("error_msg", "Houve um erro ao listar as postagens !")
                })
            } else {
                req.flash("error_msg", "Esta categoria nao existe")
                res.redirect('/')
            }
        }).catch(function(erro){
            console.log(erro)
            req.flash("error_msg", "Houve um erro interno ao carregar a pagina desta categoria")
            res.redirect('/')
        })
    })



    // Rota Admin - 
    app.use('/admin', admin)


    // Rota Usuarios
    app.use('/usuarios', usuarios)



// Outros
const PORT = process.env.PORT || 3000
app.listen(PORT, function(){
    console.log("Servidor Rodando!")
})
