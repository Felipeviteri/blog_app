module.exports = {
    eAdmin: function(req,res, next){
        if(req.isAuthenticated() && req.user.eAdmin == 1){
            return next()
        } // verificar se um certo usuario esta autenticado

        req.flash(("error_msg","Voce precisa ser um admin!"))
        req.redirect('/')
    }
}