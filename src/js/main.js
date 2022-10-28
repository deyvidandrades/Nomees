document.addEventListener("DOMContentLoaded", () => {
  //UI ELEMENTS
  function getUIElements(){
    let elementos = {
      modalStats : new bootstrap.Modal(document.getElementById('statsModal')),
      modalDialogo: new bootstrap.Modal(document.getElementById("dialogoModal")),
      teclas: document.querySelectorAll(".teclado button"),
      btnShare : document.getElementById("share"),
      btnSalvar : document.getElementById("salvar"),
      btnCarregar : document.getElementById("carregar"),
      btnEGG : document.getElementById("dle-1")
    }

    let egg =0;
    elementos.btnEGG.onclick = ({target}) =>{
      egg += 1
      if (egg == 7){
        exibirDialogo(
          "DEV MODE","Dia: #"+ String(INICIO) + "<br>Solução: " + JSON.stringify(GAME.nome) +
          '<br><br>Saves:<textarea class="form-control" rows="8">'+ JSON.stringify({"player": PLAYER}) + '</textarea>'
        );
        egg=0;
      }
    }

    elementos.btnShare.onclick =  ({ target }) => {
      try{
        if (HISTORICO[GAME.dia_palpite].concluido) {
          copiarResultado();
        }else{
          window.open("https://twitter.com/intent/tweet?text=Eu também estou jogando o Nomees!! \n https://nomees.web.app/", "_blank");
        }
      }catch{
        window.open("https://twitter.com/intent/tweet?text=Eu também estou jogando o Nomees!! \n https://nomees.web.app/", "_blank");
      }
    };

    elementos.btnSalvar.onclick = ({target}) =>{
      let data = encrypt(JSON.stringify({"player":carregarDados()}));

      let a = document.createElement('a');
      a.href = "data:application/octet-stream,"+encodeURIComponent(data);
      a.download = 'nomees_dia-'+STATS.dia+'.save';
      a.click();
    };

    elementos.btnCarregar.addEventListener('change', function() {
      var fr=new FileReader();
      fr.onload=function(){
        salvarDados(JSON.parse(decrypt(fr.result)));

        location.reload();
      }
      fr.readAsText(this.files[0]);
    });

    return elementos;
  }

  function exibirDialogo(titulo,mensagem) {
    UI.modalDialogo.hide();
    UI.modalStats.hide();

    document.getElementById("msg").innerHTML = mensagem;
    document.getElementById("ttl").innerHTML = titulo;

    UI.modalDialogo.show();
  }

  function animarTitulo(i){
    setTimeout(() => {
      const letterId = 'dle-' + i;
      const letterEl = document.getElementById(letterId);
      letterEl.classList.add("animate__flipInX");
    }, 200 * i);
  }

  function atualizarInterface(){
    document.getElementById("partidas").innerHTML = STATS.partidas;
    document.getElementById("vitorias").innerHTML = STATS.vitorias+'%';
    document.getElementById("sequencia_vitorias_atual").innerHTML = STATS.sequencia_vitorias_atual;
    document.getElementById("sequencia_vitorias").innerHTML = STATS.sequencia_vitorias;

    if(GAME.acertou){
      document.getElementById("stats_parabens").innerHTML = 'Parabéns, você acertou o nome de hoje!!';
      document.getElementById("stats_nome").innerHTML = GAME.nome.toUpperCase();
      UI.btnShare.innerHTML = 'Compartilhar resultado! <i class="bi bi-share-fill"></i>';
    }else{
      document.getElementById("stats_parabens").innerHTML = '';
      document.getElementById("stats_nome").innerHTML = '';
      UI.btnShare.innerHTML = 'Compartilhar Nomees <i class="bi bi-share-fill"></i>';
    }
  }

  function copiarResultado() {

    let string = 'Joguei nomees.web.app #' + String(INICIO+1) + " " + String(GAME.linha_palpite) +"/6 \n🎯"+STATS.vitorias+"% 🏆"+STATS.sequencia_vitorias+"\n";

    HISTORICO[GAME.dia_palpite].palpites.forEach((item, i) => {

      item.forEach(char => {
        if (char['idx_certo']) {
          string += "🟩";

        }else if (char['idx_errado'] && !char['idx_certo']) {
          string += "🟨";

        }else{
          string += "⬛️";
        }
      });
      string +='\n';
    });
    navigator.clipboard.writeText(string);
    exibirDialogo("Resultado.", 'Resultado Copiado!');
  }

  // SAVEGAMES
  function carregarDados(){
    try {
      return JSON.parse(localStorage.getItem("Nomees"))['player'];
    } catch (e) {
      data = {
        "historico": {},
        "stats": {
          "vitorias": 0,
          "partidas": 0,
          "sequencia_vitorias_atual": 0,
          "sequencia_vitorias": 0,
          "dia": 0
        }
      }

      // data.historico["dia-" + String(INICIO)] = {}
      return data;
    }
  }

  function salvarDados(dados){

    localStorage.setItem("Nomees",JSON.stringify(dados));
  }

  // GAMEDATA
  function getGameData(){

    return {
      "nome": LISTA.lista_nomes[INICIO],
      "dia_palpite" : "dia-" + String(INICIO),
      "linha_palpite": 0,
      "coluna_palpite": 0,
      "acertou": false
    };
  }

  function atualizarGameData(palpite_processado,acertou,recriado){

    if (!recriado) {
      GAME.linha_palpite += 1;
    }
    GAME.acertou = acertou;
    GAME.coluna_palpite = 0;

    try{
      if (!recriado) {
        HISTORICO[GAME.dia_palpite].palpites.push(palpite_processado);
        HISTORICO[GAME.dia_palpite].concluido = acertou;
        HISTORICO[GAME.dia_palpite].solucao = GAME.nome;
      }
    }catch (e){
      HISTORICO[GAME.dia_palpite] = {
        "palpites": [palpite_processado],
        "concluido": acertou,
        "solucao": GAME.nome,
        "dia": INICIO
      };
    }

    calcularStats();
  }

  function encrypt(string) {
    string = unescape(encodeURIComponent(string));
    var newString = '',
    char, nextChar, combinedCharCode;
    for (var i = 0; i < string.length; i += 2) {
      char = string.charCodeAt(i);

      if ((i + 1) < string.length) {


        nextChar = string.charCodeAt(i + 1) - 31;


        combinedCharCode = char + "" + nextChar.toLocaleString('en', {
          minimumIntegerDigits: 2
        });

        newString += String.fromCharCode(parseInt(combinedCharCode, 10));

      } else {


        newString += string.charAt(i);
      }
    }
    return newString.split("").reduce((hex,c)=>hex+=c.charCodeAt(0).toString(16).padStart(4,"0"),"");
  }

  function decrypt(string) {

    var newString = '',
    char, codeStr, firstCharCode, lastCharCode;
    string = string.match(/.{1,4}/g).reduce((acc,char)=>acc+String.fromCharCode(parseInt(char, 16)),"");
    for (var i = 0; i < string.length; i++) {
      char = string.charCodeAt(i);
      if (char > 132) {
        codeStr = char.toString(10);

        firstCharCode = parseInt(codeStr.substring(0, codeStr.length - 2), 10);

        lastCharCode = parseInt(codeStr.substring(codeStr.length - 2, codeStr.length), 10) + 31;

        newString += String.fromCharCode(firstCharCode) + String.fromCharCode(lastCharCode);
      } else {
        newString += string.charAt(i);
      }
    }
    return newString;
  }

  // TECLADO
  function inicializarTeclado(){

    document.addEventListener('keydown', function(event) {
      switch (event.keyCode) {
        case 13:
        teclaPressionada('enter');
        break;
        case 8:
        teclaPressionada('del');
        break;
        default:
        if(event.keyCode > 64 && event.keyCode < 91){
          teclaPressionada(String.fromCharCode(event.keyCode).toLowerCase());
        }
      }
    });

    for (let i = 0; i < UI.teclas.length; i++) {
      UI.teclas[i].onclick = ({ target }) => {
        teclaPressionada(target.getAttribute("data-key"));
      };
    }
  }

  function teclaPressionada(letra){

    if (!GAME.acertou && GAME.linha_palpite < 6) {

      if (letra === "enter") {
        avaliarPalpite(GAME.linha_palpite,GAME.coluna_palpite, false);
        return;
      }

      if (letra === "del") {
        deletar();
        return;
      }

      digitar(letra);
    }else if (GAME.linha_palpite >= 6){
      exibir_dialogo('OOPS..','Seus palpites acabaram.');
    }else{
      UI.modalStats.show();
    }
  }

  function colorirTeclas(palavra){

    for (var item in palavra) {
      for (let i = 0; i < UI.teclas.length; i++) {
        if (palavra[item]['letra'] == UI.teclas[i].getAttribute("data-key")){

          UI.teclas[i].classList.remove('tecla-clara');

          UI.teclas[i].classList.remove('tecla-verde');
          UI.teclas[i].classList.remove('tecla-amarela');
          UI.teclas[i].classList.add('tecla-escura');

          if (palavra[item]['idx_errado'] && !palavra[item]['idx_certo']) {
            UI.teclas[i].classList.remove('tecla-verde');
            UI.teclas[i].classList.remove('tecla-escura');
            UI.teclas[i].classList.add('tecla-amarela');
          }

          if (palavra[item]['idx_certo']) {
            UI.teclas[i].classList.remove('tecla-amarela');
            UI.teclas[i].classList.remove('tecla-escura');
            UI.teclas[i].classList.add('tecla-verde');
          }
        }
      }
    }
  }

  function digitar(letra){

    if (GAME.coluna_palpite < 5) {
      GAME.coluna_palpite +=1;
      tile = document.getElementById("tile-"+(GAME.coluna_palpite+(GAME.linha_palpite*5)));
      tile.innerHTML=letra;
    }
  }

  function deletar(){
    if (GAME.coluna_palpite >= 1) {
      tile = document.getElementById("tile-"+(GAME.coluna_palpite+(GAME.linha_palpite*5)));
      tile.innerHTML="&lrm;";
      GAME.coluna_palpite -=1;
    }
  }

  // GAME
  function colorirTiles(intervalo,linha,palpite_processado){

    palpite_processado.forEach((item, index) => {
      setTimeout(() => {
        let tile = document.getElementById(`tile-${(index+((linha)*5)+1)}`);

        tileColor = "rgb(58, 58, 60)";

        if (item['idx_errado'] && !item['idx_certo']) {
          tileColor = "rgb(181, 159, 59)";
        }

        if (item['idx_certo']) {
          tileColor = "rgb(83, 141, 78)";
        }

        tile.classList.add("animate__flipInX");
        tile.style = `background-color:${tileColor};border-color:${tileColor}`;
      }, intervalo * index);
    });
  }

  function verificaNomeExite(palavra) {
    let exitste= true
    LISTA.lista_raw.forEach((item, i) => {
      if (palavra == item) {
        exitste = false;
      };
    });
    return exitste;
  }

  function verificaPalpite(palpite){
    let palavra_processada = [];
    let letras_verdes = []

    palpite.split("").forEach((item, i) => {

      let char_palavra = GAME.nome[i];
      let num_letras_repetidas = GAME.nome.split(item).length -1;

      if (item == char_palavra){
        if (num_letras_repetidas <= 1){
          letras_verdes.push(item);
        }
      }

      palavra_processada.push ({
        "letra": item,
        "idx_certo": item == char_palavra,
        "idx_errado": GAME.nome.includes(item) && !letras_verdes.includes(item) && item != char_palavra
      });
    });

    return palavra_processada;
  }

  function avaliarPalpite(linha, coluna,recriado){

    if (linha < 6 && coluna == 5) {
      let palpite_raw = '';

      for (var i = 1; i < 6; i++) {
        palpite_raw += document.getElementById("tile-"+(i+(linha*5))).innerHTML;
      }

      if (verificaNomeExite(palpite_raw)){
        exibirDialogo('OOPS..','Esse nome não é válido.');
      }else{
        let palpite_processado = verificaPalpite(palpite_raw);
        let acertou = palpite_raw == GAME.nome;

        atualizarGameData(palpite_processado,acertou,recriado);
        salvarDados({"player": PLAYER});
        if (!recriado) {
        }

        colorirTiles(recriado? 0 :400, linha,palpite_processado);
        colorirTeclas(palpite_processado);
        atualizarInterface();
        if (acertou) {
          UI.modalStats.show();
        }
      }
    }
  }

  function recriarPartida(){
    if(HISTORICO){
      if (HISTORICO[GAME.dia_palpite]) {
        historico = HISTORICO[GAME.dia_palpite];

        let nome = '';
        historico.palpites.forEach((item, i) => {
          nome='';
          item.forEach(char => {
            digitar(char.letra);
            nome += char.letra;
          });

          avaliarPalpite(i, nome.length, true);

          GAME.linha_palpite += 1;
          GAME.coluna_palpite = 0;
        });

        // GAME.linha_palpite = Object.keys(HISTORICO).length+1;
        // isCorreto(nome);
      }
      atualizarInterface();
    }
  }

  function calcularStats(){

    let atual = 0;
    let vitorias = 0;
    let geral = STATS.sequencia_vitorias;
    let partidas = Object.keys(HISTORICO).length;

    for (key in HISTORICO) {
      let concluido = HISTORICO[key].concluido;
      if (concluido) {
        atual++;
        vitorias++;
      }else{
        atual=0;
      }
    }

    if(atual > geral){
      geral = atual;
    }

    STATS.vitorias = ((vitorias*100)/partidas).toFixed(0);
    STATS.partidas = partidas;
    STATS.sequencia_vitorias = geral;
    STATS.sequencia_vitorias_atual = atual;
    STATS.dia = INICIO;

    atualizarInterface();
  }

  PLAYER = carregarDados();
  let HISTORICO = PLAYER.historico;
  let STATS = PLAYER.stats;
  let GAME = getGameData();
  let UI = getUIElements();

  animarTitulo(1);
  animarTitulo(2);
  inicializarTeclado();
  recriarPartida();
  calcularStats();
});
