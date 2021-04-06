function show(elem) {
  elem.classList.remove("hidden");
}

function hide(elem) {
  elem.classList.add("hidden");
}

function elemSwitch(elemOld, elemNew) {
  hide(elemOld);
  show(elemNew);
  let form = document.querySelector(`#${elemNew.id} form`);
  form.reset();
}

var style = getComputedStyle(document.documentElement);
