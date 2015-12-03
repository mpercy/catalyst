
// Constants.

// We use single characters as keys in the todo list hash to minimize JSON
// serialization overhead in localStorage.
var TEXT = 't';
var TIME_CREATED = 'c';
var TIME_FINISHED = 'f';
var IS_DONE = 'd';

var ACTIVE_TODOS = 'active_todos';

// Globals.
var g_current_greeting_str = "";
var g_current_time_str = "";

function updateGreeting(hour) {
  var greetingStr = '';
  if (hour >= 0 && hour < 12) {
    greetingStr = "morning";
  } else if (hour >= 12 && hour < 18) {
    greetingStr = "afternoon";
  } else {
    greetingStr = "evening";
  }
  if (greetingStr != g_current_greeting_str) {
    g_current_greeting_str = greetingStr;
    $("#greeting").text("Good " + g_current_greeting_str);
  }
}

function updateTime() {
  var d = new Date();
  var hour = d.getHours();
  updateGreeting(hour);
  var minute = ("0" + d.getMinutes()).slice(-2); // No sprintf() in JS.
  var timeStr = hour + ":" + minute;
  if (timeStr != g_current_time_str) {
    g_current_time_str = timeStr;
    $("#time").text(g_current_time_str);
  }
  setTimeout(updateTime, 5000);
}

var OP_FINISHED = 1;
var OP_REOPENED = 2;
var OP_DELETED = 3;
var OP_EDITED = 4;

function updateTodoListItem(index, op, newText) {
  var todoList = JSON.parse(localStorage.getItem(ACTIVE_TODOS));
  switch (op) {
    case OP_FINISHED:
      todoList[index][IS_DONE] = true;
      todoList[index][TIME_FINISHED] = new Date().getTime();
      break;
    case OP_REOPENED:
      todoList[index][IS_DONE] = false;
      break;
    case OP_DELETED:
      todoList.splice(index, 1);
      break;
    case OP_EDITED:
      todoList[index][TEXT] = newText;
      break;
    default:
      console.log("Script error", index, op);
      break;
  }
  localStorage.setItem(ACTIVE_TODOS, JSON.stringify(todoList));
  renderLists(todoList);
}

function indexFromId(id) {
  return parseInt(id.substr(10));
}

function handleTodoToggleFinished(e) {
  var index = indexFromId(this.id);
  var op = this.checked ? OP_FINISHED : OP_REOPENED;
  updateTodoListItem(index, op);
}

function handleTodoDeleted(e) {
  var id = $(this).siblings("input[type='checkbox']").attr("id");
  var index = indexFromId(id);
  updateTodoListItem(index, OP_DELETED);
}

var INCLUDE_DONE_ONLY = 1;
var INCLUDE_ALL = 2;

var months = [
  "Jan", "Feb", "Mar",
  "Apr", "May", "Jun",
  "Jul", "Aug", "Sep",
  "Oct", "Nov", "Dec"
];

// Displays tasks from todoList inside the given HTML container element
// with the specified done criteria, and if doneCriteria == INCLUDE_DONE_ONLY,
// with time completed >= earliestCompletedTime.
// Returns number of items in the list that are not yet completed.
function displayTasks(container, todoList, doneCriteria, earliestCompletedTime) {
  var content = '';
  var numTodo = 0;
  for (var i = 0; i < todoList.length; i++) {
    var todo = todoList[i];
    if (todo[IS_DONE] && todo[TIME_FINISHED] < earliestCompletedTime) {
      continue;
    } else if (!todo[IS_DONE]) {
      numTodo++;
      if (doneCriteria == INCLUDE_DONE_ONLY) {
        continue;
      }
    }
    var id = "todo_item_" + i;
    var finDate = new Date(todo[TIME_FINISHED]);
    var finDateStr = months[finDate.getMonth()] + " " + finDate.getDate();
    content += '<li class="' + (todo[IS_DONE] ? 'done' : '') + '">' +
               '<img src="delete96.svg">' +
               '<span class="date">' + finDateStr + '</span>' +
               '<input type="checkbox" id="' + id + '"' +
               (todo[IS_DONE] ? ' checked' : '') + '>' +
               '<label>' + todo[TEXT] + '</label>' +
               '<input type="text" />' +
               '</li>' + "\n";
  }
  container.find("ul.tasks").html(content);
  container.find("ul.tasks li input[type='checkbox']").click(handleTodoToggleFinished);
  container.find("ul.tasks li label").dblclick(startTodoEdit);
  container.find("ul.tasks li input[type='text']").keydown(finishTodoEdit);
  container.find("ul.tasks li img").click(handleTodoDeleted);
  return numTodo;
}

