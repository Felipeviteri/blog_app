const express = require('express')
const router = express.Router()
//usando o model de forma externa dentro do mongoose
const mongoose = require('mongoose') // importa mongoose
require('../models/Usuario') //chama o arquivo de model
const Usuario = mongoose.model('Usuarios') // passa a referencia do model para variavel
const bcrypt = require('bcryptjs')// Hash para senhas
const passport = require('passport')


// --- Rota registro ---
router.get('/registro', function(req,res){
    res.render('usuarios/registro')
})

// --- Rota registro metodo POST ---
router.post('/registro', function(req,res){
    var erros = []

    if(!req.body.nome || typeof req.body.nome == undefined || typeof req.body.nome == null){
        erros.push({texto: "Nome em branco ou invalido."})
    }

    if(!req.body.email || typeof req.body.email == undefined || typeof req.body.email == null){
        erros.push({texto: "E-mail em branco ou invalido."})
    }

    if(!req.body.senha || typeof req.body.senha == undefined || typeof req.body.senha == null){
        erros.push({texto: "Senha em branco ou invalida."})
    }

    if(req.body.senha.length < 4){
        erros.push({texto: "Senha invalida, digite uma senha com 4 digitos ou mais."})
    }

    if(req.body.senha != req.body.senha2){
        erros.push({texto: "As senha sao diferente, tente novamente"})
    }

    if(erros.length > 0){
        res.render('usuarios/registro', {erros: erros})
    }else {
        Usuario.findOne({email: req.body.email}).then(function(usuario){
            if(usuario){
                req.flash("error_msg", "Ja existe uma conta com este e-mail no sistema.")
                res.redirect('/usuarios/registro')
            } else {
                const novoUsuario = new Usuario({
                    nome: req.body.nome,
                    email: req.body.email,
                    senha: req.body.senha
                })            
                //encryptar a senha
                bcrypt.genSalt(10, function(erro, salt){
                    bcrypt.hash(novoUsuario.senha, salt, function(erro, hash){
                        if(erro) {
                            req.flash("error_msg", "Houve um erro ao salvar o usuario.")
                            res.redirect('/')
                        }
                        //passando o hash para o campo senha
                        novoUsuario.senha = hash

                        novoUsuario.save().then(function(){
                            req.flash("success_msg", "Usuario criado com sucesso")
                            res.redirect('/')
                        }).catch(function(erro){
                            req.flash("error_msg", "hoube um erro ao criar o usuario, tente novamente.")
                            res.redirect('/')
                        })
                    })
                })
            }
        }).catch(function(erro){
            req.flash("error_msg", "Houve um erro interno.")
            res.redirect('/')
        })
    }
})

// --- Rota Login
router.get('/login', function(req, res){
    res.render('usuarios/login')
})

// --- Rota Login
router.post('/login', function(req, res, next){
    //funcao para autenticar, tipo de auth
    passport.authenticate("local", {
        successRedirect: '/', //se TRUE redireciona para a pagina
        failureRedirect: '/usuarios/login', //se FALSE redireciona para a pagina
        failureFlash: true //habilita msg flash
    })(req, res, next)
})

router.get('/logout', function(req, res){
    req.logOut()
    req.flash("success_msg", "Deslogado com sucesso!")
    res.redirect('/')
})


module.exports = router