const GAME = {"rows": 19, "cols": 10, "entries": [{"word": "CACHE", "row": 0, "col": 4, "dir": "down", "len": 5, "number": 1, "clue": "Memória pequena e rápida que mantém cópias de dados usados recentemente."}, {"word": "DATABUS", "row": 0, "col": 7, "dir": "down", "len": 7, "number": 2, "clue": "Via que transporta valores lidos ou escritos e também instruções entre componentes."}, {"word": "EEPROM", "row": 1, "col": 3, "dir": "down", "len": 6, "number": 3, "clue": "Memória regravável que conserva configurações mesmo quando o equipamento fica sem energia."}, {"word": "FLASH", "row": 1, "col": 5, "dir": "down", "len": 5, "number": 4, "clue": "Memória não volátil e regravável que guarda o programa do Arduino."}, {"word": "ULA", "row": 2, "col": 0, "dir": "down", "len": 3, "number": 5, "clue": "Bloco responsável por realizar cálculos e operações lógicas."}, {"word": "UC", "row": 2, "col": 0, "dir": "across", "len": 2, "number": 5, "clue": "Interpreta as instruções e envia comandos às demais partes do processador."}, {"word": "CPU", "row": 2, "col": 8, "dir": "down", "len": 3, "number": 6, "clue": "Parte do computador que busca e executa as instruções dos programas."}, {"word": "ADDRESSBUS", "row": 4, "col": 0, "dir": "across", "len": 10, "number": 7, "clue": "Conjunto de fios que indica a posição de memória ou dispositivo que será acessado."}, {"word": "DMA", "row": 4, "col": 2, "dir": "down", "len": 3, "number": 8, "clue": "Recurso que permite transferir dados à memória sem ocupar o processador a cada byte."}, {"word": "ROM", "row": 4, "col": 3, "dir": "down", "len": 3, "number": 9, "clue": "Memória não volátil que tradicionalmente armazena instruções essenciais à inicialização."}, {"word": "RAM", "row": 6, "col": 1, "dir": "across", "len": 3, "number": 10, "clue": "Memória de trabalho que guarda programas em execução e os dados utilizados."}, {"word": "REGISTRADORES", "row": 6, "col": 1, "dir": "down", "len": 13, "number": 10, "clue": "Pequenas memórias internas que guardam dados usados naquele momento."}]};
const boardEl = document.getElementById("board");
const acrossEl = document.getElementById("acrossClues");
const downEl = document.getElementById("downClues");
const scoreEl = document.getElementById("score");
const progressEl = document.getElementById("progress");
const feedbackEl = document.getElementById("feedback");
const solution = new Map(), cellInputs = new Map(), cellNumbers = new Map(), clueElements = new Map();
function key(row,col){return `${row}-${col}`;}
GAME.entries.forEach(entry=>{
  for(let i=0;i<entry.len;i++){
    const row=entry.row+(entry.dir==="down"?i:0), col=entry.col+(entry.dir==="across"?i:0);
    solution.set(key(row,col),entry.word[i]);
  }
  cellNumbers.set(key(entry.row,entry.col),entry.number);
});
function buildBoard(){
  boardEl.style.setProperty("--rows",GAME.rows); boardEl.style.setProperty("--cols",GAME.cols);
  boardEl.style.gridTemplateColumns=`repeat(${GAME.cols}, var(--cell))`;
  boardEl.style.gridTemplateRows=`repeat(${GAME.rows}, var(--cell))`;
  for(let row=0;row<GAME.rows;row++) for(let col=0;col<GAME.cols;col++){
    const cellKey=key(row,col), cell=document.createElement("div");
    cell.className=solution.has(cellKey)?"cell active":"cell";
    if(solution.has(cellKey)){
      if(cellNumbers.has(cellKey)){
        const number=document.createElement("span"); number.className="number";
        number.textContent=cellNumbers.get(cellKey); cell.appendChild(number);
      }
      const input=document.createElement("input"); input.type="text"; input.maxLength=1;
      input.autocomplete="off"; input.spellcheck=false;
      input.setAttribute("aria-label",`Linha ${row+1}, coluna ${col+1}`);
      input.dataset.row=row; input.dataset.col=col;
      input.addEventListener("input",handleInput); input.addEventListener("keydown",handleKeydown);
      cell.appendChild(input); cellInputs.set(cellKey,input);
    }
    boardEl.appendChild(cell);
  }
}
function buildClues(direction,target){
  GAME.entries.filter(e=>e.dir===direction).forEach(entry=>{
    const li=document.createElement("li"); li.className="clue-item"; li.tabIndex=0;
    const number=document.createElement("span"); number.className="clue-number"; number.textContent=entry.number+".";
    const clue=document.createElement("span"); clue.className="clue-text"; clue.textContent=entry.clue;
    const status=document.createElement("span"); status.className="clue-status";
    li.append(number,clue,status);
    const focusWord=()=>focusEntry(entry);
    li.addEventListener("click",focusWord);
    li.addEventListener("keydown",event=>{if(event.key==="Enter"||event.key===" "){event.preventDefault();focusWord();}});
    target.appendChild(li); clueElements.set(entry.word,{element:li,status});
  });
}
function focusEntry(entry){const input=cellInputs.get(key(entry.row,entry.col));if(input)input.focus();}
function handleInput(event){
  const input=event.target; input.value=input.value.replace(/[^a-zA-Z]/g,"").slice(-1).toUpperCase();
  const row=Number(input.dataset.row),col=Number(input.dataset.col);
  const entry=GAME.entries.find(e=>e.dir==="across"?(e.row===row&&e.col<=col&&col<e.col+e.len):(e.col===col&&e.row<=row&&row<e.row+e.len));
  if(input.value&&entry){const next=cellInputs.get(key(row+(entry.dir==="down"?1:0),col+(entry.dir==="across"?1:0)));if(next)next.focus();}
  clearMarks();
}
function handleKeydown(event){
  const row=Number(event.target.dataset.row),col=Number(event.target.dataset.col);
  const moves={ArrowUp:[-1,0],ArrowDown:[1,0],ArrowLeft:[0,-1],ArrowRight:[0,1]};
  if(moves[event.key]){event.preventDefault();const [dr,dc]=moves[event.key];const next=cellInputs.get(key(row+dr,col+dc));if(next)next.focus();}
  else if(event.key==="Backspace"&&!event.target.value){const prev=cellInputs.get(key(row,col-1))||cellInputs.get(key(row-1,col));if(prev)prev.focus();}
}
function clearMarks(){
  document.querySelectorAll(".cell").forEach(cell=>cell.classList.remove("correct","wrong"));
  document.querySelectorAll(".clue-item").forEach(item=>item.classList.remove("correct-clue","wrong-clue"));
  clueElements.forEach(item=>item.status.textContent="");
}
function checkAnswers(){
  clearMarks();let correctCount=0;
  GAME.entries.forEach(entry=>{
    let answer="";const inputs=[];
    for(let i=0;i<entry.len;i++){
      const row=entry.row+(entry.dir==="down"?i:0),col=entry.col+(entry.dir==="across"?i:0);
      const input=cellInputs.get(key(row,col));inputs.push(input);answer+=input.value.toUpperCase();
    }
    const isCorrect=answer===entry.word;if(isCorrect)correctCount++;
    const clue=clueElements.get(entry.word);
    clue.element.classList.add(isCorrect?"correct-clue":"wrong-clue");
    clue.status.textContent=isCorrect?"CORRETA":(answer.trim()?"INCORRETA":"EM BRANCO");
    inputs.forEach(input=>{
      const expected=solution.get(key(Number(input.dataset.row),Number(input.dataset.col)));
      const letterCorrect=input.value.toUpperCase()===expected;
      input.parentElement.classList.toggle("correct",letterCorrect);
      input.parentElement.classList.toggle("wrong",!letterCorrect&&input.value!=="");
    });
  });
  scoreEl.textContent=`${correctCount} de ${GAME.entries.length} palavras`;
  progressEl.style.width=`${correctCount/GAME.entries.length*100}%`;
  feedbackEl.textContent=correctCount===GAME.entries.length?"Parabéns! Você completou toda a cruzadinha!":`Você acertou ${correctCount} de ${GAME.entries.length} palavras. Revise as pistas destacadas e tente novamente.`;
}
function resetGame(){
  cellInputs.forEach(input=>input.value="");clearMarks();
  scoreEl.textContent=`0 de ${GAME.entries.length} palavras`;progressEl.style.width="0%";
  feedbackEl.textContent="Tabuleiro reiniciado. Boa sorte!";
  const first=cellInputs.values().next().value;if(first)first.focus();
}
document.getElementById("checkBtn").addEventListener("click",checkAnswers);
document.getElementById("resetBtn").addEventListener("click",resetGame);
buildBoard();buildClues("across",acrossEl);buildClues("down",downEl);
scoreEl.textContent=`0 de ${GAME.entries.length} palavras`;
