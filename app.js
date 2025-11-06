/*******************************************************************************************************************
 * Objetivo ==> Api referente ao projeto de adoçao de pets
 * Data ==> 20/05/2025
 * Autor ==> Israel
 * Versão ==> 1.0
 * 
 * Observação:
 *      ****** PARA CONFIGURAR E INSTALAR A API, PRECISAMOS DAS SEGUINTE BIBLIOTECA ********
 *                      express                  npm install express --save
 *                      cors                     npm install cors --save
 *                      body-parser              npm install body-parser --save
 * 
 *      ****** PARA CONFIGURAR E INSTALAR O ACESSO AO BANCO DE DADOS, PRECISAMOS: ********
 *                      prisma                 npm install prisma --save ( Conexão com o BD )
 *                      prisma/client          npm install @prisma/client --save ( Executa scripts no BD )
 *    
 *      ******* Após a instalação do prisma e do primsa client, devemos:
 *                  npx prisma init ( ! INICIALIAR O PRISMA NO PROJETO !)
 * 
 *      ******* Para realizar o sincronismo do prisma com o BD, devemos executar o seguinte comando:
 *                  npx prisma migrate dev
 * 
 * 
 * ************************
 * 
 * POST E PUT PRECISAM DO BodyParserJson para funcionar
 **********************************************************************************************************************/

require('dotenv').config(); // Carrega variáveis do .env
const express   = require('express')
const cors      = require('cors')
const app       = express()

app.use(cors())
app.use(express.json())


const routes = require('./route/routes.js')


// Prefixo base da API
app.use('/v1/infohub', routes)

app.listen('8080',function(){
    console.log('API FUNCIONANDO AGUARDANDO REQUESIÇÕES CHEFE...')
})