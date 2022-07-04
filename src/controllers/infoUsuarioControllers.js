import Joi from "joi";
import bcrypt from 'bcrypt'
import { v4 as uuid } from 'uuid'
import { db } from '../dbStrategy/mongo.js';    

    
    export  async function login(request, response){
        const { email, senha } = request.body;
    
        const regexEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/

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
    
            response.send(infoUser).status(200)
    
        } catch (error) {
            console.log(error)
            response.sendStatus(500)
        }
    
    }

export async function cadastro (request, response){
  
        const { nome, email, senha } = request.body

        const regexEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
    
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
            if (usuarioInexistente!== null) {
                response.send("Usuário já existente").status(409)
                return
            }
    
            const cadastro = await db.collection("usuarios").insertOne({ nome: nome, email: email, senha: senhaCrypt, token: "", transacoes: [], contador: 0 })
    
            response.sendStatus(201)
        } catch {
            response.send("Ops, cadastro inválido. Por favor, verifique os seus dados").status(400)
        }
    
    }


