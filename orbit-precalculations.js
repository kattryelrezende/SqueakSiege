// Variaveis principais do simulador
var paused = true; // Controle para pausar/continuar a simulacao
var nr_of_precomputes = 5000; // Numero de pre-calculos para trajetoria do foguete
var dt = 0.001; // Tamanho do passo de tempo
var G = 1; // Constante gravitacional
var eps = 0.05; // Constante para evitar singularidades (divisao por zero)

// Configuracoes do canvas (area onde os elementos serao desenhados)
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
const INTERNAL_CANVAS_WIDTH = canvas.width;
const INTERNAL_CANVAS_HEIGHT = INTERNAL_CANVAS_WIDTH;
canvas.style.width = INTERNAL_CANVAS_WIDTH;
canvas.style.height = INTERNAL_CANVAS_WIDTH;
const SCALE = 4;
const CANVAS_WIDTH = INTERNAL_CANVAS_WIDTH * SCALE;
const CANVAS_HEIGHT = INTERNAL_CANVAS_HEIGHT * SCALE;
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

ctx.fillStyle = "white";    // Cor de preenchimento dos elementos
ctx.strokeStyle = "white";  // Cor do contorno dos elementos
ctx.lineWidth = 1;          // Largura do contorno

// Funcao para transformar coordenadas do mundo para o canvas
function trf(x, y) {
    const zoom = 4;
    x = (zoom/2 + x) * CANVAS_WIDTH / zoom;
    y = (zoom/2 - y) * CANVAS_HEIGHT / zoom;
    return [x, y];
}

// Funcao para desenhar um circulo no canvas
function draw_circle(X, Y, r) {
    let [x, y] = trf(X, Y);
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2, true);
    ctx.stroke();
    ctx.fill();
}

// Funcao para desenhar uma linha no canvas
function draw_line(X_i, Y_i, X_f, Y_f) {
    let [x_i, y_i] = trf(X_i, Y_i);
    let [x_f, y_f] = trf(X_f, Y_f);
    ctx.beginPath();
    ctx.moveTo(x_i, y_i);
    ctx.lineTo(x_f, y_f);
    ctx.strokeStyle = "white";
    ctx.stroke();
    ctx.lineWidth = 3;
}

function render_name(name, x, y, r, m) {
    let [canvasX, canvasY] = trf(x, y);
    const textOffset = 20; // Distância entre o planeta e o nome
    const lineOffset = 10; // Altura da linha

    // Ajusta o tamanho da fonte com base na massa
    const minFontSize = 32; // Tamanho mínimo da fonte
    const maxFontSize = 60; // Tamanho máximo da fonte
    const scaleFactor = 40; // Fator de escala para ajuste

    let fontSize = Math.min(maxFontSize, Math.max(minFontSize, m * scaleFactor));

    // Desenha a linha do planeta ao texto
    ctx.beginPath();
    ctx.moveTo(canvasX, canvasY - r);
    ctx.lineTo(canvasX, canvasY - r - lineOffset);
    ctx.strokeStyle = "white";
    ctx.stroke();

    // Define a fonte dinâmica e desenha o texto
    ctx.font = `${fontSize}px Arial`;
    ctx.textAlign = "center";
    ctx.fillStyle = "white";
    ctx.fillText(name, canvasX, canvasY - r - textOffset);
}

// Classe que representa um planeta
class Planet {
    constructor(m, x, y, u, v, name = "Planet") {
        this.m = m; // Massa
        this.x = x; // Posição X
        this.y = y; // Posição Y
        this.u = u; // Velocidade X
        this.v = v; // Velocidade Y
        this.name = name; // Nome do planeta
    }

    forward() {
        // Avança o estado do planeta no tempo usando o método de Euler
        let state = [this.x, this.y, this.u, this.v];
        state = euler(state, bodies);
        this.x = state[0];
        this.y = state[1];
        this.u = state[2];
        this.v = state[3];
    }

    render() {
        // Renderiza o planeta como um círculo
        let r = (this.m * 5);
        draw_circle(this.x, this.y, r);

        // Renderiza o nome acima do planeta com uma linha conectando
        render_name(this.name, this.x, this.y, r, this.m);
    }
}

