# 🏎️ TURBO HIGHWAY - Jogo de Corrida Arcade Retrô 8-bit

Um jogo de corrida retrô arcade em página única feito em **React**, inspirado em clássicos como *Road Fighter* e *OutRun*, com física em 60 FPS, tráfego dinâmico, sistema de combustível, turbo nitro, efeitos sonoros sintetizados via Web Audio API e suporte completo para teclado e telas touch de celular.

---

## 🕹️ Como Jogar Agora Mesmo

1. **Dois cliques no arquivo `jogar.html`**:
   - Funciona direto em qualquer navegador (Chrome, Edge, Firefox, Safari) sem precisar de servidor ou internet.
2. **Dois cliques no executável `jogar.bat`**:
   - Inicializador rápido para Windows.
3. **Pela sua IDE (VS Code, Cursor, WebStorm)**:
   - Abra a pasta e rode `npm run dev`.
   - Ou pegue o arquivo único **`CarGame.jsx`** e jogue direto dentro do seu projeto React!

---

## 🎮 Controles

### Desktop:
- **Setas ◀ e ▶ ou A / D**: Movimentam o carro entre as faixas da pista.
- **Seta ▲ ou W**: Aceleração máxima (aumenta o consumo de gasolina).
- **Seta ▼ ou S**: Freio.
- **ESPAÇO ou SHIFT**: Ativa o **NITRO** (velocidade insana e escape com chamas!).
- **B ou H**: Buzina retro (*Beep Beep*).

### Mobile / Touch:
- **Botões ◀ ESQ e DIR ▶**: Para virar o carro.
- **Botões de Ação**: 🛑 FREIO e ⚡ NITRO na tela com resposta instantânea.

---

## 🏁 Mecânicas do Jogo

- **Tráfego**: Desvie de sedans azuis, táxis amarelos, esportivos verdes e caminhões compridos de carga.
- **Poças de Óleo**: Passar por cima de uma mancha preta faz seus pneus cantarem e o carro derrapar temporariamente.
- **Coleta de Combustível (GAS)**: Não deixe seu tanque esvaziar! Pegue os galões verdes na pista.
- **Coleta de Moedas ($)**: Aumentam sua pontuação e recarregam o tanque de Nitro.
- **Sistema de Raspão (Near Miss)**: Passe tirando fina dos carros sem bater para ganhar +500 pontos de bônus e recarregar o Nitro!
- **Recordes Salvos**: Sua melhor pontuação (*BEST*) é salva automaticamente no navegador.
