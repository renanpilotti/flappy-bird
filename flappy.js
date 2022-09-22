function criarNovoElemento(tagName, className) {
    const elem = document.createElement(tagName)
    elem.className = className
    return elem
}

function Cano(reversa = false) {
    this.elemento = criarNovoElemento('div', 'barreira')

    const borda = criarNovoElemento('div', 'borda')
    const corpo = criarNovoElemento('div', 'corpo')
    this.elemento.appendChild(reversa ? corpo : borda)
    this.elemento.appendChild(reversa ? borda : corpo)

    this.setAltura = altura => corpo.style.height = `${altura}px`
}

function ParDeCanos(alturaTela, abertura, x) {
    this.elemento = criarNovoElemento('div', 'par-de-barreiras')

    this.superior = new Cano(true)
    this.inferior = new Cano(false)

    this.elemento.appendChild(this.superior.elemento)
    this.elemento.appendChild(this.inferior.elemento)

    this.sortearAbertura = () => {
        const alturaSuperior = Math.random() * (alturaTela - abertura)
        const alturaInferior = alturaTela - abertura - alturaSuperior
        this.superior.setAltura(alturaSuperior)
        this.inferior.setAltura(alturaInferior)
    }
    this.getX = () => parseInt(this.elemento.style.left.split('px')[0])
    this.setX = x => this.elemento.style.left = `${x}px`
    this.getLargura = () => this.elemento.clientWidth

    this.sortearAbertura()
    this.setX(x)
}

function QuatroParesDeCanos(altura, largura, abertura, espaco, notificarPonto) {
    this.pares = [
        new ParDeCanos(altura, abertura, largura),
        new ParDeCanos(altura, abertura, largura + espaco),
        new ParDeCanos(altura, abertura, largura + espaco * 2),
        new ParDeCanos(altura, abertura, largura + espaco * 3)
    ]

    const deslocamento = 3
    this.animar = () => {
        this.pares.forEach(par => {
            par.setX(par.getX() - deslocamento)

            //quando elemento sai da área do jogo
            if (par.getX() < -par.getLargura()) {
                par.setX(par.getX() + espaco * this.pares.length)
                par.sortearAbertura()
            }

            const meio = largura / 2
            const cruzouOMeio = par.getX() + deslocamento >= meio
                && par.getX() < meio
            if (cruzouOMeio) notificarPonto() //if cruozou o meio for true
        })
    }
}

function Passaro(alturaJogo) {
    let voando = false
    this.elemento = criarNovoElemento('img', 'passaro')
    this.elemento.src = 'imgs/passaro.png'

    this.getY = () => parseInt(this.elemento.style.bottom.split('px')[0])
    this.setY = y => this.elemento.style.bottom = `${y}px`

    window.onkeydown = e => voando = true
    window.onkeyup = e => voando = false

    this.animar = () => {
        const novoY = this.getY() + (voando ? 10 : -4)
        const alturaMaxima = alturaJogo - this.elemento.clientHeight

        if (novoY <= 0) {
            this.setY(0)
        } else if (novoY >= alturaMaxima) {
            this.setY(alturaMaxima)
        } else {
            this.setY(novoY)
        }
    }
    this.setY(alturaJogo / 2)
}

function Progresso() {
    this.elemento = criarNovoElemento('span', 'progresso')
    this.atualizarPontos = pontos => {
        this.elemento.innerHTML = pontos
    }
    this.atualizarPontos(0)
}

function estaoSobrepostos(elementoA, elementoB) {
    const a = elementoA.getBoundingClientRect()
    const b = elementoB.getBoundingClientRect()

    const horizontal = a.left + a.width >= b.left && b.left + b.width >= a.left
    const vertical = a.top + a.height >= b.top && b.top + b.height >= a.top
    return horizontal && vertical
}

function colidiu(passaro, barreiras) {
    let colidiu = false
    barreiras.pares.forEach(ParDeCanos => {
        if (!colidiu) {
            const superior = ParDeCanos.superior.elemento
            const inferior = ParDeCanos.inferior.elemento
            colidiu = estaoSobrepostos(passaro.elemento, superior) || estaoSobrepostos(passaro.elemento, inferior)
        }
    })
    return colidiu
}

function FlappyBird() {
    let pontos = 0

    const areaDoJogo = document.querySelector('[wm-flappy]')

    //argumentos
    const altura = areaDoJogo.clientHeight
    const largura = areaDoJogo.clientWidth
    const abertura = 200
    const espaco = 400

    const progresso = new Progresso()
    const passaro = new Passaro(altura)
    const barreiras = new QuatroParesDeCanos(altura, largura, abertura, espaco, () => progresso.atualizarPontos(++pontos))

    areaDoJogo.appendChild(progresso.elemento)
    areaDoJogo.appendChild(passaro.elemento)
    barreiras.pares.forEach(par => areaDoJogo.appendChild(par.elemento))

    this.start = () => {
        const temporizador = setInterval(() => {
            barreiras.animar()
            passaro.animar()

            if (colidiu(passaro, barreiras)) {
                clearInterval(temporizador)
                setTimeout(() => {
                    const gameOver = criarNovoElemento('h1', 'over')
                    const score = criarNovoElemento('h2', 'score')

                    gameOver.innerText = 'game over'
                    score.innerText = 'score: ' + pontos

                    areaDoJogo.innerHTML = ''
                    areaDoJogo.appendChild(gameOver)
                    areaDoJogo.appendChild(score)
                }, 500)
            }
        }, 20)
    }
}

const teste = new FlappyBird()
teste.start()