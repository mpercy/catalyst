// TODO: This should live in localStorage.
var TODO_LIST = [
  { text: 'Item 1', created: 0, finished: 0, isDone: true },
  { text: 'Item 2', created: 0, finished: 0, isDone: false },
  { text: 'Item 3', created: 0, finished: 0, isDone: false }
];

function toggleTodoList(e) {
  e.preventDefault();
  var list = $("#todo_list");
  if (list.css("display") == "none") {
    list.css("display", "block");
  } else {
    list.css("display", "none");
  }
}

function renderTodoList() {
  var content = '';
  for (var i = 0; i < TODO_LIST.length; i++) {
    var item = TODO_LIST[i];
    var id = "todo_item_" + i;
    content += '<li class="' + (item.isDone ? 'done' : '') + '">' +
               '<img src="delete96.svg">' +
               '<input type="checkbox" id="' + id + '"' +
               (item.isDone ? ' checked' : '') + '>' +
               '<label for="' + id + '">' + item.text + '</label>' +
               '</li>' + "\n";
  }
  $("#todo_list h3").text(TODO_LIST.length + ' to do');
  $("#todo_list ul").html(content);
}

function appendTodoToList(text) {
  TODO_LIST.push({text: text, created: new Date().getTime(), isDone: false });
  renderTodoList();
}

function handleEnterInTodoBox(e) {
  if (e.which != 13) return; // Only continue if Enter key.
  e.preventDefault();
  var input = $("#new_todo");
  var text = input.val();
  if (text != "") {
    appendTodoToList(text);
    input.val("");
    input.focus();
  }
}

$(document).ready(function() {
  renderTodoList();
  $("#todo_toggle").click(toggleTodoList);
  $("#new_todo").keydown(handleEnterInTodoBox);
});
