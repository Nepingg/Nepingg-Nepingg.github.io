class Todo{
  constructor(){
    this.tasks = [];
    this.term="";
    this.load();
  }
  draw(){
    const list = document.getElementById("lista");
    list.innerHTML = "";
    const self = this;

    const toDraw = this.getFilteredTasks();
    for(let i = 0; i < toDraw.length; i++){
      const task = toDraw[i];
      const originalIndex = this.tasks.indexOf(task);
      let textToDisplay = task.text;
      if (this.term.length >= 2) {
        const regex = new RegExp("(" + this.term + ")", "gi");
        textToDisplay = task.text.replace(regex, "<mark>$1</mark>");
      }

      const div = document.createElement("div");
      div.className = "task";
      const textSpan = document.createElement("span");
      textSpan.className = "task-text";
      //textSpan.textContent = this.tasks[originalIndex].text;
      textSpan.innerHTML = textToDisplay;
      const dateSpan = document.createElement("span");
      dateSpan.className = "task-date";
      dateSpan.textContent = this.tasks[originalIndex].date;
      const deleteButton = document.createElement("button");
      deleteButton.className = "delete";
      deleteButton.textContent = "❌";
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.className = "check";
      checkbox.checked = this.tasks[originalIndex].isChecked;
      checkbox.onchange = function () {
        self.tasks[originalIndex].isChecked = this.checked;
      }

      deleteButton.onclick = function () {
        self.delete(originalIndex);
      }
      textSpan.onclick = function() {
        self.edit(originalIndex, div);
      }
      dateSpan.onclick = function() {
        self.edit(originalIndex, div);
      }
      div.appendChild(checkbox);
      div.appendChild(textSpan);
      div.appendChild(dateSpan);
      div.appendChild(deleteButton);
      list.appendChild(div);
    }
  }
  delete(index){
    this.tasks.splice(index, 1);
    this.save();
    this.draw();
  }
  add(assignment, date){
    if (assignment.length < 3 || assignment.length > 255) {
      console.warn("assigment has to be from 3 to 255 characters long");
      return;
    }
    this.tasks.push({text:assignment, date:date,isChecked: false});
    this.save();
    this.draw();
  }
  clearTasks(){
    this.tasks = this.tasks.filter(function(task){
      return !task.isChecked;
    });
    this.save();
    this.draw();
  }
  editHelper(index, text, date){
    if(text.length >= 3 && text.length <= 255){
      this.tasks[index].text = text;
      this.tasks[index].date = date;
      this.save();
      this.draw();

    }
  }
  edit(index, taskElement){
    taskElement.innerHTML = "";
    const self = this;
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "check";
    checkbox.checked = this.tasks[index].isChecked;
    checkbox.disabled = true;
    const input = document.createElement("input");
    input.type = "text";
    input.value = this.tasks[index].text;
    const dateInput = document.createElement("input");
    dateInput.type = "date";
    dateInput.value = this.tasks[index].date;
    const deleteButton = document.createElement("button");
    deleteButton.className = "delete";
    deleteButton.textContent = "❌";
    deleteButton.disabled = true;
    const save = function() {
      self.editHelper(index, input.value, dateInput.value);
    };



    input.onblur = function(event){
      if (event.relatedTarget !== dateInput) {
        save();
      }
    }
    dateInput.onblur = function(event){
      if (event.relatedTarget !== input) {
        save();
      }
    }
    taskElement.appendChild(checkbox);
    taskElement.appendChild(input);
    taskElement.appendChild(dateInput);
    taskElement.appendChild(deleteButton);
    input.focus();
  }
  save(){
    localStorage.setItem("tasks", JSON.stringify(this.tasks));
  }
  load(){
    const localSave = localStorage.getItem("tasks");
    if(localSave){
      this.tasks = JSON.parse(localSave);
    }
  }
  getFilteredTasks(){
    if(this.term.length <2){
      return this.tasks;
    }
    const tl = this.term.toLowerCase().trim();
    return this.tasks.filter(function(task){
      return task.text.toLowerCase().indexOf(tl.toLowerCase()) !== -1;
    })
  }
}
const todoApp = new Todo();
document.todo = todoApp;
todoApp.draw();

function przekaz(){
  const text = document.getElementById("assignment").value;
  const date = document.getElementById("data").value;
  todoApp.add(text,date);
}
document.getElementById('data').valueAsDate = new Date();
function czysc(){
  document.todo.clearTasks();
}
function searchtext(){
  const wpisanyTekst = document.getElementById("searchtext").value;
  todoApp.term = wpisanyTekst;
  todoApp.draw();
}
