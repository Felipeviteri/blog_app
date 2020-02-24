const localStrategy = require('passport-local').Strategy
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
//MMODEL DE USUSARIOS
require('../models/Usuario') //chama o arquivo de model
const Usuario = mongoose.model('Usuarios') // passa a referencia do model para variavel

// SISTEMA DE AUT
module.exports = function(passport){
    //qual campo sera analisado
    passport.use(new localStrategy({usernameField: 'email', passwordField:"senha"}, function(email,senha,done){
        //pesquisa o email passado na autenticacao
        Usuario.findOne({email: email}).then(function(usuario){
            if(!usuario){
                return done(null,false, {message: "Esta conta nao existe"})
            }
            //compara as senha encryptado
            bcrypt.compare(senha, usuario.senha, function(erro,batem){
                if(batem){
                    return done(null, usuario)
                } else {
                    return done(null, false, {message: "Senha incorreta"})
                }
            })
        })
    }))


    // FUNCOES PARA SALVAR OS DADOS DO USUARIO NA SECAO, apos logar
    passport.serializeUser(function(usuario,done){
        done(null, usuario.id)
    })

    passport.deserializeUser(function(id, done){
        Usuario.findById(id, function(erro, usuario){
            done(erro, usuario)
        })
    })



}