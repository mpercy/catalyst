
// Constants.
var TEXT = 't';
var TIME_CREATED = 'c';
var TIME_FINISHED = 'f';
var IS_DONE = 'd';
var ACTIVE_TODOS = 'active_todos';

var g_current_time_str = "";

function updateTime() {
  var d = new Date();
  var time = d.getHours() + ":" + d.getMinutes();
  if (time != g_current_time_str) {
    g_current_time_str = time;
    $("#time").text(g_current_time_str);
  }
  setTimeout(updateTime, 1000);
}
function toggleTodoList(e) {
  e.preventDefault();
  var list = $("#todo_list");
  if (list.css("display") == "none") {
    list.css("display", "block");
  } else {
    list.css("display", "none");
  }
}

function renderTodoList(todoList) {
  var content = '';
  for (var i = 0; i < todoList.length; i++) {
    var todo = todoList[i];
    var id = "todo_item_" + i;
    content += '<li class="' + (todo[IS_DONE] ? 'done' : '') + '">' +
               '<img src="delete96.svg">' +
               '<input type="checkbox" id="' + id + '"' +
               (todo[IS_DONE] ? ' checked' : '') + '>' +
               '<label for="' + id + '">' + todo[TEXT] + '</label>' +
               '</li>' + "\n";
  }
  $("#todo_list h3").text(todoList.length + ' to do');
  $("#todo_list ul").html(content);
}

function initTodoList() {
  var activeTodos = [];
  var activeTodosEnc = localStorage.getItem(ACTIVE_TODOS);
  if (activeTodosEnc !== null) {
    activeTodos = JSON.parse(activeTodosEnc);
  } else {
    // Init empty list.
    localStorage.setItem(ACTIVE_TODOS, JSON.stringify(activeTodos));
  }
  renderTodoList(activeTodos);
}

function appendTodoToList(text) {
  var todo = {};
  todo[TEXT] = text;
  todo[TIME_CREATED] = new Date().getTime();
  todo[TIME_FINISHED] = 0;
  todo[IS_DONE] = false;

  var todoList = JSON.parse(localStorage.getItem(ACTIVE_TODOS));
  todoList.push(todo);
  localStorage.setItem(ACTIVE_TODOS, JSON.stringify(todoList));
  renderTodoList(todoList);
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
  updateTime();
  initTodoList();
  $("#todo_toggle").click(toggleTodoList);
  $("#new_todo").keydown(handleEnterInTodoBox);
});