function startTodoEdit(e) {
  e.preventDefault();
  e.stopPropagation();
  var label = $(this);
  var inputbox = label.siblings("input[type='text']");
  var checkbox = label.siblings("input[type='checkbox']");
  $(document).bind("click.editing", function(e) {
    saveTodoEdit(inputbox);
  });
  inputbox.bind("click.editing", function(e) {
    e.stopPropagation();
  });
  inputbox.width(label.width() - 10);
  //inputbox.height(label.height());
  inputbox.val(label.text());
  checkbox.css("display", "none");
  label.css("display", "none");
  inputbox.css("display", "block");
  inputbox.focus();
  inputbox.get(0).setSelectionRange(0,0);
}

function unbindEvents(inputbox) {
  $(document).unbind("click.editing");
  inputbox.unbind("click.editing");
}

function cancelTodoEdit(inputbox) {
  unbindEvents(inputbox);
  var label = inputbox.siblings("label");
  var checkbox = inputbox.siblings("input[type='checkbox']");
  checkbox.css("display", "block");
  label.css("display", "block");
  inputbox.css("display", "none");
  inputbox.val("");
}

function saveTodoEdit(inputbox) {
  unbindEvents(inputbox);
  var checkbox = inputbox.siblings("input[type='checkbox']");
  var index = indexFromId(checkbox.attr("id"));
  var val = inputbox.val();
  if (val === "") {
    updateTodoListItem(index, OP_DELETED); // Delete if empty.
  } else {
    updateTodoListItem(index, OP_EDITED, val); // Edit otherwise.
  }
}

function finishTodoEdit(e) {
  if (e.which == 27) { // Esc
    cancelTodoEdit($(this));
  } else if (e.which == 13) { // Enter
    saveTodoEdit($(this));
  }
}

function renderTodoList(todoList) {
  var container = $("#todo_list");
  var oneDayAgo = new Date().getTime() - (24 * 60 * 60 * 1000);
  var numTodo = displayTasks(container, todoList, INCLUDE_ALL, oneDayAgo);
  container.children("h3").text(numTodo + ' to do');
}

function renderCompletedList(todoList) {
  var container = $("#completed_list");
  var numTodo = displayTasks(container, todoList, INCLUDE_DONE_ONLY, 0);
  var numCompleted = todoList.length - numTodo;
  container.children("h3").text(numCompleted + ' completed');
}

function renderLists(todoList) {
  renderTodoList(todoList);
  renderCompletedList(todoList);
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
  renderLists(activeTodos);
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

function handleEnterInNewTodoBox(e) {
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

function togglePanel(e, panel) {
  e.preventDefault();
  if (panel.css("display") == "none") {
    panel.css("display", "block");
  } else {
    panel.css("display", "none");
  }
}

$(document).ready(function() {
  updateTime();
  initTodoList();
  $("#todo_toggle").click(function(e) {
    togglePanel(e, $("#todo_list"));
  });
  $("#completed_toggle").click(function(e) {
    togglePanel(e, $("#completed_cont"));
  });
  $("#new_todo").keydown(handleEnterInNewTodoBox);
});