// Classe que representa o universo
class Universe {
    constructor(sun, planets, rocket) {
        this.sun = sun; // Sol (estrela central)
        this.planets = planets; // Lista de planetas
        this.rocket = rocket; // Foguete
    }
    forward() {
        // Avanca o estado de todos os corpos no universo
        for (let i = 0; i < planets.length; i++) {
            this.planets[i].forward();
        }
        this.rocket.forward();
    }
    render() {
        // Renderiza todos os corpos no universo
        sun.render();
        for (let i = 0; i < planets.length; i++) {
            this.planets[i].render();
        }
        this.rocket.render();
    }
}

// Classe que representa o foguete
class Rocket {
    constructor(x, y, u, v) {
        this.x = x;
        this.y = y;
        this.u = u;
        this.v = v;
        this.trajectory = []; // Histórico de posições
    }

    forward() {
        // Avança o estado do foguete no tempo usando o método de Euler
        let state = [this.x, this.y, this.u, this.v];
        state = euler(state, bodies);
        this.x = state[0];
        this.y = state[1];
        this.u = state[2];
        this.v = state[3];
    }

    render() {
        // Renderiza a trajetória
        this.render_trajectory();
    
        // Renderiza o SVG na ponta da trajetória
        if (this.trajectory.length > 0) {
            let [x, y] = this.trajectory[this.trajectory.length - 1]; // Última posição precomputada
            let [canvasX, canvasY] = trf(x, y);
    
            const rocketWidth = 20;
            const rocketHeight = 20;
    
            // Define a cor para amarelo
            ctx.fillStyle = "yellow";
    
            // Desenha o foguete como um círculo (pode ser alterado para outro formato se necessário)
            ctx.beginPath();
            ctx.arc(canvasX, canvasY, 5, 0, 2 * Math.PI); // Foguete com raio 10
            ctx.fill();
            ctx.closePath();

            ctx.fillStyle = "white";
        }
    }    

    render_trajectory() {
        // Renderiza a trajetória futura do foguete
        const N_i = nr_of_precomputes;
        let state = [this.x, this.y, this.u, this.v];
        this.trajectory = []; // Reinicia o histórico de posições

        for (let i = 0; i < N_i; i++) {
            let x_i = state[0];
            let y_i = state[1];
            this.trajectory.push([x_i, y_i]); // Armazena as posições no histórico

            state = euler(state, bodies);
            let x_f = state[0];
            let y_f = state[1];

            draw_line(x_i, y_i, x_f, y_f); // Desenha a linha entre os pontos
        }
    }
}

// Funcao que calcula a proxima iteracao usando o metodo de Euler
function euler(p, planets) {
    let x = p[0];
    let y = p[1];
    let u = p[2];
    let v = p[3];
    let a = [0, 0]; // Aceleracao inicial

    // Calcula a aceleracao total devido aos planetas
    for (let i = 0; i < planets.length; i++) {
        let da = get_acc_from_other(p, planets[i]);
        a = [a[0] + da[0], a[1] + da[1]];
    }

    // Atualiza velocidades e posicoes
    u = u + a[0] * dt;
    v = v + a[1] * dt;
    x = x + u * dt;
    y = y + v * dt;

    return [x, y, u, v];
}

// Calcula a aceleracao entre dois corpos
function get_acc_from_other(p, o) {
    let dx = p[0] - o.x;
    let dy = p[1] - o.y;
    let r2 = Math.pow(dx, 2) + Math.pow(dy, 2);

    if (r2 == 0) return [0, 0]; // Evita singularidade
    let a = -G * o.m / r2;
    r2 = r2 + Math.pow(eps, 2);
    let r = Math.pow(r2, 0.5);

    return [a * dx / r, a * dy / r];
}

document.getElementById("add_planet").addEventListener("click", (e) => {
    e.preventDefault();

    const name = document.getElementById("planet_name").value;
    const m = parseFloat(document.getElementById("planet_mass").value);
    const x = parseFloat(document.getElementById("planet_x").value);
    const y = parseFloat(document.getElementById("planet_y").value);
    const u = parseFloat(document.getElementById("planet_u").value);
    const v = parseFloat(document.getElementById("planet_v").value);

    const newPlanet = new Planet(m, x, y, u, v, name);
    planets.push(newPlanet);
    bodies = planets.concat([sun]);
});

