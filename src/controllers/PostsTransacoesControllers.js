import { db } from '../dbStrategy/mongo.js';
import dayjs from 'dayjs';
import validateUser from '../middlewares.js';
import Joi from 'joi';
export async function getTransacoes(request, response) {

    try {
        const user = response.locals.user;
        const todasTransacoes = user.transacoes

        if (!user) {
            response.sendStatus(400)
            return
        }
        response.send(todasTransacoes).status(200)
    } catch {
        response.sendStatus(400)
        return
    }
}

export async function deteteTransacoes(request, response){
    const idparadeletar = response.locals.idparadeletar;
    const id = parseInt(idparadeletar)

    console.log(id)



    try {
        const user = res.locals.user;
        const token = response.locals.token;
console.log(token)
        if (user===null) {
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

}

export async function novoPostTrasacoes (request, response){

    const { descricao, valor, tipo } = request.body

    let transformarValor = valor?.replace(".", ",")
    const numberValor = parseFloat(valor)
    if(valor.includes(".")===false){
        const decimais = "00"
        const juntaTudo = [valor, decimais]
        transformarValor = juntaTudo.join()
    }

    try {
        const user = response.locals.user;
        const token = response.locals.token;

        if (user === null) {
            response.sendStatus(404)
            return
        }

       const { transacoes} = user

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
        transacoes.push(novaTransacao)
      
        const addTransacoes = await db.collection("usuarios").updateOne({ token }, { $set: { transacoes: transacoes, contador: novaTransacao.id_transacao}})

        const userAtualizado = await db.collection("usuarios").findOne({ token: token })
        console.log("6")
        response.send(userAtualizado)

    } catch {
        response.sendStatus(400)
        return
    }
}