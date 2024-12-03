# Simulador Gravitacional 2D

Este é um simulador gravitacional em 2D desenvolvido em JavaScript, que utiliza a **Lei da Gravitação Universal** para calcular as interações entre corpos celestes. Você pode adicionar planetas, ajustar suas massas e velocidades, controlar o foguete e explorar conceitos de física, como forças gravitacionais, órbitas e trajetórias.

---

## **Funcionalidades**

- Simulação em tempo real de corpos celestes interagindo gravitacionalmente.
- Controle manual do foguete com o teclado.
- Adição dinâmica de planetas com nome, massa, posição e velocidade.
- Ajustes dinâmicos via sliders:
  - Massa do Sol.
  - Massa dos planetas.
  - Velocidade do foguete.
  - Tamanho do passo de tempo ($\Delta t$).
  - Número de pré-cálculos da trajetória do foguete.
  - Constante gravitacional **$G$**.
- Visualização da trajetória futura do foguete.
- Renderização de corpos celestes e suas interações no canvas.

---

## **Como funciona**

### 1. **Leis Físicas**
A simulação utiliza a fórmula da força gravitacional:

$F = G \cdot \dfrac{(m_1 m_2)}{(r^2)}$

Onde:
- $F$: força gravitacional.
- $G$: constante gravitacional.
- $m_1$, $m_2$: massas dos corpos.
- $r$: distância entre os corpos.

A aceleração é calculada como:

$a$ = $\dfrac{F}{m}$

### 2. **Método de Euler**
O simulador usa o **método de Euler** para calcular as trajetórias dos corpos:
- Atualiza a velocidade com base na aceleração:
  
  $v_{(nova)} = v_{(atual)} + a \cdot \Delta t$
  
- Atualiza a posição com base na velocidade:
  
  $x_{(nova)} = x_{(atual)} + v_{(atual)} \cdot \Delta t$

#### **$\Delta t$ e Precisão**
- Quanto menor o valor de $\Delta t$, mais precisa será a simulação.
- Valores grandes de $\Delta t$ podem tornar a simulação imprecisa, especialmente para forças que mudam rapidamente.

---

## **Prevenção de Singularidades**
Uma **singularidade** ocorre quando a distância 
(r) entre dois corpos se aproxima de zero, resultando em uma força gravitacional infinita. Para evitar isso, o simulador adiciona uma pequena constante ε ao cálculo:

$F = G \cdot \dfrac{(m_1 m_2)}{(r^2 + \epsilon )}$

---

## **Controles**

### **Teclado**
- **Espaço**: Pausar/continuar a simulação.
- **$H$**: Aumentar a velocidade horizontal do foguete para a esquerda.
- **$J$**: Aumentar a velocidade vertical para baixo.
- **$K$**: Aumentar a velocidade vertical para cima.
- **$L$**: Aumentar a velocidade horizontal para a direita.

### **Sliders e Inputs**
- **Massa do Sol**: Ajusta a massa do Sol.
- **Massa dos Planetas**: Ajusta a massa dos planetas.
- **Velocidade do Foguete**: Controla a velocidade do foguete.
- **Número de Pré-Cálculos**: Define a quantidade de cálculos para a trajetória futura do foguete.
- **Tamanho do Passo de Tempo ($\Delta t$)**: Controla a precisão da simulação.
- **Constante Gravitacional ($G$)**: Ajusta a intensidade da gravidade.

---

## **Como Usar**

### 1. **Requisitos**
- Um navegador web moderno (Google Chrome, Firefox, Edge, etc.).

### 2. **Execução**
1. Clone este repositório:
   ```bash
   git clone https://github.com/Mvcart/SqueakSiege

### 2. **CRÉDITOS**
Marcos Cota        - 15511001
Kettryel Rezende   - 15522383
