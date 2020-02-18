const express = require('express')
const router = express.Router()
//usando o model de forma externa dentro do mongoose
const mongoose = require('mongoose') // importa mongoose
require('../models/Categoria') //chama o arquivo de model
const Categoria = mongoose.model('Categorias') // passa a referencia do model para variavel
require('../models/Postagem') //chama o arquivo de model
const Postagem = mongoose.model('Postagens') // passa a referencia do model para variavel

router.get('/', function(req,res){
    res.render("admin/index")
})


router.get('/posts', function(req, res){
    res.send("pagina de Posts")
})

router.get('/categorias', function(req, res){
    //funcao para listar todos os documentos que existe
    Categoria.find().sort({date:'desc'}).then(function(categorias){
        res.render("admin/categorias", {categorias: categorias})
    }).catch(function(erro){
        req.flash("error_msg","Houve um erro ao listar as categorias")
        res.redirect("/admin")
    })
})

router.get('/categorias/add', function(req,res){
    res.render("admin/addCategorias")
})


// --- Criar categoria com validacao de campos via POST
router.post('/categorias/nova', function(req,res){

    // Cadastrar uma validacao manual com array
    var erros = []

    //verificando se o nome existe, ou e undefined ou null
    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
        erros.push({texto: "Nome Invalido"}) //grava o erro no array de erros
    }

    //verificando se o slug existe, ou e undefined ou null
    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
        erros.push({texto: "Slug Invalido"}) //grava o erro no array de erros
    }

    //verificando se o nome tem mais de 2 caracteres
    if(req.body.nome.length < 2){
        erros.push({texto: "Nome da Categoria muito pequeno"}) //grava o erro no array de erros
    }

    // Se ele encontrar algum erros, ele carrega os erros na tela, senao grava na variavel
    if(erros.length > 0){
        res.render("admin/addCategorias", {erros: erros}) 
    } else {
        const novaCategoria = {
            nome: req.body.nome,
            slug: req.body.slug
        }
    
    // Salva os dados no objeto Categoria e carrega na tela msg de success ou error
    // e em seguida redireciona para a pagina desejada
        new Categoria(novaCategoria).save().then(function(){
            console.log("Categoria criada com sucesso!")
            req.flash("success_msg", "Categoria criada com sucesso!")
            res.redirect("/admin/categorias")
        }).catch(function(erro){
            console.log("Houve um erro ao salvar uma categoria: " + erro)
            req.flash("error_msg", "houve um erro ao salvar a categoria, tente novamente!")
            res.redirect("/admin")
        })
    }
})

// --- Rota para coletar e editar categoria ---
router.get("/categorias/editar/:id", function(req,res){
    Categoria.findOne({_id:req.params.id}).then(function(categoria){
        res.render("admin/editCategorias", {categoria: categoria})
    }).catch(function(erro){
        req.flash("error_msg", "Esta categoria nao existe")
        res.redirect("/admin/categorias")
    })
})

// --- Editando as categorias via POST ---
router.post("/categorias/editar", function(req,res){
    Categoria.findOne({_id: req.body.id}).then(function(categoria){

        categoria.nome = req.body.nome
        categoria.slug = req.body.slug

        categoria.save().then(function(){
            req.flash("success_msg", "Categoria editada com sucesso!")
            res.redirect("/admin/categorias")
        }).catch(function(erro){
            req.flash("error_msg", "houve um erro interno ao salvar a edicao da categoria")
            res.redirect("/admin/categorias")
        })

    }).catch(function(erro){
        req.flash("error_msg", "houve um erro ao ediar a categoria")
        res.redirect("/admin/categorias")
    })
})

// --- Deletando as categorias via POST ---
router.post("/categorias/deletar", function(req,res){
    Categoria.deleteOne({_id: req.body.id}).then(function(){
        req.flash("success_msg", "Categoria Deletada com sucesso!")
        res.redirect("/admin/categorias")
    }).catch(function(erro){
        req.flash("error_msg", "Houve um erro ao deletar a categoria")
        res.redirect("/admin/categorias")
    })
})

router.get("/postagens", function(req,res){
    Postagem.find().populate('categoria').sort({date: 'desc'}).then(function(postagens){
        res.render("admin/postagens", {postagens: postagens})
    }).catch(function(erro){
        req.flash("error_msg", "Houve um erro ao listar as postagens")
        res.redirect("/admin")
    })
})

router.get("/postagens/add", function(req,res){
    Categoria.find().then(function(categorias){
        res.render("admin/addPostagens", {categorias: categorias})
    }).catch(function(erro){
        req.flash("error_msg", "Houve um erro ao carregar o formulario")
        res.redirect("/admin")
    })
})

router.post("/postagens/nova", function(req,res){

    var erros = []

    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
        erros.push({texto: "Slug Invalido"})
    }

    if(req.body.titulo.length < 2){
        erros.push({texto: "Titulo da Postagem muito pequeno"})
    }

    if(req.body.categoria == "0"){
        erros.push({texto: "Categoria Invalida, registre uma categoria"})
    }

    if(erros.length > 0){
        res.render("admin/addPostagens", {erros: erros}) 
    } else {
        const novaPostagem = {
            titulo: req.body.titulo,
            slug: req.body.slug,
            descricao: req.body.descricao,
            conteudo: req.body.conteudo,
            categoria: req.body.categoria
        }

        new Postagem(novaPostagem).save().then(function(){
            console.log("Postagem criada com sucesso!")
            req.flash("success_msg", "Postagem criada com sucesso!")
            res.redirect('/admin/postagens')
        }).catch(function(erro){
            console.log("Houve um erro ao salvar uma postagem: " + erro)
            req.flash("error_msg", "houve um erro ao salvar a postagem, tente novamente!")
            res.redirect('/admin/postagens')
        })
    }
})

router.get('/postagens/editar/:id', function(req, res){

    Postagem.findOne({_id: req.params.id}).then(function(postagens){
        Categoria.find().then(function(categorias){
            res.render('admin/editPostagens', {categorias: categorias, postagens: postagens})
        }).catch(function(erro){
        req.flash("error_msg", "houve um erro ao listar as categorias")
        res.redirect('/admin/postagens')
    })

    }).catch(function(erro){
        req.flash("error_msg", "houve um erro ao carregar o formulario de edicao!")
        res.redirect('/admin/postagens')
    })
})

router.post('/postagens/editar', function(req,res){
    // ------------------ fazer validadacao--------------------------
    Postagem.findOne({_id: req.body.id}).then(function(postagem){
        postagem.titulo = req.body.titulo
        postagem.slug = req.body.slug
        postagem.descricao =req.body.descricao
        postagem.conteudo= req.body.conteudo
        postagem.categoria= req.body.categoria

        postagem.save().then(function(){
            req.flash("success_msg", "Postagem editada com sucesso!")
            res.redirect('/admin/postagens')
        }).catch(function(erro){
            req.flash("error_msg", "Erro interno")
            res.redirect('/admin/categorias')
        })


    }).catch(function(erro){
        console.log(erro)
        req.flash("error_msg", "Houve um erro ao salvar a edicao!")
        res.redirect('/admin/postagens')
    })
})

// --- Deletando Postagens --- METODO 2
router.get('/postagens/deletar/:id', function(req,res){
    Postagem.deleteOne({_id: req.params.id}).then(function(){
        req.flash("success_msg", "Postagem deletada com sucesso!")
        res.redirect('/admin/postagens')
    }).catch(function(erro){
        req.flash("error_msg", "Erro interno")
        res.redirect('/admin/categorias')
    })
})


module.exports = router