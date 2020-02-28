// --- Configuracao de conexao do MongoDB (local ou web)

// --- Substituir os seguintes campos (dados do banco e nao da conta)
// <user> = Usauario criado para o banco de dados
// <password> = Senha do banco de dados

if (process.env.NODE_ENV == "production"){
    // --- Web ---
    module.exports = {mongoURI: "mongodb+srv://<user>:<password>@blogapp-prod-hpdc5.gcp.mongodb.net/test?retryWrites=true&w=majority"}
} else {
    // --- Local ---
    module.exports = {mongoURI: 'mongodb://localhost/blogapp'}
}