// Criacao de corpos no universo
var sun = new Planet(1, 0, 0, 0, 0, "Sol");
var earth = new Planet(0.01, -1, 0, 0, -1, "Terra");
var planets = [earth];
var bodies = planets.concat([sun]);
var rocket = new Rocket(0.5, 0, 0, 1);
var universe = new Universe(sun, planets, rocket);

// Controle de massa do Sol via input
var sunMassInput = document.getElementById("sun_mass");
sunMassInput.oninput = function () {
    let m = parseFloat(sunMassInput.value);
    sun.m = m; // Atualiza a massa do Sol
    let p = document.getElementById("p_sun_mass");
    if (!p) {
        p = document.createElement("p");
        p.id = "p_sun_mass";
        document.body.appendChild(p);
    }
};
sunMassInput.min = 0.1; // Defina um valor mínimo adequado
sunMassInput.max = 1000; // Defina um valor máximo adequado
sunMassInput.step = 0.1;
sunMassInput.value = sun.m; // Define o valor inicial como a massa inicial do Sol

// Loop de atualizacao e renderizacao do universo
window.setInterval(() => {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    if (!paused) {
        for (i = 0; i < 20; i++) {
            universe.forward();
        }
    }
    universe.render();
}, 1000 / 60); // Atualiza 60 vezes por segundo

// Controles via teclado
document.addEventListener("keydown", (event) => {
    var key = event.key;
    console.log(key);
    let boost = 0.01;

    if (key == " ") {
        paused = !paused; // Pausa ou continua a simulacao
    } else if (key == "h") {
        rocket.u -= boost; // Ajusta velocidade horizontal
    } else if (key == "j") {
        rocket.v -= boost; // Ajusta velocidade vertical para baixo
    } else if (key == "k") {
        rocket.v += boost; // Ajusta velocidade vertical para cima
    } else if (key == "l") {
        rocket.u += boost; // Ajusta velocidade horizontal
    }
});

// Controle de massa do planeta via slider
var slider_1 = document.getElementById("input_planet_mass");
slider_1.oninput = function () {
    let m = slider_1.value / 1000;
    universe.planets[0].m = m;
    let p = document.getElementById("p_planet_mass");
    p.innerHTML = "Massa do planeta = " + m;
};
slider_1.min = 0;
slider_1.max = 5000;
slider_1.step = 1;
slider_1.value = universe.planets[0].m * 1000;

// Calcula a velocidade do foguete
function speed(u, v) {
    s2 = Math.pow(u, 2) + Math.pow(v, 2);
    return Math.pow(s2, 0.5);
}

// Controle de velocidade do foguete via slider
var slider_2 = document.getElementById("input_rocket_speed");
r = universe.rocket;
slider_2.oninput = function () {
    s = speed(r.u, r.v);
    S = slider_2.value / 10;
    if (S == 0) return;
    r.u = (S / s) * r.u;
    r.v = (S / s) * r.v;
    let p = document.getElementById("p_rocket_speed");
    p.innerHTML = "Velocidade do foguete = " + S;
};
slider_2.min = -100;
slider_2.max = 100;
slider_2.step = 1;
slider_2.value = speed(r.u, r.v) * 10;

// Controle de pre-calculos de trajetoria via slider
var slider_3 = document.getElementById("input_precomputes");
slider_3.oninput = function () {
    nr_of_precomputes = Number(slider_3.value);
    let p = document.getElementById("p_precomputes");
    p.innerHTML = "Qtd. de passos futuros = " + nr_of_precomputes;
};
slider_3.min = 1;
slider_3.max = 100000;
slider_3.step = 1;
slider_3.value = nr_of_precomputes;

// Controle de passo de tempo via slider
var slider_4 = document.getElementById("input_time_step");
slider_4.oninput = function () {
    dt = slider_4.value / 10000;
    let p = document.getElementById("p_time_step");
    p.innerHTML = "Intervalos de tempo p/ frame = " + dt;
};
slider_4.min = 1;
slider_4.max = 100;
slider_4.step = 1;
slider_4.value = dt * 10000;

// Controle da constante gravitacional via slider
var slider_5 = document.getElementById("input_gravity");
slider_5.oninput = function () {
    G = slider_5.value / 10;
    let p = document.getElementById("p_gravity");
    p.innerHTML = "Constante de Gravidade: G = " + G;
};
slider_5.min = -100;
slider_5.max = 100;
slider_5.value = G * 10;
slider_5.step = 1;
