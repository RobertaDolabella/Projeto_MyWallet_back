import express from "express";
import cors from 'cors';
import dotenv from 'dotenv'
import Joi from "joi";
import bcrypt from 'bcrypt'
import { v4 as uuid } from 'uuid'
import { MongoClient, ObjectId } from 'mongodb'
import { request } from "express";
import { response } from "express";
import dayjs from "dayjs";

const server = express()

server.use(express.json())
server.use(cors())

dotenv.config()


const client = new MongoClient("mongodb://127.0.0.1:27017")

let db;

client.connect().then(() => {
    db = client.db('wallet')
})

const regexEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/

server.post('/login', async (request, response) => {
    const { email, senha } = request.body;


    const dadosUser = Joi.object({
        email: Joi.string().pattern(regexEmail).required(),
        senha: Joi.string().required()
    });

    const { error } = dadosUser.validate(request.body);
  
    if (error) {
        return res.sendStatus(422);
    }

    try {
        const userLogin = await db.collection("usuarios").findOne({ "email": email });
        console.log(userLogin)
        if (userLogin === null) {
            response.sendStatus(401)
            return
        }

        const validacaoSenha = bcrypt.compareSync(senha, userLogin.senha)

        if (!validacaoSenha) {
            response.send('Email ou senha invalido').status(401)
            return
        }

        const token = uuid();

        const atualizacaoUsuario = await db.collection('usuarios').updateOne({ email: email }, { $set: { token: token } })

        const infoUser = {
            token: token,
            nome: userLogin.nome
        }

        response.send(infoUser)

    } catch (error) {
        console.log(error)
        response.sendStatus(500)
    }

})

server.post('/cadastrar', async (request, response) => {
  
    const { nome, email, senha } = request.body

    const dadosCadastro = Joi.object({
        nome: Joi.string().required(),
        email: Joi.string().pattern(regexEmail).required(),
        senha: Joi.string().required()
    });

    const { error } = dadosCadastro.validate(request.body);

    if(error){
        console.log(error.details)
        response.sendStatus(422);
        return
    }

    const senhaCrypt = bcrypt.hashSync(senha, 10)
    try {
        const usuarioInexistente = await db.collection("usuarios").findOne({ email: email })
        console.log(usuarioInexistente)
        if (usuarioInexistente!== null) {
            response.send("Usuário já existente").status(409)
            return
        }

        const cadastro = await db.collection("usuarios").insertOne({ nome: nome, email: email, senha: senhaCrypt, token: "", transacoes: [],valores:[], saldo: 0, contador: 0 })

        response.sendStatus(201)
    } catch {
        response.send("Ops, cadastro inválido. Por favor, verifique os seus dados").status(400)
    }

})

server.get('/mywallet', async (request, response) => {

    const { authorization } = request.headers
    const token = authorization?.replace('Bearer ', "")

    console.log(token)

    try {
        const user = await db.collection("usuarios").findOne({ token: token });
        const todasTransacoes = user.transacoes

        if (user === null) {
            response.sendStatus(400)
            return
        }
        response.send(todasTransacoes).status(200)
    } catch {
        response.sendStatus(400)
        return
    }



})

server.delete('/mywallet/:idDeletar', async (request, response) => {

    const idparadeletar = request.params.idDeletar
    const id = parseInt(idparadeletar)


    console.log(typeof (id))

    const { authorization } = request.headers
    const token = authorization?.replace('Bearer ', "")
    console.log("ta no delete")

    console.log(token)

    console.log("numero do id", id)

    try {
        const user = await db.collection("usuarios").findOne({ token: token })

        console.log(user)

        if (user === null) {
            response.sendStatus(404)
            return
        }
        const { transacoes } = user
        const novaListadeTransacao = transacoes.filter((element) => element.id_transacao !== id)
        const addTransacoes = await db.collection("usuarios").updateOne({ token }, { $set: { transacoes: novaListadeTransacao } })
        response.send(novaListadeTransacao)

    } catch {
        response.sendStatus(400)
    }
})
server.post('/adicionar', async (request, response) => {

    // const deletar = await db.collection("usuarios").deleteMany({ })
    // deletar

    const { authorization } = request.headers
    const token = authorization?.replace('Bearer ', "")

    const { descricao, valor, tipo } = request.body

    const transformarValor = valor?.replace(".", ",")
    const numberValor = parseFloat(valor)




    try {
        const user = await db.collection("usuarios").findOne({ token: token })

        if (user === null) {
            response.sendStatus(404)
            return
        }

       const { transacoes, valores, saldo } = user
        console.log("saldotipo", typeof(saldo))
        const novaTransacao = {
            id_transacao: (user.contador + 1),
            descricao: descricao,
            valorNumero: numberValor,
            valorTexto: transformarValor,
            tempo: dayjs().format('DD/MM'),
            tipo: tipo
        }

        const validacao = Joi.object({
            id_transacao: Joi.number().required(),
            descricao: Joi.string().required(),
            valorNumero: Joi.number().required(),
            valorTexto: Joi.string().required(),
            tempo: Joi.required(),
            tipo: Joi.boolean().required()
        });

        const { error } = validacao.validate(novaTransacao);

        if (error) {
            response.send("Por favor, verifique os dados enviados").status(422);
            return
        }
        console.log("4")
        transacoes.push(novaTransacao)
        if(!tipo){
        valores.push(-numberValor)}
        if(!tipo){
            valores.push(numberValor)}
      
        


        console.log("5", saldo)
        const addTransacoes = await db.collection("usuarios").updateOne({ token }, { $set: { transacoes: transacoes, contador: novaTransacao.id_transacao, valores:valores }})

        const userAtualizado = await db.collection("usuarios").findOne({ token: token })

        response.send(userAtualizado)

    } catch {
        response.sendStatus(400)
        return
    }
})


server.listen(5000)


// {
//     "nome":"roberta",
    // "email":"robertadolabella@hotmail.com",
    // "senha": "1234"
    // }

// {
//     "descricao":"primeiro",
//     "valor": "barato kkkk"
//     }