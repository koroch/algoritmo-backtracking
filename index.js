const fs = require('fs');

// Nó da árvore binária
class Node {
    constructor(pesoSomado, utilidadeSomada, parent = null, item = null) {
        this.pesoSomado = pesoSomado;
        this.utilidadeSomada = utilidadeSomada;
        this.parent = parent; // Nó pai
        this.item = item; // Item atual
    }
}

function mochila(capacidade, utilidadeMax, itens) {
    let melhorUtilidade = 0;
    let melhorNode = null;
    const arvore = []; 

    function backtrack(noAtual, index, nivel) {
        // Se passarmos do número de itens, retornamos
        if (index >= itens.length) return;
        // Criar nível na árvore se ainda não existir
        if (!arvore[nivel]) arvore[nivel] = [];
        // Item atual
        const item = itens[index];

        // Não adicionar o item (lado esquerdo)
        arvore[nivel].push({
            peso: noAtual.pesoSomado,
            utilidade: noAtual.utilidadeSomada,
            itemAtual: noAtual.item ? noAtual.item.nome : "Nenhum", // Nome do item que levou a este nó
            paiNode: noAtual // Armazenar a referência ao nó pai
        });
        backtrack(noAtual, index + 1, nivel + 1);

        // Adicionar o item (lado direito)
        const novoPeso = noAtual.pesoSomado + item.peso;
        const novaUtilidade = noAtual.utilidadeSomada + item.utilidade;

        // Verificar se o novo peso está dentro da capacidade e se a utilidade está dentro do limite
        if (novoPeso <= capacidade && novaUtilidade <= utilidadeMax) {
            const novoNo = new Node(novoPeso, novaUtilidade, noAtual, item);
            arvore[nivel].push({
                peso: novoPeso,
                utilidade: novaUtilidade,
                itemAtual: item.nome,
                paiNode: novoNo //referência ao nó pai
            });

            //Verificar melhor utilidade
            if (novaUtilidade > melhorUtilidade) {
                melhorUtilidade = novaUtilidade;
                melhorNode = novoNo;
            }

            //próximo item
            backtrack(novoNo, index + 1, nivel + 1);
        }
    }

    // Inicializar a árvore com o nó raiz sem itens
    const raiz = new Node(0, 0);
    arvore[0] = [{ peso: 0, utilidade: 0, itemAtual: "Nenhum", paiNode: null }]; // Nível 0, estado inicial
    backtrack(raiz, 0, 1); // Começar o backtracking no nível 1

    // Caminho inverso para determinar a melhor combinação de itens
    const melhorCaminho = [];
    let nodeAtual = melhorNode;
    let pesoTotalUtilizado = 0; // Variável para armazenar o peso total

    while (nodeAtual && nodeAtual.item !== null) {
        melhorCaminho.unshift(nodeAtual.item); // Adicionar o item no início do array
        pesoTotalUtilizado += nodeAtual.item.peso; // Somar o peso do item
        nodeAtual = nodeAtual.parent; // Subir para o nó pai
    }

    return {
        utilidadeMaxima: melhorUtilidade,
        pesoTotalUtilizado: pesoTotalUtilizado, // Retornar o peso total utilizado
        itensSelecionados: melhorCaminho,
        arvore: arvore
    };
}

function main() {
    const dados = fs.readFileSync('./dados.txt');
    let vector = [];
    for (const element of dados.toString().split("\r\n")) {
        vector.push(element);
    }

    let pesoMochila = 0;
    let utilidadeMochila = 0;
    let itens = [];
    for (const [index, linha] of vector.entries()) {
        const linhaSplit = linha.split(" ");
        if (index !== 0) {
            itens.push({ "nome": index, "peso": parseInt(linhaSplit[0]), "utilidade": parseInt(linhaSplit[1]) });
        } else {
            pesoMochila = parseInt(linhaSplit[0]);
            utilidadeMochila = parseInt(linhaSplit[1]);
        }
    }

    const resultado = mochila(pesoMochila, utilidadeMochila, itens);
    console.log('Utilidade máxima:', resultado.utilidadeMaxima);
    console.log('Peso total utilizado:', resultado.pesoTotalUtilizado);
    console.log('Itens selecionados:', resultado.itensSelecionados.map(item => item.nome));
    
    console.log('Salvando Árvore de decisões em arquivo:');
    // Montar o objeto JSON com a estrutura da árvore
    const arvoreDecisoes = resultado.arvore.map((nivel, index) => ({
        [`Nível${index}`]: nivel.map(n => ({
            peso: n.peso,
            utilidade: n.utilidade,
            itemAtual: n.itemAtual,
            pai: n.paiNode && n.paiNode.item ? n.paiNode.item.nome : "Nenhum"
        }))
    }));
    fs.writeFileSync('./saida.json', JSON.stringify(arvoreDecisoes, null, 2));
}
main();